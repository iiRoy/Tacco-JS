// Expert code clone generation - Type III
// This script manages image filtering and UI interactions for a web-based photo editor.

// Core application state and configuration object
const imgFx = {
  scrollXOffset: 0, // Horizontal scroll position for the footer menu
  scrollYOffset: 0, // Vertical scroll position for the footer menu
  currentOrientation: 0, // 0 for portrait, 1 for landscape
  doubleTapActive: false, // Flag for double-tap detection on mobile
  zoomModeEnabled: false, // Indicates if the image zoom/capture mode is active
  styleInfoPanel: null, // Reference to the dynamically created style information panel
  isMobileDevice: false, // Flag indicating if the user agent is a recognized mobile device
  isWebAppMode: false, // Flag indicating if the application is running in standalone web app mode
  osCompatibilityWarning: null, // Reference to the OS compatibility warning element

  // Offsets for menu item selection indicator in landscape orientation
  landscapeMenuOffsets: {
    'saturate': 80,
    'brightness': 132,
    'contrast': 184,
    'huerotate': 236,
    'invert': 288,
    'blur': 340,
    'sepia': 392,
    'grayscale': 444,
    'opacity': 496
  },

  // Offsets for menu item selection indicator in portrait orientation
  portraitMenuOffsets: {
    'saturate': 109,
    'brightness': 175,
    'contrast': 241,
    'huerotate': 307,
    'invert': 373,
    'blur': 439,
    'sepia': 505,
    'grayscale': 571,
    'opacity': 638
  },

  // Initial filter values for resetting
  initialFilterSettings: {
    'saturate': 100,
    'brightness': 0,
    'contrast': 100,
    'huerotate': 0,
    'invert': 0,
    'blur': 0,
    'sepia': 0,
    'grayscale': 0,
    'opacity': 100
  },

  // Current active filter values, dynamically updated by sliders
  activeFilterValues: {
    'saturate': 100,
    'brightness': 0,
    'contrast': 100,
    'huerotate': 0,
    'invert': 0,
    'blur': 0,
    'sepia': 0,
    'grayscale': 0,
    'opacity': 100
  },

  // Timers for introductory animation sequence
  introAnimationTimer: null,
  introPhaseOne: null,
  introPhaseTwo: null,

  // Viewport dimensions
  viewportWidth: 0,
  viewportHeight: 0,

  // Original and displayed image dimensions
  originalImageWidth: 0,
  originalImageHeight: 0,
  displayedImageWidth: 0,
  displayedImageHeight: 0,

  // Element for the video overlay
  demoVideoOverlay: null,

  // Debug mode flag
  debugMode: false,

  // Cached jQuery selectors for performance
  $displayArea: null,
  $imageContainer: null,
  $mainImage: null,
  $footerMenu: null,
  $sliderControl: null,
  $refreshButton: null,
  $infoButton: null,
  $backButton: null,
  $disabledOverlay: null,
  $bodyElement: null,
  $wrapperElement: null,
  $fileInput: null
};


// Utility function to debounce resize events
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

