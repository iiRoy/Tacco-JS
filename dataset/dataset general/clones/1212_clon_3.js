"use strict";

// A centralized configuration object to manage various settings and CSS class names
// throughout the script, promoting easier maintenance and customization.
const applicationSettings = {
  flashPlayerPath: "/assets/flash/player.swf",
  flashPlayerSkinURL: "/assets/flash/skin.xml",
  flashPlayerControlHeight: 29, // Additional height for Flash player controls
  captionWidthAdjustment: 10,  // Pixels to subtract from image width for caption
  html5VideoContainerClass: "video-wrapper-element",
  imageCaptionWrapperClass: "image-display-frame",
  captionTextClass: "caption-label",
  galleryExclusionClass: "gallery-media-item" // Class to identify gallery items, which are excluded from certain captioning.
};

// The primary entry point for the script, ensuring all DOM manipulations occur
// only after the document is fully loaded and ready for interaction.
window.addEvent('domready', function() {
  // Initiates the process of handling video elements, including fallbacks and lazy loading.
  orchestrateVideoPlayback();
  // Commences the process of identifying and generating captions for various image types.
  manageImageAnnotations();
});

/**
 * Systematically processes all HTML5 video elements found on the page.
 * It determines whether to use a Flash fallback player or to configure
 * lazy loading for HTML5 videos based on browser capabilities and video attributes.
 */
function orchestrateVideoPlayback() {
  const pageVideoElements = document.getElements('video');

  // A preliminary check: if no video elements are present, there's no further action required.
  if (!pageVideoElements || pageVideoElements.length === 0) {
    console.info("No video elements found on the page. Skipping video processing.");
    return;
  }

  pageVideoElements.each(function(currentVideoNode) {
    const primaryVideoSource = currentVideoNode.getElement('source');

    // Each video element must have a 'source' child; otherwise, it's malformed or unplayable.
    if (!primaryVideoSource) {
      console.warn("Skipping video element due to missing 'source' tag:", currentVideoNode);
      return;
    }

    const videoContentURL = primaryVideoSource.get('src');

    // Determine if a Flash player is necessary. This occurs if the video is not an MP4
    // or if the browser lacks H.264 video codec support (checked via Modernizr).
    const isFlashRequired = !videoContentURL.includes('mp4') || (typeof Modernizr !== 'undefined' && !Modernizr.video.h264);

    if (isFlashRequired) {
      // Create a container element that will hold the Flash player.
      const flashPlayerContainer = new Element('span', { 'class': applicationSettings.html5VideoContainerClass });
      flashPlayerContainer.wraps(currentVideoNode); // Wrap the original HTML5 video element.

      // Extract original video dimensions to size the Flash player appropriately.
      const originalVideoWidth = currentVideoNode.get('width').toInt();
      const originalVideoHeight = currentVideoNode.get('height').toInt();
      // Adjust height for Flash player controls.
      const flashPlayerTotalHeight = originalVideoHeight + applicationSettings.flashPlayerControlHeight;

      // Initialize the Swiff (Flash) player with the specified configuration.
      const activeFlashPlayer = new Swiff(applicationSettings.flashPlayerPath, {
        width: originalVideoWidth,
        height: flashPlayerTotalHeight,
        params: {
          movie: videoContentURL, // The actual video file for the Flash player.
          wmode: "opaque",      // Essential for layering other HTML content over the Flash.
          allowfullscreen: "true" // Enables fullscreen functionality for the player.
        },
        vars: {
          file: videoContentURL, // Another variable for the Flash player to load the video.
          image: currentVideoNode.get('poster'), // The poster image for the video.
          skin: applicationSettings.flashPlayerSkinURL // Custom skin for the player interface.
        },
        container: flashPlayerContainer // The DOM element where the Flash object will be embedded.
      });

      // The original HTML5 video element is no longer needed after Flash substitution.
      currentVideoNode.dispose();
    } else {
      // For HTML5-compatible videos, check if lazy loading is desired.
      const currentPreloadAttribute = currentVideoNode.get('preload');
      const isAutoplayConfigured = currentVideoNode.get('autoplay');

      // If 'preload' is explicitly set to "none" and 'autoplay' is not active,
      // attach an event listener to enable loading and playback on user click.
      if (currentPreloadAttribute === "none" && !isAutoplayConfigured) {
        currentVideoNode.addEvent('click', function(eventObject) {
          eventObject.stop(); // Prevent any default browser actions for the click.
          activateLazyVideoLoading(currentVideoNode);
        });
      }
    }
  });
}

/**
 * Initiates the loading and playback process for a video element that was previously
 * configured for lazy loading (i.e., 'preload="none"'). This function is typically
 * invoked in response to a user interaction, like a click.
 * @param {Element} videoElementToLoad The specific HTML5 video element to activate.
 */
