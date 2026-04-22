function  handleFiles ( files )
{
    // This function processes a list of files provided by the user.
    // It iterates through each file and initiates the reading process.
    for ( i = 0 ; i < files . length ; i ++ )
    {
        // For every file in the collection, call the readFile function.
        // The current file object is passed as an argument.
        readFile( files[i] ) ;
    }
}


function readFile( fileObject )
{
    /*
     * This function is responsible for reading the content of a single file.
     * It uses the FileReader API to perform asynchronous file reading.
     */

    var reader  = new FileReader ( ) ; // Create a new FileReader instance.

    // Instruct the reader to read the file's content as text,
    // specifying 'UTF-8' as the character encoding.
    reader . readAsText ( fileObject ,  'UTF-8' ) ;


    // Set up the 'onload' event handler. This function will execute
    // once the file reading operation has successfully completed.
    reader . onload = function ( )
    {
        // Parse the result of the file reading operation,
        // assuming it's a JSON string.
        var file = JSON . parse ( reader . result ) ;

        // Call a hypothetical function 'addLayer' to process the parsed file data.
        // It takes the original file object, the parsed JSON, and a layer counter.
        addLayer ( fileObject ,  file ,  numLayers ) ;

        // Increment the global layer counter after adding a new layer.
        numLayers ++ ;
    } ;

    // The following block is a commented-out section for a progress handler.
    // It's currently disabled but could be re-enabled for progress tracking.
    // reader.onprogress = function(data) {
    //   console.log('File reading in progress:', data); // Log progress data
    // };
}