// Application initialization and event binding
jQuery(document).ready(function($) {
  // Cache frequently used jQuery selectors
  imgFx.$displayArea = $('#display');
  imgFx.$imageContainer = $('#photo');
  imgFx.$mainImage = $('#photo img');
  imgFx.$footerMenu = $('#footer');
  imgFx.$sliderControl = $('#slider');
  imgFx.$refreshButton = $('#refresh');
  imgFx.$infoButton = $('#info');
  imgFx.$backButton = $('#back');
  imgFx.$disabledOverlay = $('#disabled');
  imgFx.$bodyElement = $('body');
  imgFx.$wrapperElement = $('#wrapper');
  imgFx.$fileInput = $('input[type=file]');

  imgFx.initializeApplication(); // Start the app

  // Handle window resizing with debouncing
  $(window).on('resize', debounce(() => {
    imgFx.updateOrientationState();
    imgFx.syncMenuScrollPosition();
    // Temporarily hide parts of the UI on mobile during resize to prevent visual glitches
    if (imgFx.isMobileDevice) {
      imgFx.$disabledOverlay.css({ 'display': 'block', 'opacity': 0 });
      setTimeout(() => { // Use a small timeout to ensure reflow before hiding
        imgFx.$disabledOverlay.css({ 'display': 'none', 'opacity': 1 });
      }, 100); // Increased timeout slightly for better stability
    }
  }, 200)); // Debounce for 200ms

  // Click handler for footer menu items (filter selection)
  imgFx.$footerMenu.find('a').on('click', function(e) {
    e.preventDefault(); // Prevent default link behavior
    imgFx.resetSliderDisplay(); // Hide previously selected slider
    imgFx.activateFilterControl(this); // Show current slider
  });

  // Scroll handler for the footer menu
  imgFx.$footerMenu.on('scroll', () => {
    imgFx.syncMenuScrollPosition(); // Update scroll offsets
  });

  // Change handler for filter range sliders
  imgFx.$sliderControl.find('input[type="range"]').on('input', function() { // Use 'input' for real-time updates
    const filterName = $(this).attr('name');
    const filterValue = $(this).val(); // Use .val() for input values
    imgFx.activeFilterValues[filterName] = parseInt(filterValue, 10); // Ensure numeric value
    $(`#${filterName}-slider output span`).text(filterValue); // Update display
    imgFx.applyCurrentFilters(); // Apply filters to image
  });
  // Also handle 'change' for compatibility and final value setting
  imgFx.$sliderControl.find('input[type="range"]').on('change', function() {
    const filterName = $(this).attr('name');
    const filterValue = $(this).val();
    imgFx.activeFilterValues[filterName] = parseInt(filterValue, 10);
    $(`#${filterName}-slider output span`).text(filterValue);
    imgFx.applyCurrentFilters();
  });


  // Reset filters button click handler
  imgFx.$refreshButton.on('click', function(e) {
    e.preventDefault();
    imgFx.hideActiveSlider();
    imgFx.restoreInitialFilters();
  });

  // Info button click handler (flips display)
  imgFx.$infoButton.on('click', function(e) {
    e.preventDefault();
    imgFx.hideActiveSlider();
    imgFx.$displayArea.addClass('flip');
  });

  // Back button click handler (unflips display)
  imgFx.$backButton.on('click', function(e) {
    e.preventDefault();
    imgFx.$displayArea.removeClass('flip');
  });

  // Photo container click handler (blurs slider if active)
  imgFx.$imageContainer.on('click', function(e) {
    e.preventDefault();
    imgFx.hideActiveSlider();
  });

  // Double-click for zoom mode
  imgFx.$mainImage.on('dblclick', () => {
    imgFx.toggleZoomMode();
  });

  // Touchend for mobile double-tap detection
  imgFx.$mainImage.on('touchend', function() {
    if (imgFx.doubleTapActive) {
      imgFx.toggleZoomMode();
      imgFx.doubleTapActive = false;
    } else {
      imgFx.doubleTapActive = true;
      // Reset double tap flag after a short delay
      setTimeout(() => {
        imgFx.doubleTapActive = false;
      }, 400); // Slightly reduced timeout for responsiveness
    }
  });

  // File input click handler
  imgFx.$fileInput.on('click', () => {
    imgFx.hideActiveSlider(); // Hide slider when file dialog opens
  });

  // File input change handler (image upload)
  imgFx.$fileInput.on('change', function() {
    imgFx.$disabledOverlay.css('display', imgFx.isMobileDevice ? '-webkit-box' : 'block'); // Show loading overlay

    const uploadElement = $(this);
    if (uploadElement.val()) { // Only proceed if a file is selected
      uploadElement.upload('upload.php', function(response) {
        imgFx.$disabledOverlay.hide(); // Hide loading overlay
        if (response && response.result) {
          imgFx.$mainImage.attr('src', 'images/' + response.filename);
          imgFx.restoreInitialFilters();
          imgFx.loadImageDimensions(); // Recalculate image dimensions after upload
        } else {
          // Provide more specific error if available, or a generic message
          alert('Image upload failed. Please try again.' + (response && response.message ? '\nReason: ' + response.message : ''));
        }
      }, 'json')
      .fail(function() { // Add a fail handler for the upload plugin
          imgFx.$disabledOverlay.hide();
          alert('An error occurred during upload. Check server connection.');
      });
    } else {
      imgFx.$disabledOverlay.hide(); // Hide overlay if no file was selected
    }
  });

  // Toggle fullscreen/webapp mode
  $('#force-webapp').on('click', function() {
    const $this = $(this);
    const isCurrentlyOn = $this.hasClass('on');

    if (isCurrentlyOn) {
      $this.removeClass('on').text('OFF');
      setTimeout(() => {
        imgFx.$bodyElement.removeClass('fullscreen');
      }, 300); // Slightly adjusted delay
    } else {
      $this.addClass('on').text('ON');
      setTimeout(() => {
        imgFx.$bodyElement.addClass('fullscreen');
      }, 300);
    }
  });
});


