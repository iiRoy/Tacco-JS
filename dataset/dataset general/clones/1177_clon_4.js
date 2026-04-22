(function (rootComponent, componentFactory) {
  if (typeof define === 'function' && define.amd) {
    define([], componentFactory);
  } else if (typeof exports === 'object') {
    module.exports = componentFactory();
  } else {
    rootComponent.WidgetEngine = componentFactory();
  }
}(this, function () {

  // --- Core Utility Functions ---

  const CharacterReplacementsMap = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#x27;'],
    ['`', '&#x60;']
  ]);
  const HtmlSpecialCharacterPattern = /[&<>"'`]/g;

  function obtainHtmlSafeString(rawContent) {
    if (rawContent && typeof rawContent.toHtmlString === 'function') {
      return rawContent.toHtmlString();
    }
    if (rawContent == null) {
      return '';
    }
    const contentAsString = String(rawContent);
    if (!HtmlSpecialCharacterPattern.test(contentAsString)) {
      return contentAsString;
    }
    return contentAsString.replace(HtmlSpecialCharacterPattern, (char) => CharacterReplacementsMap.get(char));
  }

  function mergeProperties(targetObject, ...sourceObjects) {
    return Object.assign(targetObject, ...sourceObjects);
  }

  const getTypeString = Object.prototype.toString;

  const isValueFunction = (val) => typeof val === 'function' && getTypeString.call(val) === '[object Function]';

  const isValueArray = Array.isArray;

  function findCollectionElementIndex(collection, item) {
    return collection.indexOf(item);
  }

  function isContentEmpty(val) {
    return (!val && val !== 0) || (isValueArray(val) && val.length === 0);
  }

  function concatenatePathSegments(currentPath, identifier) {
    return (currentPath ? currentPath + '.' : '') + identifier;
  }

  function createParameterBundle(paramsArray, idIndicators) {
    const bundle = Array.from(paramsArray);
    bundle.pathIndicators = idIndicators;
    return bundle;
  }

  // --- Custom Error Class ---
  class WidgetError extends Error {
    constructor(message, locationDetails) {
      let fullMessage = message;
      if (locationDetails && locationDetails.loc) {
        const { line, column } = locationDetails.loc.start;
        fullMessage += ` - ${line}:${column}`;
        this.linePosition = line;
        this.columnPosition = column;
      }
      super(fullMessage);
      this.name = 'WidgetError';
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, WidgetError);
      }
    }
  }

  // --- Template Engine Constants ---
  const WIDGET_ENGINE_VERSION = "3.0.0";
  const WIDGET_BUILD_REVISION = 6;
  const REVISION_COMPATIBILITY_MAP = {
    1: '<= 1.0.rc.2',
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '== 1.x.x',
    5: '== 2.0.0-alpha.x',
    6: '>= 2.0.0-beta.1'
  };

  // --- Logging Utility ---
  const WidgetLogger = {
    logLevelNames: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },
    DEBUG_LEVEL: 0,
    INFO_LEVEL: 1,
    WARN_LEVEL: 2,
    ERROR_LEVEL: 3,
    activeLogLevel: 1,

    output: function(levelCode, message) {
      if (typeof console !== 'undefined' && WidgetLogger.activeLogLevel <= levelCode) {
        const consoleMethod = WidgetLogger.logLevelNames[levelCode];
        (console[consoleMethod] || console.log).call(console, message);
      }
    }
  };

  // --- Data Frame Creation ---
  const createRenderDataFrame = function(originalObject) {
    const newFrame = mergeProperties({}, originalObject);
    newFrame._ancestor = originalObject;
    return newFrame;
  };

  // --- HTML Safe Content Class ---
  class HtmlContent {
    constructor(textValue) {
      this.textValue = textValue;
    }
    toString() {
      return String(this.textValue);
    }
    toHtmlString() {
      return String(this.textValue);
    }
  }

  // --- Template Context Management ---
  class TemplateContextManager {
    constructor(processors, snippets) {
      this.processors = processors || new Map();
      this.snippets = snippets || new Map();
      this.registerDefaultProcessors();
    }

    logOutput(level, message) {
      WidgetLogger.output(level, message);
    }

    registerProcessor(name, func) {
      if (getTypeString.call(name) === '[object Object]') {
        if (func) {
          throw new WidgetError('Cannot provide function with multiple processor registration');
        }
        for (const [key, value] of Object.entries(name)) {
          this.processors.set(key, value);
        }
      } else {
        this.processors.set(name, func);
      }
    }
    deregisterProcessor(name) {
      this.processors.delete(name);
    }

    registerSnippet(name, snippetContent) {
      if (getTypeString.call(name) === '[object Object]') {
        for (const [key, value] of Object.entries(name)) {
          this.snippets.set(key, value);
        }
      } else {
        if (typeof snippetContent === 'undefined') {
          throw new WidgetError('Attempting to register an undefined snippet');
        }
        this.snippets.set(name, snippetContent);
      }
    }
    deregisterSnippet(name) {
      this.snippets.delete(name);
    }

    registerDefaultProcessors() {
      const currentManager = this;

      currentManager.registerProcessor('missingHandler', function(...args) {
        if (args.length === 1) {
          return undefined;
        } else {
          throw new WidgetError(`Missing handler: '${args[args.length - 1].name}'`);
        }
      });

      currentManager.registerProcessor('missingBlockHandler', function(contextualValue, configOptions) {
        const negativePath = configOptions.inverse;
        const positivePath = configOptions.fn;

        if (contextualValue === true) {
          return positivePath(this);
        } else if (contextualValue === false || contextualValue == null) {
          return negativePath(this);
        } else if (isValueArray(contextualValue)) {
          if (contextualValue.length > 0) {
            if (configOptions.idIndicators) {
              configOptions.idIndicators = [configOptions.processorName];
            }
            return currentManager.processors.get('iterateCollection')(contextualValue, configOptions);
          } else {
            return negativePath(this);
          }
        } else {
          if (configOptions.dataPacket && configOptions.idIndicators) {
            const newPacket = createRenderDataFrame(configOptions.dataPacket);
            newPacket.pathId = concatenatePathSegments(configOptions.dataPacket.pathId, configOptions.processorName);
            configOptions = { dataPacket: newPacket };
          }
          return positivePath(contextualValue, configOptions);
        }
      });

      currentManager.registerProcessor('iterateCollection', function(collection, configOptions) {
        if (!configOptions) {
          throw new WidgetError('Iteration configuration required for #iterateCollection');
        }

        const positiveRender = configOptions.fn;
        const negativeRender = configOptions.inverse;
        let iterationOutput = '';
        let dataContextForIteration;

        let currentPathIdRoot;
        if (configOptions.dataPacket && configOptions.idIndicators) {
          currentPathIdRoot = concatenatePathSegments(configOptions.dataPacket.pathId, configOptions.idIndicators[0]) + '.';
        }

        if (isValueFunction(collection)) {
          collection = collection.call(this);
        }

        if (configOptions.dataPacket) {
          dataContextForIteration = createRenderDataFrame(configOptions.dataPacket);
        }

        const executeIterationStep = (item, index, isLast, itemKey) => {
          const actualItemKey = itemKey !== undefined ? itemKey : index;
          if (dataContextForIteration) {
            dataContextForIteration.itemKey = actualItemKey;
            dataContextForIteration.itemIndex = index;
            dataContextForIteration.isFirst = index === 0;
            dataContextForIteration.isLast = !!isLast;

            if (currentPathIdRoot) {
              dataContextForIteration.pathId = currentPathIdRoot + actualItemKey;
            }
          }

          iterationOutput += positiveRender(item, {
            dataPacket: dataContextForIteration,
            paramBundle: createParameterBundle([item, actualItemKey], [currentPathIdRoot + actualItemKey, null])
          });
        };

        if (collection && typeof collection === 'object') {
          if (isValueArray(collection)) {
            collection.forEach((item, idx) => {
              executeIterationStep(item, idx, idx === collection.length - 1);
            });
          } else {
            const keys = Object.keys(collection);
            keys.forEach((key, idx) => {
              executeIterationStep(collection[key], idx, idx === keys.length - 1, key);
            });
          }
        }

        if (iterationOutput === '') {
          iterationOutput = negativeRender(this);
        }

        return iterationOutput;
      });

      currentManager.registerProcessor('conditionalCheck', function(testCondition, configOptions) {
        if (isValueFunction(testCondition)) {
          testCondition = testCondition.call(this);
        }
        return (!configOptions.hash.allowZeroValue && !testCondition) || isContentEmpty(testCondition)
          ? configOptions.inverse(this)
          : configOptions.fn(this);
      });

      currentManager.registerProcessor('inverseConditional', function(testCondition, configOptions) {
        return currentManager.processors.get('conditionalCheck').call(this, testCondition, {
          fn: configOptions.inverse,
          inverse: configOptions.fn,
          hash: configOptions.hash
        });
      });

      currentManager.registerProcessor('contextualBlock', function(newContext, configOptions) {
        if (isValueFunction(newContext)) {
          newContext = newContext.call(this);
        }

        const positiveRender = configOptions.fn;
        const negativeRender = configOptions.inverse;

        if (!isContentEmpty(newContext)) {
          if (configOptions.dataPacket && configOptions.idIndicators) {
            const newPacket = createRenderDataFrame(configOptions.dataPacket);
            newPacket.pathId = concatenatePathSegments(configOptions.dataPacket.pathId, configOptions.idIndicators[0]);
            configOptions = { dataPacket: newPacket };
          }
          return positiveRender(newContext, configOptions);
        } else {
          return negativeRender(this);
        }
      });

      currentManager.registerProcessor('emitLog', function(message, configOptions) {
        const levelCode = configOptions.dataPacket && configOptions.dataPacket.levelCode != null
          ? parseInt(configOptions.dataPacket.levelCode, 10)
          : 1;
        currentManager.logOutput(levelCode, message);
      });

      currentManager.registerProcessor('fetchProperty', function(sourceObject, propertyName) {
        return sourceObject && sourceObject[propertyName];
      });
    }
  }

  // --- Runtime Functions ---
  function validateBuilderVersion(builderInfo) {
    const builderRevision = builderInfo && builderInfo[0] || 1;
    const activeRevision = WIDGET_BUILD_REVISION;

    if (builderRevision !== activeRevision) {
      if (builderRevision < activeRevision) {
        const runtimeVersions = REVISION_COMPATIBILITY_MAP[activeRevision];
        const builderVersions = REVISION_COMPATIBILITY_MAP[builderRevision];
        throw new WidgetError(`Template was built with an older version of WidgetEngine (${builderVersions}) than the current runtime (${runtimeVersions}). Please update your builder or downgrade your runtime.`);
      } else {
        throw new WidgetError(`Template was built with a newer version of WidgetEngine (${builderInfo[1]}) than the current runtime. Please update your runtime.`);
      }
    }
  }

  // --- Main Widget Engine Object ---
  const MainWidgetEngine = {};

  MainWidgetEngine.utilities = {
    htmlEscape: obtainHtmlSafeString,
    objectMerge: mergeProperties,
    isFunc: isValueFunction,
    isArr: isValueArray,
    arrayFindIdx: findCollectionElementIndex,
    isVoid: isContentEmpty,
    pathCombine: concatenatePathSegments,
    createParamObj: createParameterBundle
  };

  MainWidgetEngine.WidgetError = WidgetError;
  MainWidgetEngine.HtmlSafe = HtmlContent;

  MainWidgetEngine.VERSION_INFO = WIDGET_ENGINE_VERSION;
  MainWidgetEngine.COMPILER_REV = WIDGET_BUILD_REVISION;
  MainWidgetEngine.REVISION_TRACK = REVISION_COMPATIBILITY_MAP;

  MainWidgetEngine.logger = WidgetLogger;
  MainWidgetEngine.logOutput = WidgetLogger.output;

  MainWidgetEngine.dataFrameCreator = createRenderDataFrame;

  MainWidgetEngine.ContextManager = TemplateContextManager;

  MainWidgetEngine.VirtualMachine = {
    validateBuilderVersion: validateBuilderVersion,
    resolveSnippet: function(snippetRef, context, options) {
      return snippetRef;
    },
    executeSnippet: function(snippetFunction, context, options) {
      if (typeof snippetFunction === 'function') {
        return snippetFunction.call(this, context, options);
      }
      return null;
    },
    lookupProperty: function(obj, field) {
        return obj && obj[field];
    }
  };

  // This function takes a compiled template blueprint and an environment instance,
  // and returns a runnable template function.
  MainWidgetEngine.templateProcessor = function(templateBlueprint, contextManagerInstance) {
    if (!contextManagerInstance) {
      throw new MainWidgetEngine.WidgetError("No context manager provided to template processor");
    }
    if (!templateBlueprint || !templateBlueprint.main) {
      throw new MainWidgetEngine.WidgetError('Invalid template blueprint: ' + typeof templateBlueprint);
    }

    contextManagerInstance.VirtualMachine = MainWidgetEngine.VirtualMachine;

    MainWidgetEngine.VirtualMachine.validateBuilderVersion(templateBlueprint.builder);

    const invokeSnippetExecutor = function(snippetReference, dataContext, configOptions) {
      if (configOptions.dataHash) {
        dataContext = MainWidgetEngine.utilities.objectMerge({}, dataContext, configOptions.dataHash);
      }

      snippetReference = contextManagerInstance.VirtualMachine.resolveSnippet.call(this, snippetReference, dataContext, configOptions);
      let result = contextManagerInstance.VirtualMachine.executeSnippet.call(this, snippetReference, dataContext, configOptions);

      if (result == null && contextManagerInstance.compile) {
        configOptions.snippets[configOptions.snippetName] = contextManagerInstance.compile(snippetReference, templateBlueprint.builderOptions, contextManagerInstance);
        result = configOptions.snippets[configOptions.snippetName](dataContext, configOptions);
      }
      return result;
    };

    return function(runtimeContext, runtimeOptions) {
      runtimeOptions = runtimeOptions || {};

      const templateRuntimeContainer = {
        helpers: runtimeOptions.helpers || contextManagerInstance.processors,
        partials: runtimeOptions.partials || contextManagerInstance.snippets,
        data: runtimeOptions.dataPacket || (runtimeOptions.data ? MainWidgetEngine.dataFrameCreator(runtimeOptions.data) : undefined),
        blockParams: MainWidgetEngine.utilities.createParamObj,
        escapeExpression: MainWidgetEngine.utilities.htmlEscape,
        lookupProperty: MainWidgetEngine.VirtualMachine.lookupProperty,
        invokePartial: invokeSnippetExecutor
      };

      return templateBlueprint.main.call(runtimeContext, runtimeContext, templateRuntimeContainer);
    };
  };

  return MainWidgetEngine;

}));