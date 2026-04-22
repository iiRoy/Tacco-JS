'use strict';

var CometSystem = {};

CometSystem.RELEASE_VERSION = '0.8.9';
CometSystem.PROTOCOL_VERSION = '1.0';
CometSystem.IDENTIFIER_SIZE = 160;
CometSystem.REMOTE_CALL_ID_PARAM = 'requestCallback';
CometSystem.COMMUNICATION_MODES = ['long-poll', 'cross-origin-long-poll', 'callback-poll', 'web-socket', 'event-source', 'in-process'];
CometSystem.ESSENTIAL_COMMUNICATION_MODES = ['long-poll', 'callback-poll', 'in-process'];

CometSystem.GLOBAL_SCOPE = (typeof globalThis !== 'undefined') ? globalThis : ((typeof window !== 'undefined') ? window : global);

CometSystem.combineProperties = function(targetObject, sourceObject, avoidOverwrite) {
  if (!sourceObject) return targetObject;
  Object.keys(sourceObject).forEach(function(propKey) {
    if (Object.prototype.hasOwnProperty.call(sourceObject, propKey)) {
      if (Object.prototype.hasOwnProperty.call(targetObject, propKey) && avoidOverwrite) return;
      if (targetObject[propKey] !== sourceObject[propKey]) {
        targetObject[propKey] = sourceObject[propKey];
      }
    }
  });
  return targetObject;
};

CometSystem.generateRandomString = function(bitCount) {
  bitCount = bitCount || CometSystem.IDENTIFIER_SIZE;
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const charLength = chars.length;
  let result = '';

  if (bitCount <= 32) {
    const maxVal = Math.pow(2, bitCount) - 1;
    let tempStr = Math.floor(Math.random() * maxVal).toString(charLength);
    while (tempStr.length < Math.ceil(bitCount / Math.log2(charLength))) {
      tempStr = '0' + tempStr;
    }
    return tempStr;
  }

  const byteCount = Math.ceil(bitCount / 8);
  const buffer = new Uint8Array(byteCount);
  let randomBytes;

  if (CometSystem.GLOBAL_SCOPE.crypto && CometSystem.GLOBAL_SCOPE.crypto.getRandomValues) {
    CometSystem.GLOBAL_SCOPE.crypto.getRandomValues(buffer);
    randomBytes = Array.from(buffer);
  } else {
    randomBytes = Array.from({ length: byteCount }, () => Math.floor(Math.random() * 256));
  }

  let num = BigInt(0);
  for (let i = 0; i < randomBytes.length; i++) {
    num = (num << BigInt(8)) | BigInt(randomBytes[i]);
  }

  result = num.toString(36);

  const minLength = Math.ceil(bitCount / Math.log2(36));
  while (result.length < minLength) {
    result = '0' + result;
  }
  return result;
};

CometSystem.extractSessionId = function(inputMessages) {
  if (!Array.isArray(inputMessages) || inputMessages.length === 0) return undefined;
  const primaryMessage = inputMessages[0];
  return primaryMessage && primaryMessage.sessionId;
};

CometSystem.deepDuplicate = function(originalItem) {
  if (originalItem === null || typeof originalItem !== 'object') {
    return originalItem;
  }

  const visited = new Map();

  function clone(current) {
    if (current === null || typeof current !== 'object') {
      return current;
    }
    if (visited.has(current)) {
      return visited.get(current);
    }

    let replicated;
    if (Array.isArray(current)) {
      replicated = [];
      visited.set(current, replicated);
      for (let i = 0; i < current.length; i++) {
        replicated[i] = clone(current[i]);
      }
    } else {
      replicated = {};
      visited.set(current, replicated);
      for (const prop in current) {
        if (Object.prototype.hasOwnProperty.call(current, prop)) {
          replicated[prop] = clone(current[prop]);
        }
      }
    }
    return replicated;
  }
  return clone(originalItem);
};

CometSystem.identifySharedItem = function(firstList, secondList) {
  if (!Array.isArray(firstList) || !Array.isArray(secondList)) return null;
  const secondSet = new Set(secondList);
  for (const item of firstList) {
    if (secondSet.has(item)) {
      return item;
    }
  }
  return null;
};

CometSystem.locateItemIndex = function(targetCollection, searchElement) {
  if (!Array.isArray(targetCollection)) return -1;
  return targetCollection.indexOf(searchElement);
};

CometSystem.transformCollection = function(dataStructure, processingFunction, executionContext) {
  if (Array.isArray(dataStructure)) {
    return dataStructure.map(processingFunction, executionContext);
  } else if (typeof dataStructure === 'object' && dataStructure !== null) {
    return Object.entries(dataStructure).map(([key, value]) =>
      processingFunction.call(executionContext || null, key, value)
    );
  }
  return [];
};

