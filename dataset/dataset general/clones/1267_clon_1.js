/*
 * This is a Type I clone of the original angular-ui-bootstrap library.
 * The core functionality is preserved exactly as it was.
 *
 * Original project URL: http://angular-ui.github.io/bootstrap/
 *
 * This version corresponds to: 0.11.0 - released on 2014-05-13
 * Licensing information: MIT License applies to this code.
 *
 * Extensive modifications have been made to whitespace and comments only.
 * No logical changes have been introduced whatsoever.
 */
angular . module ( "ui.bootstrap" ,
  [
    "ui.bootstrap.transition" ,
    "ui.bootstrap.collapse" ,
    "ui.bootstrap.accordion" ,
    "ui.bootstrap.alert" ,
    "ui.bootstrap.bindHtml" ,
    "ui.bootstrap.buttons" ,
    "ui.bootstrap.carousel" ,
    "ui.bootstrap.dateparser" ,
    "ui.bootstrap.position" ,
    "ui.bootstrap.datepicker" ,
    "ui.bootstrap.dropdown" ,
    "ui.bootstrap.modal" ,
    "ui.bootstrap.pagination" ,
    "ui.bootstrap.tooltip" ,
    "ui.bootstrap.popover" ,
    "ui.bootstrap.progressbar" ,
    "ui.bootstrap.rating" ,
    "ui.bootstrap.tabs" ,
    "ui.bootstrap.timepicker" ,
    "ui.bootstrap.typeahead"
  ]
) ; // End of main module definition

angular . module ( 'ui.bootstrap.transition' , [ ] )

/*
 * This JSDoc comment describes the functionality of the $transition service.
 * It offers a standardized way to initiate CSS3 transitions and receive
 * notifications upon their completion.
 *
 * @param {DOMElement} element The specific DOM element targeted for animation.
 * @param {string|object|function} trigger This parameter dictates how the transition begins:
 *   - If a string, it's interpreted as a CSS class to be appended to the element.
 *   - If an object, it's a collection of CSS style properties to be applied.
 *   - If a function, it's a callback to execute, which should then initiate the transition.
 * @returns {Promise} A standard JavaScript Promise that resolves once the transition concludes.
 */