// --- Application Core Functions ---

/**
 * Initializes the application: detects environment, sets up UI, and loads initial content.
 */
imgFx.initializeApplication = function() {
  // Mobile device detection
  const userAgent = navigator.userAgent;
  imgFx.isMobileDevice = (
    (userAgent.includes('iPhone') && !userAgent.includes('iPad')) ||
    userAgent.includes('iPod') ||
    userAgent.includes('Android') ||
    userAgent.includes('BlackBerry') ||
    userAgent.includes('Windows Phone')
  );

  if (imgFx.isMobileDevice) {
    document.title = 'PhotoFX Editor';
    imgFx.$bodyElement.addClass('mobile');

    // Display iOS6 compatibility warning (simplified/modernized)
    // This warning might be less relevant now, but kept for structural cloning.
    if (userAgent.includes('iPhone OS 6') === false) { // Check if NOT iOS6
      imgFx.osCompatibilityWarning = $('<div/>', {
        id: 'os-alert',
        html: '<div><p>For optimal experience, iOS6+ is recommended!</p><span>Tap to dismiss</span></div>'
      }).on('click', function() {
        $(this).fadeOut(200, function() { $(this).remove(); });
      });
      imgFx.$displayArea.append(imgFx.osCompatibilityWarning);
    }
  }

  // Web app mode detection (iOS standalone mode)
  if (window.navigator.standalone) {
    imgFx.isWebAppMode = true;
    imgFx.$bodyElement.addClass('webapp');
  }

  // Set initial orientation
  imgFx.updateOrientationState();

  // Desktop specific UI elements and initial demo content
  if (!imgFx.isMobileDevice) {
    imgFx.$wrapperElement.addClass('start').append(
      `<img src="images/iphone.png" id="iphone-mockup" alt="iPhone Mockup">
       <a href="#" class="btn-check-style" onclick="imgFx.toggleStyleInfo(); return false;">View Filter Details</a>`
    );

    // Dynamic PC info panel creation
    const pcInfoPanel = $(`
      <div id="desktop-info">
        <img src="images/logo.png" id="desktop-logo" alt="Logo">
        <p id="desktop-text">
          PhotoFX Editor is a demonstration showcasing CSS filter capabilities and modern web UI.
          <span>Supported browsers include Chrome (20+), Safari (6+), and iOS6+.
          <a href="http://d.hatena.ne.jp/kudakurage/" target="_blank">Learn more about this project</a></span>
        </p>
        <a href="#" class="btn-show-video" onclick="imgFx.displayDemoVideo(); return false;">
          <img src="images/video.png" alt="Video Icon">
          <span>DEMO on iOS simulator</span>
        </a>
        <ul id="feature-list">
          <li class="upload-feature">File Input (upload)</li>
          <li class="filter-feature">CSS Filters</li>
          <li class="slider-feature">Custom Range Sliders</li>
          <li class="orientation-feature">Responsive Layout</li>
        </ul>
        <div class="author-profile">
          <a href="http://d.hatena.ne.jp/kudakurage/" target="_blank"><img src="images/profile.png" class="profile-avatar" alt="Profile Avatar"></a>
          <p class="profile-name">Kazuyuki Motoyama<span>Kudakurage</span></p>
          <p class="profile-social-links">
            <a href="https://twitter.com/kudakurage" class="social-twitter" target="_blank">Twitter</a>
            <a href="http://dribbble.com/kudakurage" class="social-dribbble" target="_blank">Dribbble</a>
            <a href="https://github.com/kudakurage" class="social-github" target="_blank">GitHub</a>
          </p>
          <p class="profile-bio">
            Web designer based in Kyoto, focusing on UI/UX, App Design, Illustration, HTML5/CSS3, Javascript, and PHP.
          </p>
          <p class="copyright-notice">Copyright &copy; 2012 kazuyuki motoyama</p>
        </div>
      </div>
    `);
    imgFx.$wrapperElement.append(pcInfoPanel);

    imgFx.demoVideoOverlay = $('<div/>', { id: 'video-overlay' }).on('click', () => imgFx.hideDemoVideo());
    imgFx.$bodyElement.append(imgFx.demoVideoOverlay);
  }

  // Attempt to load a sample image and trigger introductory animation
  $.ajax({
    url: "images/sample.png",
    type: "HEAD", // Use HEAD request to check for existence without downloading full content
    success: function() {
      imgFx.$wrapperElement.removeClass('start');
      imgFx.$mainImage.attr('src', 'images/sample.png'); // Set sample image
      imgFx.loadImageDimensions(); // Get natural dimensions

      // Start introductory animation sequence
      imgFx.introAnimationTimer = setTimeout(() => {
        imgFx.activateFilterControl($('#saturate').get(0)); // Select saturate filter
        imgFx.introPhaseOne = setTimeout(() => {
          let currentSaturateValue = imgFx.activeFilterValues['saturate'];
          imgFx.introPhaseTwo = setInterval(() => {
            currentSaturateValue = Math.min(currentSaturateValue + 3, 148); // Increment saturate value
            $(`#saturate-slider input`).val(currentSaturateValue).trigger('input'); // Update slider and trigger event
            if (currentSaturateValue >= 148) {
              clearInterval(imgFx.introPhaseTwo);
              imgFx.introPhaseTwo = null;
            }
          }, 10); // Faster interval for smoother animation
        }, 600);
      }, 1000);
    },
    error: function() {
      console.warn("Sample image 'images/sample.png' not found. Skipping intro animation.");
      imgFx.$wrapperElement.removeClass('start');
      // Optionally set a default placeholder image
      // imgFx.$mainImage.attr('src', 'images/placeholder.png');
    }
  });

  imgFx.checkDebugMode(); // Check for debug hash in URL
};

