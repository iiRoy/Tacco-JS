(function () {

  const initialConsoleReference = window.console;

  const styledMessageMethods = new Set(['dir', 'dirxml', 'error', 'info', 'log', 'warn']);

  const checkStylingCapability = () => {
    const userAgentString = navigator.userAgent.toLowerCase();
    return userAgentString.includes('firefox') || userAgentString.includes('chrome');
  };

  const environmentSupportsStyling = checkStylingCapability();

  const createLoggerEntity = (nativeConsoleTarget, entityIdentifier, configurationOptions) => {
    const currentEntityConfiguration = {
      activeStatus: true,
      foregroundTone: '#bada55',
      backgroundShade: '#111',
      ...configurationOptions
    };
    const historicalEntries = [];

    const handleAndRecordMessage = (messageArguments, messageKind) => {
      const momentOfEntry = new Date();
      let argumentsForNativeConsole = Array.from(messageArguments);
      let argumentsForHistory = Array.from(messageArguments);

      if (currentEntityConfiguration.activeStatus) {
        if (environmentSupportsStyling && entityIdentifier !== undefined && styledMessageMethods.has(messageKind)) {
          const styleIndicator = (messageKind !== 'dir') ? '%c ' : '';
          const styleDefinition = `color:${currentEntityConfiguration.foregroundTone}; background:${currentEntityConfiguration.backgroundShade}; font-weight:bold`;
          
          argumentsForNativeConsole.unshift(styleIndicator + entityIdentifier + ' ', styleDefinition);
          
          nativeConsoleTarget[messageKind](...argumentsForNativeConsole); 

          argumentsForHistory.unshift(styleDefinition);
        } else {
          nativeConsoleTarget[messageKind](...argumentsForNativeConsole);
        }
      }

      argumentsForHistory.push(momentOfEntry);

      historicalEntries.push(argumentsForHistory);
    };

    const entityPublicInterface = {
      assert: (...args) => handleAndRecordMessage(args, 'assert'),
      clear: (...args) => handleAndRecordMessage(args, 'clear'),
      count: (...args) => handleAndRecordMessage(args, 'count'),
      debug: (...args) => handleAndRecordMessage(args, 'debug'),
      dir: (...args) => handleAndRecordMessage(args, 'dir'),
      dirxml: (...args) => handleAndRecordMessage(args, 'dirxml'),
      error: (...args) => handleAndRecordMessage(args, 'error'),
      exception: (...args) => handleAndRecordMessage(args, 'exception'),
      group: (...args) => handleAndRecordMessage(args, 'group'),
      groupCollapsed: (...args) => handleAndRecordMessage(args, 'groupCollapsed'),
      groupEnd: (...args) => handleAndRecordMessage(args, 'groupEnd'),
      info: (...args) => handleAndRecordMessage(args, 'info'),
      log: (...args) => handleAndRecordMessage(args, 'log'),
      profile: (...args) => handleAndRecordMessage(args, 'profile'),
      profileEnd: (...args) => handleAndRecordMessage(args, 'profileEnd'),
      table: (...args) => handleAndRecordMessage(args, 'table'),
      time: (...args) => handleAndRecordMessage(args, 'time'),
      timeEnd: (...args) => handleAndRecordMessage(args, 'timeEnd'),
      timeStamp: (...args) => handleAndRecordMessage(args, 'timeStamp'),
      trace: (...args) => handleAndRecordMessage(args, 'trace'),
      warn: (...args) => handleAndRecordMessage(args, 'warn'),

      activateEntity: () => { currentEntityConfiguration.activeStatus = true; },
      deactivateEntity: () => { currentEntityConfiguration.activeStatus = false; },
      fetchHistory: () => historicalEntries,
      setPrimaryForegroundColor: (newTone) => { currentEntityConfiguration.foregroundTone = newTone; },
      setPrimaryBackgroundColor: (newShade) => { currentEntityConfiguration.backgroundShade = newShade; }
    };

    return entityPublicInterface;
  };

  const establishConsoleFacade = (originalConsoleHandle) => {
    const managedChildEntities = new Map();

    const primaryLoggerFacade = createLoggerEntity(originalConsoleHandle, undefined, {});

    primaryLoggerFacade.obtainChildStream = (streamName, streamOptions) => {
      let childStreamInstance = managedChildEntities.get(streamName);

      if (!childStreamInstance) {
        childStreamInstance = createLoggerEntity(originalConsoleHandle, streamName, streamOptions);
        managedChildEntities.set(streamName, childStreamInstance);
      }
      return childStreamInstance;
    };

    primaryLoggerFacade.enableOperations = (streamIdentifier) => {
      if (typeof streamIdentifier !== 'undefined') {
        const targetStream = managedChildEntities.get(streamIdentifier);
        if (targetStream) {
          targetStream.activateEntity();
        }
      } else {
        primaryLoggerFacade.activateEntity();
      }
    };

    primaryLoggerFacade.disableOperations = (streamIdentifier) => {
      if (typeof streamIdentifier !== 'undefined') {
        const targetStream = managedChildEntities.get(streamIdentifier);
        if (targetStream) {
          targetStream.deactivateEntity();
        }
      } else {
        primaryLoggerFacade.deactivateEntity();
      }
    };

    primaryLoggerFacade.updateForegroundColor = (newHue) => { primaryLoggerFacade.setPrimaryForegroundColor(newHue); };
    primaryLoggerFacade.updateBackgroundColor = (newShade) => { primaryLoggerFacade.setPrimaryBackgroundColor(newShade); };

    return primaryLoggerFacade;
  };

  window.console = establishConsoleFacade(initialConsoleReference);

})();