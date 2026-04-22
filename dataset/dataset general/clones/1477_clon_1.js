/*
 * This file contains core functionalities and initializations
 * for the PhotoEditor application.
 *
 * It defines global configuration, UI element offsets,
 * and filter default/current values.
 */

// Global application state object initialization.
var pe = {
    // Stores the horizontal scroll position of the footer.
    footerScrollLeft: 0,
    // Stores the vertical scroll position of the footer.
    footerScrollTop: 0,
    // Indicates the current orientation: 0 for portrait, 1 for landscape.
    orientation: 0,
    // Flag to detect double tap events, especially for mobile.
    dblTap: false,
    // Status of the image capture/zoom mode.
    captureModeStatus: false,
    // Holds the dynamic content for checking CSS styles.
    checkStyleContent: false
};

/*
 * Definition of menu item offsets for landscape mode.
 * These values are used to position the slider background
 * based on the selected filter.
 */
pe.menuLandscapeOffsetArray = {
    'saturate': 80,
    'brightness': 132,
    'contrast': 184,
    'huerotate': 236,
    'invert': 288,
    'blur': 340,
    'sepia': 392,
    'grayscale': 444,
    'opacity': 496
};

/*
 * Definition of menu item offsets for portrait mode.
 * Similar to landscape, but for a different layout.
 */
pe.menuOffsetArray = {
    'saturate': 109,
    'brightness': 175,
    'contrast': 241,
    'huerotate': 307,
    'invert': 373,
    'blur': 439,
    'sepia': 505,
    'grayscale': 571,
    'opacity': 638
};

// Initial filter values when the application loads or filters are reset.
pe.filterInitArray = {
    'saturate': 100,
    'brightness': 0,
    'contrast': 100,
    'huerotate': 0,
    'invert': 0,
    'blur': 0,
    'sepia': 0,
    'grayscale': 0,
    'opacity': 100
};

// Current filter values, updated by user interaction with sliders.
pe.filterValueArray = {
    'saturate': 100,
    'brightness': 0,
    'contrast': 100,
    'huerotate': 0,
    'invert': 0,
    'blur': 0,
    'sepia': 0,
    'grayscale': 0,
    'opacity': 100
};


/*
 * Event Binding Section
 * This block contains all the jQuery event listeners that
 * are set up once the DOM is ready.
 */
