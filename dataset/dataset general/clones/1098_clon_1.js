/*
 * This is a Type I code clone.
 * All functional aspects, variable names, and logic are preserved exactly.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered to create a visually distinct, yet logically identical, version.
 */
// Original source: Inline Form Validation Engine 2.6, a jQuery plugin.

// Copyright (c) 2010, Cedric Dugas
// Web: http://www.position-absolute.com

// Version 2.0 Rewrite by Olivier Refalo
// Site: http://www.crionics.com

// This validation engine supports adding custom regex validation rules.
// It is licensed under the MIT License.

( function ( $ ) {

  "use strict" ; // Enforce strict mode for cleaner code.

  var methods = { // Define the core plugin methods.

    /*
     * The plugin's initialization method.
     * Acts as a constructor, setting up initial states.
     * @param {Map} user options passed during plugin initialization.
     */
    init: function ( options ) {
      var form = this ; // Reference to the form element.
      if ( !form.data( 'jqv' ) || form.data( 'jqv' ) == null ) { // Check if the plugin is already initialized.
        options = methods._saveOptions( form , options ) ; // Save or merge options.
        // Bind a click event to all error prompts to allow them to be closed.
        $( ".formError" ).live( "click" , function ( ) {
          $( this ).fadeOut( 150 , function ( ) {
            // Remove the prompt from the DOM after it has faded out.
            $( this ).parent( '.formErrorOuter' ).remove( ) ; // Remove the outer wrapper.
            $( this ).remove( ) ; // Remove the prompt itself.
          } ) ;
        } ) ;
      }
      return this ; // Support method chaining.
    } , // End of 'init' method.

    /**
     * Attaches the jQuery.validationEngine functionality to form submit and field blur events.
     * Can take an optional parameter: a map of options to override defaults.
     * Example: jQuery("#formID1").validationEngine('attach', { promptPosition: "centerRight" });
     */
    attach: function ( userOptions ) {

      if ( !$( this ).is( "form" ) ) { // Ensure the method is called on a form element.
        alert( "Validation Engine Error: jqv.attach() can only be applied to a form element." ) ;
        return this ;
      }

      var form = this ; // The form element.
      var options ; // Variable to hold the plugin options.

      if ( userOptions ) {
        options = methods._saveOptions( form , userOptions ) ; // Save new options if provided.
      } else {
        options = form.data( 'jqv' ) ; // Retrieve existing options.
      }

      // Determine which attribute to use for validation rules (data-validation-engine or class).
      options.validateAttribute = ( form.find( "[data-validation-engine*=validate]" ).length ) ? "data-validation-engine" : "class" ;
      if ( options.binded ) { // Proceed only if events are configured to be bound.

        // Bind validation events to most form fields (excluding checkboxes, radios, and datepickers).
        form.find( "[" + options.validateAttribute + "*=validate]" )
            .not( "[type=checkbox]" )
            .not( "[type=radio]" )
            .not( ".datepicker" )
            .bind( options.validationEventTrigger , methods._onFieldEvent ) ;

        // Bind click events specifically for checkboxes and radio buttons.
        form.find( "[" + options.validateAttribute + "*=validate][type=checkbox],[" + options.validateAttribute + "*=validate][type=radio]" )
            .bind( "click" , methods._onFieldEvent ) ;

        // Bind validation events for datepicker fields with a slight delay.
        form.find( "[" + options.validateAttribute + "*=validate][class*=datepicker]" )
            .bind( options.validationEventTrigger , { "delay": 300 } , methods._onFieldEvent ) ;
      }
      if ( options.autoPositionUpdate ) {
        // If automatic prompt position updates are enabled, bind to window resize.
        $( window ).bind( "resize" , {
          "noAnimation": true ,
          "formElem": form
        } , methods.updatePromptsPosition ) ;
      }
      // Bind the form submission event handler.
      form.bind( "submit" , methods._onSubmitEvent ) ;
      return this ; // Allow method chaining.
    } , // End of 'attach' method.

    /**
     * Unregisters all event bindings associated with jQuery.validationEngine.
     * This effectively removes the validation functionality from the form.
     */
    detach: function ( ) {

      if ( !$( this ).is( "form" ) ) { // Ensure the method is called on a form element.
        alert( "Validation Engine Error: jqv.detach() is only applicable to a form element." ) ;
        return this ;
      }

      var form = this ; // The form element.
      var options = form.data( 'jqv' ) ; // Retrieve plugin options.

      // Unbind standard field events.
      form.find( "[" + options.validateAttribute + "*=validate]" )
          .not( "[type=checkbox]" )
          .unbind( options.validationEventTrigger , methods._onFieldEvent ) ;

      // Unbind click events for checkboxes and radio buttons.
      form.find( "[" + options.validateAttribute + "*=validate][type=checkbox],[class*=validate][type=radio]" )
          .unbind( "click" , methods._onFieldEvent ) ;

      // Unbind form submit event (for standard .bind() calls).
      form.unbind( "submit" , methods.onAjaxFormComplete ) ;

      // Unbind 'live' field events (for older jQuery versions using .live() or similar).
      form.find( "[" + options.validateAttribute + "*=validate]" )
          .not( "[type=checkbox]" )
          .die( options.validationEventTrigger , methods._onFieldEvent ) ;

      form.find( "[" + options.validateAttribute + "*=validate][type=checkbox]" )
          .die( "click" , methods._onFieldEvent ) ;

      // Unbind form submit event (for older jQuery versions using .die()).
      form.die( "submit" , methods.onAjaxFormComplete ) ;
      form.removeData( 'jqv' ) ; // Remove plugin data associated with the form.

      if ( options.autoPositionUpdate ) {
        $( window ).unbind( "resize" , methods.updatePromptsPosition ) ; // Remove window resize listener.
      }

      return this ; // Support method chaining.
    } , // End of 'detach' method.

    /**
     * Initiates validation for either an entire form or a specific field.
     * Displays validation prompts accordingly.
     * Note: This method does NOT perform AJAX *form* validation.
     * It only evaluates individual field AJAX validations.
     *
     * @returns {boolean} True if the form/field validates successfully, false if it fails.
     */
    validate: function ( ) {
      if ( $( this ).is( "form" ) ) {
        // If called on a form, validate all fields within it.
        return methods._validateFields( this ) ;
      } else {
        // If called on an individual field, perform field-specific validation.
        var form = $( this ).closest( 'form' ) ;
        var options = form.data( 'jqv' ) ; // Get plugin options from the parent form.
        var r = methods._validateField( $( this ) , options ) ; // Perform field validation.

        if ( options.onSuccess && options.InvalidFields.length == 0 ) {
          options.onSuccess( ) ; // Execute success callback if no invalid fields.
        } else if ( options.onFailure && options.InvalidFields.length > 0 ) {
          options.onFailure( ) ; // Execute failure callback if invalid fields exist.
        }

        return r ; // Return the validation result for the field.
      }
    } , // End of 'validate' method.

    /**
     * Forces a redraw of all validation prompt positions.
     * This is particularly useful when the DOM structure changes
     * (e.g., dynamic content, responsive layout shifts) while validation prompts are visible.
     * @param {Event} event The window resize event object, if applicable.
     */
    updatePromptsPosition: function ( event ) {

      if ( event && this == window ) {
        var form = event.data.formElem ; // Get form reference from event data.
        var noAnimation = event.data.noAnimation ; // Get animation preference from event data.
      }
      else {
        var form = $( this.closest( 'form' ) ) ; // Get the form from the current context.
      }

      var options = form.data( 'jqv' ) ; // Retrieve plugin options.
      // Iterate through all validate-enabled, non-disabled fields within the form.
      form.find( '[' + options.validateAttribute + '*=validate]' )
          .not( ":disabled" )
          .each( function ( ) {
            var field = $( this ) ;
            var prompt = methods._getPrompt( field ) ; // Get the associated prompt element.
            var promptText = $( prompt ).find( ".formErrorContent" ).html( ) ; // Get current prompt text.

            if ( prompt ) {
              // Update the prompt's position without re-evaluating rules.
              methods._updatePrompt( field , $( prompt ) , promptText , undefined , false , options , noAnimation ) ;
            }
          } ) ;
      return this ; // Support method chaining.
    } , // End of 'updatePromptsPosition' method.

    /**
     * Displays a validation prompt next to a specified element.
     * Crucial note: The target element MUST have an 'id' attribute for this to work correctly.
     *
     * @param {String}  promptText      The HTML content to display within the prompt.
     * @param {String}  type            The visual style of the prompt bubble:
     *                                  'pass' (green), 'load' (black), or any other value (red, default for errors).
     * @param {String}  promptPosition  Desired position of the prompt relative to the field.
     *                                  Possible values: 'topLeft', 'topRight', 'bottomLeft',
     *                                  'centerRight', 'bottomRight'.
     * @param {boolean} showArrow       Determines whether the arrow pointer on the prompt should be visible.
     */
    showPrompt: function ( promptText , type , promptPosition , showArrow ) {

      var form = this.closest( 'form' ) ; // Get the parent form.
      var options = form.data( 'jqv' ) ; // Retrieve plugin options.
      // If options aren't found, try to save defaults (might happen if called directly before init).
      if ( !options ) {
        options = methods._saveOptions( this , options ) ;
      }
      if ( promptPosition ) {
        options.promptPosition = promptPosition ; // Override prompt position if provided.
      }
      options.showArrow = ( showArrow == true ) ; // Ensure showArrow is a boolean.

      methods._showPrompt( this , promptText , type , false , options ) ; // Call internal show prompt method.
      return this ; // Support method chaining.
    } , // End of 'showPrompt' method.

    /**
     * Closes one or more validation error prompts.
     * Can be used to hide prompts for an individual field or all prompts within a form.
     */
    hide: function ( ) {
      var form = $( this ).closest( 'form' ) ; // Get the parent form.
      if ( form.length == 0 ) {
        return this ; // If no form is found, there's nothing to hide.
      }
      var options = form.data( 'jqv' ) ; // Retrieve plugin options.
      var closingtag ; // Variable to store the CSS class of prompts to close.
      if ( $( this ).is( "form" ) ) {
        // If called on a form, target prompts related to that form.
        closingtag = "parentForm" + methods._getClassName( $( this ).attr( "id" ) ) ;
      } else {
        // If called on a field, target prompts for that specific field.
        closingtag = methods._getClassName( $( this ).attr( "id" ) ) + "formError" ;
      }
      // Fade out the targeted prompts and then remove them from the DOM.
      $( '.' + closingtag ).fadeTo( options.fadeDuration , 0.3 , function ( ) {
        $( this ).parent( '.formErrorOuter' ).remove( ) ; // Remove the outer wrapper.
        $( this ).remove( ) ; // Remove the prompt element.
      } ) ;
      return this ; // Support method chaining.
    } , // End of 'hide' method.

    /**
     * Closes and removes ALL validation error prompts currently displayed on the page.
     */
    hideAll: function ( ) {

      var form = this ; // Reference to the current context (could be form or field).
      var options = form.data( 'jqv' ) ; // Retrieve plugin options.
      // Determine fade duration; use option value or a default.
      var duration = options ? options.fadeDuration : 0.3 ;
      // Fade out all elements with the 'formError' class, then remove them.
      $( '.formError' ).fadeTo( duration , 0.3 , function ( ) {
        $( this ).parent( '.formErrorOuter' ).remove( ) ; // Remove the parent container.
        $( this ).remove( ) ; // Remove the error prompt element.
      } ) ;
      return this ; // Support method chaining.
    } , // End of 'hideAll' method.

    /**
     * Internal handler for field-level events (e.g., blur, click).
     * This function is typically invoked when a user interacts with a form field,
     * triggering its individual validation process.
     * @param {Event} event The DOM event object that triggered this handler.
     */
    _onFieldEvent: function ( event ) {
      var field = $( this ) ; // The field that triggered the event.
      var form = field.closest( 'form' ) ; // The parent form of the field.
      var options = form.data( 'jqv' ) ; // Retrieve plugin options.
      options.eventTrigger = "field" ; // Set the event trigger type to 'field'.
      // Validate the current field after a potential delay.
      window.setTimeout( function ( ) {
        methods._validateField( field , options ) ; // Perform validation for the single field.
        if ( options.InvalidFields.length == 0 && options.onSuccess ) {
          options.onSuccess( ) ; // Call success callback if field is valid.
        } else if ( options.InvalidFields.length > 0 && options.onFailure ) {
          options.onFailure( ) ; // Call failure callback if field is invalid.
        }
      } , ( event.data ) ? event.data.delay : 0 ) ; // Use delay from event data (e.g., for datepickers) or default to 0.

    } , // End of '_onFieldEvent' method.

    /**
     * Internal handler for the form submission event.
     * This function orchestrates the validation of all form fields
     * and decides whether the form submission should proceed.
     *
     * @returns {boolean} False if form submission should be prevented (e.g., due to validation errors or AJAX validation),
     *                    true if submission can proceed.
     */
    _onSubmitEvent: function ( ) {
      var form = $( this ) ; // The form element that was submitted.
      var options = form.data( 'jqv' ) ; // Retrieve plugin options.
      options.eventTrigger = "submit" ; // Indicate that the validation was triggered by a submit event.

      // Validate all fields in the form.
      // Note: Field-level AJAX validation might be skipped here if form-level AJAX validation is active.
      var r = methods._validateFields( form ) ; // Perform form-wide validation.

      if ( r && options.ajaxFormValidation ) {
        methods._validateFormWithAjax( form , options ) ; // If form is valid and AJAX form validation is enabled, send AJAX request.
        // Cancel the browser's default form submission. The AJAX callback (onAjaxFormComplete)
        // will handle subsequent actions based on the server's response.
        return false ;
      }

      if ( options.onValidationComplete ) {
        // The double-negation (!!) converts any truthy/falsy value to a strict boolean.
        // This allows the onValidationComplete callback to explicitly return true to proceed
        // with submission, or false/undefined/null to prevent it.
        return !!options.onValidationComplete( form , r ) ;
      }
      return r ; // Return the overall validation result (true for valid, false for invalid).
    } , // End of '_onSubmitEvent' method.

    /**
     * Checks the current status of all AJAX field validations performed so far.
     * Since AJAX operations are asynchronous, this helps track their collective outcome.
     * @param {Object} options The plugin options object, containing ajaxValidCache.
     * @returns {boolean} True if all AJAX field validations have passed, false otherwise.
     */
    _checkAjaxStatus: function ( options ) {
      var status = true ; // Assume all AJAX validations have passed initially.
      $.each( options.ajaxValidCache , function ( key , value ) {
        if ( !value ) {
          status = false ; // Found a failed AJAX validation.
          // Break out of the jQuery.each loop early.
          return false ;
        }
      } ) ;
      return status ; // Return the overall AJAX validation status.
    } , // End of '_checkAjaxStatus' method.

    /**
     * Retrieves the validation status of a specific AJAX-validated field from the cache.
     * @param {String} fieldid The ID of the field to check.
     * @param {Object} options The plugin options object.
     * @returns {boolean} True if the AJAX validation for the field passed,
     *                    false if it failed or if the field ID is not found in the cache.
     */
    _checkAjaxFieldStatus: function ( fieldid , options ) {
      return options.ajaxValidCache[ fieldid ] == true ; // Check if the field's AJAX validation status is true.
    } , // End of '_checkAjaxFieldStatus' method.

    /**
     * Core function to validate all fields within a given form.
     * It displays appropriate validation prompts based on the rules defined for each field.
     *
     * @param {jqObject} form                 The jQuery object representing the form to validate.
     * @returns {boolean} True if the entire form is valid, false if errors are found.
     */
    _validateFields: function ( form ) {
      var options = form.data( 'jqv' ) ; // Retrieve plugin options for the form.

      // This variable is set to true if any validation error is discovered.
      var errorFound = false ;

      // Trigger a custom event indicating the start of form validation.
      form.trigger( "jqv.form.validating" ) ;
      // First pass: Evaluate the validation status of all non-AJAX fields.
      var first_err = null ; // Stores the first field found with a validation error.
      form.find( '[' + options.validateAttribute + '*=validate]' )
          .not( ":disabled" ) // Exclude disabled fields from validation.
          .each( function ( ) {
            var field = $( this ) ;
            var names = [ ] ; // Array to track processed field names, preventing re-validation of grouped fields.
            if ( $.inArray( field.attr( 'name' ) , names ) < 0 ) {
              errorFound |= methods._validateField( field , options ) ; // Bitwise OR assignment to accumulate errors.
              if ( errorFound && first_err == null ) {
                if ( field.is( ":hidden" ) && options.prettySelect ) {
                  // Special handling for hidden fields with 'prettySelect' enabled.
                  first_err = field = form.find( "#" + options.usePrefix + field.attr( 'id' ) + options.useSuffix ) ;
                } else {
                  first_err = field ; // Assign the current field as the first error encountered.
                }
              }
              if ( options.doNotShowAllErrosOnSubmit ) {
                return false ; // Stop validation on the first error if this option is enabled.
              }
              names.push( field.attr( 'name' ) ) ; // Add field name to tracking array.
            }
          } ) ;

      // Second pass: (Original code had this commented out, but conceptually it would check AJAX status)
      // errorFound |= !methods._checkAjaxStatus(options);

      // Third pass: Trigger an event with the final validation result and handle scrolling.
      form.trigger( "jqv.form.result" , [ errorFound ] ) ;

      if ( errorFound ) {
        if ( options.scroll ) {
          var destination = first_err.offset( ).top ; // Y-coordinate of the first error.
          var fixleft = first_err.offset( ).left ; // X-coordinate of the first error.

          // Logic for prompt positioning adjustment.
          // Format: positionType:Xshift,Yshift (e.g., bottomLeft:+20 or bottomLeft:-20,+10)
          var positionType = options.promptPosition ;
          if ( typeof ( positionType ) == 'string' && positionType.indexOf( ":" ) != -1 ) {
            positionType = positionType.substring( 0 , positionType.indexOf( ":" ) ) ;
          }

          if ( positionType != "bottomRight" && positionType != "bottomLeft" ) {
            var prompt_err = methods._getPrompt( first_err ) ;
            destination = prompt_err.offset( ).top ; // Adjust destination to prompt's top if not bottom aligned.
          }

          // Handle scrolling to the first error.
          if ( options.isOverflown ) {
            var overflowDIV = $( options.overflownDIV ) ;
            if ( !overflowDIV.length ) return false ; // If overflow container not found, cannot scroll.
            var scrollContainerScroll = overflowDIV.scrollTop( ) ;
            var scrollContainerPos = -parseInt( overflowDIV.offset( ).top ) ;

            destination += scrollContainerScroll + scrollContainerPos - 5 ;
            var scrollContainer = $( options.overflownDIV + ":not(:animated)" ) ;

            scrollContainer.animate( { scrollTop: destination } , 1100 , function ( ) {
              if ( options.focusFirstField ) first_err.focus( ) ; // Focus on the field after scrolling.
            } ) ;
          } else {
            $( "html:not(:animated),body:not(:animated)" ).animate( {
              scrollTop: destination ,
              scrollLeft: fixleft
            } , 1100 , function ( ) {
              if ( options.focusFirstField ) first_err.focus( ) ; // Focus on the field after scrolling.
            } ) ;
          }

        } else if ( options.focusFirstField ) {
          first_err.focus( ) ; // If no scrolling, just focus on the first error field.
        }
        return false ; // Form validation failed.
      }
      return true ; // Form validation passed.
    } , // End of '_validateFields' method.

    /**
     * This method is invoked to perform an AJAX-based form validation.
     * During this process, all (field, value) pairs from the form are sent to the server.
     * The server is expected to return either 'true' (indicating a fully valid form)
     * or a JSON array detailing any invalid fields and their corresponding error/success messages.
     *
     * @param {jqObject} form    The jQuery object representing the form being validated.
     * @param {Map}      options The plugin's configuration options.
     */
    _validateFormWithAjax: function ( form , options ) {

      var data = form.serialize( ) ; // Serialize the form data into a URL-encoded string.
      var type = ( options.ajaxmethod ) ? options.ajaxmethod : "GET" ; // Determine the HTTP method (GET or POST).
      var url = ( options.ajaxFormValidationURL ) ? options.ajaxFormValidationURL : form.attr( "action" ) ; // Determine the AJAX endpoint URL.
      var dataType = ( options.dataType ) ? options.dataType : "json" ; // Expected data type of the server response.
      $.ajax( {
        type: type ,
        url: url ,
        cache: false , // Prevent caching of the AJAX response.
        dataType: dataType ,
        data: data ,
        form: form , // Pass form context to AJAX callbacks.
        methods: methods , // Pass plugin methods context to AJAX callbacks.
        options: options , // Pass plugin options context to AJAX callbacks.
        beforeSend: function ( ) {
          // Hook to execute a function before the AJAX request is sent.
          return options.onBeforeAjaxFormValidation( form , options ) ;
        } ,
        error: function ( data , transport ) {
          // Error handler for the AJAX request.
          methods._ajaxError( data , transport ) ;
        } ,
        success: function ( json ) {
          if ( json !== true ) {
            // The server returned a response other than 'true',
            // which could indicate errors, success messages, or other prompts.
            var errorInForm = false ; // Flag to track if any actual errors were found in the server's response.
            for ( var i = 0 ; i < json.length ; i++ ) {
              var value = json[ i ] ;

              var errorFieldId = value[ 0 ] ; // The ID of the field being reported on.
              var errorField = $( $( "#" + errorFieldId )[ 0 ] ) ; // The jQuery object for the field.

              // Ensure the target field element exists in the DOM.
              if ( errorField.length == 1 ) {

                var msg = value[ 2 ] ; // The prompt text or rule name from the server.
                // Check if the server marked this field as valid (value[1] == true).
                if ( value[ 1 ] == true ) {

                  if ( msg == "" || !msg ) {
                    // If the field is valid and no specific message, just close any existing prompt.
                    methods._closePrompt( errorField ) ;
                  } else {
                    // Field is valid, but the server wants to display a "pass" (green) prompt.
                    if ( options.allrules[ msg ] ) {
                      var txt = options.allrules[ msg ].alertTextOk ;
                      if ( txt ) {
                        msg = txt ;
                      }
                    }
                    methods._showPrompt( errorField , msg , "pass" , false , options , true ) ;
                  }
                } else {
                  // The field is invalid; display a red error prompt.
                  errorInForm |= true ; // Set the error flag for the form.
                  if ( options.allrules[ msg ] ) {
                    var txt = options.allrules[ msg ].alertText ;
                    if ( txt ) {
                      msg = txt ;
                    }
                  }
                  methods._showPrompt( errorField , msg , "" , false , options , true ) ;
                }
              }
            }
            // Call the onAjaxFormComplete callback with the final validation status.
            options.onAjaxFormComplete( !errorInForm , form , json , options ) ;
          } else {
            // Server returned 'true', indicating the entire form is valid.
            options.onAjaxFormComplete( true , form , "" , options ) ;
          }
        }
      } ) ;

    } , // End of '_validateFormWithAjax' method.

    /**
     * Validates a single form field based on its defined validation rules.
     * Displays appropriate validation prompts (error messages).
     *
     * @param {jqObject}  field               The jQuery object representing the field to validate.
     * @param {Map}       options             The plugin's configuration options.
     * @param {boolean}   skipAjaxValidation  (Optional) If true, skips AJAX validation for this field.
     * @returns {boolean} Returns `false` if the field is valid (no errors),
     *                    or `true` if the field has validation errors.
     *                    (Note: This return logic is inverted from typical "isValid" checks).
     */
    _validateField: function ( field , options , skipAjaxValidation ) {
      if ( !field.attr( "id" ) ) {
        // Assign a unique ID to the field if it doesn't already have one.
        field.attr( "id" , "form-validation-field-" + $.validationEngine.fieldIdCounter ) ;
        ++$.validationEngine.fieldIdCounter ;
      }

      // Skip validation for hidden fields unless 'prettySelect' is enabled,
      // or if the field's parent element is hidden.
      if ( ( field.is( ":hidden" ) && !options.prettySelect ) || field.parent( ).is( ":hidden" ) ) {
        return false ;
      }

      var rulesParsing = field.attr( options.validateAttribute ) ; // Get the validation rule string.
      var getRules = /validate\[(.*)\]/.exec( rulesParsing ) ; // Extract rules from the attribute.

      if ( !getRules ) {
        return false ; // No validation rules found for this field, so it's considered valid.
      }
      var str = getRules[ 1 ] ;
      var rules = str.split( /\[|,|\]/ ) ; // Parse the validation rules into an array.

      // Flag to indicate if an AJAX validator was encountered and run.
      var isAjaxValidator = false ;
      var fieldName = field.attr( "name" ) ; // The name attribute of the field.
      var promptText = "" ; // Placeholder for the validation prompt's text content.
      var promptType = "" ; // Placeholder for the prompt's type (e.g., 'pass', 'error').
      var required = false ; // Flag to track if the 'required' rule is present.
      options.isError = false ; // Reset error status for this validation cycle.
      options.showArrow = true ; // Default to showing the arrow on the prompt.

      var form = $( field.closest( "form" ) ) ; // Get the parent form of the field.

      // Iterate through each validation rule defined for the field.
      for ( var i = 0 ; i < rules.length ; i++ ) {
        // Remove any accidental spaces that might be present in the rule name.
        rules[ i ] = rules[ i ].replace( " " , "" ) ;
        var errorMsg = undefined ; // Initialize error message for the current rule.
        switch ( rules[ i ] ) {

          case "required" : // Handle the 'required' validation rule.
            required = true ; // Mark the field as required.
            errorMsg = methods._getErrorMessage( form , field , rules[ i ] , rules , i , options , methods._required ) ;
            break ;
          case "custom" : // Handle custom validation rules.