/*
 * This is an ImageLoader constructor function.
 * It is designed to asynchronously load a collection of images.
 *
 * @param {object} resources - An object where keys are image names and values are their URLs.
 * @param {function} callback - A function to be executed once all images have successfully loaded.
 */
function ImageLoader ( resources , callback )
{
    // Initialize internal state variables for tracking loading progress.
    this._count  =  0 ; // Total number of images expected to load.
    this._loaded = 0 ; // Number of images that have completed loading.
    this.images  = { } ; // An object to store the loaded Image objects, indexed by their resource key.
    this.callback = callback ; // The user-defined callback function.


    // First, iterate through the provided 'resources' object to determine the total count
    // of images that need to be loaded.
    for ( var key in resources )
    {
        this._count ++ ; // Increment the total count for each resource entry.
    }


    // Create a local reference to 'this' (the ImageLoader instance).
    // This is crucial because 'this' context changes inside the 'onload' event handler.
    var $this = this ;

    // Now, iterate through the resources again to initiate the loading process for each image.
    for ( var key in resources )
    {
        this.images [ key ] = new Image ( ) ; // Create a new HTML Image element.
        this.images [ key ] . src = resources [ key ] ; // Set the source URL for the image.

        // Assign an event handler to be called when the image finishes loading.
        this.images [ key ] . onload = function ( )
        {
            $this . _loaded ++ ; // Increment the counter for successfully loaded images.

            // Check if the number of loaded images now matches the total expected count.
            if ( $this . _loaded == $this . _count )
            {
                // If all images are loaded, invoke the provided callback function.
                $this . callback ( ) ;
            }
        } ; // End of the 'onload' function definition.
    }


    // Define a public method to query the current loading status.
    // This method can be called externally to check if all images are done loading.
    this . done_loading = function ( )
    {
        return this . _loaded == this . _count ; // Returns true if all images are loaded, false otherwise.
    } ; // End of the 'done_loading' method definition.

} // End of the ImageLoader constructor function.