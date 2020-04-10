module.exports = prefixEventHandler

function prefixEventHandler (prefix, prefixState) {
  // only listen to events from parent if there is a handler
  prefixState.emitter.on('removeListener', function (type, handler) {
    updateListening(null, prefixState, prefixHandler)
  })
  prefixState.emitter.on('newListener', function (type, handler) {
    updateListening(type, prefixState, prefixHandler)
  })

  function prefixHandler (eventName, object) {
    if (object._id.substr(0, prefix.length) !== prefix) {
      return
    }

    prefixState.emitter.emit('change', eventName, object)
    prefixState.emitter.emit(eventName, object)
  }
}

function updateListening (eventName, prefixState, handler) {
  // newListener event will be emitted before the listener will be added!
  // But the removeListener event after the listener was removed!
  // That is why type === eventName is needed.
  var shouldListen = [
    'add',
    'update',
    'remove',
    'change'
  ].some(function (type) {
    var count = prefixState.emitter.listenerCount(type)
    return count > 0 || type === eventName
  })

  if (shouldListen === prefixState.isListening) return

  if (shouldListen) {
    prefixState.isListening = true
    prefixState.parentEmitter.on('change', handler)
  } else {
    prefixState.isListening = false
    prefixState.parentEmitter.removeListener('change', handler)
  }
}
