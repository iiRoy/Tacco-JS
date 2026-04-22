// Core configuration object for image manipulation utilities
var picTool = {
  footPanelScrollX: 0, // Records horizontal scroll offset of the footer navigation
  footPanelScrollY: 0, // Records vertical scroll offset of the footer navigation
  displayAspect: 0, // Screen orientation: 0 for vertical, 1 for horizontal layout
  doubleTouch: false, // Internal flag to detect consecutive tap actions
  zoomModeActive: false, // Status indicator for the image magnification mode
  stylePreviewElement: false, // Holds a reference to the dynamically generated style information panel
  isMobileDevice: false, // Determines if the current browsing environment is a mobile platform
  operatingSystemAlert: null, // Stores a UI element for displaying OS-specific compatibility warnings
  isWebAppMode: false, // Flag indicating if the application is running in a standalone web app context
  initialDisplayTimer: null, // Primary timer for managing the introductory visual sequence
  initialDisplayTimerOne: null, // First stage timer for the application's initial animation
  initialDisplayTimerTwo: null, // Second stage timer for the application's initial animation
  viewPortWidth: 0, // Current width dimension of the visible display area
  viewPortHeight: 0, // Current height dimension of the visible display area
  imageNativeWidth: 0, // The intrinsic pixel width of the loaded image asset
  imageNativeHeight: 0, // The intrinsic pixel height of the loaded image asset
  imageRenderedWidth: 0, // The current displayed width of the image on screen
  imageRenderedHeight: 0, // The current displayed height of the image on screen
  developerMode: false // A boolean to activate or deactivate debugging functionalities
};

// Mapping of image filter names to their corresponding horizontal pixel offsets in landscape mode
picTool.horizMenuPosMap = {
  'saturate': 80, // Offset for the 'saturate' filter control
  'brightness': 132, // Offset for the 'brightness' filter control
  'contrast': 184, // Offset for the 'contrast' filter control
  'huerotate': 236, // Offset for the 'huerotate' filter control
  'invert': 288, // Offset for the 'invert' filter control
  'blur': 340, // Offset for the 'blur' filter control
  'sepia': 392, // Offset for the 'sepia' filter control
  'grayscale': 444, // Offset for the 'grayscale' filter control
  'opacity': 496 // Offset for the 'opacity' filter control
};

// Mapping of image filter names to their corresponding vertical pixel offsets in portrait mode
picTool.vertMenuPosMap = {
  'saturate': 109, // Offset for the 'saturate' filter control
  'brightness': 175, // Offset for the 'brightness' filter control
  'contrast': 241, // Offset for the 'contrast' filter control
  'huerotate': 307, // Offset for the 'huerotate' filter control
  'invert': 373, // Offset for the 'invert' filter control
  'blur': 439, // Offset for the 'blur' filter control
  'sepia': 505, // Offset for the 'sepia' filter control
  'grayscale': 571, // Offset for the 'grayscale' filter control
  'opacity': 638 // Offset for the 'opacity' filter control
};

// Defines the default starting values for each image filter
picTool.initialEffectSettings = {
  'saturate': 100, // Default saturation level in percentage
  'brightness': 0, // Default brightness level in percentage
  'contrast': 100, // Default contrast level in percentage
  'huerotate': 0, // Default hue rotation angle in degrees
  'invert': 0, // Default invert level in percentage
  'blur': 0, // Default blur radius in pixels
  'sepia': 0, // Default sepia tone level in percentage
  'grayscale': 0, // Default grayscale level in percentage
  'opacity': 100 // Default opacity level in percentage
};

// Stores the currently active values for all applied image filters
picTool.currentEffectValues = {
  'saturate': 100, // Current saturation level in percentage
  'brightness': 0, // Current brightness level in percentage
  'contrast': 100, // Current contrast level in percentage
  'huerotate': 0, // Current hue rotation angle in degrees
  'invert': 0, // Current invert level in percentage
  'blur': 0, // Current blur radius in pixels
  'sepia': 0, // Current sepia tone level in percentage
  'grayscale': 0, // Current grayscale level in percentage
  'opacity': 100 // Current opacity level in percentage
};


