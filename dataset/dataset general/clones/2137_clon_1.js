/*
 * Sisyphus.js - A robust plugin for saving HTML form data to browser's local storage.
 * Designed to prevent data loss due to browser crashes, accidental tab closures,
 * or other unexpected events.
 *
 * @author Alexander Kaupanin <kaupanin@gmail.com>
 * @version 1.0.0
 * @license MIT
 */

(function($){ // Start of the immediately invoked function expression (IIFE) for jQuery plugin encapsulation.

  // Extend jQuery's prototype to add the sisyphus function, making it a jQuery plugin.
  $.fn.sisyphus = function(options){
    // Generate a unique identifier for the current set of elements.
    // This combines the IDs and names of all selected elements.
    var identifier = $.map(this, function(obj, i){
      return $(obj).attr("id") + $(obj).attr("name");
    }).join(); // Join the array of identifiers into a single string.

    // Retrieve or create a Sisyphus instance associated with this identifier.
    var sisyphus = Sisyphus.getInstance(identifier);
    // Protect the current set of forms/elements using the Sisyphus instance.
    sisyphus.protect(this, options);
    // Return the Sisyphus instance for chaining or further interaction.
    return sisyphus;
  };


  // Define a utility object for interacting with browser storage mechanisms.
  var browserStorage = {};

  /**
   * Checks the availability of browser storage.
   * Prioritizes jStorage if present, otherwise checks localStorage.
   *
   * @returns {boolean} True if a storage mechanism is available, false otherwise.
   */
  browserStorage.isAvailable = function(){
    if(typeof $.jStorage === "object"){ // Check for jStorage plugin.
      return true;
    }
    try{
      // Attempt to access localStorage to verify its availability.
      return localStorage.getItem;
    }catch(e){
      // Catch any errors (e.g., SecurityError in sandboxed iframes or when storage is full).
      return false;
    }
  };

  /**
   * Sets a key-value pair in the browser's storage.
   * Uses jStorage if available, falls back to localStorage.
   *
   * @param {string} key   The key under which to store the value.
   * @param {string} value The value to be stored. Will be converted to string.
   *
   * @returns {void}
   */
  browserStorage.set = function(key, value){
    if(typeof $.jStorage === "object"){
      $.jStorage.set(key, value + ""); // Ensure value is stored as a string.
    }else{
      try{
        localStorage.setItem(key, value + ""); // Store data using native localStorage.
      }catch(e){
        // Suppress QUOTA_EXCEEDED_ERR or other potential localStorage errors.
        // The plugin will silently fail to save if storage is full.
      }
    }
  };


  /**
   * Retrieves a value from browser storage by its key.
   * Prefers jStorage, then localStorage.
   *
   * @param {string} key The key of the item to retrieve.
   *
   * @returns {string|null} The retrieved value, or null if not found.
   */
  browserStorage.get = function(key){
    if(typeof $.jStorage === "object"){
      var result = $.jStorage.get(key);
      // jStorage might return non-string types, ensure compatibility.
      return result ? result.toString() : result;
    }else{
      return localStorage.getItem(key); // Retrieve data using native localStorage.
    }
  };


  /**
   * Removes a key-value pair from browser storage.
   *
   * @param {string} key The key of the item to remove.
   *
   * @returns {void}
   */
  browserStorage.remove = function(key){
    if(typeof $.jStorage === "object"){
      $.jStorage.deleteKey(key); // Remove using jStorage.
    }else{
      localStorage.removeItem(key); // Remove using native localStorage.
    }
  };

  /*
   * Sisyphus Core Logic (Singleton Pattern)
   * This section defines the main Sisyphus object and its methods.
   * It uses an IIFE to create a singleton instance.
   */
  Sisyphus = (function(){
    // Private parameters for tracking instances and startup status.
    var params = {
      instantiated: [], // Stores actual Sisyphus instances by identifier.
      started: []       // Tracks whether a Sisyphus instance has started its binding process.
    };

    // The core initialization function for a Sisyphus instance.
    function init(){

      return {
        // Sets the unique identifier for this Sisyphus instance.
        setInstanceIdentifier: function(identifier){
          this.identifier = identifier;
        },

        // Retrieves the unique identifier for this Sisyphus instance.
        getInstanceIdentifier: function(){
          return this.identifier;
        },

        /**
         * Sets the initial configuration options for the plugin.
         * Merges default options with user-provided options.
         *
         * @param {object} options User-defined options.
         *
         * @returns {void}
         */
        setInitialOptions: function(options){
          var defaults = {
            excludeFields: [],        // Array of fields to exclude from saving.
            customKeySuffix: "",      // Suffix to append to storage keys.
            locationBased: false,     // Whether to make storage keys unique per page URL.
            timeout: 0,               // Timeout in seconds for auto-saving text fields (0 for immediate).
            autoRelease: true,        // Automatically release data on form submit/reset.
            onSave: function(){},     // Callback function executed after data is saved.
            onBeforeRestore: function(){}, // Callback before data restoration.
            onRestore: function(){},  // Callback after data is restored.
            onRelease: function(){}   // Callback after data is released.
          };
          // Initialize options, extending defaults with provided options.
          this.options = this.options || $.extend(defaults, options);
          // Assign the browserStorage utility to the instance.
          this.browserStorage = browserStorage;
        },

        /**
         * Updates existing plugin options.
         * This can be used to change options dynamically after initialization.
         *
         * @param {object} options New options to merge.
         *
         * @returns {void}
         */
        setOptions: function(options){
          // Ensure initial options are set before merging new ones.
          this.options = this.options || this.setInitialOptions(options);
          // Merge new options, potentially overwriting previous ones.
          this.options = $.extend(this.options, options);
        },

        /**
         * Protects specified forms or input elements.
         * Binds saving and restoring mechanisms.
         *
         * @param {object} targets jQuery object representing forms/elements to protect.
         * @param {object} options Plugin options.
         *
         * @returns {boolean|void} False if browser storage is unavailable, otherwise void.
         */
        protect: function(targets, options){
          this.setOptions(options); // Set or update options.
          targets = targets || {};  // Ensure targets is an object.
          var self = this;          // Reference to the current Sisyphus instance.
          this.targets = this.targets || []; // Initialize targets array if not already.

          // Determine the base key for location-based storage.
          if(self.options.name){
            this.href = self.options.name;
          }else{
            this.href = location.hostname + location.pathname + location.search + location.hash;
          }

          // Merge new targets with existing ones and ensure uniqueness.
          this.targets = $.merge(this.targets, targets);
          this.targets = $.unique(this.targets);
          this.targets = $(this.targets); // Convert to jQuery object for consistent handling.

          if(!this.browserStorage.isAvailable()){
            // If no storage is available, protection cannot proceed.
            return false;
          }

          // Execute onBeforeRestore callback.
          var callback_result = self.options.onBeforeRestore.call(self);
          // Only restore if callback doesn't explicitly return false.
          if(callback_result === undefined || callback_result){
            self.restoreAllData();
          }

          // Bind release data mechanism if autoRelease is enabled.
          if(this.options.autoRelease){
            self.bindReleaseData();
          }

          // Prevent multiple bindings for the same instance.
          if(!params.started[this.getInstanceIdentifier()]){
            // Special handling for CKEditor instances.
            if(self.isCKEditorPresent()){
              var intervalId = setInterval(function(){
                if(CKEDITOR.isLoaded){ // Wait until CKEditor is fully loaded.
                  clearInterval(intervalId); // Stop checking.
                  self.bindSaveData();       // Bind save data mechanisms.
                  params.started[self.getInstanceIdentifier()] = true; // Mark as started.
                }
              }, 100); // Check every 100ms.
            }else{
              self.bindSaveData();       // Bind save data for standard fields.
              params.started[this.getInstanceIdentifier()] = true; // Mark as started.
            }
          }
        },

        /**
         * Checks if CKEditor is present on the page and initializes its loaded flag.
         *
         * @returns {boolean} True if CKEditor exists and setup for loading, false otherwise.
         */
        isCKEditorPresent: function(){
          if(this.isCKEditorExists()){
            // Initialize a custom flag to track CKEditor readiness.
            CKEDITOR.isLoaded = false;
            // Listen for the 'instanceReady' event to set the flag.
            CKEDITOR.on('instanceReady', function(){
              CKEDITOR.isLoaded = true;
            });
            return true;
          }else{
            return false;
          }
        },

        /**
         * Simply checks if the CKEDITOR global object exists.
         *
         * @returns {boolean} True if CKEDITOR object is defined, false otherwise.
         */
        isCKEditorExists: function(){
          return typeof CKEDITOR != "undefined";
        },

        /**
         * Finds all input fields within a given target element that should be protected.
         * Excludes specific types like submit, reset, button, file, password, disabled, and readonly fields.
         *
         * @param {object} target A jQuery object representing the form or container.
         *
         * @returns {object} A jQuery object containing the fields to protect.
         */
        findFieldsToProtect: function(target){
          return target.find(":input").not(":submit").not(":reset").not(":button").not(":file").not(":password").not(":disabled").not("[readonly]");
        },

        /**
         * Binds data saving mechanisms to the protected fields.
         * This includes immediate saving for text fields (if no timeout) and change events.
         *
         * @returns {void}
         */
        bindSaveData: function(){
          var self = this; // Cache 'this' for use in nested functions.

          if(self.options.timeout){
            self.saveDataByTimeout(); // Start timeout-based saving if configured.
          }

          self.targets.each(function(){
            var targetFormIdAndName = $(this).attr("id") + $(this).attr("name"); // Unique ID for the form.
            self.findFieldsToProtect($(this)).each(function(){
              if($.inArray(this, self.options.excludeFields) !== -1){
                // Skip this field if it's in the exclude list.
                // Returning non-false is equivalent to 'continue' in a loop.
                return true;
              }
              var field = $(this); // Current field being processed.
              // Construct the storage key prefix.
              var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;

              // Bind immediate saving for text-like inputs if no timeout is set.
              if(field.is(":text") || field.is("textarea")){
                if(!self.options.timeout){
                  self.bindSaveDataImmediately(field, prefix);
                }
              }
              // Always bind saving on change for other input types (select, checkbox, radio).
              self.bindSaveDataOnChange(field);
            });
          });
        },

        /**
         * Saves all protected forms' data to Local Storage.
         * This method is called periodically or on specific events.
         * It ensures all field types (text, checkboxes, radios, selects) are handled.
         *
         * @returns {void}
         */
        saveAllData: function(){
          var self = this;
          self.targets.each(function(){
            var targetFormIdAndName = $(this).attr("id") + $(this).attr("name");
            var multiCheckboxCache = {}; // Cache for multi-checkbox groups to avoid duplicate processing.

            self.findFieldsToProtect($(this)).each(function(){
              var field = $(this);
              // Skip excluded fields or fields without a name attribute.
              if($.inArray(this, self.options.excludeFields) !== -1 || field.attr("name") === undefined){
                return true; // Continue to the next field.
              }
              // Construct the storage key.
              var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;
              var value = field.val(); // Get current field value.

              if(field.is(":checkbox")){
                if(field.attr("name").indexOf("[") !== -1){
                  // Handle multiple checkboxes with the same name (e.g., name="myArray[]").
                  if(multiCheckboxCache[field.attr("name")] === true){
                    return; // Already processed this group.
                  }
                  value = []; // Initialize array for selected values.
                  // Find all checked checkboxes in the group and collect their values.
                  $("[name='" + field.attr("name") + "']:checked").each(function(){
                    value.push($(this).val());
                  });
                  multiCheckboxCache[field.attr("name")] = true; // Mark group as processed.
                }else{
                  // Single checkbox: store its checked state.
                  value = field.is(":checked");
                }
                self.saveToBrowserStorage(prefix, value, false); // Save without firing onSave callback immediately.
              }else if(field.is(":radio")){
                if(field.is(":checked")){
                  // Only save the value of the checked radio button.
                  value = field.val();
                  self.saveToBrowserStorage(prefix, value, false);
                }
              }else{
                // Handle text inputs, textareas, selects.
                if(self.isCKEditorExists()){
                  var editor;
                  // Check if the field is a CKEditor instance.
                  if(editor = CKEDITOR.instances[field.attr("name")] || CKEDITOR.instances[field.attr("id")]){
                    editor.updateElement(); // Ensure CKEditor's data is synced to the textarea.
                    self.saveToBrowserStorage(prefix, field.val(), false);
                  }else{
                    self.saveToBrowserStorage(prefix, value, false);
                  }
                }else{
                  self.saveToBrowserStorage(prefix, value, false);
                }
              }
            });
          });
          self.options.onSave.call(self); // Execute the global onSave callback after all data is saved.
        },

        /**
         * Restores all data for protected fields from Local Storage.
         * This typically happens on page load.
         *
         * @returns {void}
         */
        restoreAllData: function(){
          var self = this;
          var restored = false; // Flag to track if any data was actually restored.

          self.targets.each(function(){
            var target = $(this);
            var targetFormIdAndName = $(this).attr("id") + $(this).attr("name");

            self.findFieldsToProtect(target).each(function(){
              if($.inArray(this, self.options.excludeFields) !== -1){
                return true; // Skip excluded fields.
              }
              var field = $(this);
              // Construct the storage key.
              var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;
              var resque = self.browserStorage.get(prefix); // Retrieve stored data.

              if(resque !== null){
                self.restoreFieldsData(field, resque); // Restore data to the field.
                restored = true; // Mark that restoration occurred.
              }
            });
          });

          if(restored){
            self.options.onRestore.call(self); // Execute onRestore callback if data was restored.
          }
        },

        /**
         * Restores the value of a single form field based on stored data.
         * Handles various input types including checkboxes, radios, and multi-selects.
         *
         * @param {object} field jQuery form element object.
         * @param {string} resque Previously stored field data.
         *
         * @returns {boolean|void} False if field has no name, otherwise void.
         */
        restoreFieldsData: function(field, resque){
          if(field.attr("name") === undefined){
            return false; // Cannot restore a field without a name.
          }

          if(field.is(":checkbox") && resque !== "false" && field.attr("name").indexOf("[") === -1){
            field.attr("checked", "checked"); // Check single checkbox if stored as true.
          }else if(field.is(":checkbox") && resque === "false" && field.attr("name").indexOf("[") === -1){
            field.removeAttr("checked"); // Uncheck single checkbox if stored as false.
          }else if(field.is(":radio")){
            if(field.val() === resque){
              field.attr("checked", "checked"); // Check radio button if its value matches stored data.
            }
          }else if(field.attr("name").indexOf("[") === -1){
            field.val(resque); // For text, textarea, select (single).
          }else{
            // For multi-selects or multiple checkboxes with array names.
            resque = resque.split(","); // Split the comma-separated stored values.
            field.val(resque);         // Set the values.
          }
        },

        /**
         * Binds immediate data saving for text-like fields (on input/propertychange events).
         * This is used when `timeout` option is 0.
         *
         * @param {object} field jQuery form element object.
         * @param {string} prefix Key prefix for storage.
         *
         * @returns {void}
         */
        bindSaveDataImmediately: function(field, prefix){
          var self = this;

          // Use 'onpropertychange' for IE, 'oninput' for modern browsers.
          if('onpropertychange' in field){
            field.get(0).onpropertychange = function(){
              self.saveToBrowserStorage(prefix, field.val());
            };
          }else{
            field.get(0).oninput = function(){
              self.saveToBrowserStorage(prefix, field.val());
            };
          }

          // Special binding for CKEditor instances.
          if(this.isCKEditorExists()){
            var editor;
            if(editor = CKEDITOR.instances[field.attr("name")] || CKEDITOR.instances[field.attr("id")]){
              editor.document.on('keyup', function(){
                editor.updateElement(); // Update the underlying textarea.
                self.saveToBrowserStorage(prefix, field.val());
              });
            }
          }
        },

        /**
         * Saves a given key-value pair to browser storage and optionally fires the `onSave` callback.
         *
         * @param {string}  key         The storage key.
         * @param {string}  value       The value to store.
         * @param {boolean} [fireCallback=true] Whether to execute the `onSave` callback.
         *
         * @returns {void}
         */
        saveToBrowserStorage: function(key, value, fireCallback){
          // Default fireCallback to true if not explicitly provided.
          fireCallback = fireCallback === undefined ? true : fireCallback;
          this.browserStorage.set(key, value); // Perform the actual storage operation.
          // Fire callback only if requested and value is not empty.
          if(fireCallback && value !== ""){
            this.options.onSave.call(this);
          }
        },

        /**
         * Binds the `saveAllData` method to the `change` event of a field.
         * This handles select boxes, checkboxes, and radio buttons.
         *
         * @param {object} field jQuery form element object.
         *
         * @returns {void}
         */
        bindSaveDataOnChange: function(field){
          var self = this;
          field.change(function(){
            self.saveAllData(); // Save all data when this field changes.
          });
        },

        /**
         * Initiates a recurring timeout-based saving mechanism for all protected fields.
         * This is used when `timeout` option is greater than 0.
         *
         * @returns {void}
         */
        saveDataByTimeout: function(){
          var self = this;
          var targetForms = self.targets; // Capture targets for the closure.

          setTimeout((function(){
            function timeout(){
              self.saveAllData(); // Save all form data.
              // Schedule the next save operation.
              setTimeout(timeout, self.options.timeout * 1000);
            }
            return timeout; // Return the inner function to be executed by setTimeout.
          })(targetForms), self.options.timeout * 1000); // Initial delay before first save.
        },

        /**
         * Binds the `releaseData` method to the `submit` and `reset` events of protected forms.
         * This ensures stored data is cleared when a form is submitted or reset.
         *
         * @returns {void}
         */
        bindReleaseData: function(){
          var self = this;
          self.targets.each(function(){
            var target = $(this);
            var formIdAndName = target.attr("id") + target.attr("name"); // Form identifier.
            $(this).bind("submit reset", function(){
              self.releaseData(formIdAndName, self.findFieldsToProtect(target));
            });
          });
        },

        /**
         * Manually triggers the release of stored data for all protected forms.
         * Useful for programmatic cleanup.
         *
         * @returns {void}
         */
        manuallyReleaseData: function(){
          var self = this;
          self.targets.each(function(){
            var target = $(this);
            var formIdAndName = target.attr("id") + target.attr("name");
            self.releaseData(formIdAndName, self.findFieldsToProtect(target));
          });
        },

        /**
         * Releases (deletes) stored data for a specific form's fields from browser storage.
         *
         * @param {string} targetFormIdAndName   A unique identifier for the form.
         * @param {object} fieldsToProtect       jQuery object containing the fields to clear.
         *
         * @returns {void}
         */
        releaseData: function(targetFormIdAndName, fieldsToProtect){
          var released = false; // Flag to indicate if any data was released.
          var self = this;

          // Mark this instance as not started anymore, allowing re-protection.
          params.started[self.getInstanceIdentifier()] = false;

          fieldsToProtect.each(function(){
            if($.inArray(this, self.options.excludeFields) !== -1){
              return true; // Skip excluded fields.
            }
            var field = $(this);
            // Construct the storage key.
            var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;
            self.browserStorage.remove(prefix); // Remove data from storage.
            released = true; // Mark that data was released.
          });

          if(released){
            self.options.onRelease.call(self); // Execute onRelease callback if data was cleared.
          }
        }
      }; // End of Sisyphus instance methods.
    } // End of init function.

    // Sisyphus Singleton management.
    var instance; // Holds the single instance of Sisyphus.
    return {
      /**
       * Returns the singleton instance of Sisyphus for a given identifier.
       * Creates a new instance if one doesn't exist for the identifier.
       *
       * @param {string} identifier Unique identifier for the instance.
       *
       * @returns {object} The Sisyphus instance.
       */
      getInstance: function(identifier){
        if(!params.instantiated[identifier]){
          // If no instance exists for this identifier, create one.
          instance = init();
          instance.setInstanceIdentifier(identifier);
          params.instantiated[identifier] = instance; // Store the new instance.
        }
        return params.instantiated[identifier]; // Return the existing or newly created instance.
      }
    };
  })(); // End of Sisyphus IIFE.

})(jQuery); // Pass jQuery object to the IIFE.