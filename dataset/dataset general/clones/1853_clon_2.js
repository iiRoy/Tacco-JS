const GraphicModule = require ( 'canvas' );

const PictureObject = GraphicModule . Image;
const filesystemUtil = require ( 'fs' );

let taskCompletionCount = 0; // Initialize a counter for async operations

// Retrieve the initial source file path from command line arguments
const primarySourceFile = process . argv [ 2 ];

// Construct a base identifier for output files, based on the input file's name
const baseOutputIdentifier = __dirname + '/' + primarySourceFile . split ( '.' ) [ 0 ];

/**
 * Scales down an image and saves it to a new file.
 * @param {string} inputPath      Path to the source image file.
 * @param {string} outputPath     Path where the scaled image will be saved.
 * @param {number} divisorFactor  Factor by which to divide resolution (e.g., 2 for half, 4 for quarter).
 * @param {Function} onComplete   Callback function to execute upon completion.
 */
function reduceImageDimensions ( inputPath , outputPath , divisorFactor , onComplete ) {
  // Create a new image instance for loading the source picture.
  const sourceImage = new PictureObject ( ) ;

  // Set up error handling for image loading.
  sourceImage . onerror = function ( errorEvent ) {
    console . error ( `Image loading error for ${ inputPath } :` , errorEvent ) ;
    throw errorEvent ;
  }; // End of onerror handler

  // Define the onload event handler for the image.
  sourceImage . onload = function ( ) {
    // Calculate new dimensions based on the original image and the divisor factor.
    const scaledWidth = Math . floor ( sourceImage . width / divisorFactor ) ;
    const scaledHeight = Math . floor ( sourceImage . height / divisorFactor ) ;

    // Create a new canvas with the calculated scaled dimensions.
    const targetCanvas = new GraphicModule ( scaledWidth , scaledHeight ) ;
    const drawingContext = targetCanvas . getContext ( '2d' ) ;

    // Draw the original image onto the new canvas, scaled to fit.
    drawingContext . drawImage ( sourceImage , 0 , 0 , scaledWidth , scaledHeight ) ;

    // Set up a writable stream for the output file.
    const outputFileStream = filesystemUtil . createWriteStream ( outputPath ) ;

    // Create a JPEG stream from the canvas content.
    const jpegEncoderStream = targetCanvas . createJPEGStream ( {
      bufsize : 2048 , // Buffer size for encoding.
      quality : 80   // JPEG quality percentage.
    } ) ;

    // Attach a 'close' event listener to the output stream.
    outputFileStream . on ( 'close' , function ( ) {
      if ( onComplete ) {
        onComplete ( ) ; // Invoke the completion callback if provided.
      }
    } ) ; // End of 'close' event handler

    // Pipe the JPEG data from the encoder stream to the output file stream.
    jpegEncoderStream . pipe ( outputFileStream ) ;
  } ; // End of onload handler

  // Set the source of the image to start loading.
  sourceImage . src = inputPath ;
} // End of reduceImageDimensions function

/**
 * Generates a difference JPEG image between two source images.
 * It's assumed the first image (highResSource) is the higher resolution one,
 * and the second (lowResSource) is the lower resolution, for comparison purposes.
 * The output image will represent the pixel-level differences.
 *
 * @param {string} highResSource      Path to the first (e.g., higher resolution) image.
 * @param {string} lowResSource       Path to the second (e.g., lower resolution) image.
 * @param {string} deltaOutputPath    Path where the difference image will be saved.
 * @param {Function} onDeltaGenerated Callback function to invoke after the diff image is created.
 */
