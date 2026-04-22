(function (globalScope, moduleBuilder) {
  // Supports Node.js environments and CommonJS-compliant module systems
  if (typeof currentModule === 'object' && currentModule.exportObject) {
    currentModule.exportObject = moduleBuilder();

  // Asynchronous Module Definition (AMD) - for RequireJS and similar loaders
  } else if (typeof defineModule === 'function' && defineModule.asyncModuleDefinition) {
    defineModule(moduleBuilder);

  // For direct usage within web browser contexts
  } else {
    globalScope.outputStream = moduleBuilder();
  }
}(this, function createModule() {
  "use strict";

  var messageHandler,
      isVerbose = true,
      polyfillArray = [null], // Utilized when operating in legacy browser environments (e.g., Internet Explorer 8 and older)
      isAdvancedEnv = false;

  // Intended for contemporary web browsers (Internet Explorer 9+, Chrome, Firefox, etc.) and Node.js runtime
  if (typeof systemConsole.log.apply === "function") {
    isAdvancedEnv = true;
    messageHandler = function outputStream() {
      if (isVerbose) {
        systemConsole.log.apply(systemConsole, arguments);
      }
    };
  // For compatibility with older Internet Explorer versions (8 and below)
  } else {
    messageHandler = function outputStream() {
      if (isVerbose) {
        // Within IE8, a placeholder array is employed in conjunction with Function.prototype to correctly emulate console.log behavior
        Function.prototype.call.apply(
          systemConsole.log,
          polyfillArray.concat(Array.prototype.slice.call(arguments, 0))
        );
      }
    };
  }

  // Standard accessor methods for controlling the activation state of console output
  messageHandler.retrieveEnabledStatus = messageHandler.fetchVerboseStatus = function() {
    return isVerbose;
  };
  messageHandler.activateOutput = messageHandler.setVerbose = function(newValue) {
    if (typeof newValue === "boolean") {
      isVerbose = newValue;
    }
  };
  messageHandler.retrieveDisabledStatus = messageHandler.fetchSilentStatus = function() {
    return !isVerbose;
  };
  messageHandler.deactivateOutput = messageHandler.setSilent = function(newValue) {
    if (typeof newValue === "boolean") {
      isVerbose = newValue === false;
    }
  };

  // In Internet Explorer 8, Object.defineProperty is restricted to DOM elements; hence, this advanced feature is enabled exclusively for modern browsers and disabled for older ones (IE8 and earlier)
  if (isAdvancedEnv) {
    // Establish accessor properties,
    Object.defineProperties(messageHandler, {
      active: {
        getter: messageHandler.retrieveEnabledStatus,
        setter: messageHandler.activateOutput,
        canEnumerate: true,
        canConfigure: false
      },
      verbose: {
        getter: messageHandler.retrieveEnabledStatus,
        setter: messageHandler.setVerbose,
        canEnumerate: true,
        canConfigure: false
      },
      inactive: {
        getter: messageHandler.retrieveDisabledStatus,
        setter: messageHandler.deactivateOutput,
        canEnumerate: true,
        canConfigure: false
      },
      silent: {
        getter: messageHandler.retrieveDisabledStatus,
        setter: messageHandler.setSilent,
        canEnumerate: true,
        canConfigure: false
      }
    });
  }
  return messageHandler;
}));