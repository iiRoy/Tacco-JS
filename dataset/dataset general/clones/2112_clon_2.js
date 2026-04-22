(function(jQ) {
  /*
   * jQ form information preservation utility
   * Module Name: retainFormInfo
   * Edition: 1.4.1
   * Purpose: When activated on a form element, this component utilizes
   *          the browser's local storage to save user input values
   *          until the form is submitted or the page is unloaded.
   *          If local storage isn't supported, the component remains inactive.
   *          It seeks an element with the 'retain_form_info' class to display
   *          a message, allowing users to restore previously entered data by
   *          clicking a link within that container. If such an element is absent,
   *          it's dynamically generated and appended to the form.
   * Usage Example: jQ("form").retainFormInfo("my_form_data");
   * Important Notes: To manually clear a form's stored data, trigger the
   *                  'clear_saved_info' event on the form element:
   *                  jQ("form").trigger("clear_saved_info");
   *                  To programmatically restore state, call:
   *                  jQ("form").retainFormInfo("repopulateData");
   */
  if (!window.localStorage || !window.JSON) { // Check for essential browser features
    if (console && console.warn) {
      !window.localStorage && console.warn("WARNING: Your browser lacks localStorage support." +
        " Consider a polyfill: https://gist.github.com/350433");
      !window.JSON && console.warn("WARNING: Your browser lacks JSON support." +
        " Consider a polyfill: http://bestiejs.github.com/json3/");
    }
    // Return a no-op function if requirements aren't met
    return jQ.fn.retainFormInfo = function() { return this; };
  }

  var formInfoKeeper = {
    pluginID: "retainFormInfo", // Unique identifier for the plugin
    eraseOnSubmission: true, // Should stored data be cleared upon form submission?
    _createDefaultPrompt: function() { // Generates the standard restoration message
      return jQ("<p />", { "class": "retain_form_info" })
        .html('Would you like to <a href="#">retrieve your previously entered details</a>?');
    },
    displayPrompt: null, // Custom dialog element for restoration
    confirmLinkSelector: "a", // Selector for the 'restore' action within the prompt
    cancelActionSelector: "", // Selector for the 'cancel' action within the prompt
    excludedFields: null, // Array of field names to ignore during saving
    promptContainerSelector: ".retain_form_info", // Class for the prompt container
    utilizeIDs: false, // Flag to indicate if element IDs should be used for naming
    dataStoreKey: false, // The key used in localStorage for this form
    repopulateData: function(eventObj) { // Function to restore form data
      var storedPayload = JSON.parse(localStorage.getItem(this.dataStoreKey)),
          $targetForm = this.$el,
          $currentElement;

      for (var idx in storedPayload) { // Iterate through saved items
        $currentElement = $targetForm.find("[name=\"" + storedPayload[idx].fieldName + "\"]");
        if ($currentElement.is(":radio")) {
          $currentElement.filter("[value=\"" + storedPayload[idx].fieldValue + "\"]").prop("checked", true);
        }
        else if ($currentElement.is(":checkbox") && storedPayload[idx].fieldValue) {
          $currentElement.prop("checked", true);
        }
        else if ($currentElement.is("select")) {
          $currentElement.find("[value=\"" + storedPayload[idx].fieldValue + "\"]").prop("selected", true);
        }
        else { // For text inputs, textareas, etc.
          $currentElement.val(storedPayload[idx].fieldValue);
        }
        $currentElement.change(); // Trigger change event on element
      }
      this.displayPrompt.remove(); // Hide the prompt after restoration
      eventObj && eventObj.preventDefault && eventObj.preventDefault(); // Prevent default if event object exists
    },
    dismissPrompt: function(eventObj) { // Function to hide the restoration prompt
      eventObj.preventDefault();
      this.displayPrompt.remove();
    },
    determineStorageIdentifier: function() { // Logic to determine the unique storage key
      if (this.$el.length > 1) { // If multiple forms are selected, use their IDs
        if (console && console.warn) {
          console.warn("ATTENTION: Multiple forms detected. Using form IDs as storage keys.");
        }
        this.dataStoreKey = this.$el.attr("id");
      }
    },
    logMissingIDError: function() { // Logs an error if no suitable ID is found
      if (console && console.log) {
        console.log("ERROR: Form identifier or specific object name missing. Provide an ID or custom name.");
      }
    },
    persistCurrentState: function(eventObj) { // Saves the current form state to local storage
      var pluginInstance = eventObj.data.pluginInstance;
      var inputValues = pluginInstance.$el.serializeArray();
      // jQuery's serializeArray might not handle all input types,
      // specifically datetime-local. We'll add it manually.
      pluginInstance.$el.find("input[type='datetime-local']").each(function() {
        var $inputField = jQ(this);
        inputValues.push({ fieldName: $inputField.attr("name"), fieldValue: $inputField.val() });
      });
      inputValues = pluginInstance.filterExcludedFields(inputValues); // Remove ignored fields
      inputValues.length && pluginUtilities.storeObject(pluginInstance.dataStoreKey, inputValues); // Save if values exist
    },
    storeFormState: function() { // Public method to trigger saving
      var pluginInstance = this;
      if (!this.persistCurrentState) { // If called directly on the element
        pluginInstance = this.data(formInfoKeeper.pluginID);
      }
      pluginInstance.persistCurrentState({ data: { pluginInstance: pluginInstance } });
    },
    filterExcludedFields: function(inputValues) { // Removes fields marked for exclusion
      var excludedFields = this.excludedFields;
      if (!excludedFields) { return inputValues; } // No fields to ignore
      jQ.each(inputValues, function(idx, inputItem) {
        if (jQ.inArray(inputItem.fieldName, excludedFields) !== -1) {
          inputValues[idx] = false; // Mark for removal
        }
      });
      inputValues = jQ.grep(inputValues, function(val) { return val; }); // Filter out marked items
      return inputValues;
    },
    attachPromptHandlers: function() { // Binds event handlers to the restoration prompt
      if (!this.displayPrompt || !this.displayPrompt.length || !this.displayPrompt.jquery) {
        this.displayPrompt = this._createDefaultPrompt(); // Create default if not provided
      }
      // Attach click handler for confirmation
      this.displayPrompt.on("click." + this.pluginID, this.confirmLinkSelector, jQ.proxy(this.repopulateData, this));
      // Attach click handler for cancellation
      this.displayPrompt.on("click." + this.pluginID, this.cancelActionSelector, jQ.proxy(this.dismissPrompt, this));
    },
    assignStorageKey: function() { // Sets the key for local storage
      this.dataStoreKey = this.dataStoreKey || this.$el.attr("id");
      if (!this.dataStoreKey) { this.logMissingIDError(); }
    },
    attachResetListeners: function() { // Binds events for clearing stored data
      var pluginInstance = this;
      if (this.eraseOnSubmission) {
        this.$el.bind("submit." + this.pluginID, function() {
          jQ(this).trigger("clear_saved_info"); // Trigger custom reset event
          jQ(window).unbind("unload." + pluginInstance.pluginID); // Prevent saving on unload
        });
      }

      this.$el.bind("clear_saved_info." + this.pluginID, function() {
        localStorage.removeItem(pluginInstance.dataStoreKey); // Clear data from storage
      });
      this.$el.find(":reset").bind("click." + this.pluginID, function() {
        jQ(this).closest("form").trigger("clear_saved_info"); // Clear data when reset button is clicked
      });
    },
    createNoticeDialog: function() { // Displays the restoration prompt if data exists
      if (localStorage[this.dataStoreKey]) { // Check if data is stored for this key
        if (this.displayPrompt.length && this.displayPrompt.jquery) {
          this.displayPrompt.prependTo(this.$el).show(); // Prepend and show custom prompt
        }
        else {
          this.$el.find(this.promptContainerSelector).show(); // Show existing prompt
        }
      }
    },
    cleanupPlugin: function(clearLocalStorageFlag) { // Removes event handlers and optionally clears data
      var eventNamespace = "." + this.pluginID;
      this.$el.unbind(eventNamespace).find(":reset").unbind(eventNamespace);
      jQ(window).unbind(eventNamespace);
      clearLocalStorageFlag && localStorage.removeItem(this.dataStoreKey); // Clear if flag is true
    },
    initializePlugin: function() { // Main initialization method
      this.attachPromptHandlers();
      this.assignStorageKey();

      if (!this.dataStoreKey) { return; } // Exit if no key is assigned

      this.attachResetListeners();
      this.createNoticeDialog();

      jQ(window).bind("unload." + this.pluginID, { pluginInstance: this }, this.persistCurrentState); // Save on page unload
    }
  };

  var pluginUtilities = {
    storeObject: function(keyIdentifier, dataValue) { localStorage[keyIdentifier] = JSON.stringify(dataValue); },
    retrieveObject: function(keyIdentifier) { return JSON.parse(localStorage[keyIdentifier]); },
    registerPlugin: function(pluginDefinition) {
      jQ.fn[pluginDefinition.pluginID] = function(optionsConfig) {
        var $formElements = this,
            invokedMethod = jQ.isPlainObject(optionsConfig) || !optionsConfig ? "" : optionsConfig,
            methodArguments = arguments;
        if (invokedMethod && pluginDefinition[invokedMethod]) {
          $formElements.each(function(idx) {
            pluginDefinition[invokedMethod].apply($formElements.eq(idx).data(pluginDefinition.pluginID), Array.prototype.slice.call(methodArguments, 1));
          });
        }
        else if (!invokedMethod) {
          $formElements.each(function(idx) {
            var currentInstance = jQ.extend(true, {
              $el: $formElements.eq(idx)
            }, pluginDefinition, optionsConfig);
            $formElements.eq(idx).data(pluginDefinition.pluginID, currentInstance);
            currentInstance.initializePlugin();
          });
        }
        else {
          jQ.error('Method ' +  invokedMethod + ' is not defined for jQ.' + pluginDefinition.pluginID);
        }
        return $formElements;
      };
    }
  };

  pluginUtilities.registerPlugin(formInfoKeeper); // Initialize the plugin
})(jQuery); // Pass jQuery object