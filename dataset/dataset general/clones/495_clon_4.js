const systemLog = (message) => {
  if (typeof (DEBUG_ENABLED) !== "undefined" && DEBUG_ENABLED) {
    console.log(`[Framework DEBUG] ${message}`);
  }
};

const fetchModuleContent = async (modulePaths, PromiseLib) => {
  const contentPromises = modulePaths.map(path => {
    if (path.startsWith('text!')) {
      const url = path.substring(5);
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Failed to load ${url}: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error(`Network error loading ${url}`));
        xhr.send();
      });
    }
    return Promise.resolve(`Mock content for ${path}`);
  });
  return PromiseLib.all(contentPromises);
};

const testSetupProvider = (utilityBelt, ngCore, PromiseLib, jQueryUtil) => {
  const temporaryOverrides = {};

  class EnvironmentManager {
    constructor(dependencyResolver, applicationModule, operationalModes) {
      operationalModes = operationalModes || {};
      systemLog(`Operational Modes: ${JSON.stringify(operationalModes)}`);

      if (operationalModes.baseAddress && operationalModes.textPluginPath) {
        if (typeof require !== 'undefined' && typeof require.config === 'function') {
          systemLog(`Configuring module loader with: ${operationalModes.baseAddress}, ${operationalModes.textPluginPath}`);
          require.config({
            baseUrl: operationalModes.baseAddress,
            paths: {
              text: operationalModes.textPluginPath
            }
          });
        }
      }

      this.instanceContext = this;
      this.settings = {};
      this.dependencyResolver = dependencyResolver;
      this.controlUnitFactory = this.dependencyResolver.get("$controller");
      this.globalScope = this.dependencyResolver.get("$rootScope");
      this.templateCompiler = this.dependencyResolver.get("$compile");
      this.displayTransformers = [];

      this.addDisplayTransformer = (transformer) => {
        this.displayTransformers.push(transformer);
      };

      this.addDisplayTransformers = (transformers) => {
        utilityBelt.forEach(transformers, (transformer) => {
          systemLog(`Adding display transformer: ${transformer}`);
          this.displayTransformers.push(transformer);
        });
      };

      this.createChildContext = () => {
        return this.globalScope.$new();
      };

      this.buildFragmentFromHtml = (htmlContent) => {
        const tempContainer = ngCore.element("<div></div>");
        tempContainer.append(htmlContent);
        return tempContainer;
      };

      this.cleanScopedElements = (fragment) => {
        fragment.find("[modal]").removeAttr("modal");
        fragment.find("[options]").removeAttr("options");
        if (!multiControlUnitSupport(operationalModes)) {
          fragment.find("[ng-controller]").remove();
        }
        return fragment;
      };

      this.resolveDependency = (dependencyName) => {
        return dependencyResolver.get(dependencyName);
      };

      this.calculateTemplateDepth = async (domFragment) => {
        const extractTemplateReference = (elementNode) => {
          if (elementNode.hasAttribute("src")) {
            return elementNode.getAttribute("src").replace(/'/g, "");
          }
          if (elementNode.hasAttribute("ng-include")) {
            return elementNode.getAttribute("ng-include").replace(/'/g, "");
          }
          return null;
        };

        const recursivelyProcessTemplates = async (currentHtmlContent) => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = currentHtmlContent;

          const includeNodes = Array.from(tempDiv.querySelectorAll("[ng-include]"));

          if (includeNodes.length === 0) {
            return 1;
          }

          const nestedLoadPromises = includeNodes.map(async (node) => {
            const templatePath = extractTemplateReference(node);
            if (!templatePath) return 0;

            try {
              const [loadedContent] = await fetchModuleContent([`text!${templatePath}`], PromiseLib);
              
              let sanitizedContent = loadedContent;
              if (!multiControlUnitSupport(operationalModes)) {
                sanitizedContent = sanitizedContent.replace(/ng-controller/g, 'no-controller');
              }

              return await recursivelyProcessTemplates(sanitizedContent);
            } catch (error) {
              systemLog(`Error loading nested template ${templatePath}: ${error.message}`);
              return 0;
            }
          });

          const subCounts = await PromiseLib.all(nestedLoadPromises);
          const totalNestedCount = subCounts.reduce((sum, count) => sum + count, 0);

          return 1 + totalNestedCount;
        };

        const initialContent = domFragment.html ? domFragment.html() : domFragment.innerHTML;
        return await recursivelyProcessTemplates(initialContent);
      };

      this.processAndRenderTemplate = async (rawViewContent, activeContext, preRenderAction) => {
        const enclosingFragment = this.cleanScopedElements(this.buildFragmentFromHtml(rawViewContent));
        if (preRenderAction) {
          systemLog(`Running pre-render action with context: ${activeContext}`);
          preRenderAction(this.dependencyResolver, activeContext);
        }

        let resolveAllFragmentsReady;
        let rejectAllFragmentsReady;
        this.allFragmentsReadySignal = PromiseLib.defer(); // Use PromiseLib.defer() if available, otherwise native Promise.
        this.allFragmentsReadySignal.promise = new Promise((resolve, reject) => {
          resolveAllFragmentsReady = resolve;
          rejectAllFragmentsReady = reject;
        });

        const templateCount = await this.calculateTemplateDepth(enclosingFragment);
        this.totalFragmentCount = templateCount - 1;

        if (this.settings.dontWait || !this.totalFragmentCount || this.totalFragmentCount === 0) {
          systemLog("All fragments have been loaded.");
          resolveAllFragmentsReady();
        }

        systemLog(`Total fragment count = ${this.totalFragmentCount}`);
        let loadedFragmentCounter = 0;

        activeContext.$on("$includeContentLoaded", () => {
          systemLog("Loading a fragment.");
          loadedFragmentCounter++;
          if (loadedFragmentCounter === this.totalFragmentCount) {
            resolveAllFragmentsReady();
          }
        });

        await this.allFragmentsReadySignal.promise;

        systemLog("Binding template to context");
        const renderedOutput = this.templateCompiler(enclosingFragment)(activeContext);
        this.safelyUpdateContext(activeContext);
        return renderedOutput;
      };

      this.safelyUpdateContext = (activeContext) => {
        if (!activeContext.$$phase) {
          systemLog("Running $digest cycle");
          activeContext.$apply();
        }
      };

      this.transformDisplay = (rawViewContent) => {
        utilityBelt.forEach(this.displayTransformers, (transformer) => {
          systemLog(`Transforming view through ${transformer}`);
          rawViewContent = transformer(rawViewContent);
        });
        return rawViewContent;
      };

      this.augmentContext = (sourceContext, targetContext) => {
        if (targetContext && targetContext.$parent) {
          targetContext.$parent = this.augmentContext(sourceContext.$parent, targetContext.$parent);
        }
        return utilityBelt.extend(sourceContext, targetContext || {});
      };

      this.augmentContexts = (sourceContext, injectedResources, controlUnitIdentifier) => {
        if (multiControlUnitSupport(operationalModes)) {
          injectedResources[controlUnitIdentifier].$scope = this.augmentContext(sourceContext, injectedResources[controlUnitIdentifier].$scope);
          return injectedResources;
        } else {
          return this.augmentContext(sourceContext, injectedResources.$scope);
        }
      };

      this.renderView = async (viewPath, activeContext, preRenderAction) => {
        const completionSignal = PromiseLib.defer();
        systemLog(`Loading ${viewPath}`);
        try {
          const [rawViewContent] = await fetchModuleContent([`text!${viewPath}`], PromiseLib);
          systemLog(`Loaded ${viewPath}`);

          let processedContent = rawViewContent;
          if (!multiControlUnitSupport(operationalModes)) {
            systemLog("Multiple control unit support not enabled.");
            processedContent = processedContent.replace(/ng-controller/g, "no-controller");
          } else {
            systemLog("Multiple control unit support is enabled.");
          }
          processedContent = this.transformDisplay(processedContent);
          processedContent = processedContent.replace(/ng-app/g, "no-app");

          const assembledOutput = await this.processAndRenderTemplate(processedContent, activeContext, preRenderAction);
          completionSignal.resolve(assembledOutput);
        } catch (err) {
          console.error("Failed to load or process view:", err);
          completionSignal.reject(err);
        }
        return completionSignal.promise;
      };

      this.manageControlUnit = (controlUnitIdentifier, injectedResources, isAsynchronous, controlUnitReadyPromise) => {
        systemLog("Building control unit");
        let controlUnit;
        injectedResources = injectedResources || {};
        if (multiControlUnitSupport(operationalModes)) {
          systemLog(`Multiple control unit support enabled, injected resources: ${injectedResources}`);
          temporaryOverrides.rootControlUnitIdentifier = controlUnitIdentifier;
          controlUnit = this.controlUnitFactory(controlUnitIdentifier, {
            $scope: injectedResources.$scope
          });
        } else {
          controlUnit = this.controlUnitFactory(controlUnitIdentifier, injectedResources);
        }

        if (!isAsynchronous) {
          systemLog("Async convention disabled, resolving early.");
          return PromiseLib.resolve({});
        }

        systemLog("Async support enabled, searching for control unit ready promise");
        const completionSignal = PromiseLib.defer();
        controlUnitReadyPromise = controlUnitReadyPromise ? controlUnitReadyPromise(controlUnit) : controlUnit.loaded;
        systemLog(`Does control unit ready promise exist? ${controlUnitReadyPromise !== null}`);

        controlUnitReadyPromise.then(() => {
          systemLog("Control unit is loaded, resolving");
          completionSignal.resolve(controlUnit);
        });
        return completionSignal.promise;
      };

      this.processDirective = (targetElement) => {
        const completionSignal = PromiseLib.defer();
        const activeContext = this.createChildContext();
        this.processAndRenderTemplate(targetElement.html(), activeContext).then((assembledOutput) => {
          completionSignal.resolve([activeContext, assembledOutput]);
        });
        return completionSignal.promise;
      };

      this.documentMvc = (controlUnitIdentifier, viewPath, injectedResources, settings) => {
        injectedResources = injectedResources || {};
        return this.modelViewController(controlUnitIdentifier, viewPath, injectedResources, settings)
          .then((contextViewControlUnit) => {
            const domHandle = new DocumentObjectModelWrapper(contextViewControlUnit.view, contextViewControlUnit.scope);
            return [domHandle, contextViewControlUnit];
          });
      };

      this.modelViewController = (controlUnitIdentifier, viewPath, injectedResources, settings) => {
        this.settings = settings || {
          dontWait: false,
          async: false,
          controlUnitReadyPromise: null
        };
        this.settings.preBindHook = this.settings.preBindHook || (() => {});
        this.settings.preRenderHook = this.settings.preRenderHook || (() => {});
        injectedResources = injectedResources || {};
        const activeContext = this.createChildContext();
        systemLog("START Pre-bind hook");
        this.settings.preBindHook(activeContext);
        systemLog("STOP Pre-bind hook");

        if (multiControlUnitSupport(operationalModes)) {
          injectedResources = this.augmentContexts(activeContext, injectedResources, controlUnitIdentifier);
        } else {
          injectedResources.$scope = this.augmentContexts(activeContext, injectedResources, controlUnitIdentifier);
        }

        const controlUnitPromise = this.manageControlUnit(controlUnitIdentifier, injectedResources, this.settings.async || false,
          this.settings.controlUnitReadyPromise);
        const templatePromise = this.renderView(viewPath, activeContext, this.settings.preRenderHook);

        return PromiseLib.all([controlUnitPromise, templatePromise]).then(([controlUnit, renderedOutput]) => {
          return this.allFragmentsReadySignal.promise.then(() => {
            return {
              controlUnit: controlUnit,
              view: renderedOutput,
              scope: activeContext
            };
          });
        });
      };
    }
  }

  const multiControlUnitSupport = (operationalModes) => {
    return operationalModes && operationalModes.multipleControllers;
  };

  const ConfigurationAssembler = {
    providedResources: {},
    initialResourceCache: {},
    initialProvisioning: null,

    fetchRemoteContent: (url) => {
      const completionSignal = PromiseLib.defer();
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onload = () => {
        const responseData = xhr.responseText;
        completionSignal.resolve(responseData);
      };
      xhr.onerror = (err) => {
        console.error("Content retrieval failed", err);
        completionSignal.reject(err);
      };
      xhr.send();
      return completionSignal.promise;
    },

    storeTemplateAsset: (applicationModule, templateIdentifier, actualTemplateContent) => {
      const instanceContext = ConfigurationAssembler;

      const depositTemplate = (templateText) => {
        applicationModule.run(($templateCache) => {
          systemLog(`Caching template with ID ${templateIdentifier}`);
          $templateCache.put(templateIdentifier, templateText);
        });
        return instanceContext;
      };

      const isHtmlString = (value) => {
        return /<[a-z][\s\S]*>/i.test(value);
      };

      if (isHtmlString(actualTemplateContent)) {
        return PromiseLib.resolve(actualTemplateContent).then(depositTemplate);
      } else {
        return ConfigurationAssembler.fetchRemoteContent(actualTemplateContent).then(depositTemplate);
      }
    },

    storeTemplateAssets: (applicationModule, templateMapping) => {
      if (utilityBelt.isEmpty(templateMapping)) return PromiseLib.resolve(ConfigurationAssembler);
      const instanceContext = ConfigurationAssembler;
      return PromiseLib.all(utilityBelt.map(utilityBelt.pairs(templateMapping), (pair) => {
        return ConfigurationAssembler.storeTemplateAsset(applicationModule, pair[0], pair[1]);
      })).then(() => {
        return instanceContext;
      });
    },

    withResourceOverrides: (appLevelResources) => {
      ConfigurationAssembler.providedResources = appLevelResources;
      return ConfigurationAssembler;
    },

    constructEnvironment: (moduleIdentifier, applicationModule, operationalModes) => {
      const simulatedModule = ngCore.module("testHarnessModule", [moduleIdentifier, "ng"]);
      simulatedModule.config(($provide) => {
        $provide.provider("$rootElement", function() {
          this.$get = () => jQueryUtil("#Moaha");
        });

        if (multiControlUnitSupport(operationalModes)) {
          $provide.decorator("$controller", ($delegate) => {
            return (ctrlName, deps) => {
              if (ctrlName === temporaryOverrides.rootControlUnitIdentifier) {
                systemLog(`Resolving root control unit ${ctrlName}`);
                if (temporaryOverrides[ctrlName]) return $delegate(ctrlName, utilityBelt.extend({}, deps, temporaryOverrides[ctrlName], {
                  $scope: utilityBelt.extend(deps.$scope, temporaryOverrides.$scope)
                }));
                return $delegate(ctrlName, {
                  $scope: utilityBelt.extend(deps.$scope, temporaryOverrides.$scope)
                });
              }
              systemLog(`Resolving control unit ${ctrlName}`);
              if (temporaryOverrides[ctrlName]) return $delegate(ctrlName, utilityBelt.extend({}, deps, temporaryOverrides[ctrlName], {
                $scope: utilityBelt.extend(deps.$scope, temporaryOverrides[ctrlName].$scope)
              }));
              return $delegate(ctrlName, deps);
            };
          });
        }

        utilityBelt.forEach(utilityBelt.keys(ConfigurationAssembler.providedResources), (resourceKey) => {
          if (typeof ConfigurationAssembler.providedResources[resourceKey] === "function") {
            systemLog(`Using function to resolve resource: ${ConfigurationAssembler.providedResources[resourceKey]}`);
            ConfigurationAssembler.providedResources[resourceKey]($provide, simulatedModule);
          } else {
            $provide.provider(resourceKey, function() {
              this.$get = () => ConfigurationAssembler.providedResources[resourceKey];
            });
          }
        });
      });

      const dependencyInjector = ngCore.bootstrap(jQueryUtil("#null" + new Date().getMilliseconds()), ["testHarnessModule"]);
      return new EnvironmentManager(dependencyInjector, simulatedModule, operationalModes);
    }
  };

  class UserInterfaceInteraction {
    constructor(domHandle) {
      this.instanceContext = this;
      this.actionPerformer = null;

      this.with = (targetSelector, inputPayload) => {
        this.actionPerformer = () => {
          domHandle.performInteraction(targetSelector, inputPayload);
        };
        return this.instanceContext;
      };

      this.executeAction = () => {
        this.actionPerformer();
        return this.instanceContext;
      };

      this.awaitCompletion = (targetObject, methodName) => {
        const completionSignal = PromiseLib.defer();
        const initialMethod = targetObject[methodName];
        targetObject[methodName] = (...args) => {
          const invokedPromise = initialMethod.apply(targetObject, args);

          const finalizeMethodInvocation = () => {
            domHandle.updateAndApply();
            targetObject[methodName] = initialMethod;
            completionSignal.resolve();
          };

          if (invokedPromise && typeof invokedPromise.then === 'function') {
            invokedPromise.then((result) => {
              finalizeMethodInvocation();
              return result;
            }, (failureReasons) => {
              domHandle.updateAndApply();
              targetObject[methodName] = initialMethod;
              completionSignal.reject(failureReasons);
            });
          } else {
            finalizeMethodInvocation();
          }
        };
        this.executeAction();
        return completionSignal.promise;
      };

      this.awaitSynchronousCompletion = (targetObject, methodName) => {
        const completionSignal = PromiseLib.defer();
        const initialMethod = targetObject[methodName];
        targetObject[methodName] = (...args) => {
          const operationResult = initialMethod.apply(targetObject, args);
          domHandle.updateAndApply();
          completionSignal.resolve();
          return operationResult;
        };
        this.executeAction();
        return completionSignal.promise;
      };
    }
  }

  class DocumentObjectModelWrapper {
    constructor(renderedDisplay, activeContext) {
      this.instanceContext = this;
      this.renderedDisplay = renderedDisplay;
      this.activeContext = activeContext;

      this.updateAndApply = () => {
        if (!activeContext.$$phase) {
          try {
            activeContext.$apply();
          } catch (e) {
            console.error("Context update failed", e);
          }
        }
      };

      this.dispatchMessage = (eventName, eventArgs) => {
        activeContext.$emit(eventName, eventArgs);
        this.updateAndApply();
      };

      this.propagateMessage = (eventName, eventArgs) => {
        activeContext.$broadcast(eventName, eventArgs);
        this.updateAndApply();
      };

      this.commitAndExecute = (executionBlock) => {
        const completionSignal = PromiseLib.defer();
        activeContext.$apply(() => {
          executionBlock();
          completionSignal.resolve();
        });
        return completionSignal.promise;
      };

      this.simulateEvent = (targetSelector, eventType) => {
        const elements = ngCore.element(targetSelector, renderedDisplay);
        elements.trigger(eventType);
      };

      this.listenForEvent = (targetSelector, eventType) => {
        const completionSignal = PromiseLib.defer();
        ngCore.element(targetSelector, renderedDisplay).on(eventType, () => {
          completionSignal.resolve();
        });
        return completionSignal.promise;
      };

      this.performInteraction = (targetSelector, inputPayload) => {
        const targetElement = ngCore.element(targetSelector, renderedDisplay);
        if (targetElement.is("input, textarea, select")) {
          targetElement.val(inputPayload);
          targetElement.trigger("change");
        } else {
          targetElement.trigger("click");
        }
        this.updateAndApply();
      };
    }
  }

  if (!PromiseLib.defer) {
    PromiseLib.defer = () => {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return {
        promise,
        resolve,
        reject
      };
    };
  }

  return {
    EnvironmentManager: EnvironmentManager,
    ConfigurationAssembler: ConfigurationAssembler,
    UserInterfaceInteraction: UserInterfaceInteraction,
    DocumentObjectModelWrapper: DocumentObjectModelWrapper,
    systemLog: systemLog,
    fetchModuleContent: fetchModuleContent
  };
};