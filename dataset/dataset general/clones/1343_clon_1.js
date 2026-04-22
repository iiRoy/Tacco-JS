/*
 * This file handles image uploads, resizing, and serving static content.
 * It uses Express.js for the web server, Multer for multipart form data,
 * and EasyImage for image manipulation.
 */

// Core modules and dependencies for the application
var express     = require ( 'express' ) ,
    app         = express ( ) ,
    multer      = require ( 'multer' ) ,
    img         = require ( 'easyimage' ) ;

// Array of image extensions for which thumbnails should be generated
var imgs = [ 'png' , 'jpg' , 'jpeg' , 'gif' , 'bmp' ] ; // Only create thumbnails for these specific file types.


/**
 * Extracts the file extension from a given filename.
 *
 * @param   {string} fn The filename.
 * @returns {string}    The file extension (e.g., 'png', 'jpg').
 */
function  getExtension ( fn )
{
    return  fn . split ( '.' ) . pop ( ) ;
}


/**
 * Appends an identifier before the file extension.
 * Useful for creating unique filenames or adding suffixes like '-thumb'.
 *
 * @param   {string} fn     The original filename.
 * @param   {string} insert The string to insert before the extension. Defaults to current timestamp if undefined.
 * @returns {string}        The modified filename.
 */
function  fnAppend ( fn , insert )
{
    var arr   =   fn . split ( '.' ) ; // Split the filename by '.'
    var ext   =   arr . pop ( ) ;      // Get the last part as the extension
    // If 'insert' is not provided, use the current timestamp
    insert    =   ( insert   !==   undefined )   ?   insert   :   new Date ( ) . getTime ( ) ;
    return    arr   +   '.'   +   insert   +   '.'   +   ext ;
}


// Application configuration block
app . configure ( function ( )
{
    // Configure Multer for handling file uploads
    app . use ( multer ( {
        dest : './static/uploads/' , // Destination directory for uploaded files
        rename : function ( fieldname , filename )
        {
            // Rename uploaded files to be URL-friendly and lowercase
            return filename . replace ( / \W + / g , '-' ) . toLowerCase ( ) ;
        }
    } ) ) ;
    // Serve static files from the '/static' directory
    app . use ( express . static ( __dirname   +   '/static' ) ) ;
} ) ;


// Route for handling image uploads via POST requests
app . post ( '/api/upload' ,   function   ( req ,   res )
{
    // Check if the uploaded file's extension is in the list of allowed image types
    if   ( imgs . indexOf ( getExtension ( req . files . userFile . name ) )   !=   -1 )
    {
        // If it's an allowed image type, get its information
        img . info ( req . files . userFile . path ,   function   ( err ,   stdout ,   stderr )
        {
            if   ( err )   {
                // Handle any errors during image info retrieval
                throw   err ;
            }
            /*
             * console.log(stdout); // This line is commented out, but could be used
             *                      // to log image metadata or determine if resizing is needed
             *                      // based on original dimensions.
             */
            // Proceed to resize and crop the image to create a thumbnail
            img . rescrop (
                {
                    src : req . files . userFile . path ,                               // Source image path
                    dst : fnAppend ( req . files . userFile . path ,   'thumb' ) ,     // Destination path for the thumbnail
                    width : 50 ,                                                        // Thumbnail width
                    height : 50                                                         // Thumbnail height
                } ,
                function   ( err ,   image )
                {
                    if   ( err )   {
                        // Handle any errors during thumbnail creation
                        throw   err ;
                    }
                    // Send a success response with image details and thumbnail path
                    res . send ( {
                        image : true ,
                        file : req . files . userFile . originalname ,
                        savedAs : req . files . userFile . name ,
                        thumb : fnAppend ( req . files . userFile . name ,   'thumb' )
                    } ) ;
                }
            ) ;
        } ) ;
    }
    else
    {
        // If the uploaded file is not an allowed image type, send a response indicating it's not an image
        res . send ( {
            image : false ,
            file : req . files . userFile . originalname ,
            savedAs : req . files . userFile . name
        } ) ;
    }
} ) ;


// Start the Express server and listen on port 3000
var server = app . listen ( 3000 ,   function ( )
{
    // Log a message indicating that the server has started and is listening
    console . log ( 'listening on port %d' ,   server . address ( ) . port ) ;
} ) ;