$(function () {

    // Initialize the PhotoEditor application.
    pe.init();


    // Handle window resize events.
    $(window).resize(function () {
        // Recalculate orientation and adjust UI.
        pe.switchOrientation();
        // Check and adjust menu scroll positions.
        pe.checkMenuScroll();

        // If on a mobile device, temporarily show a disabled overlay.
        if (pe.mobile) {
            $('#disabled').css({ 'display': 'block', 'opacity': 0 });
            // Use a short timeout to allow UI updates before hiding.
            var t = setTimeout(function () {
                $('#disabled').css({ 'display': 'none', 'opacity': 1 });
            }, 0);
        }
    });


    // Click handler for footer menu items (filter selection).
    $('#footer a').click(function () {
        // Reset the slider visual state.
        pe.sliderReset(this);
        // Mark the selected menu item.
        pe.menuSelected(this);
        // Prevent default link behavior.
        return false;
    });


    // Scroll handler for the footer element.
    $('#footer').scroll(function () {
        // Update menu scroll positions.
        pe.checkMenuScroll();
    });


    // Change handler for range input sliders (filter adjustments).
    $('#slider input[type="range"]').change(function () {
        // Get the name of the filter from the input's 'name' attribute.
        var filterName = $(this).attr('name');
        // Get the value of the filter from the input's 'value' attribute.
        var filterValue = $(this).attr('value');
        // Update the global filter value array.
        pe.filterValueArray[filterName] = filterValue;
        // Update the displayed value next to the slider.
        $('#' + filterName + '-slider output span').text(filterValue);
        // Apply the updated filter to the image.
        pe.setFilter();
    });


    // Click handler for the refresh button.
    $('#refresh').click(function () {
        // Blur (hide) the slider.
        pe.sliderBlur();
        // Reset all filters to their initial values.
        pe.resetFilter();
        // Prevent default link behavior.
        return false;
    });


    // Click handler for the info button.
    $('#info').click(function () {
        // Blur (hide) the slider.
        pe.sliderBlur();
        // Apply a 'flip' class to the display element for animation.
        $('#display').addClass('flip');
        // Prevent default link behavior.
        return false;
    });


    // Click handler for the back button (from info screen).
    $('#back').click(function () {
        // Remove the 'flip' class to revert the animation.
        $('#display').removeClass('flip');
        // Prevent default link behavior.
        return false;
    });


    // Click handler for the main photo area.
    $('#photo').click(function () {
        // Blur (hide) the slider.
        pe.sliderBlur();
        // Prevent default link behavior.
        return false;
    });


    // Double-click handler for the photo image.
    $('#photo img').dblclick(function () {
        // Toggle capture mode (zoom/pan).
        pe.captureMode();
    });

    // Touch-end handler for the photo image (for mobile double-tap detection).
    $('#photo img').bind('touchend', function () {
        if (pe.dblTap) {
            // If it's a double tap, activate capture mode.
            pe.captureMode();
            pe.dblTap = false; // Reset double tap flag.
        } else {
            pe.dblTap = true; // Set flag for potential second tap.
        }
        // Reset double tap flag after a short delay to distinguish from single tap.
        setTimeout(function () {
            pe.dblTap = false;
        }, 500);
    });


    // Click handler for file input elements.
    $('input[type=file]').click(function () {
        // Hide the slider when file input is interacted with.
        pe.sliderBlur();
    });

    // Change handler for file input (when a file is selected).
    $('input[type=file]').change(function () {
        // Show a loading/disabled overlay based on mobile status.
        if (pe.mobile) {
            $('#disabled').css('display', '-webkit-box');
        } else {
            $('#disabled').show();
        }

        // Upload the selected file using a custom 'upload' plugin.
        $(this).upload('upload.php', function (res) {
            // Hide the loading overlay after upload.
            $('#disabled').hide();
            if (res.result) {
                // If upload is successful, update the image source and reset filters.
                $('#photo img').attr('src', 'images/' + res.filename);
                pe.resetFilter();
            } else {
                // Alert if upload failed.
                alert('Sorry, upload failed.');
            }
        }, 'json'); // Expect JSON response.
    });


    // Toggle handler for the 'force-webapp' button.
    $('#force-webapp').toggle(function () {
        // Activate webapp mode.
        $(this).addClass('on').text('ON');
        setTimeout(function () {
            $('body').addClass('fullscreen');
        }, 350);
    }, function () {
        // Deactivate webapp mode.
        $(this).removeClass('on').text('OFF');
        setTimeout(function () {
            $('body').removeClass('fullscreen');
        }, 350);
    });
});

/*
 * Core Application Functions
 * These are methods defined on the global 'pe' object,
 * encapsulating various application logic.
 */