function calculateImageDelta ( highResSource , lowResSource , deltaOutputPath , onDeltaGenerated ) {
  const firstImageObj = new PictureObject ( ) ; // Instance for the first image
  const secondImageObj = new PictureObject ( ) ; // Instance for the second image

  // Define error handlers for both image loading operations.
  firstImageObj . onerror = function ( loadingError ) {
    console . error ( `Error loading first image (${ highResSource }):` , loadingError ) ;
    throw loadingError ;
  } ;
  secondImageObj . onerror = function ( loadingError ) {
    console . error ( `Error loading second image (${ lowResSource }):` , loadingError ) ;
    throw loadingError ;
  } ;

  // First image onload handler: this initiates the process.
  firstImageObj . onload = function ( ) {
    // Get dimensions from the first image; assume they are consistent for both.
    const imageWidth = firstImageObj . width ;
    const imageHeight = firstImageObj . height ;

    // Create a canvas for processing.
    const processingCanvas = new GraphicModule ( imageWidth , imageHeight ) ;
    const renderPlane = processingCanvas . getContext ( '2d' ) ;

    // Draw the first image onto the canvas and extract its pixel data.
    renderPlane . drawImage ( firstImageObj , 0 , 0 , imageWidth , imageHeight ) ;
    const highResPixels = renderPlane . getImageData ( 0 , 0 , imageWidth , imageHeight ) ;

    // Second image onload handler: this runs after the first image is loaded.
    secondImageObj . onload = function ( ) {
      // Draw the second image onto the same canvas and extract its pixel data.
      renderPlane . drawImage ( secondImageObj , 0 , 0 , imageWidth , imageHeight ) ;
      const lowResPixels = renderPlane . getImageData ( 0 , 0 , imageWidth , imageHeight ) ;

      // Iterate through pixels to compute the difference.
      // The difference is leveled around 127 and clamped between 0-255.
      // Alpha channel (index 3) is ignored.
      for ( let pixelLoopIndex = 0 ; pixelLoopIndex < imageWidth * imageHeight ; pixelLoopIndex ++ ) {
        for ( let colorChannelIndex = 0 ; colorChannelIndex < 3 ; colorChannelIndex ++ ) {
          const pixelOffset = 4 * pixelLoopIndex + colorChannelIndex ;
          const diffValue = ( highResPixels . data [ pixelOffset ] - lowResPixels . data [ pixelOffset ] ) + 127 ;
          highResPixels . data [ pixelOffset ] = Math . min ( 255 , Math . max ( 0 , diffValue ) ) ;
        }
      }

      // Put the modified pixel data (the difference) back onto the canvas.
      renderPlane . putImageData ( highResPixels , 0 , 0 ) ;

      // Prepare to save the difference image.
      const diffOutputStream = filesystemUtil . createWriteStream ( deltaOutputPath ) ;
      const diffJpegStream = processingCanvas . createJPEGStream ( {
        bufsize : 2048 , // Buffer size for JPEG encoding
        quality : 80     // Output JPEG quality
      } ) ;

      // When the output file stream closes, invoke the completion callback.
      diffOutputStream . on ( 'close' , function ( ) {
        if ( onDeltaGenerated ) {
          onDeltaGenerated ( ) ;
        }
      } ) ;

      // Pipe the encoded JPEG data to the output file.
      diffJpegStream . pipe ( diffOutputStream ) ;
    } ; // End of secondImageObj.onload

    // Start loading the second image.
    secondImageObj . src = lowResSource ;
  } ; // End of firstImageObj.onload

  // Start loading the first image.
  firstImageObj . src = highResSource ;
} // End of calculateImageDelta function

/**
 * Decodes an image by applying a difference image to a base image.
 * This effectively reconstructs an image that was previously encoded as a difference.
 *
 * @param {string} baseImagePath    Path to the base image.
 * @param {string} diffImagePath    Path to the difference image.
 * @param {Function} resultCallback Callback to receive the reconstructed image data URL.
 */
