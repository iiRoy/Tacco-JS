/*
 *  BigSEO Constructor Function
 *  Initializes the BigSEO object with default options.
 *  @param {Object} opts - Optional configuration settings.
 */
function BigSEO ( opts )
{
    // Default configuration options for the SEO operations.
    this.opts =
    {
        // Endpoint for saving cached DOM content.
        url       :   '/save/cache'
        ,

        // Endpoint for validating URLs.
        valid_url :   '/valid/cache'
    }
    ; // End of this.opts object literal
} // End of BigSEO constructor definition.


/*
 *  BigSEO Prototype Method: save
 *  Initiates the process of saving the current page's DOM,
 *  after optionally validating the URL.
 *
 *  @param {Function} success - Callback function for successful operations.
 *  @param {Function} error   - Callback function for error handling.
 */
BigSEO.prototype.save = function ( success , error )
{
    // Retrieve the complete inner HTML of the document.
    var   dom   =   document.documentElement.innerHTML
    ;

    // Get the current URL of the document.
    var   url   =   document.URL
    ;


    // If no success callback is provided, define a default no-op function.
    if ( ! success )
    {
        success = function ( data )
        {
            // Default success handler does nothing.
        };
    }


    // If no error callback is provided, define a default no-op function.
    if ( ! error )
    {
        error = function ( data )
        {
            // Default error handler does nothing.
        };
    }


    // Check if jQuery is available in the global scope.
    if ( jQuery )
    {
        // Use jQuery's AJAX functionality for network requests.
        $.ajax
        (
            {
                // URL for validating the current page.
                url      :   this.opts.valid_url
                ,

                // HTTP method for the request.
                method   :   "POST"
                ,

                // Data payload for the validation request.
                data     :
                {
                    url : url // Pass the current URL for validation.
                }
                ,

                // Callback for a successful validation response.
                success  :   function ( data )
                {
                    // If the data indicates the URL is not valid (e.g., not canonical).
                    if ( ! data.valid )
                    {
                        // Proceed to save the DOM content.
                        $.ajax
                        (
                            {
                                // URL for saving the DOM.
                                url       :   this.opts.url
                                ,

                                // HTTP method.
                                method    :   "POST"
                                ,

                                // Data to be sent for saving.
                                data      :
                                {
                                    dom   :   dom // The entire DOM content.
                                    ,
                                    url   :   url // The URL associated with the DOM.
                                }
                                ,

                                // Custom success callback provided by the user.
                                success   :   success
                                ,

                                // Custom error callback provided by the user.
                                error     :   error
                            }
                        )
                        ; // End of inner $.ajax call
                    } // End of if(!data.valid)
                } // End of outer success callback function
                ,

                // Custom error callback for the validation request.
                error    :   error
            }
        )
        ; // End of outer $.ajax call
    }
    else
    {
        // Alternative handling for environments without jQuery.
        // CURRENTLY: This block is a placeholder for future implementation.
        // It's important to provide a fallback or graceful degradation.
        /*
         *  Important: Implement a non-jQuery based AJAX solution here
         *  (e.g., XMLHttpRequest or Fetch API) if jQuery is not present.
         *  This ensures the functionality works across different environments.
         */
    } // End of if-else (jQuery check)
}
; // End of BigSEO.prototype.save method definition