CometSystem.selectMatchingItems = function(dataArray, predicateFunction, executionContext) {
  if (!Array.isArray(dataArray)) return [];
  return dataArray.filter(predicateFunction, executionContext);
};

CometSystem.processItemsAsynchronously = async function(collectionToProcess, itemProcessor, completionCallback, contextRef) {
  if (!Array.isArray(collectionToProcess)) {
    if (completionCallback) completionCallback.call(contextRef);
    return;
  }

  const promises = collectionToProcess.map(item => {
    return new CometSystem.GLOBAL_SCOPE.Promise(resolve => {
      itemProcessor(item, resolve);
    });
  });

  await CometSystem.GLOBAL_SCOPE.Promise.all(promises);
  if (completionCallback) {
    completionCallback.call(contextRef);
  }
};

CometSystem.serializeObject = function(dataPacket) {
  return JSON.stringify(dataPacket);
};

CometSystem.consoleOutput = function(logMessage) {
  if (typeof console !== 'undefined') console.info(logMessage);
};

CometSystem.formatCurrentDateTime = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

CometSystem.SystemBlueprint = function(baseType, memberDefinitions) {
  if (typeof baseType !== 'function') {
    memberDefinitions = baseType;
    baseType = Object;
  }

  const NewClass = class extends baseType {
    constructor(...args) {
      super();
      if (this.initializeComponent) {
        this.initializeComponent(...args);
      }
    }
  };

  CometSystem.combineProperties(NewClass.prototype, memberDefinitions);

  return NewClass;
};

CometSystem.IdentifierRegistry = CometSystem.SystemBlueprint({
  initializeComponent: function() {
    this._allocatedIdentifiers = new CometSystem.GLOBAL_SCOPE.Set();
  },

  isAllocated: function(idValue) {
    return this._allocatedIdentifiers.has(idValue);
  },

  obtainIdentifier: function() {
    let newIdentifier = CometSystem.generateRandomString();
    while (this._allocatedIdentifiers.has(newIdentifier)) {
      newIdentifier = CometSystem.generateRandomString();
    }
    this._allocatedIdentifiers.add(newIdentifier);
    return newIdentifier;
  },

  freeIdentifier: function(idValue) {
    this._allocatedIdentifiers.delete(idValue);
  }
});

CometSystem.ProtocolIssue = class extends CometSystem.GLOBAL_SCOPE.Error {
  constructor(issueCode, issueParameters, issueDescription) {
    super(issueDescription);
    this.name = 'ProtocolIssue';
    this.issueCode = issueCode;
    this.issueParameters = CometSystem.GLOBAL_SCOPE.Array.from(issueParameters);
    this.issueDescription = issueDescription;
  }

  formatIssue() {
    return `${this.issueCode}:${this.issueParameters.join(',')}:${this.issueDescription}`;
  }

  static decodeIssue(encodedMessage) {
    encodedMessage = encodedMessage || '';
    if (!CometSystem.SyntaxRules || !CometSystem.SyntaxRules.ERROR_FORMAT || !CometSystem.SyntaxRules.ERROR_FORMAT.test(encodedMessage)) {
      return new CometSystem.ProtocolIssue(null, [], encodedMessage);
    }

    const parts = encodedMessage.split(':');
    const numericCode = CometSystem.GLOBAL_SCOPE.parseInt(parts[0], 10);
    const paramList = parts[1].split(',');
    const description = parts[2];

    return new CometSystem.ProtocolIssue(numericCode, paramList, description);
  }
};

CometSystem.ProtocolIssue.createVersionConflict = function() {
  return new CometSystem.ProtocolIssue(300, arguments, "Version discrepancy").formatIssue();
};
CometSystem.ProtocolIssue.createConnectionTypeConflict = function() {
  return new CometSystem.ProtocolIssue(301, arguments, "Unsupported connection types").formatIssue();
};
CometSystem.ProtocolIssue.createExtensionConflict = function() {
  return new CometSystem.ProtocolIssue(302, arguments, "Extension incompatibility").formatIssue();
};
CometSystem.ProtocolIssue.createMalformedRequest = function() {
  return new CometSystem.ProtocolIssue(400, arguments, "Invalid request format").formatIssue();
};
CometSystem.ProtocolIssue.createUnknownClient = function() {
  return new CometSystem.ProtocolIssue(401, arguments, "Client identifier unknown").formatIssue();
};
CometSystem.ProtocolIssue.createMissingParameter = function() {
  return new CometSystem.ProtocolIssue(402, arguments, "Required parameter absent").formatIssue();
};
CometSystem.ProtocolIssue.createForbiddenChannel = function() {
  return new CometSystem.ProtocolIssue(403, arguments, "Channel access denied").formatIssue();
};
CometSystem.ProtocolIssue.createUnknownChannel = function() {
  return new CometSystem.ProtocolIssue(404, arguments, "Channel identifier unknown").formatIssue();
};
CometSystem.ProtocolIssue.createInvalidChannel = function() {
  return new CometSystem.ProtocolIssue(405, arguments, "Channel identifier invalid").formatIssue();
};
CometSystem.ProtocolIssue.createUnknownExtension = function() {
  return new CometSystem.ProtocolIssue(406, arguments, "Extension identifier unknown").formatIssue();
};
CometSystem.ProtocolIssue.createPublicationFailure = function() {
  return new CometSystem.ProtocolIssue(407, arguments, "Message publication failed").formatIssue();
};
CometSystem.ProtocolIssue.createServiceError = function() {
  return new CometSystem.ProtocolIssue(500, arguments, "Internal service fault").formatIssue();
};

