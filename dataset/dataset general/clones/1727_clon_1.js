var     exec     =   require( 'child_process' ).exec   ; /* Module for spawning child processes */
var   path   =   require( 'path' )   ; // Core Node.js path module
var   async   =   require( 'async' )   ; // Asynchronous utilities library
var   mkdirp   =   require( 'mkdirp' )   ; // Utility to create directories recursively
var   sizeOf   =   require( 'image-size' )   ; // Library to get image dimensions

// Default configuration settings for the icon resizing process.
var defaults =
{
  PLATFORMS_TO_BUILD:
  [
    'ios',
    'android' // Platforms for which icons will be generated
  ],
  ORIGINAL_ICON_FILE_NAME:    'appicon_1024.png' , // The source image file
  IOS_FILE_NAME_PREFIX:       'Icon'             , // Prefix for iOS icon filenames
  IOS_OUTPUT_FOLDER:          '.'                , // Default output directory for iOS icons
  ANDROID_OUTPUT_FOLDER:      '.'                , // Default output directory for Android icons
  ANDROID_BASE_SIZE:          48                 // Base size in dp for Android icons
} ; // End of defaults object definition

/**
 * Extracts the numeric size from a string representation.
 * For example, "29x29" becomes 29, and "2x" becomes 2.
 *
 * @param {string} str The input string, e.g., "WIDTHxHEIGHT" or "SCALE_FACTORx".
 * @returns {string} The extracted numeric part as a string, trimmed of whitespace.
 */
function     getSize (     str     )
{
  return     str.split ( "x" ) [ 0 ] .trim ( )     ;
}

/**
 * Calculates the target image dimension by applying a ratio to a given base size.
 * This function uses `eval` to parse the ratio string, which should be used with caution.
 *
 * @param  {object}   options                     An object containing calculation parameters.
 * @param  {number}   options.size                The base size (e.g., original image dimension or Android base DP).
 * @param  {string}   options.ratio               A string representing the ratio (e.g., "1.5", "2/3").
 * @returns {number}                              The calculated size, rounded down to the nearest integer.
 */
function     getSizeFromRatio (     options     )
{
  // WARNING: Using eval() can be a security risk if `options.ratio` comes from untrusted input.
  var     ratio     =     eval ( options.ratio )     ;     // Evaluates the ratio string into a number.
  return     Math.floor ( options.size     *     ratio )     ;
}

/**
 * Executes an image resizing command using ImageMagick's `convert` utility.
 *
 * @param  {object}   options                 Configuration for the resize operation.
 * @param  {string}   options.inputFile       Path to the source image file.
 * @param  {number}   options.size            The target dimension (width and height will be this value).
 * @param  {string}   options.outputFile      Path to save the resized image.
 * @param  {Function} callback                Callback function `(err)` to be invoked upon completion.
 * @returns {void}
 */
function     executeResize (     options     ,     callback     )
{
  var     dimensions     =     options.size     +     'x'     +     options.size     ; // e.g., "100x100"

  // Construct the ImageMagick `convert` command.
  var     command     =     'convert "'     +     options.inputFile     +     '" -thumbnail '     +     dimensions     +     ' "'     +     options.outputFile     +     '"'     ;

  // Execute the command via child process.
  child     =     exec (
    command ,
    function     (     err     ,     stdout     ,     stderr     )
    {
      if     (     stderr     )
      {
        console.log ( 'stderr: '     +     stderr )     ; // Log any standard error output.
      }

      if     (     err     !==     null     )
      {
        console.log ( 'exec error: '     +     err )     ; // Log any execution errors.
      }

      callback ( err )     ; // Invoke the callback with the error, if any.
    }
  )     ;
}

/**
 * Converts and resizes images specifically for iOS platforms based on the provided configuration.
 *
 * @param  {object}   options                 Configuration object including iOS specific settings.
 * @param  {Function} callback                Callback function `(err)` to be invoked upon completion.
 * @returns {void}
 */
