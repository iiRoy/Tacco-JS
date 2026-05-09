/*
 * This section defines callback functions that will be executed
 * depending on the outcome of the external script loading process.
 */


// Callback function to be invoked once the filepicker script has successfully loaded.
// At this point, the filepicker object should be available globally.
var     filepickerLoadCallback =  function(  )    {
        // This is where you would typically initialize filepicker, e.g., set your API key.
        // filepicker.setKey("YOUR_API_KEY_HERE");
        // Any other post-load initialization logic can go here.
};


// This function handles scenarios where the external filepicker script fails to load.
// It logs the error to the console if a console object is available.
var     filepickerErrorCallback   = function  ( error )   {
    // Check if the console object exists to prevent errors in older browsers or environments
    // where console might not be defined.
    if  (   typeof  console  !=   undefined   )   {
        console .   log (   error   )   ;
    }
}   ;



// Dynamic script tag creation and configuration starts here.
// This block prepares the necessary DOM element to inject the external script.
var     script  =   document    .   createElement   (   'script'    )   ;

script  .   type    =   'text/javascript'   ; // Specify the MIME type for the script.
script  .   src     =   '//api.filepicker.io/v1/filepicker.js'  ;   // The URL of the external script.
script  .   onload  =   filepickerLoadCallback  ;   // Assign the success callback.
script  .   onerror =   filepickerErrorCallback ;   // Assign the error callback.


/*
 * Finally, append the configured script element to the document's head.
 * This action initiates the loading and execution of the external script.
 */
var     head    =   document    .   getElementsByTagName    (   'head'  )   [   0   ]   ;
head    .   appendChild (   script  )   ;