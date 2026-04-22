// Copyright 2024 Fictional Corp.
// This software is available under a dual license: MIT or Apache 2.0.
// For full details, please refer to the LICENSE files distributed with this source.

// Ensure jQuery is loaded before proceeding with module initialization.
if (typeof jQuery === 'undefined') {
  // If jQuery is not found, an error is thrown to prevent silent failures.
  throw new Error("JQuery library is a prerequisite and was not detected.");
}

(function(jq){

  // Define a module for monitoring form changes and managing UI state.
  jq.extend({
    FormChangeMonitor: {
      // Configuration settings for the change monitoring system.
      enableDiagnostics : false, // Flag to enable verbose logging for debugging purposes.
      modifiedElementClass: 'form-modified-field', // CSS class applied to changed input elements.
      customClassApplier : new Function, // A custom function to determine where to apply the modified class.
      isConsoleAvailable: "console" in window && "info" in window.console, // Checks for a functional browser console.
      includeHiddenFields : false, // Determines if hidden input fields should be tracked for changes.
      triggerChangeEvent  : 'change.monitor', // The DOM event that triggers change detection on inputs.
      
      // Utility function for logging diagnostic messages.
      outputDiagnostic    : function(message){
        // Only log if diagnostics are enabled and a message is provided.
        if(this.enableDiagnostics && message) {
          const logPrefix = "FormChangeMonitor: ";
          const fullMessage = logPrefix + message;
          // Use console.info for non-critical diagnostics if available, otherwise fallback to alert.
          this.isConsoleAvailable ? console.info(fullMessage) : alert(fullMessage);
        }
      },

      // Retrieves the current value of an input element, handling different types.
      getControlValue     : function(inputElement){
        if(!inputElement || !inputElement.length) return undefined; // Guard against empty jQuery objects.

        // For radio buttons and checkboxes, return their checked state (boolean).
        if(inputElement.is(':radio,:checkbox')){
          return inputElement.prop('checked'); // Use prop() for boolean attributes for accuracy.
        } else {
          // For other input types, return the standard value.
          return inputElement.val();
        }
      }, 
      
      // Resets an input element to its stored initial value.
      revertControlState  : function(inputElement){
        if(!inputElement || !inputElement.length) return; // Guard against empty jQuery objects.

        const initialVal = inputElement.data('initial');
        // Ensure an initial value was actually stored.
        if (typeof initialVal === 'undefined') {
            this.outputDiagnostic(`No initial value found for element: ${inputElement.attr('name') || inputElement.attr('id')}`);
            return;
        }

        // Handle radio/checkbox types by setting the checked property.
        if(inputElement.is(':radio,:checkbox')){
          inputElement.prop('checked', initialVal);
        } else {
          // For other input types, set the value attribute.
          inputElement.val(initialVal);
        }
        // Trigger a change event to ensure other listeners are notified of the reset.
        inputElement.trigger(jq.FormChangeMonitor.triggerChangeEvent);
      },

      // Core function to check for changes in an input element and update form state.
      processInputChange  : function(evt){
        const targetElement = jq(evt.target);
        // Find the closest ancestor form that is being monitored.
        const parentForm = targetElement.parents('.tracked-form');
        const initialValue = targetElement.data("initial");
        const currentValue = jq.FormChangeMonitor.getControlValue(targetElement);
        // Retrieve references to all monitored inputs and settings from the event data.
        const allTrackedInputs = evt.data.inputs;
        const currentSettings = evt.data.settings;
        
        // Compare initial and current values to detect a change.
        if(initialValue !== currentValue) {
          jq.FormChangeMonitor.outputDiagnostic(`Form "${parentForm.attr('id') || parentForm.attr('name')}" detected as modified. Field "${targetElement.attr('name') || targetElement.attr('id')}" changed from "${initialValue}" to "${currentValue}".`);
          
          // Mark the form as dirty and trigger a 'formModified' event.
          parentForm
            .data("isModified", true) // Use a more descriptive data key.
            .trigger("formModified", {
                sourceElement: targetElement,
                oldValue: initialValue,
                newValue: currentValue,
                // Provide no-op functions for `preventDefault` and `stopPropagation` for consistency
                // with standard DOM events, even if not directly used here.
                preventPropagation: function(){},
                haltDefault: function(){},
                canBubble: true,
                isCancelable: true
            });
          
          // Apply the 'modified' class to the target element and potentially other related elements.
          targetElement
            .add(currentSettings.customClassApplier.apply(targetElement)) // Allows for custom logic to select elements.
            .addClass(currentSettings.modifiedElementClass);
            
        } else {
          // If the value has reverted to its initial state, remove the 'modified' class.
          targetElement
            .add(currentSettings.customClassApplier.apply(targetElement))
            .removeClass(currentSettings.modifiedElementClass);
        }
        
        // Check if any other inputs in the form are still marked as modified.
        // If not, the form is considered clean.
        if(!allTrackedInputs.filter('.' + currentSettings.modifiedElementClass).length){ // Use .length instead of .size() for modern jQuery.
          parentForm
            .data("isModified",false)
            .trigger("formCleaned", {
                sourceElement: targetElement,
                preventPropagation: function(){},
                haltDefault: function(){},
                canBubble: true,
                isCancelable: true
            });
          jq.FormChangeMonitor.outputDiagnostic(`Form "${parentForm.attr('id') || parentForm.attr('name')}" is now clean.`);
        }
      }
    }
  });
    
  /**
   * jQuery plugin: revertFormState
   * Resets all monitored fields within the selected forms to their initial state.
   */
  jq.fn.revertFormState = function(){
    return this.each(function(){
      const currentForm = jq(this);

      // Validate that the element is indeed a form.
      if(currentForm.is('form')) {
        // Use native form reset for a broader reset, then individually clean monitored fields.
        currentForm[0].reset(); 
        currentForm.find(`.${jq.FormChangeMonitor.modifiedElementClass}:input`).each(function(){
          jq(this).trigger(jq.FormChangeMonitor.triggerChangeEvent); // Trigger change to update monitor.
        });
      } else {
        // If not a form, iterate through its input elements and reset them individually.
        let controlFilter = ':submit,:password,:button';
        if (!jq.FormChangeMonitor.includeHiddenFields) {
          controlFilter = ':hidden,' + controlFilter;
        }

        jq(`:input:not(${controlFilter})`, currentForm).each(function(){
          jq.FormChangeMonitor.revertControlState(jq(this));
        });
      }
    });
  };
  
  /**
   * jQuery plugin: enableChangeTracking
   * Initializes selected forms for change monitoring.
   */
  jq.fn.enableChangeTracking = function(options){
    const defaultSettings = {
      modifiedElementClass: jq.FormChangeMonitor.modifiedElementClass,
      customClassApplier  : jq.FormChangeMonitor.customClassApplier,
      enableLiveMonitoring: typeof jq.fn.livequery === 'function' // Check for livequery plugin availability.
    };
    
    // Merge provided options with defaults.
    const currentSettings = jq.extend({}, defaultSettings, options || {});

    return this.each(function(){
      const targetForm = jq(this);

      // Construct a selector for input fields to be monitored.
      let inputExclusionSelector = ':submit,:password,:button';
      if (!currentSettings.includeHiddenFields) { // Use configured setting, not global.
        inputExclusionSelector = ':hidden,' + inputExclusionSelector;
      }
      const monitorableInputs = jq(`:input:not(${inputExclusionSelector})`, targetForm);

      // If the form is already being tracked, unbind existing events before re-initializing.
      if (targetForm.hasClass('tracked-form')) {
        targetForm.off("formModified").off("formCleaned");
        monitorableInputs.off(jq.FormChangeMonitor.triggerChangeEvent);
      } else {
        targetForm.addClass('tracked-form'); // Mark the form as tracked.
      }

      jq.FormChangeMonitor.outputDiagnostic(`Initializing change monitoring for form: ${targetForm[0].id || targetForm[0].name || targetForm[0].tagName}`);
      
      // Function to bind monitoring events and store initial values.
      const setupInputMonitoring = function(inputElement){
        inputElement
          .on(jq.FormChangeMonitor.triggerChangeEvent, {inputs: monitorableInputs, settings: currentSettings}, jq.FormChangeMonitor.processInputChange)
          .data('initial', jq.FormChangeMonitor.getControlValue(inputElement)); // Store initial value.
      };

      // Use livequery for dynamically added elements if available, otherwise bind directly.
      if (currentSettings.enableLiveMonitoring) {
        monitorableInputs.livequery(function(){
          setupInputMonitoring(jq(this));
        });
      } else {
        monitorableInputs.each(function(){
          setupInputMonitoring(jq(this));
        });
      }
    });
  };
  
  /**
   * jQuery plugin: preventNavigationOnDirty
   * Attaches handlers to elements (typically links or tab navigators)
   * to warn users about unsaved changes before navigating away.
   */
  jq.fn.preventNavigationOnDirty = function(userOptions){
    const dialogDefaults = {
        title: "Unsaved Work Detected!",
        height: 320,
        width: 550,
        modal: true,
        resizable: false,
        autoResize: false, // Ensure this is false if height/width are set.
        overlay: {backgroundColor: "black", opacity: 0.6}
    };
    
    const messageDefaults = '<div class="alert-icon"></div><p>You have made changes that have not been saved.</p><p>Proceeding will result in the loss of all your unsaved data.</p><p>Are you certain you wish to continue?</p>';

    const mergedSettings = jq.extend(true, {}, {
        dialogConfig: dialogDefaults,
        alertMessage: messageDefaults
    }, userOptions || {});
    
    jq.FormChangeMonitor.outputDiagnostic("Setting up navigation interceptors for unsaved changes.");
    
    return this.each(function(){
      const triggerElement = jq(this);
      
      // Check if this element is part of a jQuery UI Tabs navigation.
      const parentTabsNav = triggerElement.parents('.ui-tabs-nav');
      if (parentTabsNav.length > 0){
        // Handle jQuery UI Tabs specifically.
        const tabsContainer = parentTabsNav.closest('.ui-tabs'); // Get the main tabs container.
        
        // Unbind previous dirty form handlers to avoid duplicates.
        tabsContainer.off('tabsselect.changeMonitor');
        parentTabsNav.find('a').off('click.changeMonitor'); // Also unbind click on tab links.

        tabsContainer.on('tabsselect.changeMonitor', function(event, ui){
          // Check if any tracked form on the page has unsaved changes.
          if(jq('.tracked-form').hasUnsavedChanges()) {
            event.preventDefault(); // Prevent tab change immediately.

            const dialogContainer = jq("<div id='unsaved_changes_dialog'/>").appendTo(document.body);
            
            dialogContainer.dialog(jq.extend({}, mergedSettings.dialogConfig, {
              buttons: {
                "Discard Changes & Proceed": function(){
                  // Get the currently active tab's content ID.
                  const currentSelectedTabId = jq(ui.tab).parent().siblings('.ui-tabs-active').find('a').attr('href');
                  // Revert changes in forms within the *currently active* tab.
                  jq('.tracked-form', currentSelectedTabId).revertFormState();
                    
                  // Now that the old tab is clean, select the new tab.
                  tabsContainer.tabs('option', 'active', tabsContainer.find('a[href="' + jq(ui.newTab).find('a').attr('href') + '"]').parent().index());
                  
                  // Close and remove the dialog.
                  jq(this).dialog('destroy').remove();
                },
                "Keep Editing": function(){
                    jq(this).dialog('destroy').remove(); // Close dialog without proceeding.
                }
              }
            })).dialog("moveToTop").append(mergedSettings.alertMessage); // Add message content.
            return false; // Prevent default action for older jQuery UI versions.
          }
        });
      } else {
        // Generic link/button handler.
        triggerElement.off('click.changeMonitor'); // Unbind previous handlers.
        triggerElement.on('click.changeMonitor', function(event){
          if(jq('.tracked-form').hasUnsavedChanges()) {
            event.preventDefault(); // Stop the default navigation.
            const targetHref = jq(this).attr('href');
            
            const dialogContainer = jq("<div id='unsaved_changes_dialog'/>").appendTo(document.body);
            dialogContainer.dialog(jq.extend({
                buttons: {
                  "Discard Changes & Go": function(){
                      window.location.href = targetHref; // Proceed to the link's destination.
                  },
                  "Stay Here": function(){
                      jq(this).dialog('destroy').remove(); // Close dialog.
                      return false; // Prevent further action.
                  }
                }
              }, mergedSettings.dialogConfig)).dialog("moveToTop").append(mergedSettings.alertMessage);
          }
        });
      }
    });
  };
  
  /**
   * jQuery plugin: hasUnsavedChanges
   * Checks if any of the selected forms (or all tracked forms if called on `jq('.tracked-form')`)
   * have been marked as modified.
   * Not chainable. Returns a boolean.
   */
  jq.fn.hasUnsavedChanges = function (){
    let isAnyFormModified = false;
    this.each(function(){
      // Check for the 'isModified' data attribute.
      if(jq(this).data('isModified')) {
        isAnyFormModified = true;
        // Break out of the .each loop early once a modified form is found.
        return false; 
      }
    });
    return isAnyFormModified;
  };
  
  /**
   * jQuery plugin: checkChangesDebug
   * A debugging utility that provides an alert indicating if forms are dirty or clean.
   */
  jq.fn.checkChangesDebug = function(){    
    jq.FormChangeMonitor.outputDiagnostic("Enabling debug checker for form status!");
    
    return this.each(function(){
      const debugButton = jq(this);
      debugButton.on('click', function(){
        if(jq("form").hasUnsavedChanges()) {
          alert("Alert: Forms with unsaved modifications detected!");
        } else {
          alert("All forms are currently clean.");
        }
      });
    });
  };
  
  /**
   * Extend jQuery fn for shortcut event binding.
   * Allows binding handlers to 'formModified' and 'formCleaned' events directly.
   */
  jq.fn.extend({
    // Bind a handler to the custom 'formModified' event.
    onFormModified: function(handlerFunction) {
  		return this.on('formModified', handlerFunction);
  	},
    // Bind a handler to the custom 'formCleaned' event.
  	onFormCleaned: function(handlerFunction) {
  		return this.on('formCleaned', handlerFunction);
  	}
  });

})(jQuery);