CometSystem.AwaitingOperation = {
  _promiseInstance: null,
  _promiseResolve: null,
  _promiseReject: null,
  _timeoutHandle: null,

  initializeDeferredState: function() {
    if (this._promiseInstance) return;
    this._promiseInstance = new CometSystem.GLOBAL_SCOPE.Promise((resolve, reject) => {
      this._promiseResolve = resolve;
      this._promiseReject = reject;
    });
  },

  onSuccessfulCompletion: function(completionCallback, executionContext) {
    this.initializeDeferredState();
    if (completionCallback) {
      this._promiseInstance.then(args => completionCallback.apply(executionContext, args));
    }
  },

  setOperationTimeout: function(durationSeconds, timeoutMessage) {
    this.initializeDeferredState();
    if (this._timeoutHandle) CometSystem.GLOBAL_SCOPE.clearTimeout(this._timeoutHandle);
    this._timeoutHandle = CometSystem.GLOBAL_SCOPE.setTimeout(() => {
      this.signalOperationOutcome('failed', timeoutMessage);
    }, durationSeconds * 1000);
  },

  onOperationFailure: function(failureCallback, executionContext) {
    this.initializeDeferredState();
    if (failureCallback) {
      this._promiseInstance.catch(args => failureCallback.apply(executionContext, args));
    }
  },

  signalOperationOutcome: function() {
    if (this._timeoutHandle) {
      CometSystem.GLOBAL_SCOPE.clearTimeout(this._timeoutHandle);
      this._timeoutHandle = null;
    }

    const args = CometSystem.GLOBAL_SCOPE.Array.from(arguments);
    const outcomeStatus = args.shift();
    const outcomeArgs = args;

    if (!this._promiseInstance) {
      this.initializeDeferredState();
    }

    if (outcomeStatus === 'succeeded') {
      if (this._promiseResolve) this._promiseResolve(outcomeArgs);
    } else if (outcomeStatus === 'failed') {
      if (this._promiseReject) this._promiseReject(outcomeArgs);
    }
    this._promiseResolve = null;
    this._promiseReject = null;
  }
};

CometSystem.EventDispatcher = {
  _eventObservers: null,

  getObserverCount: function(eventTypeKey) {
    if (!this._eventObservers || !this._eventObservers.has(eventTypeKey)) return 0;
    return this._eventObservers.get(eventTypeKey).length;
  },

  attachEvent: function(eventTypeKey, observerFunction, observerContext) {
    if (!this._eventObservers) this._eventObservers = new CometSystem.GLOBAL_SCOPE.Map();
    if (!this._eventObservers.has(eventTypeKey)) {
      this._eventObservers.set(eventTypeKey, []);
    }
    this._eventObservers.get(eventTypeKey).push([observerFunction, observerContext]);
  },

  detachEvent: function(eventTypeKey, observerFunction, observerContext) {
    if (!this._eventObservers || !this._eventObservers.has(eventTypeKey)) return;

    const observerList = this._eventObservers.get(eventTypeKey);

    if (!observerFunction) {
      this._eventObservers.delete(eventTypeKey);
      return;
    }

    const newObserverList = observerList.filter(entry => {
      const isFunctionMatch = (observerFunction !== entry[0]);
      const isContextMatch = (observerContext && observerContext !== entry[1]);
      return isFunctionMatch || isContextMatch;
    });

    if (newObserverList.length === observerList.length) return;
    if (newObserverList.length === 0) {
      this._eventObservers.delete(eventTypeKey);
    } else {
      this._eventObservers.set(eventTypeKey, newObserverList);
    }
  },

  emitSignal: function() {
    const args = CometSystem.GLOBAL_SCOPE.Array.from(arguments);
    const eventTypeKey = args.shift();

    if (!this._eventObservers || !this._eventObservers.has(eventTypeKey)) return;

    const currentObservers = CometSystem.GLOBAL_SCOPE.Array.from(this._eventObservers.get(eventTypeKey));

    for (const [observerFunc, observerCtx] of currentObservers) {
      observerFunc.apply(observerCtx, args);
    }
  }
};

