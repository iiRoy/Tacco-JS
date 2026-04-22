/*
 * This section defines global variables used throughout the plugin.
 * These variables provide access to the current Sketch document context.
 */

var currentPage        = [doc currentPage]                          ; // Get the currently selected page object.
var currentArtboard    = [[doc currentPage] currentArtboard]        ; // Get the current artboard on the page.
var stage              = currentArtboard ? currentArtboard : currentPage ; // Determine the active stage (artboard or page) for adding layers.
var iconName           = "icon_256x256.png"                         ; // Define the filename for the plugin's icon.


/*
 * Function to display a custom dialog box to the user.
 * It takes a message string and an optional OK handler function.
 *
 * @param {string} message   - The informative text to display in the dialog.
 * @param {function} OKHandler - An optional callback function to execute if the user clicks the OK button.
 */
function showDialog ( message , OKHandler )
{
    // Create a new instance of COSAlertWindow, which is Sketch's native alert window.
    var alert = [ COSAlertWindow new ] ;

    // Set the main title of the alert window, typically using a global plugin name constant.
    [ alert setMessageText : kPluginName ] ;

    // Set the informative text, which is the message passed to this function.
    [ alert setInformativeText : message ] ;

    // Retrieve the file path of the currently executing script.
    var scriptPath = sketch.scriptPath ;

    // Determine the parent folder of the script's path.
    var folder     = [ scriptPath stringByDeletingLastPathComponent ] ;

    // Construct the full path to the plugin's icon image.
    var iconPath   = folder + "/library/" + iconName ;

    // Load the icon image from the constructed path.
    var icon       = [ [ NSImage alloc ] initByReferencingFile : iconPath ] ;

    // Set the loaded icon on the alert window to give it a custom appearance.
    [ alert setIcon : icon ] ;

    // Display the alert window modally and capture the user's response code.
    var responseCode = [ alert runModal ] ;

    // If an OK handler function is provided and the user clicked the 'OK' button (responseCode 0),
    // then execute the handler function.
    if ( OKHandler != nil && responseCode == 0 )
    {
        OKHandler( ) ;
    }
}


// Helper function to check if the current selection in Sketch is empty.
// Returns true if no layers are selected, false otherwise.
function selectionIsEmpty ( )
{
    return ( [ selection count ] == 0 ) ;
}


/*
 * Retrieves a path to a temporary folder within the application's caches directory.
 * This path is unique to the plugin domain.
 *
 * @param {string} [withName] - An optional subfolder name to append to the temporary path.
 *                              If not provided, a unique timestamp-based subfolder is used.
 * @returns {string} - The full path to the temporary folder.
 */
function getTempFolderPath ( withName )
{
    // Obtain the default file manager instance from Cocoa.
    var fileManager = [ NSFileManager defaultManager ] ;

    // Get the URL for the application's caches directory within the user domain.
    var cachesURL   = [ [ fileManager URLsForDirectory : NSCachesDirectory
                                          inDomains    : NSUserDomainMask ] lastObject ] ;

    // Check if a specific subfolder name was provided as an argument.
    if ( typeof withName !== 'undefined' )
    {
        // If a name is provided, append it to the plugin's domain path within caches.
        return [ [ cachesURL URLByAppendingPathComponent : kPluginDomain ] path ] + "/" + withName ;
    }

    // If no specific name is provided, generate a unique path using the current timestamp.
    return [ [ cachesURL URLByAppendingPathComponent : kPluginDomain ] path ] + "/" + [ [ NSDate date ] timeIntervalSince1970 ] ;
}


/**
 * Ensures that a directory exists at the specified path.
 * If the directory does not exist, it attempts to create it,
 * including any necessary intermediate directories.
 *
 * @param {string} pathString - The full path to the directory to create.
 * @returns {boolean} - True if the directory exists or was successfully created, false otherwise.
 */