/**
 * Activates and displays the slider control for a selected filter.
 * @param {HTMLElement} filterMenuItem The clicked menu item element.
 */
imgFx.activateFilterControl = function(filterMenuItem) {
  const filterId = $(filterMenuItem).attr('id');
  if (!filterId) {
    console.warn("Attempted to activate filter control without a valid ID.");
    return;
  }

  // Ensure only the current item is selected
  imgFx.$footerMenu.find('a').removeClass('selected');
  $(filterMenuItem).addClass('selected');

  // Position the slider based on orientation
  if (imgFx.currentOrientation === 0) { // Portrait
    const menuLeftMargin = parseInt(imgFx.$footerMenu.find('menu').css('marginLeft'), 10) || 0;
    const backgroundPositionX = -320 + menuLeftMargin + (imgFx.portraitMenuOffsets[filterId] || 0) - imgFx.scrollXOffset;
    imgFx.$sliderControl.css('backgroundPosition', `${backgroundPositionX}px 0`);
  } else if (imgFx.currentOrientation === 1) { // Landscape
    const webappOffset = imgFx.isWebAppMode ? 20 : 0;
    const sliderPositionY = -25 + webappOffset + (imgFx.landscapeMenuOffsets[filterId] || 0) - imgFx.scrollYOffset;
    imgFx.$sliderControl.css('top', `${sliderPositionY}px`);
  }

  imgFx.$sliderControl.attr('data-active-filter', filterId); // Use data attribute for active filter
  imgFx.$sliderControl.fadeIn(300);
};

/**
 * Resets the display of the slider control and removes selection from menu items.
 */
imgFx.resetSliderDisplay = function() {
  imgFx.$footerMenu.find('a').removeClass('selected');
  imgFx.$sliderControl.removeAttr('data-active-filter'); // Clear active filter data attribute
};

/**
 * Hides the active slider control with a fade-out animation.
 */
imgFx.hideActiveSlider = function() {
  imgFx.resetSliderDisplay();
  imgFx.$sliderControl.fadeOut(300);
};

/**
 * Applies the currently stored filter values to the main image using webkit-filter CSS.
 */
imgFx.applyCurrentFilters = function() {
  const filters = imgFx.activeFilterValues;
  const filterString = `
    saturate(${filters.saturate}%)
    brightness(${filters.brightness}%)
    contrast(${filters.contrast}%)
    hue-rotate(${filters.huerotate}deg)
    invert(${filters.invert}%)
    blur(${filters.blur}px)
    sepia(${filters.sepia}%)
    grayscale(${filters.grayscale}%)
    opacity(${filters.opacity}%)
  `;
  imgFx.$mainImage.css('-webkit-filter', filterString);
  imgFx.$mainImage.css('filter', filterString); // Also apply standard filter for wider compatibility
};

