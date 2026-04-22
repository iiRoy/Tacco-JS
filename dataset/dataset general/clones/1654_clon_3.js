(function( $ ){

  // Define the plugin's internal name and data key for storing instance data
  const PLUGIN_NAME = 'customToggle';
  const DATA_KEY = 'customToggleData';

  // --- Private Helper Functions ---

  /**
   * Manages the visual indicator's presence and styling within the custom wrapper.
   * @param {jQuery} $targetWrapper - The jQuery object for the custom wrapper.
   * @param {boolean} isChecked - The current checked state.
   * @param {string} indicatorClass - CSS class for the indicator element.
   * @param {string} indicatorContent - HTML content for the indicator.
   * @param {boolean} isDisabled - The current disabled state of the component.
   * @param {string} inactiveIndicatorClass - CSS class for a disabled indicator.
   */
  function _manageVisualIndicator($targetWrapper, isChecked, indicatorClass, indicatorContent, isDisabled, inactiveIndicatorClass) {
    const $existingIndicator = $targetWrapper.children('.' + indicatorClass);

    if (isChecked) {
      // If the component should be checked, ensure the indicator is present
      if ($existingIndicator.length === 0) {
        $targetWrapper.append($('<div>', {
          'class': indicatorClass,
          'html': indicatorContent
        }));
      }
      // Apply or remove the 'inactive' class to the indicator based on the component's disabled state
      if (isDisabled) {
        $targetWrapper.children('.' + indicatorClass).addClass(inactiveIndicatorClass);
      } else {
        $targetWrapper.children('.' + indicatorClass).removeClass(inactiveIndicatorClass);
      }
    } else {
      // If the component should be unchecked, remove any existing indicator
      if ($existingIndicator.length > 0) {
        $existingIndicator.remove();
      }
    }
  }

  /**
   * Synchronizes the underlying native input's 'checked' and 'disabled' properties
   * with the plugin's internal state, and triggers a 'change' event.
   * @param {jQuery} $jqElement - The jQuery object for the original input element.
   * @param {object} elementData - The plugin's internal data for this element.
   */
  function _syncNativeInputProperties($jqElement, elementData) {
    if (!elementData) return; // Guard against uninitialized data
    $jqElement.prop('checked', elementData.isMarked);
    $jqElement.prop('disabled', elementData.isDeactivated);
    $jqElement.trigger('change'); // Notify other handlers of state change
  }

  // --- Plugin Functions (Public API) ---

  var pluginMethods = {
    /**
     * Initializes the custom toggle component for each selected element.
     * @param {object} componentOptions - Configuration options for the component.
     */
    initialize : function( componentOptions ) {
	 
	  // Default configuration settings for the custom toggle
	  const DEFAULT_CONFIG = {
        wrapperClass : 'custom-toggle-wrapper',        // Class for the container of the visual toggle
	    indicatorClass : 'custom-toggle-indicator',    // Class for the checkmark/indicator element
	    indicatorContent : '&#x2713;',                  // Default HTML content for the indicator (a checkmark)
	    inactiveWrapperClass : 'state-disabled',       // Class applied to wrapper when component is disabled
	    inactiveIndicatorClass : 'indicator-disabled', // Class applied to indicator when component is disabled
      };

      // Process each element in the jQuery collection
      return this.each(function(){
            const domReference = this; // Native DOM element reference
			const $targetElement = $(this); // jQuery wrapped element reference

            // Guard clause: If the element is already initialized, skip or re-initialize
            if ($targetElement.data(DATA_KEY)) {
                console.warn(`Element already initialized as ${PLUGIN_NAME}. Skipping re-initialization.`);
                return;
            }

            // Merge default settings with user-provided options
            const currentConfig = $.extend( {}, DEFAULT_CONFIG, componentOptions);

            // Hide the original checkbox input element
			$targetElement.css('display', 'none');
            
            // Create the visual wrapper element and insert it after the hidden input
            const $visualWrapper = $('<div>', {
                'class': currentConfig.wrapperClass
            });
            $targetElement.after($visualWrapper);
            
            // Prevent text selection on the newly created custom control
			$visualWrapper.css('user-select', 'none');

            // Store all plugin-related data (settings, state, DOM references) on the original input element
            const instanceData = {
                config: currentConfig,
                $visualWrapper: $visualWrapper,
                isMarked: $targetElement.prop('checked'),    // Get initial checked state from native input
                isDeactivated: $targetElement.prop('disabled') // Get initial disabled state from native input
            };
            $targetElement.data(DATA_KEY, instanceData);

            // Apply initial visual state based on the input's current properties
            if (instanceData.isDeactivated) {
                $visualWrapper.addClass(instanceData.config.inactiveWrapperClass);
            }
            _manageVisualIndicator(
                $visualWrapper,
                instanceData.isMarked,
                instanceData.config.indicatorClass,
                instanceData.config.indicatorContent,
                instanceData.isDeactivated,
                instanceData.config.inactiveIndicatorClass
            );
			
            // Attach a click event handler to the custom visual wrapper
			$visualWrapper.on('click', function() {
                const elementInstanceData = $targetElement.data(DATA_KEY);
                if (!elementInstanceData) return; // Defensive check for detached elements

				// Only process click if the component is not deactivated
				if(!elementInstanceData.isDeactivated) {
					elementInstanceData.isMarked = !elementInstanceData.isMarked; // Toggle internal checked state
                    
                    // Update visual indicator
                    _manageVisualIndicator(
                        elementInstanceData.$visualWrapper,
                        elementInstanceData.isMarked,
                        elementInstanceData.config.indicatorClass,
                        elementInstanceData.config.indicatorContent,
                        elementInstanceData.isDeactivated,
                        elementInstanceData.config.inactiveIndicatorClass
                    );
                    // Synchronize with the native input and trigger change event
                    _syncNativeInputProperties($targetElement, elementInstanceData);
				}
			});		
			
            // Attach a change event handler to the original hidden input
            // This ensures the visual state updates if the native input's state changes programmatically or externally.
			$targetElement.on('change', function() {
                const currentInstanceData = $(this).data(DATA_KEY);
                if (!currentInstanceData) return; // Defensive check

                const actualNativeChecked = $(this).prop('checked');
                const actualNativeDisabled = $(this).prop('disabled');

                // Update internal state and visual representation if 'checked' state differs
                if (currentInstanceData.isMarked !== actualNativeChecked) {
                    currentInstanceData.isMarked = actualNativeChecked;
                    _manageVisualIndicator(
                        currentInstanceData.$visualWrapper,
                        currentInstanceData.isMarked,
                        currentInstanceData.config.indicatorClass,
                        currentInstanceData.config.indicatorContent,
                        currentInstanceData.isDeactivated, // Use internal disabled state for styling
                        currentInstanceData.config.inactiveIndicatorClass
                    );
                }
                // Update internal state and visual representation if 'disabled' state differs
                if (currentInstanceData.isDeactivated !== actualNativeDisabled) {
                    currentInstanceData.isDeactivated = actualNativeDisabled;
                    if (currentInstanceData.isDeactivated) {
                        currentInstanceData.$visualWrapper.addClass(currentInstanceData.config.inactiveWrapperClass);
                    } else {
                        currentInstanceData.$visualWrapper.removeClass(currentInstanceData.config.inactiveWrapperClass);
                    }
                    // Re-evaluate indicator styling based on new disabled state
                    _manageVisualIndicator(
                        currentInstanceData.$visualWrapper,
                        currentInstanceData.isMarked,
                        currentInstanceData.config.indicatorClass,
                        currentInstanceData.config.indicatorContent,
                        currentInstanceData.isDeactivated,
                        currentInstanceData.config.inactiveIndicatorClass
                    );
                }
			});		
       });
    },
	
    /**
     * Removes the custom toggle instance and restores the original input element.
     */
    removeInstance : function( ) {
       return this.each(function(){
				const $targetElement = $(this);
                const instanceData = $targetElement.data(DATA_KEY);

                // Guard clause: If not initialized or already removed, do nothing
                if (!instanceData) {
                    return;
                }

                // Restore the original input's display style
				$targetElement.css('display', '');
                // Remove the custom visual wrapper element
				instanceData.$visualWrapper.remove();
                // Clean up all stored plugin data from the original input element
                $targetElement.removeData(DATA_KEY);
       });
    },
	
	/**
	 * Deactivates the custom toggle, making it visually disabled and unresponsive to clicks.
	 */
	deactivate : function( ) {
       return this.each(function(){
				const $targetElement = $(this);
                const instanceData = $targetElement.data(DATA_KEY);

                // Guard clause: If not initialized or already deactivated, do nothing
                if (!instanceData || instanceData.isDeactivated) {
                    return;
                }
                
                instanceData.isDeactivated = true; // Update internal state
                instanceData.$visualWrapper.addClass(instanceData.config.inactiveWrapperClass); // Apply disabled styling to wrapper
                
                // Update indicator's styling if it exists
                _manageVisualIndicator(
                    instanceData.$visualWrapper,
                    instanceData.isMarked,
                    instanceData.config.indicatorClass,
                    instanceData.config.indicatorContent,
                    instanceData.isDeactivated,
                    instanceData.config.inactiveIndicatorClass
                );
                
                // Synchronize with the native input
                _syncNativeInputProperties($targetElement, instanceData);
       });
    },

	/**
	 * Activates the custom toggle, making it visually enabled and responsive to clicks.
	 */
	activate : function( ) {
       return this.each(function(){
				const $targetElement = $(this);
                const instanceData = $targetElement.data(DATA_KEY);

                // Guard clause: If not initialized or already active, do nothing
                if (!instanceData || !instanceData.isDeactivated) {
                    return;
                }

                instanceData.isDeactivated = false; // Update internal state
                instanceData.$visualWrapper.removeClass(instanceData.config.inactiveWrapperClass); // Remove disabled styling from wrapper
                
                // Update indicator's styling if it exists
                _manageVisualIndicator(
                    instanceData.$visualWrapper,
                    instanceData.isMarked,
                    instanceData.config.indicatorClass,
                    instanceData.config.indicatorContent,
                    instanceData.isDeactivated,
                    instanceData.config.inactiveIndicatorClass
                );
                
                // Synchronize with the native input
                _syncNativeInputProperties($targetElement, instanceData);
       });
    },
	
	/**
	 * Sets the custom toggle to a checked state.
	 */
	markChecked : function( ) {
       return this.each(function(){
				const $targetElement = $(this);
                const instanceData = $targetElement.data(DATA_KEY);

                // Guard clause: If not initialized or already marked, do nothing
                if (!instanceData || instanceData.isMarked) {
                    return;
                }
                
                instanceData.isMarked = true; // Update internal state
                
                // Ensure the indicator is present and styled correctly
                _manageVisualIndicator(
                    instanceData.$visualWrapper,
                    instanceData.isMarked,
                    instanceData.config.indicatorClass,
                    instanceData.config.indicatorContent,
                    instanceData.isDeactivated,
                    instanceData.config.inactiveIndicatorClass
                );
                
                // Synchronize with the native input
                _syncNativeInputProperties($targetElement, instanceData);
       });
    },
	
	/**
	 * Sets the custom toggle to an unchecked state.
	 */
	markUnchecked : function( ) {
       return this.each(function(){
				const $targetElement = $(this);
                const instanceData = $targetElement.data(DATA_KEY);

                // Guard clause: If not initialized or already unmarked, do nothing
                if (!instanceData || !instanceData.isMarked) {
                    return;
                }
                
                instanceData.isMarked = false; // Update internal state
                
                // Ensure the indicator is removed
                _manageVisualIndicator(
                    instanceData.$visualWrapper,
                    instanceData.isMarked,
                    instanceData.config.indicatorClass,
                    instanceData.config.indicatorContent,
                    instanceData.isDeactivated,
                    instanceData.config.inactiveIndicatorClass
                );
                
                // Synchronize with the native input
                _syncNativeInputProperties($targetElement, instanceData);
       });
    },
	
  };

  // --- jQuery Plugin Entry Point ---

  /**
   * Main entry point for the customToggle jQuery plugin.
   * Allows initialization with options or calling specific methods.
   * @param {string|object} actionName - The name of the method to call, or an options object for initialization.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn[PLUGIN_NAME] = function( actionName ) {

    // If the first argument is a string and corresponds to a valid plugin method
    if ( typeof actionName === 'string' && pluginMethods[actionName] ) {
      // Call the method, passing additional arguments (after the method name)
      return pluginMethods[actionName].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } 
    // If no arguments, or the first argument is an object (options), or undefined
    else if ( typeof actionName === 'object' || ! actionName ) {
      // Call the 'initialize' method with all provided arguments
      return pluginMethods.initialize.apply( this, arguments );
    } 
    // If an unknown method name is provided
    else {
      $.error( `Action "${actionName}" does not exist on jQuery.${PLUGIN_NAME}` );
    }    
  
  };

})( jQuery );