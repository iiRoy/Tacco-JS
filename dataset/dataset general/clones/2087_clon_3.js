let HBScript = (function() {
// core/secure-text.js
let mod_secureText = (function() {
  "use strict";
  let _publicExports; // Renamed __exports__
  // Represents a string that is already safe for output.
  function SecureText(contentString) { // Renamed SafeString, string
    if (typeof contentString !== 'string') {
        // Ensure content is always a string, even if null/undefined is passed.
        contentString = String(contentString || '');
    }
    this.textValue = contentString; // Renamed string property
  }

  SecureText.prototype.display = function() { // Renamed toString, prototype.toString
    return "" + this.textValue; // Access renamed property
  };

  _publicExports = SecureText;
  return _publicExports;
})();

// core/utilities.js
let mod_util = (function(dep_secureText) { // Renamed __module3__, __dependency1__
  "use strict";
  let utilityExports = {}; // Renamed __exports__
  const SecureText = dep_secureText; // Renamed SafeString

  const isListChecker = Array.isArray; // Renamed isArray

  const charEscapeMap = { // Renamed escape
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  const dangerousCharRegex = /[&<>"'`]/g; // Renamed badChars
  const potentialDangerRegex = /[&<>"'`]/; // Renamed possible

  /**
   * Retrieves the HTML entity for a given character.
   * @param {string} character - The character to escape.
   * @returns {string} The HTML entity or '&amp;' if not found.
   */
  function retrieveEscapedChar(character) { // Renamed escapeChar
    return charEscapeMap[character] || "&amp;"; // Access renamed map
  }

  /**
   * Merges properties from a source object into a target object.
   * @param {object} targetObj - The object to extend.
   * @param {object} sourceObj - The object whose properties will be copied.
   */
  function mergeProperties(targetObj, sourceObj) { // Renamed extend
    if (!targetObj || typeof targetObj !== 'object' || !sourceObj || typeof sourceObj !== 'object') {
      // Basic validation for inputs
      return;
    }
    for(let propKey in sourceObj) { // Renamed key
      if(Object.prototype.hasOwnProperty.call(sourceObj, propKey)) { // Changed hasOwnProperty call
        targetObj[propKey] = sourceObj[propKey];
      }
    }
  }

  utilityExports.mergeProperties = mergeProperties;

  /**
   * Sanitizes a string for HTML output by escaping dangerous characters.
   * @param {*} inputVal - The value to sanitize.
   * @returns {string} The sanitized string.
   */
  function sanitizeForHtml(inputVal) { // Renamed escapeExpression
    // Do not escape SecureText instances, they are already marked safe.
    if (inputVal instanceof SecureText) {
      return inputVal.display(); // Call renamed method
    }

    // Handle null, undefined, false gracefully.
    if (!inputVal && inputVal !== 0) {
      return "";
    }

    // Coerce to string explicitly.
    let processedString = String(inputVal); // Renamed string, added intermediate variable

    // Check if any potentially dangerous characters exist before replacement.
    if(!potentialDangerRegex.test(processedString)) { return processedString; }

    return processedString.replace(dangerousCharRegex, retrieveEscapedChar); // Use renamed regex and function
  }

  utilityExports.sanitizeForHtml = sanitizeForHtml;

  /**
   * Checks if a given value is considered empty.
   * @param {*} valueToTest - The value to check.
   * @returns {boolean} True if the value is empty, false otherwise.
   */
  function isValueEmpty(valueToTest) { // Renamed isEmpty
    if (!valueToTest && valueToTest !== 0) { // Handles null, undefined, false, empty string
      return true;
    } else if (isListChecker(valueToTest) && valueToTest.length === 0) { // Checks for empty arrays
      return true;
    } else if (typeof valueToTest === 'object' && Object.keys(valueToTest).length === 0) { // Added check for empty objects
        return true;
    }
    return false; // Default return for non-empty values
  }

  utilityExports.isValueEmpty = isValueEmpty;
  return utilityExports;
}) (mod_secureText); // Pass renamed dependency

// core/template-error.js
let mod_error = (function() { // Renamed __module5__
  "use strict";
  let errorExports; // Renamed __exports__

  const exceptionProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack']; // Renamed errorProps

  /**
   * Custom error class for template-related issues.
   * @param {string} msg - The error message.
   */
  function TemplateError(msg) { // Renamed Exception
    // Call the base Error constructor.
    let baseError = Error.prototype.constructor.apply(this, arguments); // Renamed tmp

    // Copy properties from the base error object, as they might not be enumerable.
    for (let i = 0; i < exceptionProps.length; i++) { // Renamed idx
      let currentProp = exceptionProps[i]; // Added intermediate variable
      if (baseError[currentProp]) { // Only copy if it exists on the base error
        this[currentProp] = baseError[currentProp];
      }
    }
    this.name = this.name || 'TemplateError'; // Ensure name is set
    this.message = msg || 'An unknown template error occurred.'; // Ensure message is set
  }

  // Inherit from Error.
  TemplateError.prototype = Object.create(Error.prototype); // Cleaner inheritance
  TemplateError.prototype.constructor = TemplateError;

  errorExports = TemplateError;
  return errorExports;
})();

// core/engine-base.js
let mod_engineBase = (function(dep_util, dep_error) { // Renamed __module2__, __dependency1__, __dependency2__
  "use strict";
  let engineBaseExports = {}; // Renamed __exports__
  // /*globals Exception, Utils */ // Removed original comment
  const UtilityFunctions = dep_util; // Renamed Utils
  const CustomException = dep_error; // Renamed Exception

  const ENGINE_VERSION = "1.1.0"; // Renamed VERSION
  engineBaseExports.ENGINE_VERSION = ENGINE_VERSION;

  const COMPILER_SPEC_REVISION = 4; // Renamed COMPILER_REVISION
  engineBaseExports.COMPILER_SPEC_REVISION = COMPILER_SPEC_REVISION;

  const REVISION_COMPATIBILITY = { // Renamed REVISION_CHANGES
    1: '<= 1.0.rc.2',
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '>= 1.0.0'
  };
  engineBaseExports.REVISION_COMPATIBILITY = REVISION_COMPATIBILITY;

  const objToString = Object.prototype.toString; // Renamed toString
  const objTypeString = '[object Object]'; // Renamed objectType

  // Helper to determine if a value is a function.
  let isCallable = function(val) { // Renamed isFunction
    return typeof val === 'function';
  };

  // Fallback for older browsers where `typeof /x/` might be 'function'.
  if (isCallable(/x/)) {
    isCallable = function(val) {
      return typeof val === 'function' && objToString.call(val) === '[object Function]';
    };
  }

  /**
   * Checks if a value is an array.
   * @param {*} val - The value to check.
   * @returns {boolean} True if it's an array, false otherwise.
   */
  function isList(val) { // Renamed isArray
    return (val && typeof val === 'object') ? objToString.call(val) === '[object Array]' : false;
  }

  /**
   * Core environment for the templating engine.
   * @param {object} initialHelpers - Initial helper functions.
   * @param {object} initialPartials - Initial partial templates.
   */
  function TemplateEngineCore(initialHelpers, initialPartials) { // Renamed HandlebarsEnvironment
    this.registeredHelpers = initialHelpers || {}; // Renamed helpers
    this.registeredPartials = initialPartials || {}; // Renamed partials

    this.registerDefaultSystemHelpers(); // Renamed registerDefaultHelpers call
  }

  engineBaseExports.TemplateEngineCore = TemplateEngineCore;

  TemplateEngineCore.prototype = {
    constructor: TemplateEngineCore,

    messageLogger: systemLogger, // Renamed logger
    logMessage: systemLog, // Renamed log

    /**
     * Registers one or more helper functions.
     * @param {string|object} helperName - The name of the helper or an object of helpers.
     * @param {function} helperFn - The helper function.
     * @param {boolean} [isInverse=false] - If true, registers as an inverse helper.
     */
    registerHelper: function(helperName, helperFn, isInverse) { // Renamed name, fn, inverse
      if (typeof helperName !== 'string' && objToString.call(helperName) === objTypeString) {
        if (isInverse || helperFn) {
            this.messageLogger.error('Cannot register multiple helpers with inverse/function arguments.'); // Changed Exception to messageLogger.error
            throw new CustomException('Arg not supported with multiple helpers'); // Renamed Exception
        }
        UtilityFunctions.mergeProperties(this.registeredHelpers, helperName); // Use renamed utility
      } else if (typeof helperName === 'string') {
        if (isInverse) { helperFn.not = isInverse; } // Attach inverse property
        if (this.registeredHelpers[helperName]) {
            this.messageLogger.warn(`Overwriting existing helper: '${helperName}'`); // Added warning
        }
        this.registeredHelpers[helperName] = helperFn;
      } else {
          this.messageLogger.error('Invalid helper name or object provided.');
          throw new CustomException('Invalid helper registration arguments.');
      }
    },

    /**
     * Registers one or more partial templates.
     * @param {string|object} partialKey - The name of the partial or an object of partials.
     * @param {string} partialContent - The partial content string.
     */
    registerPartial: function(partialKey, partialContent) { // Renamed name, str
      if (typeof partialKey !== 'string' && objToString.call(partialKey) === objTypeString) {
        UtilityFunctions.mergeProperties(this.registeredPartials,  partialKey); // Use renamed utility
      } else if (typeof partialKey === 'string') {
        if (this.registeredPartials[partialKey]) {
            this.messageLogger.warn(`Overwriting existing partial: '${partialKey}'`); // Added warning
        }
        this.registeredPartials[partialKey] = partialContent;
      } else {
          this.messageLogger.error('Invalid partial key or object provided.');
          throw new CustomException('Invalid partial registration arguments.');
      }
    },

    /**
     * Registers the default set of helpers for the engine instance.
     */
    registerDefaultSystemHelpers: function() { // Renamed registerDefaultHelpers
        const engineInstance = this; // Capture 'this' for helper functions

        engineInstance.registerHelper('missingHelper', function(argKey) { // Renamed helperMissing, arg
            if(arguments.length >= 2) { // Allow for options object
                return undefined; // Return undefined if options are present
            } else {
                throw new Error("Cannot find helper: '" + argKey + "'");
            }
        });

        engineInstance.registerHelper('missingBlockHelper', function(dataContext, execOptions) { // Renamed blockHelperMissing, context, options
            const fallbackFn = execOptions.inverse || function() {}; // Renamed inverse, fn
            const primaryFn = execOptions.fn;

            if (isCallable(dataContext)) { dataContext = dataContext.call(this); } // Use renamed isCallable

            let hasContent = false; // Added flag
            if(dataContext === true) {
                hasContent = true;
            } else if(dataContext === false || dataContext == null) {
                hasContent = false;
            } else if (isList(dataContext)) { // Use renamed isList
                hasContent = dataContext.length > 0;
            } else {
                hasContent = true; // Assume any other non-empty context has content
            }

            return hasContent ? primaryFn(this) : fallbackFn(this); // Simplified logic
        });

        engineInstance.registerHelper('iterate', function(dataCollection, iterOptions) { // Renamed each, context, options
            const primaryIterator = iterOptions.fn; // Renamed fn, inverse
            const secondaryIterator = iterOptions.inverse;
            let resultString = ""; // Renamed ret
            let iterationCount = 0; // Renamed i
            let currentScopeData; // Renamed data

            if (isCallable(dataCollection)) { dataCollection = dataCollection.call(this); } // Use renamed isCallable

            if (!dataCollection) { // Guard clause
                return secondaryIterator(this);
            }

            if (iterOptions.data) {
                currentScopeData = makeDataScope(iterOptions.data); // Use renamed function
            }

            if(typeof dataCollection === 'object') {
                if (isList(dataCollection)) { // Use renamed isList
                    for(let k = 0; k < dataCollection.length; k++) { // Renamed j, i
                        if (currentScopeData) {
                            currentScopeData.index = k;
                            currentScopeData.isFirst = (k === 0); // Renamed first
                            currentScopeData.isLast  = (k === (dataCollection.length - 1)); // Renamed last
                        }
                        resultString += primaryIterator(dataCollection[k], { data: currentScopeData });
                        iterationCount++;
                    }
                } else {
                    for(let prop in dataCollection) { // Renamed key
                        if(Object.prototype.hasOwnProperty.call(dataCollection, prop)) { // Changed hasOwnProperty call
                            if(currentScopeData) { currentScopeData.propName = prop; } // Renamed key
                            resultString += primaryIterator(dataCollection[prop], {data: currentScopeData});
                            iterationCount++;
                        }
                    }
                }
            }

            if(iterationCount === 0){
                resultString = secondaryIterator(this);
            }

            return resultString;
        });

        engineInstance.registerHelper('conditionIf', function(conditionVal, ifOptions) { // Renamed if, conditional, options
            if (isCallable(conditionVal)) { conditionVal = conditionVal.call(this); } // Use renamed isCallable

            // Determine if the positive path should be rendered.
            // If `includeZero` is set in hash, 0 is considered truthy.
            const shouldExecutePrimary = (!ifOptions.hash.includeZero && !UtilityFunctions.isValueEmpty(conditionVal)) || (ifOptions.hash.includeZero && conditionVal === 0) || (conditionVal && !UtilityFunctions.isValueEmpty(conditionVal)); // More explicit logic for includeZero
            if (shouldExecutePrimary) {
                return ifOptions.fn(this);
            } else {
                return ifOptions.inverse(this);
            }
        });

        engineInstance.registerHelper('unless', function(conditionVal, unlessOptions) { // Renamed conditional, options
            // Invert the options for the 'if' helper.
            return engineInstance.registeredHelpers['conditionIf'].call(this, conditionVal, {
                fn: unlessOptions.inverse,
                inverse: unlessOptions.fn,
                hash: unlessOptions.hash
            });
        });

        engineInstance.registerHelper('withContext', function(scopeContext, withOptions) { // Renamed with, context, options
            if (isCallable(scopeContext)) { scopeContext = scopeContext.call(this); } // Use renamed isCallable

            if (!UtilityFunctions.isValueEmpty(scopeContext)) return withOptions.fn(scopeContext); // Use renamed utility
            return ''; // Explicitly return empty string if context is empty
        });

        engineInstance.registerHelper('logOutput', function(outputContext, logOptions) { // Renamed log, context, options
            // Default level to INFO (1) if not provided or invalid.
            const logLevel = logOptions.data && logOptions.data.logLevel != null ? parseInt(logOptions.data.logLevel, 10) : 1; // Renamed level, parseInt
            engineInstance.logMessage(logLevel, outputContext); // Use renamed method
        });
    }
  };

  const systemLogger = { // Renamed logger
    levelMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' }, // Renamed methodMap

    // Debugging levels
    DEBUG_LEVEL: 0, // Renamed DEBUG
    INFO_LEVEL: 1,  // Renamed INFO
    WARN_LEVEL: 2,  // Renamed WARN
    ERROR_LEVEL: 3, // Renamed ERROR
    currentLogLevel: 3, // Renamed level - default to ERROR

    // Can be overridden in the host environment (e.g., browser console).
    log: function(msgLevel, logObject) { // Renamed level, obj
      if (systemLogger.currentLogLevel <= msgLevel) {
        const logMethod = systemLogger.levelMap[msgLevel]; // Renamed method
        if (typeof console !== 'undefined' && console && typeof console[logMethod] === 'function') { // Added extra console check
          console[logMethod].call(console, logObject);
        }
      }
    }
  };
  engineBaseExports.systemLogger = systemLogger;

  /**
   * Logs a message using the system logger.
   * @param {number} level - The log level.
   * @param {*} message - The message/object to log.
   */
  function systemLog(level, message) { systemLogger.log(level, message); } // Renamed log

  engineBaseExports.systemLog = systemLog;

  /**
   * Creates a new data frame by extending an existing object.
   * @param {object} baseObject - The object to extend.
   * @returns {object} A new object with properties from the baseObject.
   */
  const makeDataScope = function(baseObject) { // Renamed createFrame
    let newScope = {}; // Renamed obj
    UtilityFunctions.mergeProperties(newScope, baseObject); // Use renamed utility
    return newScope;
  };
  engineBaseExports.makeDataScope = makeDataScope;

  return engineBaseExports;
}) (mod_util, mod_error); // Pass renamed dependencies

// core/runtime-engine.js
let mod_runtime = (function(dep_util, dep_error, dep_engineBase) { // Renamed __module6__, __dependency1__, __dependency2__, __dependency3__
  "use strict";
  let runtimeExports = {}; // Renamed __exports__
  // /*global Utils */ // Removed original comment
  const UtilityFunctions = dep_util; // Renamed Utils
  const CustomException = dep_error; // Renamed Exception
  const COMPILER_SPEC_REVISION = dep_engineBase.COMPILER_SPEC_REVISION; // Renamed COMPILER_REVISION
  const REVISION_COMPATIBILITY = dep_engineBase.REVISION_COMPATIBILITY; // Renamed REVISION_CHANGES

  /**
   * Validates the compiler revision against the current runtime revision.
   * @param {Array} specInfo - Compiler information array [revision, version].
   * @throws {Error} If there's a version mismatch.
   */
  function validateCompilerVersion(specInfo) { // Renamed checkRevision
    const compilerRevision = specInfo && specInfo[0] || 1;
    const currentEngineRevision = COMPILER_SPEC_REVISION; // Renamed currentRevision

    if (compilerRevision !== currentEngineRevision) {
      const currentRuntimeVersions = REVISION_COMPATIBILITY[currentEngineRevision]; // Renamed runtimeVersions
      const precompiledCompilerVersions = REVISION_COMPATIBILITY[compilerRevision]; // Renamed compilerVersions
      let errorMessage = `Template was precompiled with a different version of HBScript than the current runtime.`;

      if (compilerRevision < currentEngineRevision) {
        errorMessage += ` Please update your precompiler to a newer version (${currentRuntimeVersions}) or downgrade your runtime to an older version (${precompiledCompilerVersions}).`;
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        errorMessage += ` Please update your runtime to a newer version (${specInfo[1]}).`;
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Generates a rendering function from a template specification.
   * @param {function} templateSpecFn - The precompiled template function.
   * @param {object} engineEnv - The HBScript engine environment.
   * @returns {function} The rendering function.
   */
  function createRenderer(templateSpecFn, engineEnv) { // Renamed template, env
    if (!engineEnv) {
      throw new Error("No environment provided to template renderer.");
    }

    let partialExecutionHandler; // Renamed invokePartialWrapper
    if (engineEnv.compile) {
      partialExecutionHandler = function(partialRef, partialName, contextData, helperSet, partialSet, dataScope) { // Renamed partial, name, context, helpers, partials, data
        let existingPartialResult = executePartial(partialRef, partialName, contextData, helperSet, partialSet, dataScope); // Renamed invokePartial
        if (existingPartialResult) { return existingPartialResult; }

        // Compile and cache the partial if it's not already a function.
        const partialOptions = { helpers: helperSet, partials: partialSet, data: dataScope };
        partialSet[partialName] = engineEnv.compile(partialRef, { data: dataScope !== undefined }, engineEnv);
        return partialSet[partialName](contextData, partialOptions);
      };
    } else {
      partialExecutionHandler = function(partialRef, partialName /* , contextData, helperSet, partialSet, dataScope */) {
        let existingPartialResult = executePartial(partialRef, partialName, null, null, null, null); // Renamed invokePartial, pass nulls for unused args
        if (existingPartialResult) { return existingPartialResult; }
        throw new CustomException("The partial '" + partialName + "' could not be compiled when running in runtime-only mode"); // Renamed Exception
      };
    }

    // This object provides methods for the compiled template function.
    const renderContext = { // Renamed container
      sanitizeOutput: UtilityFunctions.sanitizeForHtml, // Renamed escapeExpression
      invokeSubPartial: partialExecutionHandler, // Renamed invokePartial
      programStore: [], // Renamed programs
      getProgram: function(idx, programFn, programData) { // Renamed program
        let programWrapper = this.programStore[idx];
        if(programData) { // If data is passed, always create a new wrapper
          programWrapper = createProgramExecutor(idx, programFn, programData); // Renamed program
        } else if (!programWrapper) { // Cache if no specific data
          programWrapper = this.programStore[idx] = createProgramExecutor(idx, programFn); // Renamed program
        }
        return programWrapper;
      },
      combineOptions: function(primaryOpts, secondaryOpts) { // Renamed merge, param, common
        let finalOptions = primaryOpts || secondaryOpts;

        if (primaryOpts && secondaryOpts && (primaryOpts !== secondaryOpts)) {
          finalOptions = {};
          UtilityFunctions.mergeProperties(finalOptions, secondaryOpts); // Renamed extend
          UtilityFunctions.mergeProperties(finalOptions, primaryOpts); // Renamed extend
        }
        return finalOptions;
      },
      getDepthProgram: createDepthProgramExecutor, // Renamed programWithDepth
      returnEmptyString: produceEmptyString, // Renamed noop
      compilerMetadata: null // Renamed compilerInfo
    };

    /**
     * The actual rendering function returned to the user.
     * @param {object} inputContext - The data context for rendering.
     * @param {object} [renderOptions] - Options for rendering.
     * @returns {string} The rendered HTML string.
     */
    return function(inputContext, renderOptions) { // Renamed context, options
      renderOptions = renderOptions || {}; // Ensure options object exists
      let executionScope = renderOptions.isPartial ? renderOptions : engineEnv; // Renamed namespace, partial

      let currentHelpers, currentPartials; // Renamed helpers, partials

      if (!renderOptions.isPartial) {
        currentHelpers = renderOptions.helpers;
        currentPartials = renderOptions.partials;
      }

      const renderingResult = templateSpecFn.call( // Renamed templateSpec
            renderContext, // Renamed container
            executionScope, inputContext,
            currentHelpers,
            currentPartials,
            renderOptions.data);

      if (!renderOptions.isPartial) {
        validateCompilerVersion(renderContext.compilerMetadata); // Renamed checkRevision, compilerInfo
      }

      return renderingResult;
    };
  }

  runtimeExports.createRenderer = createRenderer;

  /**
   * Creates a program executor function that includes depth arguments.
   * @param {number} programId - The ID of the program.
   * @param {function} programFunc - The program function.
   * @param {object} [programData] - Data associated with the program.
   * @param {...*} additionalArgs - Additional arguments representing depth.
   * @returns {function} The program executor.
   */
  function createDepthProgramExecutor(programId, programFunc, programData /*, ...depthArgs */) { // Renamed programWithDepth, i, fn, data, $depth
    if (typeof programFunc !== 'function') {
        throw new CustomException("Program function must be callable for depth program.");
    }
    const depthArgs = Array.prototype.slice.call(arguments, 3); // Renamed args

    const depthProgram = function(contextData, optionsObj) { // Renamed prog, context, options
      optionsObj = optionsObj || {};
      return programFunc.apply(this, [contextData, optionsObj.data || programData].concat(depthArgs));
    };
    depthProgram.program = programId;
    depthProgram.depth = depthArgs.length;
    return depthProgram;
  }

  runtimeExports.createDepthProgramExecutor = createDepthProgramExecutor;

  /**
   * Creates a basic program executor function.
   * @param {number} programId - The ID of the program.
   * @param {function} programFunc - The program function.
   * @param {object} [programData] - Data associated with the program.
   * @returns {function} The program executor.
   */
  function createProgramExecutor(programId, programFunc, programData) { // Renamed program, i, fn, data
    if (typeof programFunc !== 'function') {
        throw new CustomException("Program function must be callable.");
    }
    const simpleProgram = function(contextData, optionsObj) { // Renamed prog, context, options
      optionsObj = optionsObj || {};
      return programFunc(contextData, optionsObj.data || programData);
    };
    simpleProgram.program = programId;
    simpleProgram.depth = 0;
    return simpleProgram;
  }

  runtimeExports.createProgramExecutor = createProgramExecutor;

  /**
   * Executes a partial template.
   * @param {*} partialEntity - The partial (string, function, or undefined).
   * @param {string} partialKey - The name of the partial.
   * @param {object} contextData - The data context.
   * @param {object} helperSet - Available helpers.
   * @param {object} partialSet - Available partials.
   * @param {object} dataScope - Data scope.
   * @returns {*} The result of the partial execution or undefined.
   * @throws {CustomException} If the partial is not found or cannot be executed.
   */
  function executePartial(partialEntity, partialKey, contextData, helperSet, partialSet, dataScope) { // Renamed invokePartial, partial, name, context, helpers, partials, data
    const partialOpts = { isPartial: true, helpers: helperSet, partials: partialSet, data: dataScope }; // Renamed options

    if(partialEntity === undefined) {
      throw new CustomException("The partial '" + partialKey + "' could not be located"); // Renamed Exception
    } else if(typeof partialEntity === 'function') { // Check if it's already a function
      return partialEntity(contextData, partialOpts);
    }
    // If it's a string, it needs to be compiled by the environment.
    return undefined; // Indicate that execution didn't happen here.
  }

  runtimeExports.executePartial = executePartial;

  /**
   * Returns an empty string.
   * @returns {string} An empty string.
   */
  function produceEmptyString() { return ""; } // Renamed noop

  runtimeExports.produceEmptyString = produceEmptyString;
  return runtimeExports;
}) (mod_util, mod_error, mod_engineBase); // Pass renamed dependencies

// main-script.js (Renamed handlebars.runtime.js)
let mod_main = (function(dep_engineBase, dep_secureText, dep_error, dep_util, dep_runtime) { // Renamed __module1__, __dependency1__ to __dependency5__
  "use strict";
  let mainExports; // Renamed __exports__
  const BaseEngine = dep_engineBase; // Renamed base

  // Each of these augment the HBScript object.
  const SecureString = dep_secureText; // Renamed SafeString
  const CustomError = dep_error; // Renamed Exception
  const UtilityHelpers = dep_util; // Renamed Utils
  const RuntimeManager = dep_runtime; // Renamed runtime

  // For compatibility and usage outside of module systems, make the HBScript object a namespace
  const buildEngineInstance = function() { // Renamed create
    let hbs = new BaseEngine.TemplateEngineCore(); // Renamed hb, HandlebarsEnvironment

    UtilityHelpers.mergeProperties(hbs, BaseEngine); // Renamed Utils.extend
    hbs.SecureString = SecureString; // Renamed SafeString
    hbs.CustomError = CustomError; // Renamed Exception
    hbs.UtilityHelpers = UtilityHelpers; // Renamed Utils

    hbs.VM = RuntimeManager; // Renamed VM
    hbs.template = function(templateSpec) {
      return RuntimeManager.createRenderer(templateSpec, hbs); // Renamed runtime.template
    };

    return hbs;
  };

  let HBScriptInstance = buildEngineInstance(); // Renamed Handlebars
  HBScriptInstance.create = buildEngineInstance; // Expose the builder function

  mainExports = HBScriptInstance;
  return mainExports;
}) (mod_engineBase, mod_secureText, mod_error, mod_util, mod_runtime);

// The original content for handlebars/compiler/ast.js was partially provided and seems to be a separate module.
// For a Type III clone, I will omit incomplete modules or provide a minimal stub if its absence would break the structure.
// Given it's just the start of a "ProgramNode", it's likely part of a compiler, not directly essential for runtime.
// The request was to modify the provided code, which ends before this file is fully defined or used in the main runtime.
// I will include a minimal stub for this module to maintain the file structure, but with Type III changes.

// compiler/abstract-syntax-tree.js
let mod_ast = (function(dep_err) { // Renamed __module7__, __dependency1__
  "use strict";
  let astExports = {}; // Renamed __exports__
  const ErrorHandler = dep_err; // Renamed Exception

  /**
   * Represents a program node in the Abstract Syntax Tree.
   * @param {Array<object>} statementsList - List of statement nodes.
   * @param {object} inverseStripInfo - Stripping information for inverse block.
   * @param {Array<object>} [inverseStatements] - Statements for an inverse block.
   */
  function ProgramNode(statementsList, inverseStripInfo, inverseStatements) { // Renamed statements, inverseStrip, inverse
    this.nodeType = "program_block"; // Renamed type, changed value
    this.statements = statementsList;
    this.whitespaceControl = {}; // Renamed strip, changed name

    if(inverseStatements) {
      // Create a nested program node for the inverse block.
      this.inverseBlock = new ProgramNode(inverseStatements, inverseStripInfo); // Renamed inverse
      this.whitespaceControl.rightSide = inverseStripInfo.left; // Renamed strip.right, inverseStrip.left
    }
  }

  // No export statement in the original snippet, assuming it would be assigned to __exports__.
  // For Type III, we can just export the constructor directly or through an object.
  astExports.ProgramNode = ProgramNode;
  return astExports; // Explicitly return exports
})(mod_error); // Pass renamed dependency

// The main entry point for the HBScript library.
// This is the final export from the outer IIFE.
return mod_main;
})();