. factory ( '$transition' , [ '$q' , '$timeout' , '$rootScope' , function ( $q , $timeout , $rootScope ) {

  var $transition = function ( element , trigger , options ) {
    // Ensure options object is initialized, even if not provided.
    options = options || { } ;

    // Create a new deferred object for managing the promise lifecycle.
    var deferred = $q . defer ( ) ;

    // Determine the appropriate CSS end event name (animation or transition)
    var endEventName = $transition [ options . animation ? 'animationEndEventName' : 'transitionEndEventName' ] ;

    // Define the handler for when the transition/animation ends.
    var transitionEndHandler = function ( event ) {
      $rootScope . $apply ( function ( ) {
        // Unbind the event listener to prevent memory leaks and multiple calls.
        element . unbind ( endEventName , transitionEndHandler ) ;
        // Resolve the deferred promise, indicating completion.
        deferred . resolve ( element ) ;
      } ) ;
    } ;

    // If a valid end event name is found, bind the handler to the element.
    if ( endEventName ) {
      element . bind ( endEventName , transitionEndHandler ) ;
    }

    /*
     * Wrap the transition initiation in a $timeout.
     * This allows the browser a chance to render DOM updates
     * (like adding classes) before the transition actually begins.
     */
    $timeout ( function ( ) {
      // Apply the trigger based on its type.
      if ( angular . isString ( trigger ) ) {
        element . addClass ( trigger ) ; // Add CSS class.
      } else if ( angular . isFunction ( trigger ) ) {
        trigger ( element ) ; // Execute a function.
      } else if ( angular . isObject ( trigger ) ) {
        element . css ( trigger ) ; // Apply inline CSS styles.
      }

      // If the browser does not support CSS transitions/animations,
      // the `endEventName` will be undefined, so resolve immediately.
      if ( ! endEventName ) {
        deferred . resolve ( element ) ;
      }
    } ) ;

    /*
     * Augment the returned promise with a custom `cancel` function.
     * This allows external code to preemptively stop a transition,
     * particularly useful when a new transition is initiated before the current one finishes.
     * Cancelling prevents the `transitionEnd` event from firing for the old transition.
     */
    deferred . promise . cancel = function ( ) {
      if ( endEventName ) {
        element . unbind ( endEventName , transitionEndHandler ) ; // Remove the event listener.
      }
      deferred . reject ( 'Transition cancelled' ) ; // Reject the promise with a cancellation message.
    } ;

    return deferred . promise ; // Return the promise, which includes the custom cancel method.
  } ;

  // Determine the correct browser-prefixed names for transition and animation end events.
  // This ensures cross-browser compatibility for transition detection.

  // Create a temporary DOM element to test for style property support.
  var transElement = document . createElement ( 'trans' ) ;

  // Mapping of standard CSS transition properties to their respective end event names.
  var transitionEndEventNames = {
    'WebkitTransition' : 'webkitTransitionEnd' ,
    'MozTransition' : 'transitionend' ,
    'OTransition' : 'oTransitionEnd' ,
    'transition' : 'transitionend'
  } ;

  // Mapping of standard CSS animation properties to their respective end event names.
  var animationEndEventNames = {
    'WebkitTransition' : 'webkitAnimationEnd' ,
    'MozTransition' : 'animationend' ,
    'OTransition' : 'oAnimationEnd' ,
    'transition' : 'animationend'
  } ;

  /**
   * Helper function to find the correct end event name supported by the browser.
   * It iterates through a given map of event names and checks if the corresponding
   * CSS style property is supported by the `transElement`.
   * @param {Object} endEventNames A map of CSS property names to their event names.
   * @returns {string|undefined} The supported event name, or undefined if none are found.
   */
  function findEndEventName ( endEventNames ) {
    for ( var name in endEventNames ) {
      // Check if the style property exists on the temporary element.
      if ( transElement . style [ name ] !== undefined ) {
        return endEventNames [ name ] ; // Return the corresponding event name.
      }
    }
    // No supported event name found.
    return undefined ;
  }

  // Set the resolved transition and animation end event names on the $transition service.
  $transition . transitionEndEventName = findEndEventName ( transitionEndEventNames ) ;
  $transition . animationEndEventName = findEndEventName ( animationEndEventNames ) ;

  return $transition ; // Return the configured $transition service.
} ] ) ;

angular . module ( 'ui.bootstrap.collapse' , [ 'ui.bootstrap.transition' ] )

  . directive ( 'collapse' , [ '$transition' , function ( $transition ) {

    return {
      link : function ( scope , element , attrs ) {

        // Flag to skip initial animation on first load.
        var initialAnimSkip = true ;
        // Reference to the currently active transition.
        var currentTransition ;

        /**
         * Initiates a transition on the element.
         * If another transition is ongoing, it cancels the previous one.
         * @param {object} change The CSS properties to transition to.
         * @returns {Promise} A promise that resolves when the transition completes.
         */
        function doTransition ( change ) {
          var newTransition = $transition ( element , change ) ; // Create a new transition.
          if ( currentTransition ) {
            currentTransition . cancel ( ) ; // Cancel any existing transition.
          }
          currentTransition = newTransition ; // Store reference to the new transition.
          newTransition . then ( newTransitionDone , newTransitionDone ) ; // Handle transition completion/failure.
          return newTransition ;

          /**
           * Callback function executed when a transition finishes (either resolved or rejected).
           * Ensures that only the currently active transition updates the state.
           */
          function newTransitionDone ( ) {
            // Check if this is still the active transition.
            if ( currentTransition === newTransition ) {
              currentTransition = undefined ; // Clear the reference once done.
            }
          }
        }

        /**
         * Expands the element.
         * Skips animation on first load, then uses CSS transition for height.
         */
        function expand ( ) {
          if ( initialAnimSkip ) {
            initialAnimSkip = false ; // Animation has been skipped once.
            expandDone ( ) ; // Directly call done function.
          } else {
            // Prepare element for expansion transition.
            element . removeClass ( 'collapse' ) . addClass ( 'collapsing' ) ;
            // Start transition to full scroll height, then call expandDone.
            doTransition ( { height : element [ 0 ] . scrollHeight + 'px' } ) . then ( expandDone ) ;
          }
        }

        /**
         * Finalizes the expansion process.
         * Removes 'collapsing' class, adds 'collapse in', and sets height to auto.
         */
        function expandDone ( ) {
          element . removeClass ( 'collapsing' ) ;
          element . addClass ( 'collapse in' ) ;
          element . css ( { height : 'auto' } ) ; // Allow height to be determined by content.
        }

        /**
         * Collapses the element.
         * Skips animation on first load, then uses CSS transition for height.
         */
        function collapse ( ) {
          if ( initialAnimSkip ) {
            initialAnimSkip = false ; // Animation has been skipped once.
            collapseDone ( ) ; // Directly call done function.
            element . css ( { height : 0 } ) ; // Set height to 0 immediately.
          } else {
            // CSS transitions require a specific height value, not 'auto'.
            // Set current height explicitly before starting transition.
            element . css ( { height : element [ 0 ] . scrollHeight + 'px' } ) ;

            // Trigger a reflow to ensure the browser registers the height change
            // from 'auto' to a specific pixel value before the transition starts.
            var x = element [ 0 ] . offsetWidth ; // Access offsetWidth to force reflow.

            // Prepare element for collapse transition.
            element . removeClass ( 'collapse in' ) . addClass ( 'collapsing' ) ;

            // Start transition to height 0, then call collapseDone.
            doTransition ( { height : 0 } ) . then ( collapseDone ) ;
          }
        }

        /**
         * Finalizes the collapse process.
         * Removes 'collapsing' class and adds 'collapse'.
         */
        function collapseDone ( ) {
          element . removeClass ( 'collapsing' ) ;
          element . addClass ( 'collapse' ) ;
        }

        // Watch the `collapse` attribute for changes to trigger expand/collapse actions.
        scope . $watch ( attrs . collapse , function ( shouldCollapse ) {
          if ( shouldCollapse ) {
            collapse ( ) ; // If true, collapse the element.
          } else {
            expand ( ) ; // If false, expand the element.
          }
        } ) ;
      }
    } ;
  } ] ) ;