// Main document ready block for event handlers
jQuery(function() {

  picTool.initializeApp(); // Execute the primary application setup routine

  jQuery(window).resize(function() { // Attach a listener for window resizing events
    picTool.updateDisplayOrientation(); // Re-evaluate and adjust the screen orientation
    picTool.monitorMenuScroll(); // Check and potentially correct menu scroll positions
    if (picTool.isMobileDevice) { // Conditional logic for mobile environments
      jQuery('#disabled').css({
        'display': 'block',
        'opacity': 0
      }); // Temporarily display a blocking overlay
      var timeoutId = setTimeout(function() { // Schedule overlay removal
        jQuery('#disabled').css({
          'display': 'none',
          'opacity': 1
        }); // Hide the overlay after a brief moment
      }, 0);
    }
  });

  jQuery('#footer a').click(function() { // Handle click events on footer navigation links
    picTool.resetSliderDisplay(this); // Ensure any active slider panel is reset
    picTool.selectMenuItem(this); // Highlight the newly selected menu option
    return false; // Prevent the default action of the anchor tag
  });

  jQuery('#footer').scroll(function() { // Monitor scrolling activity within the footer element
    picTool.monitorMenuScroll(); // Update scroll state and manage slider visibility
  });

  jQuery('#slider input[type="range"]').change(function() { // Respond to changes in range input sliders
    var effectName = jQuery(this).attr('name'); // Retrieve the specific filter identifier
    var effectValue = jQuery(this).attr('value'); // Obtain the current numerical value of the slider
    picTool.currentEffectValues[effectName] = effectValue; // Update the global state with the new filter value
    jQuery('#' + effectName + '-slider output span').text(effectValue); // Reflect the change in the UI output
    picTool.applyImageEffects(); // Apply all current filter settings to the displayed image
  });

  jQuery('#refresh').click(function() { // Handle clicks on the refresh button
    picTool.hideSliderPanel(); // Conceal the active slider panel
    picTool.revertEffectsToDefaults(); // Reset all image filters to their predefined initial states
    return false; // Suppress default link behavior
  });

  jQuery('#info').click(function() { // Handle clicks on the information button
    picTool.hideSliderPanel(); // Hide the current slider interface
    jQuery('#display').addClass('flip'); // Initiate a 'flip' animation effect on the display area
    return false; // Block the default link action
  });

  jQuery('#back').click(function() { // Handle clicks on the back button
    jQuery('#display').removeClass('flip'); // Reverse the 'flip' animation on the display area
    return false; // Prevent the default link action
  });

  jQuery('#photo').click(function() { // Handle general clicks within the photo display region
    picTool.hideSliderPanel(); // Ensure the slider panel is hidden
    return false; // Prevent any default click actions
  });

  jQuery('#photo img').dblclick(function() { // Respond to double-click events on the main image
    picTool.toggleZoomCapture(); // Activate or deactivate the image capture/zoom mode
  });

  jQuery('#photo img').bind('touchend', function() { // Bind a 'touchend' event for mobile double-tap detection
    if (picTool.doubleTouch) { // If a previous tap was registered recently
      picTool.toggleZoomCapture(); // Engage the capture/zoom functionality
      picTool.doubleTouch = false; // Reset the double-tap detection flag
    } else { // For the first tap in a potential double-tap sequence
      picTool.doubleTouch = true; // Set the flag to true
    }
    setTimeout(function() { // Schedule a reset for the double-tap flag
      picTool.doubleTouch = false; // Reset after a short interval to prevent false positives
    }, 500);
  });

  jQuery('input[type=file]').click(function() { // Handle click events on file input elements
    picTool.hideSliderPanel(); // Hide the slider panel when a file input is interacted with
  });

  jQuery('input[type=file]').change(function() { // Respond to file selection changes in file input elements
    if (picTool.isMobileDevice) { // Differentiate display behavior for mobile devices
      jQuery('#disabled').css('display', '-webkit-box'); // Use specific mobile display style
    } else {
      jQuery('#disabled').show(); // Standard display for non-mobile environments
    }
    jQuery(this).upload('upload.php', function(responseObject) { // Initiate file upload to the server
      jQuery('#disabled').hide(); // Conceal the disabled overlay upon upload completion
      if (responseObject.result) { // Check if the upload operation was successful
        jQuery('#photo img').attr('src', 'images/' + responseObject.filename); // Update the image source with the uploaded file
        picTool.revertEffectsToDefaults(); // Reset all filters for the newly loaded image
      } else {
        alert('Sorry, upload failed.'); // Inform the user about an upload failure
      }
    }, 'json'); // Specify JSON as the expected response data type
  });

  jQuery('#force-webapp').toggle(function() { // Implement a toggle switch for web app fullscreen mode
    jQuery(this).addClass('on').text('ON'); // Set button state to 'ON' and add corresponding class
    setTimeout(function() { // Introduce a delay before applying fullscreen class
      jQuery('body').addClass('fullscreen'); // Apply fullscreen styling to the body element
    }, 350);
  }, function() { // Second state of the toggle, to turn off web app mode
    jQuery(this).removeClass('on').text('OFF'); // Set button state to 'OFF' and remove class
    setTimeout(function() { // Introduce a delay before removing fullscreen class
      jQuery('body').removeClass('fullscreen'); // Remove fullscreen styling from the body element
    }, 350);
  });
});

