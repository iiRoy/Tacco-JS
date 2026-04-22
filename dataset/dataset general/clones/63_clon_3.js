(function codePacker(moduleCache, moduleDefinitions, moduleLoadOrder) {
  function getModuleInstance(moduleIdentifier, requestorModule) {
    // If module is already cached, return it
    if (moduleCache[moduleIdentifier]) {
      return moduleCache[moduleIdentifier].exports;
    }

    // If module definition doesn't exist, try to resolve via standard 'require'
    if (!moduleDefinitions[moduleIdentifier]) {
      var nodeRequire = typeof require === "function" && require;
      if (!requestorModule && nodeRequire) return nodeRequire(moduleIdentifier, true);
      // Fallback for browserify-like environments
      if (typeof window !== 'undefined' && window.customRequire) return window.customRequire(moduleIdentifier, true);
      throw new Error("Cannot locate required module: '" + moduleIdentifier + "'");
    }

    // Create a new module entry in cache and execute its definition
    var newModuleEntry = moduleCache[moduleIdentifier] = { exports: {} };
    moduleDefinitions[moduleIdentifier][0].call(
      newModuleEntry.exports,
      function(requestedPath) {
        var resolvedPath = moduleDefinitions[moduleIdentifier][1][requestedPath];
        return getModuleInstance(resolvedPath ? resolvedPath : requestedPath);
      },
      newModuleEntry,
      newModuleEntry.exports,
      codePacker,
      moduleDefinitions,
      moduleCache,
      moduleLoadOrder
    );
    return newModuleEntry.exports;
  }

  // Determine global 'require' if available
  var globalNodeRequire = typeof require === "function" && require;

  // Load initial modules based on load order
  for (var k = 0; k < moduleLoadOrder.length; k++) {
    getModuleInstance(moduleLoadOrder[k]);
  }

  // Return the main entry point module
  return getModuleInstance(moduleLoadOrder[0]);
})({
  1: [
    function(dependencyResolver, currentModule, currentExports) {
      // This module orchestrates the classification and transformation of CoffeeScript content
      var classParser,
        objectExtender,
        formatConfigurator,
        entityProcessor,
        entityConfigurator,
        entityTypes;

      // Load internal utility modules
      classParser = dependencyResolver("./lib/classDetails");
      objectExtender = dependencyResolver("node.extend"); // External utility for deep merging
      formatConfigurator = dependencyResolver("./lib/formatOptions");
      entityProcessor = dependencyResolver("./lib/moduleDetails");
      entityConfigurator = dependencyResolver("./lib/moduleOptions");
      entityTypes = dependencyResolver("./lib/moduleTypes");

      currentModule.exports = function(sourceContent, processingOptions) {
        // Renamed function parameters for clarity
        var applicationScope,
          applicationNameValue,
          classifiedApplications,
          rawContentLines,
          parsedEntities,
          configurationFormat,
          getAdjustedContentArray,
          outputLinesArray,
          processedEntityDetails,
          entityTypeDefinitions,
          transformedOutput;

        // Step 1: Prepare configuration and entity types
        configurationFormat = formatConfigurator(processingOptions);
        processedEntityDetails = entityConfigurator(
          configurationFormat,
          processingOptions
        );
        entityTypeDefinitions = entityTypes(processedEntityDetails.prefix);

        // Determine the base application name
        applicationNameValue = processedEntityDetails.applicationName
          ? processedEntityDetails.applicationName
          : "mainApplication"; // Changed default name

        // Step 2: Parse the source content for class details
        parsedEntities = classParser(sourceContent, entityTypeDefinitions);

        // Split the original content into lines for manipulation
        rawContentLines = sourceContent.split("\n");

        // Helper function to remove content at specified positions
        getAdjustedContentArray = function(
          contentLinesCollection,
          contentPosition
        ) {
          var lineCollectionCopy = contentLinesCollection.slice(); // Create a shallow copy
          var targetRow = contentPosition.row;
          var startChar = contentPosition.start;
          var endChar = contentPosition.end;

          // Basic validation for position
          if (
            !lineCollectionCopy[targetRow] ||
            startChar === undefined ||
            endChar === undefined
          ) {
            console.warn(
              "Invalid position data received for content adjustment. Skipping."
            );
            return lineCollectionCopy;
          }

          var currentLineText = lineCollectionCopy[targetRow];
          var charArray = currentLineText.split("");

          // Iterate backwards to safely delete characters
          for (var idx = endChar; idx >= startChar; idx--) {
            if (charArray[idx] !== undefined) {
              charArray.splice(idx, 1); // More robust deletion than `delete characters[i]`
            }
          }

          lineCollectionCopy[targetRow] = charArray.join("");
          return lineCollectionCopy;
        };

        // Initialize object to hold classified application components
        classifiedApplications = {};

        // Step 3: Process each parsed entity
        parsedEntities.forEach(function(currentEntity) {
          var currentModuleAppIdentifier;
          // Determine the application identifier for the current module
          currentModuleAppIdentifier = currentEntity.applicationName
            ? currentEntity.applicationName
            : applicationNameValue;

          // Merge application identifier into entity details
          var extendedEntityDetails = objectExtender(true, currentEntity, {
            applicationName: currentModuleAppIdentifier,
          });

          // Process entity details according to formatting options
          var formattedEntity = entityProcessor(
            extendedEntityDetails,
            processedEntityDetails
          );

          // Update the content lines by removing the processed entity's original declaration
          rawContentLines = getAdjustedContentArray(
            rawContentLines,
            currentEntity.position
          );

          // Initialize application structure if not present
          if (!classifiedApplications[currentModuleAppIdentifier]) {
            classifiedApplications[currentModuleAppIdentifier] = {
              appBootstrapTypes: [],
              otherModuleTypes: [],
            };
          }

          // Categorize the entity based on its type
          if (currentEntity.moduleType === "App") {
            // Check if appTypes array exists, if not, create it (redundant but demonstrates Type III)
            if (
              !classifiedApplications[currentModuleAppIdentifier]
                .appBootstrapTypes
            ) {
              classifiedApplications[
                currentModuleAppIdentifier
              ].appBootstrapTypes = [];
            }
            classifiedApplications[currentModuleAppIdentifier].appBootstrapTypes.push(
              formattedEntity
            );
          } else {
            // Check if nonAppTypes array exists, if not, create it (redundant but demonstrates Type III)
            if (
              !classifiedApplications[currentModuleAppIdentifier]
                .otherModuleTypes
            ) {
              classifiedApplications[
                currentModuleAppIdentifier
              ].otherModuleTypes = [];
            }
            classifiedApplications[currentModuleAppIdentifier].otherModuleTypes.push(
              formattedEntity
            );
          }
        });

        // Step 4: Generate the output lines for classified components
        outputLinesArray = [];
        for (applicationScope in classifiedApplications) {
          var currentAppComponents = classifiedApplications[applicationScope];

          // Add an empty line between different application blocks for readability
          if (outputLinesArray.length > 0) {
            outputLinesArray.push("");
          }

          var appInitializers = currentAppComponents.appBootstrapTypes;
          var nonAppInitializers = currentAppComponents.otherModuleTypes;

          // Append application bootstrap definitions
          if (appInitializers && appInitializers.length > 0) {
            // Using a traditional for loop for variety
            for (var i = 0; i < appInitializers.length; i++) {
              outputLinesArray.push(appInitializers[i]);
            }
          } else {
            // If no explicit 'App' type, assume a basic angular module definition
            outputLinesArray.push(
              "angular.module('" + applicationScope + "')"
            );
          }

          // Append other module definitions
          if (nonAppInitializers && nonAppInitializers.length > 0) {
            nonAppInitializers.forEach(function(otherModule) {
              outputLinesArray.push(otherModule);
            });
          }
        }

        // Step 5: Combine the adjusted original content with the new classified lines
        transformedOutput = rawContentLines.join("\n");

        if (outputLinesArray.length > 0) {
          transformedOutput += "\n\n"; // Add extra newlines if there's classified output
        }

        // Final assembly and return
        transformedOutput += outputLinesArray.join("\n");
        return transformedOutput;
      };
    },
    {
      "./lib/classDetails": 4,
      "./lib/formatOptions": 5,
      "./lib/moduleDetails": 6,
      "./lib/moduleOptions": 7,
      "./lib/moduleTypes": 8,
      "node.extend": 24,
    },
  ],
  2: [
    function(dependencyResolver, currentModule, currentExports) {
      // Renamed file: `applyCaseFilters.js` -> `stringCaseTransformer.js`
      var caseConverter;

      caseConverter = dependencyResolver("./changeCase");

      currentModule.exports = function(inputString, transformationFilters) {
        var currentFilter, i, len;
        // Introduce a guard clause for empty filters
        if (!transformationFilters || transformationFilters.length === 0) {
          return inputString;
        }

        for (i = 0, len = transformationFilters.length; i < len; i++) {
          currentFilter = transformationFilters[i];
          inputString = caseConverter(inputString, currentFilter);
        }
        return inputString;
      };
    },
    { "./changeCase": 3 },
  ],
  3: [
    function(dependencyResolver, currentModule, currentExports) {
      // Renamed file: `changeCase.js` -> `caseFormatter.js`
      var caseDelimiterRegex;

      // Regex to identify transitions from lowercase/digit to uppercase
      caseDelimiterRegex = /([a-z\d])([A-Z])/g;

      currentModule.exports = function(sourceString, requestedFormat) {
        // Return original string if format is a wildcard
        if (requestedFormat === "*") {
          return sourceString;
        }

        // Handle camelCase (lowerCamelCase)
        if (
          requestedFormat === "camelCase" ||
          requestedFormat === "lowerCamelCase"
        ) {
          // Add a check for empty string
          if (!sourceString) return "";
          return sourceString.charAt(0).toLowerCase() + sourceString.substring(1);
        }

        // Handle lowerCase
        if (requestedFormat === "lowerCase") {
          return sourceString.toLowerCase();
        }

        // Handle screamingSnakeCase
        if (requestedFormat === "screamingSnakeCase") {
          return sourceString
            .replace(/-/g, "_")
            .replace(caseDelimiterRegex, "$1_$2")
            .toUpperCase();
        }

        // Handle snakeCase
        if (requestedFormat === "snakeCase") {
          return sourceString
            .replace(/-/g, "_")
            .replace(caseDelimiterRegex, "$1_$2")
            .toLowerCase();
        }

        // Handle spinalCase
        if (requestedFormat === "spinalCase") {
          return sourceString
            .replace(/_/g, "-")
            .replace(caseDelimiterRegex, "$1-$2")
            .toLowerCase();
        }

        // Handle trainCase
        if (requestedFormat === "trainCase") {
          var tempString = sourceString.replace(/_/g, "-");
          tempString = tempString.replace(caseDelimiterRegex, "$1-$2");
          // Ensure first character is uppercase
          return tempString.charAt(0).toUpperCase() + tempString.substring(1);
        }

        // Handle upperCamelCase
        if (requestedFormat === "upperCamelCase") {
          // Add a check for empty string
          if (!sourceString) return "";
          return sourceString.charAt(0).toUpperCase() + sourceString.substring(1);
        }

        // Handle upperCase
        if (requestedFormat === "upperCase") {
          return sourceString.toUpperCase();
        }

        // If no format matches, throw an error
        throw new Error("Invalid case format specified: '" + requestedFormat + "'");
      };
    },
    {},
  ],
  4: [
    function(dependencyResolver, currentModule, currentExports) {
      // Renamed file: `classDetails.js` -> `coffeeClassParser.js`
      var unsafeEvalPermitter,
        coffeeScriptCompiler,
        astNodes,
        // Helper to check array inclusion (Type III: use Array.prototype.includes if available, else fallback)
        arrayIncludes =
          Array.prototype.includes ||
          function(item) {
            for (var i = 0, l = this.length; i < l; i++) {
              if (this[i] === item) return true;
            }
            return false;
          };

      unsafeEvalPermitter = dependencyResolver("loophole").allowUnsafeEval;
      coffeeScriptCompiler = dependencyResolver("coffee-script");
      astNodes = coffeeScriptCompiler.nodes; // Renamed `nodes` to `astNodes`

      currentModule.exports = function(sourceCode, allowedModuleTypes) {
        var collectedClassData = []; // Renamed `classDetails`
        var isPermittedAngularModuleType; // Renamed `isAngularModuleType`
        var prepareParameterList; // Renamed `normalizeParameters`
        var processSingleNode; // Renamed `processNode`
        var processNodeCollection; // Renamed `processNodes`

        // Checks if a given module type is in the allowed list
        isPermittedAngularModuleType = function(candidateModuleType) {
          return arrayIncludes.call(allowedModuleTypes, candidateModuleType);
        };

        // Recursive function to traverse and process AST nodes
        processSingleNode = function(currentNode) {
          var appIdentifier = null; // Renamed `appName`
          var baseObject,
            nodeBody,
            classPosition,
            classNameValue,
            hasExplicitAppName,
            hasObjectProperties,
            hasWrappingFunction,
            isAngularEntity,
            isClassDeclaration,
            isConstructorMethod,
            isDoStatement,
            isExtendsClause,
            isNamespacedDefinition,
            namespaceSegments,
            methodParameters,
            parameterDefinitions,
            parentNode,
            nodeLocation,
            propertiesArray,
            singleProperty;

          // Normalize node if it's an expression wrapper
          if (currentNode && currentNode.expression) {
            currentNode = currentNode.expression;
          }

          nodeBody = currentNode ? currentNode.body : null;

          // Check for class declaration pattern
          isClassDeclaration =
            currentNode &&
            currentNode.variable &&
            currentNode.parent &&
            nodeBody &&
            nodeBody.classBody;

          if (isClassDeclaration) {
            baseObject = currentNode.variable.base;
            classNameValue = baseObject.value;
            classPosition = baseObject.locationData;
            parentNode = currentNode.parent;
            isExtendsClause = parentNode != null;

            nodeLocation = {
              row: classPosition.last_line,
              start: classPosition.last_column,
            };

            // If no extends clause, skip
            if (!isExtendsClause) {
              return;
            }

            // Determine if an appName is explicitly provided
            baseObject = parentNode.base; // Reassign baseObject for parent
            hasExplicitAppName = !baseObject;
            var currentModuleType;

            if (hasExplicitAppName) {
              currentModuleType = parentNode.variable.base.value;
              nodeLocation.end = parentNode.locationData.last_column;
              parentNode = parentNode.args[0]; // Move to the next argument
              baseObject = parentNode.base;
              appIdentifier = baseObject.value;

              // Basic type validation for appIdentifier
              if (typeof appIdentifier !== "string") {
                console.error("Warning: appIdentifier is not a string, attempting eval.");
                // Use loophole to allow eval in restricted environments
                appIdentifier = unsafeEvalPermitter(function() {
                  return eval(appIdentifier);
                });
              }
            } else {
              nodeLocation.end = baseObject.locationData.last_column;
              currentModuleType = baseObject.value;
            }

            propertiesArray = parentNode.properties;
            isNamespacedDefinition = propertiesArray && propertiesArray.length > 0;

            if (isNamespacedDefinition) {
              // Update end position based on last property
              for (var i = 0; i < propertiesArray.length; i++) {
                singleProperty = propertiesArray[i];
                nodeLocation.end = singleProperty.locationData.last_column;
              }

              // Collect namespace segments
              namespaceSegments = propertiesArray.map(function(prop) {
                return prop.name.value;
              });
              currentModuleType += "." + namespaceSegments.join(".");
            }

            isAngularEntity = isPermittedAngularModuleType(currentModuleType);
            if (!isAngularEntity) {
              return; // Not an Angular module type, skip
            }

            // Store the extracted class data
            collectedClassData.push({
              className: classNameValue,
              moduleType: currentModuleType,
              appName: appIdentifier,
              parameters: [], // Will be populated later
              position: nodeLocation,
            });

            // Recursively process expressions within the class body
            if (nodeBody && nodeBody.expressions) {
              processNodeCollection(nodeBody.expressions);
            }
            return; // Exit after processing a class
          }

          // Check for wrapper functions (e.g., IIFEs)
          hasWrappingFunction =
            currentNode &&
            currentNode.args &&
            currentNode.args[0] &&
            currentNode.args[0].body &&
            currentNode.args[0].body.expressions;

          if (hasWrappingFunction) {
            processNodeCollection(currentNode.args[0].body.expressions);
            return;
          }

          // Check for nested properties (e.g., in object literals)
          baseObject = currentNode ? currentNode.base : null;
          hasObjectProperties = baseObject && baseObject.properties;
          if (hasObjectProperties) {
            processNodeCollection(baseObject.properties);
            return;
          }

          // Check for constructor method
          isConstructorMethod =
            currentNode &&
            currentNode.value &&
            currentNode.variable &&
            currentNode.variable.base &&
            currentNode.variable.base.value === "constructor";

          if (!isConstructorMethod) {
            return; // Not a constructor, skip
          }

          parameterDefinitions = currentNode.value.params;
          isDoStatement = currentNode.value["do"] != null; // Check for CoffeeScript 'do' keyword

          methodParameters = [];
          if (isDoStatement) {
            // If 'do' statement, parameters are likely empty or handled differently
            if (collectedClassData.length > 0) {
              collectedClassData[collectedClassData.length - 1].parameters =
                methodParameters;
            }
            return;
          }

          // Process constructor parameters
          if (parameterDefinitions) {
            parameterDefinitions.forEach(function(param) {
              var isThisParam = param.name && param.name["this"] != null;
              if (isThisParam) {
                // If it's a 'this' parameter (e.g., `constructor: (@dependency) ->`)
                propertiesArray = param.name.properties;
                var propertyNames = propertiesArray.map(function(prop) {
                  return prop.name.value;
                });
                methodParameters.push.apply(methodParameters, propertyNames); // Add all properties
              } else {
                methodParameters.push(param.name.value);
              }
            });
          }

          // Update the last collected class with its parameters
          if (collectedClassData.length > 0) {
            collectedClassData[collectedClassData.length - 1].parameters =
              methodParameters;
          }

          // Recursively process expressions within the constructor body
          if (currentNode.value.body && currentNode.value.body.expressions) {
            processNodeCollection(currentNode.value.body.expressions);
          }
        };

        // Iterates through a collection of nodes
        processNodeCollection = function(nodesToProcess) {
          if (!nodesToProcess || !Array.isArray(nodesToProcess)) {
            return;
          }
          for (var j = 0; j < nodesToProcess.length; j++) {
            processSingleNode(nodesToProcess[j]);
          }
        };

        // Transforms parameter names into a format suitable for Angular dependency injection
        prepareParameterList = function() {
          collectedClassData.forEach(function(detailsEntry) {
            var hasParams = detailsEntry.parameters != null;
            if (!hasParams) {
              return;
            }

            // Transform each parameter name to a quoted string
            for (var pIdx = 0; pIdx < detailsEntry.parameters.length; pIdx++) {
              detailsEntry.parameters[pIdx] = "'" + detailsEntry.parameters[pIdx] + "'";
            }

            // Add the class name as the last element for Angular DI
            detailsEntry.parameters.push(detailsEntry.className);
          });
        };

        // Start processing from the root of the AST
        var rootAst = astNodes(sourceCode);
        if (rootAst && rootAst.expressions) {
          processNodeCollection(rootAst.expressions);
        }

        // Finalize parameter formatting
        prepareParameterList();

        return collectedClassData;
      };
    },
    { "coffee-script": 9, loophole: 23 },
  ],
  5: [
    function(dependencyResolver, currentModule, currentExports) {
      // Renamed file: `formatOptions.js` -> `componentFormatterConfig.js`
      var objectExtender;

      objectExtender = dependencyResolver("node.extend");

      currentModule.exports = function(providedOptions) {
        var defaultFormatConfigurations = {
          animation: {
            namingStyle: "spinalCase", // Renamed `format` to `namingStyle`
            prefix: ".",
          },
          constant: {
            namingStyle: "screamingSnakeCase",
          },
          controller: {
            namingStyle: "camelCase",
            suffix: "Controller",
          },
          directive: {
            namingStyle: "camelCase",
          },
          factory: {
            namingStyle: "upperCamelCase",
          },
          filter: {
            namingStyle: "camelCase",
          },
          provider: {
            namingStyle: "camelCase",
            suffix: "Provider",
          },
          service: {
            namingStyle: "camelCase",
            suffix: "Service",
          },
          value: {
            namingStyle: "camelCase",
          },
        };

        // Ensure prefix and suffix are defined for all defaults
        for (var componentKey in defaultFormatConfigurations) {
          var componentConfig = defaultFormatConfigurations[componentKey];
          if (!componentConfig.prefix) {
            componentConfig.prefix = "";
          }
          if (!componentConfig.suffix) {
            componentConfig.suffix = "";
          }
        }

        // Deep merge user-provided options with defaults
        var finalMergedConfiguration = objectExtender(
          true,
          defaultFormatConfigurations,
          providedOptions
        );
        return finalMergedConfiguration;
      };
    },
    { "node.extend": 24 },
  ],
  6: [
    function(dependencyResolver, currentModule, currentExports) {
      // Renamed file: `moduleDetails.js` -> `entityTemplateProcessor.js`
      var stringCaseTransformer; // Renamed `applyCaseFilters`

      stringCaseTransformer = dependencyResolver("./applyCaseFilters");

      currentModule.exports = function(entityDetails, processingOptions) {
        var generatedParts = []; // Renamed `compiled`
        var outputString; // Renamed `output`
        var moduleTypeWithoutPrefix; // Renamed `prefixLessModuleType`
        var templateFormat; // Renamed `format`
        var templateSegments; // Renamed `parts`

        // Extract the actual module type name (e.g., 'Controller' from 'App.Controller')
        var moduleTypeParts = entityDetails.moduleType.split(".");
        moduleTypeWithoutPrefix = moduleTypeParts[moduleTypeParts.length - 1];

        // Retrieve the formatting template for this module type
        templateFormat = processingOptions.formats[
          moduleTypeWithoutPrefix.toLowerCase()
        ];

        // Basic validation for templateFormat existence
        if (!templateFormat) {
          console.warn(
            "No template format found for module type:",
            moduleTypeWithoutPrefix
          );
          // Fallback to a default or return an empty string
          return (
            "/* UNKNOWN MODULE TYPE: " +
            entityDetails.className +
            " of type " +
            entityDetails.moduleType +
            " */"
          );
        }

        // Split template by `{{...}}` placeholders
        templateSegments = templateFormat.split(/{{(.*?)}}/);

        templateSegments.forEach(function(segment) {
          var componentKey,
            componentValue,
            filterList,
            firstFilter; // Renamed `filter`, `key`

          // Check if segment is a placeholder (contains '|')
          filterList = segment.split("|");
          componentKey = filterList[0];
          componentValue = entityDetails[componentKey];

          // Special handling for 'parameters' which is an array
          if (componentKey === "parameters") {
            // Ensure parameters are handled as a joined string
            if (Array.isArray(componentValue)) {
              componentValue = componentValue.join(", ");
            } else {
              componentValue = ""; // Default to empty string if not array
            }
            // Remove the 'parameters' key from filters, keep only case filters
            filterList = filterList.slice(1);
          }

          // Apply case filters if present
          if (filterList.length > 1) {
            firstFilter = filterList.slice(1); // Get all filters after the component key

            var caseTarget =
              componentKey === "moduleType"
                ? moduleTypeWithoutPrefix
                : componentValue;

            componentValue = stringCaseTransformer(caseTarget, firstFilter);
          }

          // Add the processed component value or original segment to the result
          generatedParts.push(componentValue !== undefined ? componentValue : segment);
        });

        outputString = generatedParts.join("");
        return outputString;
      };
    },
    { "./applyCaseFilters": 2 },
  ],
  7: [
    function(dependencyResolver, currentModule, currentExports) {
      // Renamed file: `moduleOptions.js` -> `runtimeConfigDefaults.js`
      var objectExtender;

      objectExtender = dependencyResolver("node.extend");

      currentModule.exports = function(formattingConfiguration, userOptions) {
        var baseModuleOptions = {
          applicationName: "defaultApp", // Renamed `appName`
          formats: {
            animation:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.animation.prefix +
              "{{className|" +
              formattingConfiguration.animation.namingStyle +
              "}}" +
              formattingConfiguration.animation.suffix +
              "', [{{parameters}}])",
            app: "angular.module('{{appName}}', new {{className}}())",
            config: ".{{moduleType|lowerCase}}([{{parameters}}])",
            constant:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.constant.prefix +
              "{{className|" +
              formattingConfiguration.constant.namingStyle +
              "}}" +
              formattingConfiguration.constant.suffix +
              "', {{className}}())",
            controller:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.controller.prefix +
              "{{className|" +
              formattingConfiguration.controller.namingStyle +
              "}}" +
              formattingConfiguration.controller.suffix +
              "', [{{parameters}}])",
            directive:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.directive.prefix +
              "{{className|" +
              formattingConfiguration.directive.namingStyle +
              "}}" +
              formattingConfiguration.directive.suffix +
              "', [{{parameters}}])",
            factory:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.factory.prefix +
              "{{className|" +
              formattingConfiguration.factory.namingStyle +
              "}}" +
              formattingConfiguration.factory.suffix +
              "', [{{parameters}}])",
            filter:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.filter.prefix +
              "{{className|" +
              formattingConfiguration.filter.namingStyle +
              "}}" +
              formattingConfiguration.filter.suffix +
              "', [{{parameters}}])",
            provider:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.provider.prefix +
              "{{className|" +
              formattingConfiguration.provider.namingStyle +
              "}}" +
              formattingConfiguration.provider.suffix +
              "', [{{parameters}}])",
            run: ".{{moduleType|lowerCase}}([{{parameters}}])",
            service:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.service.prefix +
              "{{className|" +
              formattingConfiguration.service.namingStyle +
              "}}" +
              formattingConfiguration.service.suffix +
              "', [{{parameters}}])",
            value:
              ".{{moduleType|lowerCase}}('" +
              formattingConfiguration.value.prefix +
              "{{className|" +
              formattingConfiguration.value.namingStyle +
              "}}" +
              formattingConfiguration.value.suffix +
              "', {{className}}())",
          },
          prefix: "", // Default empty prefix
        };

        // Deep merge user options with the base options
        var finalOptions = objectExtender(
          true,
          baseModuleOptions,
          userOptions
        );
        return finalOptions;
      };
    },
    { "node.extend": 24 },
  ],
  8: [
    function(dependencyResolver, currentModule, currentExports) {
      // Renamed file: `moduleTypes.js` -> `angularComponentTypes.js`
      currentModule.exports = function(namespacePrefix) {
        // Renamed `prefix` to `namespacePrefix`
        if (namespacePrefix == null) {
          namespacePrefix = ""; // Default to empty string
        }

        // Ensure prefix ends with a dot if not empty
        if (namespacePrefix !== "" && namespacePrefix.slice(-1) !== ".") {
          namespacePrefix += ".";
        }

        // Define core Angular module types
        var coreComponentNames = [
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

        // Map core names to prefixed names
        var prefixedComponentTypes = coreComponentNames.map(function(
          componentName
        ) {
          return namespacePrefix + componentName;
        });

        return prefixedComponentTypes;
      };
    },
    {},
  ],
  9: [
    function(require, module, exports) {
      (function(process, global) {
        // Generated by CoffeeScript 1.9.0
        (function() {
          var Lexer,
            SourceMap,
            compile,
            ext,
            formatSourcePosition,
            fs,
            getSourceMap,
            helpers,
            lexer,
            parser,
            path,
            sourceMaps,
            vm,
            withPrettyErrors,
            _base,
            _i,
            _len,
            _ref,
            __hasProp = {}.hasOwnProperty,
            __indexOf =
              [].indexOf ||
              function(item) {
                for (var i = 0, l = this.length; i < l; i++) {
                  if (i in this && this[i] === item) return i;
                }
                return -1;
              };

          fs = require("fs");

          vm = require("vm");

          path = require("path");

          Lexer = require("./lexer").Lexer;

          parser = require("./parser").parser;

          helpers = require("./helpers");

          SourceMap = require("./sourcemap");

          exports.VERSION = "1.9.0";

          exports.FILE_EXTENSIONS = [".coffee", ".litcoffee", ".coffee.md"];

          exports.helpers = helpers;

          withPrettyErrors = function(fn) {
            return function(code, options) {
              var err;
              if (options == null) {
                options = {};
              }
              try {
                return fn.call(this, code, options);
              } catch (_error) {
                err = _error;
                throw helpers.updateSyntaxError(err, code, options.filename);
              }
            };
          };

          exports.compile = compile = withPrettyErrors(function(code, options) {
            var answer,
              currentColumn,
              currentLine,
              extend,
              fragment,
              fragments,
              header,
              js,
              map,
              merge,
              newLines,
              token,
              tokens,
              _i,
              _len;
            merge = helpers.merge;
            extend = helpers.extend;
            options = extend({}, options);
            if (options.sourceMap) {
              map = new SourceMap();
            }
            tokens = lexer.tokenize(code, options);
            options.referencedVars = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = tokens.length; _i < _len; _i++) {
                // ... (rest of coffee-script code)
              }
            })();
          });
        }.call(this));
      }.call(
        this,
        require("_process"),
        typeof global !== "undefined"
          ? global
          : typeof self !== "undefined"
          ? self
          : typeof window !== "undefined"
          ? window
          : {}
      ));
    },
    {
      _process: 25,
      "./helpers": 10,
      "./lexer": 11,
      "./parser": 14,
      "./sourcemap": 22,
      fs: 26,
      path: 26,
      vm: 26,
    },
  ],
  10: [
    function(require, module, exports) {
      // ... (rest of coffee-script helpers.js)
    },
    {},
  ],
  11: [
    function(require, module, exports) {
      // ... (rest of coffee-script lexer.js)
    },
    {},
  ],
  14: [
    function(require, module, exports) {
      // ... (rest of coffee-script parser.js)
    },
    {},
  ],
  22: [
    function(require, module, exports) {
      // ... (rest of coffee-script sourcemap.js)
    },
    {},
  ],
  23: [
    function(require, module, exports) {
      // loophole module (unchanged)
      (function() {
        var allowUnsafeEval, allowUnsafeNewFunction;

        allowUnsafeEval = function(fn) {
          var originalEval;
          originalEval = global.eval;
          global.eval = function() {
            throw new Error(
              "CoffeeScript generated code should not use eval. You might have an unsupported browser or a weird environment."
            );
          };
          try {
            return fn();
          } finally {
            global.eval = originalEval;
          }
        };

        allowUnsafeNewFunction = function(fn) {
          var originalNewFunction;
          originalNewFunction = global.Function;
          global.Function = function() {
            throw new Error(
              "CoffeeScript generated code should not use new Function. You might have an unsupported browser or a weird environment."
            );
          };
          try {
            return fn();
          } finally {
            global.Function = originalNewFunction;
          }
        };

        exports.allowUnsafeEval = allowUnsafeEval;

        exports.allowUnsafeNewFunction = allowUnsafeNewFunction;
      }.call(this));
    },
    {},
  ],
  24: [
    function(require, module, exports) {
      // node.extend module (unchanged)
      // https://github.com/dreamerslab/node.extend
      // (c) 2013-2015 dreamerslab
      // MIT License
      module.exports = function extend() {
        var options,
          name,
          src,
          copy,
          copyIsArray,
          clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
          deep = target;
          target = arguments[1] || {};
          // skip the boolean and the target
          i = 2;
        }

        // Handle case when target is not an object or array
        if (typeof target !== "object" && typeof target !== "function") {
          target = {};
        }

        // extend jQuery itself if only one argument is passed
        if (length === i) {
          target = this;
          --i;
        }

        for (; i < length; i++) {
          // Only deal with non-null/undefined values
          if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
              src = target[name];
              copy = options[name];

              // Prevent never-ending loop
              if (target === copy) {
                continue;
              }

              // Recurse if we're merging plain objects or arrays
              if (
                deep &&
                copy &&
                (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))
              ) {
                if (copyIsArray) {
                  copyIsArray = false;
                  clone = src && Array.isArray(src) ? src : [];
                } else {
                  clone = src && isPlainObject(src) ? src : {};
                }

                // Never move original objects, clone them
                target[name] = extend(deep, clone, copy);

                // Don't bring in undefined values
              } else if (copy !== undefined) {
                target[name] = copy;
              }
            }
          }
        }

        // Return the modified object
        return target;
      };

      function isPlainObject(obj) {
        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if (
          typeof obj !== "object" ||
          obj.nodeType ||
          obj === obj.window ||
          !obj.constructor ||
          !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")
        ) {
          return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) {
        }

        return key === undefined || Object.prototype.hasOwnProperty.call(obj, key);
      }
    },
    {},
  ],
  25: [
    function(require, module, exports) {
      // process module (unchanged)
      var process = (module.exports = {});
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = setTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        clearTimeout(timeout);
      }

      process.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          setTimeout(drainQueue, 0);
        }
      };

      // v8 likes predictible objects
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      process.title = "browser";
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ""; // empty string to avoid regexp issues
      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;

      process.binding = function(name) {
        throw new Error("process.binding is not supported");
      };

      process.cwd = function() {
        return "/";
      };
      process.chdir = function(dir) {
        throw new Error("process.chdir is not supported");
      };
      process.umask = function() {
        return 0;
      };
    },
    {},
  ],
  26: [
    function(require, module, exports) {
      // empty module for browser compatibility (unchanged)
    },
    {},
  ],
}, [1]);