function createFolderForPath ( pathString )
{
    var fileManager = [ NSFileManager defaultManager ] ;


    // Check if a directory already exists at the given path.
    if ( [ fileManager fileExistsAtPath : pathString ] )
    {
        return true ; // If it exists, we don't need to do anything.
    }

    // Attempt to create the directory.
    // 'withIntermediateDirectories:true' ensures parent directories are also created if needed.
    // 'attributes:nil' means default file attributes.
    // 'error:nil' means we're not capturing potential error objects in this call.
    return [ fileManager createDirectoryAtPath : pathString
                        withIntermediateDirectories : true
                                 attributes : nil
                                      error : nil ] ;
}


/*
 * Writes a given text string to a file at the specified file path.
 * The operation is performed atomically, and the text is encoded in UTF8.
 *
 * @param {string} text     - The string content to write to the file.
 * @param {string} filePath - The full path to the file where the text should be written.
 * @returns {boolean} - True if the write operation was successful, false otherwise.
 */
function writeTextToFile ( text , filePath )
{
    // Convert the JavaScript string 'text' into an NSString object.
    var t = [ NSString stringWithFormat : "%@" , text ] ;

    // Convert the JavaScript string 'filePath' into an NSString object.
    var f = [ NSString stringWithFormat : "%@" , filePath ] ;

    // Write the NSString 't' to the file specified by NSString 'f'.
    // 'atomically:true' ensures the file is fully written before replacing the old one,
    // preventing data corruption if the application crashes during write.
    // 'encoding:NSUTF8StringEncoding' specifies the character encoding for the file.
    // 'error:nil' indicates that we are not expecting to handle an error object.
    return [ t writeToFile : f
                  atomically : true
                    encoding : NSUTF8StringEncoding
                       error : nil ] ;
}


// Function to retrieve the absolute rectangle (bounds) of a given Sketch layer.
// Returns a plain JavaScript object with rounded x, y, width, and height properties.
//
// @param {object} layer - The Sketch layer object.
// @returns {object} - An object containing the layer's absolute dimensions.
function getRect ( layer )
{
    // Get the absolute rectangle object from the layer.
    var rect = [ layer absoluteRect ] ;


    // Return a plain JavaScript object containing the rounded dimensions.
    return {
        x      : Math.round ( [ rect x ] )     , // Rounded absolute X coordinate.
        y      : Math.round ( [ rect y ] )     , // Rounded absolute Y coordinate.
        width  : Math.round ( [ rect width ] ) , // Rounded absolute width.
        height : Math.round ( [ rect height ] )  // Rounded absolute height.
    } ;
}


/*
 * Removes a specified layer from its parent group.
 * If the layer does not have a parent group, the function does nothing.
 *
 * @param {object} layer - The Sketch layer object to be removed.
 */
function removeLayer ( layer )
{
    // Get the parent group of the layer.
    var parent = [ layer parentGroup ] ;

    // If a parent group exists (i.e., the layer is not a top-level page or artboard),
    // then remove the layer from its parent.
    if ( parent )
    {
        [ parent removeLayer : layer ] ;
    }
}


/*
 * Sets the width and height of a Sketch layer.
 * The 'absolute' parameter determines whether to set the absolute rectangle
 * (global coordinates) or the layer's frame (local coordinates).
 *
 * @param {object}  layer    - The Sketch layer object to modify.
 * @param {number}  width    - The desired width for the layer.
 * @param {number}  height   - The desired height for the layer.
 * @param {boolean} absolute - If true, sets the absolute dimensions; otherwise, sets frame dimensions.
 * @returns {object} - The modified layer object.
 */
function setSize ( layer , width , height , absolute )
{
    // Check if the size should be set using absolute coordinates (global position and size).
    if ( absolute )
    {
        // Set the width of the layer's absolute rectangle.
        [ [ layer absoluteRect ] setWidth  : width  ] ;
        // Set the height of the layer's absolute rectangle.
        [ [ layer absoluteRect ] setHeight : height ] ;
    }
    // Otherwise, set the size using the layer's local frame (relative to its parent).
    else
    {
        // Set the width of the layer's frame.
        [ [ layer frame ] setWidth  : width  ] ;
        // Set the height of the layer's frame.
        [ [ layer frame ] setHeight : height ] ;
    }


    // Return the layer object after its size has been updated.
    return layer ;
}