angular . module ( 'ui.bootstrap.accordion' , [ 'ui.bootstrap.collapse' ] )

// Define a constant for accordion configuration defaults.
. constant ( 'accordionConfig' , {
  closeOthers : true // Default behavior: close other groups when one opens.
} )

// Controller for the accordion directive. Manages groups and their open/close state.
. controller ( 'AccordionController' , [ '$scope' , '$attrs' , 'accordionConfig' , function ( $scope , $attrs , accordionConfig ) {

  // An internal array to maintain references to all registered accordion groups.
  this . groups = [ ] ;

  /**
   * Closes all other accordion groups except for the one specified.
   * This behavior can be overridden by the 'close-others' attribute on the accordion directive.
   * @param {object} openGroup The group that is currently being opened (or should remain open).
   */
  this . closeOthers = function ( openGroup ) {
    // Determine if other groups should be closed. Checks attribute first, then global config.
    var closeOthers = angular . isDefined ( $attrs . closeOthers )
                      ? $scope . $eval ( $attrs . closeOthers )
                      : accordionConfig . closeOthers ;

    if ( closeOthers ) {
      // Iterate through all registered groups.
      angular . forEach ( this . groups , function ( group ) {
        // If the group is not the one being opened, ensure it's closed.
        if ( group !== openGroup ) {
          group . isOpen = false ;
        }
      } ) ;
    }
  } ;

  /**
   * Registers an accordion group with this controller.
   * Called by the 'accordion-group' directive during its linking phase.
   * @param {object} groupScope The scope of the 'accordion-group' directive.
   */
  this . addGroup = function ( groupScope ) {
    var that = this ; // Capture `this` for use in the destroy handler.
    this . groups . push ( groupScope ) ;

    // Listen for the $destroy event on the group's scope to remove it from the list.
    groupScope . $on ( '$destroy' , function ( event ) {
      that . removeGroup ( groupScope ) ;
    } ) ;
  } ;

  /**
   * Removes an accordion group from this controller's tracking list.
   * Called when an 'accordion-group' directive is destroyed.
   * @param {object} group The scope of the 'accordion-group' to remove.
   */
  this . removeGroup = function ( group ) {
    var index = this . groups . indexOf ( group ) ;
    if ( index !== -1 ) {
      this . groups . splice ( index , 1 ) ; // Remove the group from the array.
    }
  } ;

} ] ) // End of AccordionController definition

