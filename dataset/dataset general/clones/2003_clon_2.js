/*
 * input-checker.js version 1.0.0
 * Copyright (c) 2023, Your Name, yourwebsite.com
 * input-checker.js is provided under the Revised BSD License.
 * Many ideas for input-checker.js are adapted from robust validation libraries.
 * github.com/yourusername/input-checker
 */

( function ( globalObj, docElem, voidVal ) {
  // If a global configuration is desired, modify these default settings.
  // Otherwise, utilize the setCustomMessage() method for specific form messages.

  var configSettings = {
    errorStrings: {
      required: 'The %s data entry is mandatory.',
      matches: 'The %s data entry does not match the %s data entry.',
      "default": 'The %s data entry retains its default value; please update it.',
      valid_email: 'The %s data entry must be a valid electronic mail address.',
      valid_emails: 'The %s data entry must contain only valid electronic mail addresses.',
      min_length: 'The %s data entry must be at least %s characters long.',
      max_length: 'The %s data entry must not exceed %s characters in length.',
      exact_length: 'The %s data entry must be precisely %s characters in length.',
      greater_than: 'The %s data entry must be a numerical value larger than %s.',
      less_than: 'The %s data entry must be a numerical value smaller than %s.',
      alpha: 'The %s data entry may only contain alphabetic characters.',
      alpha_numeric: 'The %s data entry may only contain alphanumeric characters.',
      alpha_dash: 'The %s data entry may only contain alphanumeric characters, underscores, and hyphens.',
      numeric: 'The %s data entry must contain only numbers.',
      integer: 'The %s data entry must be an integer.',
      decimal: 'The %s data entry must be a decimal number.',
      is_natural: 'The %s data entry must contain only positive numerical values.',
      is_natural_no_zero: 'The %s data entry must contain a numerical value greater than zero.',
      valid_ip: 'The %s data entry must be a valid IP address.',
      valid_base64: 'The %s data entry must be a base64 encoded string.',
      valid_credit_card: 'The %s data entry must contain a valid credit card number.',
      is_file_type: 'The %s data entry must contain only %s file types.',
      valid_url: 'The %s data entry must be a valid web address.',
      greater_than_date: 'The %s data entry must represent a date later than %s.',
      less_than_date: 'The %s data entry must represent a date earlier than %s.',
      greater_than_or_equal_date: 'The %s data entry must represent a date at least as recent as %s.',
      less_than_or_equal_date: 'The %s data entry must represent a date that is %s or older.'
    },
    onValidationComplete: function ( validationFailures ) {

    }
  };

  // Define the regular expressions utilized for validation tasks

  var parsingPattern = /^(.+?)\[(.+)\]$/,
    digitPattern = /^[0-9]+$/,
    wholeNumberPattern = /^\-?[0-9]+$/,
    decimalNumberPattern = /^\-?[0-9]*\.?[0-9]+$/,
    mailAddressPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    alphabeticalPattern = /^[a-z]+$/i,
    alphaNumericPattern = /^[a-z0-9]+$/i,
    alphaDashPattern = /^[a-z0-9_\-]+$/i,
    positiveNumberPattern = /^[0-9]+$/i,
    positiveNonZeroPattern = /^[1-9][0-9]*$/i,
    internetProtocolPattern = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
    base64StringPattern = /[^a-zA-Z0-9\/\+=]/i,
    digitDashSpacePattern = /^[\d\-\s]+$/,
    webAddressPattern = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
    dateFormatPattern = /\d{4}-\d{1,2}-\d{1,2}/;

  /*
   * The primary public interface for validating a web form:
   *
   * @param formIdOrObject - String - The 'name' attribute of the form (e.g., <form name="dataForm"></form>) or the actual DOM node of the form.
   * @param inputDefinitions - Array - [{
   *     elementName: The name attribute of the input (e.g., <input name="myInput" />)
   *     displayLabel: 'Input Label'
   *     validationRules: mandatory|matches[confirmation_password]
   * }]
   * @param completionHandler - Function - The function to call after validation has concluded.
   *     @argument validationFailures - An array of validation issues.
   *     @argument submitEvent - The JavaScript event object.
   */

  var InputChecker = function ( formIdOrObject, inputDefinitions, completionHandler ) {
    this.completionHandler = completionHandler || configSettings.onValidationComplete;
    this.validationFailures = [];
    this.inputElements = {};
    this.targetForm = this._resolveFormElement( formIdOrObject ) || {};
    this.customMessages = {};
    this.ruleHandlers = {};
    this.dependencyChecks = {};

    for ( var idx = 0, defCount = inputDefinitions.length; idx < defCount; idx++ ) {
      var inputDef = inputDefinitions[ idx ];

      // If incorrectly structured, we must bypass this definition.
      if ( ( !inputDef.elementName && !inputDef.elementNames ) || !inputDef.validationRules ) {
        continue;
      }

      /*
       * Construct the master array of input definitions containing all necessary validation details.
       */

      if ( inputDef.elementNames ) {
        for ( var k = 0, nameCount = inputDef.elementNames.length; k < nameCount; k++ ) {
          this._includeInputDefinition( inputDef, inputDef.elementNames[ k ] );
        }
      } else {
        this._includeInputDefinition( inputDef, inputDef.elementName );
      }
    }

    /*
     * Attach an event listener for the form's submission event.
     */

    var originalSubmit = this.targetForm.onsubmit;

    this.targetForm.onsubmit = ( function ( selfRef ) {
      return function ( submitEvent ) {
        try {
          return selfRef._executeValidation( submitEvent ) && ( originalSubmit === voidVal || originalSubmit() );
        } catch ( err ) {
        }
      };
    } )( this );
  },

  getElementProperty = function ( targetElement, propName ) {
    var l;

    if ( ( targetElement.length > 0 ) && ( targetElement[ 0 ].type === 'radio' || targetElement[ 0 ].type === 'checkbox' ) ) {
      for ( l = 0, elemCount = targetElement.length; l < elemCount; l++ ) {
        if ( targetElement[ l ].checked ) {
          return targetElement[ l ][ propName ];
        }
      }

      return;
    }

    return targetElement[ propName ];
  };

  /*
   * @public
   * Establishes a custom error message for a specific rule.
   */

  InputChecker.prototype.setCustomMessage = function ( validationRule, customMsg ) {
    this.customMessages[ validationRule ] = customMsg;

    // Return 'this' to permit method chaining.
    return this;
  };

  /*
   * @public
   * Registers a callback function for a user-defined rule (e.g., callback_user_exists).
   */

  InputChecker.prototype.addRuleHandler = function ( handlerName, handlerFunc ) {
    if ( handlerName && typeof handlerName === 'string' && handlerFunc && typeof handlerFunc === 'function' ) {
      this.ruleHandlers[ handlerName ] = handlerFunc;
    }

    // Return 'this' for method chaining.
    return this;
  };

  /*
   * @public
   * Registers a conditional function for a custom 'dependentOn' rule.
   */

  InputChecker.prototype.addDependencyCheck = function ( checkName, checkFunc ) {
    if ( checkName && typeof checkName === 'string' && checkFunc && typeof checkFunc === 'function' ) {
      this.dependencyChecks[ checkName ] = checkFunc;
    }

    // Return 'this' for method chaining.
    return this;
  };

  /*
   * @private
   * Determines if a form DOM node was supplied or merely a string representing its name.
   */

  InputChecker.prototype._resolveFormElement = function ( formIdOrObject ) {
    return ( typeof formIdOrObject === 'object' ) ? formIdOrObject : docElem.forms[ formIdOrObject ];
  };

  /*
   * @private
   * Adds an input field's definition to the master inputElements array.
   */

  InputChecker.prototype._includeInputDefinition = function ( sourceDef, currentName ) {
    this.inputElements[ currentName ] = {
      elementName: currentName,
      displayLabel: sourceDef.displayLabel || currentName,
      validationRules: sourceDef.validationRules,
      dependentOn: sourceDef.dependentOn,
      elementId: null,
      domElement: null,
      elementType: null,
      currentValue: null,
      isChecked: null
    };
  };

  /*
   * @private
   * Initiates validation when the form is submitted.
   */

  InputChecker.prototype._executeValidation = function ( submitEvent ) {
    this.validationFailures = [];

    for ( var propKey in this.inputElements ) {
      if ( this.inputElements.hasOwnProperty( propKey ) ) {
        var currentInput = this.inputElements[ propKey ] || {},
          domInput = this.targetForm[ currentInput.elementName ];

        if ( domInput && domInput !== voidVal ) {
          currentInput.elementId = getElementProperty( domInput, 'id' );
          currentInput.domElement = domInput;
          currentInput.elementType = ( domInput.length > 0 ) ? domInput[ 0 ].type : domInput.type;
          currentInput.currentValue = getElementProperty( domInput, 'value' );
          currentInput.isChecked = getElementProperty( domInput, 'checked' );

          /*
           * Iterate through the rules for each input field.
           * If the input has a 'dependentOn' condition, validate it only
           * if the custom function returns true.
           */

          if ( currentInput.dependentOn && typeof currentInput.dependentOn === "function" ) {
            if ( currentInput.dependentOn.call( this, currentInput ) ) {
              this._checkInput( currentInput );
            }
          } else if ( currentInput.dependentOn && typeof currentInput.dependentOn === "string" && this.dependencyChecks[ currentInput.dependentOn ] ) {
            if ( this.dependencyChecks[ currentInput.dependentOn ].call( this, currentInput ) ) {
              this._checkInput( currentInput );
            }
          } else {
            this._checkInput( currentInput );
          }
        }
      }
    }

    if ( typeof this.completionHandler === 'function' ) {
      this.completionHandler( this.validationFailures, submitEvent );
    }

    if ( this.validationFailures.length > 0 ) {
      if ( submitEvent && submitEvent.preventDefault ) {
        submitEvent.preventDefault();
      } else if ( globalObj.event ) {
        // Older IE versions use the global event object.
        globalObj.event.returnValue = false;
      }
    }

    return true;
  };

  /*
   * @private
   * Examines the input field's value against its specified validation rules.
   */

  InputChecker.prototype._checkInput = function ( currentInput ) {
    var ruleSet = currentInput.validationRules.split( '|' ),
      requiredIndex = currentInput.validationRules.indexOf( 'required' ),
      isInputEmpty = ( !currentInput.currentValue || currentInput.currentValue === '' || currentInput.currentValue === voidVal );

    /*
     * Iterate through each rule and execute the corresponding validation methods.
     */

    for ( var ruleIdx = 0, totalRules = ruleSet.length; ruleIdx < totalRules; ruleIdx++ ) {
      var checkMethod = ruleSet[ ruleIdx ],
        methodParam = null,
        checkFailed = false,
        methodParts = parsingPattern.exec( checkMethod );

      /*
       * If this input is not mandatory and its value is empty, proceed to the next rule unless it's a callback.
       * This ensures that callback functions are always invoked, while other rules are skipped for empty, non-required fields.
       */

      if ( requiredIndex === -1 && checkMethod.indexOf( '!callback_' ) === -1 && isInputEmpty ) {
        continue;
      }

      /*
       * If the rule contains a parameter (e.g., matches[argument]) extract it.
       */

      if ( methodParts ) {
        checkMethod = methodParts[ 1 ];
        methodParam = methodParts[ 2 ];
      }

      if ( checkMethod.charAt( 0 ) === '!' ) {
        checkMethod = checkMethod.substring( 1, checkMethod.length );
      }

      /*
       * If a validation hook is defined, execute it to identify any validation issues.
       */

      if ( typeof this._validationHooks[ checkMethod ] === 'function' ) {
        if ( !this._validationHooks[ checkMethod ].apply( this, [ currentInput, methodParam ] ) ) {
          checkFailed = true;
        }
      } else if ( checkMethod.substring( 0, 9 ) === 'callback_' ) {
        // This is a custom method. Execute the registered handler if available.
        checkMethod = checkMethod.substring( 9, checkMethod.length );

        if ( typeof this.ruleHandlers[ checkMethod ] === 'function' ) {
          if ( this.ruleHandlers[ checkMethod ].apply( this, [ currentInput.currentValue, methodParam, currentInput ] ) === false ) {
            checkFailed = true;
          }
        }
      }

      /*
       * If the validation check failed, append an error message to the validationFailures array.
       */

      if ( checkFailed ) {
        // Confirm an error message exists for this specific rule.
        var messageSource = this.customMessages[ currentInput.elementName + '.' + checkMethod ] || this.customMessages[ checkMethod ] || configSettings.errorStrings[ checkMethod ],
          errorMessage = 'An issue occurred with the ' + currentInput.displayLabel + ' data entry.';

        if ( messageSource ) {
          errorMessage = messageSource.replace( '%s', currentInput.displayLabel );

          if ( methodParam ) {
            errorMessage = errorMessage.replace( '%s', ( this.inputElements[ methodParam ] ) ? this.inputElements[ methodParam ].displayLabel : methodParam );
          }
        }

        this.validationFailures.push( {
          elementId: currentInput.elementId,
          domElement: currentInput.domElement,
          elementName: currentInput.elementName,
          message: errorMessage,
          rule: checkMethod
        } );

        // Exit the loop to prevent an excessive number of validation errors (e.g., for 'required' and 'valid_email' on the same field).
        break;
      }
    }
  };

  /**
   * @private _parseDateString: auxiliary function to convert a date string into a Date object.
   * @param dateValue (String) must conform to yyyy-mm-dd format or be the keyword: 'today'.
   * @returns {Date} returns false if the date is invalid.
   */
  InputChecker.prototype._parseDateString = function ( dateValue ) {
    if ( !dateValue.match( 'today' ) && !dateValue.match( dateFormatPattern ) ) {
      return false;
    }

    var parsedDate = new Date(),
      dateParts;

    if ( !dateValue.match( 'today' ) ) {
      dateParts = dateValue.split( '-' );
      parsedDate.setFullYear( dateParts[ 0 ] );
      parsedDate.setMonth( dateParts[ 1 ] - 1 );
      parsedDate.setDate( dateParts[ 2 ] );
    }
    return parsedDate;
  };

  /*
   * @private
   * Object housing all validation hook functions.
   */

  InputChecker.prototype._validationHooks = {
    required: function ( inputInfo ) {
      var inputValue = inputInfo.currentValue;

      if ( ( inputInfo.elementType === 'checkbox' ) || ( inputInfo.elementType === 'radio' ) ) {
        return ( inputInfo.isChecked === true );
      }

      return ( inputValue !== null && inputValue !== '' );
    },

    "default": function ( inputInfo, defaultText ) {
      return inputInfo.currentValue !== defaultText;
    },

    matches: function ( inputInfo, targetName ) {
      var matchingElement = this.targetForm[ targetName ];

      if ( matchingElement ) {
        return inputInfo.currentValue === matchingElement.value;
      }

      return false;
    },

    valid_email: function ( inputInfo ) {
      return mailAddressPattern.test( inputInfo.currentValue );
    },

    valid_emails: function ( inputInfo ) {
      var emailList = inputInfo.currentValue.split( /\s*,\s*/g );

      for ( var idx = 0, listLength = emailList.length; idx < listLength; idx++ ) {
        if ( !mailAddressPattern.test( emailList[ idx ] ) ) {
          return false;
        }
      }

      return true;
    },

    min_length: function ( inputInfo, minLength ) {
      if ( !digitPattern.test( minLength ) ) {
        return false;
      }

      return ( inputInfo.currentValue.length >= parseInt( minLength, 10 ) );
    },

    max_length: function ( inputInfo, maxLength ) {
      if ( !digitPattern.test( maxLength ) ) {
        return false;
      }

      return ( inputInfo.currentValue.length <= parseInt( maxLength, 10 ) );
    },

    exact_length: function ( inputInfo, exactLength ) {
      if ( !digitPattern.test( exactLength ) ) {
        return false;
      }

      return ( inputInfo.currentValue.length === parseInt( exactLength, 10 ) );
    },

    greater_than: function ( inputInfo, compareValue ) {
      if ( !decimalNumberPattern.test( inputInfo.currentValue ) ) {
        return false;
      }

      return ( parseFloat( inputInfo.currentValue ) > parseFloat( compareValue ) );
    },

    less_than: function ( inputInfo, compareValue ) {
      if ( !decimalNumberPattern.test( inputInfo.currentValue ) ) {
        return false;
      }

      return ( parseFloat( inputInfo.currentValue ) < parseFloat( compareValue ) );
    },

    alpha: function ( inputInfo ) {
      return ( alphabeticalPattern.test( inputInfo.currentValue ) );
    },

    alpha_numeric: function ( inputInfo ) {
      return ( alphaNumericPattern.test( inputInfo.currentValue ) );
    },

    alpha_dash: function ( inputInfo ) {
      return ( alphaDashPattern.test( inputInfo.currentValue ) );
    },

    numeric: function ( inputInfo ) {
      return ( digitPattern.test( inputInfo.currentValue ) );
    },

    integer: function ( inputInfo ) {
      return ( wholeNumberPattern.test( inputInfo.currentValue ) );
    },

    decimal: function ( inputInfo ) {
      return ( decimalNumberPattern.test( inputInfo.currentValue ) );
    },

    is_natural: function ( inputInfo ) {
      return ( positiveNumberPattern.test( inputInfo.currentValue ) );
    },

    is_natural_no_zero: function ( inputInfo ) {
      return ( positiveNonZeroPattern.test( inputInfo.currentValue ) );
    }
  };
} )( window, document, undefined );