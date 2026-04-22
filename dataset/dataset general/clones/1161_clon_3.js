let DisplayBoost, IMGZ;

// Core object for the enhanced media viewing system.
IMGZ = DisplayBoost = {
  // Registers a new content plugin, allowing the system to extend its
  // capabilities for specific websites or media types.
  // Each plugin should define a `checkMediaSource` method.
  registerPlugin: function (pluginKey, setupPluginFn) {
    // Establish a default configuration for new plugins.
    // Plugins are expected to return a Promise from `checkMediaSource`.
    const defaultPluginConfig = {
      pluginKey: pluginKey,
      pluginName: pluginKey,
      // Default media checker that always resolves to an unknown type.
      checkMediaSource: (targetLink) => Promise.resolve({ type: 'unknown', link: targetLink })
    };

    // Execute the plugin's setup function, passing the default config
    // and allowing it to customize its behavior and properties.
    const configuredPlugin = setupPluginFn.call(defaultPluginConfig, defaultPluginConfig, pluginKey) || defaultPluginConfig;
    IMGZ.registeredPlugins[pluginKey] = configuredPlugin;

    // If the plugin specifies additional domains, map them for efficient lookup.
    if (configuredPlugin.extraHosts && Array.isArray(configuredPlugin.extraHosts)) {
      configuredPlugin.extraHosts.forEach(function(hostEntry) {
        IMGZ.hostToPluginMap[hostEntry] = pluginKey;
      });
    }
  },

  // Visual configuration parameters.
  viewportMargin: 20,       // Minimum space around the media display from screen edges.
  contentOffset: 30,        // Horizontal distance from the mouse cursor to the media display.
  topBarHeightPx: 60,       // Fixed height of the header bar within the media overlay.

  // State management for gallery (album) features.
  activeGallery: [],        // Array containing all media items in the current gallery.
  galleryItemIdx: 0,        // Index of the currently displayed item within the active gallery.
  isGalleryActive: false,   // Boolean flag indicating if a gallery is currently in view.
  galleryProgress: new Map(), // Stores the last viewed index for each gallery, identified by its first item's URL.

  // Timers for managing hover activation and deactivation delays.
  activationTimeout: null,  // Timer ID for delaying media overlay activation.
  dismissTimeout: null,     // Timer ID for delaying media overlay dismissal.

  // Flag to indicate if the media is currently displayed in fullscreen (lightbox) mode.
  isFullscreenActive: false,

  // Stores the last known mouse cursor coordinates on the screen.
  cursorPosition: { x: 0, y: 0 },

  // Initializes the DisplayBoost system by setting up DOM elements and event listeners.
  initialize: function() {
    // Create the primary container for the media overlay.
    this.mainWrapper = $('<div id="DisplayBoost-mainWrapper"></div>');
    // The visual indicator (e.g., a triangle) that points to the hovered element.
    this.pointerIndicator = $('<div id="DisplayBoost-pointerIndicator"></div>');
    
    // Elements for the top bar of the overlay.
    this.topBar = $('<div id="DisplayBoost-topBar"></div>');
    this.applicationTitle = $('<span id="DisplayBoost-applicationTitle">DisplayBoost</div>');
    this.controlPanel = $('<div id="DisplayBoost-controlPanel"></div>'); // Reserved for future interactive controls.
    this.galleryStatus = $('<span id="DisplayBoost-galleryStatus"></div>'); // Displays album navigation status (e.g., "1/5").
    
    // The button to close the media overlay.
    this.dismissButton = 
      $('<div id="DisplayBoost-dismissButton">&times;</div>')
        .on('click', IMGZ.concealMediaOverlay); // Attach click handler using 'on' for consistency.

    // Assemble the top bar components.
    this.topBar.append(this.applicationTitle, this.controlPanel, this.galleryStatus, this.dismissButton);

    // The main area where the actual media content (image, video) will be rendered.
    this.contentArea = $('<div id="DisplayBoost-contentArea">');
    // A visual spinner displayed while media content is loading.
    this.loadingSpinner = $('<div id="DisplayBoost-loadingSpinner"></div>');

    // Attach the top bar and content area to the main wrapper.
    $(this.mainWrapper)
      .append(this.topBar, this.contentArea)
      .on('mouseleave', IMGZ.onElementLeave) // Clear hide timer if mouse leaves the overlay.
      .on('mouseover', IMGZ.clearDismissTimer); // Prevent hide if mouse re-enters.
    
    // Initialize the core media elements.
    this.mediaImage = new Image();
    $(this.mediaImage).on('load', IMGZ.onMediaContentReady); // Bind load event for images.
    this.mediaVideo = $('<video>'); // Placeholder for potential video playback.
    this.mediaAudio = $('<audio>'); // Placeholder for potential audio playback.

    // Set up global event delegation for mouse interactions on links and images.
    $(document.body)
      .on('mouseover', 'a, img', {}, IMGZ.onElementHover)
      .on('mouseout', 'a, img', {}, IMGZ.onElementLeave)
      .append(this.mainWrapper, this.pointerIndicator); // Append main overlay elements to the document body.

    // Monitor global mouse movement to update cursor coordinates for positioning.
    $(window).on('mousemove', IMGZ.updateCursorCoordinates);
  },

  // Captures and stores the current mouse cursor's X and Y coordinates.
  updateCursorCoordinates: function(event) {
    event = event || window.event; // Fallback for older browsers.
    let currentX = 0;
    let currentY = 0;

    // Use pageX/pageY for modern browsers, clientX/Y with scroll offsets for others.
    if (event.pageX || event.pageY) {
      currentX = event.pageX;
      currentY = event.pageY;
    } else {
      currentX = event.clientX +
        (document.documentElement.scrollLeft || document.body.scrollLeft) -
        document.documentElement.clientLeft;
      currentY = event.clientY +
        (document.documentElement.scrollTop || document.body.scrollTop) -
        document.documentElement.clientTop;
    }
    IMGZ.cursorPosition = { x: currentX, y: currentY };
  },

  /**
   * Handles the mouseover event on potential media links or images.
   * Clears any pending dismissal timer and sets a new timer to activate the overlay.
   * @param {Event} event - The DOM mouseover event object.
   */
  onElementHover: function(event) {
    IMGZ.clearDismissTimer(); // Immediately cancel any pending hide operation.
    // Set a short delay before processing the link to prevent accidental activations.
    IMGZ.activationTimeout = setTimeout(() => {
      // Use currentTarget for delegated events to get the element the listener is attached to.
      IMGZ.evaluateTargetLink(event.currentTarget);
    }, 400); // 400ms delay.
  },

  /**
   * Evaluates a given DOM element to determine if it's a media link and, if so, displays the media.
   * @param {HTMLElement} elementToEvaluate - The DOM element (e.g., `<a>` or `<img>`) to be checked.
   */
  evaluateTargetLink: function(elementToEvaluate) {
    let targetLinkElement = elementToEvaluate;

    // Guard clause: Ensure a valid element is provided.
    if (!targetLinkElement) {
        console.warn('DisplayBoost: Received null or undefined element for evaluation.');
        return;
    }

    // If the element itself isn't a link (e.g., an <img> inside an <a>),
    // try to get the parent link element.
    if (!targetLinkElement.href && targetLinkElement.parentNode && targetLinkElement.parentNode.href) {
        targetLinkElement = targetLinkElement.parentNode;
    }

    // If still no valid link, log and exit.
    if (!targetLinkElement.href) {
        console.warn('DisplayBoost: Element does not contain an href attribute or valid parent link.', elementToEvaluate);
        return;
    }

    // Begin the process of resolving the media source.
    IMGZ.resolveMediaSource(targetLinkElement)
      .then(mediaInfo => {
        // Only proceed if valid media data is successfully retrieved.
        if (mediaInfo && mediaInfo.type) {
          IMGZ.presentMediaOverlay(mediaInfo);
        } else {
          // If no media is found, ensure timers are cleared and overlay is hidden.
          IMGZ.clearActivationTimer();
          IMGZ.concealMediaOverlay();
        }
      })
      .catch(IMGZ.handleHoverError); // Catch and log any errors during media resolution.
  },

  // Centralized error handler for issues during media processing.
  handleHoverError: function(caughtError) {
    console.error('DisplayBoost encountered an error during media processing:', caughtError);
    // Future enhancement: Display a user-friendly, temporary error message on the screen.
  },

  /**
   * Handles the mouseout event, initiating a timer to hide the media overlay.
   * @param {Event} event - The DOM mouseout event object.
   */
  onElementLeave: function(event) {
    // If fullscreen mode is active, prevent the overlay from hiding.
    if (IMGZ.isFullscreenActive) {
      return;
    }
    IMGZ.clearActivationTimer(); // Cancel any pending activation.
    // Set a delay before hiding the overlay.
    IMGZ.dismissTimeout = setTimeout(IMGZ.concealMediaOverlay, 600); // 600ms delay.
  },

  /**
   * Callback function executed when the primary media image finishes loading.
   * Adjusts the overlay's position and size, then displays the image.
   * @param {Event} event - The load event object (may be null if manually triggered).
   */
  onMediaContentReady: function(event) {
    // Get the natural dimensions of the loaded image.
    const actualWidth = (event && event.target) ? event.target.width : IMGZ.mediaImage.width;
    const actualHeight = (event && event.target) ? event.target.height : IMGZ.mediaImage.height;
    
    // Calculate the optimal display position and size for the media.
    const contentPlacement = IMGZ.calculateContentPlacement(actualWidth, actualHeight);

    // If an image source exists, attempt to add it to BabelExt's history.
    if (IMGZ.mediaImage.src) {
        try {
            // BabelExt.history.add is an external browser extension API.
            BabelExt.history.add(IMGZ.mediaImage.src, function() { /* History addition callback */ });
        } catch (e) {
            console.warn("DisplayBoost: Failed to add image to BabelExt history:", e.message);
        }
    }

    // Apply the calculated position and make the main wrapper visible.
    $(IMGZ.mainWrapper)
      .css(contentPlacement.position)
      .css({
        height: 'auto', // Allow content to dictate height.
        width: 'auto'   // Allow content to dictate width.
      })
      .show();

    // Display the media content itself (hide spinner, show image).
    IMGZ.showMediaContentElement();
  },

  // Hides the loading spinner and reveals the loaded media image.
  showMediaContentElement: function() {
    $(IMGZ.loadingSpinner).hide();
    $(IMGZ.mediaImage).show();
  },

  // Clears any active timer set to hide the media overlay.
  clearDismissTimer: function() {
    if (IMGZ.dismissTimeout) {
      clearTimeout(IMGZ.dismissTimeout);
      IMGZ.dismissTimeout = null; // Reset the timer ID.
    }
  },

  // Clears any active timer set to activate the media overlay.
  clearActivationTimer: function() {
    if (IMGZ.activationTimeout) {
      clearTimeout(IMGZ.activationTimeout);
      IMGZ.activationTimeout = null; // Reset the timer ID.
    }
  },

  /**
   * Determines the optimal screen position and dimensions for the media content.
   * This takes into account available screen space, cursor location, and defined margins.
   *
   * @param {number} mediaContentWidth - The intrinsic width of the media.
   * @param {number} mediaContentHeight - The intrinsic height of the media.
   * @returns {Object} - An object containing `position` (CSS properties for top, left/right)
   *                     and `size` (CSS properties for maxWidth, maxHeight).
   */
  calculateContentPlacement: function(mediaContentWidth, mediaContentHeight) {
    const currentViewportWidth = $(window).width();
    const currentViewportHeight = $(window).height();
    const currentScrollTop = $(window).scrollTop();
    const currentScrollLeft = $(window).scrollLeft();

    // Calculate the horizontal center of the current viewport.
    const viewportHorizontalCenter = currentScrollLeft + (currentViewportWidth / 2);

    let maximumContentWidth, maximumContentHeight;
    let finalTopPosition, finalLeftPosition, finalRightPosition;
    let placementSide; // Indicates if placed 'left' or 'right' of the cursor.

    // Determine horizontal placement based on cursor's position relative to viewport center.
    if (IMGZ.cursorPosition.x < viewportHorizontalCenter) {
      // If cursor is on the left half, place content to its right.
      placementSide = 'right';
      finalLeftPosition = IMGZ.cursorPosition.x + IMGZ.contentOffset;
      finalRightPosition = null; // Not applicable.
      maximumContentWidth = currentViewportWidth - IMGZ.cursorPosition.x - IMGZ.contentOffset - IMGZ.viewportMargin;
    } else {
      // If cursor is on the right half, place content to its left.
      placementSide = 'left';
      finalLeftPosition = null; // Not applicable.
      finalRightPosition = (currentViewportWidth - IMGZ.cursorPosition.x) + IMGZ.contentOffset - IMGZ.viewportMargin;
      maximumContentWidth = IMGZ.cursorPosition.x - IMGZ.contentOffset - IMGZ.viewportMargin;
    }
  
    // Calculate the maximum available height, accounting for top bar and margins.
    maximumContentHeight = currentViewportHeight - (2 * IMGZ.viewportMargin) - IMGZ.topBarHeightPx;

    // Initial vertical placement: default to viewport top margin.
    finalTopPosition = currentScrollTop + IMGZ.viewportMargin;

    // Adjust vertical position to visually align with the cursor if the media is short.
    // This attempts to vertically center the media relative to the cursor's Y,
    // while ensuring it stays within the screen bounds.
    const idealTopCenteredOnCursor = IMGZ.cursorPosition.y - (mediaContentHeight / 2);
    const minAllowableTop = currentScrollTop + IMGZ.viewportMargin;
    const maxAllowableTop = currentScrollTop + currentViewportHeight - IMGZ.viewportMargin - mediaContentHeight;

    finalTopPosition = Math.max(minAllowableTop, Math.min(idealTopCenteredOnCursor, maxAllowableTop));
    
    // Final check to ensure the media's top edge doesn't go above the cursor's Y if the media is very short.
    // This helps maintain a visual connection to the mouse.
    if (finalTopPosition + mediaContentHeight < IMGZ.cursorPosition.y) {
        finalTopPosition = IMGZ.cursorPosition.y - mediaContentHeight;
    }

    return {
      relativeToCursorSide: placementSide,
      position: {
        top: finalTopPosition,
        left: finalLeftPosition,
        right: finalRightPosition
      },
      size: {
        maxWidth: maximumContentWidth,
        maxHeight: maximumContentHeight
      }
    };
  },

  /**
   * Displays the media overlay with the provided media information.
   * @param {Object} mediaInfo - An object containing `type`, `src`, `title`, and optionally `images` for albums.
   * @returns {boolean} - Returns `true` if media was successfully presented, `false` otherwise.
   */
  presentMediaOverlay: function(mediaInfo) {
    // Validate that essential media information is available.
    if (!mediaInfo || !mediaInfo.type) {
      console.warn('DisplayBoost: No valid media information provided for presentation.');
      return false;
    }

    // Reset gallery-related flags and display text.
    IMGZ.isGalleryActive = false;
    IMGZ.galleryStatus.text("");

    // Attach global keyboard event listener for interactive controls.
    $(window).on('keydown', IMGZ.onKeyboardInput);
    
    // Get current scroll position for correct pointer indicator placement.
    const currentScrollTop = $(window).scrollTop();
    // Calculate the optimal placement for the media content.
    const contentPlacement = IMGZ.calculateContentPlacement(mediaInfo.width, mediaInfo.height); // Pass actual dimensions if known.
    
    // Clear any pending hide timer as the overlay is now being displayed.
    this.clearDismissTimer();

    // Position and display the pointer indicator.
    const indicatorPosition = {
      top: Math.max(IMGZ.cursorPosition.y, currentScrollTop + IMGZ.viewportMargin)
    };
    
    if (contentPlacement.relativeToCursorSide === 'right') {
      indicatorPosition.left = IMGZ.cursorPosition.x + 10; // Small offset from cursor.
      indicatorPosition.right = null;
    } else {
      indicatorPosition.left = null;
      indicatorPosition.right = $(window).width() - IMGZ.cursorPosition.x - 10; // Small offset from cursor.
    }

    $(this.pointerIndicator)
      .css(indicatorPosition)
      .show()
      .attr('class', contentPlacement.relativeToCursorSide); // Apply class for directional styling.

    // Handle different types of media.
    if (mediaInfo.type === 'image') {
      IMGZ.renderMediaContent(contentPlacement, mediaInfo.src, mediaInfo.title);

    } else if (mediaInfo.type === 'album') {
      // Ensure album data is valid.
      if (!mediaInfo.images || !Array.isArray(mediaInfo.images) || mediaInfo.images.length === 0) {
        console.warn('DisplayBoost: Album mediaInfo is missing a valid images array.');
        IMGZ.concealMediaOverlay(); // Hide if album data is invalid.
        return false;
      }

      IMGZ.isGalleryActive = true; // Enable gallery navigation.
      IMGZ.activeGallery = mediaInfo.images;

      // Use the URL of the first image in the album as a unique key for progress tracking.
      const galleryIdentifier = mediaInfo.images[0].src;
      // Retrieve the last viewed index for this gallery, or default to 0.
      IMGZ.galleryItemIdx = IMGZ.galleryProgress.get(galleryIdentifier) || 0; 
      
      // Ensure the retrieved index is within valid bounds.
      if (IMGZ.galleryItemIdx >= IMGZ.activeGallery.length) {
          IMGZ.galleryItemIdx = 0;
      }

      // Render the current image from the album.
      const currentGalleryItem = IMGZ.activeGallery[IMGZ.galleryItemIdx];
      IMGZ.renderMediaContent(contentPlacement, currentGalleryItem.src, currentGalleryItem.title);
      // Update the gallery status text (e.g., "1/5").
      IMGZ.galleryStatus.text(`${IMGZ.galleryItemIdx + 1}/${IMGZ.activeGallery.length}`);
    } else {
        console.warn(`DisplayBoost: Unhandled media type: ${mediaInfo.type}. Hiding overlay.`);
        IMGZ.concealMediaOverlay(); // Hide overlay for unsupported types.
        return false;
    }
    return true;
  },

  /**
   * Navigates to the next or previous item within the currently active gallery.
   * @param {number} navigationDirection - `1` for next item, `-1` for previous item.
   */
  navigateGalleryItem: function(navigationDirection) {
    // Only proceed if a gallery is active and contains items.
    if (!IMGZ.isGalleryActive || IMGZ.activeGallery.length === 0) {
      return;
    }

    let nextIndex = IMGZ.galleryItemIdx + navigationDirection;

    // Implement circular navigation: loop to the end if going before start, or to start if going past end.
    if (nextIndex < 0) {
      nextIndex = IMGZ.activeGallery.length - 1;
    } else if (nextIndex >= IMGZ.activeGallery.length) {
      nextIndex = 0;
    }

    // Update the current gallery index.
    IMGZ.galleryItemIdx = nextIndex;
    // Save the new progress for this specific gallery.
    IMGZ.galleryProgress.set(IMGZ.activeGallery[0].src, IMGZ.galleryItemIdx);

    // Update the displayed gallery status.
    IMGZ.galleryStatus.text(`${IMGZ.galleryItemIdx + 1}/${IMGZ.activeGallery.length}`);

    // Re-render the new image from the album.
    const contentPlacement = IMGZ.calculateContentPlacement(
        IMGZ.activeGallery[IMGZ.galleryItemIdx].width,
        IMGZ.activeGallery[IMGZ.galleryItemIdx].height
    ); // Recalculate placement based on new image dimensions.
    const currentGalleryItem = IMGZ.activeGallery[IMGZ.galleryItemIdx];
    IMGZ.renderMediaContent(contentPlacement, currentGalleryItem.src, currentGalleryItem.title);
  },

  /**
   * Populates the media content area with an image, managing loading states and display.
   * @param {Object} contentPlacement - Object containing positioning and sizing details.
   * @param {string} mediaSourceURL - The URL of the image to be loaded.
   * @param {string} displayTitle - The title text to be shown in the overlay's header.
   */
  renderMediaContent: function(contentPlacement, mediaSourceURL, displayTitle) {
    if (!mediaSourceURL) {
        console.warn('DisplayBoost: Attempted to render media without a source URL.');
        IMGZ.concealMediaOverlay();
        return;
    }

    // Clear previous content and add the loading spinner and image element.
    $(IMGZ.contentArea)
      .empty()
      .append(IMGZ.loadingSpinner)
      .append(IMGZ.mediaImage); // Re-append the image element to ensure it's in the DOM.

    // Hide the image, set its source, and update the alt attribute and application title.
    $(IMGZ.mediaImage)
      .hide()
      .attr('src', mediaSourceURL)
      .attr('alt', displayTitle || 'Enhanced Media Display'); // Add alt text for accessibility.

    $(IMGZ.applicationTitle).text(displayTitle || 'DisplayBoost');

    // Apply the calculated size constraints to the image.
    $(IMGZ.mediaImage).css(contentPlacement.size);

    // Position and make the main wrapper visible.
    $(IMGZ.mainWrapper)
      .css(contentPlacement.position)
      .show();

    // Check if the image is already cached by the browser. If so, its 'load' event might not fire.
    // Manually trigger the load handler if the image is complete and has dimensions.
    if (IMGZ.mediaImage.complete && IMGZ.mediaImage.naturalWidth > 0) {
      IMGZ.onMediaContentReady();
    } else {
      // Otherwise, show the loading spinner until the image fully loads.
      $(IMGZ.loadingSpinner).show();
    }
  },

  /**
   * Hides the media overlay and resets all associated states.
   */
  concealMediaOverlay: function() {
    // Hide the main wrapper and the pointer indicator.
    $(IMGZ.mainWrapper).hide();
    $(IMGZ.pointerIndicator).hide();

    // Unbind keyboard listeners to prevent actions when the overlay is not visible.
    $(window).off('keydown', IMGZ.onKeyboardInput);
    
    // Reset fullscreen mode flag.
    IMGZ.isFullscreenActive = false;

    // Clear all gallery-related data and status.
    IMGZ.isGalleryActive = false;
    IMGZ.activeGallery = [];
    IMGZ.galleryItemIdx = 0;
    IMGZ.galleryStatus.text(""); // Clear the album information text.
    
    // Clear the image source to potentially release memory and prevent displaying stale content.
    $(IMGZ.mediaImage).attr('src', '');
  },

  /**
   * Activates fullscreen (lightbox) mode for the currently displayed media.
   * This expands the media to fill the viewport, respecting margins.
   */
  activateFullscreenMode: function() {
    IMGZ.isFullscreenActive = true; // Set the fullscreen flag.
    $(IMGZ.pointerIndicator).hide(); // Hide the pointer indicator in fullscreen mode.

    // Calculate the dimensions for the fullscreen display, accounting for viewport margins.
    const availableHeight = $(window).height() - (2 * IMGZ.viewportMargin);
    const availableWidth = $(window).width() - (2 * IMGZ.viewportMargin);
    const currentScrollPositionTop = $(window).scrollTop();

    // Position the main wrapper to span the entire viewport with margins.
    $(IMGZ.mainWrapper).css({
      top: currentScrollPositionTop + IMGZ.viewportMargin,
      left: IMGZ.viewportMargin,
      height: availableHeight,
      width: availableWidth
    });

    // Resize the media content (image) to fit within the new fullscreen wrapper,
    // also accounting for the height of the top bar.
    $(IMGZ.mediaImage).css({
      maxHeight: availableHeight - $(IMGZ.topBar).outerHeight(true), // outerHeight(true) includes margins.
      maxWidth: availableWidth
    });
  },

  /**
   * Handles keyboard input for various actions like closing, navigating galleries, or toggling fullscreen.
   * @param {Event} keyEvent - The keyboard event object.
   */
  onKeyboardInput: function(keyEvent) {
    // console.log('Keyboard input detected, key code:', keyEvent.keyCode); // Debugging.

    switch (keyEvent.keyCode) {
      case 27: // Escape key
        IMGZ.concealMediaOverlay();
        break;
      case 37: // Left arrow key
        if (IMGZ.isGalleryActive) {
          keyEvent.preventDefault(); // Prevent default browser scroll behavior.
          IMGZ.navigateGalleryItem(-1); // Move to the previous item in the gallery.
        }
        break;
      case 39: // Right arrow key
        if (IMGZ.isGalleryActive) {
          keyEvent.preventDefault(); // Prevent default browser scroll behavior.
          IMGZ.navigateGalleryItem(1); // Move to the next item in the gallery.
        }
        break;
      case 90: // 'Z' key
        IMGZ.activateFullscreenMode(); // Toggle fullscreen/lightbox mode.
        break;
      case 84: // 'T' key
        if (IMGZ.mediaImage.src) {
          // Attempt to open the current image in a new browser tab using BabelExt API.
          try {
            BabelExt.tabs.create(IMGZ.mediaImage.src, false);
          } catch (error) {
            console.warn("DisplayBoost: Failed to open new tab via BabelExt, falling back to native window.open:", error.message);
            window.open(IMGZ.mediaImage.src, '_blank'); // Fallback to standard window.open.
          }
        }
        break;
      default:
        // No action for other keys.
        break;
    }
  },

  /**
   * Asynchronously resolves the media source for a given link element by checking
   * for direct media files and then consulting site-specific plugins.
   * @param {HTMLElement} linkElement - The `<a>` or `<img>` DOM element to analyze.
   * @returns {Promise<Object|null>} A Promise that resolves with media data (type, src, title)
   *                                  or `null` if no recognizable media is found.
   */
  resolveMediaSource: function(linkElement) {
    // Basic validation for the link element.
    if (!linkElement || !linkElement.href) {
        return Promise.resolve(null);
    }

    return new Promise(async (resolve, reject) => {
        let detectedMediaData = null;

        // Step 1: First, attempt to detect direct media files (e.g., URLs ending in .jpg).
        // This is assumed to be a synchronous check returning an object or null.
        detectedMediaData = IMGZ.directMediaHandler.examineLink(linkElement);
        if (detectedMediaData && detectedMediaData.type) {
            return resolve(detectedMediaData); // If direct media found, resolve immediately.
        }

        // Step 2: Extract the hostname from the link's URL to find a matching plugin.
        let linkHostname = '';
        try {
            linkHostname = new URL(linkElement.href).hostname;
        } catch (urlError) {
            console.warn('DisplayBoost: Invalid URL encountered, cannot determine hostname:', linkElement.href, urlError);
            return resolve(null); // If URL is invalid, no plugin can be matched.
        }

        const pluginIdentifier = IMGZ.hostToPluginMap[linkHostname];
        const siteSpecificPlugin = pluginIdentifier ? IMGZ.registeredPlugins[pluginIdentifier] : null;
        
        // If a site-specific plugin is registered and has a `checkMediaSource` method, use it.
        if (siteSpecificPlugin && typeof siteSpecificPlugin.checkMediaSource === 'function') {
            try {
                // Await the plugin's asynchronous media checking result.
                detectedMediaData = await siteSpecificPlugin.checkMediaSource(linkElement);
                if (detectedMediaData && detectedMediaData.type) {
                    return resolve(detectedMediaData); // If plugin finds media, resolve.
                }
            } catch (pluginCheckError) {
                console.error(`DisplayBoost: Plugin "${pluginIdentifier}" failed during media source check:`, pluginCheckError);
                // Log the error but allow the process to continue if the plugin fails.
            }
        }

        // If no media is found by either direct check or site-specific plugins, resolve with null.
        resolve(null);
    });
  },

  // Utility object for handling direct media file detection based on URL extensions.
  directMediaHandler: {
    examineLink: function(linkElement) {
      const urlString = linkElement.href;
      if (!urlString) return null;

      // Regex patterns for common image and video file extensions.
      const imageFileExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|apng)(\?.*)?$/i;
      const videoFileExtensions = /\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i;
      // Additional media types could be added here (e.g., audio).

      if (imageFileExtensions.test(urlString)) {
        return {
          type: 'image',
          src: urlString,
          title: linkElement.title || linkElement.alt || linkElement.innerText || 'Direct Image'
        };
      } else if (videoFileExtensions.test(urlString)) {
        return {
          type: 'video', // New media type support.
          src: urlString,
          title: linkElement.title || linkElement.alt || linkElement.innerText || 'Direct Video'
        };
      }
      // Return null if no direct media match is found.
      return null;
    }
  },

  // Storage for all registered plugins, indexed by their unique key.
  registeredPlugins: {},
  // A map linking hostnames (e.g., 'imgur.com') to their corresponding plugin keys.
  hostToPluginMap: {}
};