// Definition of primary application functions within the picTool object
picTool.initializeApp = function() { // Function to perform initial setup of the application
  // Detect various mobile user agents to set mobile device flag
  if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
    picTool.isMobileDevice = true; // Mark as a mobile device if agent string matches
    document.title = 'PhotoEditor'; // Set the browser tab title
    if (navigator.userAgent.indexOf('iPhone OS 6') == -1) { // Check for specific iOS version compatibility
      picTool.operatingSystemAlert = jQuery('<div/>').attr('id', 'os-alert').html('<div><p>This app will work correctly only on the iOS6!</p><span>Tap and close</span></div>').click(function() {
        jQuery(this).hide(); // Allow user to dismiss the alert
      });
      jQuery('#display').append(picTool.operatingSystemAlert); // Attach the OS alert to the display area
    }
  }
  if (picTool.isMobileDevice) { // If on a mobile device, apply specific body class
    jQuery('body').addClass('mobile');
  }
  if (window.navigator.standalone) { // Check if the app is running in standalone (PWA) mode
    picTool.isWebAppMode = true; // Set web app mode flag
    jQuery('body').addClass('webapp'); // Apply web app specific body class
  }
  picTool.updateDisplayOrientation(); // Determine and set the initial screen orientation
  if (!picTool.isMobileDevice) { // Render desktop-specific UI elements if not on mobile
    jQuery('#wrapper').addClass('start').append('<img src="images/iphone.png" id="iphone"><a href="#" onclick="picTool.toggleStyleViewer();return false;" id="check-style-button">Check the style</a>');
    jQuery('#wrapper').append('<div id="pc"><img src="images/logo.png" id="pc-logo"><p id="pc-text">CSS PhotoEditor is a test site for new features that will be installed in iOS6.<span>The browsers supported this site are Chrome20, Safari6 & iOS6. <a href="http://d.hatena.ne.jp/kudakurage/">Learn more about this page</a></span></p><a href="#" onclick="picTool.presentVideoPlayer();return false;" id="video"><img src="images/video.png"><span>DEMO on iOS simulator</span></a><ul id="features"><li class="upload">Input type=file</li><li class="filter">CSS Filters</li><li class="slider">Custom Slider UI</li><li class="font">Landscape Mode</li></ul><div class="profile"><a href="http://d.hatena.ne.jp/kudakurage/"><img src="images/profile.png" class="profile-image"></a><p class="profile-name">Kazuyuki Motoyama<span>Kudakurage</span></p><p class="profile-acount"><a href="https://twitter.com/kudakurage" class="twitter">twitter</a><a href="http://dribbble.com/kudakurage" class="dribbble">dribbble</a><a href="https://github.com/kudakurage" class="github">github</a></p><p class="profile-text">I have been working as a Web designer in Kyoto.<br />UI Design / App Design / Illustration / HTML5&CSS3 / Javascript / PHP</p><p class="copyright">Copyright &copy; 2012 kazuyuki motoyama</p></div></div>');
    picTool.videoWindow = jQuery('<div/>').attr('id', 'video-window').click(function() {
      picTool.concealVideoPlayer();
    });
    jQuery('body').append(picTool.videoWindow);
  }
  jQuery.get("images/sample.png", function() { // Preload a sample image to facilitate initial display
    jQuery('#wrapper').removeClass('start'); // Remove the 'start' class once image is ready
    // Initial view animation sequence begins here
    picTool.initialDisplayTimer = setTimeout(function() {
      picTool.selectMenuItem(jQuery('#saturate')); // Programmatically select the 'saturate' filter
      picTool.initialDisplayTimerOne = setTimeout(function() {
        picTool.initialDisplayTimerTwo = setInterval(function() {
          var currentValue = jQuery('#saturate-slider input').attr('value'); // Fetch current saturation slider value
          currentValue = parseInt(currentValue) + 2; // Increment the saturation value by 2
          if (currentValue >= 148) { // Check if the saturation value has reached its upper limit
            clearInterval(picTool.initialDisplayTimerTwo); // Stop the incrementing interval
          }
          jQuery('#saturate-slider input').attr('value', currentValue); // Update the slider's value attribute
          picTool.currentEffectValues['saturate'] = currentValue; // Synchronize with the global filter settings
          jQuery('#saturate-slider output span').text(currentValue); // Update the visual output for saturation
          picTool.applyImageEffects(); // Re-apply all filters including the updated saturation
        }, 0);
      }, 600);
    }, 1000);
    // Initial view animation sequence ends here
  });
  picTool.checkDebugStatus(); // Perform a check for debug mode activation
};

