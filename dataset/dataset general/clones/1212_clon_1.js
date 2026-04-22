window.addEvent ( 'domready' , /* This event fires when the DOM is fully loaded. */ function ( )
{

  html5toFlash ( ) ; // Invoke the HTML5 to Flash conversion routine.

  captionizer ( ) ; // Start the captioning process for images.

}
) ;

function html5toFlash ( )
{
    // Function to convert HTML5 video elements to Flash player if necessary.

  var videos = $$( 'video' ) ; // Select all <video> tags on the page.

  if ( ! videos ) // If no video elements are found, there's nothing to do.
  {
      return ; // Exit the function early.
  }

    videos.each( function ( video )
    {
      // Get the source URL of the video.
      source = video.getElement( 'source' ) . get( 'src' ) ;

        // Check if the video is not an MP4 or if the browser doesn't support H.264.
      if ( ! source.contains( 'mp4' ) || ! Modernizr.video.h264 )
      {
          // If true, we need to use a Flash fallback player.
        span = new Element( 'span' , { 'class' : 'video' } ) . wraps( video ) ; // Create a wrapper span.
        flashvid = new Swiff( flashplayerlocation ,
          {
            width   : video.get( 'width' ) . toInt( ) , // Get the video's width and convert to integer.
            height  : video.get( 'height' ) . toInt( ) + 29 , // Add 29 pixels to height for player controls.
            params  : {
              movie : source , // The video source for the Flash player.
              wmode : "opaque" , // Flash window mode.
              allowfullscreen : "true" // Allow full-screen mode.
            } ,
            vars : {
              file : source , // Another way to pass the video file to Flash.
              image : video.get( 'poster' ) , // Thumbnail image for the player.
              skin : flashplayerskin // Flash player skin configuration.
            } ,
            container : span // The container element for the Flash object.
          }
        ) ;

        video.dispose( ) ; // Remove the original HTML5 video element from the DOM.
      }
        else if ( video.get( 'preload' ) == "none" ) // If preload is set to "none", implement click-to-load.
        {
            video.addEvent( 'click' , function ( event )
            {
                clickToLoad( video ) ; // Attach a click event to load the video.
            }
            ) ;
        }
    }
    ) ; // End of videos.each loop.
}


function clickToLoad ( video )
{
    // This function handles the "click to load" functionality for videos.

    video.set( 'preload' , true ) ; // Set the preload attribute to true.

    if ( ! video.get( 'autoplay' ) ) // Check if autoplay is not already enabled.
    {
        video.set( 'autoplay' , true ) ; // Enable autoplay for the video.
    }

    video.removeEvent( 'click' , clickToLoad ) ; // Remove the click event listener once loaded.
}


function captionizer ( )
{
    /* This function is responsible for adding captions to images based on various criteria. */

    // First, add captions to images that have a 'title' attribute,
    // but exclude images that are part of a '.gallery-item'.
  $$( 'img[title]' ) . filter( function ( img )
  {
      return ! img.getParent( '.gallery-item' ) ; // Filter out gallery items.
  }
  ) . each( function ( image )
  {
      captionImage( image , image.get( 'title' ) ) ; // Call captionImage with the image and its title.
  }
  ) ;

    // Second, add captions from 'q' (quote) elements found in the document.
    $$ ( 'q' ) . each ( function ( caption )
    {
        text = caption.get( 'html' ) ; // Retrieve the HTML content of the quote as caption text.
        target = caption.getPrevious( 'img' ) ; // Attempt to find an image immediately preceding the quote.

      if ( ! target ) // If no immediate preceding image is found.
      {
            p = caption.getParent( ) ; // Get the parent element of the quote.
            target = p.getPrevious( ) . getLast( 'img' ) ; // Look for the last image in the previous sibling of the parent.
            console.log( p ) ; // Log the parent element for debugging.
            p.destroy( ) ; // Destroy the parent element (and thus the quote).
      }

      caption.destroy( ) ; // Remove the original quote element.
      captionImage( target , text ) ; // Apply the extracted text as a caption to the target image.
    }
    ) ;

} // End of the captionizer function.


function captionImage ( image , caption )
{
    // This utility function creates and inserts a caption element for a given image.

    title = caption ; // Assign the provided caption text to a local variable 'title'.

    wrap = new Element( 'span' ,
      {
        'class'  : 'img-wrap' , // Class for the wrapper span.
        'styles' : { 'width' : image.get( 'width' ) . toInt( ) + 'px' } // Set width based on image.
      }
    ) . wraps( image ) ; // Create a span and wrap it around the image.

    new Element( 'span' ,
      {
        'class'  : 'caption' , // Class for the caption text.
        'html'   : title , // Set the HTML content of the caption.
        'styles' : { 'width' : ( image.get( 'width' ) . toInt( ) - 10 ) + 'px' } // Adjust width for padding/margin.
      }
    ) . inject( image , 'after' ) ; // Create the caption span and inject it right after the image.
}