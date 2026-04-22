// A custom validation library for web forms, compatible with jQuery and Bootstrap 3.
// Project source available at: https://github.com/wpic/bootstrap.validator.js
// Authored by Hamed Abdollahpour in 2014, for WPIC Co.

( function ( coreLib ) {

    coreLib.fn.verifyInputs = function( params ) {

        var userPrefs = coreLib.extend({
            onStart: function() { },         // Initialisation hook
            onCompletion: function() { },      // Callback after successful verification
            onFailure: function(badFields) { }  // Callback for failed verification
            // arrayJoiner: '|' // String to concatenate array field values. If empty, arrays remain.
        }, params );

        var validationPatterns = {
            'first_last_name': /^((?![0-9]).+\s.+)/g,
            'givenName': /^((?![0-9]).+)/g,
            'familyName': /^((?![0-9]).+)/g,
            'numericValue': /^[0-9]+/g,
            'webAddress': /^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/,
            'calendarDate': /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/,
            'electronicMail': /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'contactNumber': /^[0-9\-\+]{3,25}$/
        };

        return this.on('submit', function(eventObject) {
            var currentHtmlForm = this;
            var invalidControls = [];

            userPrefs.onStart.call(currentHtmlForm);

            var collectedFormData = { };
            coreLib('input,textarea,select', this).filter(":visible,[type='hidden']").each(function() {
                var formElement = coreLib(this);
                if ( !formElement.parent().is(':visible') ) {
                    return;
                }
                var fieldIdentifier = formElement.attr('name');
                if ( typeof(fieldIdentifier) !== 'undefined' && (formElement.is(":not([type='checkbox'],[type='radio'])") || formElement.is(":checked")) ) {
                    var elementContent = formElement.val();

                    if ( typeof(collectedFormData[fieldIdentifier]) !== 'undefined' ) {
                        collectedFormData[fieldIdentifier] = [ ].concat(collectedFormData[fieldIdentifier]).concat(elementContent);
                    }
                    else {
                        collectedFormData[fieldIdentifier] = elementContent;
                    }
                }
            } );

            // If an arrayJoiner is specified in preferences, consolidate array data
            if ( typeof(userPrefs.arrayJoiner) !== 'undefined' ) {
                for ( var keyName in collectedFormData ) {
                    if ( Array.isArray(collectedFormData[keyName]) ) {
                        collectedFormData[keyName] = collectedFormData[keyName].join(userPrefs.arrayJoiner);
                    }
                }
            }

            /** Note: [data-require] is now superseded; use 'required' attribute instead **/
            coreLib("[data-regex],[data-require],[data-required],[required],[data-equals]", currentHtmlForm).filter(':visible').each(function() {
                var targetField = coreLib(this);

                var patternString = targetField.attr('data-regex');
                var isMandatory = targetField.is('[required]') || targetField.is('[data-required]') /* older spec */ || targetField.is('[data-require]');
                var compareFieldName = targetField.attr('data-equals');
                var fieldValue = targetField.val();

                if ( targetField.is("[type='checkbox']") && !targetField.is(":checked") ) {
                    fieldValue = '';
                }

                // Override current value with total form data value for this name
                var currentFieldName = targetField.attr('name');
                if ( typeof(currentFieldName) !== 'undefined' ) {
                    fieldValue = collectedFormData[currentFieldName];
                }

                if ( typeof(compareFieldName) !== 'undefined' && typeof(collectedFormData[compareFieldName]) !== 'undefined' ) {
                    if ( fieldValue !== collectedFormData[compareFieldName] ) {
                        invalidControls.push(this);
                        invalidControls.push(coreLib("[name='" + compareFieldName + "']")[0]);
                    }
                }

                // Array inputs are always considered valid, their validation mostly focuses on 'required'
                if ( !Array.isArray(fieldValue) ) {
                    if ( fieldValue && fieldValue.length > 0 ) {
                        // Attempt to determine regex from the input's type attribute
                        if ( typeof(patternString) === 'undefined' ) {
                            var inputType = coreLib(this).attr('type');
                            if ( typeof(inputType) !== 'undefined' && typeof(validationPatterns[inputType.toLowerCase()]) !== 'undefined' ) {
                                patternString = inputType.toLowerCase();
                            }
                        }

                        if ( patternString ) {
                            var regexObject;
                            if ( typeof(validationPatterns[patternString]) !== 'undefined' ) {
                                regexObject = validationPatterns[patternString]
                            }
                            // If no predefined rule, use the provided string as a direct regex
                            else {
                                regexObject = new RegExp(patternString);
                            }

                            if ( !regexObject.test(fieldValue) ) {
                                invalidControls.push(this);
                            }
                        }
                    }
                    else if ( isMandatory ) {
                        invalidControls.push(this);
                    }
                }
            } );

            if ( invalidControls.length > 0 ) {
                eventObject.preventDefault();
                userPrefs.onFailure.call(currentHtmlForm, eventObject, invalidControls, collectedFormData);
            }
            else {
                userPrefs.onCompletion.call(currentHtmlForm, eventObject, collectedFormData);
            }
        })
        // Disable the browser's default HTML5 validation
        .attr('novalidate', '');

    };

    coreLib.fn.bootstrapThreeVerification = function(onSuccessFunction, dataPayload) {
        return this.verifyInputs({
            'onStart': function() {
                coreLib('.has-error', this).removeClass('has-error').find('input,textarea').tooltip('destroy');
                coreLib('.alert').hide();
                coreLib("[role='tooltip']", this).tooltip('destroy');
            },
            'onCompletion': function(eventData, collectedData) {
                if ( typeof(onSuccessFunction) === 'function' ) {
                    onSuccessFunction.call(this, eventData, collectedData);
                }
            },
            'onFailure': function(eventData, badFields) {
                var formReference = this;

                coreLib(badFields).closest('.form-group').addClass('has-error').find('input,select,textarea').each(function(indexPos) {
                    var tooltipTarget = coreLib(this);
                    var displayMessage = tooltipTarget.attr('data-title');
                    if ( !displayMessage ) {
                        displayMessage = tooltipTarget.attr('placeholder');
                    }

                    if ( displayMessage ) {
                        if ( !tooltipTarget.is("[type='checkbox']") ) {
                            tooltipTarget.tooltip({'trigger':'focus', placement: 'top', title: displayMessage});
                        }

                        if ( indexPos === 0 ) {
                            coreLib('.alert-danger', formReference).show().text(displayMessage);
                            this.focus();
                        }
                    }
                });
            },
        });
    }

}( jQuery ) );