pe.init = function () {
    // Detect mobile devices (iPhone, iPad, iPod, Android).
    if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
        pe.mobile = true;
        document.title = 'PhotoEditor'; // Set document title for mobile.

        // Check for iOS 6 and display an alert if not.
        if (navigator.userAgent.indexOf('iPhone OS 6') == -1) {
            pe.osAlert = $('<div/>').attr('id', 'os-alert').html('<div><p>This app will work correctly only on the iOS6!</p><span>Tap and close</span></div>').click(function () { $(this).hide(); });
            $('#display').append(pe.osAlert);
        }
    }

    // Add 'mobile' class to body if on a mobile device.
    if (pe.mobile) {
        $('body').addClass('mobile');
    }

    // Check if the app is running in standalone web app mode.
    if (window.navigator.standalone) {
        pe.webapp = true;
        $('body').addClass('webapp');
    }

    // Set initial orientation.
    pe.switchOrientation();

    // If not a mobile device, initialize desktop specific UI.
    if (!pe.mobile) {
        $('#wrapper').addClass('start').append('<img src="images/iphone.png" id="iphone"><a href="#" onclick="pe.checkStyle();return false;" id="check-style-button">Check the style</a>');
        $('#wrapper').append('<div id="pc"><img src="images/logo.png" id="pc-logo"><p id="pc-text">CSS PhotoEditor is a test site for new features that will be installed in iOS6.<span>The browsers supported this site are Chrome20, Safari6 & iOS6. <a href="http://d.hatena.ne.jp/kudakurage/">Learn more about this page</a></span></p><a href="#" onclick="pe.showVideo();return false;" id="video"><img src="images/video.png"><span>DEMO on iOS simulator</span></a><ul id="features"><li class="upload">Input type=file</li><li class="filter">CSS Filters</li><li class="slider">Custom Slider UI</li><li class="font">Landscape Mode</li></ul><div class="profile"><a href="http://d.hatena.ne.jp/kudakurage/"><img src="images/profile.png" class="profile-image"></a><p class="profile-name">Kazuyuki Motoyama<span>Kudakurage</span></p><p class="profile-acount"><a href="https://twitter.com/kudakurage" class="twitter">twitter</a><a href="http://dribbble.com/kudakurage" class="dribbble">dribbble</a><a href="https://github.com/kudakurage" class="github">github</a></p><p class="profile-text">I have been working as a Web designer in Kyoto.<br />UI Design / App Design / Illustration / HTML5&CSS3 / Javascript / PHP</p><p class="copyright">Copyright &copy; 2012 kazuyuki motoyama</p></div></div>');
        pe.videoWindow = $('<div/>').attr('id', 'video-window').click(function () { pe.hideVideo(); });
        $('body').append(pe.videoWindow);
    }

    // Preload a sample image and initiate start view animation.
    $.get("images/sample.png", function () {
        $('#wrapper').removeClass('start');
        // StartView - start of an animation sequence.
        pe.startView = setTimeout(function () {
            pe.menuSelected($('#saturate')); // Select saturate filter initially.
            pe.startView1 = setTimeout(function () {
                pe.startView2 = setInterval(function () {
                    var val = $('#saturate-slider input').attr('value');
                    val = parseInt(val) + 2; // Increment saturation value.
                    if (val >= 148) {
                        clearInterval(pe.startView2); // Stop animation at 148.
                    }
                    $('#saturate-slider input').attr('value', val);
                    pe.filterValueArray['saturate'] = val;
                    $('#saturate-slider output span').text(val);
                    pe.setFilter(); // Apply the filter.
                }, 0);
            }, 600);
        }, 1000);
        // StartView - end of animation sequence.
    });

    // Check for debug mode.
    pe.debugCheck();
};

/*
 * Handles the selection of a menu item in the footer.
 * @param {HTMLElement} e - The clicked menu item.
 */
pe.menuSelected = function (e) {
    var id = $(e).attr('id'); // Get the ID of the selected item.
    $(e).addClass('selected'); // Add 'selected' class for styling.

    // Adjust slider position based on orientation.
    if (pe.orientation == 0) { // Portrait mode.
        var menuLeftMargin = parseInt($('#footer menu').css('marginLeft'));
        var bgPositionLeft = -320 + menuLeftMargin + pe.menuOffsetArray[id] - pe.footerScrollLeft;
        $('#slider').css('backgroundPosition', bgPositionLeft + 'px 0');
    } else if (pe.orientation == 1) { // Landscape mode.
        var webappOffset = 0;
        if (pe.webapp) { // Adjust for webapp mode status bar.
            webappOffset = 20;
        }
        var sliderPositionTop = -25 + webappOffset + pe.menuLandscapeOffsetArray[id] - pe.footerScrollTop;
        $('#slider').css('top', sliderPositionTop + 'px');
    }

    $('#slider').attr('class', id); // Set slider class to match selected filter.
    $('#slider').fadeIn(300); // Show the slider with a fade-in effect.
};