// The 'accordion' directive is the container for accordion groups.
// It sets up the controller and applies base CSS classes.
. directive ( 'accordion' , function ( ) {
  return {
    restrict : 'EA' , // Can be used as an element or an attribute.
    controller : 'AccordionController' , // Associates with the AccordionController.
    transclude : true , // Allows content to be placed inside the directive.
    replace : false , // The directive element itself will not be replaced.
    templateUrl : 'template/accordion/accordion.html' // Path to the accordion's structural template.
  } ;
} )

// The 'accordion-group' directive defines an individual collapsible panel within an accordion.
. directive ( 'accordionGroup' , function ( ) {
  return {
    require : '^accordion' ,         // Requires the parent 'accordion' directive's controller.
    restrict : 'EA' ,                // Can be used as an element or an attribute.
    transclude : true ,              // Transcludes the content into the template.
    replace : true ,                 // The directive element will be replaced by its template.
    templateUrl : 'template/accordion/accordion-group.html' , // Path to the group's template.
    scope : {
      heading : '@' ,                // One-way binding for the heading text.
      isOpen : '=?' ,                // Two-way optional binding for the open state.
      isDisabled : '=?'              // Two-way optional binding for disabled state.
    } ,
    controller : function ( ) {
      // Internal controller for accordion-group to manage its heading.
      this . setHeading = function ( element ) {
        this . heading = element ; // Store the transcluded heading element.
      } ;
    } ,
    link : function ( scope , element , attrs , accordionCtrl ) {
      accordionCtrl . addGroup ( scope ) ; // Register this group with the parent accordion controller.

      // Watch for changes in the 'isOpen' property.
      scope . $watch ( 'isOpen' , function ( value ) {
        if ( value ) {
          accordionCtrl . closeOthers ( scope ) ; // Close other groups if this one is opening.
        }
      } ) ;

      // Function to toggle the open state of the group.
      scope . toggleOpen = function ( ) {
        if ( ! scope . isDisabled ) {
          scope . isOpen = ! scope . isOpen ; // Invert the open state if not disabled.
        }
      } ;
    }
  } ;
} )

/*
 * The 'accordion-heading' directive provides a way to define custom HTML
 * content for an accordion group's heading.
 * Example usage:
 * <accordion-group>
 *   <accordion-heading>
 *     Custom Heading with <img src="icon.png">
 *   </accordion-heading>
 * </accordion-group>
 */
. directive ( 'accordionHeading' , function ( ) {
  return {
    restrict : 'EA' , // Element or Attribute.
    transclude : true ,   // Grab the content of this directive to be used as the heading.
    template : '' ,       // This directive itself renders no content; it's purely for transclusion.
    replace : true , // The directive element will be completely replaced (effectively removed).
    require : '^accordionGroup' , // Requires the parent 'accordionGroup' controller.
    link : function ( scope , element , attr , accordionGroupCtrl , transclude ) {
      // Pass the transcluded content (the heading HTML) to the accordion-group controller.
      // The second parameter to `transclude` creates a clone, essential for ng-repeat scenarios.
      accordionGroupCtrl . setHeading ( transclude ( scope , function ( ) { } ) ) ;
    }
  } ;
} )

/*
 * The 'accordionTransclude' directive is used within the 'accordion-group' template
 * to specify where the custom heading (defined by 'accordion-heading') should be inserted.
 * It dynamically appends the transcluded heading content.
 *
 * Example within accordion-group.html:
 * <div class="accordion-group">
 *   <div class="accordion-heading">
 *     <a ... accordion-transclude="heading"></a>
 *   </div>
 *   ...
 * </div>
 */
. directive ( 'accordionTransclude' , function ( ) {
  return {
    require : '^accordionGroup' , // Requires the parent 'accordionGroup' controller.
    link : function ( scope , element , attr , controller ) {
      // Watch the `heading` property on the accordionGroup controller.
      // This property is set by `accordionHeading` directive via `setHeading`.
      scope . $watch ( function ( ) { return controller [ attr . accordionTransclude ] ; } , function ( heading ) {
        if ( heading ) {
          element . html ( '' ) ; // Clear existing content.
          element . append ( heading ) ; // Append the new heading content.
        }
      } ) ;
    }
  } ;
} ) ;

angular . module ( 'ui.bootstrap.alert' , [ ] )

// Controller for the 'alert' directive.
// Determines if the alert is closeable based on the presence of a 'close' attribute.
. controller ( 'AlertController' , [ '$scope' , '$attrs' , function ( $scope , $attrs ) {
  // Set a scope property indicating if the alert can be closed.
  $scope . closeable = 'close' in $attrs ;
} ] )

