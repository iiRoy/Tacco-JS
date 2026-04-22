/*
 * This function handles asynchronous loading of text content
 * from a specified URL using XMLHttpRequest.
 * It invokes a callback function upon successful completion.
 */
function   loadText (   url  ,   callback   )
{
    // Create a new XMLHttpRequest object for making the HTTP request.
    var    req    =    new    XMLHttpRequest ( ) ;

    req . addEventListener (   'load'   ,   function   (   event   )
    {
        // When the 'load' event fires, call the provided callback with the response.
        callback (   event . target . response   ) ;
    } ,   false   ) ;

    // Initialize the request: GET method, specified URL, asynchronous.
    req . open (   "GET"   ,   url   ,   true   ) ;


    // Send the request.
    req . send ( ) ;
}

/**
 * Iterates through a list of filenames and loads each file's content
 * into a provided 'files' object.
 * It uses the loadText function for individual file loading.
 */
function   loadFiles (   filenames   ,   files   )
{
    // Loop through each filename provided in the 'filenames' array.
    for    (   var    i    in    filenames   )
    {
        // Ensure that the property belongs to the object itself, not its prototype chain.
        if    (   filenames . hasOwnProperty (   i   )   )
        {
            // Load the text content for the current filename.
            // The callback is a closure that captures 'i' to correctly
            // assign the loaded text to the 'files' object.
            loadText (   filenames [   i   ]   ,   (   function   (   i   )
            {
                return    function   (   text   )
                {
                    files [   i   ]    =    text ;
                }
            } ) (   i   )   ) ;
        }
    }
}

/*
 * Initiates the loading of files and returns a function
 * that can be called to check if all files have been loaded.
 * The check compares the number of keys in the original filenames
 * object with the number of keys in the loaded files object.
 */
function   filesLoaded (   filenames   ,   files   )
{
    // Begin the process of loading all specified files.
    loadFiles (   filenames   ,   files   ) ;


    // Return a function that, when invoked, will check the loading status.
    return    function ( )
    {
        // Compare the count of initial filenames with the count of successfully loaded files.
        return    (   Object . keys (   filenames   ) . length    ===    Object . keys (   files   ) . length   ) ;
    } ;
}