/*
 * Resets the visual state of the slider, removing selection.
 * @param {HTMLElement} e - The element triggering the reset (optional).
 */
pe.sliderReset = function (e) {
    $('#footer a').removeClass('selected'); // Remove 'selected' class from all footer links.
    $('#slider').attr('class', ''); // Clear the slider's class.
};

/*
 * Hides the filter slider with a fade-out effect.
 * @param {HTMLElement} e - The element triggering the blur (optional).
 */
pe.sliderBlur = function (e) {
    pe.sliderReset(e); // Ensure slider is reset before hiding.
    $('#slider').fadeOut(300); // Hide the slider.
};

/*
 * Applies the current filter values to the main photo image.
 * This constructs and sets the -webkit-filter CSS property.
 */
pe.setFilter = function () {
    $('#photo img').attr('style', '-webkit-filter:saturate(' + pe.filterValueArray["saturate"] + '%) brightness(' + pe.filterValueArray["brightness"] + '%) contrast(' + pe.filterValueArray["contrast"] + '%) hue-rotate(' + pe.filterValueArray["huerotate"] + 'deg) invert(' + pe.filterValueArray["invert"] + '%) blur(' + pe.filterValueArray["blur"] + 'px) sepia(' + pe.filterValueArray["sepia"] + '%) grayscale(' + pe.filterValueArray["grayscale"] + '%) opacity(' + pe.filterValueArray["opacity"] + '%)');
};

/*
 * Resets all filter values to their initial state and applies them.
 */
pe.resetFilter = function () {
    // Iterate through initial filter values and apply them to sliders and the image.
    for (key in pe.filterInitArray) {
        $('#' + key + '-slider input').attr('value', pe.filterInitArray[key]);
        $('#' + key + '-slider output span').text(pe.filterInitArray[key]);
        pe.filterValueArray[key] = pe.filterInitArray[key];
    }
    $('#photo img').addClass('animate'); // Add an 'animate' class for transition.
    pe.setFilter(); // Apply the reset filters.
    var t = setTimeout(function () {
        $('#photo img').removeClass('animate'); // Remove 'animate' class after a delay.
    }, 1000);
};

/*
 * Checks and updates the scroll positions of the footer menu.
 */
pe.checkMenuScroll = function () {
    pe.sliderBlur(); // Hide the slider when menu scrolls.
    pe.footerScrollLeft = $('#footer').scrollLeft(); // Store horizontal scroll.
    pe.footerScrollTop = $('#footer').scrollTop(); // Store vertical scroll.
};

/*
 * Toggles the display of a debug panel showing current CSS filter values.
 */
pe.checkStyle = function () {
    if (pe.checkStyleContent) {
        pe.checkStyleContent.remove(); // Remove if already exists.
        pe.checkStyleContent = false;
    } else {
        // Create and append the debug content.
        pe.checkStyleContent = $('<div/>').attr('id', 'check-style-content').html('<h2>-webkit-filter:</h2><p>saturate(<span>' + pe.filterValueArray["saturate"] + '%</span>)</p><p>brightness(<span>' + pe.filterValueArray["brightness"] + '%</span>)</p><p>contrast(<span>' + pe.filterValueArray["contrast"] + '%</span>)</p><p>hue-rotate(<span>' + pe.filterValueArray["huerotate"] + 'deg</span>)</p><p>invert(<span>' + pe.filterValueArray["invert"] + '%</span>)</p><p>blur(<span>' + pe.filterValueArray["blur"] + 'px</span>)</p><p>sepia(<span>' + pe.filterValueArray["sepia"] + '%</span>)</p><p>grayscale(<span>' + pe.filterValueArray["grayscale"] + '%</span>)</p><p>opacity(<span>' + pe.filterValueArray["opacity"] + '%</span>)</p>');
        pe.checkStyleContent.click(function () {
            pe.checkStyle(); // Close when clicked.
        });
        $('#wrapper').append(pe.checkStyleContent);
    }
    return false; // Prevent default link behavior.
};

