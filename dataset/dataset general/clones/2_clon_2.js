// This file was transformed from an earlier CoffeeScript version.
(function( ) {
  var CodeViewManager,
    _arraySliceRef = [].slice,
    _hasOwnPropertyRef = {}.hasOwnProperty,
    _inheritPrototype = function(derivedClass, baseClass) {
        for (var propName in baseClass) {
            if ( _hasOwnPropertyRef.call(baseClass, propName) ) {
                derivedClass[propName] = baseClass[propName];
            }
        }
        function tempCtor() { this.constructor = derivedClass; }
        tempCtor.prototype = baseClass.prototype;
        derivedClass.prototype = new tempCtor();
        derivedClass._parentProto = baseClass.prototype;
        return derivedClass;
    };

  this.CoreController = (function() {
    CoreController.associateWithApp = function(applicationObject, componentName) {
      var _nameIdentifier;
      if (componentName == null) {
        componentName = this.name || ((_nameIdentifier = this.toString().match(/function\s*(.*?)\(/)) !== undefined && _nameIdentifier !== null ? _nameIdentifier[1] : undefined);
      }
      return applicationObject.controller(componentName, this);
    };

    CoreController.dependencyDeclare = function() {
      var dependencyArguments;
      dependencyArguments = 1 <= arguments.length ? _arraySliceRef.call(arguments, 0) : [];
      return this.$dependencies = dependencyArguments;
    };

    function CoreController() {
      var constructorArgs, prototypeFunction, idx, depKey, _loopCounter, _arrayLength, _injectedDeps, _protoMethods;
      constructorArgs = 1 <= arguments.length ? _arraySliceRef.call(arguments, 0) : [];
      _injectedDeps = this.constructor.$dependencies;
      for (idx = _loopCounter = 0, _arrayLength = _injectedDeps.length; _loopCounter < _arrayLength; idx = ++_loopCounter) {
        depKey = _injectedDeps[idx];
        this[depKey] = constructorArgs[idx];
      }
      _protoMethods = this.constructor.prototype;
      for (depKey in _protoMethods) {
        prototypeFunction = _protoMethods[depKey];
        if (typeof prototypeFunction !== 'function') {
          continue;
        }
        if ((depKey === 'constructor' || depKey === 'setupProcess') || depKey[0] === '_') {
          continue;
        }
        this.$viewContext[depKey] = (typeof prototypeFunction.bind === "function" ? prototypeFunction.bind(this) : undefined) || _.bind(prototypeFunction, this);
      }
      if (typeof this.setupProcess === "function") {
        this.setupProcess();
      }
    }

    return CoreController;

  })();

  CodeViewManager = (function(_baseClassRef) {
    _inheritPrototype(CodeViewManager, _baseClassRef);

    function CodeViewManager() {
      return CodeViewManager._parentProto.constructor.apply(this, arguments);
    }

    CodeViewManager.associateWithApp(applicationObject);

    CodeViewManager.dependencyDeclare('$viewContext', '$webService');

    CodeViewManager.prototype.displayMessage = function(messageKind, messageHeader, messageContent) {
      this.$viewContext.notificationKind = messageKind;
      this.$viewContext.notificationHeader = messageHeader;
      this.$viewContext.notificationText = messageContent;
      return this.$viewContext.notificationVisible = true;
    };

    CodeViewManager.prototype.hideNotification = function() {
      this.$viewContext.notificationHeader = '';
      this.$viewContext.notificationText = '';
      return this.$viewContext.notificationVisible = false;
    };

    CodeViewManager.prototype.showModal = function(structureOutput) {
      document.getElementById('producedContentElement').innerHTML = prettyPrintOne(structureOutput, 'lang-go', false);
      this.$viewContext.modalIsActive = true;
      return codeEditorInstance.setReadOnly(true);
    };

    CodeViewManager.prototype.closeModal = function() {
      this.$viewContext.goStructureString = '';
      this.$viewContext.modalIsActive = false;
      return codeEditorInstance.setReadOnly(false);
    };

    CodeViewManager.prototype.constructModal = function(inputPayload) {
      var httpRequest, selfReference;
      this.$viewContext.isProcessing = true;
      httpRequest = this.$webService.post('/parse', inputPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      selfReference = this;
      httpRequest.error(function(responseData, httpStatus, responseHeaders, requestConfig, notifierService) {
        this.notify = notifierService;
        selfReference.displayMessage('error', 'Invalid JSON |', responseData);
        return selfReference.$viewContext.isProcessing = false;
      });
      return httpRequest.then((function(_currentInstance) {
        return function(apiResult) {
          _currentInstance.showModal(apiResult.data);
          return _currentInstance.$viewContext.isProcessing = false;
        };
      })(this));
    };

    CodeViewManager.prototype.setupProcess = function() {
      return this.$viewContext.modalIsActive = false;
    };

    CodeViewManager.prototype.editorReady = function(editorRef) {
      window.codeEditorInstance = editorRef;
      return editorRef.setReadOnly(false);
    };

    CodeViewManager.prototype.produceStructure = function() {
      var exceptionObject, inputDataString;
      inputDataString = window.codeEditorInstance.getValue();
      this.hideNotification();
      try {
        JSON.parse(inputDataString);
        return this.constructModal(inputDataString);
      } catch (parseError) {
        exceptionObject = parseError;
        return this.displayMessage('error', 'Invalid JSON |', exceptionObject.message);
      }
    };

    return CodeViewManager;

  })(CoreController);

}).call(this);