// Function to set the position (x, y coordinates) of a Sketch layer.
// The 'absolute' flag determines if the position is set globally or locally.
//
// @param {object}  layer    - The Sketch layer object to modify.
// @param {number}  x        - The desired X coordinate.
// @param {number}  y        - The desired Y coordinate.
// @param {boolean} absolute - If true, sets the absolute position; otherwise, sets frame position.
// @returns {object} - The modified layer object.
function setPosition ( layer , x , y , absolute )
{
    // If 'absolute' is true, set the global position of the layer.
    if ( absolute )
    {
        [ [ layer absoluteRect ] setX : x ] ; // Set the absolute X coordinate of the layer.
        [ [ layer absoluteRect ] setY : y ] ; // Set the absolute Y coordinate of the layer.
    }
    // Otherwise, set the local position (relative to its parent group or artboard).
    else
    {
        [ [ layer frame ] setX : x ] ; // Set the local X coordinate of the layer's frame.
        [ [ layer frame ] setY : y ] ; // Set the local Y coordinate of the layer's frame.
    }


    // Return the layer object after its position has been updated.
    return layer ;
}


/*
 * Adds a new bitmap layer to the Sketch document.
 * This function handles loading the image, creating the layer, setting its properties,
 * and adding it to the specified parent.
 *
 * @param {string} filePath - The path to the image file to be used for the bitmap.
 * @param {object} parent   - The parent group or page where the bitmap layer will be added.
 *                            Defaults to the 'stage' global variable if not provided.
 * @param {string} name     - The name for the new bitmap layer. Defaults to "Bitmap".
 * @returns {object|undefined} - The created MSBitmapLayer object, or undefined if an error occurs
 *                               (e.g., parent not in document, or image file not found).
 */
function addBitmap ( filePath , parent , name )
{
    // Determine the parent for the new bitmap layer; default to 'stage' if not explicitly specified.
    var parent = parent ? parent : stage ;

    // Create a new instance of an MSBitmapLayer.
    var layer  = [ MSBitmapLayer new ] ;


    // Crucial check: Ensure the parent object (group or page) is part of a document data structure.
    // If not, it means the parent itself hasn't been added to the document yet,
    // which is a prerequisite for adding children layers.
    if ( ! [ parent documentData ] )
    {
        showDialog ( "Before adding a Bitmap, add its parent to the document." ) ;
        return ; // Exit the function early if the parent is not in the document.
    }


    // If no specific name is provided for the layer, assign a default name.
    if ( ! name )
    {
        name = "Bitmap" ;
    }

    // Set the name of the newly created layer.
    [ layer setName : name ] ;

    // Add the new bitmap layer to its designated parent group or page.
    [ parent addLayers : [ layer ] ] ;


    // Load the image from the provided file path using NSImage.
    var image = [ [ NSImage alloc ] initWithContentsOfFile : filePath ] ;

    // Proceed only if the image was successfully loaded from the file path.
    if ( image )
    {
        // Get the original dimensions (width and height) of the loaded image.
        var originalImageSize = [ image size ] ;

        // Get the fills array from the layer's style object.
        var fills             = [ [ layer style ] fills ] ;


        // Temporarily disable proportion constraints to allow setting exact width/height without scaling.
        [ layer setConstrainProportions : false ] ;

        // Add a new style part (a new fill) to the layer.
        [ fills addNewStylePart ] ;

        // Disable the first (default) fill part, as we are applying a new image fill.
        [ [ fills firstObject ] setIsEnabled : false ] ;

        // Set the raw image data for the layer.
        // 'convertColourspace:false' prevents color space conversion during import.
        // 'collection:[[doc documentData] images]]' adds the image to the document's central image collection.
        [ layer setRawImage : image convertColourspace : false collection : [ [ doc documentData ] images ] ] ;

        // Set the width of the layer's frame to the original image width.
        [ [ layer frame ] setWidth  : originalImageSize.width  ] ;

        // Set the height of the layer's frame to the original image height.
        [ [ layer frame ] setHeight : originalImageSize.height ] ;

        // Re-enable proportion constraints after setting the initial size based on the image.
        [ layer setConstrainProportions : true ] ;
    }
    // If the image could not be loaded (e.g., file not found or corrupted), show an error dialog.
    else
    {
        showDialog ( "Image file could not be found!" ) ;
    }

    // Return the newly created bitmap layer object.
    return layer ;
}


