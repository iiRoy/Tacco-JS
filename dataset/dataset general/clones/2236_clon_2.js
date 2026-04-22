(function executeModule(moduleDefinitions, loadedModules, entryPoints){
  function obtainModule(modulePath, isRoot){
    if(!loadedModules[modulePath]){
      if(!moduleDefinitions[modulePath]){
        var browserRequire=typeof acquireModule=="function"&&acquireModule;
        if(!isRoot&&browserRequire)return browserRequire(modulePath,!0);
        if(cachedAcquire)return cachedAcquire(modulePath,!0);
        var moduleError=new RuntimeError("Unable to locate module: '"+modulePath+"'");
        throw moduleError.code="MODULE_MISSING_ERROR",moduleError
      }
      var moduleInstance=loadedModules[modulePath]={exports:{}};
      moduleDefinitions[modulePath][0].call(moduleInstance.exports,function(dependencyName){
        var resolvedPath=moduleDefinitions[modulePath][1][dependencyName];
        return obtainModule(resolvedPath?resolvedPath:dependencyName)
      },moduleInstance,moduleInstance.exports,executeModule,moduleDefinitions,loadedModules,entryPoints)
    }
    return loadedModules[modulePath].exports
  }
  var cachedAcquire=typeof acquireModule=="function"&&acquireModule;
  for(var idx=0;idx<entryPoints.length;idx++)obtainModule(entryPoints[idx]);
  return obtainModule
})({
  "./demo/main-interface.js":[function(obtain,currentModule,moduleExports){
    "use strict";
    var ViewEngine = obtain("visual-lib");
    var WindowGateway = obtain("./path/to/window-gateway.js");

    var MainApplication = ViewEngine.createVisualComponent({
      componentLabel: "MainApplication",

      retrieveInitialStatus: function retrieveInitialStatus() {
        return { isGatewayActive: false };
      },

      displayContent: function displayContent() {
        var triggerBtnOne = ViewEngine.createVisualElement(
          "action-btn",
          null,
          "Launch overlay with temporary dialog"
        );
        var triggerBtnTwo = ViewEngine.createVisualElement(
          "action-btn",
          null,
          "Secondary overlay activation"
        );

        return ViewEngine.createVisualElement(
          "section",
          null,
          ViewEngine.createVisualElement(
            "heading-one",
            null,
            "Visual Library Overlay Demonstrations"
          ),
          ViewEngine.createVisualElement(
            "link-element",
            { href: "https://github.com/example/visual-overlays" },
            "https://github.com/example/visual-overlays"
          ),
          ViewEngine.createVisualElement(
            "paragraph",
            null,
            " "
          ),
          ViewEngine.createVisualElement(
            WindowGateway,
            { activateOnClick: triggerBtnOne, dismissOnEscape: true },
            ViewEngine.createVisualElement(
              OverlayDialog,
              null,
              ViewEngine.createVisualElement(
                "heading-two",
                null,
                "Temporary Dialog"
              ),
              ViewEngine.createVisualElement(
                "paragraph",
                null,
                "This visual element is attached directly to the page's main content area."
              ),
              ViewEngine.createVisualElement(
                "paragraph",
                null,
                "This is ",
                ViewEngine.createVisualElement(
                  "emphasis",
                  null,
                  "ideal for temporary dialogs, lightboxes, progress indicators, and more."
                ),
                "."
              ),
              ViewEngine.createVisualElement(
                "paragraph",
                null,
                "Dismiss this by pressing ",
                ViewEngine.createVisualElement(
                  "emphasis",
                  null,
                  "ESCAPE"
                ),
                "."
              ),
              ViewEngine.createVisualElement(
                "paragraph",
                null,
                ViewEngine.createVisualElement(
                  "emphasis",
                  null,
                  "Why 'temporary'?"
                ),
                " Because styling and appearance are left to your discretion. :-)"
              )
            )
          ),
          ViewEngine.createVisualElement(
            "action-btn",
            { onClick: this.switchActivityBar },
            this.status.isGatewayActive ? "Deactivate the secondary overlay" : "Activate the secondary overlay"
          ),
          ViewEngine.createVisualElement(
            WindowGateway,
            { isActive: this.status.isGatewayActive },
            ViewEngine.createVisualElement(ActivityIndicator, null)
          ),
          ViewEngine.createVisualElement(
            WindowGateway,
            { activateOnClick: triggerBtnTwo, dismissOnExternalClick: true },
            ViewEngine.createVisualElement(
              "section",
              { style: { outline: "1px solid #333", margin: "1rem", padding: "1rem" } },
              ViewEngine.createVisualElement(
                "paragraph",
                null,
                "Tap anywhere outside this overlay to dismiss it."
              )
            )
          )
        );
      },

      switchActivityBar: function switchActivityBar(eventObj) {
        this.updateStatus({ isGatewayActive: !this.status.isGatewayActive });
      }
    });

    var OverlayDialog = ViewEngine.createVisualComponent({
      componentLabel: "OverlayDialog",

      displayContent: function displayContent() {
        return ViewEngine.createVisualElement(
          "section",
          { style: { outline: "1px solid #00F", margin: "1rem", padding: "1rem" } },
          this.componentProperties.childElements,
          ViewEngine.createVisualElement(
            "paragraph",
            null,
            ViewEngine.createVisualElement(
              "action-btn",
              { onClick: this.componentProperties.deactivateGateway },
              "Dismiss"
            )
          )
        );
      }
    });

    var ActivityIndicator = ViewEngine.createVisualComponent({
      componentLabel: "ActivityIndicator",

      displayContent: function displayContent() {
        return ViewEngine.createVisualElement(
          "section",
          { style: { outline: "1px solid #0F0", margin: "1rem", padding: "1rem" } },
          ViewEngine.createVisualElement(
            "paragraph",
            null,
            "This functions as a progress indicator..."
          ),
          ViewEngine.createVisualElement(
            "paragraph",
            null,
            "This overlay is ",
            ViewEngine.createVisualElement(
              "emphasis",
              null,
              "activated by the property"
            ),
            " ",
            ViewEngine.createVisualElement(
              "italic",
              null,
              "isActive"
            ),
            "."
          ),
          ViewEngine.createVisualElement(
            "paragraph",
            null,
            "... when ",
            ViewEngine.createVisualElement(
              "italic",
              null,
              "activateOnClick"
            ),
            " is not sufficient."
          ),
          ViewEngine.createVisualElement(
            "paragraph",
            null,
            "Note: By default, this cannot be dismissed via ESC or an external click."
          )
        );
      }
    });

    ViewEngine.render(ViewEngine.createVisualElement(MainApplication), document.querySelector("#app-root"));

  },{
    "./path/to/window-gateway.js":"/app/components/window-gateway.js",
    "visual-lib":"/app/node_modules/visual-lib/visual-lib.js"
  }],
  "/app/components/window-gateway.js":[function(obtain,currentModule,moduleExports){
    "use strict";

    var _importDefault = function (moduleObj) { return moduleObj && moduleObj.__esModule ? moduleObj["default"] : moduleObj; };

    var _defineClassStructure = (function () {
      function setupProperties(targetObj, propList) {
        for (var propKey in propList) {
          var propDescriptor = propList[propKey];
          propDescriptor.configurable = true;
          if (propDescriptor.value) propDescriptor.writable = true;
        }
        Object.defineProperties(targetObj, propList);
      }
      return function (ClassConstructor, prototypeMethods, staticMethods) {
        if (prototypeMethods) setupProperties(ClassConstructor.prototype, prototypeMethods);
        if (staticMethods) setupProperties(ClassConstructor, staticMethods);
        return ClassConstructor;
      };
    })();

    var _getPropertyValue = function fetchProperty(sourceObject, propertyName, receiverObject) {
      var descriptor = Object.getOwnPropertyDescriptor(sourceObject, propertyName);
      if (descriptor === undefined) {
        var prototypeChain = Object.getPrototypeOf(sourceObject);
        if (prototypeChain === null) { return undefined; } else { return fetchProperty(prototypeChain, propertyName, receiverObject); }
      } else if ("value" in descriptor && descriptor.writable) { return descriptor.value; }
      else { var accessor = descriptor.get; if (accessor === undefined) { return undefined; } return accessor.call(receiverObject); }
    };

    var _extendPrototype = function (derivedClass, baseClass) {
      if (typeof baseClass !== "function" && baseClass !== null) {
        throw new TypeError("Base class must be a function or null, not " + typeof baseClass);
      }
      derivedClass.prototype = Object.create(baseClass && baseClass.prototype, { constructor: { value: derivedClass, enumerable: false, writable: true, configurable: true } });
      if (baseClass) derivedClass.__proto__ = baseClass;
    };

    var _verifyInstanceType = function (currentInstance, ExpectedConstructor) {
      if (!(currentInstance instanceof ExpectedConstructor)) {
        throw new TypeError("Cannot instantiate a class without 'new'");
      }
    };

    var _visualLib = obtain("visual-lib");

    var ViewEngine = _importDefault(_visualLib);

    var locateDOMNode = _visualLib.findDOMNode;

    var compareShallowly = _importDefault(obtain("visual-lib/utils/compareShallowly"));

    var KeyBinder = _importDefault(obtain("keybind-manager"));

    var WindowGateway = (function (_ViewEngine$VisualComponent) {
      function GatewayComponent() {
        _verifyInstanceType(this, GatewayComponent);
        _getPropertyValue(Object.getPrototypeOf(WindowGateway.prototype), "constructor", this).call(this);
        this.status = { isOpen: false };
        this.activateGateway = this.activateGateway.bind(this);
        this.deactivateGateway = this.deactivateGateway.bind(this);
        this.handleExternalClick = this.handleExternalClick.bind(this);
        this.gatewayInstance = null;
        this.targetNode = null;
      }

      _extendPrototype(WindowGateway, _ViewEngine$VisualComponent);

      _defineClassStructure(WindowGateway, {
        componentMounted: {
          value: function componentMounted() {
            var _self = this;
            if (this.componentProperties.dismissOnEscape) {
              KeyBinder("escape", function () {
                _self.deactivateGateway();
              });
            }

            if (this.componentProperties.dismissOnExternalClick) {
              document.addEventListener("pointerdown", this.handleExternalClick);
            }
          }
        },
        componentPreMount: {
          value: function componentPreMount() {
            if (this.componentProperties.isActive) {
              this.activateGateway();
            }
          }
        },
        componentPropsReceived: {
          value: function componentPropsReceived(nextProperties) {
            if (nextProperties.isActive === undefined) {
              if (!this.status.isOpen) { return; }
              this.displayGateway(nextProperties);
            } else {
              if (nextProperties.isActive) {
                if (this.status.isOpen) { return; }
                this.activateGateway();
              } else {
                if (!this.status.isOpen) { return; }
                this.deactivateGateway();
              }
            }
          }
        },
        componentUnmounting: {
          value: function componentUnmounting() {
            if (this.componentProperties.dismissOnEscape) {
              KeyBinder.release("escape");
            }

            if (this.componentProperties.dismissOnExternalClick) {
              document.removeEventListener("pointerdown", this.handleExternalClick);
            }

            this.deactivateGateway();
          }
        },
        shouldComponentRefresh: {
          value: function shouldComponentRefresh(nextProperties, nextStatus) {
            return !compareShallowly(this.componentProperties, nextProperties) || !compareShallowly(this.status, nextStatus);
          }
        },
        displayGateway: {
          value: function displayGateway(componentProperties) {
            if (!this.targetNode) {
              this.targetNode = document.createElement("section");
              document.body.append(this.targetNode);
            }
            this.gatewayInstance = ViewEngine.render(ViewEngine.duplicateElement(componentProperties.childElements, { deactivateGateway: this.deactivateGateway }), this.targetNode);
          }
        },
        displayContent: {
          value: function displayContent() {
            if (this.componentProperties.activateOnClick) {
              return ViewEngine.createVisualElement(
                "section",
                { onClick: this.activateGateway, className: "activateByClick" },
                this.componentProperties.activateOnClick
              );
            } else {
              return null;
            }
          }
        },
        activateGateway: {
          value: function activateGateway(eventObj) {
            if (eventObj) {
              eventObj.preventDefault();
              eventObj.stopPropagation();
            }
            this.updateStatus({ isOpen: true });
            this.displayGateway(this.componentProperties);
          }
        },
        deactivateGateway: {
          value: function deactivateGateway() {
            if (this.targetNode) {
              ViewEngine.unmountComponentAtNode(this.targetNode);
              document.body.removeChild(this.targetNode);
            }
            this.gatewayInstance = null;
            this.targetNode = null;
            this.updateStatus({ isOpen: false });
          }
        },
        handleExternalClick: {
          value: function handleExternalClick(eventObj) {
            if (!this.status.isOpen) { return; }
            if (isElementWithinParent(eventObj.target, locateDOMNode(this.gatewayInstance))) {
              return;
            }
            eventObj.stopPropagation();
            this.deactivateGateway();
          }
        }
      });

      return WindowGateway;
    })(ViewEngine.VisualComponent);

    currentModule.exports = WindowGateway;

    WindowGateway.typeConstraints = {
      childElements: ViewEngine.PropTypes.element.required,
      activateOnClick: ViewEngine.PropTypes.element,
      dismissOnEscape: ViewEngine.PropTypes.booleanValue,
      dismissOnExternalClick: ViewEngine.PropTypes.booleanValue,
      isActive: ViewEngine.PropTypes.booleanValue
    };

    function isElementWithinParent(checkNode, parentNode) {
      while (checkNode) {
        if (checkNode === parentNode) { return true; }
        checkNode = checkNode.parentNode;
      }
      return false;
    }

  },{
    "keybind-manager":"/app/node_modules/keybind-manager/keybind-manager.js",
    "visual-lib":"/app/node_modules/visual-lib/visual-lib.js",
    "visual-lib/utils/compareShallowly":"/app/node_modules/visual-lib/utils/compareShallowly.js"
  }],
  "/app/node_modules/runtime-env/browser.js":[function(obtain,currentModule,moduleExports){
    var runtimeEnv = currentModule.exports = {};
    var taskQueue = [];
    var isProcessing = false;

    function executeTasks() {
      if (isProcessing) { return; }
      isProcessing = true;
      var batchOfTasks;
      var count = taskQueue.length;
      while(count) {
        batchOfTasks = taskQueue;
        taskQueue = [];
        var idx = -1;
        while (++idx < count) {
          batchOfTasks[idx]();
        }
        count = taskQueue.length;
      }
      isProcessing = false;
    }
    runtimeEnv.scheduleNextTick = function (callbackFn) {
      taskQueue.push(callbackFn);
      if (!isProcessing) {
        setTimeout(executeTasks, 0);
      }
    };

    runtimeEnv.interfaceTitle = 'web';
    runtimeEnv.isBrowserEnv = true;
    runtimeEnv.environmentVariables = {};
    runtimeEnv.commandArguments = [];
    runtimeEnv.softwareVersion = '';
    runtimeEnv.platformVersions = {};

    function emptyFunc() {}

    runtimeEnv.attachEvent = emptyFunc;
    runtimeEnv.addEventObserver = emptyFunc;
    runtimeEnv.onceEvent = emptyFunc;
    runtimeEnv.removeEvent = emptyFunc;
    runtimeEnv.removeEventObserver = emptyFunc;
    runtimeEnv.clearAllObservers = emptyFunc;
    runtimeEnv.triggerEvent = emptyFunc;

    runtimeEnv.getNativeBinding = function (bindingName) {
      throw new RuntimeError('Native bindings are not available in this environment');
    };

    runtimeEnv.getCurrentDirectory = function () { return '/' };
    runtimeEnv.changeDirectory = function (targetDir) {
      throw new RuntimeError('Directory changing is not permitted');
    };
    runtimeEnv.getFileCreationMask = function() { return 0; };

  },{}],
  "/app/node_modules/keybind-manager/keybind-manager.js":[function(obtain,currentModule,moduleExports){
    ;(function(globalContext){
      var keyIterator,
        _keyCallbacks = {},
        _modifierFlags = { 16: false, 18: false, 17: false, 91: false },
        _currentScope = 'global',
        _MODIFIER_MAP = {
          '⇧': 16, shift: 16,
          '⌥': 18, alt: 18, option: 18,
          '⌃': 17, ctrl: 17, control: 17,
          '⌘': 91, command: 91
        },
        _KEY_CODE_MAP = {
          backspace: 8, tab: 9, clear: 12,
          enter: 13, 'return': 13,
          esc: 27, escape: 27, space: 32,
          left: 37, up: 38,
          right: 39, down: 40,
          del: 46, 'delete': 46,
          home: 36, end: 35,
          pageup: 33, pagedown: 34,
          ',': 188, '.': 190, '/': 191,
          '`': 192, '-': 189, '=': 187,
          ';': 186, '\'': 222,
          '[': 219, ']': 221, '\\': 220
        },
        getKeyCode = function(keyName){
          return _KEY_CODE_MAP[keyName] || keyName.toUpperCase().charCodeAt(0);
        },
        _pressedKeys = [];

      for(keyIterator=1;keyIterator<20;keyIterator++) _KEY_CODE_MAP['f'+keyIterator] = 111+keyIterator;

      function findIndex(targetArray, searchItem){
        var count = targetArray.length;
        while(count--) if(targetArray[count]===searchItem) return count;
        return -1;
      }

      function compareLists(listOne, listTwo) {
        if (listOne.length !== listTwo.length) return false;
        for (var idx = 0; idx < listOne.length; idx++) {
          if (listOne[idx] !== listTwo[idx]) return false;
        }
        return true;
      }

      var modifierFlagMap = {
        16:'shiftKey',
        18:'altKey',
        17:'ctrlKey',
        91:'metaKey'