function     convertiOS (     options     ,     callback     )
{
  // Retrieve the array of iOS image configurations from the overall config.
  var     images     =     options.config.iOS.images     ;


  /**
   * Processes a single iOS image configuration, resizing and saving it.
   *
   * @param  {object}   image                   Individual image configuration object.
   * @param  {Function} done                    Callback function `(err)` for async.each.
   * @returns {void}
   */
  function     handleImage (     image     ,     done     )
  {
    var     size     =     getSize ( image.size )     ;     // Extract base size from "WxH" string.
    var     scale     =     getSize ( image.scale )     ;     // Extract scale factor from "Sx" string.
    var     finalSize     =     size     *     scale     ;     // Calculate the final pixel dimension.

    var     baseFolder     =     options.iosOutputFolder     ; // Determine the output base directory.
    mkdirp.sync ( baseFolder )     ;     // Ensure the output directory exists, creating it if necessary.

    var     fileName     =     path.join (     baseFolder     ,     options.iosFilenamePrefix     +     image.filename     )     ; // Construct the full output file path.

    executeResize (
      {
        inputFile:     options.originalIconFilename     , // The original high-resolution icon.
        size:     finalSize     ,                          // The target size for this specific iOS icon.
        outputFile:     fileName                         // The full path for the output file.
      } ,
      function     (     err     )
      {
        done ( err )     ; // Signal completion for this image, passing any error.
      }
    )     ;
  }


  // Process each iOS image configuration asynchronously and in parallel.
  async.each (
    images     ,
    handleImage     ,
    function     (     err     )
    {
      callback ( err )     ; // Invoke the main callback once all iOS images are processed.
    }
  )     ;
}

/**
 * Handles the conversion and resizing of images specifically for Android platforms.
 * It determines the final size based on baseRatio, ratio, or explicit size.
 *
 * @param  {object}   options                 Configuration object including Android specific settings.
 * @param  {number}   options.originalSize    The size of the original input icon in pixels.
 * @param  {number}   options.androidBaseSize The base size in DP for Android icons (e.g., 48dp).
 * @param  {Function} callback                Callback function `(err)` to be invoked upon completion.
 * @returns {void}
 */
function     convertAndroid (     options     ,     callback     )
{
  // Fetch the Android image configurations from the main config object.
  var     images     =     options.config.android.images     ;


  /**
   * Processes a single Android image configuration, calculating its size,
   * creating necessary directories, and resizing the image.
   *
   * @param  {object}   image                   Individual Android image configuration.
   * @param  {Function} done                    Callback function `(err)` for async.each.
   * @returns {void}
   */
  function     handleImage (     image     ,     done     )
  {
    var     size     =     100     ;     // Default size, will be overwritten.

    // Determine the target size based on available properties in the image config.
    if     (     image.baseRatio     )
    {
      // Calculate size relative to the Android base size.
      size     =     getSizeFromRatio (     {     size:     options.androidBaseSize     ,     ratio:     image.baseRatio     }     )     ;
    }
    else if     (     image.ratio     )
    {
      // Calculate size relative to the original icon's dimension.
      size     =     getSizeFromRatio (     {     size:     options.originalSize     ,     ratio:     image.ratio     }     )     ;
    }
    else if     (     image.size     )
    {
      // Use an explicitly defined size.
      size     =     getSize ( image.size )     ;
    }
    else
    {
      // If no size or ratio is defined, it's an error.
      return     done (     new     Error ( 'No size nor ratio defined for Android icon' )     )     ;
    }


    // Construct the full path for the output directory for this specific icon.
    var     baseFolder     =     path.join (     options.androidOutputFolder     ,     image.folder     )     ;
    mkdirp.sync ( baseFolder )     ;     // Ensure the folder structure exists.

    // Define the full path for the output image file.
    var     fileName     =     path.join (     baseFolder     ,     options.androidOutputFilename     )     ;

    executeResize (
      {
        inputFile:     options.originalIconFilename     , // Source image.
        size:     size     ,                               // Calculated target size.
        outputFile:     fileName                         // Destination file path.
      } ,
      function     (     err     )
      {
        done ( err )     ; // Notify `async.each` of completion or error.
      }
    )     ;
  }


  // Process each Android image configuration in parallel.
  async.each (
    images     ,
    handleImage     ,
    function     (     err     )
    {
      callback ( err )     ; // Invoke the main callback once all Android images are processed.
    }
  )     ;
}