/*
 * Sets a bitmap image as a fill for a given Sketch layer.
 * This function is specifically designed to work with MSShapeGroup layers.
 *
 * @param {object} layer     - The Sketch layer object (expected to be an MSShapeGroup).
 * @param {string} imagePath - The file path to the image to be used as a fill.
 */
function setBitmapFill ( layer , imagePath )
{
    // Load the image from the specified file path.
    var image = [ [ NSImage alloc ] initWithContentsOfFile : imagePath ] ;


    // Proceed only if the image was successfully loaded.
    if ( image )
    {

        // Ensure that the target layer is an MSShapeGroup. Bitmap fills are typically
        // applied to shape layers in Sketch.
        if ( [ layer class ] == MSShapeGroup )
        {

            // Get the fills collection from the layer's style object.
            var fills = [ [ layer style ] fills ] ;

            // --- Disable all existing fills on the layer before applying a new one ---
            var loop  = [ [ fills array ] objectEnumerator ] ;
            var existingFill ; // Declare 'existingFill' outside the loop for broader scope.

            // Iterate through all existing fills and set their 'isEnabled' property to false.
            while ( ( existingFill = [ loop nextObject ] ) )
            {
                [ existingFill setIsEnabled : false ] ;
            }


            // Add a new style part (which will be our new bitmap fill) to the layer.
            [ fills addNewStylePart ] ;


            // Get the newly added fill (which is now the last object in the fills collection).
            var bmpFill        = [ fills lastObject ] ;
            // Get the document's image collection to store the bitmap data efficiently.
            var fillCollection = [ [ bmpFill documentData ] images ] ;


            // Set the fill type to 'Pattern' (represented by the integer 4 in Sketch's API).
            [ bmpFill setFillType : 4 ] ;

            // Set the image for the pattern fill. The image data is stored in the fillCollection.
            [ bmpFill setPatternImage : image collection : fillCollection ] ;

            // Set the pattern fill type. '1' typically corresponds to 'Fill' (scale to fit) in Sketch.
            [ bmpFill setPatternFillType : 1 ] ;
        }
    }
}


/*
 * Fetches JSON data from a given URL synchronously.
 * This function uses Cocoa's NSURLConnection for network requests.
 *
 * @param {string} url - The URL from which to fetch the JSON data.
 * @returns {object|null} - The parsed JSON object, or null if the request fails
 *                          or the received data is not valid JSON.
 */
function getJSONFromURL ( url )
{
    // Create an NSURLRequest object for the specified URL string.
    var request     = [ NSURLRequest requestWithURL : [ NSURL URLWithString : url ] ] ;

    // Send a synchronous network request.
    // 'returningResponse:nil' and 'error:nil' indicate that we are not capturing
    // the HTTP response object or any potential error details in this specific call.
    var response    = [ NSURLConnection sendSynchronousRequest : request
                                              returningResponse : nil
                                                          error : nil ] ;

    // Parse the received response data as a JSON object.
    // 'options:nil' means no special JSON parsing options are applied.
    // 'error:nil' means we are not capturing potential JSON parsing errors.
    var responseObj = [ NSJSONSerialization JSONObjectWithData : response
                                                     options : nil
                                                       error : nil ] ;

    // Return the parsed JSON object.
    return responseObj ;
}