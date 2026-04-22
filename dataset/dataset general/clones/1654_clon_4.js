(function($) {
  // Internal class to manage each individual custom checkbox instance
  class FancyCheckboxControl {
    constructor(originalNode, userOptions) {
      this.originalElement = originalNode;
      this.originalJQueryElement = $(originalNode);

      // Configuration merging, distinct from $.extend
      this.configuration = Object.assign({
        outerShellCls: 'fancyToggle-shell',
        innerMarkCls: 'fancyToggle-mark',
        markContent: '',
        deactivatedShellCls: 'disabled-shell',
        deactivatedMarkCls: 'disabled-mark',
      }, userOptions);

      this.visualWrapper = null; // The div that visually replaces the checkbox
      this.visualIndicator = null; // The div for the checkmark inside the wrapper

      this.constructVisuals();
      this.bindInteraction();
    }

    constructVisuals() {
      this.originalJQueryElement.css('display', 'none'); // Hide the native checkbox

      // Create the custom visual wrapper
      this.visualWrapper = $('<div>')
        .addClass(this.configuration.outerShellCls)
        .css('user-select', 'none'); // Prevent text selection on custom control

      // Insert the custom wrapper immediately after the original checkbox
      this.originalJQueryElement.after(this.visualWrapper);

      // Set initial visual state based on the original checkbox's properties
      if (this.originalElement.checked) {
        this.renderMark();
      }
      if (this.originalElement.disabled) {
        this.applyDeactivatedState(true);
      }
    }

    renderMark() {
      // Create and append the checkmark indicator if it doesn't exist
      if (!this.visualIndicator) {
        this.visualIndicator = $('<div>')
          .addClass(this.configuration.innerMarkCls)
          .html(this.configuration.markContent);
        this.visualWrapper.append(this.visualIndicator);
      }
      // Ensure disabled styling is applied to the mark if the control is disabled
      if (this.originalElement.disabled) {
        this.visualIndicator.addClass(this.configuration.deactivatedMarkCls);
      }
    }

    removeMark() {
      // Remove the checkmark indicator if it exists
      if (this.visualIndicator) {
        this.visualIndicator.remove();
        this.visualIndicator = null;
      }
    }

    applyDeactivatedState(shouldAddClasses) {
      if (shouldAddClasses) {
        this.visualWrapper.addClass(this.configuration.deactivatedShellCls);
        if (this.visualIndicator) {
          this.visualIndicator.addClass(this.configuration.deactivatedMarkCls);
        }
      }
      // Update the native checkbox's disabled state
      this.originalElement.disabled = true;
      this.originalJQueryElement.prop('disabled', true);
    }

    removeDeactivatedState(shouldRemoveClasses) {
      if (shouldRemoveClasses) {
        this.visualWrapper.removeClass(this.configuration.deactivatedShellCls);
        if (this.visualIndicator) {
          this.visualIndicator.removeClass(this.configuration.deactivatedMarkCls);
        }
      }
      // Update the native checkbox's disabled state
      this.originalElement.disabled = false;
      this.originalJQueryElement.prop('disabled', false);
    }

    syncVisualsToNativeState() {
      // Updates the visual representation based on the native checkbox's checked state
      if (this.originalElement.checked) {
        this.renderMark();
      } else {
        this.removeMark();
      }
    }

    toggleNativeCheckedState(isUserInteraction) {
      // Do nothing if the control is disabled
      if (this.originalElement.disabled) {
        return;
      }

      const desiredCheckedState = !this.originalElement.checked;
      this.originalElement.checked = desiredCheckedState;
      this.originalJQueryElement.prop('checked', desiredCheckedState);

      // Update visuals
      this.syncVisualsToNativeState();

      // Trigger a change event on the original checkbox if this change originated from user interaction
      if (isUserInteraction) {
        this.originalJQueryElement.trigger('change');
      }
    }

    bindInteraction() {
      // Click on the custom visual wrapper should toggle the checkbox state
      this.visualWrapper.on('click.fancyToggle', () => {
        this.toggleNativeCheckedState(true); // Indicate user interaction
      });

      // Listen for changes on the original native checkbox (e.g., programmatic changes, form resets)
      this.originalJQueryElement.on('change.fancyToggle', () => {
        this.syncVisualsToNativeState();
      });
    }

    unbindInteraction() {
      this.visualWrapper.off('.fancyToggle');
      this.originalJQueryElement.off('.fancyToggle');
    }

    // Public methods corresponding to plugin operations
    setup() {
      // Initialization is handled in the constructor, this method serves as the entry point
    }

    dismantle() {
      this.unbindInteraction(); // Remove all event handlers
      this.visualWrapper.remove(); // Remove the custom visual elements
      this.originalJQueryElement.css('display', ''); // Restore original checkbox visibility
      this.originalJQueryElement.removeData('fancyToggleInstance'); // Clean up stored instance
    }

    deactivate() {
      this.applyDeactivatedState(true);
    }

    activate() {
      this.removeDeactivatedState(true);
    }

    mark() {
      if (!this.originalElement.checked) {
        this.originalElement.checked = true;
        this.originalJQueryElement.prop('checked', true);
        this.syncVisualsToNativeState();
        this.originalJQueryElement.trigger('change');
      }
    }

    unmark() {
      if (this.originalElement.checked) {
        this.originalElement.checked = false;
        this.originalJQueryElement.prop('checked', false);
        this.syncVisualsToNativeState();
        this.originalJQueryElement.trigger('change');
      }
    }
  }

  // Renamed operations collection
  const componentActions = {
    setup: function(configOptions) {
      return this.each(function() {
        let currentInstance = $(this).data('fancyToggleInstance');
        if (currentInstance) {
          // If already initialized, destroy and re-initialize with potential new options
          currentInstance.dismantle();
        }
        // Create a new instance of the control and store it using jQuery's data method
        currentInstance = new FancyCheckboxControl(this, configOptions);
        $(this).data('fancyToggleInstance', currentInstance);
      });
    },

    dismantle: function() {
      return this.each(function() {
        const currentInstance = $(this).data('fancyToggleInstance');
        if (currentInstance) {
          currentInstance.dismantle();
        }
      });
    },

    deactivate: function() {
      return this.each(function() {
        const currentInstance = $(this).data('fancyToggleInstance');
        if (currentInstance) {
          currentInstance.deactivate();
        }
      });
    },

    activate: function() {
      return this.each(function() {
        const currentInstance = $(this).data('fancyToggleInstance');
        if (currentInstance) {
          currentInstance.activate();
        }
      });
    },

    mark: function() {
      return this.each(function() {
        const currentInstance = $(this).data('fancyToggleInstance');
        if (currentInstance) {
          currentInstance.mark();
        }
      });
    },

    unmark: function() {
      return this.each(function() {
        const currentInstance = $(this).data('fancyToggleInstance');
        if (currentInstance) {
          currentInstance.unmark();
        }
      });
    },
  };

  // New jQuery plugin namespace
  $.fn.fancyToggle = function(command) {
    if (componentActions[command]) {
      // If a specific command is called, execute it on the selected elements
      return componentActions[command].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof command === 'object' || !command) {
      // If no command or an options object is passed, initialize the component
      return componentActions.setup.apply(this, arguments);
    } else {
      // Handle unknown commands
      $.error('Command "' + command + '" is not recognized by jQuery.fancyToggle');
    }
  };

})(jQuery);