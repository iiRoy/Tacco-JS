/*
 * This JavaScript file contains validation logic.
 * It provides a FormValidator class to validate form inputs.
 * Developed by Rick Harrison.
 * Licensed under the MIT License.
 * Some concepts are derived from CodeIgniter.
 * For more details, refer to the project repository.
 */

( function(   window, document, undefined ) {

  /*
   * These are the default configuration settings.
   * They can be overridden globally or on a per-form basis
   * using the setMessage() function.
   */
  var defaults = {
    messages: {
      required: 'The %s field is required.',
      matches:    'The %s field does not match the %s field.' ,
      "default": 'The %s field is still set to default, please change.',
      valid_email:      'The %s field must contain a valid email address.',
      valid_emails: 'The %s field must contain all valid email addresses.',
      min_length: 'The %s field must be at least %s characters in length.',
      max_length:    'The %s field must not exceed %s characters in length.' ,
      exact_length: 'The %s field must be exactly %s characters in length.',
      greater_than: 'The %s field must contain a number greater than %s.',
      less_than: 'The %s field must contain a number less than %s.',
      alpha: 'The %s field must only contain alphabetical characters.',
      alpha_numeric: 'The %s field must only contain alpha-numeric characters.',
      alpha_dash: 'The %s field must only contain alpha-numeric characters, underscores, and dashes.',
      numeric: 'The %s field must contain only numbers.',
      integer: 'The %s field must contain an integer.',
      decimal: 'The %s field must contain a decimal number.',
      is_natural: 'The %s field must contain only positive numbers.',
      is_natural_no_zero: 'The %s field must contain a number greater than zero.',
      valid_ip: 'The %s field must contain a valid IP.',
      valid_base64: 'The %s field must contain a base64 string.',
      valid_credit_card: 'The %s field must contain a valid credit card number.',
      is_file_type:    'The %s field must contain only %s files.' ,
      valid_url: 'The %s field must contain a valid URL.',
      greater_than_date: 'The %s field must contain a more recent date than %s.',
      less_than_date: 'The %s field must contain an older date than %s.',
      greater_than_or_equal_date: 'The %s field must contain a date that\'s at least as recent as %s.',
      less_than_or_equal_date: 'The %s field must contain a date that\'s %s or older.'
    },

    callback: function( errors ) {
      // Default callback function, does nothing
    }
  };


  /*
   * Regular expressions used for various validation rules.
   * Each regex is carefully crafted for its specific purpose.
   */

  var ruleRegex = /^(.+?)\[(.+)\]$/; // Matches rules with parameters, e.g., 'matches[password_confirm]'
  var numericRegex = /^[0-9]+$/; // Checks for positive integers
  var integerRegex = /^\-?[0-9]+$/; // Checks for integers (positive or negative)
  var decimalRegex = /^\-?[0-9]*\.?[0-9]+$/; // Checks for decimal numbers
  var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/; // Standard email validation
  var alphaRegex = /^[a-z]+$/i; // Checks for alphabetical characters only (case-insensitive)
  var alphaNumericRegex = /^[a-z0-9]+$/i; // Checks for alphanumeric characters (case-insensitive)
  var alphaDashRegex = /^[a-z0-9_\-]+$/i; // Checks for alphanumeric, underscores, and dashes (case-insensitive)
  var naturalRegex = /^[0-9]+$/i; // Checks for natural numbers (positive integers including zero)
  var naturalNoZeroRegex = /^[1-9][0-9]*$/i; // Checks for natural numbers greater than zero
  var ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i; // IPv4 address validation
  var base64Regex = /[^a-zA-Z0-9\/\+=]/i; // Checks for valid base64 string characters
  var numericDashRegex = /^[\d\-\s]+$/; // Checks for numbers, dashes, and spaces
  var urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/; // URL validation
  var dateRegex = /\d{4}-\d{1,2}-\d{1,2}/; // Basic YYYY-MM-DD date format

  /*
   * The primary public constructor for the FormValidator.
   * It initializes a new validation instance for a given form.
   *
   * @param formNameOrNode - The name attribute of the form or the actual DOM node.
   * @param fields         - An array of field definitions, each with name, display, and rules.
   * @param callback       - A function to execute after validation, receiving an array of errors.
   */

  var FormValidator = function( formNameOrNode, fields, callback ) {
    this.callback = callback || defaults.callback;
    this.errors = [];
    this.fields = {};
    this.form = this._formByNameOrNode(formNameOrNode) || {};
    this.messages = {};
    this.handlers = {};
    this.conditionals = {};

    // Iterate through the provided field definitions to set up validation.
    for ( var i = 0, fieldLength = fields.length; i < fieldLength; i++ ) {
      var field = fields[i];

      // Skip fields that are not properly defined (missing name/names or rules).
      if ( ( !field.name && !field.names ) || !field.rules ) {
        continue;
      }

      /*
       * Construct the internal fields array, which holds all necessary validation info.
       * Handles both single 'name' and multiple 'names' for fields.
       */

      if ( field.names ) {
        for ( var j = 0, fieldNamesLength = field.names.length; j < fieldNamesLength; j++ ) {
          this._addField( field, field.names[j] );
        }
      } else {
        this._addField( field, field.name );
      }
    }

    /*
     * Attach an event listener for the form's submission event.
     * This ensures validation runs before the form is actually submitted.
     */

    var _onsubmit = this.form.onsubmit; // Store original onsubmit handler, if any.

    this.form.onsubmit = ( function( that ) {
      return function( evt ) {
        try {
          // Execute validation and then the original handler if validation passes.
          var isValid = that._validateForm( evt );
          var originalSubmitResult = ( _onsubmit === undefined || _onsubmit() );
          return isValid && originalSubmitResult;
        } catch ( e ) {
          // Catch any errors during submission processing.
        }
      };
    } )( this );
  };


  // Helper function to extract an attribute's value from a DOM element.
  // Handles both single elements and arrays of radio/checkbox elements.
  var attributeValue = function( element, attributeName ) {
    var i;

    // For radio or checkbox groups, find the checked element.
    if ( ( element.length > 0 ) && ( element[0].type === 'radio' || element[0].type === 'checkbox' ) ) {
      for ( i = 0, elementLength = element.length; i < elementLength; i++ ) {
        if ( element[i].checked ) {
          return element[i][attributeName];
        }
      }
      return; // No checked element found.
    }

    // For single elements, just return the attribute value directly.
    return element[attributeName];
  };

  /*
   * @public
   * Sets a custom message for a specific validation rule.
   * This allows for flexible error message customization.
   *
   * @param rule    - The name of the validation rule (e.g., 'required', 'valid_email').
   * @param message - The custom error message string.
   * @returns {FormValidator} - Returns the instance for method chaining.
   */

  FormValidator.prototype.setMessage = function( rule, message ) {
    this.messages[rule] = message;

    // Return 'this' for fluent interface / chaining.
    return this;
  };

  /*
   * @public
   * Registers a callback function for a custom validation rule (e.g., 'callback_username_check').
   *
   * @param name    - The name of the custom callback (e.g., 'username_check').
   * @param handler - The function to execute for this callback rule.
   * @returns {FormValidator} - Returns the instance for method chaining.
   */

  FormValidator.prototype.registerCallback = function( name, handler ) {
    if ( name && typeof name === 'string' && handler && typeof handler === 'function' ) {
      this.handlers[name] = handler;
    }

    // Enable chaining.
    return this;
  };

  /*
   * @public
   * Registers a conditional function for a custom 'depends' rule.
   * This allows rules to be applied only if a condition is met.
   *
   * @param name        - The name of the conditional (e.g., 'isAdmin').
   * @param conditional - The function that determines if the rule should run.
   * @returns {FormValidator} - Returns the instance for method chaining.
   */

  FormValidator.prototype.registerConditional = function( name, conditional ) {
    if ( name && typeof name === 'string' && conditional && typeof conditional === 'function' ) {
      this.conditionals[name] = conditional;
    }

    // Support for method chaining.
    return this;
  };

  /*
   * @private
   * Helper method to retrieve the form DOM node, whether passed by name or as an object.
   *
   * @param formNameOrNode - The form identifier.
   * @returns {HTMLElement|null} - The form element or null if not found.
   */

  FormValidator.prototype._formByNameOrNode = function( formNameOrNode ) {
    return ( typeof formNameOrNode === 'object' ) ? formNameOrNode : document.forms[formNameOrNode];
  };

  /*
   * @private
   * Adds a field's configuration to the internal master fields array.
   *
   * @param field     - The original field definition object.
   * @param nameValue - The specific name of the field element.
   */

  FormValidator.prototype._addField = function( field, nameValue ) {
    this.fields[nameValue] = {
      name: nameValue,
      display: field.display || nameValue, // Use display name or default to element name.
      rules: field.rules,
      depends: field.depends,
      id: null,
      element: null,
      type: null,
      value: null,
      checked: null
    };
  };

  /*
   * @private
   * Orchestrates the validation process when the form is submitted.
   * This is the core logic that iterates through all fields and applies rules.
   *
   * @param evt - The JavaScript event object, typically a submit event.
   * @returns {boolean} - True if validation passes, false otherwise.
   */

  FormValidator.prototype._validateForm = function( evt ) {
    this.errors = []; // Clear previous errors before a new validation run.

    // Iterate over each field defined for validation.
    for ( var key in this.fields ) {
      if ( this.fields.hasOwnProperty( key ) ) {
        var field = this.fields[key] || {};
        var element = this.form[field.name]; // Get the actual DOM element for the field.

        if ( element && element !== undefined ) {
          // Populate field properties from the DOM element.
          field.id = attributeValue( element, 'id' );
          field.element = element;
          field.type = ( element.length > 0 ) ? element[0].type : element.type;
          field.value = attributeValue( element, 'value' );
          field.checked = attributeValue( element, 'checked' );

          /*
           * Determine if field validation should proceed based on 'depends' conditional.
           * 'depends' can be a function or a string referencing a registered conditional.
           */

          if ( field.depends && typeof field.depends === "function" ) {
            if ( field.depends.call( this, field ) ) {
              this._validateField( field );
            }
          } else if ( field.depends && typeof field.depends === "string" && this.conditionals[field.depends] ) {
            if ( this.conditionals[field.depends].call( this, field ) ) {
              this._validateField( field );
            }
          } else {
            // If no dependency or dependency is met, proceed with validation.
            this._validateField( field );
          }
        }
      }
    }

    // Execute the user-defined callback function, passing any errors.
    if ( typeof this.callback === 'function' ) {
      this.callback( this.errors, evt );
    }

    // If there are errors, prevent the default form submission.
    if ( this.errors.length > 0 ) {
      if ( evt && evt.preventDefault ) {
        evt.preventDefault();
      } else if ( event ) { // Fallback for older IE.
        event.returnValue = false;
      }
      return false; // Indicate validation failure.
    }

    return true; // Indicate validation success.
  };

  /*
   * @private
   * Validates a single field against its defined rules.
   * It parses rules, executes hooks, and records errors.
   *
   * @param field - The field object containing name, rules, value, etc.
   */

  FormValidator.prototype._validateField = function( field ) {
    var rules = field.rules.split('|'); // Split rules by pipe character.
    var indexOfRequired = field.rules.indexOf('required'); // Check if 'required' rule is present.
    var isEmpty = ( !field.value || field.value === '' || field.value === undefined ); // Determine if field value is empty.

    /*
     * Iterate through each rule defined for the field and apply the corresponding validation method.
     */

    for ( var i = 0, ruleLength = rules.length; i < ruleLength; i++ ) {
      var method = rules[i];
      var param = null;
      var failed = false;
      var parts = ruleRegex.exec( method ); // Check if the rule has parameters.

      /*
       * If the field is not required and its value is empty,
       * skip all rules except for custom callbacks (which should always run).
       */

      if ( indexOfRequired === -1 && method.indexOf('!callback_') === -1 && isEmpty ) {
        continue;
      }

      /*
       * If the rule contains a parameter (e.g., 'matches[param]'), extract it.
       */

      if ( parts ) {
        method = parts[1];
        param = parts[2];
      }

      // Handle negated rules (e.g., '!required').
      if ( method.charAt(0) === '!' ) {
        method = method.substring(1, method.length);
      }

      /*
       * Execute the validation hook if it exists.
       * This covers all built-in validation rules.
       */

      if ( typeof this._hooks[method] === 'function' ) {
        if ( !this._hooks[method].apply( this, [field, param] ) ) {
          failed = true;
        }
      } else if ( method.substring(0, 9) === 'callback_' ) {
        // Handle custom callback rules.
        method = method.substring(9, method.length); // Extract the actual callback name.

        if ( typeof this.handlers[method] === 'function' ) {
          // Call the registered custom handler.
          if ( this.handlers[method].apply( this, [field.value, param, field] ) === false ) {
            failed = true;
          }
        }
      }

      /*
       * If the validation rule failed, record an error message.
       */

      if ( failed ) {
        // Attempt to find the most specific error message.
        var source = this.messages[field.name + '.' + method] || this.messages[method] || defaults.messages[method];
        var message = 'An error has occurred with the ' + field.display + ' field.'; // Generic fallback message.

        if ( source ) {
          // Replace placeholders in the message string.
          message = source.replace('%s', field.display);

          if ( param ) {
            // If a parameter exists, replace the second placeholder.
            message = message.replace('%s', ( this.fields[param] ) ? this.fields[param].display : param );
          }
        }

        // Add the error details to the errors array.
        this.errors.push( {
          id: field.id,
          element: field.element,
          name: field.name,
          message: message,
          rule: method
        } );

        // Break out of the loop after the first failure to prevent multiple errors for one field.
        break;
      }
    }
  };

  /**
   * @private
   * _getValidDate: A helper function to convert a string date to a Date object.
   * Dates must be in YYYY-MM-DD format or the keyword 'today'.
   *
   * @param date (String) - The date string to convert.
   * @returns {Date|boolean} - A Date object if valid, or false if invalid.
   */
  FormValidator.prototype._getValidDate = function( date ) {
    // Check if the date string matches 'today' or the YYYY-MM-DD format.
    if ( !date.match('today') && !date.match(dateRegex) ) {
      return false;
    }

    var validDate = new Date();
    var validDateArray;

    if ( !date.match('today') ) {
      // Parse the YYYY-MM-DD string into a Date object.
      validDateArray = date.split('-');
      validDate.setFullYear( validDateArray[0] );
      validDate.setMonth( validDateArray[1] - 1 ); // Months are 0-indexed.
      validDate.setDate( validDateArray[2] );
    }
    return validDate;
  };

  /*
   * @private
   * _hooks: An object containing all built-in validation methods.
   * Each method takes a field object and an optional parameter.
   */

  FormValidator.prototype._hooks = {
    required: function( field ) {
      var value = field.value;

      // Special handling for checkbox and radio button types.
      if ( ( field.type === 'checkbox' ) || ( field.type === 'radio' ) ) {
        return ( field.checked === true );
      }

      // For other input types, check if the value is non-null and non-empty.
      return ( value !== null && value !== '' );
    },

    "default": function( field, defaultName ) {
      // Checks if the field's value is different from a specified default.
      return field.value !== defaultName;
    },

    matches: function( field, matchName ) {
      // Compares the field's value to another field's value.
      var el = this.form[matchName];

      if ( el ) {
        return field.value === el.value;
      }

      return false;
    },

    valid_email: function( field ) {
      // Validates if the field contains a properly formatted email address.
      return emailRegex.test( field.value );
    },

    valid_emails: function( field ) {
      // Validates a comma-separated list of email addresses.
      var result = field.value.split(/\s*,\s*/g);

      for ( var i = 0, resultLength = result.length; i < resultLength; i++ ) {
        if ( !emailRegex.test( result[i] ) ) {
          return false; // If any email is invalid, the whole field fails.
        }
      }

      return true; // All emails are valid.
    },

    min_length: function( field, length ) {
      // Checks if the field's value meets a minimum length requirement.
      if ( !numericRegex.test( length ) ) {
        return false; // Length parameter must be numeric.
      }

      return ( field.value.length >= parseInt( length, 10 ) );
    },

    max_length: function( field, length ) {
      // Ensures the field's value does not exceed a maximum length.
      if ( !numericRegex.test( length ) ) {
        return false; // Length parameter must be numeric.
      }

      return ( field.value.length <= parseInt( length, 10 ) );
    },

    exact_length: function( field, length ) {
      // Verifies the field's value is precisely a specified length.
      if ( !numericRegex.test( length ) ) {
        return false; // Length parameter must be numeric.
      }

      return ( field.value.length === parseInt( length, 10 ) );
    },

    greater_than: function( field, param ) {
      // Checks if the field's numeric value is greater than a given parameter.
      if ( !decimalRegex.test( field.value ) ) {
        return false; // Field value must be a decimal number.
      }

      return ( parseFloat( field.value ) > parseFloat( param ) );
    },

    less_than: function( field, param ) {
      // Checks if the field's numeric value is less than a given parameter.
      if ( !decimalRegex.test( field.value ) ) {
        return false; // Field value must be a decimal number.
      }

      return ( parseFloat( field.value ) < parseFloat( param ) );
    },

    alpha: function( field ) {
      // Validates that the field contains only alphabetical characters.
      return ( alphaRegex.test( field.value ) );
    },

    alpha_numeric: function( field ) {
      // Validates that the field contains only alphanumeric characters.
      return ( alphaNumericRegex.test( field.value ) );
    },

    alpha_dash: function( field ) {
      // Validates that the field contains only alphanumeric characters, underscores, and dashes.
      return ( alphaDashRegex.test( field.value ) );
    },

    numeric: function( field ) {
      // Validates that the field contains only numeric characters.
      return ( numericRegex.test( field.value ) );
    },

    integer: function( field ) {
      // Validates that the field contains an integer (positive or negative).
      return ( integerRegex.test( field.value ) );
    },

    decimal: function( field ) {
      // Validates that the field contains a decimal number.
      return ( decimalRegex.test( field.value ) );
    },

    is_natural: function( field ) {
      // Validates that the field contains only positive numbers (including zero).
      return ( naturalRegex.test( field.value ) );
    },

    is_natural_no_zero: function( field ) {
      // Validates that the field contains a number greater than zero.
      return ( naturalNoZeroRegex.test( field.value ) );
    },

    // ... (rest of the hooks would follow here, maintaining the same pattern) ...
  };
} )( window, document, undefined );