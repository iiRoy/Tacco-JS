window.addEvent('domready', function() {
  // Execute the media handling process.
  legacyVideoHandler();
  // Initiate the image annotation procedure.
  textEnhancer();
});

// This routine manages video elements, providing Flash fallback for older formats or browsers.
function legacyVideoHandler() {
  // Gather all video elements from the document.
  let videoNodes = $$('video');
  // Exit if no video elements are present.
  if (!videoNodes) {
    return;
  }
  // Process each video element found.
  videoNodes.each(function(vidElement) {
    // Extract the primary source URL for the current video.
    let mediaPath = vidElement.getElement('source').get('src');
    // Determine if a Flash fallback is necessary (e.g., non-MP4 or missing H.264 support).
    if (!mediaPath.contains('m4v') || !Modernizr.video.h264) {
      // Create a container element to wrap the video for the Flash object.
      let containerSpan = new Element('span', {
        'class': 'media-player'
      }).wraps(vidElement);
      // Instantiate a new Flash player object.
      let legacyPlayer = new Swiff(playerAssetLocation, {
        width: vidElement.get('width').toInt(),
        height: vidElement.get('height').toInt() + 30, // Adjust height to accommodate player controls.
        params: {
          movie: mediaPath,
          wmode: "translucent", // Set window mode for transparency.
          allowfullscreen: "yes" // Allow full-screen functionality.
        },
        vars: {
          file: mediaPath,
          image: vidElement.get('poster'),
          skin: playerTheme
        },
        container: containerSpan
      });
      // Remove the original HTML5 video element, as Flash is now handling it.
      vidElement.dispose();
    } else if (vidElement.get('preload') === "deferred") {
      // For videos with 'deferred' preload, attach a click listener to start loading.
      vidElement.addEvent('click', function(clickEvt) {
        // Invoke the function to activate the media loading.
        activateMedia(vidElement);
      });
    }
  });
}

// Function to handle the activation of a video element upon user interaction.
function activateMedia(vidElement) {
  // Set the preload attribute to true, ensuring the video starts loading.
  vidElement.set('preload', !false);
  // If autoplay is not enabled, explicitly set it to true.
  if (!vidElement.get('autoplay')) {
    vidElement.set('autoplay', !false);
  }
  // Remove the click event listener to prevent multiple activations.
  vidElement.removeEvent('click', activateMedia);
}

// Orchestrates the addition of descriptive text to images and quotes.
function textEnhancer() {
  // Find all images with a 'title' attribute, excluding those within gallery items.
  $$('img[title]').filter(function(picElement) {
    return !picElement.getParent('.gallery-item');
  }).each(function(displayImage) {
    // Apply the image's title as a visual decoration.
    decorateVisual(displayImage, displayImage.get('title'));
  });

  // Iterate through all 'q' (blockquote) elements to convert them into image captions.
  $$('q').each(function(quoteElement) {
    // Retrieve the HTML content from the quote element.
    let labelContent = quoteElement.get('html');
    // Attempt to find an image immediately preceding the quote.
    let affectedElement = quoteElement.getPrevious('img');
    // If no direct preceding image is found, search within the previous sibling's children.
    if (!affectedElement) {
      let ancestorNode = quoteElement.getParent();
      affectedElement = ancestorNode.getPrevious().getLast('img');
      // Output the parent node for debugging.
      console.log(ancestorNode);
      // Remove the parent container of the quote element.
      ancestorNode.destroy();
    }
    // Remove the original quote element after extracting its content.
    quoteElement.destroy();
    // Apply the extracted text as a caption to the identified image.
    decorateVisual(affectedElement, labelContent);
  });
}

// Attaches a textual description below a specified image element.
function decorateVisual(displayImage, displayLabel) {
  // Store the caption text.
  let itemTitle = displayLabel;
  // Create a wrapping span for the image, dynamically setting its width.
  let imageFrame = new Element('span', {
    'class': 'visual-container',
    'styles': {
      'width': displayImage.get('width').toInt() + 'px'
    }
  }).wraps(displayImage);
  // Insert a new span element containing the caption text directly after the image.
  new Element('span', {
    'class': 'description-text',
    'html': itemTitle,
    'styles': {
      'width': (displayImage.get('width').toInt() - 0xA) + 'px'
    }
  }).inject(displayImage, 'after');
}