// The 'alert' directive provides a dismissible alert component.
. directive ( 'alert' , function ( ) {
  return {
    restrict : 'EA' , // Can be used as an element or an attribute.
    controller : 'AlertController' , // Associates with AlertController.
    templateUrl : 'template/alert/alert.html' , // Path to the alert's template.
    transclude : true , // Allows content to be placed inside the alert.
    replace : true , // The directive element will be replaced by its template.
    scope : {
      type : '@' , // One-way binding for the alert's type (e.g., 'success', 'danger').
      close : '&' // Expression binding for a close callback function.
    }
  } ;
} ) ;

angular . module ( 'ui.bootstrap.bindHtml' , [ ] )

  // The 'bindHtmlUnsafe' directive allows binding raw HTML content to an element.
  // This is marked as "unsafe" because it bypasses AngularJS's sanitization,
  // meaning developers must ensure the HTML content is trusted to prevent XSS vulnerabilities.
  . directive ( 'bindHtmlUnsafe' , function ( ) {
    return function ( scope , element , attr ) {
      // Add 'ng-binding' class and store the binding expression for debugging.
      element . addClass ( 'ng-binding' ) . data ( '$binding' , attr . bindHtmlUnsafe ) ;

      // Watch the expression provided in 'bindHtmlUnsafe' attribute.
      scope . $watch ( attr . bindHtmlUnsafe , function bindHtmlUnsafeWatchAction ( value ) {
        // Update the element's inner HTML with the new value.
        // If value is null/undefined, set to empty string.
        element . html ( value || '' ) ;
      } ) ;
    } ;
  } ) ;

angular . module ( 'ui.bootstrap.buttons' , [ ] )

// Define a constant for button configuration defaults.
. constant ( 'buttonConfig' , {
  activeClass : 'active' , // CSS class applied when a button is active.
  toggleEvent : 'click'    // DOM event that triggers button toggling.
} )

// Controller for button directives ('btnRadio', 'btnCheckbox').
// Provides default configuration values for active class and toggle event.
. controller ( 'ButtonsController' , [ 'buttonConfig' , function ( buttonConfig ) {
  this . activeClass = buttonConfig . activeClass || 'active' ; // Use config or default.
  this . toggleEvent = buttonConfig . toggleEvent || 'click' ;   // Use config or default.
} ] )

// The 'btnRadio' directive provides radio button-like behavior for any element.
// It works in conjunction with ngModel to manage the selected value.
. directive ( 'btnRadio' , function ( ) {
  return {
    require : [ 'btnRadio' , 'ngModel' ] , // Requires its own controller and ngModel.
    controller : 'ButtonsController' ,      // Uses the common ButtonsController.
    link : function ( scope , element , attrs , ctrls ) {
      var buttonsCtrl = ctrls [ 0 ] , // Reference to ButtonsController.
          ngModelCtrl = ctrls [ 1 ] ; // Reference to ngModelController.

      // UI update logic: model changes -> UI reflects.
      // Toggles the active class based on whether the model value matches this button's value.
      ngModelCtrl . $render = function ( ) {
        element . toggleClass (
          buttonsCtrl . activeClass ,
          angular . equals ( ngModelCtrl . $modelValue , scope . $eval ( attrs . btnRadio ) )
        ) ;
      } ;

      // Model update logic: UI interaction -> model updates.
      // Binds the toggle event to update the ngModel.
      element . bind ( buttonsCtrl . toggleEvent , function ( ) {
        var isActive = element . hasClass ( buttonsCtrl . activeClass ) ;

        // If the button is not active OR if it's explicitly 'uncheckable',
        // then allow the model to be updated (toggled).
        if ( ! isActive || angular . isDefined ( attrs . uncheckable ) ) {
          scope . $apply ( function ( ) {
            // Set the view value: if currently active, set to null (unselected),
            // otherwise set to this button's value.
            ngModelCtrl . $setViewValue ( isActive ? null : scope . $eval ( attrs . btnRadio ) ) ;
            ngModelCtrl . $render ( ) ; // Re-render the UI immediately.
          } ) ;
        }
      } ) ;
    }
  } ;
} )