picTool.selectMenuItem = function(elementRef) { // Manages the selection and display of a menu item
  var elementId = jQuery(elementRef).attr('id'); // Obtain the unique identifier of the clicked menu item
  jQuery(elementRef).addClass('selected'); // Apply a 'selected' class to visually highlight the item
  if (picTool.displayAspect == 0) { // Specific layout adjustments for portrait orientation
    var menuIndentPx = parseInt(jQuery('#footer menu').css('marginLeft')); // Get the current left margin of the menu
    var backgroundPositionX = -320 + menuIndentPx + picTool.vertMenuPosMap[elementId] - picTool.footPanelScrollX; // Calculate background position for slider
    jQuery('#slider').css('backgroundPosition', backgroundPositionX + 'px 0'); // Set the background position of the slider
  } else if (picTool.displayAspect == 1) { // Specific layout adjustments for landscape orientation
    var appOffsetAmount;
    if (picTool.isWebAppMode) { // Account for potential offsets in web app mode
      appOffsetAmount = 20;
    } else {
      appOffsetAmount = 0;
    }
    var sliderPanelPositionTop = -25 + appOffsetAmount + picTool.horizMenuPosMap[elementId] - picTool.footPanelScrollY; // Calculate the top position for the slider
    jQuery('#slider').css('top', sliderPanelPositionTop + 'px'); // Apply the calculated top position to the slider
  }
  jQuery('#slider').attr('class', elementId); // Assign the selected item's ID as a class to the slider
  jQuery('#slider').fadeIn(300); // Animate the slider panel into view with a fade effect
};

picTool.resetSliderDisplay = function(elementRef) { // Resets the visual state of the slider and menu
  jQuery('#footer a').removeClass('selected'); // Remove 'selected' styling from all footer links
  jQuery('#slider').attr('class', ''); // Clear any specific class assigned to the slider
};

