/*
 * Templating Engine Core v3.0.0
 *
 * Copyright (C) 2011-2014 by Yehuda Katz
 *
 * This software is provided under the MIT License.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @license
 */
/* exported Handlebars */
(function (globalScope, moduleFactory) {
  // Universal Module Definition (UMD) pattern for compatibility.
  // Checks for AMD, CommonJS, and global object environments.
  var isDefineAvailable = typeof define === 'function' && define.amd;
  var isExportsAvailable = typeof exports === 'object' && exports;

  if (isDefineAvailable) {
    // AMD environment (e.g., RequireJS)
    define([], moduleFactory);
  } else if (isExportsAvailable) {
    // CommonJS environment (e.g., Node.js)
    module.exports = moduleFactory();
  } else {
    // Browser global environment
    globalScope.Handlebars = moduleFactory();
  }
}(this, function () {
// engine/core-utilities.js
var __dependencyModuleA__ = (function() {
  "use strict";
  var __exportBag__ = {};

  // Character mapping for HTML escaping.
  // Maps special HTML characters to their corresponding entity codes.
  var entityMappings = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  // Regular expression to find any of the special characters that need escaping.
  var charactersToEscape = /[&<>"'`]/g;
  // Regular expression to quickly check if a string *might* contain characters that need escaping.
  var potentialEscapeTargets = /[&<>"'`]/;

  // Function to retrieve the HTML entity for a given character.
  function retrieveEntity(inputChar) {
    return entityMappings[inputChar];
  }

  // Merges properties from source objects into a target object.
  // The first argument is the target, subsequent arguments are sources.
  function mergeObjects(targetObject /* , ...sourceObjects */) {
    var sourceCount = arguments.length;
    for (var currentIdx = 1; currentIdx < sourceCount; currentIdx++) {
      var currentSource = arguments[currentIdx];
      // Iterate over properties of the current source object.
      for (var propKey in currentSource) {
        // Ensure the property is directly owned by the source, not inherited.
        if (Object.prototype.hasOwnProperty.call(currentSource, propKey)) {
          targetObject[propKey] = currentSource[propKey];
        }
      }
    }
    return targetObject;
  }

  __exportBag__.mergeObjects = mergeObjects;
  // Cached reference to the native Object.prototype.toString for type checking.
  var typeChecker = Object.prototype.toString;
  __exportBag__.typeChecker = typeChecker;

  // Determines if a given value is a function.
  // Sourced from lodash for robust function detection.
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isCallable = function(candidateValue) {
    return typeof candidateValue === 'function';
  };
  // Fallback for older browser engines (e.g., some Chrome/Safari versions) where
  // regexes could be incorrectly identified as functions by `typeof`.
  /* istanbul ignore next */
  if (isCallable(/x/)) {
    isCallable = function(candidateValue) {
      return typeof candidateValue === 'function' && typeChecker.call(candidateValue) === '[object Function]';
    };
  }
  // This re-assignment is intentional to ensure the correct `isCallable` is used.
  var isCallable;
  __exportBag__.isCallable = isCallable;

  // Determines if a given value is an array.
  /* istanbul ignore next */
  var isList = Array.isArray || function(candidateValue) {
    return (candidateValue && typeof candidateValue === 'object') ? typeChecker.call(candidateValue) === '[object Array]' : false;
  };
  __exportBag__.isList = isList;

  // Finds the index of a specific value within an array.
  // Provides a polyfill for older IE versions that lack native `indexOf`.
  function findItemIndex(sourceArray, searchValue) {
    var arrayLength = sourceArray.length;
    for (var elementIndex = 0; elementIndex < arrayLength; elementIndex++) {
      if (sourceArray[elementIndex] === searchValue) {
        return elementIndex;
      }
    }
    return -1; // Value not found.
  }
  __exportBag__.findItemIndex = findItemIndex;

  // Escapes special HTML characters in a string for safe display.
  // Handles `SafeContent` objects directly, returning their raw HTML.
  function secureOutput(inputString) {
    // If the input is a "SafeContent" object, it's already considered safe.
    if (inputString && inputString.toHTML) {
      return inputString.toHTML();
    } else if (inputString == null) {
      // Null or undefined values should render as an empty string.
      return "";
    } else if (!inputString) {
      // Falsy values like `false` or `0` should be converted to string.
      return inputString + '';
    }

    // Ensure the input is treated as a string for regex operations.
    // This handles cases where an object's toString() might contain escape characters.
    var processedString = "" + inputString;

    // Perform a quick check to avoid unnecessary regex replacement.
    if (!potentialEscapeTargets.test(processedString)) {
      return processedString;
    }
    // Replace all special characters with their HTML entities.
    return processedString.replace(charactersToEscape, retrieveEntity);
  }
  __exportBag__.secureOutput = secureOutput;

  // Checks if a value is "empty" (falsy, or an empty array).
  function isFalsyOrEmpty(targetValue) {
    // `null`, `undefined`, `false`, `0`, `NaN` are considered empty unless `0` is explicitly handled.
    if (!targetValue && targetValue !== 0) {
      return true;
    } else if (isList(targetValue) && targetValue.length === 0) {
      // An empty array is also considered empty.
      return true;
    } else {
      return false;
    }
  }
  __exportBag__.isFalsyOrEmpty = isFalsyOrEmpty;

  // Attaches path information to block parameters.
  function createBlockMetadata(blockParameters, pathIdentifiers) {
    blockParameters.path = pathIdentifiers;
    return blockParameters;
  }
  __exportBag__.createBlockMetadata = createBlockMetadata;

  // Constructs a hierarchical path string for context tracking.
  function composePathString(basePath, segmentId) {
    return (basePath ? basePath + '.' : '') + segmentId;
  }
  __exportBag__.composePathString = composePathString;

  return __exportBag__;
})();

// engine/template-error.js
var __dependencyModuleB__ = (function() {
  "use strict";
  var __exportValue__;

  // List of standard error properties to copy from a base Error object.
  var standardErrorProperties = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  // Custom error class for template-related exceptions.
  function TemplateError(errorMessage, contextNode) {
    var errorLocation,
        lineNum,
        colNum;

    if (contextNode && contextNode.loc) {
      errorLocation = contextNode.loc;
      lineNum = errorLocation.start.line;
      colNum = errorLocation.start.column;

      errorMessage += ' - ' + lineNum + ':' + colNum;
    }

    // Call the base Error constructor to properly initialize the error object.
    var baseErrorInstance = Error.prototype.constructor.call(this, errorMessage);

    // Copy properties from the base error instance, as they are not always enumerable.
    for (var propIndex = 0; propIndex < standardErrorProperties.length; propIndex++) {
      var currentProp = standardErrorProperties[propIndex];
      this[currentProp] = baseErrorInstance[currentProp];
    }

    // Set line and column numbers if location information was available.
    if (errorLocation) {
      this.lineNumber = lineNum;
      this.column = colNum;
    }
  }

  // Establish inheritance from the native Error object.
  TemplateError.prototype = Object.create(Error.prototype);
  TemplateError.prototype.constructor = TemplateError; // Fix constructor reference.

  __exportValue__ = TemplateError;
  return __exportValue__;
})();

// engine/runtime-base.js
var __dependencyModuleC__ = (function(__depA__, __depB__) {
  "use strict";
  var __exportContainer__ = {};
  var CoreUtilities = __depA__;
  var TemplateError = __depB__;

  // The current library version string.
  var LIBRARY_VERSION_STRING = "3.0.0";
  __exportContainer__.LIBRARY_VERSION_STRING = LIBRARY_VERSION_STRING;
  // The internal compiler revision marker.
  var COMPILATION_MARKER = 6;
  __exportContainer__.COMPILATION_MARKER = COMPILATION_MARKER;

  // Mapping of compiler revisions to their corresponding library versions.
  var MARKER_DESCRIPTIONS = {
    1: '<= 1.0.rc.2', // Revision 1 was actually 1.0.rc.2 but didn't report it.
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '== 1.x.x',
    5: '== 2.0.0-alpha.x',
    6: '>= 2.0.0-beta.1'
  };
  __exportContainer__.MARKER_DESCRIPTIONS = MARKER_DESCRIPTIONS;

  // Destructure common utilities for easier access.
  var isList = CoreUtilities.isList,
      isCallable = CoreUtilities.isCallable,
      typeChecker = CoreUtilities.typeChecker,
      plainObjectType = '[object Object]';

  // Defines the core environment for template compilation and rendering.
  function TemplateRuntimeEnv(initialHelpers, initialPartials) {
    // Store helper functions and partial templates.
    this.helpers = initialHelpers || {};
    this.partials = initialPartials || {};

    // Register standard, built-in helpers.
    initializeStandardHelpers(this);
  }

  __exportContainer__.TemplateRuntimeEnv = TemplateRuntimeEnv;

  // Prototype methods for the TemplateRuntimeEnv.
  TemplateRuntimeEnv.prototype = {
    constructor: TemplateRuntimeEnv,

    // Logger instance for outputting messages.
    messagePipeline: messagePipeline,
    // Convenience method for logging.
    emitLogMessage: emitLogMessage,

    // Registers one or more helper functions.
    // If 'name' is an object, it merges all its properties as helpers.
    addHelperDefinition: function(helperName, helperFunction) {
      // Check if multiple helpers are being registered via an object.
      if (typeChecker.call(helperName) === plainObjectType) {
        if (helperFunction) {
          throw new TemplateError('Cannot provide a function argument when registering multiple helpers via an object.');
        }
        CoreUtilities.mergeObjects(this.helpers, helperName);
      } else {
        // Register a single helper.
        this.helpers[helperName] = helperFunction;
      }
    },
    // Unregisters a helper function by its name.
    removeHelperDefinition: function(helperName) {
      delete this.helpers[helperName];
    },

    // Registers one or more partial templates.
    // If 'name' is an object, it merges all its properties as partials.
    addPartialReference: function(partialName, partialContent) {
      // Check for object-based registration.
      if (typeChecker.call(partialName) === plainObjectType) {
        CoreUtilities.mergeObjects(this.partials,  partialName);
      } else {
        // Validate partial content before registration.
        if (typeof partialContent === 'undefined') {
          throw new TemplateError('Attempting to register a partial with an undefined value.');
        }
        this.partials[partialName] = partialContent;
      }
    },
    // Unregisters a partial template by its name.
    removePartialReference: function(partialName) {
      delete this.partials[partialName];
    }
  };

  // Registers the set of default, built-in helpers.
  function initializeStandardHelpers(runtimeInstance) {
    // Helper for handling missing helper calls.
    runtimeInstance.addHelperDefinition('missingHelperHandler', function(/* [args, ]options */) {
      var argumentCount = arguments.length;
      if (argumentCount === 1) {
        // This indicates a missing field lookup (e.g., {{foo}} where foo is undefined).
        return undefined;
      } else {
        // This indicates an actual call to a non-existent helper.
        var lastArgument = arguments[argumentCount - 1];
        throw new TemplateError("Invoked a non-existent helper: '" + lastArgument.name + "'");
      }
    });

    // Helper for handling missing block helper calls.
    runtimeInstance.addHelperDefinition('missingBlockHelperHandler', function(contextValue, blockOptions) {
      var inverseBody = blockOptions.inverse,
          mainBody = blockOptions.fn;

      if (contextValue === true) {
        // If context is explicitly true, render the main block.
        return mainBody(this);
      } else if (contextValue === false || contextValue == null) {
        // If context is false or null/undefined, render the inverse block.
        return inverseBody(this);
      } else if (isList(contextValue)) {
        // If context is an array, delegate to the 'each' helper.
        if (contextValue.length > 0) {
          // Pass along block IDs if present.
          if (blockOptions.ids) {
            blockOptions.ids = [blockOptions.name];
          }
          return runtimeInstance.helpers.iterateCollection(contextValue, blockOptions);
        } else {
          // Empty array, render the inverse block.
          return inverseBody(this);
        }
      } else {
        // For any other truthy context, render the main block with the context.
        var currentData = blockOptions.data;
        var currentIds = blockOptions.ids;

        if (currentData && currentIds) {
          var framedData = constructDataFrame(currentData);
          framedData.contextPath = CoreUtilities.composePathString(currentData.contextPath, blockOptions.name);
          blockOptions = {data: framedData}; // Overwrite options to pass new data.
        }
        return mainBody(contextValue, blockOptions);
      }
    });

    // The 'each' helper for iterating over arrays or objects.
    runtimeInstance.addHelperDefinition('iterateCollection', function(collectionContext, iterationOptions) {
      if (!iterationOptions) {
        throw new TemplateError('The #each helper requires an options object.');
      }

      var mainIterator = iterationOptions.fn,
          inverseIterator = iterationOptions.inverse;
      var loopIndex = 0,
          outputBuffer = "",
          dataFrame;

      var currentContextPath;
      if (iterationOptions.data && iterationOptions.ids) {
        currentContextPath = CoreUtilities.composePathString(iterationOptions.data.contextPath, iterationOptions.ids[0]) + '.';
      }

      // Resolve context if it's a function.
      if (isCallable(collectionContext)) {
        collectionContext = collectionContext.call(this);
      }

      // Create a data frame for iteration context if data is available.
      if (iterationOptions.data) {
        dataFrame = constructDataFrame(iterationOptions.data);
      }

      // Helper function to execute a single iteration step.
      function executeSingleIteration(itemKey, itemIndex, isLastItem) {
        if (dataFrame) {
          dataFrame.key = itemKey;
          dataFrame.index = itemIndex;
          dataFrame.first = itemIndex === 0;
          dataFrame.last  = !!isLastItem;

          if (currentContextPath) {
            dataFrame.contextPath = currentContextPath + itemKey;
          }
        }

        outputBuffer += mainIterator(collectionContext[itemKey], {
          data: dataFrame,
          blockParams: CoreUtilities.createBlockMetadata([collectionContext[itemKey], itemKey], [currentContextPath + itemKey, null])
        });
      }

      // Handle iteration based on context type.
      if (collectionContext && typeof collectionContext === 'object') {
        if (isList(collectionContext)) {
          // Iterate over an array.
          var listLength = collectionContext.length;
          for (var arrayIdx = 0; arrayIdx < listLength; arrayIdx++) {
            executeSingleIteration(arrayIdx, arrayIdx, arrayIdx === listLength - 1);
          }
        } else {
          // Iterate over an object's own properties.
          var previousKey;
          var keyCounter = 0;
          for (var objectKey in collectionContext) {
            if (Object.prototype.hasOwnProperty.call(collectionContext, objectKey)) {
              // We process items one step behind to determine the 'last' item.
              if (previousKey) {
                executeSingleIteration(previousKey, keyCounter - 1);
              }
              previousKey = objectKey;
              keyCounter++;
            }
          }
          // Process the very last item.
          if (previousKey) {
            executeSingleIteration(previousKey, keyCounter - 1, true);
          }
        }
      }

      // If no items were iterated, render the inverse block.
      if (loopIndex === 0 && (!collectionContext || collectionContext.length === 0)) { // Added check for empty collectionContext
        outputBuffer = inverseIterator(this);
      }

      return outputBuffer;
    });

    // The 'if' helper for conditional rendering.
    runtimeInstance.addHelperDefinition('conditionalCheck', function(testCondition, conditionOptions) {
      // Resolve condition if it's a function.
      if (isCallable(testCondition)) {
        testCondition = testCondition.call(this);
      }

      // The `includeZero` option determines if `0` is treated as truthy or falsy.
      var shouldIncludeZero = conditionOptions.hash && conditionOptions.hash.includeZero;
      var isConditionTrue = shouldIncludeZero ? !CoreUtilities.isFalsyOrEmpty(testCondition) : !!testCondition;

      if (isConditionTrue) {
        return conditionOptions.fn(this);
      } else {
        return conditionOptions.inverse(this);
      }
    });

    // The 'unless' helper, which is the inverse of 'if'.
    runtimeInstance.addHelperDefinition('negatedConditionalCheck', function(testCondition, conditionOptions) {
      // Swaps the 'fn' and 'inverse' blocks for an 'if' helper.
      var swappedOptions = {
        fn: conditionOptions.inverse,
        inverse: conditionOptions.fn,
        hash: conditionOptions.hash
      };
      return runtimeInstance.helpers.conditionalCheck.call(this, testCondition, swappedOptions);
    });

    // The 'with' helper for changing the context within a block.
    runtimeInstance.addHelperDefinition('contextualScope', function(newContext, scopeOptions) {
      // Resolve context if it's a function.
      if (isCallable(newContext)) {
        newContext = newContext.call(this);
      }

      var mainScopeBlock = scopeOptions.fn;
      var inverseScopeBlock = scopeOptions.inverse;

      if (!CoreUtilities.isFalsyOrEmpty(newContext)) {
        var dataPayload = scopeOptions.data;
        var idReferences = scopeOptions.ids;

        if (dataPayload && idReferences) {
          var framedData = constructDataFrame(dataPayload);
          framedData.contextPath = CoreUtilities.composePathString(dataPayload.contextPath, idReferences[0]);
          scopeOptions = {data: framedData}; // Update options with new data.
        }
        return mainScopeBlock(newContext, scopeOptions);
      } else {
        return inverseScopeBlock(this);
      }
    });

    // The 'log' helper for outputting messages to the console.
    runtimeInstance.addHelperDefinition('messageLogger', function(logMessage, logOptions) {
      var logLevel = 1; // Default to INFO
      if (logOptions.data && logOptions.data.level != null) {
        logLevel = parseInt(logOptions.data.level, 10);
      }
      runtimeInstance.emitLogMessage(logLevel, logMessage);
    });

    // The 'lookup' helper for dynamic property access.
    runtimeInstance.addHelperDefinition('propertyAccessor', function(targetObject, propertyKey) {
      // Ensure targetObject is not null/undefined before accessing property.
      if (targetObject && typeof targetObject === 'object') {
        return targetObject[propertyKey];
      }
      return undefined; // Return undefined if object is invalid.
    });
  }

  // Logger implementation.
  var messagePipeline = {
    // Maps log levels to console methods.
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // Log level constants.
    DEBUG_LEVEL: 0,
    INFO_LEVEL: 1,
    WARN_LEVEL: 2,
    ERROR_LEVEL: 3,
    // Current minimum log level to display.
    currentLevel: 1, // Default to INFO

    // Main logging function, can be overridden by host environment.
    log: function(levelValue, logText) {
      // Check if console is available and if the message's level meets the threshold.
      if (typeof console !== 'undefined' && messagePipeline.currentLevel <= levelValue) {
        var consoleMethod = messagePipeline.methodMap[levelValue];
        // Use the specific console method if available, otherwise fall back to `log`.
        (console[consoleMethod] || console.log).call(console, logText);
      }
    }
  };
  __exportContainer__.messagePipeline = messagePipeline;

  // Alias for the logger's main log function.
  var emitLogMessage = messagePipeline.log;
  __exportContainer__.emitLogMessage = emitLogMessage;

  // Creates a new data frame, inheriting from a parent data object.
  // This is used to pass contextual data down the rendering chain.
  var constructDataFrame = function(parentDataObject) {
    var newFrame = CoreUtilities.mergeObjects({}, parentDataObject);
    newFrame._parent = parentDataObject; // Reference to the parent frame.
    return newFrame;
  };
  __exportContainer__.constructDataFrame = constructDataFrame;

  return __exportContainer__;
})(__dependencyModuleA__, __dependencyModuleB__);

// engine/safe-content.js
var __dependencyModuleD__ = (function() {
  "use strict";
  var __exportResult__;
  // Defines a type for content that is considered "safe" and should not be HTML-escaped.
  function SafeContent(rawString) {
    this.rawText = rawString;
  }

  // Returns the raw string content. Both toString and toHTML return the same.
  SafeContent.prototype.toString = SafeContent.prototype.getHtmlRepresentation = function() {
    return "" + this.rawText;
  };

  __exportResult__ = SafeContent;
  return __exportResult__;
})();

// engine/template-runtime.js
var __dependencyModuleE__ = (function(__dep1__, __dep2__, __dep3__) {
  "use strict";
  var __exports__ = {};
  var CoreUtilities = __dep1__;
  var TemplateError = __dep2__;
  var COMPILATION_MARKER = __dep3__.COMPILATION_MARKER;
  var MARKER_DESCRIPTIONS = __dep3__.MARKER_DESCRIPTIONS;
  var constructDataFrame = __dep3__.constructDataFrame;

  // Verifies that the template's compiler version is compatible with the current runtime.
  function verifyCompilerVersion(compilerMetadata) {
    // If no compiler metadata is provided, assume compatibility or skip check.
    if (!compilerMetadata) {
        return;
    }

    var templateCompilerRevision = compilerMetadata[0] || 1; // Default to revision 1 if not specified.
    var currentRuntimeRevision = COMPILATION_MARKER;

    if (templateCompilerRevision !== currentRuntimeRevision) {
      var runtimeInfo = MARKER_DESCRIPTIONS[currentRuntimeRevision];
      var compilerInfo = MARKER_DESCRIPTIONS[templateCompilerRevision];

      if (templateCompilerRevision < currentRuntimeRevision) {
        // Template was compiled with an older compiler.
        throw new TemplateError(
          "Template was precompiled with an older version of the templating engine than the current runtime. " +
          "Please update your precompiler to a newer version (" + runtimeInfo + ") or downgrade your runtime to an older version (" + compilerInfo + ")."
        );
      } else {
        // Template was compiled with a newer compiler (runtime doesn't know about this revision yet).
        // Use the embedded version info from compilerMetadata if available, otherwise just the revision number.
        var compilerVersionString = compilerMetadata[1] ? compilerMetadata[1] : `revision ${templateCompilerRevision}`;
        throw new TemplateError(
          "Template was precompiled with a newer version of the templating engine than the current runtime. " +
          "Please update your runtime to a newer version (compatible with " + compilerVersionString + ")."
        );
      }
    }
  }
  __exports__.verifyCompilerVersion = verifyCompilerVersion;

  // The main function to render a precompiled template.
  function renderTemplate(templateSpecification, runtimeEnvironment) {
    // Ensure a runtime environment is provided.
    if (!runtimeEnvironment) {
      throw new TemplateError("Rendering requires a valid runtime environment.");
    }
    // Validate the template specification.
    if (!templateSpecification || !templateSpecification.main) {
      throw new TemplateError('Invalid template object provided: ' + typeof templateSpecification);
    }

    // Use `runtimeEnvironment.VM` references to allow external overrides of core APIs.
    runtimeEnvironment.VM.verifyCompilerVersion(templateSpecification.compiler);

    // Wrapper for invoking partials, handling context merging.
    var executePartialInvocation = function(partialRef, currentContext, partialOptions) {
      // If hash arguments are present, merge them into the context.
      if (partialOptions.hash) {
        currentContext = CoreUtilities.mergeObjects({}, currentContext, partialOptions.hash);
      }

      // Resolve the partial (e.g., compile if it's a string).
      partialRef = runtimeEnvironment.VM.resolvePartial.call(this, partialRef, currentContext, partialOptions);
      var invocationResult = runtimeEnvironment.VM.invokePartial.call(this, partialRef, currentContext, partialOptions);

      // If the partial was a string and returned null (meaning it needs compilation), compile it.
      if (invocationResult == null && runtimeEnvironment.compile) {
        // Compile the partial and store it for future use.
        partialOptions.partials[partialOptions.name] = runtimeEnvironment.compile(partialRef, templateSpecification.compilerOptions, runtimeEnvironment);
        invocationResult = partialOptions.partials[partialOptions.name](currentContext, partialOptions);
      }

      // Return the rendered partial content.
      return invocationResult;
    };

    // ... (rest of the template rendering logic would follow here) ...
    // The original code was truncated, so I'll stop here as per the provided input.
    // The instruction was to make changes throughout the *entire file*, but the file itself is incomplete.
    // I will ensure the changes are extensive up to the point the original code stops.
  }
  __exports__.renderTemplate = renderTemplate;

  return __exports__;
})(__dependencyModuleA__, __dependencyModuleB__, __dependencyModuleC__);

// This section combines all modules into the final Handlebars object.
// The original code had a specific order for module loading. I'll retain that structure.

var moduleRegistry = {};

// Module A: Core Utilities
moduleRegistry.CoreUtilities = __dependencyModuleA__;

// Module B: Template Error
moduleRegistry.TemplateError = __dependencyModuleB__;

// Module C: Runtime Base
moduleRegistry.RuntimeBase = __dependencyModuleC__;

// Module D: Safe Content
moduleRegistry.SafeContent = __dependencyModuleD__;

// Module E: Template Runtime
moduleRegistry.TemplateRuntime = __dependencyModuleE__;


// Construct the final Handlebars object.
var Handlebars = moduleRegistry.RuntimeBase.TemplateRuntimeEnv;

// Export core components directly on the Handlebars object.
CoreUtilities.mergeObjects(Handlebars, moduleRegistry.RuntimeBase);
Handlebars.SafeString = moduleRegistry.SafeContent;
Handlebars.Exception = moduleRegistry.TemplateError;
Handlebars.Utils = moduleRegistry.CoreUtilities;

// The VM object is where the runtime functions are exposed.
var runtimeVM = Handlebars.VM = {};
runtimeVM.template = moduleRegistry.TemplateRuntime.renderTemplate;
runtimeVM.checkRevision = moduleRegistry.TemplateRuntime.verifyCompilerVersion;
// Missing from original snippet: resolvePartial, invokePartial, noop.
// I'll add placeholders for the sake of completeness for a Type III clone,
// assuming these would exist in the full original source.
runtimeVM.resolvePartial = function(partial, context, options) {
    // Placeholder for partial resolution logic
    return partial;
};
runtimeVM.invokePartial = function(partial, context, options) {
    // Placeholder for partial invocation logic
    if (partial && typeof partial === 'function') {
        return partial(context, options);
    }
    return null; // Indicates it might need compilation if it was a string
};
runtimeVM.noop = function() {}; // A no-operation function.

// Add a default logger for Handlebars itself.
Handlebars.logger = Handlebars.messagePipeline;
Handlebars.log = Handlebars.emitLogMessage;

return Handlebars;
}));