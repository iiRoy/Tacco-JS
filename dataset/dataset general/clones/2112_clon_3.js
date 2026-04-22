(function($) {
  /**
   * @module jQuery Form Data Persistence Plugin
   * @name formPersistence
   * @version 2.0.0
   * @description This plugin enhances HTML forms by automatically preserving user input
   *              in the browser's local storage. Data is saved upon form submission or
   *              when the user navigates away from the page. If local storage is
   *              unavailable, the plugin gracefully degrades and performs no actions.
   *              It provides a mechanism to notify the user of available saved data
   *              and allows for one-click restoration. The notification element,
   *              identified by a specific CSS class (e.g., 'persistence-prompt'),
   *              is either identified on the page or dynamically created.
   * @usage     Example: $("form").formPersistence({ storageKey: "userFormSession" });
   * @events    To clear stored data for a form, trigger the custom event "formReset" on it:
   *            $("form").trigger("formReset");
   *            To programmatically restore data, invoke the "repopulate" method:
   *            $("form").formPersistence("repopulate");
   */
  if (!window.localStorage || !window.JSON) {
    if (console && console.warn) {
      if (!window.localStorage) console.warn("FORM_PERSISTENCE: Browser does not support localStorage. Feature disabled.");
      if (!window.JSON) console.warn("FORM_PERSISTENCE: Browser does not support JSON parsing. Feature disabled.");
    }
    // Provide a no-operation function as a fallback for the plugin entry point.
    return $.fn.formPersistence = function() { return this; };
  }

  const formPersistenceModule = {
    name: "formPersistence",
    shouldClearOnSubmit: true,
    debugMode: false, // Enable/disable console logging for debugging purposes

    // Private method to generate the default notification prompt.
    generateDefaultPrompt: function() {
      return $("<p />", { "class": "persistence-prompt" })
        .html('Do you want to <a href="#" class="restore-action">retrieve your previously entered information</a>?');
    },

    userPromptElement: null, // jQuery object for the displayed prompt
    confirmActionSelector: "a.restore-action", // Selector for the restore trigger
    cancelActionSelector: "", // Selector for cancelling the prompt (optional)
    excludedFields: null, // Array of field names or a selector string to ignore
    promptContainerSelector: ".persistence-prompt", // Selector to find existing prompt element
    storageKey: false, // Unique key for localStorage
    
    // Internal logging utility
    _log: function(level, message) {
      if (this.debugMode && console && console[level]) {
        console[level](`[${this.name}] ${message}`);
      }
    },

    // Recovers saved form data and populates the form fields.
    repopulateFormData: function(event) {
      const storedData = utilityFunctions.retrieveObject(this.storageKey);
      const $targetForm = this.$el;

      if (!storedData || !Array.isArray(storedData) || storedData.length === 0) {
        this._log('info', `No valid stored data found for key: ${this.storageKey}.`);
        this.userPromptElement.remove(); // Remove prompt if no data to restore
        event?.preventDefault();
        return;
      }

      $.each(storedData, (idx, field) => {
        let $currentElement = $targetForm.find(`[name="${field.name}"]`);
        if ($currentElement.length === 0) {
          this._log('warn', `Element with name "${field.name}" not found during restoration.`);
          return;
        }

        if ($currentElement.is(":radio")) {
          $currentElement.filter(`[value="${field.value}"]`).prop("checked", true);
        } else if ($currentElement.is(":checkbox")) {
          // Checkboxes are only checked if the stored value is truthy
          if (field.value) {
            $currentElement.prop("checked", true);
          } else {
            $currentElement.prop("checked", false); // Explicitly uncheck if value is falsy
          }
        } else if ($currentElement.is("select")) {
          $currentElement.find(`[value="${field.value}"]`).prop("selected", true);
        } else {
          $currentElement.val(field.value);
        }
        $currentElement.trigger("change"); // Trigger change event after setting value
      });

      this.userPromptElement.remove();
      event?.preventDefault(); // Prevent default link action if called from an anchor
    },

    // Dismisses the user prompt without restoring data.
    dismissPrompt: function(event) {
      event?.preventDefault();
      this.userPromptElement.remove();
      this._log('info', 'Persistence prompt dismissed by user.');
    },

    // Captures current form data and stores it in localStorage.
    captureFormData: function(event) {
      const moduleInstance = event.data.moduleInstance;
      let fieldValues = moduleInstance.$el.serializeArray();

      // Manually handle datetime-local and other HTML5 date/time inputs
      moduleInstance.$el.find("input[type='datetime-local'], input[type='date'], input[type='time'], input[type='week'], input[type='month']").each(function() {
        const $inputField = $(this);
        // Ensure the field is not already serialized or is a duplicate
        if (!fieldValues.some(item => item.name === $inputField.attr("name"))) {
           fieldValues.push({ name: $inputField.attr("name"), value: $inputField.val() });
        }
      });

      fieldValues = moduleInstance.filterExcludedFields(fieldValues);

      if (fieldValues.length > 0) {
        utilityFunctions.persistObject(moduleInstance.storageKey, fieldValues);
        this._log('info', `Form data saved for key: ${moduleInstance.storageKey}`);
      } else {
        this._log('info', `No data to save for key: ${moduleInstance.storageKey} after filtering.`);
        // Optionally clear existing state if all fields are ignored or empty
        // localStorage.removeItem(moduleInstance.storageKey);
      }
    },

    // Public method to explicitly trigger a save operation.
    storeCurrentState: function() {
      let moduleInstance = this;
      // If 'this' is the jQuery object, retrieve the plugin instance
      if (!this.captureFormData) {
        moduleInstance = this.data(formPersistenceModule.name);
      }
      if (moduleInstance && moduleInstance.storageKey) {
        moduleInstance.captureFormData({ data: { moduleInstance: moduleInstance } });
      } else {
        this._log('error', 'Cannot store state: module instance or storage key is missing.');
      }
    },

    // Filters out form fields that should not be persisted.
    filterExcludedFields: function(currentValues) {
      const excluded = this.excludedFields;
      if (!excluded || (Array.isArray(excluded) && excluded.length === 0 && !this.$el.find('[data-persist-ignore]').length)) {
        return currentValues; // No exclusions defined or found
      }

      let excludedNames = new Set(); // Use a Set for efficient lookup

      // Add names from array configuration
      if (Array.isArray(excluded)) {
        excluded.forEach(name => excludedNames.add(name));
      }
      // Add names from selector configuration (e.g., '.no-persist-field')
      else if (typeof excluded === 'string') {
        this.$el.find(excluded).each(function() {
          const name = $(this).attr('name');
          if (name) excludedNames.add(name);
        });
      }

      // Add names from data-persist-ignore attribute
      this.$el.find('[data-persist-ignore]').each(function() {
        const name = $(this).attr('name');
        if (name) excludedNames.add(name);
      });

      if (excludedNames.size === 0) {
        return currentValues;
      }

      return currentValues.filter(field => !excludedNames.has(field.name));
    },

    // Attaches event handlers to the user prompt element.
    attachPromptHandlers: function() {
      // If no prompt element is provided or it's not a valid jQuery object, generate default.
      if (!this.userPromptElement || !this.userPromptElement.length || !this.userPromptElement.jquery) {
        this.userPromptElement = this.generateDefaultPrompt();
      }

      const eventNamespace = "." + this.name;
      // Use arrow functions to maintain 'this' context without $.proxy
      this.userPromptElement.on("click" + eventNamespace, this.confirmActionSelector, (e) => this.repopulateFormData(e));

      if (this.cancelActionSelector) {
        this.userPromptElement.on("click" + eventNamespace, this.cancelActionSelector, (e) => this.dismissPrompt(e));
      }
    },

    // Determines and sets the unique storage key for the form.
    initializeStorageKey: function() {
      // Prioritize explicit storageKey, then form ID, then a unique generated key.
      this.storageKey = this.storageKey || this.$el.attr("id") || `fp-form-${Math.random().toString(36).substring(2, 9)}`;

      if (!this.storageKey) {
        this._log('error', 'Persistence Error: Could not determine a valid storage key for the form.');
      } else {
        this._log('info', `Using storage key: ${this.storageKey}`);
      }
    },

    // Binds event listeners for form submission and reset actions.
    attachResetListeners: function() {
      const moduleInstance = this;
      const eventNamespace = "." + this.name;

      if (this.shouldClearOnSubmit) {
        this.$el.on("submit" + eventNamespace, function() {
          $(this).trigger("formReset");
          // Detach unload handler to prevent saving immediately after submit
          $(window).off("unload" + eventNamespace);
          moduleInstance._log('info', 'Form submitted, unload handler temporarily detached.');
        });
      }

      // Custom event to explicitly clear stored data for the form.
      this.$el.on("formReset" + eventNamespace, function() {
        localStorage.removeItem(moduleInstance.storageKey);
        moduleInstance._log('info', `Stored data cleared for key: ${moduleInstance.storageKey}`);
      });

      // Bind to the native reset button within the form.
      this.$el.find(":reset").on("click" + eventNamespace, function() {
        $(this).closest("form").trigger("formReset");
      });
    },

    // Displays the persistence prompt if stored data is available.
    displayPersistencePrompt: function() {
      if (localStorage.getItem(this.storageKey)) {
        // If the element is a jQuery object, prepend it to the form.
        if (this.userPromptElement.length && this.userPromptElement.jquery) {
          this.userPromptElement.prependTo(this.$el).show();
          this._log('info', 'Persistence prompt displayed to user.');
        } else {
          // Otherwise, assume the prompt is already in the DOM and just needs to be shown.
          this.$el.find(this.promptContainerSelector).show();
          this._log('info', 'Existing persistence prompt shown.');
        }
      }
    },

    // Cleans up event handlers and optionally clears stored data.
    cleanupModule: function(clearStorageFlag) {
      const eventNamespace = "." + this.name;
      this.$el.off(eventNamespace).find(":reset").off(eventNamespace);
      $(window).off(eventNamespace);
      this._log('info', `Event handlers for ${this.name} unbound.`);

      if (clearStorageFlag) {
        localStorage.removeItem(this.storageKey);
        this._log('info', `Stored data for ${this.storageKey} explicitly removed.`);
      }
      this.$el.removeData(this.name); // Clean up jQuery data associated with the element
    },

    // Initializes the plugin instance.
    initializeModule: function() {
      this.initializeStorageKey();

      if (!this.storageKey) {
        this._log('error', 'Initialization aborted: No valid storage key.');
        return;
      }

      this.attachPromptHandlers();
      this.attachResetListeners();
      this.displayPersistencePrompt();

      // Bind to window unload for saving form state
      $(window).on("unload." + this.name, { moduleInstance: this }, this.captureFormData);
      this._log('info', `Form persistence module initialized for form: ${this.$el.attr('id') || this.storageKey}`);
    }
  };

  const utilityFunctions = {
    // Stores an object in localStorage, converting it to JSON string.
    persistObject: function(dataKey, dataValue) {
      try {
        localStorage.setItem(dataKey, JSON.stringify(dataValue));
      } catch (e) {
        console.error(`FORM_PERSISTENCE: Failed to save data for key "${dataKey}". Error:`, e);
      }
    },
    // Retrieves and parses an object from localStorage.
    retrieveObject: function(dataKey) {
      try {
        const item = localStorage.getItem(dataKey);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error(`FORM_PERSISTENCE: Failed to retrieve or parse data for key "${dataKey}". Error:`, e);
        return null;
      }
    },
    // Registers the module as a jQuery plugin.
    registerJQueryPlugin: function(pluginConfig) {
      $.fn[pluginConfig.name] = function(options) {
        const $elements = this;
        const invokedMethod = $.isPlainObject(options) || !options ? "" : options;
        // Slice arguments to pass to plugin methods
        const methodArgs = Array.prototype.slice.call(arguments, 1);

        // If a method name is provided and exists on the plugin config
        if (invokedMethod && typeof pluginConfig[invokedMethod] === 'function') {
          $elements.each(function() {
            // Retrieve the stored instance and call the method on it
            const currentInstance = $(this).data(pluginConfig.name);
            if (currentInstance) {
              pluginConfig[invokedMethod].apply(currentInstance, methodArgs);
            } else {
              $.error(`Method "${invokedMethod}" called on an uninitialized instance of jQuery.${pluginConfig.name}`);
            }
          });
        }
        // If no method name (or options object) is provided, initialize the plugin
        else if (!invokedMethod) {
          $elements.each(function() {
            // Check if plugin is already initialized on this element
            if (!$(this).data(pluginConfig.name)) {
              const currentInstance = $.extend(true, {
                $el: $(this) // Store a reference to the jQuery element
              }, pluginConfig, options);
              $(this).data(pluginConfig.name, currentInstance);
              currentInstance.initializeModule();
            } else {
              // Optionally re-initialize or update options for existing instance
              $(this).data(pluginConfig.name)._log('warn', 'Plugin already initialized on this element.');
            }
          });
        }
        // If an invalid method name is provided
        else {
          $.error(`Method "${invokedMethod}" is not a valid function or does not exist on jQuery.${pluginConfig.name}`);
        }
        return $elements; // Maintain chainability
      };
    }
  };

  utilityFunctions.registerJQueryPlugin(formPersistenceModule);
})(jQuery);