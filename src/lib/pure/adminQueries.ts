import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import { fetchAllPages } from './pagination'
import { buildTopScorers, scorerIds, type TopScorer } from './stats'
import type { Season } from './seasons'

export type Client = SupabaseClient<Database>

const MATCH_SELECT = 'id, date, kit, location, myPos, myTeam, rivalId, rivalPos, rivalTeam, schedule_override, scoreAway, scoreHome, seasonid, teamId, rival:rival(id, name), team:team(id, name), season:season(id, name), squad:MatchSquad(id, matchId, playerId, player:Player(id, name, dorsal, active, primary_position)), goals:Goal(id, matchId, kind, minute, playerId, player:Player(id, name))'
const PLAYER_SELECT = 'id, name, nickname, dorsal, active, foot, preferred_side, primary_position, secondary_positions, player_team(team_id, team:team(id, name))'
const ACTIVE_PLAYER_SELECT = 'id, name, dorsal, active, primary_position, player_team(team_id)'

export async function querySeasons(db: Client): Promise<Season[]> {
  return fetchAllPages(async (from, to) => await db.from('season')
    .select('id, name, startdate, enddate, active').order('startdate', { ascending: false }).order('id').range(from, to))
}

export async function queryTeams(db: Client) {
  const { data, error } = await db.from('team').select('id, slug, name, match_weekday, league_name, sort_order').order('sort_order').order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function queryKickoffSlots(db: Client) {
  const { data, error } = await db.from('kickoff_slot').select('time').order('time')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function queryClubSettings(db: Client) {
  const { data, error } = await db.from('club_settings').select('id, phone, clabe, account, bank, weekly_fee').eq('id', 1).single()
  if (error) throw new Error(error.message)
  return { ...data, weekly_fee: data.weekly_fee ?? 0 }
}

export async function queryPlayers(db: Client) {
  return fetchAllPages(async (from, to) => await db.from('Player').select(PLAYER_SELECT).order('dorsal').order('id').range(from, to))
}

export async function queryActivePlayers(db: Client) {
  return fetchAllPages(async (from, to) => await db.from('Player').select(ACTIVE_PLAYER_SELECT).eq('active', true).order('name').order('id').range(from, to))
}

export async function queryRivals(db: Client) {
  return fetchAllPages(async (from, to) => await db.from('rival').select('id, name, normalized_name, slug').order('name').order('id').range(from, to))
}

export async function queryMatches(db: Client, seasonId: string | null) {
  return fetchAllPages(async (from, to) => {
    let query = db.from('Match').select(MATCH_SELECT)
    if (seasonId) query = query.eq('seasonid', seasonId)
    return await query.order('date', { ascending: false }).order('id').range(from, to)
  })
}

export async function queryTopScorers(db: Client, seasonId: string | null): Promise<TopScorer[]> {
  const rows = await fetchAllPages(async (from, to) => {
    let query = db.from('v_player_stats').select('player_id, team_id, season_id, goals, call_ups')
    if (seasonId) query = query.eq('season_id', seasonId)
    return await query.order('player_id').order('team_id').order('season_id').range(from, to)
  })
  const ids = scorerIds(rows)
  if (!ids.length) return []
  const players: { id: string; name: string; dorsal: number; nickname: string | null }[] = []
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await db.from('Player').select('id, name, dorsal, nickname').in('id', ids.slice(i, i + 100))
    if (error) throw new Error(error.message)
    players.push(...(data ?? []))
  }
  return buildTopScorers(rows, players)
}

export async function queryPaymentMatrix(db: Client, seasonId: string | null) {
  const eventsPromise = fetchAllPages(async (from, to) => {
    let query = db.from('Event').select('id, name, cost, date, seasonid')
    if (seasonId) query = query.eq('seasonid', seasonId)
    return await query.order('date', { ascending: false }).order('id').range(from, to)
  })
  const playersPromise = fetchAllPages(async (from, to) =>
    await db.from('Player').select('id, name, dorsal, active').eq('active', true).order('name').order('id').range(from, to))
  const paymentsPromise = fetchAllPages(async (from, to) => {
    let query = db.from('Payment').select('id, eventId, playerId, paid, event:Event!inner(seasonid)')
    if (seasonId) query = query.eq('event.seasonid', seasonId)
    return await query.order('id').range(from, to)
  })
  const [events, players, payments] = await Promise.all([eventsPromise, playersPromise, paymentsPromise])
  const byPlayer = new Map<string, { id: string; eventId: string; playerId: string; paid: boolean }[]>()
  for (const { id, eventId, playerId, paid } of payments) {
    const list = byPlayer.get(playerId) ?? []
    list.push({ id, eventId, playerId, paid })
    byPlayer.set(playerId, list)
  }
  return { events, players: players.map(p => ({ ...p, payments: byPlayer.get(p.id) ?? [] })) }
}
