// This file defines a set of JavaScript controllers for an Angular application,
// specifically tailored for a JSON to Go struct conversion tool.
// It includes a base controller for common functionalities and a specialized
// controller for the editor and conversion logic.
(function() {
  // A utility function designed to facilitate classical inheritance between JavaScript functions acting as classes.
  // This helper ensures that a derived constructor properly inherits from a base constructor.
  const establishInheritance = function(derivedConstructor, baseConstructor) {
    // Validate that the base constructor is indeed a function.
    if (typeof baseConstructor !== 'function') {
      console.error('Base constructor provided for inheritance is not a valid function.', baseConstructor);
      return;
    }

    // Copy static properties from the base constructor to the derived constructor.
    // This allows static methods and properties to be inherited.
    for (let staticPropKey in baseConstructor) {
      if (Object.prototype.hasOwnProperty.call(baseConstructor, staticPropKey)) {
        derivedConstructor[staticPropKey] = baseConstructor[staticPropKey];
      }
    }

    // A temporary constructor is used to correctly set up the prototype chain
    // without invoking the base constructor during the prototype assignment.
    function IntermediatePrototype() {
      this.constructor = derivedConstructor; // Set the constructor property correctly.
    }
    IntermediatePrototype.prototype = baseConstructor.prototype; // Inherit all methods from the base prototype.
    derivedConstructor.prototype = new IntermediatePrototype(); // Assign the new prototype to the derived constructor.
    // Store a direct reference to the parent's prototype, useful for calling super methods.
    derivedConstructor.__parentPrototype__ = baseConstructor.prototype;
  };

  // The AbstractBaseController provides foundational features for all other controllers.
  // It manages controller registration with Angular and handles automatic dependency injection
  // and method binding to the Angular $scope.
  this.AbstractBaseController = (function() {
    // Static method: Registers this controller with a given Angular application module.
    // This makes the controller available for use in routes, directives, etc.
    AbstractBaseController.attachToAngularApp = function(angularApplicationRef, ctrlIdentifier) {
      // Input validation: Ensure a valid Angular app reference is provided.
      if (!angularApplicationRef || typeof angularApplicationRef.controller !== 'function') {
        console.error('Invalid Angular application reference provided for controller registration.');
        return null; // Indicate failure to register.
      }

      // Automatically determine the controller's name if not explicitly given.
      if (ctrlIdentifier == null || typeof ctrlIdentifier !== 'string') {
        let functionNameMatch = this.toString().match(/function\s*(.*?)\(/);
        ctrlIdentifier = this.name || (functionNameMatch != null ? functionNameMatch[1] : 'UnknownController');
        if (ctrlIdentifier === 'UnknownController') {
            console.warn('Controller name could not be determined automatically. Using "UnknownController".');
        }
      }
      console.info(`Attempting to register controller: "${ctrlIdentifier}"`);
      return angularApplicationRef.controller(ctrlIdentifier, this);
    };

    // Static method: Defines the dependencies that Angular should inject into this controller.
    // The arguments should be strings corresponding to Angular service names (e.g., '$scope', '$http').
    AbstractBaseController.setInjectionDependencies = function() {
      const dependencyList = Array.prototype.slice.call(arguments); // Convert 'arguments' object to a real array.
      // Basic validation for the dependency list.
      if (!Array.isArray(dependencyList) || dependencyList.some(dep => typeof dep !== 'string')) {
        console.warn('Controller injection list should consist of strings. Found invalid entries.');
      }
      this.$inject = dependencyList; // Angular uses this property for dependency resolution.
      return this.$inject;
    };

    // Constructor for AbstractBaseController.
    // It initializes controller instances by injecting dependencies and binding prototype methods.
    function AbstractBaseController() {
      const incomingArguments = Array.prototype.slice.call(arguments); // Capture all arguments passed to the constructor.

      // Process and inject declared dependencies.
      // Dependencies are assigned to properties on the controller instance matching their names.
      if (Array.isArray(this.constructor.$inject)) {
        this.constructor.$inject.forEach((depName, argIndex) => {
          this[depName] = incomingArguments[argIndex]; // Assign the injected service.
          // Optional: Log a warning if a declared dependency appears to be missing.
          if (this[depName] === undefined) {
             console.warn(`Dependency "${depName}" might be undefined for controller "${this.constructor.name}".`);
          }
        });
      } else {
        console.info(`Controller "${this.constructor.name}" does not have explicit $inject definitions.`);
      }

      // Iterate through the controller's prototype methods and bind them to the controller instance.
      // This ensures 'this' context is correct when methods are called from Angular views.
      const prototypeMethods = this.constructor.prototype;
      for (let memberName in prototypeMethods) {
        // Ensure we're only processing own properties of the prototype chain, not inherited ones further up.
        if (Object.prototype.hasOwnProperty.call(prototypeMethods, memberName)) {
          const methodReference = prototypeMethods[memberName];

          // Bind only actual functions, excluding the constructor itself, a special 'initialize' method,
          // and methods starting with an underscore (conventionally private).
          if (typeof methodReference === 'function' &&
              memberName !== 'constructor' &&
              memberName !== 'initializeController' && // Using a slightly different name
              memberName[0] !== '_') {
            // Check if $scope is available before attempting to bind to it.
            if (this.$scope) {
              this.$scope[memberName] = methodReference.bind(this);
            } else {
              console.warn(`$scope not available for method binding in "${this.constructor.name}". Method: "${memberName}".`);
            }
          }
        }
      }

      // Invoke an optional lifecycle method if defined on the controller instance.
      if (typeof this.initializeController === "function") {
        this.initializeController();
      }
    }

    return AbstractBaseController;
  })();

  // The StructureProcessorController handles the specific logic for the JSON-to-Go-struct conversion tool.
  // It extends the AbstractBaseController to inherit common functionalities.
  let StructureProcessorController;
  StructureProcessorController = (function(baseClassReference) {
    // Apply the inheritance mechanism to make StructureProcessorController a child of AbstractBaseController.
    establishInheritance(StructureProcessorController, baseClassReference);

    // Constructor for StructureProcessorController.
    // It primarily delegates to the parent constructor to handle shared setup logic.
    function StructureProcessorController() {
      // Call the parent's constructor with all arguments to ensure proper dependency injection.
      return StructureProcessorController.__parentPrototype__.constructor.apply(this, arguments);
    }

    // Register this controller with the global 'app' Angular module.
    // This assumes 'app' is an existing Angular module accessible in the global scope.
    StructureProcessorController.attachToAngularApp(app, 'StructProcessor'); // Explicitly naming the controller.

    // Declare the Angular services that need to be injected into this controller.
    // '$scope' for view data binding, '$http' for making API calls.
    StructureProcessorController.setInjectionDependencies('$scope', '$http');

    // Method to display user notifications or alerts.
    // Updates `$scope` properties to control the visibility and content of an alert message.
    StructureProcessorController.prototype.broadcastMessage = function(messageType, messageTitle, messageBody) {
      // Validate and sanitize the message type for consistency.
      const allowedTypes = ['success', 'info', 'warning', 'error'];
      const effectiveType = allowedTypes.includes(messageType) ? messageType : 'info';

      this.$scope.currentNotification = {
        type: effectiveType,
        title: messageTitle,
        body: messageBody,
        displayTime: new Date().toLocaleTimeString() // Add a timestamp for user context.
      };
      this.$scope.isNotificationActive = true;
      console.log(`Notification displayed: [${effectiveType}] ${messageTitle} - ${messageBody}`);
    };

    // Method to clear and hide any active notification message.
    StructureProcessorController.prototype.clearActiveNotification = function() {
      this.$scope.currentNotification = null; // Reset the notification data.
      this.$scope.isNotificationActive = false;
      console.log('Notification has been cleared.');
    };

    // Displays the generated code within a dedicated viewer component.
    // Also sets the primary code editor to a read-only state.
    StructureProcessorController.prototype.displayCodeOutputPanel = function(generatedCodeContent) {
      const outputTargetElement = document.querySelector('#generatedcode'); // Use querySelector for more flexibility.
      if (!outputTargetElement) {
        console.error('Target element "#generatedcode" not found in the DOM for displaying output.');
        this.broadcastMessage('error', 'Display Error', 'Could not locate output display area.');
        return;
      }
      // Assuming 'prettyPrintOne' is a global utility for syntax highlighting.
      outputTargetElement.innerHTML = prettyPrintOne(generatedCodeContent, 'lang-go', false);
      this.$scope.isOutputPanelVisible = true;

      // Access the globally stored ACE editor instance and set it to read-only.
      if (window.aceCodeEditorInstance) {
        window.aceCodeEditorInstance.setReadOnly(true);
      } else {
        console.warn('ACE editor instance not found; cannot set read-only mode for output display.');
      }
    };

    // Closes the code output panel and restores the main editor to an editable state.
    StructureProcessorController.prototype.hideCodeOutputPanel = function() {
      this.$scope.goStructResult = ''; // Clear any displayed Go struct content.
      this.$scope.isOutputPanelVisible = false;

      // Reset the ACE editor to writable mode and focus it.
      if (window.aceCodeEditorInstance) {
        window.aceCodeEditorInstance.setReadOnly(false);
        window.aceCodeEditorInstance.focus(); // Return focus to the editor for user convenience.
      } else {
        console.warn('ACE editor instance not found; unable to reset read-only mode.');
      }
    };

    // Sends an HTTP POST request to a backend service to convert JSON data into a Go struct.
    // Manages loading states and handles API responses (success or error).
    StructureProcessorController.prototype.initiateConversionRequest = function(jsonInputData) {
      this.$scope.isConversionInProgress = true; // Set a flag to indicate ongoing process.
      this.clearActiveNotification(); // Clear any previous alerts before a new request.

      // Pre-validation: Check if the input JSON payload is valid before sending.
      if (typeof jsonInputData !== 'string' || jsonInputData.trim() === '') {
        this.broadcastMessage('error', 'Input Data Invalid', 'The JSON payload is empty or malformed. Please provide valid JSON.');
        this.$scope.isConversionInProgress = false;
        return;
      }

      const currentControllerContext = this; // Capture 'this' for use within callback functions.
      const apiServiceEndpoint = '/api/convert-json-to-go'; // Renamed API endpoint for clarity.

      // Construct and send the HTTP POST request using Angular's $http service.
      const conversionHttpRequest = this.$http.post(apiServiceEndpoint, jsonInputData, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8' // Ensure correct content type and character encoding.
        }
      });

      // Handle cases where the HTTP request fails (e.g., network error, server error).
      conversionHttpRequest.error(function(responseErrorData, httpStatusCode, headerAccessor, requestConfig) {
        console.error(`API Request Failed: Status ${httpStatusCode}`, responseErrorData);
        currentControllerContext.broadcastMessage(
          'error',
          `Conversion Error (Code: ${httpStatusCode})`,
          responseErrorData || 'An unexpected error occurred during conversion.'
        );
        currentControllerContext.$scope.isConversionInProgress = false; // Reset processing flag on error.
      });

      // Handle successful HTTP responses.
      return conversionHttpRequest.then(function(apiResponse) {
        // Verify that the response contains expected data.
        if (apiResponse && apiResponse.data) {
          currentControllerContext.displayCodeOutputPanel(apiResponse.data);
        } else {
          currentControllerContext.broadcastMessage('warning', 'Empty API Response', 'The server returned an empty or unexpected data structure.');
        }
        currentControllerContext.$scope.isConversionInProgress = false; // Reset processing flag on success.
        return apiResponse; // Return the response for potential further chaining.
      });
    };

    // Lifecycle method: Initializes the controller's state when an instance is created.
    // Sets default values for properties used in the view.
    StructureProcessorController.prototype.initializeController = function() {
      this.$scope.isOutputPanelVisible = false; // Output panel is hidden by default.
      this.$scope.goStructResult = ''; // No Go struct content initially.
      this.$scope.isConversionInProgress = false; // No conversion request active.
      this.$scope.isNotificationActive = false; // No notifications displayed.
      this.$scope.currentNotification = null; // No notification data.
      console.info('StructureProcessorController has completed its initial setup.');
    };

    // Callback function invoked when the ACE editor instance is fully loaded and ready for interaction.
    // It stores the editor instance and ensures it's set to an editable state.
    StructureProcessorController.prototype.onAceEditorReady = function(editorInstance) {
      // Validate the provided editor instance.
      if (!editorInstance || typeof editorInstance.setReadOnly !== 'function') {
        console.error('Invalid ACE editor instance provided to onAceEditorReady callback.');
        return;
      }
      window.aceCodeEditorInstance = editorInstance; // Store the instance globally for easy access.
      editorInstance.setReadOnly(false); // Ensure the editor is writable by default.
      editorInstance.focus(); // Give focus to the editor so the user can start typing immediately.
      console.log('ACE editor successfully loaded and initialized.');
    };

    // The primary action method that triggers the JSON-to-Go-struct conversion.
    // It reads content from the editor, validates it, and then dispatches the conversion request.
    StructureProcessorController.prototype.performStructGeneration = function() {
      // Guard clause: Check if the ACE editor instance is available.
      if (!window.aceCodeEditorInstance) {
        this.broadcastMessage('error', 'Editor Unavailable', 'The code editor is not yet loaded or accessible.');
        return;
      }

      const currentEditorContent = window.aceCodeEditorInstance.getValue();
      this.clearActiveNotification(); // Dismiss any prior alerts.

      // Input validation: Check for empty editor content.
      if (currentEditorContent.trim() === '') {
        this.broadcastMessage('warning', 'Empty Input', 'Please provide some JSON data in the editor before generating.');
        return;
      }

      try {
        // Attempt to parse the editor content to validate it as well-formed JSON.
        const parsedJsonData = JSON.parse(currentEditorContent);
        // If parsing succeeds, proceed with the conversion request.
        // Re-stringify the parsed object to ensure canonical JSON format for the API.
        this.initiateConversionRequest(JSON.stringify(parsedJsonData));
      } catch (jsonParseError) {
        // If JSON parsing fails, display an error message to the user.
        this.broadcastMessage('error', 'Invalid JSON Format', jsonParseError.message || 'The input is not valid JSON.');
      } finally {
        // Ensure the processing flag is reset even if synchronous errors occur before the HTTP call.
        if (this.$scope.isConversionInProgress) {
            this.$scope.isConversionInProgress = false;
        }
      }
    };

    return StructureProcessorController;

  })(this.AbstractBaseController); // Inherit from the globally available AbstractBaseController.

}).call(this);