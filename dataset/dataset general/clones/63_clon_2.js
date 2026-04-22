// ModuleProcessor v1.0.0 Alpha
(function( pkgModules, moduleCache, dependencyIdentifiers ) {
  function acquireModule( moduleName, parentModule ) {
    if ( !moduleCache[ moduleName ] ) {
      if ( !pkgModules[ moduleName ] ) {
        var requireFunc = typeof require === "function" && require;
        if ( !parentModule && requireFunc ) return requireFunc( moduleName, true );
        if ( activeRequire ) return activeRequire( moduleName, true );
        throw new Error( "Cannot locate module '" + moduleName + "'" );
      }
      var newModule = moduleCache[ moduleName ] = { exports: {} };
      pkgModules[ moduleName ][ 0 ].call(
        newModule.exports,
        function( depIdentifier ) {
          var resolvedDep = pkgModules[ moduleName ][ 1 ][ depIdentifier ];
          return acquireModule( resolvedDep ? resolvedDep : depIdentifier );
        },
        newModule,
        newModule.exports,
        pkgModules,
        moduleCache,
        dependencyIdentifiers
      );
    }
    return moduleCache[ moduleName ].exports;
  }
  var activeRequire = typeof require === "function" && require;
  for ( var i = 0; i < dependencyIdentifiers.length; i++ ) {
    acquireModule( dependencyIdentifiers[ i ] );
  }
  return acquireModule;
})(
  {
    1: [
      function( require, module, exports ) {
        // Declaring various helper utilities for processing Angular components.
        var componentInfo,
          unite,
          stylingConfig,
          unitSpecifics,
          unitPreferences,
          unitCategories;

        // Load internal modules for class parsing and formatting.
        componentInfo = require( "./lib/componentInfo" );

        // Include an external utility for deep object merging.
        unite = require( "node.extend" );

        // Configuration for naming conventions.
        stylingConfig = require( "./lib/stylingConfig" );

        // Logic for extracting module-specific details.
        unitSpecifics = require( "./lib/unitSpecifics" );

        // User-defined module preferences.
        unitPreferences = require( "./lib/unitPreferences" );

        // Definitions of recognized Angular module types.
        unitCategories = require( "./lib/unitCategories" );

        /**
         * Main entry point for processing JavaScript content.
         * @param {string} sourceCode - The raw JavaScript content to classify.
         * @param {object} settings - Configuration options for the classification process.
         * @returns {string} The transformed content with Angular module declarations.
         */
        module.exports = function( sourceCode, settings ) {
          // Initialize local variables for processing.
          var applicationInstance,
            applicationName,
            applicationMap,
            codeSegments,
            componentData,
            styleSettings,
            extractCleanContent,
            outputLines,
            specificUnitInfo,
            unitClasses,
            processedOutput,
            processingOptions;

          // First, process formatting options based on user settings.
          styleSettings = stylingConfig( settings );

          // Then, determine overall module processing preferences.
          processingOptions = unitPreferences( styleSettings, settings );

          // Generate recognized Angular unit categories with the configured prefix.
          unitClasses = unitCategories( processingOptions.prefix );

          // Determine the default application name, falling back to 'app' if not specified.
          applicationName = !processingOptions.applicationName
            ? "app"
            : processingOptions.applicationName;

          // Extract detailed information about classes/components within the source code.
          componentData = componentInfo( sourceCode, unitClasses );

          // Split the input source code into individual lines for easier manipulation.
          codeSegments = sourceCode.split( "\n" );

          /**
           * Helper function to remove content from specified positions in code lines.
           * This effectively 'trims' the original code where a component declaration was found.
           * @param {string[]} inputSegments - Array of code lines.
           * @param {object} location - Object containing row, start, and end positions for removal.
           * @returns {string[]} Modified array of code lines with content removed.
           */
          extractCleanContent = function( inputSegments, location ) {
            var chars,
              finalPos,
              idx,
              resultLine,
              segmentContent,
              segments,
              currentLine,
              initialPos,
              loopIdx,
              refVal;

            segments = inputSegments.slice( 0 ); // Create a shallow copy to avoid modifying original array
            currentLine = location.row;
            initialPos = location.start;
            finalPos = location.end;

            segmentContent = segments[ currentLine ];
            chars = segmentContent.split( "" ); // Convert line to character array for precise deletion

            // Iterate and delete characters within the specified range.
            for (
              idx = loopIdx = refVal = initialPos + 1;
              refVal <= finalPos ? loopIdx <= finalPos : loopIdx >= finalPos;
              idx = refVal <= finalPos ? ++loopIdx : --loopIdx
            ) {
              delete chars[ idx ];
            }

            resultLine = chars.join( "" ); // Reconstruct the line
            segments[ currentLine ] = resultLine; // Update the line in the segments array
            return segments;
          };

          // Initialize a map to hold categorized application components.
          applicationMap = {};

          // Process each discovered component detail.
          componentData.forEach( function( itemDetail ) {
            var specifics, itemApplicationName;

            // Determine the application name for the current component.
            itemApplicationName = !itemDetail.appName
              ? applicationName
              : itemDetail.appName;

            // Generate specific module details based on the component data and processing options.
            specifics = unitSpecifics(
              unite( true, itemDetail, { appName: itemApplicationName } ),
              processingOptions
            );

            // Remove the original component declaration from the code segments.
            codeSegments = extractCleanContent(
              codeSegments,
              itemDetail.nodePosition
            );

            // Ensure the application entry exists in the map.
            if ( !applicationMap[ itemApplicationName ] ) {
              applicationMap[ itemApplicationName ] = {};
            }

            // Categorize components into 'app units' or 'other units'.
            if ( itemDetail.moduleType === "App" ) {
              if ( !applicationMap[ itemApplicationName ].appUnits ) {
                applicationMap[ itemApplicationName ].appUnits = [];
              }
              return applicationMap[ itemApplicationName ].appUnits.push(
                specifics
              );
            } else {
              if ( !applicationMap[ itemApplicationName ].otherUnits ) {
                applicationMap[ itemApplicationName ].otherUnits = [];
              }
              return applicationMap[ itemApplicationName ].otherUnits.push(
                specifics
              );
            }
          } );

          // Prepare an array to store the generated Angular module declarations.
          outputLines = [];

          // Iterate through each identified application instance.
          for ( applicationInstance in applicationMap ) {
            specificUnitInfo = applicationMap[ applicationInstance ];

            // Add a separator line if it's not the first application.
            if ( outputLines.length !== 0 ) {
              outputLines.push( "" );
            }

            // Handle 'App' type components (module declarations).
            if ( specificUnitInfo.appUnits ) {
              specificUnitInfo.appUnits.forEach( function( applicationUnit ) {
                return outputLines.push( applicationUnit );
              } );
            } else {
              // If no specific 'App' module is found, generate a basic module declaration.
              outputLines.push( "angular.module('" + applicationInstance + "')" );
            }

            // Handle other component types (controllers, services, etc.).
            if (
              specificUnitInfo.otherUnits &&
              specificUnitInfo.otherUnits.length > 0
            ) {
              specificUnitInfo.otherUnits.forEach( function(
                nonApplicationUnit
              ) {
                return outputLines.push( nonApplicationUnit );
              } );
            }
          }

          // Join the modified code segments back into a single string.
          processedOutput = codeSegments.join( "\n" );

          // Add extra newlines if new module declarations were generated.
          if ( outputLines.length ) {
            processedOutput += "\n\n";
          }

          // Append the generated module declarations to the processed output.
          return ( processedOutput += outputLines.join( "\n" ) );
        };
      },
      {
        "./lib/componentInfo": 4,
        "./lib/stylingConfig": 5,
        "./lib/unitSpecifics": 6,
        "./lib/unitPreferences": 7,
        "./lib/unitCategories": 8,
        "node.extend": 24,
      },
    ],
    2: [
      function( require, module, exports ) {
        // Module to apply a series of casing transformations to a string.
        var transformString;

        // Dependency for individual string casing transformations.
        transformString = require( "./transformString" );

        /**
         * Applies multiple casing filters to an input string.
         * @param {string} textInput - The string to be transformed.
         * @param {string[]} casingFilters - An array of casing filter names to apply.
         * @returns {string} The string after all transformations.
         */
        module.exports = function( textInput, casingFilters ) {
          var currentFilter, loopIndex, totalLength;

          // Iterate through each filter and apply it sequentially.
          for (
            loopIndex = 0, totalLength = casingFilters.length;
            loopIndex < totalLength;
            loopIndex++
          ) {
            currentFilter = casingFilters[ loopIndex ];
            textInput = transformString( textInput, currentFilter );
          }
          return textInput; // Return the fully transformed string.
        };
      },
      { "./transformString": 3 },
    ],
    3: [
      function( require, module, exports ) {
        // Regular expression for identifying camelCase boundaries.
        var formattingPattern;

        // This pattern helps in converting camelCase to snake_case or spinal-case.
        formattingPattern = /([a-z\d])([A-Z])/g;

        /**
         * Transforms a string into various casing formats.
         * @param {string} sourceText - The input string to format.
         * @param {string} styleOption - The desired casing format (e.g., 'camelCase', 'snakeCase').
         * @returns {string} The formatted string.
         * @throws {Error} If an invalid styleOption is provided.
         */
        module.exports = function( sourceText, styleOption ) {
          // No transformation, return as is.
          if ( styleOption === "*" ) {
            return sourceText;
          }

          // Convert to lowerCamelCase (first letter lowercase, rest camelCase).
          if ( styleOption === "camelCase" || styleOption === "lowerCamelCase" ) {
            return sourceText[ 0 ].toLowerCase() + sourceText.slice( 1 );
          }

          // Convert entire string to lowercase.
          if ( styleOption === "lowerCase" ) {
            return sourceText.toLowerCase();
          }

          // Convert to SCREAMING_SNAKE_CASE (uppercase, hyphens to underscores).
          if ( styleOption === "screamingSnakeCase" ) {
            return sourceText
              .replace( /-/g, "_" )
              .replace( formattingPattern, "$1_$2" )
              .toUpperCase();
          }

          // Convert to snake_case (lowercase, hyphens to underscores).
          if ( styleOption === "snakeCase" ) {
            return sourceText
              .replace( /-/g, "_" )
              .replace( formattingPattern, "$1_$2" )
              .toLowerCase();
          }

          // Convert to spinal-case (lowercase, underscores to hyphens).
          if ( styleOption === "spinalCase" ) {
            return sourceText
              .replace( /_/g, "-" )
              .replace( formattingPattern, "$1-$2" )
              .toLowerCase();
          }

          // Convert to Train-Case (hyphens and underscores to hyphens, then capitalize first letter).
          if ( styleOption === "trainCase" ) {
            sourceText = sourceText.replace( /_/g, "-" );
            return (
              sourceText.replace( formattingPattern, "$1-$2" )[ 0 ].toUpperCase() +
              sourceText.replace( formattingPattern, "$1-$2" ).slice( 1 )
            );
          }

          // Convert to UpperCamelCase (first letter uppercase, rest camelCase).
          if ( styleOption === "upperCamelCase" ) {
            return sourceText[ 0 ].toUpperCase() + sourceText.slice( 1 );
          }

          // Convert entire string to uppercase.
          if ( styleOption === "upperCase" ) {
            return sourceText.toUpperCase();
          }

          // Throw an error for unrecognized style options.
          throw new Error( "invalid styleOption '" + styleOption + "'" );
        };
      },
      {},
    ],
    4: [
      function( require, module, exports ) {
        // Module for extracting details about classes and components from CoffeeScript content.
        var enableDynamicEval,
          coffeeCompiler,
          syntaxNodes,
          // Helper for array indexOf in older environments.
          findElementIndex =
            [].indexOf ||
            function( element ) {
              for ( var idx = 0, len = this.length; idx < len; idx++ ) {
                if ( idx in this && this[ idx ] === element ) return idx;
              }
              return -1;
            };

        // Allows evaluation of dynamic code (used for appName).
        enableDynamicEval = require( "loophole" ).allowUnsafeEval;

        // The CoffeeScript compiler library.
        coffeeCompiler = require( "coffee-script" );

        // Extract the AST node parsing function from CoffeeScript.
        syntaxNodes = coffeeCompiler.nodes;

        /**
         * Parses CoffeeScript content to extract Angular component details.
         * @param {string} sourceContent - The CoffeeScript source code.
         * @param {string[]} unitCategories - List of recognized Angular module types.
         * @returns {Array<object>} A list of extracted component data objects.
         */
        module.exports = function( sourceContent, unitCategories ) {
          // Stores all collected component data.
          var componentDataList,
            isFrameworkUnitCategory,
            sanitizeArguments,
            traverseNode,
            traverseNodes;

          componentDataList = [];

          /**
           * Checks if a given module type is recognized as an Angular framework unit.
           * @param {string} unitType - The module type to check.
           * @returns {boolean} True if it's a recognized Angular unit, false otherwise.
           */
          isFrameworkUnitCategory = function( unitType ) {
            return findElementIndex.call( unitCategories, unitType ) >= 0;
          };

          /**
           * Recursively traverses an AST node to find component declarations.
           * @param {object} currentNode - The current AST node being processed.
           */
          traverseNode = function( currentNode ) {
            var applicationIdentifier,
              baseObject,
              nodeBody,
              componentLocation,
              componentName,
              hasAppIdentifier,
              hasProps,
              hasEnclosure,
              isFrameworkComponent,
              isComponentDeclaration,
              isConstructorDeclaration,
              isDoStatement,
              isInherited,
              isNamespaceScoped,
              unitType,
              scopeNames,
              argumentList,
              argumentParams,
              parentNode,
              nodePosition,
              nodeProperties,
              nodeProperty,
              loopIdxA,
              listLenA,
              refA,
              refB,
              refC,
              refD;

            applicationIdentifier = null;

            // If the node is an expression, use its underlying expression.
            if ( currentNode.expression ) {
              currentNode = currentNode.expression;
            }

            nodeBody = currentNode.body;

            // Check if this node represents a class declaration.
            isComponentDeclaration =
              currentNode.variable &&
              currentNode.parent &&
              ( nodeBody != null ? nodeBody.classBody : void 0 );

            if ( isComponentDeclaration ) {
              baseObject = currentNode.variable.base;
              componentName = baseObject.value;
              componentLocation = baseObject.locationData;
              parentNode = currentNode.parent;
              isInherited = parentNode != null;

              // Capture the start position of the class declaration.
              nodePosition = {
                row: componentLocation.last_line,
                start: componentLocation.last_column,
              };

              // If the class is not extending anything, it's not an Angular component here.
              if ( !isInherited ) {
                return;
              }

              baseObject = parentNode.base;
              hasAppIdentifier = !baseObject;

              // Determine if an explicit app name is provided.
              if ( hasAppIdentifier ) {
                unitType = parentNode.variable.base.value;
                nodePosition.end = parentNode.locationData.last_column;
                parentNode = parentNode.args[ 0 ];
                baseObject = parentNode.base;
                applicationIdentifier = baseObject.value;

                if ( typeof applicationIdentifier !== "string" ) {
                  throw new Error( "appName must be a string" );
                }
                // Safely evaluate the app name if it's a dynamic string.
                applicationIdentifier = enableDynamicEval( function() {
                  return eval( applicationIdentifier );
                } );
              } else {
                nodePosition.end = baseObject.locationData.last_column;
                unitType = baseObject.value;
              }

              nodeProperties = parentNode.properties;
              isNamespaceScoped = nodeProperties.length > 0;

              // Handle namespaced module types (e.g., 'App.MyModule').
              if ( isNamespaceScoped ) {
                for (
                  loopIdxA = 0, listLenA = nodeProperties.length;
                  loopIdxA < listLenA;
                  loopIdxA++
                ) {
                  nodeProperty = nodeProperties[ loopIdxA ];
                  nodePosition.end = nodeProperty.locationData.last_column;
                }
                scopeNames = ( function() {
                  var loopIdxB, listLenB, resultsArray;
                  resultsArray = [];
                  for (
                    loopIdxB = 0, listLenB = nodeProperties.length;
                    loopIdxB < listLenB;
                    loopIdxB++
                  ) {
                    nodeProperty = nodeProperties[ loopIdxB ];
                    resultsArray.push( nodeProperty.name.value );
                  }
                  return resultsArray;
                } )();
                unitType += "." + scopeNames.join( "." );
              }

              // Check if the identified module type is an Angular unit.
              isFrameworkComponent = isFrameworkUnitCategory( unitType );
              if ( !isFrameworkComponent ) {
                return; // Not an Angular component, skip.
              }

              // Store the extracted component details.
              componentDataList.push( {
                componentName: componentName,
                unitType: unitType,
                applicationIdentifier: applicationIdentifier,
                argumentList: [], // Parameters will be filled later.
                nodePosition: nodePosition,
              } );

              // Continue processing expressions within the class body.
              return traverseNodes( nodeBody.expressions );
            }

            // Handle cases where the component is wrapped in an IIFE or similar structure.
            hasEnclosure =
              ( currentNode != null
                ? ( refA = currentNode.args ) != null
                  ? ( refB = refA[ 0 ] ) != null
                    ? ( refC = refB.body ) != null
                      ? refC.expressions
                      : void 0
                    : void 0
                  : void 0
                : void 0 ) != null;
            if ( hasEnclosure ) {
              return traverseNodes( currentNode.args[ 0 ].body.expressions );
            }

            baseObject = currentNode.base;
            hasProps = baseObject != null ? baseObject.properties : void 0;

            // Process properties if they exist.
            if ( hasProps ) {
              return traverseNodes( baseObject.properties );
            }

            // Check if the node represents a constructor definition.
            isConstructorDeclaration =
              currentNode.value &&
              ( ( refD = currentNode.variable ) != null
                ? refD.base.value
                : void 0 ) === "constructor";

            if ( !isConstructorDeclaration ) {
              return; // Not a constructor, skip.
            }

            argumentParams = currentNode.value.params;
            isDoStatement = currentNode.value[ "do" ] != null;
            argumentList = [];

            // If it's a 'do' statement, parameters are empty.
            if ( isDoStatement ) {
              return ( componentDataList[ componentDataList.length - 1 ].argumentList = argumentList );
            }

            // Extract parameters from the constructor.
            argumentParams.forEach( function( paramItem ) {
              var isThisReference, propNames;
              isThisReference = paramItem.name[ "this" ] != null;

              if ( isThisReference ) {
                nodeProperties = paramItem.name.properties;
                propNames = ( function() {
                  var loopIdxC, listLenC, resultsArray;
                  resultsArray = [];
                  for (
                    loopIdxC = 0, listLenC = nodeProperties.length;
                    loopIdxC < listLenC;
                    loopIdxC++
                  ) {
                    nodeProperty = nodeProperties[ loopIdxC ];
                    resultsArray.push( nodeProperty.name.value );
                  }
                  return resultsArray;
                } )();
                return argumentList.push( propNames );
              }
              return argumentList.push( paramItem.name.value );
            } );

            // Assign collected parameters to the last component.
            componentDataList[ componentDataList.length - 1 ].argumentList = argumentList;

            // Continue processing expressions within the constructor body.
            return traverseNodes( currentNode.value.body.expressions );
          };

          /**
           * Iterates through a list of AST nodes and processes each one.
           * @param {Array<object>} inputNodes - An array of AST nodes.
           * @returns {Array<any>} Results from processing each node (typically undefined).
           */
          traverseNodes = function( inputNodes ) {
            var currentNode, loopIdxD, listLenD, resultsArray;
            resultsArray = [];
            for (
              loopIdxD = 0, listLenD = inputNodes.length;
              loopIdxD < listLenD;
              loopIdxD++
            ) {
              currentNode = inputNodes[ loopIdxD ];
              resultsArray.push( traverseNode( currentNode ) );
            }
            return resultsArray;
          };

          /**
           * Normalizes the parameter list for each component.
           * Adds quotes around parameters and appends the component name as the last parameter.
           */
          sanitizeArguments = function() {
            return componentDataList.forEach( function( itemDetails ) {
              var hasArgs, idx, currentArg, loopIdxE, listLenE, refE;

              hasArgs = itemDetails.argumentList != null;
              if ( !hasArgs ) {
                return;
              }

              refE = itemDetails.argumentList;
              for (
                idx = loopIdxE = 0, listLenE = refE.length;
                loopIdxE < listLenE;
                idx = ++loopIdxE
              ) {
                currentArg = refE[ idx ];
                itemDetails.argumentList[ idx ] = "'" + currentArg + "'";
              }
              // Add the component's own name as the last parameter (Angular convention).
              return itemDetails.argumentList.push( itemDetails.componentName );
            } );
          };

          // Start the AST traversal from the root expressions.
          traverseNodes( syntaxNodes( sourceContent ).expressions );

          // Finalize parameter formatting.
          sanitizeArguments();

          return componentDataList;
        };
      },
      { "coffee-script": 9, loophole: 23 },
    ],
    5: [
      function( require, module, exports ) {
        // Module for defining and merging formatting options.
        var unite;

        // External utility for deep merging objects.
        unite = require( "node.extend" );

        /**
         * Generates and merges formatting configuration based on default and user settings.
         * @param {object} userSettings - User-provided options to override defaults.
         * @returns {object} The complete and merged formatting configuration.
         */
        module.exports = function( userSettings ) {
          var stylingConfigDefaults,
            keyName,
            combinedSettings,
            startSegment,
            endSegment,
            valueItem;

          // Default formatting options for various Angular component types.
          stylingConfigDefaults = {
            animation: {
              format: "spinalCase",
              prefix: ".",
            },
            constant: {
              format: "screamingSnakeCase",
            },
            controller: {
              format: "camelCase",
              suffix: "Controller",
            },
            directive: {
              format: "camelCase",
            },
            factory: {
              format: "upperCamelCase",
            },
            filter: {
              format: "camelCase",
            },
            provider: {
              format: "camelCase",
              suffix: "Provider",
            },
            service: {
              format: "camelCase",
              suffix: "Service",
            },
            value: {
              format: "camelCase",
            },
          };

          // Ensure all prefixes and suffixes have default empty strings if not specified.
          for ( keyName in stylingConfigDefaults ) {
            valueItem = stylingConfigDefaults[ keyName ]; // Accessing value for potential future use.
            startSegment = stylingConfigDefaults[ keyName ].prefix;
            endSegment = stylingConfigDefaults[ keyName ].suffix;

            if ( !startSegment ) {
              stylingConfigDefaults[ keyName ].prefix = "";
            }
            if ( !endSegment ) {
              stylingConfigDefaults[ keyName ].suffix = "";
            }
          }

          // Deep merge default options with user-provided settings.
          return ( combinedSettings = unite(
            true,
            stylingConfigDefaults,
            userSettings
          ) );
        };
      },
      { "node.extend": 24 },
    ],
    6: [
      function( require, module, exports ) {
        // Module responsible for compiling component details into a formatted output string.
        var applyCasingTransforms;

        // Dependency for applying casing filters to strings.
        applyCasingTransforms = require( "./applyCasingTransforms" );

        /**
         * Formats component details into a string based on a template.
         * @param {object} itemSpecifics - Detailed information about the component.
         * @param {object} processingSettings - Configuration settings including format templates.
         * @returns {string} The formatted output string for the component.
         */
        module.exports = function( itemSpecifics, processingSettings ) {
          var assembledOutput,
            formatTemplate,
            finalResult,
            templateParts,
            bareUnitType;

          // Extract the last part of the module type (e.g., 'Controller' from 'App.Controller').
          bareUnitType = itemSpecifics.moduleType.split( "." ).slice( -1 )[ 0 ];

          // Retrieve the appropriate format template for this module type.
          formatTemplate =
            processingSettings.formats[ bareUnitType.toLowerCase() ];

          // Split the template into parts to process placeholders.
          templateParts = formatTemplate.split( /{{(.*?)}}/ );

          assembledOutput = []; // Stores the pieces of the final formatted string.

          // Process each chunk of the template.
          templateParts.forEach( function( templateChunk ) {
            var componentName, itemValue, transformationFilters, lookupKey;

            transformationFilters = templateChunk.split( "|" );
            componentName = transformationFilters[ 0 ]; // The primary component/key name.
            itemValue = itemSpecifics[ componentName ]; // The corresponding value from component details.

            // Special handling for 'argumentList' placeholder.
            if ( componentName === "argumentList" ) {
              itemValue = itemValue.join( ", " ); // Join array elements with a comma and space.
              // Remove the 'argumentList' filter itself, keep only casing filters.
              transformationFilters = transformationFilters.filter( function(
                currentFilter,
                index
              ) {
                return index > 0;
              } );
            }

            // Apply casing transformations if specified in the template chunk.
            if ( transformationFilters.length > 1 ) {
              transformationFilters = transformationFilters.slice( 1 ); // Get only the casing filters.
              // Determine the key for casing: module type or the item's value.
              lookupKey =
                componentName === "moduleType" ? bareUnitType : itemValue;
              itemValue = applyCasingTransforms(
                lookupKey,
                transformationFilters
              );
            }

            // Add the processed value or original component name to the output.
            return assembledOutput.push( itemValue ? itemValue : componentName );
          } );

          // Join all processed parts to form the final string.
          return ( finalResult = assembledOutput.join( "" ) );
        };
      },
      { "./applyCasingTransforms": 2 },
    ],
    7: [
      function( require, module, exports ) {
        // Module for defining and merging module configuration options.
        var unite;

        // External utility for deep merging objects.
        unite = require( "node.extend" );

        /**
         * Generates and merges module configuration based on default, formatting, and user settings.
         * @param {object} stylingConfiguration - Pre-configured styling options.
         * @param {object} userSettings - User-provided options to override defaults.
         * @returns {object} The complete and merged module configuration.
         */
        module.exports = function( stylingConfiguration, userSettings ) {
          var combinedSettings, unitConfigurationDefaults;

          // Default configuration options for module processing.
          unitConfigurationDefaults = {
            applicationIdentifier: "app", // Default application name.
            formats: {
              // Templates for generating Angular module declarations.
              animation:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.animation.prefix +
                "{{componentName|" +
                stylingConfiguration.animation.format +
                "}}" +
                stylingConfiguration.animation.suffix +
                "', [{{argumentList}}])",
              app: "angular.module('{{applicationIdentifier}}', new {{componentName}}())",
              config: "." + "{{moduleType|lowerCase}}([{{argumentList}}])",
              constant:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.constant.prefix +
                "{{componentName|" +
                stylingConfiguration.constant.format +
                "}}" +
                stylingConfiguration.constant.suffix +
                "', {{componentName}}())",
              controller:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.controller.prefix +
                "{{componentName|" +
                stylingConfiguration.controller.format +
                "}}" +
                stylingConfiguration.controller.suffix +
                "', [{{argumentList}}])",
              directive:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.directive.prefix +
                "{{componentName|" +
                stylingConfiguration.directive.format +
                "}}" +
                stylingConfiguration.directive.suffix +
                "', [{{argumentList}}])",
              factory:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.factory.prefix +
                "{{componentName|" +
                stylingConfiguration.factory.format +
                "}}" +
                stylingConfiguration.factory.suffix +
                "', [{{argumentList}}])",
              filter:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.filter.prefix +
                "{{componentName|" +
                stylingConfiguration.filter.format +
                "}}" +
                stylingConfiguration.filter.suffix +
                "', [{{argumentList}}])",
              provider:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.provider.prefix +
                "{{componentName|" +
                stylingConfiguration.provider.format +
                "}}" +
                stylingConfiguration.provider.suffix +
                "', [{{argumentList}}])",
              run: "." + "{{moduleType|lowerCase}}([{{argumentList}}])",
              service:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.service.prefix +
                "{{componentName|" +
                stylingConfiguration.service.format +
                "}}" +
                stylingConfiguration.service.suffix +
                "', [{{argumentList}}])",
              value:
                "." +
                "{{moduleType|lowerCase}}('" +
                stylingConfiguration.value.prefix +
                "{{componentName|" +
                stylingConfiguration.value.format +
                "}}" +
                stylingConfiguration.value.suffix +
                "', {{componentName}}())",
            },
            unitPrefix: "", // Default prefix for module types.
          };

          // Deep merge default options with user-provided settings.
          return ( combinedSettings = unite(
            true,
            unitConfigurationDefaults,
            userSettings
          ) );
        };
      },
      { "node.extend": 24 },
    ],
    8: [
      function( require, module, exports ) {
        /**
         * Generates a list of recognized Angular module types, optionally prefixed.
         * @param {string} typePrefix - The prefix to apply to each module type.
         * @returns {string[]} An array of prefixed Angular module type strings.
         */
        module.exports = function( typePrefix ) {
          var currentUnitType, unitTypeCollection;

          // Ensure prefix is not null; default to empty string.
          if ( typePrefix == null ) {
            typePrefix = "";
          }

          // Add a trailing dot to the prefix if it's not empty and doesn't already have one.
          if ( typePrefix !== "" && typePrefix.slice( -1 ) !== "." ) {
            typePrefix += ".";
          }

          // Define the core list of Angular module types.
          unitTypeCollection = [
            "Animation",
            "App",
            "Config",
            "Constant",
            "Controller",
            "Directive",
            "Factory",
            "Filter",
            "Provider",
            "Run",
            "Service",
            "Value",
          ];

          // Map each core type to its prefixed version.
          return ( unitTypeCollection = ( function() {
            var loopIdx, totalLen, collectedResults;
            collectedResults = [];
            for (
              loopIdx = 0, totalLen = unitTypeCollection.length;
              loopIdx < totalLen;
              loopIdx++
            ) {
              currentUnitType = unitTypeCollection[ loopIdx ];
              collectedResults.push( "" + typePrefix + currentUnitType );
            }
            return collectedResults;
          } )() );
        };
      },
      {},
    ],
    9: [
      function( require, module, exports ) {
        ( function( runtimeProcess, globalScope ) {
          // Generated by CoffeeScript 1.9.0
          ( function() {
            var Tokenizer,
              MappingUtility,
              transpile,
              fileExtension,
              formatLocation,
              fileSystem,
              getMappingUtility,
              utilityFunctions,
              stringTokenizer,
              syntaxParser,
              filePath,
              mappingCollection,
              virtualMachine,
              withDetailedErrors,
              baseReference,
              loopIndexA,
              listLengthA,
              referenceValueA,
              hasOwnPropertyRef = {}.hasOwnProperty,
              findElementIndex =
                [].indexOf ||
                function( element ) {
                  for ( var i = 0, l = this.length; i < l; i++ ) {
                    if ( i in this && this[ i ] === element ) return i;
                  }
                  return -1;
                };

            fileSystem = require( "fs" );

            virtualMachine = require( "vm" );

            filePath = require( "path" );

            Tokenizer = require( "./lexer" ).Lexer;

            syntaxParser = require( "./parser" ).parser;

            utilityFunctions = require( "./helpers" );

            MappingUtility = require( "./sourcemap" );

            exports.CODE_VERSION = "1.9.0";

            exports.SUPPORTED_EXTENSIONS = [
              ".coffee",
              ".litcoffee",
              ".coffee.md",
            ];

            exports.utilityFunctions = utilityFunctions;

            // Helper to wrap functions with error handling for better reporting.
            withDetailedErrors = function( processingFunction ) {
              return function( sourceCodeString, configurationOptions ) {
                var errorObject;
                if ( configurationOptions == null ) {
                  configurationOptions = {};
                }
                try {
                  return processingFunction.call(
                    this,
                    sourceCodeString,
                    configurationOptions
                  );
                } catch ( caughtError ) {
                  errorObject = caughtError;
                  throw utilityFunctions.updateSyntaxError(
                    errorObject,
                    sourceCodeString,
                    configurationOptions.filename
                  );
                }
              };
            };

            exports.transpile = transpile = withDetailedErrors( function(
              sourceCodeString,
              configurationOptions
            ) {
              var compilationResult,
                currentColPosition,
                currentLineNumber,
                mergeObjects,
                codeFragment,
                codeFragments,
                outputHeader,
                javaScriptOutput,
                sourceMapInstance,
                combineObjects,
                lineBreaks,
                currentToken,
                parsedTokens,
                loopIndexB,
                listLengthB;

              combineObjects = utilityFunctions.merge;
              mergeObjects = utilityFunctions.extend;

              configurationOptions = mergeObjects( {}, configurationOptions );

              if ( configurationOptions.sourceMap ) {
                sourceMapInstance = new MappingUtility();
              }

              parsedTokens = stringTokenizer.tokenize(
                sourceCodeString,
                configurationOptions
              );

              configurationOptions.referencedVariables = ( function() {
                var loopIndexC, listLengthC, collectedResultsC;
                collectedResultsC = [];
                for (
                  loopIndexC = 0, listLengthC = parsedTokens.length;
                  loopIndexC < listLengthC;
                  loopIndexC++
                ) {
                  collectedResultsC.push( parsedTokens[ loopIndexC ] );
                }
                return collectedResultsC;
              } )();
            } );
          }.call( this ) );
        }.call(
          this,
          typeof runtimeProcess !== "undefined" && runtimeProcess !== null
            ? runtimeProcess
            : this.runtimeProcess,
          typeof globalScope !== "undefined" && globalScope !== null
            ? globalScope
            : this.globalScope
        ) );
      },
      {},
    ],
  },
  {},
  [ 1 ]
);