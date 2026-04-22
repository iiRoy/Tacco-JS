/*
 * This JavaScript module extends the jQuery Validation plugin.
 * It is structured as an Immediately Invoked Function Expression (IIFE)
 * to ensure that all declarations remain within its scope, preventing global
 * namespace pollution and providing a private execution context.
 */
( function ( $ )
{

    // BEGIN: Extension of $.validator.prototype
    // This section modifies the core behavior of the validator object.
    $.
        extend(
            $.validator.prototype,
            {
                /**
                 * showLabel: A method intended for displaying validation messages.
                 * In this specific implementation, it serves as a placeholder
                 * and currently performs no action. It can be customized later.
                 *
                 * @param {HTMLElement} element - The DOM element being validated.
                 * @param {string}      message - The validation error message to display.
                 */
                showLabel:  function( element, message )
                {
                    /*
                     * This function is intentionally left empty.
                     * Custom error display logic is handled by 'showErrors' method.
                     */
                }

            }   // End of prototype extension object.
        ); // End of $.extend for $.validator.prototype.


    // Add some extra space for readability between major extensions.


    // BEGIN: Extension of $.validator.defaults
    // This section defines default settings for all validation instances.
    $.
        extend(
            $.validator.defaults,
            {
                //  CSS class to apply to elements that fail validation.
                errorClass: 'error',

                //  CSS class to apply to elements that pass validation successfully.
                validClass: 'success',

                //  The HTML element type to be created for displaying error messages.
                errorElement: 'span',


                /**
                 * highlight: Custom function to visually indicate validation errors.
                 * It applies styling to the erroneous element and its parent control group.
                 *
                 * @param {HTMLElement} element     - The validated form field.
                 * @param {string}      errorClass  - The class name for error state.
                 * @param {string}      validClass  - The class name for valid state.
                 */
                highlight:  function ( element, errorClass, validClass )
                {
                    var     $element; // Declare a local variable for the jQuery-wrapped element.

                    // Check if the current element is a radio button.
                    if  (   element.type    ===     'radio' )
                    {
                        // If it's a radio button, select all radio buttons with the same 'name' attribute.
                        $element    =   this.findByName(    element.name    );
                    }
                    else
                    {
                        // Otherwise, simply wrap the single element in a jQuery object.
                        $element    =   $(  element   );
                    }

                    // Apply the designated error class and remove the valid class.
                    $element.   addClass(   errorClass  ).  removeClass(    validClass  );

                    // Find the closest ancestor 'div' with class 'control-group' and add the 'error' class to it.
                    $element.   parents(    "div.control-group" ).  addClass(   "error" );

                }, // End of highlight function definition.


                /**
                 * unhighlight: Custom function to revert visual styling when an element
                 * successfully passes validation after previously failing.
                 *
                 * @param {HTMLElement} element     - The validated form field.
                 * @param {string}      errorClass  - The class name for error state (to be removed).
                 * @param {string}      validClass  - The class name for valid state (to be added).
                 */
                unhighlight:    function ( element, errorClass, validClass )
                {
                    var     $element;   // Local variable for the jQuery object.

                    // Determine if the element is a radio input type.
                    if  (   element.type    ===     'radio' )
                    {
                        // For radio buttons, target the entire group by name.
                        $element    =   this.findByName(    element.name    );
                    }
                    else
                    {
                        // For other input types, process the single element.
                        $element    =   $(  element   );
                    }

                    // Remove the error class and apply the valid class.
                    $element.   removeClass(    errorClass  ).  addClass(   validClass  );

                    // Remove the 'error' class from the parent 'div.control-group'.
                    $element.   parents(    "div.control-group" ).  removeClass(    "error" );
                }, // End of unhighlight function definition.


                /**
                 * showErrors: Custom function to display validation messages using Bootstrap popovers.
                 * It iterates through successList to hide popovers and errorList to show them.
                 *
                 * @param {Object}          errorMap  - An object where keys are element names and values are error messages.
                 * @param {Array<Object>}   errorList - An array of objects, each containing 'element' and 'message'.
                 */
                showErrors: function ( errorMap, errorList )
                {
                    // Loop through elements that have successfully passed validation.
                    $.  each(   this.successList,   function ( index, value )
                    {
                        // Hide any previously displayed popover for the successfully validated element.
                        $(  value   ).  popover(    'hide'  );
                    }   ); // End of iteration for successList.


                    // Loop through elements that currently have validation errors.
                    $.  each(   errorList,  function ( index, value )
                    {
                        // Initialize a new Bootstrap popover for the element with an error.
                        // The 'trigger' is set to 'manual' for programmatic control.
                        var pop     =   $(  value.element   ).  popover(
                            {
                                trigger:    'manual',       // Popover won't show on hover/click automatically.
                                content:    value.message   // Set the initial content of the popover to the error message.
                            }
                        );

                        // Update the popover's content property directly, in case the message has changed.
                        pop.    data(   'popover'   ).  options.content     =   value.message;

                        // Manually display the popover for the current error element.
                        $(  value.element   ).  popover(    'show'  );

                    }   ); // End of iteration for errorList.


                    // Call the original defaultShowErrors method to ensure any
                    // standard error label handling (if not entirely replaced) still occurs.
                    this.   defaultShowErrors();

                } // End of showErrors function definition.

            }   // End of default options object.
        ); // End of $.extend for $.validator.defaults.

} ( jQuery ) ); // End of the IIFE, passing the jQuery object as '$'.

// This marks the end of the custom jQuery Validation setup.