function activateLazyVideoLoading(videoElementToLoad) {
  // Set the 'preload' attribute to enable loading of video data.
  // In MooTools, setting it to `true` often translates to `preload="auto"`.
  videoElementToLoad.set('preload', true);

  // If the video is not already set to autoplay, enable it to start playback
  // immediately after the content has buffered sufficiently.
  if (!videoElementToLoad.get('autoplay')) {
    videoElementToLoad.set('autoplay', true);
  }

  // Once the video is activated, the click event listener is no longer necessary.
  videoElementToLoad.removeEvent('click', activateLazyVideoLoading);
}

/**
 * Orchestrates the process of creating and displaying captions for images.
 * It handles two main scenarios: images with 'title' attributes and images
 * associated with 'q' (quote) elements.
 */
function manageImageAnnotations() {
  // Process images that possess a 'title' attribute, but explicitly exclude
  // any images that are identified as part of a gallery.
  document.getElements('img[title]')
    .filter(function(candidateImage) {
      // Filters out images whose parent element has the designated gallery exclusion class.
      return !candidateImage.getParent(`.${applicationSettings.galleryExclusionClass}`);
    })
    .each(function(targetImageNode) {
      // For each eligible image, create a caption using its 'title' attribute content.
      assembleImageCaption(targetImageNode, targetImageNode.get('title'));
    });

  // Next, iterate through all 'q' (quote) elements to extract their content
  // and associate it with a preceding image to form a caption.
  document.getElements('q').each(function(quoteSourceElement) {
    const extractedQuoteContent = quoteSourceElement.get('html');
    let linkedImageElement = quoteSourceElement.getPrevious('img'); // Attempt to find an immediately preceding image.

    // If a direct preceding image is not found, perform a more complex search:
    // Look for an image within the previous sibling of the quote's immediate parent.
    if (!linkedImageElement) {
      const immediateEnclosingParent = quoteSourceElement.getParent();
      if (immediateEnclosingParent) {
        const precedingSiblingContainer = immediateEnclosingParent.getPrevious();
        if (precedingSiblingContainer) {
          // Attempt to find the last image element within the preceding sibling container.
          linkedImageElement = precedingSiblingContainer.getLast('img');
        }
      }
    }

    // If an image is successfully linked to the quote, generate its caption.
    if (linkedImageElement) {
      assembleImageCaption(linkedImageElement, extractedQuoteContent);
      // Remove the original 'q' element from the DOM as its content has been repurposed.
      quoteSourceElement.destroy();
    } else {
      // If no associated image is found, log a warning and still remove the quote element
      // to avoid orphaned content.
      console.warn("Quote element found without a discernible associated image. Removing:", quoteSourceElement);
      quoteSourceElement.destroy();
    }
  });
}

/**
 * Constructs and inserts a caption element for a specified image.
 * The image is first wrapped in a container to facilitate proper styling and layout
 * for both the image and its new caption.
 * @param {Element} imageToCaption The image element for which a caption is to be created.
 * @param {string} captionTextContent The textual content that will form the caption.
 */
function assembleImageCaption(imageToCaption, captionTextContent) {
  // Retrieve the image's displayed width. This is crucial for sizing the wrapper and caption.
  const imageCalculatedWidth = imageToCaption.get('width').toInt();

  // Validate the image width. If it's invalid or zero, we cannot properly size the caption.
  if (isNaN(imageCalculatedWidth) || imageCalculatedWidth <= 0) {
    console.warn("Cannot generate caption: Invalid or zero width detected for image.", imageToCaption);
    return;
  }

  // Create a new span element that will serve as a wrapper for the image and its caption.
  const imageAndCaptionWrapper = new Element('span', {
    'class': applicationSettings.imageCaptionWrapperClass,
    'styles': {
      'width': `${imageCalculatedWidth}px`, // Set wrapper width to match the image.
      'display': 'inline-block',            // Ensures the wrapper respects width and allows side-by-side display.
      'vertical-align': 'top'               // Align wrapper to the top for consistent layout.
    }
  });
  imageAndCaptionWrapper.wraps(imageToCaption); // Embed the original image within this new wrapper.

  // Calculate the width for the caption, subtracting a predefined offset for internal padding/margins.
  const captionDisplayWidth = imageCalculatedWidth - applicationSettings.captionWidthAdjustment;

  // Create the actual caption element.
  const captionDOMElement = new Element('span', {
    'class': applicationSettings.captionTextClass,
    'html': captionTextContent, // Set the text content for the caption.
    'styles': {
      'width': `${captionDisplayWidth}px`, // Set caption width.
      'display': 'block',                  // Ensures the caption takes its own line within the wrapper.
      'text-align': 'center',              // Center-align the text within the caption.
      'font-size': '0.9em',                // Slightly smaller font size for captions.
      'padding': '5px 0'                   // Add some vertical padding.
    }
  });

  // Inject the newly created caption element immediately after the image,
  // ensuring it remains within the `imageAndCaptionWrapper`.
  captionDOMElement.inject(imageToCaption, 'after');
}