// Initialize the DisplayBoost system once the DOM is fully loaded.
$(function() {
  DisplayBoost.initialize();
});

// --- Example Plugin Registrations (These would typically be loaded by BabelExt) ---

// 1. Register a default plugin for direct image/video links.
// This ensures that basic media files are always detected.
DisplayBoost.registerPlugin('standardMediaDetector', function(config) {
    // This plugin uses the internal directMediaHandler logic.
    this.checkMediaSource = DisplayBoost.directMediaHandler.examineLink;
    return this;
});

// 2. Example: Register a plugin for a hypothetical 'sample-site.com' that supports albums.
// This demonstrates how a plugin can provide specialized media detection logic.
DisplayBoost.registerPlugin('sampleSiteAlbumHandler', function(config) {
    // Specify the hostnames this plugin should handle.
    this.extraHosts = ['sample-site.com', 'www.sample-site.com'];

    // Override the default checkMediaSource for this specific site.
    this.checkMediaSource = async function(linkElement) {
        // First, try the standard direct media check.
        let mediaData = DisplayBoost.directMediaHandler.examineLink(linkElement);
        if (mediaData) {
            return mediaData; // If it's a direct image/video, use that.
        }

        // If not a direct file, check for a specific album URL pattern on sample-site.com.
        const linkURL = new URL(linkElement.href);
        if (linkURL.hostname === 'sample-site.com' && linkURL.pathname.startsWith('/album/')) {
            // Simulate an asynchronous API call to fetch album data.
            await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network latency.
            return {
                type: 'album',
                images: [
                    { src: 'https://via.placeholder.com/800x600/FF5733/FFFFFF?text=Sample+Image+A', title: 'Sunset View' },
                    { src: 'https://via.placeholder.com/600x800/33FF57/FFFFFF?text=Sample+Image+B', title: 'Forest Path' },
                    { src: 'https://via.placeholder.com/700x700/3357FF/FFFFFF?text=Sample+Image+C', title: 'City Lights' }
                ],
                title: 'Sample Site Album'
            };
        }
        return null; // No media found by this plugin.
    };
    return this;
});