CometSystem.ScheduledTasks = {
  _activeDelays: null,

  scheduleDelay: function(taskName, delaySeconds, taskCallback, taskContext) {
    if (!this._activeDelays) this._activeDelays = new CometSystem.GLOBAL_SCOPE.Map();
    if (this._activeDelays.has(taskName)) return;

    const self = this;
    const timeoutId = CometSystem.GLOBAL_SCOPE.setTimeout(() => {
      self._activeDelays.delete(taskName);
      taskCallback.call(taskContext);
    }, 1000 * delaySeconds);

    this._activeDelays.set(taskName, timeoutId);
  },

  cancelDelay: function(taskName) {
    if (!this._activeDelays) return;
    const timeoutId = this._activeDelays.get(taskName);
    if (!timeoutId) return;
    CometSystem.GLOBAL_SCOPE.clearTimeout(timeoutId);
    this._activeDelays.delete(taskName);
  }
};

CometSystem.DiagnosticOutput = (function() {
  const levelSeverity = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
  };
  let currentLevel = 'ERROR';

  function recordMessage(messageArguments, messageLevel) {
    if (!CometSystem.consoleOutput) return;

    if (levelSeverity[currentLevel] > levelSeverity[messageLevel]) return;

    const processedArgs = CometSystem.GLOBAL_SCOPE.Array.from(messageArguments);
    let bannerPrefix = ` [${messageLevel}] [CometSystem`;

    const mainMessage = processedArgs.shift().replace(/\?/g, function() {
      try {
        return CometSystem.serializeObject(processedArgs.shift());
      } catch (e) {
        return '[Object serialization error]';
      }
    });

    bannerPrefix += '] ';
    CometSystem.consoleOutput(CometSystem.formatCurrentDateTime() + bannerPrefix + mainMessage);
  }

  const handler = {
    get: function(target, prop, receiver) {
      if (prop === 'setLevel') {
        return function(level) {
          if (levelSeverity.hasOwnProperty(level.toUpperCase())) {
            currentLevel = level.toUpperCase();
          } else {
            console.warn(`Invalid log level: ${level}`);
          }
        };
      }
      if (prop === 'getSeverityMap') {
        return function() { return levelSeverity; };
      }
      if (levelSeverity.hasOwnProperty(prop.toUpperCase())) {
        return function() {
          recordMessage(arguments, prop.toUpperCase());
        };
      }
      return CometSystem.GLOBAL_SCOPE.Reflect.get(target, prop, receiver);
    }
  };

  return new CometSystem.GLOBAL_SCOPE.Proxy({}, handler);
})();

CometSystem.SyntaxRules = {
  charSets: {
    lowercaseLetter: /[a-z]/,
    uppercaseLetter: /[A-Z]/,
    digit: /[0-9]/,
    specialChar: /[\-_!~()$@]/
  },

  alphabetic: /^[a-zA-Z]$/,
  numeric: /^[0-9]$/,
  alphanumeric: /^[a-zA-Z0-9]$/,
  permittedMark: /^[\-_!~()$@]$/,

  textString: /^([a-zA-Z0-9\-_!~()$@ \/\*\.])+$/,
  tokenFormat: /^([a-zA-Z0-9\-_!~()$@])+$/,
  integerFormat: /^([0-9])+$/,

  channelPartIdentifier: /^([a-zA-Z0-9\-_!~()$@])+$/,
  channelPartsSequence: /^([a-zA-Z0-9\-_!~()$@])+(\/([a-zA-Z0-9\-_!~()$@])+)*$/,
  topicPathExpression: /^\/([a-zA-Z0-9\-_!~()$@])+(\/([a-zA-Z0-9\-_!~()$@])+)*$/,
  wildcardSpecifier: /^\*{1,2}$/,
  channelPatternExpression: /^(\/([a-zA-Z0-9\-_!~()$@])+)*\/\*{1,2}$/,

  versionComponent: /^([a-zA-Z0-9])([a-zA-Z0-9\-_])*$/,
  versionString: /^([0-9])+(\.([a-zA-Z0-9])([a-zA-Z0-9\-_])*)*$/,
  clientIdentifier: /^([a-zA-Z0-9])+$/,
  genericIdentifier: /^([a-zA-Z0-9])+$/,

  ERROR_FORMAT: /^(\d+):([^:]*):(.*)$/
};

if (typeof window !== 'undefined')
  window.CometSystem = CometSystem;
else if (typeof global !== 'undefined')
  global.CometSystem = CometSystem;