/*
 * Detects and updates the current device orientation (portrait/landscape).
 */
pe.switchOrientation = function () {
    pe.windowWidth = $('#display').width(); // Get current display width.
    pe.windowHeight = $('#display').height(); // Get current display height.

    // Determine orientation based on width vs. height.
    if (pe.windowWidth > pe.windowHeight) {
        pe.orientation = 1; // Landscape.
    } else {
        pe.orientation = 0; // Portrait.
    }

    // Apply appropriate body classes for styling.
    if (pe.orientation == 0) {
        $("body").addClass("portrait");
        $("body").removeClass("landscape");
    } else if (pe.orientation == 1) {
        $("body").addClass("landscape");
        $("body").removeClass("portrait");
    }
};

/*
 * Toggles the image capture/zoom mode, allowing the image to be
 * scaled to fit the screen or return to original size.
 */
pe.captureMode = function () {
    pe.photoWidth = $('#photo img')[0].naturalWidth; // Get natural image width.
    pe.photoHeight = $('#photo img')[0].naturalHeight; // Get natural image height.
    pe.photoDisplayWidth = $('#photo img').width(); // Get rendered image width.
    pe.photoDisplayHeight = $('#photo img').height(); // Get rendered image height.

    $('#photo img').addClass('animate'); // Add 'animate' class for transition.
    var t = setTimeout(function () {
        $('#photo img').removeClass('animate'); // Remove after delay.
    }, 1000);

    if (pe.captureModeStatus) {
        // If capture mode is active, reset zoom.
        $('#photo img').css('webkitTransform', 'scale(1)');
        $('#refresh, #info, #footer').fadeIn(400); // Show UI elements.
        pe.captureModeStatus = false;
    } else {
        // If not active, calculate zoom to fit image to screen.
        if (pe.photoWidth > pe.windowWidth && pe.photoHeight > pe.windowHeight) {
            if (pe.photoWidth / pe.photoHeight > pe.windowWidth / pe.windowHeight) {
                var zoom = pe.windowHeight / pe.photoDisplayHeight;
                $('#photo img').css('webkitTransform', 'scale(' + zoom + ')');
            } else {
                var zoom = pe.windowWidth / pe.photoDisplayWidth;
                $('#photo img').css('webkitTransform', 'scale(' + zoom + ')');
            }
        }
        pe.sliderBlur(); // Hide the slider.
        $('#refresh, #info, #footer').fadeOut(400); // Hide UI elements.
        pe.captureModeStatus = true;
    }
};

/*
 * Displays a video player in a modal window.
 */
pe.showVideo = function () {
    $(pe.videoWindow).html('<div id="video-content"><iframe width="640" height="360" src="http://www.youtube.com/embed/Z5bFwu5WSeg?rel=0&autoplay=1&controls=0&showinfo=0" frameborder="0" allowfullscreen></iframe></div>');
    $('#video-window').addClass('show'); // Show the video window.
    return false; // Prevent default link behavior.
};

/*
 * Hides the video player modal window.
 */
pe.hideVideo = function () {
    $('#video-window').removeClass('show').delay(700).html(''); // Hide and clear content after delay.
};

/*
 * Checks the URL hash for debug mode activation.
 */
pe.debugCheck = function () {
    if (location.hash == '#dev' || location.hash == '#debug') {
        pe.debug = true; // Activate debug mode.
    } else {
        pe.debug = false; // Deactivate debug mode.
    }
};