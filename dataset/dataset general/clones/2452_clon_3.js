(function(jq) {
  // Core function to manage the application's modal display.
  // This serves as the primary entry point for programmatic usage.
  jq.modalPop = function(contentData, stylingClass) {
    // Initiate the visual loading state for the modal.
    jq.modalPop.displayLoader();

    // Determine the type of content to be loaded and delegate accordingly.
    // A small validation check for contentData type.
    if (!contentData || typeof contentData !== 'object' && typeof contentData !== 'function' && typeof contentData !== 'string') {
        console.error("Invalid content data provided to jq.modalPop.");
        return; // Early exit for invalid input
    }

    if (typeof contentData === 'string') {
      // Assume string is direct HTML content if no other type is specified.
      jq.modalPop.showContent(contentData, stylingClass);
    } else if (typeof contentData === 'function') {
      // If a function is provided, execute it with jQuery context.
      // This allows for custom asynchronous content loading.
      contentData.call(jq);
    } else if (contentData.remoteUrl) {
      // If 'remoteUrl' property is present, fetch content via AJAX.
      jq.modalPop.fetchRemoteContent(contentData.remoteUrl, stylingClass);
    } else if (contentData.graphic) {
      // If 'graphic' property is present, display an image.
      jq.modalPop.injectImageContent(contentData.graphic, stylingClass);
    } else if (contentData.elementId) {
      // If 'elementId' property is present, load content from a DOM element.
      jq.modalPop.populateModalFromLink(contentData.elementId, stylingClass);
    } else {
      // Default to direct HTML content if no specific type is matched.
      jq.modalPop.showContent(contentData, stylingClass);
    }
  };

  /*
   * Public API for the ModalPop module.
   * Contains configuration options and core functionalities.
   */
  jq.extend(jq.modalPop, {
    options: {
      transparency: 0.1, // Opacity for the overlay (0-1)
      showOverlay: true, // Whether to display a background overlay
      loaderGraphic: '/assets/img/spinner.gif', // Path to the loading animation image
      closeGraphic: '/assets/img/close.png', // Path to the close button image
      acceptableImageFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'], // Supported image file extensions
      initialZIndex: 9000, // Starting z-index for the modal and overlay
      closeOnEscape: true, // Allow closing the modal with the ESC key
      closeOnOverlayClick: true, // Allow closing the modal by clicking the overlay
      // Main HTML structure for the modal container.
      // Uses a modern div-based layout instead of tables for flexibility.
      modalPopHtml: '\
        <div id="modalBoxContainer" style="display:none; position:fixed; z-index:9001;"> \
          <div class="modal-dialog-wrapper"> \
            <div class="modal-header-section"> \
              <button type="button" class="modal-close-btn" aria-label="Close dialog"> \
                <img src="/assets/img/close.png" alt="Close" class="modal-close-icon" /> \
              </button> \
            </div> \
            <div class="modal-body-content"> \
              <div class="modal-inner-placeholder"></div> \
            </div> \
            <div class="modal-footer-area"></div> \
          </div> \
        </div>'
    },

    // Displays a loading indicator within the modal.
    displayLoader: function() {
      // Ensure the modal system is ready.
      initializeModal();

      // Check if a loader is already present to prevent duplicates.
      if (jq('#modalBoxContainer .modal-loading-indicator').length > 0) {
        return;
      }

      presentOverlay(); // Show the overlay if configured.

      // Clear previous content and insert the loading spinner.
      jq('#modalBoxContainer .modal-inner-placeholder').empty();
      jq('#modalBoxContainer .modal-body-content').children().hide();
      jq('#modalBoxContainer .modal-body-content').append(
        '<div class="modal-loading-indicator"><img src="' + jq.modalPop.options.loaderGraphic + '" alt="Loading..." /></div>'
      );

      // Position the modal and make it visible.
      const currentScroll = retrieveScrollPositions();
      const viewportHeight = retrieveViewportHeight();
      jq('#modalBoxContainer').css({
        top: currentScroll.y + (viewportHeight / 10), // Position from top of viewport
        left: '50%', // Start centered horizontally
        transform: 'translateX(-50%)' // Adjust for true horizontal centering
      }).show();

      // Bind ESC key to close the modal if enabled.
      if (jq.modalPop.options.closeOnEscape) {
        jq(document).on('keydown.modalPop', function(e) {
          if (e.key === 'Escape' || e.keyCode === 27) { // Check for 'Escape' key
            jq.modalPop.dismiss();
            return false; // Prevent default browser action
          }
        });
      }

      // Trigger a custom event indicating the loading state.
      jq(document).trigger('modalPop.loading');
    },

    // Reveals the actual content in the modal, replacing the loader.
    showContent: function(contentHtml, extraClass) {
      jq(document).trigger('modalPop.preDisplay'); // Before content is shown.

      const targetContentArea = jq('#modalBoxContainer .modal-inner-placeholder');
      if (extraClass) {
        jq('#modalBoxContainer .modal-dialog-wrapper').addClass(extraClass);
      }
      targetContentArea.html(contentHtml); // Set the new content.

      // Remove the loading indicator.
      jq('#modalBoxContainer .modal-loading-indicator').remove();

      // Fade in the new content.
      jq('#modalBoxContainer .modal-body-content').children().fadeIn('fast');

      // Recalculate and set the horizontal position for perfect centering.
      const dialogWidth = jq('#modalBoxContainer .modal-dialog-wrapper').outerWidth();
      jq('#modalBoxContainer').css('left', '50%').css('transform', `translateX(-${dialogWidth / 2}px)`);

      jq(document).trigger('modalPop.postDisplay').trigger('modalPop.afterDisplay'); // After content is fully revealed.
    },

    // Closes and cleans up the modal.
    dismiss: function() {
      jq(document).trigger('modalPop.dismiss'); // Trigger event before closing.
      return false; // Prevent default link behavior if called from a click.
    }
  });

  /*
   * Public jQuery plugin method for declarative usage.
   * Attaches modal functionality to selected elements (e.g., links).
   */
  jq.fn.modalPop = function(customOptions) {
    initializeModal(customOptions); // Ensure modal system is set up.

    // Define the event handler for elements triggering the modal.
    function linkActivationHandler(evt) {
      evt.preventDefault(); // Prevent default link navigation.

      jq.modalPop.displayLoader(); // Show loader immediately.

      // Extract a custom class from the 'rel' attribute if present.
      // e.g., rel="modalPop[my_custom_style]"
      let derivedClass = null;
      if (this.rel && typeof this.rel === 'string') {
        const classMatch = this.rel.match(/modalPop\[?\.?(\w+)?\]?/);
        if (classMatch && classMatch[1]) {
          derivedClass = classMatch[1];
        }
      }

      populateModalFromLink(this.href, derivedClass);
      return false;
    }

    // Attach the handler to all selected elements.
    return this.on('click', linkActivationHandler);
  };

  /*
   * Private helper functions for internal module operations.
   */

  // Initializes the modal system once per page load.
  function initializeModal(runtimeOptions) {
    // Prevent re-initialization.
    if (jq.modalPop.options.isInitialized) {
      return;
    }
    jq.modalPop.options.isInitialized = true;

    jq(document).trigger('modalPop.init'); // Notify that initialization is starting.
    normalizeOptions(); // Apply compatibility and default settings.

    // Compile regex for image types from options.
    const imageExtensions = jq.modalPop.options.acceptableImageFormats.join('|');
    jq.modalPop.options.imagePattern = new RegExp('\\.(' + imageExtensions + ')$', 'i');

    // Merge any provided runtime options.
    if (runtimeOptions) {
      jq.extend(jq.modalPop.options, runtimeOptions);
    }

    // Append the modal HTML structure to the document body.
    jq('body').append(jq.modalPop.options.modalPopHtml);

    // Preload essential images to avoid flickering.
    const imagePreloaders = [new Image(), new Image()];
    imagePreloaders[0].src = jq.modalPop.options.closeGraphic;
    imagePreloaders[1].src = jq.modalPop.options.loaderGraphic;

    // Set the source for the close button image dynamically.
    jq('#modalBoxContainer .modal-close-icon').attr('src', jq.modalPop.options.closeGraphic);

    // Attach the dismiss handler to the close button.
    jq('#modalBoxContainer .modal-close-btn').on('click', jq.modalPop.dismiss);
  }

  // Retrieves current horizontal and vertical scroll positions.
  // Based on QuirksMode.org's getPageScroll.
  function retrieveScrollPositions() {
    let scrollX = 0;
    let scrollY = 0;

    if (window.pageYOffset !== undefined) { // Modern browsers
      scrollY = window.pageYOffset;
      scrollX = window.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollTop !== undefined) { // IE6 Strict
      scrollY = document.documentElement.scrollTop;
      scrollX = document.documentElement.scrollLeft;
    } else if (document.body) { // Older IE and others
      scrollY = document.body.scrollTop;
      scrollX = document.body.scrollLeft;
    }
    return {
      x: scrollX,
      y: scrollY
    };
  }

  // Retrieves the current height of the viewport.
  // Adapted from QuirksMode.org's getPageSize.
  function retrieveViewportHeight() {
    let viewHeight;
    if (window.innerHeight !== undefined) { // All modern browsers
      viewHeight = window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight !== undefined) { // IE6 Strict Mode
      viewHeight = document.documentElement.clientHeight;
    } else if (document.body) { // Older IE and others
      viewHeight = document.body.clientHeight;
    }
    return viewHeight;
  }

  // Ensures backward compatibility for deprecated option names.
  // This helps transition from old naming conventions.
  function normalizeOptions() {
    const opts = jq.modalPop.options;

    // Check for old property names and map them to new ones.
    opts.loaderGraphic = opts.loading_image || opts.loaderGraphic;
    opts.closeGraphic = opts.close_image || opts.closeGraphic;
    opts.acceptableImageFormats = opts.image_types || opts.acceptableImageFormats;
    opts.modalPopHtml = opts.facebox_html || opts.modalPopHtml;

    // Ensure z-index is a number.
    if (typeof opts.initialZIndex !== 'number' || isNaN(opts.initialZIndex)) {
        opts.initialZIndex = 9000; // Fallback to default
    }
  }

  // Determines content type from a given href and loads it into the modal.
  // Supports div content, images, and AJAX.
  function populateModalFromLink(sourceHref, customStyleClass) {
    const currentUrl = window.location.href.split('#')[0];
    const targetIsFragment = sourceHref.startsWith('#') || (sourceHref.split('#')[0] === currentUrl && sourceHref.includes('#'));

    if (targetIsFragment) {
      // Content is a local DOM element fragment (e.g., #myDiv).
      const fragmentId = sourceHref.split('#')[1];
      const targetElement = jq('#' + fragmentId);

      if (targetElement.length > 0) {
        jq.modalPop.showContent(targetElement.clone().show(), customStyleClass);
      } else {
        jq.modalPop.showContent('<p>Error: Content element "' + sourceHref + '" not found.</p>', 'error-modal');
      }
    } else if (sourceHref.match(jq.modalPop.options.imagePattern)) {
      // Content is an image file.
      injectImageContent(sourceHref, customStyleClass);
    } else {
      // Assume content is an external page to be loaded via AJAX.
      fetchRemoteContent(sourceHref, customStyleClass);
    }
  }

  // Loads and displays an image within the modal.
  function injectImageContent(imageUrl, stylingOverrideClass) {
    const tempImage = new Image();
    jq(tempImage)
      .on('load', function() {
        jq.modalPop.showContent('<div class="modal-image-display"><img src="' + tempImage.src + '" alt="Modal Image" /></div>', stylingOverrideClass);
      })
      .on('error', function() {
        jq.modalPop.showContent('<p>Error loading image: ' + imageUrl + '</p>', 'error-modal');
      });
    tempImage.src = imageUrl;
  }

  // Fetches content from a remote URL via AJAX and displays it.
  function fetchRemoteContent(remoteLink, stylingModifierClass) {
    jq.ajax({
      url: remoteLink,
      type: 'GET',
      dataType: 'html', // Expect HTML content
      success: function(responseHtml) {
        jq.modalPop.showContent(responseHtml, stylingModifierClass);
      },
      error: function(xhr, status, error) {
        jq.modalPop.showContent('<p>Failed to load content from ' + remoteLink + '. Status: ' + status + '</p>', 'error-modal');
        console.error('AJAX Error:', error, xhr);
      }
    });
  }

  // Checks if the overlay should be skipped based on options.
  function shouldBypassOverlay() {
    return !jq.modalPop.options.showOverlay || jq.modalPop.options.transparency === null;
  }

  // Displays the background overlay.
  function presentOverlay() {
    if (shouldBypassOverlay()) {
      return;
    }

    let overlayElement = jq('#modalPop_backdrop');
    if (overlayElement.length === 0) {
      // Create and append overlay if it doesn't exist.
      overlayElement = jq('<div id="modalPop_backdrop" class="hidden-backdrop"></div>');
      jq('body').append(overlayElement);
    }

    overlayElement.css({
        'opacity': jq.modalPop.options.transparency,
        'z-index': jq.modalPop.options.initialZIndex // Use configured z-index
      })
      .removeClass('hidden-backdrop')
      .addClass('visible-backdrop')
      .off('click') // Remove previous click handlers
      .fadeIn(250); // Slightly longer fade for overlay.

    // Bind click to close overlay if enabled.
    if (jq.modalPop.options.closeOnOverlayClick) {
        overlayElement.on('click', function() {
            jq.modalPop.dismiss();
        });
    }
  }

  // Hides and removes the background overlay.
  function concealOverlay() {
    if (shouldBypassOverlay()) {
      return;
    }

    jq('#modalPop_backdrop').fadeOut(250, function() {
      jq(this).removeClass('visible-backdrop').addClass('hidden-backdrop').remove(); // Remove from DOM after fade.
    });
  }

  /*
   * Event bindings for overall modal behavior.
   */

  jq(document).on('modalPop.dismiss', function() {
    // Unbind the ESC key handler.
    jq(document).off('keydown.modalPop');

    // Fade out the modal container and perform cleanup.
    jq('#modalBoxContainer').fadeOut('fast', function() {
      // Reset content area classes and clear content.
      jq('#modalBoxContainer .modal-dialog-wrapper').removeClass(); // Remove all custom classes
      jq('#modalBoxContainer .modal-dialog-wrapper').addClass('modal-dialog-wrapper'); // Re-add base class
      jq('#modalBoxContainer .modal-inner-placeholder').empty();
      jq('#modalBoxContainer .modal-loading-indicator').remove(); // Ensure loader is gone.
      concealOverlay(); // Hide the overlay.
    });
  });

})(jQuery);