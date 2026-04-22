/*
 * Skeuocard - A Skeuomorphic Credit Card Input Enhancement Plugin
 *
 * @description This JavaScript plugin, "Skeuocard", provides a skeuomorphic credit card input
 *              interface. It aims to offer a user experience that closely mimics interacting
 *              with a physical credit card, enhancing usability and aesthetics.
 *              It is designed with progressive enhancement in mind, ensuring basic
 *              functionality even without advanced JavaScript.
 *
 * @author Ken Keiter <ken@kenkeiter.com>
 * @version 1.0.0
 * @updated 2013-07-25 (Last major update date)
 * @website http://kenkeiter.com/ (Official project website)
 * @exports [window.Skeuocard] (The main Skeuocard class is exposed globally)
 *
 * This file contains the core logic for initializing the Skeuocard component,
 * handling DOM manipulation, event binding, and managing the state of the
 * credit card input fields.
 */


( function ( ) {

    // Define core variables and utility functions for internal use.
    var $, Skeuocard, visaProduct,
        __slice = [ ] .slice, // Helper for converting arguments to array.
        __indexOf = [ ] .indexOf || function ( item ) { // Polyfill for Array.prototype.indexOf.
            for ( var i = 0, l = this.length; i < l; i ++ ) {
                if ( i in this && this[ i ] === item ) return i;
            }
            return -1;
        };


    // Assign jQuery to the local '$' variable for convenience and compatibility.
    $ = jQuery;


    // Define the Skeuocard class. This is the main constructor for the plugin.
    Skeuocard = ( function ( ) {

        // Static property: currentDate, used for expiration date validation.
        Skeuocard.currentDate = new Date ( );


        /**
         * Skeuocard Constructor
         * Initializes a new Skeuocard instance on a given DOM element.
         *
         * @param {HTMLElement|jQuery} el - The DOM element or jQuery object to transform into a Skeuocard.
         * @param {Object} [opts] - Configuration options for the Skeuocard instance.
         */
        function Skeuocard ( el, opts ) {
            var optDefaults; // Variable to hold default options.

            // Ensure opts is an object, even if not provided.
            if ( opts == null ) {
                opts = { };
            }

            // Initialize DOM element references.
            this.el = {
                container: $ ( el ), // The main container element.
                underlyingFields: { } // Object to store references to hidden input fields.
            };

            // Initialize internal views and state.
            this._inputViews = { }; // Holds instances of input view components.
            this._inputViewsByFace = { // Categorizes input views by card face (front/back).
                front: [ ],
                back: [ ]
            };
            this._tabViews = { }; // Holds instances of tab view components.
            this._state = { }; // Internal state management.

            this.product = null; // Currently detected card product (e.g., Visa, Mastercard).
            this.visibleFace = 'front'; // The currently visible face of the card ('front' or 'back').


            // Define default options for the Skeuocard instance.
            optDefaults = {
                debug: false, // Enable/disable debug logging.
                dontFocus: false, // Prevent automatic focusing after product rendering.
                acceptedCardProducts: null, // Array of accepted card product shortnames (e.g., ['visa', 'mc']).
                cardNumberPlaceholderChar: 'X', // Character used for card number placeholders.
                genericPlaceholder: "XXXX XXXX XXXX XXXX", // Default placeholder for card number.
                typeInputSelector: '[name="cc_type"]', // Selector for the card type input.
                numberInputSelector: '[name="cc_number"]', // Selector for the card number input.
                expMonthInputSelector: '[name="cc_exp_month"]', // Selector for the expiration month input.
                expYearInputSelector: '[name="cc_exp_year"]', // Selector for the expiration year input.
                nameInputSelector: '[name="cc_name"]', // Selector for the cardholder name input.
                cvcInputSelector: '[name="cc_cvc"]', // Selector for the CVC input.
                initialValues: { }, // Initial values for input fields.
                validationState: { }, // Initial validation state for input fields.
                strings: { // Customizable strings for UI elements.
                    hiddenFaceFillPrompt: "<strong>Click here</strong> to <br>fill in the other side.",
                    hiddenFaceErrorWarning: "There's a problem on the other side.",
                    hiddenFaceSwitchPrompt: "Forget something?<br> Flip the card over."
                }
            };

            // Merge default options with user-provided options.
            this.options = $.extend ( optDefaults, opts );

            // Perform initial DOM transformation and setup.
            this._conformDOM ( );
            // Bind all necessary input and interaction events.
            this._bindInputEvents ( );
            // Import options implicitly from the existing DOM structure.
            this._importImplicitOptions ( );
            // Render the initial state of the card.
            this.render ( );

        } // End of Skeuocard constructor.


        /**
         * Private method: _log
         * Handles logging messages to the console, but only when
         * the debug option is explicitly enabled.
         *
         * @private
         * @param {...*} msg - Messages to log.
         */
        Skeuocard.prototype._log = function ( ) {
            var msg; // Array to hold log messages.

            // Collect all arguments passed to the function into an array.
            msg = 1 <= arguments.length ? __slice.call ( arguments, 0 ) : [ ] ;

            // Check if the browser's console object exists and if debugging is enabled.
            if ( ( typeof console !== "undefined" && console !== null ? console.log : void 0 ) && !! this.options.debug ) {
                // If debug mode is active, log the messages with a Skeuocard prefix.
                if ( this.options.debug != null ) {
                    return console.log.apply ( console, [ "[skeuocard]" ].concat ( __slice.call ( msg ) ) ) ;
                } // End of inner debug check.
            } // End of console/debug check.
        } ; // End of _log method definition.


        /**
         * Public method: trigger
         * Triggers a custom event on the Skeuocard container element.
         *
         * @param {...*} args - Arguments to pass to the trigger function (event name, data).
         * @returns {jQuery} The container element for chaining.
         */
        Skeuocard.prototype.trigger = function ( ) {
            var args, _ref; // Variables to hold arguments and a reference for method call.

            // Collect all arguments for the trigger method.
            args = 1 <= arguments.length ? __slice.call ( arguments, 0 ) : [ ] ;

            // Trigger the event on the container element.
            return ( _ref = this.el.container ).trigger.apply ( _ref, args ) ;
        } ; // End of trigger method definition.


        /**
         * Public method: bind
         * Binds an event handler to the Skeuocard container element.
         *
         * @param {...*} args - Arguments to pass to the bind function (event name, handler).
         * @returns {jQuery} The container element for chaining.
         */
        Skeuocard.prototype.bind = function ( ) {
            var args, _ref; // Variables to hold arguments and a reference for method call.

            // Collect all arguments for the bind method.
            args = 1 <= arguments.length ? __slice.call ( arguments, 0 ) : [ ] ;

            // Bind the event handler to the container element.
            return ( _ref = this.el.container ).bind.apply ( _ref, args ) ;
        } ; // End of bind method definition.


        /*
         * Private method: _conformDOM
         * Transforms the elements within the container to prepare them for Skeuocard styling.
         * This involves removing non-input elements, hiding underlying inputs, and
         * constructing the visual card structure (front/back faces, input views).
         *
         * @private
         * @returns {jQuery} The container element.
         */
        Skeuocard.prototype._conformDOM = function ( ) {
            // Remove 'no-js' class and add 'skeuocard' and 'js' classes for styling.
            this.el.container.removeClass ( 'no-js' ) ;
            this.el.container.addClass ( "skeuocard js" ) ;

            // Remove any child elements that are not inputs, selects, or textareas.
            this.el.container.find ( "> :not(input,select,textarea)" ).remove ( ) ;
            // Hide the original underlying input fields.
            this.el.container.find ( "> input,select,textarea" ).hide ( ) ;


            // Store references to the underlying hidden input fields based on selectors.
            this.el.underlyingFields = {
                type: this.el.container.find ( this.options.typeInputSelector ),
                number: this.el.container.find ( this.options.numberInputSelector ),
                expMonth: this.el.container.find ( this.options.expMonthInputSelector ),
                expYear: this.el.container.find ( this.options.expYearInputSelector ),
                name: this.el.container.find ( this.options.nameInputSelector ),
                cvc: this.el.container.find ( this.options.cvcInputSelector )
            };

            // Create the front and back faces of the card.
            this.el.front = $ ( "<div>" ).attr ( {
                "class": "face front"
            } ) ;
            this.el.back = $ ( "<div>" ).attr ( {
                "class": "face back"
            } ) ;

            // Create the main card body wrapper.
            this.el.cardBody = $ ( "<div>" ).attr ( {
                "class": "card-body"
            } ) ;

            // Append faces to the card body.
            this.el.front.appendTo ( this.el.cardBody ) ;
            this.el.back.appendTo ( this.el.cardBody ) ;
            // Append the card body to the main container.
            this.el.cardBody.appendTo ( this.el.container ) ;

            // Initialize FlipTabView instances for front and back faces.
            this._tabViews.front = new Skeuocard.prototype.FlipTabView ( this, 'front', {
                strings: this.options.strings
            } ) ;
            this._tabViews.back = new Skeuocard.prototype.FlipTabView ( this, 'back', {
                strings: this.options.strings
            } ) ;

            // Prepend tab views to their respective card faces.
            this.el.front.prepend ( this._tabViews.front.el ) ;
            this.el.back.prepend ( this._tabViews.back.el ) ;

            // Initially hide the tab views.
            this._tabViews.front.hide ( ) ;
            this._tabViews.back.hide ( ) ;


            // Initialize various input views.
            this._inputViews = {
                number: new this.SegmentedCardNumberInputView ( ), // Card number input view.
                exp: new this.ExpirationInputView ( { // Expiration date input view.
                    currentDate: this.options.currentDate
                } ),
                name: new this.TextInputView ( { // Cardholder name input view.
                    "class": "cc-name",
                    placeholder: "YOUR NAME"
                } ),
                cvc: new this.TextInputView ( { // CVC input view.
                    "class": "cc-cvc",
                    placeholder: "XXX",
                    requireMaxLength: true
                } )
            };

            // Add specific classes and append input views to the front/back faces.
            this._inputViews.number.el.addClass ( 'cc-number' ) ;
            this._inputViews.number.el.appendTo ( this.el.front ) ;

            this._inputViews.name.el.appendTo ( this.el.front ) ;

            this._inputViews.exp.el.addClass ( 'cc-exp' ) ;
            this._inputViews.exp.el.appendTo ( this.el.front ) ;

            this._inputViews.cvc.el.appendTo ( this.el.back ) ;

            // Return the container for method chaining.
            return this.el.container;
        } ; // End of _conformDOM method definition.


        /*
         * Private method: _importImplicitOptions
         * Imports initial options and values from the existing DOM structure,
         * such as pre-filled input values, accepted card types, and validation states.
         *
         * @private
         */
        Skeuocard.prototype._importImplicitOptions = function ( ) {
            var fieldEl, fieldName, _initialExp, _ref, // Local variables for iteration and temporary storage.
                _this = this; // Cache 'this' for use in callbacks.

            _ref = this.el.underlyingFields;
            // Iterate over each underlying field to import initial values and validation.
            for ( fieldName in _ref ) {
                fieldEl = _ref[ fieldName ] ;

                // If initialValues for this field are not explicitly set, get them from the DOM.
                if ( this.options.initialValues[ fieldName ] == null ) {
                    this.options.initialValues[ fieldName ] = fieldEl.val ( ) ;
                } else {
                    // Otherwise, ensure the initial value is a string and set the underlying field.
                    this.options.initialValues[ fieldName ] = this.options.initialValues[ fieldName ].toString ( ) ;
                    this._setUnderlyingValue ( fieldName, this.options.initialValues[ fieldName ] ) ;
                }

                // Check if any field has an initial value, indicating the card was initially filled.
                if ( this.options.initialValues[ fieldName ].length > 0 ) {
                    this._state[ 'initiallyFilled' ] = true;
                }

                // If validationState for this field is not explicitly set, derive it from DOM classes.
                if ( this.options.validationState[ fieldName ] == null ) {
                    this.options.validationState[ fieldName ] = ! fieldEl.hasClass ( 'invalid' ) ;
                }
            } // End of underlyingFields iteration.


            // If acceptedCardProducts are not explicitly set, derive them from the 'type' select options.
            if ( this.options.acceptedCardProducts == null ) {
                this.options.acceptedCardProducts = [ ] ;
                this.el.underlyingFields.type.find ( 'option' ).each ( function ( i, _el ) {
                    var el, shortname; // Local variables for option element and its shortname.
                    el = $ ( _el ) ;
                    // Get the shortname from 'data-sc-type' attribute or 'value'.
                    shortname = el.attr ( 'data-sc-type' ) || el.attr ( 'value' ) ;
                    return _this.options.acceptedCardProducts.push ( shortname ) ;
                } ) ;
            } // End of acceptedCardProducts initialization.


            // Set initial values for the Skeuocard input views based on imported options.
            if ( this.options.initialValues.number.length > 0 ) {
                this.set ( 'number', this.options.initialValues.number ) ;
            }
            if ( this.options.initialValues.name.length > 0 ) {
                this.set ( 'name', this.options.initialValues.name ) ;
            }
            if ( this.options.initialValues.cvc.length > 0 ) {
                this.set ( 'cvc', this.options.initialValues.cvc ) ;
            }

            // Handle initial expiration date value, combining month and year.
            if ( this.options.initialValues.expYear.length > 0 && this.options.initialValues.expMonth.length > 0 ) {
                _initialExp = new Date ( parseInt ( this.options.initialValues.expYear ), parseInt ( this.options.initialValues.expMonth ) - 1, 1 ) ;
                this.set ( 'exp', _initialExp ) ;
            }

            // Update validation status for both faces based on initial values.
            this._updateValidationForFace ( 'front' ) ;
            return this._updateValidationForFace ( 'back' ) ;
        } ; // End of _importImplicitOptions method definition.


        /**
         * Public method: set
         * Sets the value of a specific input field within the Skeuocard.
         *
         * @param {string} field - The name of the field (e.g., 'number', 'exp', 'name', 'cvc').
         * @param {*} newValue - The new value to set for the field.
         */
        Skeuocard.prototype.set = function ( field, newValue ) {
            // Set the value in the corresponding input view.
            this._inputViews[ field ].setValue ( newValue ) ;
            // Trigger a 'valueChanged' event for the input view.
            return this._inputViews[ field ].trigger ( 'valueChanged', this._inputViews[ field ] ) ;
        } ; // End of set method definition.


        /*
         * Private method: _bindInputEvents
         * Binds various interaction events to their appropriate handlers.
         * This includes changes to underlying fields and custom events from input views.
         *
         * @private
         */
        Skeuocard.prototype._bindInputEvents = function ( ) {
            var _expirationChange, // Function to handle expiration date changes.
                _this = this; // Cache 'this' for use in callbacks.


            // Bind change event for the underlying card number field.
            this.el.underlyingFields.number.bind ( "change", function ( e ) {
                _this._inputViews.number.setValue ( _this._getUnderlyingValue ( 'number' ) ) ;
                return _this.render ( ) ;
            } ) ;


            // Define the expiration change handler.
            _expirationChange = function ( e ) {
                var month, year; // Variables for month and year.
                month = parseInt ( _this._getUnderlyingValue ( 'expMonth' ) ) ;
                year = parseInt ( _this._getUnderlyingValue ( 'expYear' ) ) ;
                // Set the expiration date in the input view.
                _this._inputViews.exp.setValue ( new Date ( year, month - 1 ) ) ;
                return _this.render ( ) ;
            } ; // End of _expirationChange function.


            // Bind change events for underlying expiration month and year fields.
            this.el.underlyingFields.expMonth.bind ( "change", _expirationChange ) ;
            this.el.underlyingFields.expYear.bind ( "change", _expirationChange ) ;


            // Bind change event for the underlying cardholder name field.
            this.el.underlyingFields.name.bind ( "change", function ( e ) {
                _this._inputViews.exp.setValue ( _this._getUnderlyingValue ( 'name' ) ) ;
                return _this.render ( ) ;
            } ) ;


            // Bind change event for the underlying CVC field.
            this.el.underlyingFields.cvc.bind ( "change", function ( e ) {
                _this._inputViews.exp.setValue ( _this._getUnderlyingValue ( 'cvc' ) ) ;
                return _this.render ( ) ;
            } ) ;


            // Bind custom events from the card number input view.
            this._inputViews.number.bind ( "change valueChanged", function ( e, input ) {
                var cardNumber, matchedProduct, number, previousProduct, _ref, _ref1; // Local variables for card product logic.

                cardNumber = input.getValue ( ) ;
                _this._setUnderlyingValue ( 'number', cardNumber ) ; // Update underlying field.
                _this._updateValidation ( 'number', cardNumber ) ; // Update validation.

                number = _this._getUnderlyingValue ( 'number' ) ;
                // Attempt to match a card product based on the entered number.
                matchedProduct = Skeuocard.prototype.CardProduct.firstMatchingNumber ( number ) ;

                // Check if the matched product is different from the current one.
                if ( ! ( ( _ref = _this.product ) != null ? _ref.eql ( matchedProduct ) : void 0 ) ) {
                    _this._log ( "Product will change:", _this.product, "=>", matchedProduct ) ;

                    // If a product is matched and it's among the accepted types.
                    if ( ( _ref1 = matchedProduct != null ? matchedProduct.attrs.companyShortname : void 0, __indexOf.call ( _this.options.acceptedCardProducts, _ref1 ) >= 0 ) ) {
                        _this.trigger ( 'productWillChange.skeuocard', [ _this, _this.product, matchedProduct ] ) ;
                        previousProduct = _this.product; // Store previous product.
                        _this.el.container.removeClass ( 'unaccepted' ) ; // Remove 'unaccepted' class.
                        _this._renderProduct ( matchedProduct ) ; // Render for the new product.
                        _this.product = matchedProduct; // Update current product.
                    }
                    // If a product is matched but it's not accepted.
                    else if ( matchedProduct != null ) {
                        _this.trigger ( 'productWillChange.skeuocard', [ _this, _this.product, null ] ) ;
                        _this.el.container.addClass ( 'unaccepted' ) ; // Add 'unaccepted' class.
                        _this._renderProduct ( null ) ; // Render generic state.
                        _this.product = null; // Clear product.
                    }
                    // If no product is matched.
                    else {
                        _this.trigger ( 'productWillChange.skeuocard', [ _this, _this.product, null ] ) ;
                        _this.el.container.removeClass ( 'unaccepted' ) ; // Ensure 'unaccepted' class is removed.
                        _this._renderProduct ( null ) ; // Render generic state.
                        _this.product = null; // Clear product.
                    }

                    // Trigger 'productDidChange' event.
                    return _this.trigger ( 'productDidChange.skeuocard', [ _this, previousProduct, _this.product ] ) ;
                } // End of product change check.
            } ) ; // End of number input view events.


            // Bind custom events from the expiration input view.
            this._inputViews.exp.bind ( "keyup valueChanged", function ( e, input ) {
                var newDate; // Variable for the new expiration date.
                newDate = input.getValue ( ) ;
                _this._updateValidation ( 'exp', newDate ) ; // Update validation.

                // If a valid date is entered, update underlying month and year fields.
                if ( newDate != null ) {
                    _this._setUnderlyingValue ( 'expMonth', newDate.getMonth ( ) + 1 ) ;
                    return _this._setUnderlyingValue ( 'expYear', newDate.getFullYear ( ) ) ;
                }
            } ) ; // End of expiration input view events.


            // Bind custom events from the name input view.
            this._inputViews.name.bind ( "keyup valueChanged", function ( e, input ) {
                var value; // Variable for the input value.
                value = input.getValue ( ) ;
                _this._setUnderlyingValue ( 'name', value ) ; // Update underlying field.
                return _this._updateValidation ( 'name', value ) ; // Update validation.
            } ) ; // End of name input view events.


            // Bind custom events from the CVC input view.
            this._inputViews.cvc.bind ( "keyup valueChanged", function ( e, input ) {
                var value; // Variable for the input value.
                value = input.getValue ( ) ;
                _this._setUnderlyingValue ( 'cvc', value ) ; // Update underlying field.
                return _this._updateValidation ( 'cvc', value ) ; // Update validation.
            } ) ; // End of CVC input view events.


            // Delegate event for handling field tabbing (Tab key navigation).
            this.el.container.delegate ( "input", "keyup keydown", this._handleFieldTab.bind ( this ) ) ;


            // Bind click events to the tab views to flip the card.
            this._tabViews.front.el.click ( function ( ) {
                return _this.flip ( ) ;
            } ) ;
            return this._tabViews.back.el.click ( function ( ) {
                return _this.flip ( ) ;
            } ) ;

        } ; // End of _bindInputEvents method definition.


        /**
         * Private method: _handleFieldTab
         * Manages tab key navigation between fields, including flipping the card
         * when tabbing from the last field on one face to the first on the other.
         *
         * @private
         * @param {jQuery.Event} e - The keyup/keydown event object.
         * @returns {boolean} True to allow default tab behavior, false if handled.
         */
        Skeuocard.prototype._handleFieldTab = function ( e ) {
            var backFieldEls, currentFieldEl, frontFieldEls, _currentFace, _oppositeFace; // Local variables for field elements and faces.

            // Only process if the Tab key (keyCode 9) is pressed.
            if ( e.which === 9 ) {
                currentFieldEl = $ ( e.currentTarget ) ; // The currently focused input element.

                // Determine the opposite and current faces.
                _oppositeFace = this.visibleFace === 'front' ? 'back' : 'front';
                _currentFace = this.visibleFace === 'front' ? 'front' : 'back';

                // Get input elements on the opposite and current faces.
                backFieldEls = this.el[ _oppositeFace ].find ( 'input' ) ;
                frontFieldEls = this.el[ _currentFace ].find ( 'input' ) ;

                // Logic for tabbing forward from the front face to the back face.
                if ( this.visibleFace === 'front' && this.el.front.hasClass ( 'filled' ) && backFieldEls.length > 0 && frontFieldEls.index ( currentFieldEl ) === frontFieldEls.length - 1 && ! e.shiftKey ) {
                    this.flip ( ) ; // Flip the card.
                    backFieldEls.first ( ).focus ( ) ; // Focus the first input on the back face.
                    e.preventDefault ( ) ; // Prevent default tab behavior.
                }

                // Logic for tabbing backward from the back face to the front face.
                if ( this.visibleFace === 'back' && e.shiftKey ) {
                    this.flip ( ) ; // Flip the card.
                    backFieldEls.last ( ).focus ( ) ; // Focus the last input on the front face (after flip, becomes last on back).
                    e.preventDefault ( ) ; // Prevent default tab behavior.
                }
            }
            return true; // Allow other events to propagate.
        } ; // End of _handleFieldTab method definition.


        /**
         * Private method: _updateValidation
         * Updates the validation and fill state for a specific input field.
         * Triggers events if the state changes.
         *
         * @private
         * @param {string} fieldName - The name of the field (e.g., 'number', 'exp').
         * @param {*} newValue - The current value of the field.
         * @returns {boolean} False if no product is selected, otherwise void.
         */
        Skeuocard.prototype._updateValidation = function ( fieldName, newValue ) {
            var fillStateChanged, isFilled, isFixed, isValid, needsFix, validationStateChanged; // Local variables for validation logic.

            // If no card product is selected, validation cannot proceed.
            if ( this.product == null ) {
                return false;
            }

            // Determine if the field is considered "filled" according to the product's rules.
            isFilled = this.product[ fieldName ].isFilled ( newValue ) ;
            // Check if the field initially had an invalid state and has now been modified.
            needsFix = ( this.options.validationState[ fieldName ] != null ) === false;
            isFixed = ( this.options.initialValues[ fieldName ] != null ) && newValue !== this.options.initialValues[ fieldName ] ;
            // Determine if the field's value is valid.
            isValid = this.product[ fieldName ].isValid ( newValue ) && ( ( needsFix && isFixed ) || true ) ;

            // Check if the fill state or validation state has changed.
            fillStateChanged = this._state[ "" + fieldName + "Filled" ] !== isFilled;
            validationStateChanged = this._state[ "" + fieldName + "Valid" ] !== isValid;

            // If fill state has changed, update DOM and trigger events.
            if ( fillStateChanged ) {
                this.trigger ( "fieldFillStateWillChange.skeuocard", [ this, fieldName, isFilled ] ) ;
                this._inputViews[ fieldName ].el.toggleClass ( 'filled', isFilled ) ;
                this._state[ "" + fieldName + "Filled" ] = isFilled;
                this.trigger ( "fieldFillStateDidChange.skeuocard", [ this, fieldName, isFilled ] ) ;
            }

            // If validation state has changed, update DOM and trigger events.
            if ( validationStateChanged ) {
                this.trigger ( "fieldValidationStateWillChange.skeuocard", [ this, fieldName, isValid ] ) ;
                this._inputViews[ fieldName ].el.toggleClass ( 'valid', isValid ) ;
                this._inputViews[ fieldName ].el.toggleClass ( 'invalid', ! isValid ) ;
                this._state[ "" + fieldName + "Valid" ] = isValid;
                this.trigger ( "fieldValidationStateDidChange.skeuocard", [ this, fieldName, isValid ] ) ;
            }

            // After updating a field, update the validation for the visible face.
            return this._updateValidationForFace ( this.visibleFace ) ;
        } ; // End of _updateValidation method definition.


        /**
         * Private method: _updateValidationForFace
         * Updates the validation and fill state for an entire card face (front or back).
         * Triggers events if the state changes.
         *
         * @private
         * @param {string} face - The name of the face ('front' or 'back').
         */
        Skeuocard.prototype._updateValidationForFace = function ( face ) {
            var fieldsFilled, fieldsValid, fillStateChanged, isFilled, isValid, iv, validationStateChanged; // Local variables for face validation logic.

            // Determine if all fields on the given face are filled.
            fieldsFilled = ( ( function ( ) {
                var _i, _len, _ref, _results; // Iteration variables.
                _ref = this._inputViewsByFace[ face ] ;
                _results = [ ] ;
                for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {
                    iv = _ref[ _i ] ;
                    _results.push ( iv.el.hasClass ( 'filled' ) ) ;
                }
                return _results;
            } ).call ( this ) ).every ( Boolean ) ;

            // Determine if all fields on the given face are valid.
            fieldsValid = ( ( function ( ) {
                var _i, _len, _ref, _results; // Iteration variables.
                _ref = this._inputViewsByFace[ face ] ;
                _results = [ ] ;
                for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {
                    iv = _ref[ _i ] ;
                    _results.push ( iv.el.hasClass ( 'valid' ) ) ;
                }
                return _results;
            } ).call ( this ) ).every ( Boolean ) ;

            // A face is considered filled if all its fields are filled and a product is identified,
            // or if the card was initially filled regardless of product.
            isFilled = ( fieldsFilled && ( this.product != null ) ) || ( this._state[ 'initiallyFilled' ] || false ) ;
            // A face is considered valid if all its fields are valid and a product is identified.
            isValid = fieldsValid && ( this.product != null ) ;

            // Check if the fill state or validation state of the face has changed.
            fillStateChanged = this._state[ "" + face + "Filled" ] !== isFilled;
            validationStateChanged = this._state[ "" + face + "Valid" ] !== isValid;

            // If fill state has changed, update DOM and trigger events.
            if ( fillStateChanged ) {
                this.trigger ( "faceFillStateWillChange.skeuocard", [ this, face, isFilled ] ) ;
                this.el[ face ].toggleClass ( 'filled', isFilled ) ;
                this._state[ "" + face + "Filled" ] = isFilled;
                this.trigger ( "faceFillStateDidChange.skeuocard", [ this, face, isFilled ] ) ;
            }

            // If validation state has changed, update DOM and trigger events.
            if ( validationStateChanged ) {
                this.trigger ( "faceValidationStateWillChange.skeuocard", [ this, face, isValid ] ) ;
                this.el[ face ].toggleClass ( 'valid', isValid ) ;
                this.el[ face ].toggleClass ( 'invalid', ! isValid ) ;
                this._state[ "" + face + "Valid" ] = isValid;
                return this.trigger ( "faceValidationStateDidChange.skeuocard", [ this, face, isValid ] ) ;
            }
        } ; // End of _updateValidationForFace method definition.


        /*
         * Private method: _renderProduct
         * Applies rendering changes necessary for the currently detected card product.
         * If a `null` product is passed, the card reverts to a generic, unbranded state.
         * This includes updating classes, input groupings, placeholders, and field layouts.
         *
         * @private
         * @param {Skeuocard.CardProduct|null} product - The card product object, or null for generic.
         * @returns {Skeuocard.CardProduct|null} The product that was rendered.
         */
        Skeuocard.prototype._renderProduct = function ( product ) {
            var destFace, fieldName, focused, view, viewEl, _ref, _ref1, // Local variables for product rendering.
                _this = this; // Cache 'this' for use in callbacks.

            this._log ( "[_renderProduct]", "Rendering product:", product ) ;

            // Remove any existing product or issuer classes from the container.
            this.el.container.removeClass ( function ( index, css ) {
                return ( css.match ( /\b(product|issuer)-\S+/g ) || [ ] ).join ( ' ' ) ;
            } ) ;

            // Add new product and issuer classes if a product is provided.
            if ( ( product != null ? product.attrs.companyShortname : void 0 ) != null ) {
                this.el.container.addClass ( "product-" + product.attrs.companyShortname ) ;
            }
            if ( ( product != null ? product.attrs.issuerShortname : void 0 ) != null ) {
                this.el.container.addClass ( "issuer-" + product.attrs.issuerShortname ) ;
            }

            // Update the underlying 'type' field with the product's shortname, or null.
            this._setUnderlyingValue ( 'type', ( product != null ? product.attrs.companyShortname : void 0 ) || null ) ;

            // Set card number groupings based on the product, or use generic.
            this._inputViews.number.setGroupings ( ( product != null ? product.attrs.cardNumberGrouping : void 0 ) || [ this.options.genericPlaceholder.length ], this.options.dontFocus ) ;
            // Clear the dontFocus option after use.
            delete this.options.dontFocus;

            // If a product is provided, configure input views and rearrange fields.
            if ( product != null ) {
                // Reconfigure expiration input view pattern.
                this._inputViews.exp.reconfigure ( {
                    pattern: ( product != null ? product.attrs.expirationFormat : void 0 ) || "MM/YY"
                } ) ;
                // Update CVC input view attributes (maxlength, placeholder).
                this._inputViews.cvc.attr ( {
                    maxlength: product.attrs.cvcLength,
                    placeholder: new Array ( product.attrs.cvcLength + 1 ).join ( this.options.cardNumberPlaceholderChar )
                } ) ;

                // Reset input views grouped by face.
                this._inputViewsByFace = {
                    front: [ ],
                    back: [ ]
                };

                // Store the currently focused element to restore focus later.
                focused = $ ( 'input:focus' ) ;

                _ref = product.attrs.layout;
                // Iterate through the product's layout to position fields on correct faces.
                for ( fieldName in _ref ) {
                    destFace = _ref[ fieldName ] ;
                    this._log ( "Moving", fieldName, "to", destFace ) ;

                    // Detach the input view element and append it to the destination face.
                    viewEl = this._inputViews[ fieldName ].el.detach ( ) ;
                    viewEl.appendTo ( this.el[ destFace ] ) ;
                    // Add the input view to the corresponding face's list.
                    this._inputViewsByFace[ destFace ].push ( this._inputViews[ fieldName ] ) ;
                    // Ensure the input view is visible.
                    this._inputViews[ fieldName ].show ( ) ;
                } // End of layout iteration.

                // Use a timeout to ensure DOM updates are complete before restoring focus.
                setTimeout ( function ( ) {
                    var fieldEl, fieldLength; // Local variables for focus restoration.
                    if ( ( fieldEl = focused.first ( ) ) != null ) {
                        fieldLength = fieldEl[ 0 ].maxLength;
                        fieldEl.focus ( ) ;
                        // Set selection range to end of field for better UX.
                        return fieldEl[ 0 ].setSelectionRange ( fieldLength, fieldLength ) ;
                    }
                }, 10 ) ; // End of setTimeout.
            }
            // If no product is provided (generic state), hide all fields except number.
            else {
                _ref1 = this._inputViews;
                for ( fieldName in _ref1 ) {
                    view = _ref1[ fieldName ] ;
                    if ( fieldName !== 'number' ) {
                        view.hide ( ) ;
                    }
                }
            }
            return product; // Return the rendered product.
        } ; // End of _renderProduct method definition.


        /**
         * Private method: _renderValidation
         * Reruns validation for all input fields based on their current values.
         *
         * @private
         * @returns {Array} An array of results from updating each field's validation.
         */
        Skeuocard.prototype._renderValidation = function ( ) {
            var fieldName, fieldView, _ref, _results; // Iteration variables.

            _ref = this._inputViews;
            _results = [ ] ;
            // Iterate over all input views and update their validation status.
            for ( fieldName in _ref ) {
                fieldView = _ref[ fieldName ] ;
                _results.push ( this._updateValidation ( fieldName, fieldView.getValue ( ) ) ) ;
            }
            return _results;
        } ; // End of _renderValidation method definition.


        /**
         * Public method: render
         * Renders the Skeuocard's visual state based on the current product and validation.
         */
        Skeuocard.prototype.render = function ( ) {
            // First, render the product-specific changes.
            this._renderProduct ( this.product ) ;
            // Then, render the validation state for all fields.
            return this._renderValidation ( ) ;
        } ; // End of render method definition.


        /**
         * Public method: flip
         * Flips the credit card from its current visible face to the other.
         * Triggers events before and after the flip.
         */
        Skeuocard.prototype.flip = function ( ) {
            var surfaceName, targetFace; // Variables for face names.

            // Determine the target face after flipping.
            targetFace = this.visibleFace === 'front' ? 'back' : 'front';

            // Trigger event before the face becomes visible.
            this.trigger ( 'faceWillBecomeVisible.skeuocard', [ this, targetFace ] ) ;

            // Update the visible face state.
            this.visibleFace = targetFace;
            // Toggle the 'flip' class on the card body to animate the flip.
            this.el.cardBody.toggleClass ( 'flip' ) ;

            // Determine the current visible surface name.
            surfaceName = this.visibleFace === 'front' ? 'front' : 'back';
            // Attempt to focus the first non-filled input on the newly visible face.
            this.el[ surfaceName ].find ( '.cc-field' ).not ( '.filled' ).find ( 'input' ).first ( ).focus ( ) ;

            // Trigger event after the face has become visible.
            return this.trigger ( 'faceDidBecomeVisible.skeuocard', [ this, targetFace ] ) ;
        } ; // End of flip method definition.


        /**
         * Private method: _setUnderlyingValue
         * Sets the value of an underlying (hidden) input field.
         * Handles special cases for select elements with data attributes.
         *
         * @private
         * @param {string} field - The name of the field (e.g., 'number', 'expMonth').
         * @param {string} newValue - The new value to set.
         * @throws {string} If the field is unknown.
         */
        Skeuocard.prototype._setUnderlyingValue = function ( field, newValue ) {
            var fieldEl, remapAttrKey, _newValue, // Local variables for field manipulation.
                _this = this; // Cache 'this' for use in callbacks.

            fieldEl = this.el.underlyingFields[ field ] ;
            // Ensure newValue is a string.
            _newValue = ( newValue || "" ).toString ( ) ;

            // Throw an error if the field reference is missing.
            if ( fieldEl == null ) {
                throw "Set underlying value of unknown field: " + field + ".";
            }

            // Trigger a generic 'change' event on the Skeuocard instance.
            this.trigger ( 'change.skeuocard', [ this ] ) ;

            // If it's not a select element, simply set its value.
            if ( ! fieldEl.is ( 'select' ) ) {
                return this.el.underlyingFields[ field ].val ( _newValue ) ;
            }
            // If it's a select element, find the option that matches by value or data attribute.
            else {
                remapAttrKey = "data-sc-" + field.toLowerCase ( ) ;
                return fieldEl.find ( 'option' ).each ( function ( i, _el ) {
                    var optionEl; // Variable for the option element.
                    optionEl = $ ( _el ) ;
                    // If the new value matches the option's data attribute or its value, select it.
                    if ( _newValue === ( optionEl.attr ( remapAttrKey ) || optionEl.attr ( 'value' ) ) ) {
                        return _this.el.underlyingFields[ field ].val ( optionEl.attr ( 'value' ) ) ;
                    }
                } ) ;
            }
        } ; // End of _setUnderlyingValue method definition.

        // The Skeuocard class is returned, making it available outside the IIFE.
        return Skeuocard;

    } ) ( ) ; // End of Skeuocard class definition (immediately invoked).

} ) .call ( this ) ; // End of overall IIFE (immediately invoked with 'this' context).