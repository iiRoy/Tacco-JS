jQuery(document).ready(function() {
  "use strict";

  // Declare and initialize essential state variables for the application
  var allVisualsReady = false, // Indicates if all image assets have finished loading
    visualsCount = 0, // Total number of images specified for the display
    currentIdx = 0, // The index of the image currently being shown
    assetPathList = [], // Stores the file paths for all visual assets
    cachedVisuals = [], // Holds the actual loaded image objects (DOM elements)
    cachedVisualsCount = 0; // Tracks how many images have been successfully loaded

  /*
   * Specify the file paths for your image gallery here.
   * Update this array to include all the images you wish to display.
   */
  assetPathList = [
    "pix/one.png",
    "pix/two.png",
    "pix/three.png",
    "pix/four.png",
  ];

  // Calculate the total quantity of visuals from the asset path array
  visualsCount = assetPathList.length;

  /**
   * Advances the image display to the subsequent visual asset.
   * Cycles back to the first image if the end of the sequence is reached.
   */
  function advanceDisplay() {
    if (currentIdx === visualsCount - 1) {
      currentIdx = 0; // Reset index to the start
    } else {
      currentIdx++; // Move to the next image's index
    }

    // Update the source (src) and alternative text (alt) attributes of the main image element
    jQuery("#pageImage").attr("src", jQuery(cachedVisuals[currentIdx]).attr("src"));
    jQuery("#pageImage").attr("alt", "sample_image " + currentIdx);
  }

  /**
   * Reverts the image display to the preceding visual asset.
   * Cycles to the last image if the beginning of the sequence is reached.
   */
  function revertDisplay() {
    if (currentIdx === 0) {
      currentIdx = visualsCount - 1; // Set index to the end
    } else {
      currentIdx--; // Move to the previous image's index
    }

    // Fetch the source path for the image at the new current index
    var assetLocation = jQuery(assetPathList[currentIdx]).attr("src");
    jQuery("#pageImage").attr("src", assetLocation);
    jQuery("#pageImage").attr("alt", "sample_image " + currentIdx);
  }

  /**
   * Performs the initial setup of the application's user interface and
   * attaches all necessary event listeners once all images are loaded.
   */
  function initializeApplication() {
    allVisualsReady = true; // Mark all visuals as loaded
    jQuery("#preloadingImages").hide(); // Conceal the image preloading indicator

    // Disable the default browser context menu to prevent right-click behavior
    jQuery(document).on("contextmenu", function(evt) {
      return false; // Suppress the context menu
    });

    // Prepare the initial image element to be displayed
    var sourceData = jQuery(assetPathList[0]).attr("src"),
      displayElement = jQuery("<img />");

    // Configure the attributes of the main display image and append it to the container
    jQuery(displayElement)
      .attr("src", sourceData)
      .attr("width", assetPathList[0].width)
      .attr("height", assetPathList[0].height)
      .attr("alt", "initial_sample_image_1")
      .attr("id", "pageImage");
    jQuery("#container").append(displayElement);

    // Attach a mouse event handler to the main image for navigation
    jQuery("#pageImage").mousedown(function(evt) {
      if (allVisualsReady) {
        switch (evt.which) {
          case 1: // Left mouse button click
            advanceDisplay();
            break;
          case 2: // Middle mouse button click (no action defined)
            break;
          case 3: // Right mouse button click
            revertDisplay();
            break;
          default:
            // No operation for other mouse buttons
        }
      }
    });

    // Attach a keyboard event handler for navigation using arrow keys
    jQuery(document).keydown(function(evt) {
      evt.preventDefault(); // Prevent default browser actions (e.g., scrolling)
      if (allVisualsReady) {
        switch (evt.keyCode) {
          case 37: // Left arrow key
          case 38: // Up arrow key
            revertDisplay();
            break;
          case 39: // Right arrow key
          case 40: // Down arrow key
            advanceDisplay();
            break;
          default:
            // No specific action for other keyboard inputs
        }
      }
    });
  }

  /**
   * Recursively preloads each visual asset in the `assetPathList`.
   * Once all assets are loaded, it triggers the application initialization.
   */
  function cacheAssets() {
    // Create a temporary image element to facilitate loading of the current asset
    var temporaryAsset = jQuery("<img />").attr("src", assetPathList[cachedVisualsCount]);

    // Attach an event listener for when the temporary asset finishes loading
    temporaryAsset.on("load", function() {
      cachedVisuals.push(this); // Store the actual loaded image object
      cachedVisualsCount++; // Increment the counter for successfully loaded assets

      // Check if all visual assets have been processed
      if (cachedVisualsCount === visualsCount) {
        assetPathList = cachedVisuals; // Replace the paths array with actual image objects
        initializeApplication(); // Proceed to set up the main application
      } else {
        // Continue preloading the next asset if not all are loaded yet
        if (!allVisualsReady) {
          cacheAssets(); // Recursive call to load the subsequent image
        }
      }
    });
  }

  // --- APPLICATION LAUNCH SEQUENCE ---
  // Verify if any visual assets have been provided in the configuration
  if (visualsCount === 0) {
    // Display an informative message if no images are specified
    jQuery("#container").html(
      "<p><strong>Please define some visual assets in your configuration array.</strong></p>"
    );
  } else {
    cacheAssets(); // Begin the process of preloading all specified assets
  }
});