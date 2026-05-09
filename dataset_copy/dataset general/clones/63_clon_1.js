// ng-classify v4.1.1
module.exports = (function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        throw new Error("Cannot find module '" + o + "'");
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e)
      }, f, f.exports, e, t, n, r)
    }
    return n[o].exports
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s
})({
  1: [function(require, module, exports) {
    var classDetails, extend, formatOptions, moduleDetails, moduleOptions, moduleTypes;

    // Load necessary modules
    classDetails = require('./lib/classDetails');
    extend = require('node.extend');
    formatOptions = require('./lib/formatOptions');
    moduleDetails = require('./lib/moduleDetails');
    moduleOptions = require('./lib/moduleOptions');
    moduleTypes = require('./lib/moduleTypes');

    /**
     * Main export function for ng-classify.
     * Processes content and options to generate classified Angular code.
     *
     * @param {string} content - The input CoffeeScript content.
     * @param {object} options - Configuration options.
     * @returns {string} The ng-classified JavaScript code.
     */
    module.exports = function(content, options) {
      var app, appName, apps, contentLines, details, formatOpts, getTrimmedContent, lines, modDetails, modTypes, ngClassified, opts;

      // Format options and initialize module types
      formatOpts = formatOptions(options);
      opts = moduleOptions(formatOpts, options);
      modTypes = moduleTypes(opts.prefix);

      // Determine the application name, default to 'app' if not provided
      appName = !opts.appName ? 'app' : opts.appName;

      // Extract class details from the content
      details = classDetails(content, modTypes);

      // Split content into lines for manipulation
      contentLines = content.split('\n');

      /**
       * Trims content lines based on a given position.
       * This effectively removes the original CoffeeScript class definition.
       *
       * @param {Array<string>} contentLines - Array of content lines.
       * @param {object} position - Object with row, start, and end properties.
       * @returns {Array<string>} Modified content lines with the class definition removed.
       */
      getTrimmedContent = function(contentLines, position) {
        var characters, end, i, line, lineContent, lines, row, start, _i, _ref;

        // Create a shallow copy of the lines array
        lines = contentLines.slice(0);
        row = position.row;
        start = position.start;
        end = position.end;

        lineContent = lines[row];
        characters = lineContent.split('');

        // Remove characters within the specified range
        for (i = _i = _ref = start + 1; _ref <= end ? _i <= end : _i >= end; i = _ref <= end ? ++_i : --_i) {
          delete characters[i];
        }

        line = characters.join('');
        lines[row] = line; // Update the line in the array
        return lines;
      };

      apps = {}; // Object to hold classified app modules

      // Process each class detail found in the content
      details.forEach(function(detail) {
        var modDetails, moduleAppName;

        // Determine the app name for the current module
        moduleAppName = !detail.appName ? appName : detail.appName;

        // Generate module details, extending with the determined app name
        modDetails = moduleDetails(extend(true, detail, {
          appName: moduleAppName
        }), opts);

        // Trim the original content lines to remove the processed class definition
        contentLines = getTrimmedContent(contentLines, detail.position);

        // Initialize app entry if it doesn't exist
        if (!apps[moduleAppName]) {
          apps[moduleAppName] = {};
        }

        // Categorize module details into appTypes or nonAppTypes
        if (detail.moduleType === 'App') {
          if (!apps[moduleAppName].appTypes) {
            apps[moduleAppName].appTypes = [];
          }
          return apps[moduleAppName].appTypes.push(modDetails);
        } else {
          if (!apps[moduleAppName].nonAppTypes) {
            apps[moduleAppName].nonAppTypes = [];
          }
          return apps[moduleAppName].nonAppTypes.push(modDetails);
        }
      });

      lines = []; // Array to store generated Angular module lines

      // Iterate over classified apps and generate their Angular module definitions
      for (app in apps) {
        modDetails = apps[app];

        // Add a blank line between different app definitions for readability
        if (lines.length !== 0) {
          lines.push('');
        }

        // If there are app types, push them to lines
        if (modDetails.appTypes) {
          modDetails.appTypes.forEach(function(appType) {
            return lines.push(appType);
          });
        } else {
          // Otherwise, create a basic angular.module definition
          lines.push("angular.module('" + app + "')");
        }

        // If there are non-app types, push them to lines
        if (modDetails.nonAppTypes && modDetails.nonAppTypes.length > 0) {
          modDetails.nonAppTypes.forEach(function(nonAppType) {
            return lines.push(nonAppType);
          });
        }
      }

      // Join the remaining content lines to form the base classified content
      ngClassified = contentLines.join('\n');

      // Append generated Angular module lines if any
      if (lines.length) {
        ngClassified += '\n\n'; // Add spacing before appending
      }
      return ngClassified += lines.join('\n'); // Join generated module lines
    };


  }, {
    "./lib/classDetails": 4,
    "./lib/formatOptions": 5,
    "./lib/moduleDetails": 6,
    "./lib/moduleOptions": 7,
    "./lib/moduleTypes": 8,
    "node.extend": 24
  }],
  2: [function(require, module, exports) {
    var applyCaseFilters;

    // Require the changeCase utility
    applyCaseFilters = require('./changeCase');

    /**
     * Applies a series of case filters to an input string.
     *
     * @param {string} input - The string to be filtered.
     * @param {Array<string>} filters - An array of filter names (e.g., 'camelCase', 'upperCase').
     * @returns {string} The filtered string.
     */
    module.exports = function(input, filters) {
      var filter, _i, _len;

      // Iterate through each filter and apply it to the input
      for (_i = 0, _len = filters.length; _i < _len; _i++) {
        filter = filters[_i];
        input = applyCaseFilters(input, filter);
      }
      return input;
    };


  }, {
    "./changeCase": 3
  }],
  3: [function(require, module, exports) {
    var caseChangeRegEx;

    // Regular expression to find a lowercase/digit followed by an uppercase letter
    caseChangeRegEx = /([a-z\d])([A-Z])/g;

    /**
     * Converts an input string to a specified case format.
     *
     * @param {string} input - The string to convert.
     * @param {string} caseFormat - The target case format (e.g., 'camelCase', 'snakeCase').
     * @returns {string} The converted string.
     * @throws {Error} If an invalid caseFormat is provided.
     */
    module.exports = function(input, caseFormat) {
      // Return input as is if format is '*'
      if (caseFormat === '*') {
        return input;
      }

      // Camel case (lowerCamelCase)
      if (caseFormat === 'camelCase' || caseFormat === 'lowerCamelCase') {
        return input[0].toLowerCase() + input.slice(1);
      }

      // Lower case
      if (caseFormat === 'lowerCase') {
        return input.toLowerCase();
      }

      // Screaming snake case (e.g., MY_VARIABLE)
      if (caseFormat === 'screamingSnakeCase') {
        return input.replace(/-/g, '_').replace(caseChangeRegEx, '$1_$2').toUpperCase();
      }

      // Snake case (e.g., my_variable)
      if (caseFormat === 'snakeCase') {
        return input.replace(/-/g, '_').replace(caseChangeRegEx, '$1_$2').toLowerCase();
      }

      // Spinal case (kebab-case)
      if (caseFormat === 'spinalCase') {
        return input.replace(/_/g, '-').replace(caseChangeRegEx, '$1-$2').toLowerCase();
      }

      // Train case (e.g., My-Variable)
      if (caseFormat === 'trainCase') {
        input = input.replace(/_/g, '-');
        return input.replace(caseChangeRegEx, '$1-$2')[0].toUpperCase() + input.replace(caseChangeRegEx, '$1-$2').slice(1);
      }

      // Upper camel case (PascalCase)
      if (caseFormat === 'upperCamelCase') {
        return input[0].toUpperCase() + input.slice(1);
      }

      // Upper case
      if (caseFormat === 'upperCase') {
        return input.toUpperCase();
      }

      // Throw an error for unsupported case formats
      throw new Error("invalid caseFormat '" + caseFormat + "'");
    };


  }, {}],
  4: [function(require, module, exports) {
    var allowUnsafeEval, coffeeScript, nodes,
      __indexOf = [].indexOf || function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (i in this && this[i] === item) return i;
        }
        return -1;
      };

    // Require necessary modules
    allowUnsafeEval = require('loophole').allowUnsafeEval;
    coffeeScript = require('coffee-script');
    nodes = coffeeScript.nodes; // Extract the nodes function from coffee-script

    /**
     * Extracts class details from CoffeeScript content.
     *
     * @param {string} content - The CoffeeScript source code.
     * @param {Array<string>} moduleTypes - An array of recognized Angular module types.
     * @returns {Array<object>} An array of objects, each describing a class.
     */
    module.exports = function(content, moduleTypes) {
      var classDetails, isAngularModuleType, normalizeParameters, processNode, processNodes;

      classDetails = []; // Array to store details of identified classes

      /**
       * Checks if a given module type is a recognized Angular module type.
       *
       * @param {string} moduleType - The module type to check.
       * @returns {boolean} True if it's an Angular module type, false otherwise.
       */
      isAngularModuleType = function(moduleType) {
        return __indexOf.call(moduleTypes, moduleType) >= 0;
      };

      /**
       * Processes a single AST node to extract class information.
       *
       * @param {object} node - The AST node to process.
       */
      processNode = function(node) {
        var appName, base, body, classLocation, className, hasAppName, hasProperties, hasWrapper, isAngular, isClass, isConstructor, isDo, isExtends, isNamespaced, moduleType, namespaces, parameters, params, parent, position, properties, property, _i, _len, _ref, _ref1, _ref2, _ref3;

        appName = null;

        // If the node has an expression property, use that as the actual node
        if (node.expression) {
          node = node.expression;
        }

        body = node.body;
        // Identify if the node represents a CoffeeScript class
        isClass = node.variable && node.parent && (body != null ? body.classBody : void 0);

        if (isClass) {
          base = node.variable.base;
          className = base.value;
          classLocation = base.locationData;
          parent = node.parent;
          isExtends = parent != null; // Check if the class extends another
          position = {
            row: classLocation.last_line,
            start: classLocation.last_column
          };

          // If the class does not extend, we might not be interested or it's a base class
          if (!isExtends) {
            return;
          }

          base = parent.base;
          hasAppName = !base; // Check if an app name is explicitly provided

          if (hasAppName) {
            moduleType = parent.variable.base.value;
            position.end = parent.locationData.last_column;
            parent = parent.args[0];
            base = parent.base;
            appName = base.value;

            if (typeof appName !== 'string') {
              throw new Error('appName must be a string');
            }
            // Safely evaluate the appName if it's a string literal
            appName = allowUnsafeEval(function() {
              return eval(appName);
            });
          } else {
            position.end = base.locationData.last_column;
            moduleType = base.value;
          }

          properties = parent.properties;
          isNamespaced = properties.length > 0;

          if (isNamespaced) {
            for (_i = 0, _len = properties.length; _i < _len; _i++) {
              property = properties[_i];
              position.end = property.locationData.last_column;
            }
            namespaces = (function() {
              var _j, _len1, _results;
              _results = [];
              for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
                property = properties[_j];
                _results.push(property.name.value);
              }
              return _results;
            })();
            moduleType += '.' + namespaces.join('.');
          }

          isAngular = isAngularModuleType(moduleType);
          if (!isAngular) {
            return; // Skip if not an Angular module type
          }

          // Store the extracted class details
          classDetails.push({
            className: className,
            moduleType: moduleType,
            appName: appName,
            parameters: [],
            position: position
          });

          return processNodes(body.expressions); // Recursively process the class body
        }

        // Check for wrapper functions (e.g., IIFEs)
        hasWrapper = (node != null ? (_ref = node.args) != null ? (_ref1 = _ref[0]) != null ? (_ref2 = _ref1.body) != null ? _ref2.expressions : void 0 : void 0 : void 0 : void 0) != null;
        if (hasWrapper) {
          return processNodes(node.args[0].body.expressions);
        }

        base = node.base;
        hasProperties = base != null ? base.properties : void 0;
        if (hasProperties) {
          return processNodes(base.properties);
        }

        // Check if the node is a constructor
        isConstructor = node.value && ((_ref3 = node.variable) != null ? _ref3.base.value : void 0) === 'constructor';
        if (!isConstructor) {
          return;
        }

        params = node.value.params;
        isDo = node.value["do"] != null; // Check for 'do' keyword in constructor

        parameters = [];
        if (isDo) {
          return classDetails[classDetails.length - 1].parameters = parameters;
        }

        // Extract constructor parameters
        params.forEach(function(param) {
          var isThis, props;
          isThis = param.name["this"] != null; // Check for 'this' parameters (dependency injection)

          if (isThis) {
            properties = param.name.properties;
            props = (function() {
              var _j, _len1, _results;
              _results = [];
              for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
                property = properties[_j];
                _results.push(property.name.value);
              }
              return _results;
            })();
            return parameters.push(props);
          }
          return parameters.push(param.name.value);
        });

        // Assign parameters to the last identified class
        classDetails[classDetails.length - 1].parameters = parameters;
        return processNodes(node.value.body.expressions); // Process constructor body expressions
      };

      /**
       * Recursively processes an array of AST nodes.
       *
       * @param {Array<object>} nodes - An array of AST nodes.
       */
      processNodes = function(nodes) {
        var node, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          node = nodes[_i];
          _results.push(processNode(node));
        }
        return _results;
      };

      /**
       * Normalizes the extracted parameters for Angular dependency injection.
       * Wraps each parameter in single quotes and adds the class name as the last element.
       */
      normalizeParameters = function() {
        return classDetails.forEach(function(details) {
          var hasParameters, i, parameter, _i, _len, _ref;
          hasParameters = details.parameters != null;
          if (!hasParameters) {
            return;
          }

          _ref = details.parameters;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            parameter = _ref[i];
            details.parameters[i] = "'" + parameter + "'";
          }
          return details.parameters.push(details.className); // Add the class name as the last dependency
        });
      };

      // Start processing by parsing the content into an AST
      processNodes(nodes(content).expressions);
      normalizeParameters(); // Normalize parameters after all classes are processed

      return classDetails;
    };


  }, {
    "coffee-script": 9,
    "loophole": 23
  }],
  5: [function(require, module, exports) {
    var extend;

    // Require the node.extend utility
    extend = require('node.extend');

    /**
     * Generates and merges default formatting options for various Angular module types.
     *
     * @param {object} options - User-provided options to merge with defaults.
     * @returns {object} The merged formatting options.
     */
    module.exports = function(options) {
      var formatOptions, k, merged, prefix, suffix, v;

      // Define default formatting options for different Angular module types
      formatOptions = {
        animation: {
          format: 'spinalCase',
          prefix: '.'
        },
        constant: {
          format: 'screamingSnakeCase'
        },
        controller: {
          format: 'camelCase',
          suffix: 'Controller'
        },
        directive: {
          format: 'camelCase'
        },
        factory: {
          format: 'upperCamelCase'
        },
        filter: {
          format: 'camelCase'
        },
        provider: {
          format: 'camelCase',
          suffix: 'Provider'
        },
        service: {
          format: 'camelCase',
          suffix: 'Service'
        },
        value: {
          format: 'camelCase'
        }
      };

      // Ensure that all format options have a defined prefix and suffix
      for (k in formatOptions) {
        v = formatOptions[k];
        prefix = formatOptions[k].prefix;
        suffix = formatOptions[k].suffix;

        if (!prefix) {
          formatOptions[k].prefix = '';
        }
        if (!suffix) {
          formatOptions[k].suffix = '';
        }
      }

      // Merge default options with user-provided options (deep merge)
      return merged = extend(true, formatOptions, options);
    };


  }, {
    "node.extend": 24
  }],
  6: [function(require, module, exports) {
    var applyCaseFilters;

    // Require the applyCaseFilters utility
    applyCaseFilters = require('./applyCaseFilters');

    /**
     * Compiles module details into a formatted output string based on predefined formats.
     *
     * @param {object} details - An object containing class details (e.g., className, moduleType, parameters).
     * @param {object} options - Configuration options, including format templates.
     * @returns {string} The formatted output string for the Angular module.
     */
    module.exports = function(details, options) {
      var compiled, format, output, parts, prefixLessModuleType;

      // Extract the module type without any prefix (e.g., "Controller" from "App.Controller")
      prefixLessModuleType = details.moduleType.split('.').slice(-1)[0];

      // Get the format template for the specific module type
      format = options.formats[prefixLessModuleType.toLowerCase()];

      // Split the format string into parts, separating placeholders (e.g., {{className}})
      parts = format.split(/{{(.*?)}}/);
      compiled = [];

      // Iterate through each part and process it
      parts.forEach(function(part) {
        var component, detail, filters, key;

        // Split the part by '|' to separate the component name from filters
        filters = part.split('|');
        component = filters[0]; // The first part is the component name (e.g., 'className')

        detail = details[component]; // Get the actual detail value from the details object

        // Special handling for 'parameters' component
        if (component === 'parameters') {
          detail = detail.join(', '); // Join array parameters into a comma-separated string
          // Remove the component name from filters, keeping only actual filters
          filters = filters.filter(function(filter, i) {
            return i > 0;
          });
        }

        // Apply case filters if there are any
        if (filters.length > 1) {
          filters = filters.slice(1); // Get only the filter names
          // Determine the key for filtering: prefixLessModuleType for 'moduleType', otherwise the detail itself
          key = component === 'moduleType' ? prefixLessModuleType : detail;
          detail = applyCaseFilters(key, filters); // Apply all specified filters
        }

        // Push the processed detail or the original component name if detail is empty
        return compiled.push(detail ? detail : component);
      });

      output = compiled.join(''); // Join all compiled parts into the final output string
      return output;
    };


  }, {
    "./applyCaseFilters": 2
  }],
  7: [function(require, module, exports) {
    var extend;

    // Require the node.extend utility
    extend = require('node.extend');

    /**
     * Generates and merges default module options, including format strings for various Angular types.
     *
     * @param {object} formatOptions - Pre-processed formatting options (e.g., case formats, prefixes, suffixes).
     * @param {object} options - User-provided options to merge with defaults.
     * @returns {object} The merged module options.
     */
    module.exports = function(formatOptions, options) {
      var merged, moduleOptions;

      moduleOptions = {
        appName: 'app', // Default application name
        formats: {
          // Format strings for different Angular module types, dynamically constructed using formatOptions
          animation: ".{{moduleType|lowerCase}}('" + formatOptions.animation.prefix + "{{className|" + formatOptions.animation.format + "}}" + formatOptions.animation.suffix + "', [{{parameters}}])",
          app: "angular.module('{{appName}}', new {{className}}())",
          config: ".{{moduleType|lowerCase}}([{{parameters}}])",
          constant: ".{{moduleType|lowerCase}}('" + formatOptions.constant.prefix + "{{className|" + formatOptions.constant.format + "}}" + formatOptions.constant.suffix + "', {{className}}())",
          controller: ".{{moduleType|lowerCase}}('" + formatOptions.controller.prefix + "{{className|" + formatOptions.controller.format + "}}" + formatOptions.controller.suffix + "', [{{parameters}}])",
          directive: ".{{moduleType|lowerCase}}('" + formatOptions.directive.prefix + "{{className|" + formatOptions.directive.format + "}}" + formatOptions.directive.suffix + "', [{{parameters}}])",
          factory: ".{{moduleType|lowerCase}}('" + formatOptions.factory.prefix + "{{className|" + formatOptions.factory.format + "}}" + formatOptions.factory.suffix + "', [{{parameters}}])",
          filter: ".{{moduleType|lowerCase}}('" + formatOptions.filter.prefix + "{{className|" + formatOptions.filter.format + "}}" + formatOptions.filter.suffix + "', [{{parameters}}])",
          provider: ".{{moduleType|lowerCase}}('" + formatOptions.provider.prefix + "{{className|" + formatOptions.provider.format + "}}" + formatOptions.provider.suffix + "', [{{parameters}}])",
          run: ".{{moduleType|lowerCase}}([{{parameters}}])",
          service: ".{{moduleType|lowerCase}}('" + formatOptions.service.prefix + "{{className|" + formatOptions.service.format + "}}" + formatOptions.service.suffix + "', [{{parameters}}])",
          value: ".{{moduleType|lowerCase}}('" + formatOptions.value.prefix + "{{className|" + formatOptions.value.format + "}}" + formatOptions.value.suffix + "', {{className}}())"
        },
        prefix: '' // Default prefix for module types
      };

      // Deep merge default module options with user-provided options
      return merged = extend(true, moduleOptions, options);
    };


  }, {
    "node.extend": 24
  }],
  8: [function(require, module, exports) {
    /**
     * Generates a list of recognized Angular module types, optionally prefixed.
     *
     * @param {string} [prefix=''] - An optional prefix to prepend to each module type (e.g., 'App.').
     * @returns {Array<string>} An array of fully qualified module type strings.
     */
    module.exports = function(prefix) {
      var moduleType, moduleTypes;

      if (prefix == null) {
        prefix = ''; // Default prefix to empty string if not provided
      }

      // Ensure the prefix ends with a dot if it's not empty
      if (prefix !== '' && prefix.slice(-1) !== '.') {
        prefix += '.';
      }

      // Base list of Angular module types
      moduleTypes = ['Animation', 'App', 'Config', 'Constant', 'Controller', 'Directive', 'Factory', 'Filter', 'Provider', 'Run', 'Service', 'Value'];

      // Prepend the prefix to each module type
      return moduleTypes = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = moduleTypes.length; _i < _len; _i++) {
          moduleType = moduleTypes[_i];
          _results.push("" + prefix + moduleType);
        }
        return _results;
      })();
    };


  }, {}],
  9: [function(require, module, exports) {
    (function(process, global) {
      // Generated by CoffeeScript 1.9.0
      (function() {
        var Lexer, SourceMap, compile, ext, formatSourcePosition, fs, getSourceMap, helpers, lexer, parser, path, sourceMaps, vm, withPrettyErrors, _base, _i, _len, _ref,
          __hasProp = {}.hasOwnProperty,
          __indexOf = [].indexOf || function(item) {
            for (var i = 0, l = this.length; i < l; i++) {
              if (i in this && this[i] === item) return i;
            }
            return -1;
          };

        fs = require('fs');

        vm = require('vm');

        path = require('path');

        Lexer = require('./lexer').Lexer;

        parser = require('./parser').parser;

        helpers = require('./helpers');

        SourceMap = require('./sourcemap');

        exports.VERSION = '1.9.0';

        exports.FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];

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
          var answer, currentColumn, currentLine, extend, fragment, fragments, header, js, map, merge, newLines, token, tokens, _i, _len;
          merge = helpers.merge, extend = helpers.extend;
          options = extend({}, options);
          if (options.sourceMap) {
            map = new SourceMap;
          }
          tokens = lexer.tokenize(code, options);
          options.referencedVars = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = tokens.length; _i < _len; _i++) {