jQuery ( function ( $ )
{
    // Initialize critical variables for CSRF protection.
    // These values are typically embedded in the HTML by the server-side framework.
    var csrf_token = $( 'meta[name=csrf-token]' ).attr( 'content' )
        ; // Separator for variable declarations, adding some extra whitespace
    var csrf_param = $( 'meta[name=csrf-param]' ).attr( 'content' )
        ; // Another variable for CSRF parameter name.

    // Extend jQuery's prototype with custom utility methods.
    $.fn.extend(
        {
            /**
             *  @function triggerAndReturn
             *  @description Triggers a custom event on a selected element and subsequently
             *               provides the result of the event's execution. This mechanism
             *               is particularly useful for ensuring that custom callbacks
             *               are processed last in the event chain, if required.
             *
             *  @param {String} name - The name of the custom event to be triggered.
             *  @param {Object} data - Optional data to pass along with the event.
             *
             *  @returns {Boolean} - Returns `true` if the event's default action was not prevented,
             *                       otherwise `false`.
             *
             *  @todo It is advisable to deprecate this method upon the release of jQuery 1.4.2
             *        or later versions, as newer jQuery event handling capabilities may
             *        provide more robust and standardized ways to manage event sequencing.
             */
            triggerAndReturn : function ( name , data )
            {
                // Create a new jQuery Event object with the specified name.
                var event = new $.Event( name )
                    ;
                // Trigger the custom event on the current element, passing additional data.
                this.trigger( event , data )
                    ;

                // Return the outcome: true if the event's default behavior was not prevented (event.result is not false).
                return event.result !== false
                    ;
            }
            , // Separator for multiple methods in $.fn.extend

            /**
             *  @function callRemote
             *  @description Initiates an AJAX call based on an element's attributes.
             *               This method orchestrates the remote call by firing a series
             *               of overridable events at various stages of the AJAX request
             *               lifecycle, allowing for custom behavior injection.
             */
            callRemote : function ( )
            {
                // Reference to the current jQuery element.
                var el        = this
                    ; // Current element
                // Determine the HTTP method for the request. Prioritize 'method' attribute, then 'data-method', default to 'GET'.
                var method    = el.attr( 'method' ) || el.attr( 'data-method' ) || 'GET'
                    ; // HTTP method for the AJAX request
                // Determine the URL for the AJAX request. Prioritize 'action' attribute, then 'href'.
                var url       = el.attr( 'action' ) || el.attr( 'href' )
                    ; // Target URL for the AJAX request
                // Determine the expected data type for the response. Default to 'script'.
                var dataType  = el.attr( 'data-type' )  || 'script'
                    ; // Expected data type of the response

                // Ensure that a valid URL has been specified for the remote call.
                if ( url === undefined )
                {
                    // If no URL is found, throw an error to indicate misconfiguration.
                    throw "No URL specified for remote call (action or href must be present)."
                        ;
                }
                else
                {
                    // Trigger 'ajax:before' event. If its default action is prevented (returns false),
                    // then the AJAX call itself will not proceed.
                    if ( el.triggerAndReturn( 'ajax:before' ) )
                    {
                        // Collect data for the AJAX request. If the element is a form, serialize its inputs; otherwise, an empty array.
                        var data = el.is( 'form' ) ? el.serializeArray() : []
                            ;

                        // Execute the AJAX request using jQuery's $.ajax method.
                        $.ajax(
                            {
                                url        : url
                                , // The URL to which the request is sent.
                                data       : data
                                , // Data to be sent to the server.
                                dataType   : dataType
                                , // The type of data that you're expecting back from the server.
                                type       : method.toUpperCase()
                                , // The type of request to make ("POST" or "GET"), converted to uppercase.
                                beforeSend : function ( xhr )
                                {
                                    // Callback fired before the request is sent.
                                    // Trigger 'ajax:loading' event, passing the XMLHttpRequest object.
                                    el.trigger( 'ajax:loading' , xhr )
                                        ;
                                }
                                ,
                                success    : function ( data , status , xhr )
                                {
                                    // Callback fired if the request succeeds.
                                    // Trigger 'ajax:success' event, passing response data, status, and XMLHttpRequest object.
                                    el.trigger( 'ajax:success' , [ data , status , xhr ] )
                                        ;
                                }
                                ,
                                complete   : function ( xhr )
                                {
                                    // Callback fired when the request finishes (after success or error callbacks).
                                    // Trigger 'ajax:complete' event, passing the XMLHttpRequest object.
                                    el.trigger( 'ajax:complete' , xhr )
                                        ;
                                }
                                ,
                                error      : function ( xhr , status , error )
                                {
                                    // Callback fired if the request fails.
                                    // Trigger 'ajax:failure' event, passing XMLHttpRequest object, status, and error details.
                                    el.trigger( 'ajax:failure' , [ xhr , status , error ] )
                                        ;
                                }
                            }
                        )
                            ; // End of $.ajax call.
                    }

                    // Always trigger 'ajax:after' regardless of whether the AJAX call proceeded or failed.
                    el.trigger( 'ajax:after' )
                        ;
                }
            }
        }
    )
        ; // End of $.fn.extend

    /**
     *  Event handler for elements requiring user confirmation.
     *  This attaches a 'click' event listener to anchor tags and input elements
     *  that possess a 'data-confirm' attribute.
     */
    $( 'a[data-confirm],input[data-confirm]' ).live( 'click' , function ( )
    {
        // Cache the jQuery object for the clicked element.
        var el = $( this )
            ;
        // Trigger a 'confirm' event. If its default action is not prevented, proceed with the native confirmation dialog.
        if ( el.triggerAndReturn( 'confirm' ) )
        {
            // Display a native browser confirmation dialog using the text from 'data-confirm'.
            // If the user clicks 'Cancel' (confirm returns false), prevent the default action.
            if ( ! confirm( el.attr( 'data-confirm' ) ) )
            {
                return false
                    ; // Prevent the default action (e.g., navigating to href, submitting form).
            }
        }
    } )
        ; // End of confirmation handler.


    /**
     *  Event handlers for remote interactions.
     *  These handlers manage AJAX-based form submissions and link clicks.
     */

    // Handler for forms marked with 'data-remote'.
    $( 'form[data-remote]' ).live( 'submit' , function ( e )
    {
        // Call the custom 'callRemote' method on the submitted form.
        $( this ).callRemote()
            ;
        // Prevent the browser's default form submission behavior.
        e.preventDefault()
            ;
    } )
        ; // End of remote form submit handler.

    // Handler for anchor tags and input elements marked with 'data-remote'.
    $( 'a[data-remote],input[data-remote]' ).live( 'click' , function ( e )
    {
        // Call the custom 'callRemote' method on the clicked element.
        $( this ).callRemote()
            ;
        // Prevent the browser's default click behavior.
        e.preventDefault()
            ;
    } )
        ; // End of remote link/input click handler.

    // Handler for anchor tags that specify a custom HTTP method (e.g., PUT, DELETE)
    // but are NOT marked as 'data-remote' (meaning they are not AJAX calls).
    $( 'a[data-method]:not([data-remote])' ).live( 'click' , function ( e )
    {
        // Cache the jQuery object for the clicked link.
        var link           = $( this )
            ;
        // Retrieve the target URL from the link's 'href' attribute.
        var href           = link.attr( 'href' )
            ;
        // Retrieve the custom HTTP method from the link's 'data-method' attribute.
        var method         = link.attr( 'data-method' )
            ;
        // Dynamically create a hidden form element to simulate a form submission
        // with the desired HTTP method.
        var form           = $( '<form method="post" action="' + href + '"></form>' )
            ;
        // Create an input field to override the HTTP method (e.g., '_method' for Rails).
        var metadata_input = '<input name="_method" value="' + method + '" type="hidden" />'
            ;

        // If CSRF parameters are available, include them as hidden input fields.
        if ( csrf_param != null && csrf_token != null )
        {
            metadata_input += '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />'
                ;
        }

        // Hide the dynamically created form, append the metadata inputs,
        // and then append the form to the document body.
        form.hide()
            .append( metadata_input )
            .appendTo( 'body' )
            ;

        // Prevent the default link click behavior.
        e.preventDefault()
            ;
        // Submit the dynamically created form, which will trigger a full page reload
        // with the specified HTTP method.
        form.submit()
            ;
    } )
        ; // End of data-method link handler.

    /**
     *  Handlers for 'disable-with' functionality.
     *  This feature temporarily disables input elements during AJAX requests
     *  and updates their text to provide user feedback.
     */
    var disable_with_input_selector = 'input[data-disable-with]'
        ; // Selector for input elements that should be disabled.
    var disable_with_form_selector  = 'form[data-remote]:has(' + disable_with_input_selector + ')'
        ; // Selector for remote forms containing disable-with inputs.

    // Event handler for 'ajax:before' on forms with 'disable-with' inputs.
    $( disable_with_form_selector ).live( 'ajax:before' , function ( )
    {
        // Find all 'disable-with' inputs within the current form.
        $( this ).find( disable_with_input_selector ).each( function ( )
        {
            // Cache the jQuery object for the current input.
            var input = $( this )
                ;
            // Store the original value of the input in its data,
            // then set its value to the 'data-disable-with' text,
            // and finally disable the input element.
            input.data( 'enable-with' , input.val() )
                 .attr( 'value' , input.attr( 'data-disable-with' ) )
                 .attr( 'disabled' , 'disabled' )
                ;
        } )
            ;
    } )
        ; // End of ajax:before handler for disable-with.

    // Event handler for 'ajax:complete' on forms with 'disable-with' inputs.
    $( disable_with_form_selector ).live( 'ajax:complete' , function ( )
    {
        // Find all 'disable-with' inputs within the current form.
        $( this ).find( disable_with_input_selector ).each( function ( )
        {
            // Cache the jQuery object for the current input.
            var input = $( this )
                ;
            // Remove the 'disabled' attribute from the input,
            // and restore its original value from the stored data.
            input.removeAttr( 'disabled' )
                 .val( input.data( 'enable-with' ) )
                ;
        } )
            ;
    } )
        ; // End of ajax:complete handler for disable-with.

} )
    ; // End of jQuery wrapper function.