// The 'btnCheckbox' directive provides checkbox-like behavior for any element.
// It works with ngModel to manage boolean (or custom) true/false values.
. directive ( 'btnCheckbox' , function ( ) {
  return {
    require : [ 'btnCheckbox' , 'ngModel' ] , // Requires its own controller and ngModel.
    controller : 'ButtonsController' ,        // Uses the common ButtonsController.
    link : function ( scope , element , attrs , ctrls ) {
      var buttonsCtrl = ctrls [ 0 ] , // Reference to ButtonsController.
          ngModelCtrl = ctrls [ 1 ] ; // Reference to ngModelController.

      /**
       * Determines the value to set for 'true' state.
       * Defaults to `true` if `btnCheckboxTrue` attribute is not defined.
       * @returns {any} The value representing the "true" state.
       */
      function getTrueValue ( ) {
        return getCheckboxValue ( attrs . btnCheckboxTrue , true ) ;
      }

      /**
       * Determines the value to set for 'false' state.
       * Defaults to `false` if `btnCheckboxFalse` attribute is not defined.
       * @returns {any} The value representing the "false" state.
       */
      function getFalseValue ( ) {
        return getCheckboxValue ( attrs . btnCheckboxFalse , false ) ;
      }

      /**
       * Helper to retrieve a custom checkbox value from an attribute or use a default.
       * @param {string} attributeValue The raw attribute value (expression).
       * @param {any} defaultValue The value to use if the attribute is undefined.
       * @returns {any} The evaluated attribute value or the default.
       */
      function getCheckboxValue ( attributeValue , defaultValue ) {
        var val = scope . $eval ( attributeValue ) ;
        return angular . isDefined ( val ) ? val : defaultValue ;
      }

      // UI update logic: model changes -> UI reflects.
      // Toggles the active class based on whether the model value matches the true value.
      ngModelCtrl . $render = function ( ) {
        element . toggleClass ( buttonsCtrl . activeClass , angular . equals ( ngModelCtrl . $modelValue , getTrueValue ( ) ) ) ;
      } ;

      // Model update logic: UI interaction -> model updates.
      // Binds the toggle event to update the ngModel.
      element . bind ( buttonsCtrl . toggleEvent , function ( ) {
        scope . $apply ( function ( ) {
          // Set the view value: if currently active (has activeClass), set to false value,
          // otherwise set to true value.
          ngModelCtrl . $setViewValue ( element . hasClass ( buttonsCtrl . activeClass ) ? getFalseValue ( ) : getTrueValue ( ) ) ;
          ngModelCtrl . $render ( ) ; // Re-render the UI immediately.
        } ) ;
      } ) ;
    }
  } ;
} ) ;