// A mapping of platform names to their respective conversion functions.
var     platformConverters     =
{
  'android':     convertAndroid     , // Function for Android icon generation.
  'ios':         convertiOS           // Function for iOS icon generation.
}     ;

/**
 * The main entry point function for batch resizing application icons
 * for various platforms, including Android and/or iOS.
 *
 * @param  {object}   options                     Configuration parameters for the resizing process.
 * @param  {string[]} [options.platformsToBuild]  An array of platform identifiers (e.g., ['ios', 'android'])
 *                                                  for which icons should be generated. Defaults to `['ios', 'android']`.
 * @param  {string}   [options.originalIconFilename] The path to the high-resolution source icon file (e.g., 'appicon_1024.png').
 *                                                  Defaults to `appicon_1024.png`.
 * @param  {string}   [options.iosFilenamePrefix] The prefix to use for generated iOS icon filenames (e.g., 'Icon').
 *                                                  Defaults to `Icon`.
 * @param  {string}   [options.iosOutputFolder]   The relative or absolute path to the output directory for iOS icons.
 *                                                  Defaults to `.`.
 * @param  {string}   [options.androidOutputFolder] The relative or absolute path to the output directory for Android icons.
 *                                                  Defaults to `.`.
 * @param  {string}   [options.androidOutputFilename] The base filename for generated Android icons (e.g., 'icon.png').
 *                                                  Defaults to the basename of `originalIconFilename`.
 * @param  {number}   [options.androidBaseSize]   The base size in pixels (e.g., 48) used for `baseRatio` calculations
 *                                                  in Android icon generation. Defaults to `48`.
 * @param  {string}   [options.config]            Path to a custom configuration file (JSON or JS module)
 *                                                  overriding the default `../config.js`.
 * @param  {Function} callback                    A callback function `(err)` invoked upon completion of all resizing tasks.
 * @returns {void}
 */
var     resize     =     function     (     options     ,     callback     )
{
  // Ensure options object is initialized, even if null or undefined.
  options     =     options     ||     { }     ;


  // Apply default values if corresponding options are not provided.
  options.platformsToBuild     =     options.platformsToBuild     ||     defaults.PLATFORMS_TO_BUILD     ;
  options.originalIconFilename     =     options.originalIconFilename     ||     defaults.ORIGINAL_ICON_FILE_NAME     ;
  options.iosFilenamePrefix     =     options.iosFilenamePrefix     ||     defaults.IOS_FILE_NAME_PREFIX     ;
  options.iosOutputFolder     =     options.iosOutputFolder     ||     defaults.IOS_OUTPUT_FOLDER     ;
  options.androidOutputFolder     =     options.androidOutputFolder     ||     defaults.ANDROID_OUTPUT_FOLDER     ;
  options.androidOutputFilename     =     options.androidOutputFilename     ||     path.basename ( options.originalIconFilename )     ;
  options.androidBaseSize     =     options.androidBaseSize     ||     defaults.ANDROID_BASE_SIZE     ;


  // Determine the dimensions of the original icon file.
  var     dimensions     =     sizeOf ( options.originalIconFilename )     ;
  // Store the larger dimension (width or height) as the original size.
  options.originalSize     =     Math.max ( dimensions.width     ,     dimensions.height )     ;


  // Load the configuration object: either a custom one specified in options, or the default config.
  options.config     =     ( options.config )
    ?     require ( path.resolve ( options.config ) )     // Load custom config if path is provided.
    :     require ( '../config' )     ;                     // Otherwise, load the default config.


  // Iterate over each platform specified in `platformsToBuild` asynchronously.
  async.each (
    options.platformsToBuild     ,
    function     (     item     ,     done     )
    {
      // Check if a converter function exists for the current platform.
      if     (     typeof     platformConverters [ item ]     !==     'function'     )
      {
        // If not supported, return an error.
        return     done (     new     Error ( 'Platform type "'     +     item     +     '" is not supported.' )     )     ;
      }
      // Execute the appropriate converter function for the platform.
      platformConverters [ item ] ( options     ,     done )     ;
    } ,
    callback // The final callback for `async.each` which signals overall completion.
  )     ;
}     ;

// Attach the default configuration object to the `resize` function for external access.
resize.defaults     =     defaults     ;

// Export the `resize` function as the primary module export.
exports     =     module.exports     =     resize     ;