/**
 * Resets all filters to their initial default values and updates the UI.
 */
imgFx.restoreInitialFilters = function() {
  // Clear any active intro animations
  if (imgFx.introAnimationTimer) clearTimeout(imgFx.introAnimationTimer);
  if (imgFx.introPhaseOne) clearTimeout(imgFx.introPhaseOne);
  if (imgFx.introPhaseTwo) clearInterval(imgFx.introPhaseTwo);

  // Iterate over initial settings and apply them
  Object.keys(imgFx.initialFilterSettings).forEach(key => {
    const initialVal = imgFx.initialFilterSettings[key];
    $(`#${key}-slider input`).val(initialVal);
    $(`#${key}-slider output span`).text(initialVal);
    imgFx.activeFilterValues[key] = initialVal;
  });

  // Apply a temporary animation class for visual feedback
  imgFx.$mainImage.addClass('filter-reset-animation');
  imgFx.applyCurrentFilters(); // Apply the reset filters

  // Remove animation class after its duration
  setTimeout(() => {
    imgFx.$mainImage.removeClass('filter-reset-animation');
  }, 1000);
};

/**
 * Updates the stored scroll positions of the footer menu and hides any active slider.
 */
imgFx.syncMenuScrollPosition = function() {
  imgFx.hideActiveSlider(); // Hide slider when menu scrolls
  imgFx.scrollXOffset = imgFx.$footerMenu.scrollLeft();
  imgFx.scrollYOffset = imgFx.$footerMenu.scrollTop();
};

/**
 * Toggles the visibility of a detailed CSS style information panel.
 * This panel displays the current filter values in CSS format.
 */
imgFx.toggleStyleInfo = function() {
  if (imgFx.styleInfoPanel) {
    imgFx.styleInfoPanel.remove();
    imgFx.styleInfoPanel = null;
  } else {
    // Generate HTML for the style info panel
    const currentFilters = imgFx.activeFilterValues;
    const infoHtml = `
      <h2>-webkit-filter:</h2>
      <p>saturate(<span>${currentFilters.saturate}%</span>)</p>
      <p>brightness(<span>${currentFilters.brightness}%</span>)</p>
      <p>contrast(<span>${currentFilters.contrast}%</span>)</p>
      <p>hue-rotate(<span>${currentFilters.huerotate}deg</span>)</p>
      <p>invert(<span>${currentFilters.invert}%</span>)</p>
      <p>blur(<span>${currentFilters.blur}px</span>)</p>
      <p>sepia(<span>${currentFilters.sepia}%</span>)</p>
      <p>grayscale(<span>${currentFilters.grayscale}%</span>)</p>
      <p>opacity(<span>${currentFilters.opacity}%</span>)</p>
    `;
    imgFx.styleInfoPanel = $('<div/>', { id: 'style-details-panel', html: infoHtml });
    imgFx.styleInfoPanel.on('click', () => imgFx.toggleStyleInfo()); // Click to dismiss
    imgFx.$wrapperElement.append(imgFx.styleInfoPanel);
  }
};

/**
 * Detects and updates the application's orientation state (portrait/landscape).
 */
imgFx.updateOrientationState = function() {
  imgFx.viewportWidth = imgFx.$displayArea.width();
  imgFx.viewportHeight = imgFx.$displayArea.height();

  // Determine orientation based on viewport dimensions
  imgFx.currentOrientation = (imgFx.viewportWidth > imgFx.viewportHeight) ? 1 : 0; // 1 = landscape, 0 = portrait

  // Apply appropriate body classes
  if (imgFx.currentOrientation === 0) {
    imgFx.$bodyElement.removeClass("landscape").addClass("portrait");
  } else {
    imgFx.$bodyElement.removeClass("portrait").addClass("landscape");
  }
};

/**
 * Toggles a zoom/capture mode for the main image.
 * In zoom mode, the image scales to fit the display area if larger.
 */
