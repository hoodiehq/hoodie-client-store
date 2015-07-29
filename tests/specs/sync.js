var merge = require('lodash.merge')
var test = require('tape')

var Store = require('../../')
var options = process.browser ? {
  adapter: 'memory'
} : {
  db: require('memdown')
}

test('has "sync" methods', function (t) {
  t.plan(6)

  var store = new Store('test-db-sync', merge({remote: 'test-db-sync-remote'}, options))

  t.is(typeof store.pull, 'function', 'had "pull" method')
  t.is(typeof store.push, 'function', 'had "push" method')
  t.is(typeof store.sync, 'function', 'had "sync" method')
  t.is(typeof store.connect, 'function', 'had "connect" method')
  t.is(typeof store.disconnect, 'function', 'had "disconnect" method')
  t.is(typeof store.isConnected, 'function', 'had "isConnected" method')
})

test('store.on("push") for store.push()', function (t) {
  t.plan(2)

  var store = new Store('test-db-push', merge({remote: 'test-db-push-remote'}, options))
  var pushEvents = []

  store.on('push', pushEvents.push.bind(pushEvents))

  store.db.put({_id: 'test', foo: 'bar'})

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].foo, 'bar', 'event passes object')
  })
})

test('api.off("push")', function (t) {
  t.plan(2)

  var store = new Store('test-db-push-off', merge({remote: 'test-db-push-off-remote'}, options))
  var pushEvents = []

  store.on('push', pushHandler)
  function pushHandler (doc) {
    pushEvents.push(doc)
  }

  var obj1 = {_id: 'test1', foo1: 'bar1'}
  var obj2 = {_id: 'test2', foo1: 'bar2'}

  store.db.bulkDocs([obj1, obj2])

  .then(function () {
    return store.push('test2')
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')

    store.off('push', pushHandler)
    return store.push('test1')
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'push event was removed')
  })
})

test('api.one("push")', function (t) {
  t.plan(3)

  var store = new Store('test-db-push-one', merge({remote: 'test-db-push-one-remote'}, options))
  var pushEvents = []

  store.one('push', pushEvents.push.bind(pushEvents))

  var obj1 = {_id: 'test1', foo: 'bar1'}
  var obj2 = {_id: 'test2', foo: 'bar2'}

  store.db.bulkDocs([obj1, obj2])

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers 1 push event')
    t.is(pushEvents[0].foo, 'bar1', 'event passes object')
  })

  .then(function () {
    return store.push()
  })

  .then(function () {
    t.is(pushEvents.length, 1, 'triggers no second push event')
  })
})
