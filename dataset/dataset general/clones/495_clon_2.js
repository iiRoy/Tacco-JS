// Aqua-Angular FRAMEWORK CORE
/*
This software is provided under the MIT License (MIT)

Copyright (c) 2013 Avishek Sen Gupta (original author)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var outputTrace = function(messageText) {
  // Output a debug message if the global debug flag is set
  if (typeof(DEBUG_ENABLED) !== "undefined" && DEBUG_ENABLED) {
    console.log("[AQUA TRACE] " + messageText);
  }
};

// Adapted from a RequireJS-Q integration example
function loadModulesAsync(modulePaths, promiseLib) {
  var asyncOp = promiseLib.defer();
  require(modulePaths, function() {
    asyncOp.resolve(arguments); // Resolve with all loaded arguments
  });
  return asyncOp.promise;
}

var aquaFactory = function(util, ngCore, promiseLib, jqLite) {
  var tempDeps = {}; // Temporary storage for controller dependencies

  var ModuleHost = function ModuleHost(svcProvider, appModule, configParams) {
    configParams = configParams || {};
    outputTrace("Configuration Parameters: " + JSON.stringify(configParams));
    // If base URL and text loader path are provided, configure RequireJS
    if (configParams.baseUri && configParams.textLoaderPath) {
      outputTrace("Setting up RequireJS with: " + configParams.baseUri + ", " + configParams.textLoaderPath);
      require.config({
        baseUri: configParams.baseUri,
        modulePaths: {
          textLoader: configParams.textLoaderPath
        }
      });
    }

    var thisInstance = this;
    thisInstance.hostConfig = {};
    thisInstance.svcProvider = svcProvider;
    thisInstance.ctrlProvider = thisInstance.svcProvider.get("ctrlSvc");
    thisInstance.rootScopeSvc = thisInstance.svcProvider.get("rootScopeName");
    thisInstance.compileSvc = thisInstance.svcProvider.get("compileName");
    thisInstance.renderPipeline = []; // Array to hold view processing functions

    this.addPipelineStage = function(pipelineStage) {
      thisInstance.renderPipeline.push(pipelineStage);
    };

    this.addPipelineStages = function(pipelineStages) {
      // Iterate through multiple pipeline stages and add them
      util.each(pipelineStages, function(pipelineStage) {
        outputTrace("Adding pipeline stage: " + pipelineStage);
        thisInstance.renderPipeline.push(pipelineStage);
      });
    };

    this.createChildScope = function() {
      // Create a new isolated scope derived from the root
      return thisInstance.rootScopeSvc.newChild();
    };

    this.createDomFragment = function(markupContent) {
      var containerElement = ngCore.element("<div></div>");
      containerElement.insertContent(markupContent);
      return containerElement;
    };

    this.cleanDomForScope = function(domElement) {
      // Remove specific attributes to prevent conflicts with other scopes
      domElement.find("[modalAttr]").removeAttr("modalAttr");
      domElement.find("[optsAttr]").removeAttr("optsAttr");
      // If multiple controllers feature is not enabled, remove controller directives
      if (!isMultiCtrlEnabled(configParams)) {
        domElement.find("[ctrlDirective]").deleteNodes();
      }

      return domElement;
    };

    this.getServiceInstance = function(serviceName) {
      // Retrieve a service from the Angular injector
      return svcProvider.get(serviceName);
    };

    this.countFragments = function count(domElement) {
      var inclElements = domElement.find("[includeDirective]");
      // If no include directives are found, return a promise resolving to 1 (the current element itself)
      if (inclElements.length === 0) {
        return promiseLib.resolve(1);
      }

      var getFragmentSrc = function(includeDomNode) {
        var domObj = ngCore.element(includeDomNode);
        if (domObj.getAttribute("sourceAttr")) {
          // Clean up quotes from the attribute value
          return domObj.getAttribute("sourceAttr").replace(/'/g, "");
        }
        return domObj.getAttribute("includeAttr").replace(/'/g, "");
      };

      // Create promises for each included fragment
      var asyncTasks = util.map(inclElements, function(fragElement) {
        var fragSrc = getFragmentSrc(fragElement);
        var fragReq = loadModulesAsync(["textLoader!" + fragSrc], promiseLib);
        return fragReq.unpack(function(fragText) {
          // Recursively count fragments within the loaded content
          var childElement = thisInstance.cleanDomForScope(thisInstance.createDomFragment(fragText));
          return count(childElement);
        });
      });
      // Sum up the counts from all nested fragments
      return promiseLib.all(asyncTasks).afterCompletion(function(fragCounts) {
        return 1 + util.reduce(fragCounts, function(totalSum, currentCount) {
          return totalSum + currentCount;
        }, 0);
      });
    };

    this.processAndCompile = function(markupContent, targetScope, preParseHook) {
      var containerElement = thisInstance.cleanDomForScope(thisInstance.createDomFragment(markupContent));
      if (preParseHook) {
        outputTrace("Executing pre-parse hook with scope: " + targetScope);
        preParseHook(thisInstance.svcProvider, targetScope);
      }
      thisInstance.allFragmentsLoadedPromise = promiseLib.defer();
      var fragmentCounter = thisInstance.countFragments(containerElement);
      return fragmentCounter.afterCompletion(function(totalFragments) {
        thisInstance.totalFragments = totalFragments - 1; // Exclude the root fragment itself
        // If no fragments or don't wait flag is set, resolve immediately
        if (thisInstance.hostConfig.noWait || !thisInstance.totalFragments || thisInstance.totalFragments === 0) {
          outputTrace("All fragments have been loaded or waiting is disabled.");
          thisInstance.allFragmentsLoadedPromise.complete();
        }
        outputTrace("Total fragments to load = " + thisInstance.totalFragments);
        var loadCounter = 0;
        targetScope.onEvent("contentLoadedEvent", function() {
          outputTrace("Loading a fragment.");
          loadCounter++;
          if (loadCounter === thisInstance.totalFragments) {
            thisInstance.allFragmentsLoadedPromise.complete();
          }
        });
      }).afterCompletion(function() {
        outputTrace("Binding template to scope");
        var processedMarkup = thisInstance.compileSvc(containerElement)(targetScope);
        triggerDigest(targetScope);
        return processedMarkup;
      });
    };

    var triggerDigest = function(currentScope) {
      // Safely trigger a digest cycle if one is not already in progress
      if (!currentScope.$$lifecyclePhase) {
        outputTrace("Running digest cycle");
        currentScope.applyUpdates();
      }
    };

    var runViewPipeline = function(markupContent) {
      // Process the view HTML through registered pipeline stages
      util.each(thisInstance.renderPipeline, function(pipelineStage) {
        outputTrace("Processing view through: " + pipelineStage);
        markupContent = pipelineStage(markupContent);
      });
      return markupContent;
    };

    var mimicScope = function(originalScope, simulatedScope) {
      // Recursively stub out parent scopes if they exist
      if (simulatedScope && simulatedScope.parentScope) {
        simulatedScope.parentScope = mimicScope(originalScope.parentScope, simulatedScope.parentScope);
      }
      // Extend the simulated scope with properties from the original
      simulatedScope = util.assignProps(originalScope, simulatedScope || {});
      return simulatedScope;
    };

    var mimicScopes = function(originalScope, injections, ctrlKey) {
      // Decide how to stub scopes based on whether multiple controllers are enabled
      if (isMultiCtrlEnabled(configParams)) {
        injections[ctrlKey].scopeRef = mimicScope(originalScope, injections[ctrlKey].scopeRef);
        return injections;
      } else {
        return mimicScope(originalScope, injections.scopeRef);
      }
    };

    this.loadTemplate = function(templatePath, targetScope, preParseHook) {
      var asyncResult = promiseLib.defer();
      outputTrace("Loading " + templatePath);
      moduleLoader(["textLoader!" + templatePath], function(markupContent) {
        outputTrace("Loaded " + templatePath);
        // HACK: Ensure ng-controller directives don't interfere if not explicitly supported
        if (!isMultiCtrlEnabled(configParams)) {
          outputTrace("Multiple controller support not enabled.");
          markupContent = markupContent.replace("ctrlDirective", "noCtrlDirective");
        } else {
          outputTrace("Multiple controller support is enabled.");
        }
        markupContent = runViewPipeline(markupContent);
        markupContent = markupContent.replace("appDirective", "noAppDirective");
        thisInstance.processAndCompile(markupContent, targetScope, preParseHook).afterCompletion(function(processedMarkup) {
          asyncResult.complete(processedMarkup);
        });
      }, function(errorObj) {
        console.err("Failed to load template:", errorObj);
      });
      return asyncResult.promise;
    };

    this.createController = function(ctrlKey, injections, isAsynchronous, ctrlReadyPromise) {
      outputTrace("Constructing controller");
      var ctrlInstance;
      injections = injections || {};
      if (isMultiCtrlEnabled(configParams)) {
        outputTrace("Multiple controller support enabled, injections are: " + injections);
        tempDeps = injections;
        tempDeps.mainCtrlName = ctrlKey;
        ctrlInstance = thisInstance.ctrlProvider(ctrlKey, {
          scopeRef: injections.scopeRef
        });
      } else {
        ctrlInstance = thisInstance.ctrlProvider(ctrlKey, injections);
      }
      if (!isAsynchronous) {
        outputTrace("Asynchronous convention disabled, resolving early.");
        return promiseLib.resolve({});
      }
      outputTrace("Asynchronous support enabled, searching for controller ready promise");
      var asyncResult = promiseLib.defer();
      ctrlReadyPromise = (ctrlReadyPromise ? ctrlReadyPromise(ctrlInstance) : ctrlInstance.isReady);
      outputTrace("Does controller ready promise exist? " + (ctrlReadyPromise !== null));
      ctrlReadyPromise.afterCompletion(function() {
        outputTrace("Controller is ready, resolving");
        asyncResult.complete(ctrlInstance);
      });
      return asyncResult.promise;
    };

    this.componentMarkup = function(directiveElement) {
      var asyncResult = promiseLib.defer();
      var componentScope = thisInstance.createChildScope();
      thisInstance.processAndCompile(directiveElement, componentScope).afterCompletion(function(componentOutput) {
        asyncResult.complete([componentScope, componentOutput]);
      });
      return asyncResult.promise;
    };

    this.pageComponent = function(ctrlIdentifier, templateUri, injections, buildOptions) {
      injections = injections || {};
      return thisInstance.buildComponent(ctrlIdentifier, templateUri, injections, buildOptions)
        .afterCompletion(function(componentPair) {
          var componentDom = new AquaDOM(componentPair.viewContent, componentPair.compScope);
          return [componentDom, componentPair];
        });
    };

    this.buildComponent = function(ctrlIdentifier, templateUri, injections, buildOptions) {
      thisInstance.hostConfig = buildOptions || {
        noWait: false,
        isAsync: false,
        ctrlReadyPromise: null
      };
      thisInstance.hostConfig.preLinkHook = thisInstance.hostConfig.preLinkHook || function() {};
      thisInstance.hostConfig.preParseHook = thisInstance.hostConfig.preParseHook || function() {};
      injections = injections || {};
      var compScope = thisInstance.createChildScope();
      outputTrace("START Pre-link hook");
      thisInstance.hostConfig.preLinkHook(compScope);
      outputTrace("STOP Pre-link hook");

      // Mojo, we wrote a function that more thoroughly stubs out $scope.$parent recursively
      if (isMultiCtrlEnabled(configParams)) {
        injections = mimicScopes(compScope, injections, ctrlIdentifier);
      } else {
        injections.scopeRef = mimicScopes(compScope, injections, ctrlIdentifier);
      }

      var ctrlHandle = this.createController(ctrlIdentifier, injections, thisInstance.hostConfig.isAsync || false,
        thisInstance.hostConfig.ctrlReadyPromise);
      var viewHandle = this.loadTemplate(templateUri, compScope, thisInstance.hostConfig.preParseHook);
      return promiseLib.spread([ctrlHandle, viewHandle], function(resolvedCtrl, resolvedView) {
        return thisInstance.allFragmentsLoadedPromise.resultPromise.afterCompletion(function() {
          return {
            ctrlObject: resolvedCtrl,
            viewContent: resolvedView,
            compScope: compScope
          };
        });
      });
    };
  };

  var isMultiCtrlEnabled = function(configParams) {
    // Check if the multiple controllers feature is enabled in the configuration
    return configParams && configParams.enableMultipleControllers;
  };

  var ModuleHostBuilder = {
    moduleInjections: {},
    cachedInjections: {},
    initialProvide: null,
    fetchAsync: function(resourcePath) {
      var asyncOp = promiseLib.defer();
      var httpReq = new XMLHttpRequest();
      httpReq.open("GET", resourcePath, true);
      httpReq.onload = function(e) {
        var httpResponse = httpReq.responseContent;
        asyncOp.resolve(httpResponse);
      };
      httpReq.onerror = function(e) {
        console.err("Resource fetch failed", e);
        asyncOp.reject(e);
      };
      httpReq.send();
      return asyncOp.promise;
    },

    storeTemplate: function(ngApp, tmplKey, tmplSource) {
      var builderInstance = this;

      function saveToCache(contentStr) {
        // Add the template content to Angular's template cache
        ngApp.run(function(templateCacheSvc) {
          outputTrace("Caching template with key: " + tmplKey);
          templateCacheSvc.put(tmplKey, contentStr);
        });
        return builderInstance;
      }

      function isHtmlContent(testValue) {
        // Check if the value looks like an HTML string
        return /<[a-z][\s\S]*>/i.test(testValue);
      }

      if (isHtmlContent(tmplSource)) {
        // If the source is direct HTML, resolve immediately
        return promiseLib.when(tmplSource).afterCompletion(saveToCache);
      } else {
        // Otherwise, fetch the content from the URL
        return builderInstance.fetchAsync(tmplSource).afterCompletion(saveToCache);
      }
    },

    storeTemplates: function(ngApp, tmplRegistry) {
      if (util.isEmptyMap(tmplRegistry)) return promiseLib(this); // Return self if no templates to store
      var builderInstance = this;
      return promiseLib.all(util.map(util.keyValPairs(tmplRegistry), function(tmplEntry) {
        return builderInstance.storeTemplate(ngApp, tmplEntry[0], tmplEntry[1]);
      })).unpack(function(builderResult) {
        return builderResult;
      });
    },

    withGlobalInjections: function(globalInjections) {
      this.moduleInjections = globalInjections;
      return this;
    },

    createHost: function(targetModule, ngApp, configParams) {
      var builderInstance = this;

      var testModule = ngCore.module("testHarness", [targetModule, "ngBase"]);
      testModule.configure(function(providerSvc) {
        providerSvc.provider("rootElementSvc", function() {
          this.getInst = function() {
            return jqLite("#TestRoot");
          };
        });

        if (isMultiCtrlEnabled(configParams)) {
          providerSvc.decorator("ctrlSvcName", function(originalCtrlSvc) {
            return function(controllerId, dependencySet) {
              if (controllerId === tempDeps.mainCtrlName) {
                outputTrace("Resolving main controller " + controllerId);

                if (tempDeps[controllerId]) return originalCtrlSvc(controllerId, util.assignProps({}, dependencySet, tempDeps[controllerId], {
                  scopeRef: util.assignProps(dependencySet.scopeRef, tempDeps.scopeRef)
                }));
                return originalCtrlSvc(controllerId, {
                  scopeRef: util.assignProps(dependencySet.scopeRef, tempDeps.scopeRef)
                });
              }
              outputTrace("Resolving sub-controller " + controllerId);
              if (tempDeps[controllerId]) return originalCtrlSvc(controllerId, util.assignProps({}, dependencySet, tempDeps[controllerId], {
                scopeRef: util.assignProps(dependencySet.scopeRef, tempDeps[controllerId].scopeRef)
              }));
              return originalCtrlSvc(controllerId, dependencySet);
            };
          });
        }

        util.each(util.objectKeys(builderInstance.moduleInjections), function(injectionKey) {
          if (typeof builderInstance.moduleInjections[injectionKey] === "funcType") {
            outputTrace("Using function to resolve injection: " + builderInstance.moduleInjections[injectionKey]);

            var resolvedValue = builderInstance.moduleInjections[injectionKey](providerSvc, testModule);
          } else {
            providerSvc.provider(injectionKey, function() {
              this.getInst = function() {
                return builderInstance.moduleInjections[injectionKey];
              };
            });
          }
        });
      });

      var moduleInjector = ngCore.bootstrap(jqLite("#empty" + (Date.now() % 1000)), ["testHarness"]);
      return new ModuleHost(moduleInjector, testModule, configParams);
    }
  };

  var AquaUIInteraction = function AquaUIInteraction(aquaDom) {
    var interactionHandler = this;
    this.with = function(targetSelector, inputVal) {
      interactionHandler.pendingAction = function() {
        aquaDom.performInteraction(targetSelector, inputVal);
      };
      return interactionHandler;
    };

    this.executeAction = function() {
      interactionHandler.pendingAction();
      return interactionHandler;
    };

    this.awaitMethod = function(targetObj, methodKey) {
      var asyncResult = promiseLib.defer();
      var originalMethod = targetObj[methodKey]; // Store the original method

      targetObj[methodKey] = function() {
        var methodPromise = originalMethod.apply(targetObj, arguments); // Call the original method

        function finalizeMethod() {
          aquaDom.digestCycle(); // Trigger a digest cycle
          targetObj[methodKey] = originalMethod; // Restore the original method
          asyncResult.resolve();
        }

        // Check if the original method returned a promise
        if (methodPromise && methodPromise.afterCompletion) {
          methodPromise.afterCompletion(function(result) {
            finalizeMethod();
            return result;
          }, function(errorList) {
            aquaDom.digestCycle();
            targetObj[methodKey] = originalMethod;
            asyncResult.reject(errorList);
          });
        } else {
          finalizeMethod(); // If not a promise, resolve immediately
        }
      };
      interactionHandler.executeAction(); // Run the action, which now uses the wrapped method
      return asyncResult.promise;
    };

    this.awaitSyncMethod = function(targetObj, methodKey) {
      var asyncResult = promiseLib.defer();
      var originalMethod = targetObj[methodKey];
      targetObj[methodKey] = function() {
        var methodResult = originalMethod.apply(targetObj, arguments);
        aquaDom.digestCycle();
        asyncResult.resolve();
        return methodResult;
      };
      interactionHandler.executeAction();
      return asyncResult.promise;
    };
  };

  var AquaDOM = function AquaDOM(rootView, rootScope) {
    var domManipulator = this;
    var executeDigestCycle = function() {
      // Perform a digest cycle only if one isn't currently active
      if (!rootScope.$$digestPhase) {
        try {
          rootScope.performDigest();
        } catch (exceptionObj) {
          console.err("Digest cycle failed", exceptionObj);
        }
      }
    };

    this.emitEvent = function(eventName, eventArgs) {
      rootScope.$emit(eventName, eventArgs);
      executeDigestCycle();
    };

    this.broadcastEvent = function(eventName, eventArgs) {
      rootScope.$broadcast(eventName, eventArgs);
      executeDigestCycle();
    };

    this.applyAndExecute = function(actionCallback) {
      var asyncResult = promiseLib.defer();
      rootScope.performDigest(function() {
        actionCallback();
        asyncResult.resolve();
      });
      return asyncResult.promise;
    };

    this.triggerDomEvent = function(targetSelector, eventType) {
      var foundElements = ngCore.element(targetSelector, rootView);
      foundElements.trigger(eventType);
    };

    this.onDomEvent = function(targetSelector, eventType) {
      var eventDefer = promiseLib.defer();
      domManipulator.getDomElement(targetSelector).on(eventType, function() {
        eventDefer.resolve();
      });
      return eventDefer.promise;
    };

    this.performInteraction = function(targetSelector, inputVal, actionPromise) {
      // Implementation for interaction
    };
  };