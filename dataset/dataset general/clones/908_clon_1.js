/*
 * This script initializes the application's API communication
 * upon the window's full load event.
 */
window.onload = function()
{
    // Check for modern event creation support
    if ( ! document.createEvent )
    {
        // Fallback for older browsers or environments
        var apiReady = new Event ( 'apiReady' ) ;
    }
    else
    {
        // Standard event creation
        var apiReady = document.createEvent ( "Event" ) ;
        apiReady.initEvent ( "apiReady" , true , false ) ;
    }

    // --- Configuration Variables ---

    /*
     * DSP URL: Replace this placeholder with the actual DreamFactory
     * instance URL. Ensure the /rest/api_docs path segment remains intact.
     */
    var dsp_url = "https://_your_dsp_hostname_here_/rest/api_docs" ;


    // Application Name: Update this with your specific application's API name.
    var app_name = "_your_app_api_name_here_" ;

    // --- API Authorization Setup ---

    // Setting up necessary headers for DreamFactory API communication.
    window.authorizations.add ( "X-DreamFactory-Application-Name" , new ApiKeyAuthorization ( "X-DreamFactory-Application-Name" , app_name , "header" ) ) ;
    window.authorizations.add ( 'Content-Type' , new ApiKeyAuthorization ( 'Content-Type' , 'application/json' , 'header' ) ) ;

    // --- Swagger API Initialization ---

    // Initialize the Swagger API client and assign it to the global 'df' object.
    window.df = new SwaggerApi
    (
        {
            url: dsp_url ,
            supportedSubmitMethods:
            [
                'get' ,
                'post' ,
                'put' ,
                'patch' ,
                'merge' ,
                'delete'
            ] ,
            success: function()
            {
                // On successful API initialization, dispatch the 'apiReady' event.
                if ( window.df && window.df.ready === true )
                {
                    document.dispatchEvent ( apiReady ) ;
                }
            } ,
            error: function()
            {
                // Log an error if API initialization fails.
                console.log ( "error occurred" ) ;
            }
        }
    ) ;

    // Attach authorization headers to the initialized df object.
    window.df.authorizations = window.authorizations ;

    // Build the API client.
    window.df.build ( ) ;
}
;