/*
* @ngdoc overview
* @name ui.bootstrap.carousel
*
* @description
* AngularJS version of an image carousel.
* This module provides a flexible and customizable image carousel component.
*
*/
angular . module ( 'ui.bootstrap.carousel' , [ 'ui.bootstrap.transition' ] )
. controller ( 'CarouselController' , [ '$scope' , '$timeout' , '$transition' , function ( $scope , $timeout , $transition ) {
  var self = this ,
    slides = self . slides = $scope . slides = [ ] , // Initialize and expose slides array.
    currentIndex = -1 , // Tracks the index of the currently active slide.
    currentTimeout ,    // Reference to the current timeout for auto-advancing.
    isPlaying ;         // Flag indicating if the carousel is auto-playing.
  self . currentSlide = null ; // Reference to the currently displayed slide object.

  var destroyed = false ; // Flag to indicate if the scope has been destroyed.

  /*
   * This function selects a new slide to display.
   * @param {object} nextSlide The slide object to transition to.
   * @param {string} direction Optional. Can be "prev" or "next" to indicate transition direction.
   */
  self . select = $scope . select = function ( nextSlide , direction ) {
    var nextIndex = slides . indexOf ( nextSlide ) ;
    // Determine the transition direction if it's not explicitly provided.
    if ( direction === undefined ) {
      direction = nextIndex > currentIndex ? 'next' : 'prev' ;
    }

    // Only proceed if a new slide is selected and it's different from the current one.
    if ( nextSlide && nextSlide !== self . currentSlide ) {
      // If a transition is currently in progress, cancel it.
      if ( $scope . $currentTransition ) {
        $scope . $currentTransition . cancel ( ) ;
        // Use a timeout to allow ng-class in the template to update
        // for the finished slide before starting a new one.
        $timeout ( goNext ) ;
      } else {
        goNext ( ) ; // No active transition, proceed immediately.
      }
    }

    /**
     * Internal function to handle the actual transition logic.
     * Manages CSS classes and initiates the $transition service.
     */
    function goNext ( ) {
      // If the scope has been destroyed, cease all operations.
      if ( destroyed ) { return ; }

      // Check if there's a current slide, a valid direction,
      // transitions are not disabled, and the next slide has an element.
      if ( self . currentSlide && angular . isString ( direction ) && ! $scope . noTransition && nextSlide . $element ) {
        // Apply the direction class to the next slide element.
        // Note: Direct DOM manipulation here, similar to how Bootstrap's original JS works.
        nextSlide . $element . addClass ( direction ) ;
        var reflow = nextSlide . $element [ 0 ] . offsetWidth ; // Force browser reflow.

        // Reset all other slides' transition-related properties.
        angular . forEach ( slides , function ( slide ) {
          angular . extend ( slide , { direction : '' , entering : false , leaving : false , active : false } ) ;
        } ) ;

        // Set properties for the next slide (entering, active).
        angular . extend ( nextSlide , { direction : direction , active : true , entering : true } ) ;
        // Set properties for the current slide (leaving).
        angular . extend ( self . currentSlide || { } , { direction : direction , leaving : true } ) ;

        // Initiate the CSS transition for the next slide.
        $scope . $currentTransition = $transition ( nextSlide . $element , { } ) ;

        // Create a closure to capture `next` and `current` slide references
        // as they might change before the transition completes.
        ( function ( next , current ) {
          $scope . $currentTransition . then (
            function ( ) { transitionDone ( next , current ) ; } , // On success.
            function ( ) { transitionDone ( next , current ) ; }   // On failure/cancellation.
          ) ;
        } ( nextSlide , self . currentSlide ) ) ;
      } else {
        // If no transition is needed or possible, just update the state.
        transitionDone ( nextSlide , self . currentSlide ) ;
      }

      self . currentSlide = nextSlide ; // Update the current slide.
      currentIndex = nextIndex ;       // Update the current index.

      // Every time a slide changes, reset the auto-advance timer.
      // Note: The `restartTimer()` function is expected to be defined elsewhere in the full library.
      restartTimer ( ) ;
    }

    /**
     * Callback executed once the transition completes or is cancelled.
     * Cleans up transition-related CSS classes and flags.
     * @param {object} next The slide that just became active.
     * @param {object} current The slide that just left.
     */
    function transitionDone ( next , current ) {
      // Reset transition flags for the next slide (now active).
      angular . extend ( next , { direction : '' , active : true , leaving : false , entering : false } ) ;
      // Reset transition flags for the previous slide (now inactive).
      angular . extend ( current || { } , { direction : '' , active : false , leaving : false , entering : false } ) ;
      $scope . $currentTransition = null ; // Clear the current transition reference.
    }
  } ;

  // Listen for the scope's $destroy event to clean up resources.
  $scope . $on ( '$destroy' , function ( ) {
    destroyed = true ; // Set the flag to prevent further operations.
  } ) ;

  /*
   * Expose a method to get the index of a slide, useful for external components.
   * @param {object} slide The slide object to find.
   * @returns {number} The index of the slide, or -1 if not found.
   */
  self . indexOfSlide = function ( slide ) {
    return slides . indexOf ( slide ) ;
  } ;

  /*
   * Navigates to the next slide in the carousel.
   * Wraps around to the beginning if at the end.
   */
  $scope . next = function ( ) {
    var newIndex = ( currentIndex + 1 ) % slides . length ;

    // Prevent user-triggered transitions if one is already active.
    if ( ! $scope . $currentTransition ) {
      return self . select ( slides [ newIndex ] , 'next' ) ;
    }
  } ;

  /*
   * Navigates to the previous slide in the carousel.
   * Wraps around to the end if at the beginning.
   */
  $scope . prev = function ( ) {
    var newIndex = currentIndex - 1 < 0 ? slides . length - 1 : currentIndex - 1 ;

    // Prevent user-triggered transitions if one is already active.
    if ( ! $scope . $currentTransition ) {
      return self . select ( slides [ newIndex ] , 'prev' ) ;
    }
  } ;
} ] ) ;