function decodeDifferenceImage ( baseImagePath , diffImagePath , resultCallback ) {
  const baseImage = new PictureObject ( ) ; // Image object for the base image
  const diffImage = new PictureObject ( ) ; // Image object for the difference image

  // Onload handler for the base image.
  baseImage . onload = function ( ) {
    // Nested onload handler for the difference image, ensuring both are loaded.
    diffImage . onload = function ( ) {
      // Use dimensions from the difference image, assuming consistency.
      const decodedWidth = diffImage . width ;
      const decodedHeight = diffImage . height ;

      // Create a canvas for the decoding process.
      const decodeCanvas = new GraphicModule ( decodedWidth , decodedHeight ) ;
      const decodeContext = decodeCanvas . getContext ( '2d' ) ;

      // Draw the base image and get its pixel data.
      decodeContext . drawImage ( baseImage , 0 , 0 , decodedWidth , decodedHeight ) ;
      let basePixels = decodeContext . getImageData ( 0 , 0 , decodedWidth , decodedHeight ) ;

      // Draw the difference image and get its pixel data.
      decodeContext . drawImage ( diffImage , 0 , 0 , decodedWidth , decodedHeight ) ;
      const diffPixels = decodeContext . getImageData ( 0 , 0 , decodedWidth , decodedHeight ) ;

      // Apply the difference to reconstruct the original image.
      // The operation reverses the `+127` and `value - diff` logic.
      for ( let pixelIterator = 0 ; pixelIterator < decodedWidth * decodedHeight ; pixelIterator ++ ) {
        for ( let channelIterator = 0 ; channelIterator < 3 ; channelIterator ++ ) { // RGB channels
          const pixelDataOffset = 4 * pixelIterator + channelIterator ;
          const reconstructedValue = basePixels . data [ pixelDataOffset ] + ( ( diffPixels . data [ pixelDataOffset ] - 127 ) || 0 ) ;
          basePixels . data [ pixelDataOffset ] = Math . min ( 255 , Math . max ( 0 , reconstructedValue ) ) ;
        }
      }

      // Put the reconstructed image data back onto the canvas.
      decodeContext . putImageData ( basePixels , 0 , 0 ) ;

      // If a callback is provided, invoke it with the data URL of the reconstructed image.
      if ( resultCallback ) {
        resultCallback ( decodeContext . canvas . toDataURL ( ) ) ;
      }
    } ; // End of diffImage.onload

    // Start loading the difference image.
    diffImage . src = diffImagePath ;
  } ; // End of baseImage.onload

  // Start loading the base image.
  baseImage . src = baseImagePath ;
} // End of decodeDifferenceImage function

// Reset the global task completion counter.
taskCompletionCount = 0;

/**
 * Executes post-scaling operations once all initial scaling tasks are complete.
 * This includes generating difference images and testing the decoding process.
 */
function handlePostScalingTasks ( ) {
  taskCompletionCount ++ ; // Increment the counter for each completed scaling operation.

  // Proceed only after both scaling operations have finished.
  if ( taskCompletionCount === 2 ) {
    // All initial scaled images are ready; now generate the differences.

    // First, compute the difference between the medium and low resolution images.
    calculateImageDelta (
      baseOutputIdentifier + '_med.jpg' , // Higher resolution source
      baseOutputIdentifier + '_low.jpg' , // Lower resolution source
      baseOutputIdentifier + '_low_to_med_diff.jpg' , // Output path for this diff
      function ( ) {
        // After the first diff is created, test decoding it.
        decodeDifferenceImage (
          baseOutputIdentifier + '_low.jpg' , // Base image for decoding
          baseOutputIdentifier + '_low_to_med_diff.jpg' , // Difference image to apply
          function ( reconstructedMediumSource ) {
            // Once the medium resolution image is reconstructed,
            // calculate the difference between the full resolution and the reconstructed medium.
            calculateImageDelta (
              __dirname + '/' + primarySourceFile , // Original full resolution image
              reconstructedMediumSource , // Reconstructed medium resolution image (as data URL)
              baseOutputIdentifier + '_med_to_full_diff.jpg' // Output path for this final diff
            ) ;
          }
        ) ;
      }
    ) ;
  }
} // End of handlePostScalingTasks function


// Initiate the image scaling processes.
// These operations run asynchronously and will trigger `handlePostScalingTasks` upon completion.

// Create a low-resolution version of the starting image (scaled by 4).
reduceImageDimensions (
  __dirname + '/' + primarySourceFile ,
  baseOutputIdentifier + '_low.jpg' ,
  4 ,
  handlePostScalingTasks
) ;

// Create a medium-resolution version of the starting image (scaled by 2).
reduceImageDimensions (
  __dirname + '/' + primarySourceFile ,
  baseOutputIdentifier + '_med.jpg' ,
  2 ,
  handlePostScalingTasks
) ;