picTool.hideSliderPanel = function(elementRef) { // Function to conceal the slider panel
  picTool.resetSliderDisplay(elementRef); // First, ensure the slider's visual state is reset
  jQuery('#slider').fadeOut(300); // Then, animate the slider panel out of view
};

picTool.applyImageEffects = function() { // Applies the current set of filter values to the image
  jQuery('#photo img').attr('style', '-webkit-filter:saturate(' + picTool.currentEffectValues["saturate"] + '%) brightness(' + picTool.currentEffectValues["brightness"] + '%) contrast(' + picTool.currentEffectValues["contrast"] + '%) hue-rotate(' + picTool.currentEffectValues["huerotate"] + 'deg) invert(' + picTool.currentEffectValues["invert"] + '%) blur(' + picTool.currentEffectValues["blur"] + 'px) sepia(' + picTool.currentEffectValues["sepia"] + '%) grayscale(' + picTool.currentEffectValues["grayscale"] + '%) opacity(' + picTool.currentEffectValues["opacity"] + '%)');
};

picTool.revertEffectsToDefaults = function() { // Restores all image filters to their predefined initial values
  for (var propertyKey in picTool.initialEffectSettings) { // Iterate over each initial filter setting
    jQuery('#' + propertyKey + '-slider input').attr('value', picTool.initialEffectSettings[propertyKey]); // Update the corresponding slider input
    jQuery('#' + propertyKey + '-slider output span').text(picTool.initialEffectSettings[propertyKey]); // Update the displayed filter value
    picTool.currentEffectValues[propertyKey] = picTool.initialEffectSettings[propertyKey]; // Synchronize with the active filter values
  }
  jQuery('#photo img').addClass('animate'); // Apply an animation class for a smooth transition
  picTool.applyImageEffects(); // Immediately apply the reset filter values
  var timeoutId = setTimeout(function() { // Schedule removal of the animation class
    jQuery('#photo img').removeClass('animate');
  }, 1000);
};

picTool.monitorMenuScroll = function() { // Tracks and updates the scroll position of the menu
  picTool.hideSliderPanel(); // Automatically hide the slider when the menu is scrolled
  picTool.footPanelScrollX = jQuery('#footer').scrollLeft(); // Record the current horizontal scroll position
  picTool.footPanelScrollY = jQuery('#footer').scrollTop(); // Record the current vertical scroll position
};

picTool.toggleStyleViewer = function() { // Toggles the visibility of a panel displaying current CSS filter styles
  if (picTool.stylePreviewElement) { // If the style viewer is currently active
    picTool.stylePreviewElement.remove(); // Remove the viewer element from the DOM
    picTool.stylePreviewElement = false; // Clear the reference to the viewer
  } else { // If the style viewer is not active
    picTool.stylePreviewElement = jQuery('<div/>').attr('id', 'check-style-content').html('<h2>-webkit-filter:</h2><p>saturate(<span>' + picTool.currentEffectValues["saturate"] + '%</span>)</p><p>brightness(<span>' + picTool.currentEffectValues["brightness"] + '%</span>)</p><p>contrast(<span>' + picTool.currentEffectValues["contrast"] + '%</span>)</p><p>hue-rotate(<span>' + picTool.currentEffectValues["huerotate"] + 'deg</span>)</p><p>invert(<span>' + picTool.currentEffectValues["invert"] + '%</span>)</p><p>blur(<span>' + picTool.currentEffectValues["blur"] + 'px</span>)</p><p>sepia(<span>' + picTool.currentEffectValues["sepia"] + '%</span>)</p><p>grayscale(<span>' + picTool.currentEffectValues["grayscale"] + '%</span>)</p><p>opacity(<span>' + picTool.currentEffectValues["opacity"] + '%</span>)</p>');
    picTool.stylePreviewElement.click(function() { // Add a click handler to close the viewer
      picTool.toggleStyleViewer();
    });
    jQuery('#wrapper').append(picTool.stylePreviewElement); // Append the newly created viewer to the wrapper
  }
  return false; // Prevent any default link actions
};

