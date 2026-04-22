(function( jq ) {
  var pluginFunctions = {
    initialize: function( configParams ) {
      // Establish the default settings for the custom toggle element
      var currentConfig = jq.extend({
        containerCSS:      'fancyToggle-wrapper',
        indicatorCSS:      'fancyToggle-mark',
        indicatorContent:  '',
        inactiveContainerCSS: 'inactive',
        inactiveIndicatorCSS: 'inactive',
      }, configParams );

      return this.each( function() {
        var domElement = this;
        var jqElement  = jq(this);
        // Persist the initial state and configuration details on the DOM element
        domElement.isChecked = domElement.checked;
        domElement.isDeactivated = domElement.disabled;
        domElement.baseBoxStyle = currentConfig.containerCSS;
        domElement.checkMarkStyle = currentConfig.indicatorCSS;
        domElement.checkMarkHtml = currentConfig.indicatorContent;
        domElement.disabledBoxStyle = currentConfig.inactiveContainerCSS;
        domElement.disabledCheckMarkStyle = currentConfig.inactiveIndicatorCSS;

        // Conceal the native input control from view
        jqElement.css('display', 'none');
        // Introduce a new visual component adjacent to the hidden input
        jqElement.after('<div class="' + currentConfig.containerCSS + '"></div>');
        // Disable text selection for the newly added custom component
        jqElement.next().css('user-select', 'none');

        // If the original input is initially in a checked state, render the visual indicator
        if (domElement.isChecked) {
          jqElement.next().append('<div class="' + currentConfig.indicatorCSS + '">' + currentConfig.indicatorContent + '</div>');
        }

        // Apply disabled visual styles if the original input is initially disabled
        if (domElement.isDeactivated) {
          jqElement.next().addClass(domElement.disabledBoxStyle);
          jqElement.next().children().addClass(domElement.disabledCheckMarkStyle);
        }

        // Register a click event handler for the synthetic control
        jqElement.next().on('click', function() {
          if (!domElement.isDeactivated) { // Process interaction only if not disabled
            if (domElement.isChecked) { // If currently marked, unmark it
              jq(this).empty(); // Clear the visual mark
              domElement.isChecked = false; // Reflect state change internally
              jqElement.prop('checked', false); // Propagate state change to native input
            } else { // If currently unmarked, mark it
              jq(this).append('<div class="' + currentConfig.indicatorCSS + '">' + currentConfig.indicatorContent + '</div>'); // Display the visual mark
              domElement.isChecked = true; // Reflect state change internally
              jqElement.prop('checked', true); // Propagate state change to native input
            }
          }
        });

        // Set up a change event listener on the actual input element
        // This ensures synchronization if the input's state is modified externally
        jqElement.on('change', function() {
          if (!domElement.isChecked) { // If the input's state is now unchecked
            jqElement.next().empty(); // Remove the visual indicator
            domElement.isChecked = false; // Update internal state to unchecked
            jqElement.prop('checked', false); // Ensure the native input is unchecked
          } else { // If the input's state is now checked
            jqElement.next().append('<div class="' + currentConfig.indicatorCSS + '">' + currentConfig.indicatorContent + '</div>'); // Add the visual indicator
            domElement.isChecked = true; // Update internal state to checked
            jqElement.prop('checked', true); // Ensure the native input is checked
          }
        });
        return this;
      });
    },

    removeInstance: function() {
      return this.each(function() {
        var domElement = this;
        var jqElement = jq(this);
        // Restore the original input's visibility and discard the custom UI components
        jqElement.css('display', 'inline-block');
        jqElement.next().remove();
        return this;
      });
    },

    deactivate: function() {
      return this.each(function() {
        var domElement = this;
        var jqElement = jq(this);
        // Apply styling to visually indicate a disabled state
        jqElement.next().addClass(domElement.disabledBoxStyle);
        jqElement.next().children().addClass(domElement.disabledCheckMarkStyle);
        domElement.isDeactivated = true; // Update internal state
        jqElement.prop('disabled', true); // Disable the native input element
        return this;
      });
    },

    activate: function() {
      return this.each(function() {
        var domElement = this;
        var jqElement = jq(this);
        // Remove visual styling associated with a disabled state
        jqElement.next().removeClass(domElement.disabledBoxStyle);
        jqElement.next().children().removeClass(domElement.disabledCheckMarkStyle);
        domElement.isDeactivated = false; // Update internal state
        jqElement.prop('disabled', false); // Enable the native input element
        return this;
      });
    },

    select: function() {
      return this.each(function() {
        var domElement = this;
        var jqElement = jq(this);
        // Insert the visual indicator into the custom UI
        jqElement.next().append('<div class="' + domElement.checkMarkStyle + '">' + domElement.checkMarkHtml + '</div>');
        // Reapply disabled indicator style if the component is currently deactivated
        if (domElement.isDeactivated) {
          jqElement.next().children().addClass(domElement.disabledCheckMarkStyle);
        }
        domElement.isChecked = true; // Update internal state
        jqElement.prop('checked', true); // Mark the native input as checked
        return this;
      });
    },

    deselect: function() {
      return this.each(function() {
        var domElement = this;
        var jqElement = jq(this);
        // Remove the visual indicator from the custom UI
        jqElement.next().empty();
        domElement.isChecked = false; // Update internal state
        jqElement.prop('checked', false); // Mark the native input as unchecked
        return this;
      });
    },
  };

  // Register the new plugin with jQuery's prototype object
  jq.fn.fancyToggle = function( actionName ) {
    // Determine if the specified action method exists within our plugin's functions
    if ( pluginFunctions[actionName] ) {
      // Execute the method, passing along any additional arguments
      return pluginFunctions[actionName].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    }
    // If no action name is provided or the first argument is an object (for initialization config)
    else if ( typeof actionName === 'object' || !actionName ) {
      // Default to invoking the initialization routine
      return pluginFunctions.initialize.apply( this, arguments );
    }
    // In all other scenarios, report an error for an unrecognized function call
    else {
      jq.error( 'Function ' + actionName + ' does not exist on jq.fancyToggle' );
    }
  };
})( jQuery );