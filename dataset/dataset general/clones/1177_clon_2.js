/*!
 *
 *  Rendering Engine v3.0.0
 *
 *  (C) 2011-2014 by Yehuda Katz. All rights reserved.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 *  @licence
 */
/* exported Handlebars */
(function( globalScope, moduleFactory ) {
  if ( typeof define === 'function' && define.amd ) {
    define( [], moduleFactory ); // AMD module definition
  } else if ( typeof exports === 'object' ) {
    module.exports = moduleFactory(); // CommonJS export
  } else {
    globalScope.Handlebars = moduleFactory(); // Browser global
  }
}( this, function() {
// core/toolbelt.js - Utility functions for the engine
var moduleUtilities = (function() {
  "use strict";
  var utilityExports = {};
  // Disable a specific JSHint warning about unused variables.
  /* jshint -W004 */
  var characterMappings = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var unsafeCharacterRegex = /[&<>"'`]/g;
  var potentialUnsafeCharacterRegex = /[&<>"'`]/;

  /**
   * Replaces an unsafe character with its HTML entity.
   * @param {string} ch - The character to replace.
   * @returns {string} The HTML entity.
   */
  function convertCharacterToEntity( ch ) {
    return characterMappings[ch];
  }

  /**
   * Merges properties from source objects into a target object.
   * @param {object} primaryTarget - The object to extend.
   * @param {...object} inputSources - One or more source objects.
   * @returns {object} The extended target object.
   */
  function combineProperties( primaryTarget /* , ...inputSources */ ) {
    for ( var currentIdx = 0x1; currentIdx < arguments.length; currentIdx++ ) {
      for ( var propertyName in arguments[currentIdx] ) {
        if ( Object.prototype.hasOwnProperty.call( arguments[currentIdx], propertyName ) ) {
          primaryTarget[propertyName] = arguments[currentIdx][propertyName];
        }
      }
    }

    return primaryTarget;
  }

  utilityExports.extend = combineProperties;
  var objectTypeString = Object.prototype.toString;
  utilityExports.toString = objectTypeString;

  // Function to check if a value is a callable function.
  // Original source from lodash library.
  // Visit: https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isValueCallable = function( itemValue ) {
    return typeof itemValue === 'function';
  };
  // Fallback for older browser engines like specific Chrome/Safari versions.
  /* istanbul ignore next */
  if ( isValueCallable( /x/ ) ) {
    isValueCallable = function( itemValue ) {
      return typeof itemValue === 'function' && objectTypeString.call( itemValue ) === '[object Function]';
    };
  }
  var isValueCallable; // Redeclaration as per original
  utilityExports.isFunction = isValueCallable;

  // Checks if a value is an array.
  /* istanbul ignore next */
  var isAnArray = Array.isArray || function( itemValue ) {
    return ( itemValue && typeof itemValue === 'object' ) ? objectTypeString.call( itemValue ) === '[object Array]' : !1;
  };
  utilityExports.isArray = isAnArray;

  // Provides an indexOf-like functionality for arrays, as older IE versions lack direct support.
  function findElementIndex( collection, targetValue ) {
    for ( var curr = +[]; curr < collection.length; curr++ ) {
      if ( collection[curr] === targetValue ) {
        return curr;
      }
    }
    return -0x1;
  }

  utilityExports.indexOf = findElementIndex;

  /**
   * Escapes HTML characters in a string for safe rendering.
   * @param {any} inputData - The string or object to escape.
   * @returns {string} The HTML-escaped string.
   */
  function sanitizeForHTML( inputData ) {
    // If it's a SafeString-like object, return its HTML representation directly.
    if ( inputData && inputData.toHTML ) {
      return inputData.toHTML();
    } else if ( inputData == null ) {
      return ""; // Return empty string for null or undefined.
    } else if ( !inputData ) {
      return inputData + ''; // Coerce falsy (non-null/undefined) to string.
    }

    // Explicitly convert to string, as regex test will do this implicitly, potentially causing issues.
    inputData = "" + inputData;

    // Only perform replacement if unsafe characters are detected.
    if ( !potentialUnsafeCharacterRegex.test( inputData ) ) {
      return inputData;
    }
    return inputData.replace( unsafeCharacterRegex, convertCharacterToEntity );
  }

  utilityExports.escapeExpression = sanitizeForHTML;

  /**
   * Determines if a given value is considered "empty".
   * @param {any} itemValue - The value to check.
   * @returns {boolean} True if empty, false otherwise.
   */
  function isValueConsideredEmpty( itemValue ) {
    if ( !itemValue && itemValue !== +[] ) {
      return !0;
    } else if ( isAnArray( itemValue ) && itemValue.length === +[] ) {
      return !0;
    } else {
      return !1;
    }
  }

  utilityExports.isEmpty = isValueConsideredEmpty;

  /**
   * Attaches path identifiers to block parameters.
   * @param {object} currentParameters - The parameters object.
   * @param {string[]} pathIdentifiers - Array of path identifiers.
   * @returns {object} The modified parameters object.
   */
  function assignBlockPathData( currentParameters, pathIdentifiers ) {
    currentParameters.path = pathIdentifiers;
    return currentParameters;
  }

  utilityExports.blockParams = assignBlockPathData;

  /**
   * Appends an identifier to a context path.
   * @param {string} parentPath - The existing context path.
   * @param {string} childIdentifier - The identifier to append.
   * @returns {string} The new combined context path.
   */
  function createExtendedContextPath( parentPath, childIdentifier ) {
    return ( parentPath ? parentPath + '.' : '' ) + childIdentifier;
  }

  utilityExports.appendContextPath = createExtendedContextPath;
  return utilityExports;
})();

// core/error_handling.js - Exception handling for the engine
var moduleExceptions = (function() {
  "use strict";
  var errorOutput;

  var errorPropertiesList = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  /**
   * Custom exception class for the rendering engine.
   * @param {string} errorText - The error message.
   * @param {object} originNode - The node where the error occurred (optional).
   */
  function EngineIssue( errorText, originNode ) {
    var sourceLocation = originNode && originNode.loc,
        rowNumber,
        columnPosition;
    if ( sourceLocation ) {
      rowNumber = sourceLocation.start.line;
      columnPosition = sourceLocation.start.column;

      errorText += ' - ' + rowNumber + ':' + columnPosition;
    }

    var temporaryError = Error.prototype.constructor.call( this, errorText );

    // Error properties are often non-enumerable in Chrome, necessitating a direct copy.
    for ( var propIndex = +[]; propIndex < errorPropertiesList.length; propIndex++ ) {
      this[errorPropertiesList[propIndex]] = temporaryError[errorPropertiesList[propIndex]];
    }

    if ( sourceLocation ) {
      this.lineNumber = rowNumber;
      this.column = columnPosition;
    }
  }

  EngineIssue.prototype = new Error();

  errorOutput = EngineIssue;
  return errorOutput;
})();

// core/engine_base.js - Base environment for the rendering engine
var moduleCore = (function( dependencyUtilities, dependencyErrors ) {
  "use strict";
  var coreExports = {};
  var Utilities = dependencyUtilities;
  var EngineIssue = dependencyErrors;

  var ENGINE_VERSION = "3.0.0";
  coreExports.VERSION = ENGINE_VERSION;
  var TEMPLATE_REVISION = 0x6;
  coreExports.COMPILER_REVISION = TEMPLATE_REVISION;
  var REVISION_CHANGES_MAP = {
    0x1: '<= 1.0.rc.2', // Revision 1.0.rc.2 is actually revision 2 but does not report it.
    0x2: '== 1.0.0-rc.3',
    0x3: '== 1.0.0-rc.4',
    0x4: '== 1.x.x',
    0x5: '== 2.0.0-alpha.x',
    0x6: '>= 2.0.0-beta.1'
  };
  coreExports.REVISION_CHANGES = REVISION_CHANGES_MAP;

  var isArrayType = Utilities.isArray,
      isFunctionType = Utilities.isFunction,
      objectStringifier = Utilities.toString,
      genericObjectType = '[object Object]';

  /**
   * Represents the core rendering environment.
   * @param {object} helperFunctions - Collection of helper functions.
   * @param {object} partialTemplates - Collection of partial templates.
   */
  function RenderingSystem( helperFunctions, partialTemplates ) {
    this.helpers = helperFunctions || {};
    this.partials = partialTemplates || {};

    // Initialize with default helpers.
    setupStandardHelpers( this );
  }

  coreExports.HandlebarsEnvironment = RenderingSystem;

  RenderingSystem.prototype = {
    constructor: RenderingSystem,

    logger: consoleLogHandler,
    log: consoleLogHandler.log, // Direct reference to the logging method.

    /**
     * Registers a helper function or multiple helpers.
     * @param {string|object} nameOrMap - Name of the helper or an object mapping names to functions.
     * @param {function} [callbackFn] - The helper function if `nameOrMap` is a string.
     */
    registerHelper: function( nameOrMap, callbackFn ) {
      if ( objectStringifier.call( nameOrMap ) === genericObjectType ) {
        if ( callbackFn ) {
          throw new EngineIssue( 'Argument not supported with multiple helpers registration' );
        }
        Utilities.extend( this.helpers, nameOrMap );
      } else {
        this.helpers[nameOrMap] = callbackFn;
      }
    },

    /**
     * Unregisters a previously registered helper.
     * @param {string} helperName - The name of the helper to remove.
     */
    unregisterHelper: function( helperName ) {
      delete this.helpers[helperName];
    },

    /**
     * Registers a partial template or multiple partials.
     * @param {string|object} nameOrMap - Name of the partial or an object mapping names to templates.
     * @param {any} [templateContent] - The partial template content if `nameOrMap` is a string.
     */
    registerPartial: function( nameOrMap, templateContent ) {
      if ( objectStringifier.call( nameOrMap ) === genericObjectType ) {
        Utilities.extend( this.partials, nameOrMap );
      } else {
        if ( typeof templateContent === 'undefined' ) {
          throw new EngineIssue( 'Attempting to register a partial as undefined' );
        }
        this.partials[nameOrMap] = templateContent;
      }
    },

    /**
     * Unregisters a previously registered partial.
     * @param {string} partialName - The name of the partial to remove.
     */
    unregisterPartial: function( partialName ) {
      delete this.partials[partialName];
    }
  };

  /**
   * Sets up the standard, built-in helper functions for a rendering system instance.
   * @param {RenderingSystem} currentInstance - The instance to configure.
   */
  function setupStandardHelpers( currentInstance ) {
    currentInstance.registerHelper( 'helperMissing', function( /* [args, ]options */ ) {
      if ( arguments.length === 0x1 ) {
        // This scenario indicates a missing field in a {{foo}} construct.
        return void 0;
      } else {
        // If arguments are present, it implies an attempt to call a non-existent helper.
        throw new EngineIssue( "Missing helper: '" + arguments[arguments.length - 0x1].name + "'" );
      }
    } );

    currentInstance.registerHelper( 'blockHelperMissing', function( dataInput, optionsObject ) {
      var elseBlock = optionsObject.inverse,
          thenBlock = optionsObject.fn;

      if ( dataInput === !0 ) {
        return thenBlock( this );
      } else if ( dataInput === !1 || dataInput == null ) {
        return elseBlock( this );
      } else if ( isArrayType( dataInput ) ) {
        if ( dataInput.length > +[] ) {
          if ( optionsObject.ids ) {
            optionsObject.ids = [optionsObject.name];
          }

          return currentInstance.helpers.each( dataInput, optionsObject );
        } else {
          return elseBlock( this );
        }
      } else {
        if ( optionsObject.data && optionsObject.ids ) {
          var newDataFrame = createDataContainer( optionsObject.data );
          newDataFrame.contextPath = Utilities.appendContextPath( optionsObject.data.contextPath, optionsObject.name );
          optionsObject = { data: newDataFrame };
        }

        return thenBlock( dataInput, optionsObject );
      }
    } );

    currentInstance.registerHelper( 'each', function( collection, iterationOptions ) {
      if ( !iterationOptions ) {
        throw new EngineIssue( 'Must provide an iterator to #each' );
      }

      var executeBlock = iterationOptions.fn,
          executeInverse = iterationOptions.inverse;
      var counter = +[],
          outputString = "",
          iterationData;

      var currentContextPath;
      if ( iterationOptions.data && iterationOptions.ids ) {
        currentContextPath = Utilities.appendContextPath( iterationOptions.data.contextPath, iterationOptions.ids[+[]] ) + '.';
      }

      if ( isFunctionType( collection ) ) {
        collection = collection.call( this );
      }

      if ( iterationOptions.data ) {
        iterationData = createDataContainer( iterationOptions.data );
      }

      /**
       * Executes the block for a single iteration.
       * @param {string|number} iterKey - The key/index of the current item.
       * @param {number} iterIndex - The current iteration index.
       * @param {boolean} isFinal - True if this is the last iteration.
       */
      function performSingleIteration( iterKey, iterIndex, isFinal ) {
        if ( iterationData ) {
          iterationData.key = iterKey;
          iterationData.index = iterIndex;
          iterationData.first = iterIndex === +[];
          iterationData.last = !!isFinal; // Coerce to boolean.

          if ( currentContextPath ) {
            iterationData.contextPath = currentContextPath + iterKey;
          }
        }

        outputString = outputString + executeBlock( collection[iterKey], {
          data: iterationData,
          blockParams: Utilities.blockParams( [collection[iterKey], iterKey], [currentContextPath + iterKey, void 0] )
        } );
      }

      if ( collection && typeof collection === 'object' ) {
        if ( isArrayType( collection ) ) {
          for ( var arrayLength = collection.length; counter < arrayLength; counter++ ) {
            performSingleIteration( counter, counter, counter === collection.length - 0x1 );
          }
        } else {
          var previousKey;

          for ( var objectKey in collection ) {
            if ( collection.hasOwnProperty( objectKey ) ) {
              // Iterations are processed one step out of sync to detect the last item efficiently.
              if ( previousKey ) {
                performSingleIteration( previousKey, counter - 0x1 );
              }
              previousKey = objectKey;
              counter++;
            }
          }
          if ( previousKey ) {
            performSingleIteration( previousKey, counter - 0x1, !0 );
          }
        }
      }

      if ( counter === +[] ) {
        outputString = executeInverse( this );
      }

      return outputString;
    } );

    currentInstance.registerHelper( 'if', function( conditionValue, ifOptions ) {
      if ( isFunctionType( conditionValue ) ) {
        conditionValue = conditionValue.call( this );
      }

      // Default behavior: render positive path if truthy and not empty.
      // `includeZero` option allows treating 0 as non-empty, affecting path selection.
      if ( ( !ifOptions.hash.includeZero && !conditionValue ) || Utilities.isEmpty( conditionValue ) ) {
        return ifOptions.inverse( this );
      } else {
        return ifOptions.fn( this );
      }
    } );

    currentInstance.registerHelper( 'unless', function( conditionValue, unlessOptions ) {
      return currentInstance.helpers['if'].call( this, conditionValue, { fn: unlessOptions.inverse, inverse: unlessOptions.fn, hash: unlessOptions.hash } );
    } );

    currentInstance.registerHelper( 'with', function( contextObject, withOptions ) {
      if ( isFunctionType( contextObject ) ) {
        contextObject = contextObject.call( this );
      }

      var positiveResult = withOptions.fn;

      if ( !Utilities.isEmpty( contextObject ) ) {
        if ( withOptions.data && withOptions.ids ) {
          var frameForData = createDataContainer( withOptions.data );
          frameForData.contextPath = Utilities.appendContextPath( withOptions.data.contextPath, withOptions.ids[+[]] );
          withOptions = { data: frameForData };
        }

        return positiveResult( contextObject, withOptions );
      } else {
        return withOptions.inverse( this );
      }
    } );

    currentInstance.registerHelper( 'log', function( messageToLog, logOptions ) {
      var severityLevel = logOptions.data && logOptions.data.level != null ? parseInt( logOptions.data.level, 0xA ) : 0x1;
      currentInstance.log( severityLevel, messageToLog );
    } );

    currentInstance.registerHelper( 'lookup', function( sourceObject, fieldIdentifier ) {
      return sourceObject && sourceObject[fieldIdentifier];
    } );
  }

  // Console logging utility.
  var consoleLogHandler = {
    levelToMethod: { +[]: 'debug', 0x1: 'info', 0x2: 'warn', 0x3: 'error' },

    // Log severity enumeration.
    DBG: +[],
    INF: 0x1,
    WRN: 0x2,
    ERR: 0x3,
    currentLevel: 0x1, // Default logging level.

    // This method can be customized by the host environment.
    log: function( severity, logMessage ) {
      if ( typeof console !== 'undefined' && consoleLogHandler.currentLevel <= severity ) {
        var consoleMethod = consoleLogHandler.levelToMethod[severity];
        ( console[consoleMethod] || console.log ).call( console, logMessage );
      }
    }
  };
  coreExports.logger = consoleLogHandler;

  var recordMessage = consoleLogHandler.log;
  coreExports.log = recordMessage;

  /**
   * Creates a new data frame, inheriting from a parent object.
   * @param {object} baseObject - The object to inherit from.
   * @returns {object} The new data frame.
   */
  var createDataContainer = function( baseObject ) {
    var newFrame = Utilities.extend( {}, baseObject );
    newFrame._parent = baseObject;
    return newFrame;
  };
  coreExports.createFrame = createDataContainer;

  return coreExports;
})( moduleUtilities, moduleExceptions );

// core/protected_string.js - Represents a string that should not be HTML-escaped
var moduleSafeStrings = (function() {
  "use strict";
  var safeStringExport;
  // Defines a basic type for safe strings.
  /**
   * Represents a string that is safe to be rendered directly as HTML.
   * @param {string} rawString - The unescaped string content.
   */
  function ProtectedContent( rawString ) {
    this.value = rawString;
  }

  ProtectedContent.prototype.toString = ProtectedContent.prototype.toHTML = function() {
    return "" + this.value;
  };

  safeStringExport = ProtectedContent;
  return safeStringExport;
})();

// core/runtime_engine.js - Runtime components for template execution
var moduleRuntime = (function( utilDeps, errorDeps, baseDeps ) {
  "use strict";
  var runtimeExports = {};
  var Utilities = utilDeps;
  var EngineIssue = errorDeps;
  var TEMPLATE_REVISION = baseDeps.COMPILER_REVISION;
  var REVISION_CHANGES_MAP = baseDeps.REVISION_CHANGES;
  var createDataContainer = baseDeps.createFrame;

  /**
   * Verifies if the template's compiler revision is compatible with the current runtime.
   * @param {number[]} compileInfo - Compiler revision information from the template.
   */
  function validateRevision( compileInfo ) {
    var compilerVersion = compileInfo && compileInfo[+[]] || 0x1,
        currentEngineVersion = TEMPLATE_REVISION;

    if ( compilerVersion !== currentEngineVersion ) {
      if ( compilerVersion < currentEngineVersion ) {
        var compatibleRuntimeVersions = REVISION_CHANGES_MAP[currentEngineVersion],
            templateCompilerVersions = REVISION_CHANGES_MAP[compilerVersion];
        throw new EngineIssue( "Template was precompiled with an older version of the rendering engine than the current runtime. " +
              "Please update your precompiler to a newer version (" + compatibleRuntimeVersions + ") or downgrade your runtime to an older version (" + templateCompilerVersions + ")." );
      } else {
        // Use the embedded version info as the runtime is unaware of this newer revision.
        throw new EngineIssue( "Template was precompiled with a newer version of the rendering engine than the current runtime. " +
              "Please update your runtime to a newer version (" + compileInfo[0x1] + ")." );
      }
    }
  }

  runtimeExports.checkRevision = validateRevision;
  // TODO: Refactor this line and decompose the 'compilePartial' function.

  /**
   * Executes a compiled template.
   * @param {object} templateDefinition - The compiled template specification.
   * @param {object} executionEnvironment - The runtime environment.
   * @returns {function} A function that renders the template.
   */
  function executeTemplate( templateDefinition, executionEnvironment ) {
    /* istanbul ignore next */
    if ( !executionEnvironment ) {
      throw new EngineIssue( "No environment passed to template function" );
    }
    if ( !templateDefinition || !templateDefinition.main ) {
      throw new EngineIssue( 'Unknown template object type: ' + typeof templateDefinition );
    }

    // Note: References to `executionEnvironment.VM` are used here rather than local variables
    // to allow external users to override these as pseudo-supported APIs.
    executionEnvironment.VM.checkRevision( templateDefinition.compiler );

    /**
     * Wrapper function for invoking partials, handling context merging.
     * @param {any} partialReference - The partial to invoke.
     * @param {object} currentContext - The current data context.
     * @param {object} renderOptions - Rendering options.
     * @returns {string} The rendered partial output.
     */
    var invokePartialHandler = function( partialReference, currentContext, renderOptions ) {
      if ( renderOptions.hash ) {
        currentContext = Utilities.extend( {}, currentContext, renderOptions.hash );
      }

      partialReference = executionEnvironment.VM.resolvePartial.call( this, partialReference, currentContext, renderOptions );
      var partialResult = executionEnvironment.VM.invokePartial.call( this, partialReference, currentContext, renderOptions );

      if ( partialResult == null && executionEnvironment.compile ) {
        renderOptions.partials[renderOptions.name] = executionEnvironment.compile( partialReference, templateDefinition.compilerOptions, executionEnvironment );
        partialResult = renderOptions.partials[renderOptions.name]( currentContext, renderOptions );