imgFx.toggleZoomMode = function() {
  // Ensure image dimensions are loaded
  if (!imgFx.originalImageWidth || !imgFx.originalImageHeight) {
    imgFx.loadImageDimensions();
  }

  // Apply a temporary animation class for visual feedback
  imgFx.$mainImage.addClass('zoom-animation');
  setTimeout(() => {
    imgFx.$mainImage.removeClass('zoom-animation');
  }, 700); // Animation duration

  if (imgFx.zoomModeEnabled) {
    // Exit zoom mode: revert image scale and show controls
    imgFx.$mainImage.css('transform', 'scale(1)');
    imgFx.$refreshButton.fadeIn(400);
    imgFx.$infoButton.fadeIn(400);
    imgFx.$footerMenu.fadeIn(400);
    imgFx.zoomModeEnabled = false;
  } else {
    // Enter zoom mode: calculate and apply zoom, hide controls
    let zoomFactor = 1;

    if (imgFx.originalImageWidth > imgFx.viewportWidth && imgFx.originalImageHeight > imgFx.viewportHeight) {
      // Image is larger than viewport, calculate zoom to fit
      const widthRatio = imgFx.viewportWidth / imgFx.displayedImageWidth;
      const heightRatio = imgFx.viewportHeight / imgFx.displayedImageHeight;
      zoomFactor = Math.min(widthRatio, heightRatio); // Fit by the smaller ratio
    } else if (imgFx.originalImageWidth > imgFx.viewportWidth) {
      zoomFactor = imgFx.viewportWidth / imgFx.displayedImageWidth;
    } else if (imgFx.originalImageHeight > imgFx.viewportHeight) {
      zoomFactor = imgFx.viewportHeight / imgFx.displayedImageHeight;
    }

    imgFx.$mainImage.css('transform', `scale(${zoomFactor})`);
    imgFx.hideActiveSlider(); // Ensure slider is hidden
    imgFx.$refreshButton.fadeOut(400);
    imgFx.$infoButton.fadeOut(400);
    imgFx.$footerMenu.fadeOut(400);
    imgFx.zoomModeEnabled = true;
  }
};

/**
 * Displays the demo video overlay with an embedded YouTube player.
 */
imgFx.displayDemoVideo = function() {
  if (!imgFx.demoVideoOverlay) { // Guard clause
    console.error("Video overlay element not initialized.");
    return false;
  }
  imgFx.demoVideoOverlay.html(`
    <div id="video-embed-container">
      <iframe width="640" height="360" src="https://www.youtube.com/embed/Z5bFwu5WSeg?rel=0&autoplay=1&controls=0&showinfo=0"
        frameborder="0" allowfullscreen title="Demo Video"></iframe>
    </div>
  `);
  imgFx.demoVideoOverlay.addClass('show-overlay');
  return false;
};

/**
 * Hides the demo video overlay and clears its content.
 */
imgFx.hideDemoVideo = function() {
  if (!imgFx.demoVideoOverlay) return; // Guard clause
  imgFx.demoVideoOverlay.removeClass('show-overlay').delay(600).queue(function(next) {
    $(this).empty(); // Clear iframe content after animation
    next();
  });
};

/**
 * Checks the URL hash for debug mode activation.
 */
imgFx.checkDebugMode = function() {
  const urlHash = window.location.hash;
  imgFx.debugMode = (urlHash === '#dev' || urlHash === '#debug');
  if (imgFx.debugMode) {
    console.info("Debug mode activated!");
  }
};

/**
 * Loads the natural (original) dimensions of the main image.
 */
imgFx.loadImageDimensions = function() {
  const imageElement = imgFx.$mainImage[0];
  if (imageElement && imageElement.naturalWidth && imageElement.naturalHeight) {
    imgFx.originalImageWidth = imageElement.naturalWidth;
    imgFx.originalImageHeight = imageElement.naturalHeight;
    imgFx.displayedImageWidth = imgFx.$mainImage.width(); // Get rendered width
    imgFx.displayedImageHeight = imgFx.$mainImage.height(); // Get rendered height
  } else {
    // If image not loaded yet, try again after a small delay
    setTimeout(() => {
      const img = imgFx.$mainImage[0];
      if (img && img.naturalWidth && img.naturalHeight) {
        imgFx.originalImageWidth = img.naturalWidth;
        imgFx.originalImageHeight = img.naturalHeight;
        imgFx.displayedImageWidth = imgFx.$mainImage.width();
        imgFx.displayedImageHeight = imgFx.$mainImage.height();
      } else {
        console.warn("Could not retrieve natural image dimensions.");
      }
    }, 100);
  }
};