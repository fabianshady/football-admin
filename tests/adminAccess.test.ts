import assert from 'node:assert/strict'
import test from 'node:test'
import { AdminAccessError, assertAdminRole, assertAuthenticated } from '../src/lib/adminIdentity'

test('only validated users with strict true admin role are accepted', () => {
  assert.doesNotThrow(() => { assertAuthenticated({ id: 'user' }, false); assertAdminRole(true) })
  for (const role of [false, null, undefined, 'true', 1, {}]) {
    assert.throws(() => assertAdminRole(role), AdminAccessError)
  }
  assert.throws(() => assertAuthenticated(null, false), AdminAccessError)
  assert.throws(() => assertAuthenticated({ id: 'user' }, true), AdminAccessError)
})

test('access-denial errors can be distinguished from transient infrastructure failures', () => {
  assert.notEqual(new Error('Role service unavailable') instanceof AdminAccessError, true)
  assert.equal(new AdminAccessError('Forbidden').name, 'AdminAccessError')
})
