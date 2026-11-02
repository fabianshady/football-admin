import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const root = new URL('../', import.meta.url)

test('data readers stay server-only instead of becoming callable Server Actions', async () => {
  for (const file of await readdir(new URL('src/lib/data/', root))) {
    if (!file.endsWith('.ts')) continue
    const source = await readFile(new URL(`src/lib/data/${file}`, root), 'utf8')
    assert.match(source, /import ['"]server-only['"]/, file)
    assert.doesNotMatch(source, /['"]use server['"]/, file)
  }
  for (const file of await readdir(new URL('src/app/actions/', root))) {
    if (!file.endsWith('.ts')) continue
    const source = await readFile(new URL(`src/app/actions/${file}`, root), 'utf8')
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
    for (const statement of tree.statements) {
      if (!ts.isFunctionDeclaration(statement) || !statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue
      assert.doesNotMatch(statement.name?.text ?? '', /^(get|query|resolve)/, `${file} exports a reader as a Server Action`)
    }
  }
})

test('entry containers do not ship a motion runtime or hide content pending hydration', async () => {
  const source = await readFile(new URL('src/components/AnimatedContainer.tsx', root), 'utf8')
  assert.doesNotMatch(source, /['"]use client['"]|framer-motion|opacity:\s*0|useReducedMotion/)
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  assert.equal(manifest.dependencies['framer-motion'], undefined)
})