picTool.updateDisplayOrientation = function() { // Adjusts application state based on current screen orientation
  picTool.viewPortWidth = jQuery('#display').width(); // Retrieve the current width of the display area
  picTool.viewPortHeight = jQuery('#display').height(); // Retrieve the current height of the display area
  if (picTool.viewPortWidth > picTool.viewPortHeight) { // Compare width and height to determine orientation
    picTool.displayAspect = 1; // Set orientation to landscape
  } else {
    picTool.displayAspect = 0; // Set orientation to portrait
  }
  if (picTool.displayAspect == 0) { // Apply appropriate CSS classes to the body for styling
    jQuery("body").addClass("portrait");
    jQuery("body").removeClass("landscape");
  } else if (picTool.displayAspect == 1) {
    jQuery("body").addClass("landscape");
    jQuery("body").removeClass("portrait");
  }
};

picTool.toggleZoomCapture = function() { // Toggles the image magnification and capture mode
  picTool.imageNativeWidth = jQuery('#photo img')[0].naturalWidth; // Get the original, unscaled width of the image
  picTool.imageNativeHeight = jQuery('#photo img')[0].naturalHeight; // Get the original, unscaled height of the image
  picTool.imageRenderedWidth = jQuery('#photo img').width(); // Get the current displayed width of the image
  picTool.imageRenderedHeight = jQuery('#photo img').height(); // Get the current displayed height of the image
  jQuery('#photo img').addClass('animate'); // Add an animation class for visual feedback
  var timeoutId = setTimeout(function() { // Schedule removal of the animation class
    jQuery('#photo img').removeClass('animate');
  }, 1000);
  if (picTool.zoomModeActive) { // If zoom mode is currently enabled
    jQuery('#photo img').css('webkitTransform', 'scale(1)'); // Reset the image scale to its original size
    jQuery('#refresh, #info, #footer').fadeIn(400); // Fade in the control elements
    picTool.zoomModeActive = false; // Deactivate the zoom mode
  } else { // If zoom mode is currently disabled
    if (picTool.imageNativeWidth > picTool.viewPortWidth && picTool.imageNativeHeight > picTool.viewPortHeight) { // Check if the image is larger than the viewport
      if (picTool.imageNativeWidth / picTool.imageNativeHeight > picTool.viewPortWidth / picTool.viewPortHeight) { // Compare aspect ratios to determine scaling
        var scaleFactor = picTool.viewPortHeight / picTool.imageRenderedHeight; // Calculate scale factor based on height
        jQuery('#photo img').css('webkitTransform', 'scale(' + scaleFactor + ')'); // Apply the calculated scale
      } else {
        var scaleFactor = picTool.viewPortWidth / picTool.imageRenderedWidth; // Calculate scale factor based on width
        jQuery('#photo img').css('webkitTransform', 'scale(' + scaleFactor + ')'); // Apply the calculated scale
      }
    }
    picTool.hideSliderPanel(); // Hide the slider panel when entering zoom mode
    jQuery('#refresh, #info, #footer').fadeOut(400); // Fade out the control elements
    picTool.zoomModeActive = true; // Activate the zoom mode
  }
};

picTool.presentVideoPlayer = function() { // Displays an embedded video player
  jQuery(picTool.videoWindow).html('<div id="video-content"><iframe width="640" height="360" src="http://www.youtube.com/embed/Z5bFwu5WSeg?rel=0&autoplay=1&controls=0&showinfo=0" frameborder="0" allowfullscreen></iframe></div>');
  jQuery('#video-window').addClass('show'); // Add a class to make the video window visible
  return false; // Prevent the default link action
};

picTool.concealVideoPlayer = function() { // Hides the video player
  jQuery('#video-window').removeClass('show').delay(700).html(''); // Remove visibility class, then clear content after a delay
};

picTool.checkDebugStatus = function() { // Examines the URL hash to enable or disable debug mode
  if (location.hash == '#dev' || location.hash == '#debug') { // Check for specific debug hash values
    picTool.developerMode = true; // Activate developer/debug mode
  } else {
    picTool.developerMode = false; // Keep developer/debug mode deactivated
  }
};