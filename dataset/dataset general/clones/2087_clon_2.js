var TemplateEngine = (function() {
// core/secure-text.js
var __moduleA__ = (function() {
  "use strict";
  var __outputA__;
  // Define our basic SecureText type
  function SecureText(content) {
    this.content = content;
  }

  SecureText.prototype.render = function() {
    return "" + this.content;
  };

  __outputA__ = SecureText;
  return __outputA__;
})();

// core/utilities.js
var __moduleB__ = (function(__dep1__) {
  "use strict";
  var __outputB__ = {};
  var SecureText = __dep1__;

  var checkIsArray = Array.isArray;

  var escapeHTMLMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var unsafeCharsRegex = /[&<>"'`]/g;
  var hasUnsafeCharsRegex = /[&<>"'`]/;

  function getEscapedChar(charToEscape) {
    return escapeHTMLMap[charToEscape] || "&amp;";
  }

  function mergeObjects(targetObj, sourceObj) {
    for(var propKey in sourceObj) {
      if(sourceObj.hasOwnProperty(propKey)) {
        targetObj[propKey] = sourceObj[propKey];
      }
    }
  }

  __outputB__.mergeObjects = mergeObjects;
  function sanitizeContent(inputString) {
    // don't sanitize SecureText instances, as they are already deemed safe
    if (inputString instanceof SecureText) {
      return inputString.render();
    } else if (!inputString && inputString !== 0) {
      return "";
    }

    // Coerce to string as the regex test will implicitly do so, which could cause issues
    // if an object's toString method returns escaped characters.
    inputString = "" + inputString;

    if(!hasUnsafeCharsRegex.test(inputString)) { return inputString; }
    return inputString.replace(unsafeCharsRegex, getEscapedChar);
  }

  __outputB__.sanitizeContent = sanitizeContent;
  function isValueEmpty(testValue) {
    if (!testValue && testValue !== 0) {
      return true;
    } else if (checkIsArray(testValue) && testValue.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __outputB__.isValueEmpty = isValueEmpty;
  return __outputB__;
})(__moduleA__);

// core/error-handler.js
var __moduleC__ = (function() {
  "use strict";
  var __outputC__;

  var errorProperties = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function ApplicationError(/* message */) {
    var tempError = Error.prototype.constructor.apply(this, arguments);

    // Errors are not enumerable in some environments, so we copy properties manually.
    for (var i = 0; i < errorProperties.length; i++) {
      this[errorProperties[i]] = tempError[errorProperties[i]];
    }
  }

  ApplicationError.prototype = new Error();

  __outputC__ = ApplicationError;
  return __outputC__;
})();

// core/engine-base.js
var __moduleD__ = (function(__dep1__, __dep2__) {
  "use strict";
  var __outputD__ = {};
  /*globals ApplicationError, Utilities */
  var Utilities = __dep1__;
  var ApplicationError = __dep2__;

  var CORE_VERSION = "1.1.0";
  __outputD__.CORE_VERSION = CORE_VERSION;
  var PARSER_REVISION = 4;
  __outputD__.PARSER_REVISION = PARSER_REVISION;
  var REVISION_VERSIONS = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 actually revision 2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '>= 1.0.0'
  };
  __outputD__.REVISION_VERSIONS = REVISION_VERSIONS;
  var objectToString = Object.prototype.toString,
      genericObjectType = '[object Object]';

  // Adapted from lodash library
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var checkIsFunction = function(val) {
    return typeof val === 'function';
  };
  // Fallback for older browsers like Chrome and Safari
  if (checkIsFunction(/x/)) {
    checkIsFunction = function(val) {
      return typeof val === 'function' && objectToString.call(val) === '[object Function]';
    };
  }

  function verifyIsArray(val) {
    return (val && typeof val === 'object') ? objectToString.call(val) === '[object Array]' : false;
  }

  function TemplateEnvironment(assistants, partialsStore) {
    this.assistants = assistants || {};
    this.partialsStore = partialsStore || {};

    setupDefaultAssistants(this);
  }

  __outputD__.TemplateEnvironment = TemplateEnvironment;
  TemplateEnvironment.prototype = {
    constructor: TemplateEnvironment,

    systemLogger: systemLogger,
    writeLog: writeLog,

    addAssistant: function(assistantName, assistantFunc, inverseFunc) {
      if (objectToString.call(assistantName) === genericObjectType) {
        if (inverseFunc || assistantFunc) { throw new ApplicationError('Argument not supported with multiple assistants'); }
        Utilities.mergeObjects(this.assistants, assistantName);
      } else {
        if (inverseFunc) { assistantFunc.not = inverseFunc; }
        this.assistants[assistantName] = assistantFunc;
      }
    },

    addPartial: function(partialName, partialContent) {
      if (objectToString.call(partialName) === genericObjectType) {
        Utilities.mergeObjects(this.partialsStore,  partialName);
      } else {
        this.partialsStore[partialName] = partialContent;
      }
    }
  };

  function setupDefaultAssistants(instanceRef) {
    instanceRef.addAssistant('missingAssistant', function(argument) {
      if(arguments.length === 2) {
        return undefined;
      } else {
        throw new Error("Missing assistant: '" + argument + "'");
      }
    });

    instanceRef.addAssistant('blockMissingAssistant', function(contextData, optionsObj) {
      var fallback = optionsObj.inverse || function() {}, mainFunction = optionsObj.fn;

      if (checkIsFunction(contextData)) { contextData = contextData.call(this); }

      if(contextData === true) {
        return mainFunction(this);
      } else if(contextData === false || contextData == null) {
        return fallback(this);
      } else if (verifyIsArray(contextData)) {
        if(contextData.length > 0) {
          return instanceRef.assistants.each(contextData, optionsObj);
        } else {
          return fallback(this);
        }
      } else {
        return mainFunction(contextData);
      }
    });

    instanceRef.addAssistant('each', function(collection, optionsObj) {
      var primaryFn = optionsObj.fn, secondaryFn = optionsObj.inverse;
      var counter = 0, outputString = "", itemData;

      if (checkIsFunction(collection)) { collection = collection.call(this); }

      if (optionsObj.data) {
        itemData = createDataObject(optionsObj.data);
      }

      if(collection && typeof collection === 'object') {
        if (verifyIsArray(collection)) {
          for(var length = collection.length; counter < length; counter++) {
            if (itemData) {
              itemData.index = counter;
              itemData.first = (counter === 0)
              itemData.last  = (counter === (collection.length-1));
            }
            outputString = outputString + primaryFn(collection[counter], { data: itemData });
          }
        } else {
          for(var property in collection) {
            if(collection.hasOwnProperty(property)) {
              if(itemData) { itemData.key = property; }
              outputString = outputString + primaryFn(collection[property], {data: itemData});
              counter++;
            }
          }
        }
      }

      if(counter === 0){
        outputString = secondaryFn(this);
      }

      return outputString;
    });

    instanceRef.addAssistant('if', function(condition, optionsObj) {
      if (checkIsFunction(condition)) { condition = condition.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condition as purely not empty based on the
      // behavior of isValueEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!optionsObj.hash.includeZero && !condition) || Utilities.isValueEmpty(condition)) {
        return optionsObj.inverse(this);
      } else {
        return optionsObj.fn(this);
      }
    });

    instanceRef.addAssistant('unless', function(condition, optionsObj) {
      return instanceRef.assistants['if'].call(this, condition, {fn: optionsObj.inverse, inverse: optionsObj.fn, hash: optionsObj.hash});
    });

    instanceRef.addAssistant('with', function(contextObj, optionsObj) {
      if (checkIsFunction(contextObj)) { contextObj = contextObj.call(this); }

      if (!Utilities.isValueEmpty(contextObj)) return optionsObj.fn(contextObj);
    });

    instanceRef.addAssistant('writeLog', function(contextObj, optionsObj) {
      var severity = optionsObj.data && optionsObj.data.level != null ? parseInt(optionsObj.data.level, 10) : 1;
      instanceRef.writeLog(severity, contextObj);
    });
  }

  var systemLogger = {
    severityMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // Severity enumeration
    DEBUG_LEVEL: 0,
    INFO_LEVEL: 1,
    WARNING_LEVEL: 2,
    ERROR_LEVEL: 3,
    currentSeverity: 3,

    // Can be overridden by the host environment
    logMessage: function(level, item) {
      if (systemLogger.currentSeverity <= level) {
        var method = systemLogger.severityMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, item);
        }
      }
    }
  };
  __outputD__.systemLogger = systemLogger;
  function writeLog(level, item) { systemLogger.logMessage(level, item); }

  __outputD__.writeLog = writeLog;
  var createDataObject = function(sourceObject) {
    var newObject = {};
    Utilities.mergeObjects(newObject, sourceObject);
    return newObject;
  };
  __outputD__.createDataObject = createDataObject;
  return __outputD__;
})(__moduleB__, __moduleC__);

// core/runtime-engine.js
var __moduleE__ = (function(__dep1__, __dep2__, __dep3__) {
  "use strict";
  var __outputE__ = {};
  /*global Utilities */
  var Utilities = __dep1__;
  var ApplicationError = __dep2__;
  var PARSER_REVISION = __dep3__.PARSER_REVISION;
  var REVISION_VERSIONS = __dep3__.REVISION_VERSIONS;

  function validateRevision(parserInfo) {
    var parserRevision = parserInfo && parserInfo[0] || 1,
        currentParserRevision = PARSER_REVISION;

    if (parserRevision !== currentParserRevision) {
      if (parserRevision < currentParserRevision) {
        var runtimeVersions = REVISION_VERSIONS[currentParserRevision],
            parserVersions = REVISION_VERSIONS[parserRevision];
        throw new Error("Template was precompiled with an older version of the template engine than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+parserVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Error("Template was precompiled with a newer version of the template engine than the current runtime. "+
              "Please update your runtime to a newer version ("+parserInfo[1]+").");
      }
    }
  }

  // TODO: Remove this line and split compilePartial

  function processTemplate(templateDefinition, runtimeEnv) {
    if (!runtimeEnv) {
      throw new Error("No environment provided to template processor");
    }

    var invokePartialWrapper;
    if (runtimeEnv.compile) {
      invokePartialWrapper = function(partialRef, partialName, contextData, assistants, partialsStore, dataObj) {
        // TODO : Check this for all inputs and the options handling (partial flag, etc). This feels
        // like there should be a common execution path
        var result = executePartial.apply(this, arguments);
        if (result) { return result; }

        var options = { assistants: assistants, partialsStore: partialsStore, data: dataObj };
        partialsStore[partialName] = runtimeEnv.compile(partialRef, { data: dataObj !== undefined }, runtimeEnv);
        return partialsStore[partialName](contextData, options);
      };
    } else {
      invokePartialWrapper = function(partialRef, partialName /* , contextData, assistants, partialsStore, dataObj */) {
        var result = executePartial.apply(this, arguments);
        if (result) { return result; }
        throw new ApplicationError("The partial " + partialName + " could not be compiled when running in runtime-only mode");
      };
    }

    // Initialize container
    var templateContainer = {
      sanitizeContent: Utilities.sanitizeContent,
      invokePartial: invokePartialWrapper,
      programs: [],
      program: function(index, func, data) {
        var programHandler = this.programs[index];
        if(data) {
          programHandler = createProgramHandler(index, func, data);
        } else if (!programHandler) {
          programHandler = this.programs[index] = createProgramHandler(index, func);
        }
        return programHandler;
      },
      merge: function(primary, secondary) {
        var mergedResult = primary || secondary;

        if (primary && secondary && (primary !== secondary)) {
          mergedResult = {};
          Utilities.mergeObjects(mergedResult, secondary);
          Utilities.mergeObjects(mergedResult, primary);
        }
        return mergedResult;
      },
      createProgramWithDepth: createProgramWithDepth,
      emptyFunction: emptyFunction,
      parserInfo: null
    };

    return function(context, options) {
      options = options || {};
      var scope = options.partial ? options : runtimeEnv,
          assistants,
          partialsStore;

      if (!options.partial) {
        assistants = options.assistants;
        partialsStore = options.partialsStore;
      }
      var finalResult = templateDefinition.call(
            templateContainer,
            scope, context,
            assistants,
            partialsStore,
            options.data);

      if (!options.partial) {
        validateRevision(templateContainer.parserInfo);
      }

      return finalResult;
    };
  }

  __outputE__.processTemplate = processTemplate;
  function createProgramWithDepth(index, func, data /*, $depth */) {
    var additionalArgs = Array.prototype.slice.call(arguments, 3);

    var depthProgram = function(context, options) {
      options = options || {};

      return func.apply(this, [context, options.data || data].concat(additionalArgs));
    };
    depthProgram.program = index;
    depthProgram.depth = additionalArgs.length;
    return depthProgram;
  }

  __outputE__.createProgramWithDepth = createProgramWithDepth;
  function createProgramHandler(index, func, data) {
    var standardProgram = function(context, options) {
      options = options || {};

      return func(context, options.data || data);
    };
    standardProgram.program = index;
    standardProgram.depth = 0;
    return standardProgram;
  }

  __outputE__.createProgramHandler = createProgramHandler;
  function executePartial(partialRef, partialName, contextData, assistants, partialsStore, dataObj) {
    var options = { partial: true, assistants: assistants, partialsStore: partialsStore, data: dataObj };

    if(partialRef === undefined) {
      throw new ApplicationError("The partial " + partialName + " could not be found");
    } else if(partialRef instanceof Function) {
      return partialRef(contextData, options);
    }
  }

  __outputE__.executePartial = executePartial;
  function emptyFunction() { return ""; }

  __outputE__.emptyFunction = emptyFunction;
  return __outputE__;
})(__moduleB__, __moduleC__, __moduleD__);

// templating-engine.runtime.js
var __moduleF__ = (function(__dep1__, __dep2__, __dep3__, __dep4__, __dep5__) {
  "use strict";
  var __outputF__;
  var engineBase = __dep1__;

  // Each of these augment the TemplateEngine object. No need to setup here.
  // (This is done to easily share code between commonjs and browse environments)
  var SecureText = __dep2__;
  var ApplicationError = __dep3__;
  var Utilities = __dep4__;
  var runtime = __dep5__;

  // For compatibility and usage outside of module systems, make the TemplateEngine object a namespace
  var initializeEngine = function() {
    var engineInstance = new engineBase.TemplateEnvironment();

    Utilities.mergeObjects(engineInstance, engineBase);
    engineInstance.SecureText = SecureText;
    engineInstance.ApplicationError = ApplicationError;
    engineInstance.Utilities = Utilities;

    engineInstance.VM = runtime;
    engineInstance.template = function(spec) {
      return runtime.processTemplate(spec, engineInstance);
    };

    return engineInstance;
  };

  var TemplateEngine = initializeEngine();
  TemplateEngine.initializeEngine = initializeEngine;

  __outputF__ = TemplateEngine;
  return __outputF__;
})(__moduleD__, __moduleA__, __moduleC__, __moduleB__, __moduleE__);

// core/compiler/abstract-syntax-tree.js
var __moduleG__ = (function(__dep1__) {
  "use strict";
  var __outputG__ = {};
  var ApplicationError = __dep1__;

  function ProgramNode(statementList, inverseStripConfig, inverseProgram) {
    this.type = "program";
    this.statementList = statementList;
    this.stripConfig = {};

    if(inverseProgram) {
      this.inverseProgram = new ProgramNode(inverseProgram, inverseStripConfig);
      this.stripConfig.right = inverseStripConfig.left;