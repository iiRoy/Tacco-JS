/*
 * This is a Type I clone of the original Duck-Angular MASTER file.
 * The content and logic are identical.
 * Only whitespace and comments have been altered significantly.
 *
 * Original License Information (retained for compliance):
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Avishek Sen Gupta
 *
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
 */

// This function provides basic debug logging functionality.
var logDebug = function (text) {
  // Check if DUCK_DEBUG is defined and truthy to enable logging.
  if (typeof (DUCK_DEBUG) != "undefined" && DUCK_DEBUG) {
    console.log("[Duck DEBUG] " + text);
  }
};

// Function adapted from a specific GitHub repository for Q integration with RequireJS.
// Source: https://github.com/asengupta/requirejs-q
function requireQ(modules, Q) {
  var deferred = Q.defer(); // Create a new deferred object.

  // Use RequireJS to load the specified modules.
  require(modules, function () {
    // Resolve the deferred promise with the loaded arguments.
    deferred.resolve(arguments);
  });

  // Return the promise associated with the deferred object.
  return deferred.promise;
}


var duckCtor = function (_, angular, Q, $) {
  // Internal variable to manage dependencies, especially for multiple controllers feature.
  var hackDependencies = {};

  // The main Container constructor for Duck-Angular.
  var Container = function Container(injector, app, featureOptions) {
    // Ensure featureOptions is an object, default to empty if not provided.
    featureOptions = featureOptions || {};

    logDebug("Feature Options is : " + JSON.stringify(featureOptions));

    // Configure RequireJS if baseUrl and textPluginPath are provided in options.
    if (featureOptions.baseUrl && featureOptions.textPluginPath) {
      logDebug("Configuring RequireJS with : " + featureOptions.baseUrl + ", " + featureOptions.textPluginPath);
      require.config({
        baseUrl: featureOptions.baseUrl, // Base URL for module loading.
        paths: { text: featureOptions.textPluginPath } // Path for the text plugin.
      });
    }

    var self = this; // Capture 'this' for consistent access within the constructor.

    self.options = {}; // Initialize options object.
    self.injector = injector; // Store the Angular injector.
    self.controllerProvider = self.injector.get("$controller"); // Get the $controller service.
    self.rootScope = self.injector.get("$rootScope"); // Get the $rootScope service.
    self.compileService = self.injector.get("$compile"); // Get the $compile service.
    self.viewProcessors = []; // Array to hold view processing functions.

    /**
     * Adds a single view processor to the list.
     * @param {function} viewProcessor - The function to process view HTML.
     */
    this.addViewProcessor = function (viewProcessor) {
      self.viewProcessors.push(viewProcessor);
    };

    /**
     * Adds multiple view processors from an array.
     * @param {Array<function>} viewProcessors - An array of view processing functions.
     */
    this.addViewProcessors = function (viewProcessors) {
      _.each(viewProcessors, function (viewProcessor) {
        logDebug("Adding viewProcessor: " + viewProcessor);
        self.viewProcessors.push(viewProcessor);
      });
    };

    // Creates and returns a new isolated scope.
    this.newScope = function () {
      return self.rootScope.$new();
    };


    // Wraps HTML content in a div element.
    this.createElement = function (viewHTML) {
      var wrappingElement = angular.element("<div></div>");
      wrappingElement.append(viewHTML);
      return wrappingElement;
    };

    // Removes attributes/elements that could interfere with testing different scopes/controllers.
    this.removeElementsBelongingToDifferentScope = function (element) {
      element.find("[modal]").removeAttr("modal"); // Remove modal attribute.
      element.find("[options]").removeAttr("options"); // Remove options attribute.

      // If multiple controllers feature is not enabled, remove ng-controller directives.
      if (!multipleControllersFeature(featureOptions)) {
        element.find("[ng-controller]").remove();
      }

      return element;
    };

    // Retrieves a dependency from the Angular injector.
    this.get = function (dependencyName) {
      return injector.get(dependencyName);
    };

    // Recursively counts the number of ng-include partials within an element.
    this.numPartials = function num(element) {
      var includes = element.find("[ng-include]"); // Find all ng-include elements.

      // If no includes are found, resolve immediately with 1 (for the current element).
      if (includes.length === 0) {
        return Q.fcall(function () {
          return 1;
        });
      }

      // Helper function to extract the template name from ng-include or src attribute.
      var includedTemplateName = function (elementWithNgInclude) {
        var e = angular.element(elementWithNgInclude);
        if (e.attr("src")) {
          return e.attr("src").replace("'", "").replace("'", "");
        }
        return e.attr("ng-include").replace("'", "").replace("'", "");
      };

      // Create an array of promises for each included partial.
      var promises = _.map(includes, function (include) {
        var includeSource = includedTemplateName(include);
        var includePromise = requireQ(["text!" + includeSource], Q); // Load partial content.

        return includePromise.spread(function (sourceText) {
          // Recursively count partials in the loaded content.
          var child = self.removeElementsBelongingToDifferentScope(self.createElement(sourceText));
          return num(child);
        });
      });

      // After all partials are counted, sum them up.
      return Q.all(promises).then(function (counts) {
        return 1 + _.reduce(counts, function (sum, count) {
          return sum + count;
        }, 0);
      });
    };

    // Compiles an HTML template with a given scope and optional pre-render block.
    this.compileTemplate = function (viewHTML, scope, preRenderBlock) {
      var wrappingElement = self.removeElementsBelongingToDifferentScope(self.createElement(viewHTML));

      // Execute pre-render block if provided.
      if (preRenderBlock) {
        logDebug("Running pre-render block with scope: " + scope);
        preRenderBlock(self.injector, scope);
      }

      self.allPartialsLoadedDeferred = Q.defer(); // Deferred for waiting on all partials.
      var c = self.numPartials(wrappingElement); // Count partials in the template.

      return c.then(function (numberOfPartials) {
        self.numberOfPartials = numberOfPartials - 1; // Adjust for the root element.

        // If no partials or 'dontWait' option is set, resolve immediately.
        if (self.options.dontWait || !self.numberOfPartials || self.numberOfPartials === 0) {
          logDebug("All partials have been loaded.");
          self.allPartialsLoadedDeferred.resolve();
        }

        logDebug("Number of partials = " + self.numberOfPartials);
        var counter = 0;

        // Listen for '$includeContentLoaded' events to track partial loading.
        scope.$on("$includeContentLoaded", function () {
          logDebug("Loading a partial.");
          counter++;
          if (counter === self.numberOfPartials) {
            self.allPartialsLoadedDeferred.resolve();
          }
        });
      }).then(function () {
        logDebug("Binding template to scope");
        var compiledTemplate = self.compileService(wrappingElement)(scope); // Compile and link the template.
        applySafely(scope); // Apply changes to the scope.
        return compiledTemplate; // Return the compiled template.
      });
    };

    // Safely applies a digest cycle to the scope if not already in one.
    var applySafely = function (scope) {
      if (!scope.$$phase) { // Check if a digest is not already in progress.
        logDebug("Running $digest loop");
        scope.$apply(); // Trigger a digest cycle.
      }
    };

    // Processes the view HTML through registered view processors.
    var processView = function (viewHTML) {
      _.each(self.viewProcessors, function (viewProcessor) {
        logDebug("Processing view through " + viewProcessor);
        viewHTML = viewProcessor(viewHTML); // Apply each processor.
      });
      return viewHTML;
    };

    // Stubs a duckScope into a mockScope, preserving parent relationships.
    var stubScope = function (duckScope, mockScope) {
      if (mockScope && mockScope.$parent) {
        mockScope.$parent = stubScope(duckScope.$parent, mockScope.$parent);
      }
      mockScope = _.extend(duckScope, mockScope || {}); // Extend mockScope with duckScope properties.
      return mockScope;
    };

    // Stubs scopes for dependencies, handling single or multiple controller scenarios.
    var stubScopes = function (duckScope, dependencies, controllerName) {
      if (multipleControllersFeature(featureOptions)) {
        // For multiple controllers, stub the specific controller's scope.
        dependencies[controllerName].$scope = stubScope(duckScope, dependencies[controllerName].$scope);
        return dependencies;
      } else {
        // For single controller, stub the main dependencies.$scope.
        return stubScope(duckScope, dependencies.$scope);
      }
    };

    // Loads a view template from a URL, processes it, and compiles it.
    this.view = function (viewUrl, scope, preRenderBlock) {
      var deferred = Q.defer();
      logDebug("Loading " + viewUrl);

      require(["text!" + viewUrl], function (viewHTML) {
        logDebug("Loaded " + viewUrl);

        // HACK: Prevent ng-controller directives from being processed by Angular's default compiler
        // when multiple controller support is not enabled.
        if (!multipleControllersFeature(featureOptions)) {
          logDebug("Multiple controller support not enabled.");
          viewHTML = viewHTML.replace("ng-controller", "no-controller"); // Replace ng-controller.
        } else {
          logDebug("Multiple controller support is enabled.");
        }

        viewHTML = processView(viewHTML); // Apply view processors.
        viewHTML = viewHTML.replace("ng-app", "no-app"); // Replace ng-app to prevent auto-bootstrapping.

        self.compileTemplate(viewHTML, scope, preRenderBlock).then(function (compiledTemplate) {
          deferred.resolve(compiledTemplate); // Resolve with the compiled template.
        });
      }, function (err) {
        console.log("Bad things happened");
        console.log(err);
      });
      return deferred.promise;
    };

    // Instantiates an Angular controller.
    this.controller = function (controllerName, dependencies, isAsync, controllerLoadedPromise) {
      logDebug("Building controller");
      var controller;
      dependencies = dependencies || {}; // Ensure dependencies is an object.

      if (multipleControllersFeature(featureOptions)) {
        logDebug("Multiple controller support enabled, dependencies are: " + dependencies);
        hackDependencies = dependencies; // Store dependencies globally for the decorator.
        hackDependencies.rootControllerName = controllerName; // Identify the root controller.
        // Instantiate the controller, passing a specific scope.
        controller = self.controllerProvider(controllerName, { $scope: dependencies.$scope });
      } else {
        // For single controller, pass all dependencies directly.
        controller = self.controllerProvider(controllerName, dependencies);
      }

      // If not async, resolve immediately.
      if (!isAsync) {
        logDebug("Async convention disabled, resolving early.");
        return Q({});
      }

      logDebug("Async support enabled, searching for controller loaded promise");
      var deferred = Q.defer();

      // Determine the controller loaded promise.
      controllerLoadedPromise =
        controllerLoadedPromise ? controllerLoadedPromise(controller) : controller.loaded;

      logDebug("Does controller loaded promise exist ? " + (controllerLoadedPromise !== null));

      // Once the controller is loaded, resolve the deferred.
      controllerLoadedPromise.then(function () {
        logDebug("Controller is loaded, resolving");
        deferred.resolve(controller);
      });
      return deferred.promise;
    };

    // Compiles a directive template and returns its scope and compiled element.
    this.directiveTemplate = function (element) {
      var deferred = Q.defer();
      var scope = self.newScope(); // Create a new scope for the directive.
      self.compileTemplate(element, scope).then(function (template) {
        deferred.resolve([scope, template]); // Resolve with scope and compiled template.
      });
      return deferred.promise;
    };

    // Combines MVC (model-view-controller) setup with DOM interaction.
    this.domMvc = function (controllerName, viewUrl, dependencies, options) {
      dependencies = dependencies || {}; // Ensure dependencies exist.
      return self.mvc(controllerName, viewUrl, dependencies, options)
        .then(function (scopeViewController) {
          // Create a DuckDOM instance for interaction.
          var dom = new DuckDOM(scopeViewController.view, scopeViewController.scope);
          return [dom, scopeViewController]; // Return DOM and the MVC components.
        });
    };

    // Sets up the Model-View-Controller components.
    this.mvc = function (controllerName, viewUrl, dependencies, options) {
      // Set default options if not provided.
      self.options = options || { dontWait: false, async: false, controllerLoadedPromise: null };
      self.options.preBindHook = self.options.preBindHook || function () { };
      self.options.preRenderHook = self.options.preRenderHook || function () { };
      dependencies = dependencies || {};

      var scope = self.newScope(); // Create a new scope for this MVC instance.
      logDebug("START Pre-bind hook");
      self.options.preBindHook(scope); // Execute pre-bind hook.
      logDebug("STOP Pre-bind hook");

      // Stub scopes based on multiple controller feature.
      if (multipleControllersFeature(featureOptions)) {
        dependencies = stubScopes(scope, dependencies, controllerName);
      } else {
        dependencies.$scope = stubScopes(scope, dependencies, controllerName);
      }

      // Instantiate the controller and load the view template.
      var controller = this.controller(controllerName, dependencies, self.options.async || false,
        self.options.controllerLoadedPromise);
      var template = this.view(viewUrl, scope, self.options.preRenderHook);

      // Wait for both controller and template to be ready.
      return Q.spread([controller, template], function (controller, template) {
        // Wait for all partials to be loaded before returning MVC components.
        return self.allPartialsLoadedDeferred.promise.then(function () {
          return { controller: controller, view: template, scope: scope };
        });
      });
    };
  };

  // Helper function to check if the multiple controllers feature is enabled.
  var multipleControllersFeature = function (featureOptions) {
    return featureOptions && featureOptions.multipleControllers;
  };


  // ContainerBuilder object for setting up and building the Angular environment for testing.
  var ContainerBuilder = {
    dependencies: {}, // Stores application-level dependencies.
    originalDependenciesCache: {}, // Cache for original dependencies (not used in this snippet).
    originalProvide: null, // Placeholder for original $provide (not used in this snippet).

    // Fetches content from a URL using XMLHttpRequest and returns a promise.
    getQ: function (url) {
      var defer = Q.defer();
      var req = new XMLHttpRequest();
      req.open("GET", url, true);

      req.onload = function (e) {
        var result = req.responseText;
        defer.resolve(result); // Resolve with the response text.
      };

      req.onerror = function (e) {
        console.error("Putting failed", e);
        defer.reject(e); // Reject on error.
      };
      req.send();
      return defer.promise;
    },

    // Caches a template either from a URL or directly from an HTML string.
    cacheTemplate: function (app, templateUrl, realTemplateUrl) {
      var self = this;

      // Inner function to put the template into Angular's $templateCache.
      function putTemplateIntoCache(templateText) {
        app.run(function ($templateCache) {
          logDebug("Caching template with URL " + templateUrl);
          $templateCache.put(templateUrl, templateText);
        });
        return self;
      }

      // Checks if a string looks like HTML.
      function isHtml(val) {
        return /<[a-z][\s\S]*>/i.test(val);
      }

      if (isHtml(realTemplateUrl)) {
        // If it's an HTML string, resolve immediately.
        return Q.when(realTemplateUrl).then(putTemplateIntoCache);
      } else {
        // Otherwise, fetch from URL.
        return self.getQ(realTemplateUrl).then(putTemplateIntoCache);
      }
    },

    // Caches multiple templates from a map of templateUrls to realTemplateUrls/HTML strings.
    cacheTemplates: function (app, templateMap) {
      if (_.isEmpty(templateMap)) return Q(this); // If map is empty, return resolved promise.
      var self = this;
      return Q.all(_.map(_.pairs(templateMap), function (templateKeyPair) {
        // Cache each template and return a promise for it.
        return self.cacheTemplate(app, templateKeyPair[0], templateKeyPair[1]);
      })).spread(function (bldr) {
        return bldr; // Return the builder instance.
      });
    },

    // Sets application-level dependencies for the builder.
    withDependencies: function (appLevelDependencies) {
      this.dependencies = appLevelDependencies;
      return this;
    },

    // Builds and bootstraps an Angular module for testing.
    build: function (moduleName, app, featureOptions) {
      var self = this;

      // Create a mock Angular module that depends on the target module and 'ng'.
      var mockModule = angular.module("lool", [moduleName, "ng"]);

      mockModule.config(function ($provide) {
        // Provide a mock $rootElement for consistent testing environment.
        $provide.provider("$rootElement", function () {
          this.$get = function () {
            return $("#Moaha"); // Return a dummy element.
          };
        });

        // Decorate $controller service if multiple controllers feature is enabled.
        if (multipleControllersFeature(featureOptions)) {
          $provide.decorator("$controller", function ($delegate) {
            return function (ctrlName, deps) {
              if (ctrlName === hackDependencies.rootControllerName) {
                logDebug("Resolving root controller " + ctrlName);

                // If root controller has specific dependencies, extend them.
                if (hackDependencies[ctrlName]) {
                  return $delegate(ctrlName, _.extend({}, deps, hackDependencies[ctrlName], { $scope: _.extend(deps.$scope, hackDependencies.$scope) }));
                }
                // Otherwise, just extend the scope.
                return $delegate(ctrlName, { $scope: _.extend(deps.$scope, hackDependencies.$scope) });
              }
              logDebug("Resolving controller " + ctrlName);
              // For other controllers, extend with their specific dependencies if available.
              if (hackDependencies[ctrlName]) {
                return $delegate(ctrlName, _.extend({}, deps, hackDependencies[ctrlName], { $scope: _.extend(deps.$scope, hackDependencies[ctrlName].$scope) }));
              }
              return $delegate(ctrlName, deps); // Default behavior.
            };
          });
        }

        // Register custom dependencies provided to the builder.
        _.each(_.keys(self.dependencies), function (appDependencyKey) {
          if (typeof self.dependencies[appDependencyKey] === "function") {
            logDebug("Using function to resolve dependency: " + self.dependencies[appDependencyKey]);

            // If dependency is a function, execute it to register.
            var v = self.dependencies[appDependencyKey]($provide, mockModule);
          } else {
            // Otherwise, provide it as a constant value.
            $provide.provider(appDependencyKey, function () {
              this.$get = function () {
                return self.dependencies[appDependencyKey];
              };
            });
          }
        });
      });

      // Bootstrap the mock module to get an injector.
      var injector = angular.bootstrap($("#null" + new Date().getMilliseconds()), ["lool"]);
      // Return a new Container instance with the created injector.
      return new Container(injector, mockModule, featureOptions);
    }
  };


  // DuckUIInteraction provides methods for simulating user interactions and waiting for asynchronous operations.
  var DuckUIInteraction = function DuckUIInteraction(duckDom) {
    var self = this; // Cache 'this'.
    this.with = function (selector, value) {
      self.interaction = function () {
        duckDom.interactWith(selector, value); // Define interaction.
      };
      return self; // Allow chaining.
    };

    this.run = function () {
      self.interaction(); // Execute the defined interaction.
      return self; // Allow chaining.
    };

    // Waits for an asynchronous function to complete before resolving.
    this.waitFor = function (o, fn) {
      var deferred = Q.defer(); // Create a deferred object.
      var originalFn = o[fn]; // Store the original function.

      o[fn] = function () {
        var originalPromise = originalFn.apply(o, arguments); // Call original function.

        function resolveOriginalFunction() {
          duckDom.apply(); // Apply digest cycle.
          o[fn] = originalFn; // Restore original function.
          deferred.resolve(); // Resolve the deferred.
        }

        if (originalPromise && originalPromise.then) {
          // If original function returns a promise, wait for it.
          originalPromise.then(function (result) {
            resolveOriginalFunction();
            return result;
          }, function (errors) {
            duckDom.apply();
            o[fn] = originalFn;
            deferred.reject(errors); // Reject on error.
          });
        } else {
          // Otherwise, resolve immediately.
          resolveOriginalFunction();
        }
      };
      self.run(); // Trigger the interaction that calls the wrapped function.
      return deferred.promise; // Return the promise.
    };

    // Waits for a synchronous function to complete before resolving.
    this.waitForSync = function (o, fn) {
      var deferred = Q.defer();
      var originalFn = o[fn];

      o[fn] = function () {
        var result = originalFn.apply(o, arguments); // Call original function.
        duckDom.apply(); // Apply digest cycle.
        deferred.resolve(); // Resolve immediately after sync function.
        return result;
      };
      self.run(); // Trigger the interaction.
      return deferred.promise;
    };
  };


  // DuckDOM provides methods for interacting with the DOM within a test context.
  var DuckDOM = function DuckDOM(view, scope) {
    var self = this;

    // Safely applies a digest cycle to the scope.
    var applySafely = function () {
      if (!scope.$$phase) {
        try {
          scope.$apply();
        } catch (e) {
          console.log("Apply failed");
          console.log(e);
        }
      }
    };

    // Emits an event on the scope and applies changes.
    this.emit = function (ev, args) {
      scope.$emit(ev, args);
      applySafely();
    };

    // Broadcasts an event down the scope hierarchy and applies changes.
    this.broadcast = function (ev, args) {
      scope.$broadcast(ev, args);
      applySafely();
    };

    // Applies a command within a digest cycle.
    this.applyAndDo = function (command) {
      var deferred = Q.defer();
      scope.$apply(function () {
        command();
        deferred.resolve();
      });
      return deferred.promise;
    };

    // Triggers a DOM event on elements matching the selector.
    this.trigger = function (selector, event) {
      var elements = angular.element(selector, view);
      elements.trigger(event);
    };

    // Waits for a specific DOM event to occur on an element.
    this.on = function (selector, ev) {
      var defer = Q.defer();
      self.element(selector).on(ev, function () {
        defer.resolve();
      });
      return defer.promise;
    };

    // Placeholder for interactWith method (implementation not shown in original snippet).
    this.interactWith = function (selector, value, promise) {
      // ... (implementation would go here)
    };
  };