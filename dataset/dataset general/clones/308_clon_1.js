/*******************************************************************************
 *
 * jQuery Glisse plugin - Version 1.1.1
 *
 * This plugin provides a customizable lightbox for image galleries.
 *
 * @author: Victor Coulon
 * @authorurl: http://victorcoulon.fr
 * @twitter: http://twitter.com/_victa
 *
 * Based on jQuery Plugin Boilerplate 1.3 by {Your Name Here}
 *
 ******************************************************************************/
(function ($, document) {

  // Define the Glisse plugin as a jQuery method
  $.glisse = function (element, options) {

    var plugin = this,
        $element = $(element), // The jQuery element the plugin is initialized on
        defaults = { // Default settings for the plugin
          dataName: 'data-glisse-big', // Attribute to find the large image URL
          speed: 300,                  // Animation speed for transitions (ms)
          changeSpeed: 1000,             // Speed for changing pictures (ms)
          effect: 'bounce',            // Transition effect for image changes
          mobile: false,               // Flag to detect mobile devices
          fullscreen: false,           // Enable fullscreen mode
          disablindRightClick: false,  // Disable right-click on content
          parent: null                 // jQuery selector for the container element
        },

        // --- Private variables and helper functions ---
        pictureUrl,     // Stores the URL of the currently displayed image
        group,          // Stores the 'rel' attribute value for image grouping
        isChange = false, // Flag to prevent multiple image changes at once
        mobile = {},    // Object to hold mobile-specific state
        touch = {},     // Object to hold touch event data
        cache = [],     // Array to cache preloaded image URLs

        /**
         * Retrieves the full URL for an image.
         * Checks 'dataName' attribute first, then 'src'.
         * @param {jQuery} $el - The jQuery element (image) to get URL from.
         * @returns {string} The image URL.
         */
        getFullUrl = function ($el) {
          return $el.attr(plugin.settings.dataName) || $el.attr('src');
        };

    // Initialize plugin settings and element holders
    plugin.settings = {};
    plugin.els = {};

    /**
     * Initializes the Glisse plugin instance.
     * Merges default settings with user-provided options.
     * Sets up initial variables and event listeners.
     */
    plugin.init = function () {

      // Merge defaults with user options
      plugin.settings = $.extend({}, defaults, options);

      // --- Set initial variables ---
      group = $element.attr('rel') || null; // Determine image group from 'rel' attribute

      // Detect mobile device based on user agent string
      plugin.settings.mobile = !!navigator.userAgent.match(/iPhone|iPod|iPad|Android/i);

      // --- Set up event listeners ---
      // Click event on the initial element to open the lightbox
      $element.on('click', function () {

        pictureUrl = getFullUrl($element); // Get the URL of the clicked image

        // Perform actions to open and populate the lightbox
        createElements();   // Create the necessary DOM elements
        setChangeStyle();   // Apply CSS styles for image transitions
        addImage(pictureUrl); // Add the first image to the lightbox
        setChangeStatus();  // Update navigation controls status
        setTitle();         // Set the title/legend for the image
        preloadImgs();      // Preload other images in the group

        // --- Bind Keyboard events for navigation and closing ---
        $(document).keydown(function (event) {
          if (event.keyCode.toString() === '27') { // Escape key
            closeLightbox();
          }
          if (event.keyCode.toString() === '39') { // Right arrow key
            changePicture('next');
          }
          if (event.keyCode.toString() === '37') { // Left arrow key
            changePicture('prev');
          }
        });

        // --- Handle disabling right-click if enabled in settings ---
        if (plugin.settings.disablindRightClick) {
          plugin.els['content'].on('contextmenu', function (e) {
            return false; // Prevent default context menu
          });
        }

        // ==== Mobile support initialization =================
        if (plugin.settings.mobile) {
          mobile = {
            touching: false, // Is a touch event currently active?
            nx: 0,           // New X-coordinate
            oX: 0,           // Original X-coordinate on touchstart
            scrollX: null    // Scroll X position
          };

          // Assign touch event handlers to the document
          document.ontouchmove = document.ontouchstart = document.ontouchend = touchHandler;
        }
      });
    }; // End of plugin.init

    /**
     * Preloads all images within the current group to improve user experience.
     */
    var preloadImgs = function preloadImgs() {

      var current,
          image_urls = [], // Array to store all image URLs in the group
          i;               // Loop counter

      // Iterate through all images with the same 'rel' attribute
      $('img[rel="' + group + '"]').each(function (i, el) {
        image_urls.push(getFullUrl($(this))); // Add image URL to array
      });

      /**
       * Callback function when an image has loaded.
       * @param {string} current - The URL of the loaded image.
       */
      function loaded(current) {
        cache.push(current); // Add loaded image URL to cache
      }

      // Loop through all collected image URLs and trigger loading
      for (i = 0; i < image_urls.length; i += 1) {
        current = jQuery("<img>").attr("src", image_urls[i]); // Create an off-DOM image element
        current.load(loaded(image_urls[i])); // Attach load handler
      }
    }; // End of preloadImgs

    /**
     * Creates all necessary DOM elements for the lightbox structure.
     * Appends them to the body and sets initial styles.
     */
    var createElements = function createElements() {

      $element.addClass('active'); // Add 'active' class to the triggering element

      // Determine CSS properties for transitions based on browser prefixes
      var cssProp = getPrefix('transition') + 'transition',
          cssVal = 'opacity ' + plugin.settings.speed + 'ms ease, ' + getPrefix('transform') + 'transform ' + plugin.settings.speed + 'ms ease';

      // --- Create Glisse HTML structure elements ---
      plugin.els['wrapper'] = $(document.createElement('div'))
        .attr('id', 'glisse-wrapper');

      plugin.els['overlay'] = $(document.createElement('div'))
        .attr('id', 'glisse-overlay')
        .css(cssProp, cssVal);

      plugin.els['spinner'] = $(document.createElement('div'))
        .attr('id', 'glisse-spinner');

      plugin.els['close'] = $(document.createElement('span'))
        .attr('id', 'glisse-close')
        .css(cssProp, cssVal);

      plugin.els['content'] = $(document.createElement('div'))
        .attr('id', 'glisse-overlay-content')
        .css(cssProp, cssVal)
        .css(getPrefix('transform') + 'transform', 'scale(0)'); // Initial scale for animation

      plugin.els['controls'] = $(document.createElement('div'))
        .attr('id', 'glisse-controls')
        .css(cssProp, cssVal);

      plugin.els['controlNext'] = $(document.createElement('span'))
        .attr('class', 'glisse-next')
        .append($(document.createElement('a')).html('&#62;').attr("href", "#")); // Next button

      plugin.els['controlLegend'] = $(document.createElement('span'))
        .attr('class', 'glisse-legend'); // Legend/Title area

      plugin.els['controlPrev'] = $(document.createElement('span'))
        .attr('class', 'glisse-prev')
        .append($(document.createElement('a')).html('&#60;').attr("href", "#")); // Previous button

      // --- Assemble and append the structure to the DOM ---
      plugin.els['overlay'].append(plugin.els['spinner']); // Spinner inside overlay

      plugin.els['controls'].append(
        plugin.els['controlNext'],
        plugin.els['controlLegend'],
        plugin.els['controlPrev']
      );

      plugin.els['wrapper'].append(
        plugin.els['overlay'],
        plugin.els['close'],
        plugin.els['content'],
        plugin.els['controls']
      );

      $('body').append(plugin.els['wrapper']); // Add the entire lightbox to the body

      // --- Use readyElement observer to trigger animations once elements are in DOM ---
      readyElement.observe('glisse-overlay', function () {
        plugin.els['overlay'].css('opacity', 1);
      });
      readyElement.observe('glisse-close', function () {
        plugin.els['close'].css('opacity', 1);
      });
      readyElement.observe('glisse-controls', function () {
        plugin.els['controls'].css('opacity', 1);
      });


      // --- Bind events for user interaction ---
      plugin.els['controls'].delegate('a', 'click', function (e) {
        e.preventDefault(); // Prevent default link behavior
        var changeTo = ($(this).parent().hasClass('glisse-next')) ? 'next' : 'prev';
        changePicture(changeTo); // Change picture based on clicked control
      });

      // Close lightbox on clicking overlay, content, or close button
      plugin.els['overlay'].on('click', function () {
        closeLightbox();
      });
      plugin.els['content'].on('click', function () {
        closeLightbox();
      });
      plugin.els['close'].on('click', function () {
        closeLightbox();
      });

      // --- Handle fullscreen mode if enabled ---
      if (plugin.settings.fullscreen) {
        var docElm = document.documentElement; // Get the document element for fullscreen
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen();
        }
      }
    }; // End of createElements

    /**
     * Closes the Glisse lightbox, removing its elements and unbinding events.
     */
    var closeLightbox = function closeLightbox() {

      // --- Animate hiding the lightbox elements ---
      plugin.els['content'].css({
        opacity: 0
      }).css(getPrefix('transform') + 'transform', 'scale(1.2)'); // Scale up slightly before disappearing
      plugin.els['overlay'].css({
        opacity: 0
      });
      plugin.els['close'].css({
        opacity: 0
      });
      plugin.els['controls'].css({
        opacity: 0
      });

      // --- Remove lightbox elements from DOM after animation completes ---
      setTimeout(function () {
        plugin.els['content'].remove();
        plugin.els['overlay'].remove();
        plugin.els['close'].remove();
        plugin.els['controls'].remove();
        plugin.els['wrapper'].remove();
        $('#glisse-transition-css').remove(); // Remove dynamic transition CSS
      }, plugin.settings.speed);

      $element.removeClass('active'); // Remove 'active' class from the triggering element

      // --- Unbind mobile touch events ---
      document.ontouchmove = function (e) {
        return true;
      };
      document.ontouchstart = function (e) {
        return true;
      };
      document.ontouchend = function (e) {
        return true;
      };
      $(document).unbind("keydown"); // Unbind keyboard navigation

      // --- Exit fullscreen mode if it was active ---
      if (plugin.settings.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    }; // End of closeLightbox

    /**
     * Adds an image to the lightbox content area.
     * Displays a spinner while the image loads.
     * @param {string} pic - The URL of the image to add.
     */
    var addImage = function addImage(pic) {

      spinner(true); // Show the loading spinner

      // Create a temporary image element to preload and get dimensions
      var img = $('<img/>', {
        src: pic
      }).appendTo(plugin.els['content']);

      // Set the background image of the content div (actual display)
      plugin.els['content'].css({
        backgroundImage: 'url("' + pic + '")'
      });

      // Once the temporary image loads, hide spinner and show content
      img.load(function () {
        img.remove(); // Remove the temporary image
        spinner(false); // Hide the loading spinner

        // Make content visible and scale it to 1 (animation)
        plugin.els['content'].css({
          visibility: 'visible',
          opacity: 1
        })
          .css(getPrefix('transform') + 'transform', 'scale(1)');
      });
    }; // End of addImage

    /**
     * Changes the currently displayed picture in the lightbox.
     * Handles 'next' and 'prev' navigation, animations, and boundary checks.
     * @param {string} direction - 'next' or 'prev' to indicate navigation direction.
     */
    var changePicture = function changePicture(direction) {

      // Find the current active element and its index within the group
      var $currentEl = $('img[' + plugin.settings.dataName + '="' + pictureUrl + '"][rel=' + group + ']'),
          currentId = $('img[rel=' + group + ']').index($currentEl),
          totGroup = $('img[rel=' + group + ']').length,
          change = true; // Flag to determine if a change is possible

      // --- Boundary checks: prevent navigating beyond the first/last image ---
      if ((currentId === 0 && direction === 'prev') || (currentId === (totGroup - 1) && direction === 'next')) {
        change = false; // Cannot change picture
      }

      // --- If a change is possible and not already in progress ---
      if (change && isChange === false) {
        isChange = true; // Set flag to indicate change in progress

        // Determine the next element to display
        var $next = (direction === 'next') ?
          $('img[rel=' + group + ']').eq(currentId + 1) :
          $('img[rel=' + group + ']').eq(currentId - 1);

        // --- Apply mobile-specific or desktop animations ---
        if (plugin.settings.mobile) {
          // For mobile, directly translate content out of view
          if (direction !== 'next') {
            plugin.els['content'].css(getPrefix('transform') + 'transform', 'translateX(2000px)');
          } else {
            plugin.els['content'].css(getPrefix('transform') + 'transform', 'translateX(-2000px)');
          }
        } else {
          // For desktop, add animation class and reset transition property
          plugin.els['content'].addClass('glisse-transitionOut-' + direction);
          var cssProp = getPrefix('transition') + 'transition',
              cssVal = 'opacity ' + plugin.settings.speed + 'ms ease, ' + getPrefix('transform') + 'transform ' + plugin.settings.speed + 'ms ease';
          plugin.els['content'].css(cssProp, '');
        }

        pictureUrl = getFullUrl($next); // Update the current picture URL

        // Show spinner if the next image is not yet cached
        if ($.inArray(pictureUrl, cache) === -1) {
          spinner(true);
        }

        // Update active class on image elements
        $currentEl.removeClass('active');
        $next.addClass('active');

        setChangeStatus(); // Update control button states
        setTitle();        // Update the image title/legend

        // --- Timeout to allow outgoing animation to complete before loading next image ---
        setTimeout(function () {
          if (plugin.settings.mobile) {
            // For mobile, hide content then reset position
            plugin.els['content'].css(getPrefix('transform') + 'transform', 'translateX(0px)')
              .css('display', 'none');
          }

          // Create temporary image to preload and set background
          var img = $('<img/>', {
            src: pictureUrl
          }).appendTo(plugin.els['content']);
          plugin.els['content'].css({
            backgroundImage: 'url("' + pictureUrl + '")'
          });

          img.load(function () {
            img.remove(); // Remove temporary image

            // Hide spinner if image was not cached
            if ($.inArray(pictureUrl, cache) === -1) {
              spinner(false);
            }

            if (plugin.settings.mobile) {
              plugin.els['content'].css('display', 'block'); // Show content for mobile
            }

            // Apply incoming animation class
            plugin.els['content'].removeClass('glisse-transitionOut-' + direction)
              .addClass('glisse-transitionIn-' + direction);

            // Timeout to reset animation classes after incoming animation
            setTimeout(function () {
              plugin.els['content'].removeClass('glisse-transitionIn-' + direction).css(cssProp, cssVal);
              isChange = false; // Reset change flag
            }, plugin.settings.changeSpeed);
          });
        }, plugin.settings.changeSpeed); // Wait for changeSpeed duration

      } else if (change === false && isChange === false) {
        // --- If change is not possible (at end/beginning) and not currently changing ---
        if (plugin.settings.mobile) {
          plugin.els['content'].css(getPrefix('transform') + 'transform', 'translateX(0px)'); // Reset mobile position
        }
        plugin.els['content'].addClass('shake'); // Add 'shake' effect
        setTimeout(function () {
          plugin.els['content'].removeClass('shake'); // Remove 'shake' after a delay
        }, 600);
      }
    }; // End of changePicture

    /**
     * Dynamically generates and injects CSS keyframes for transition effects.
     * Uses browser prefixes where necessary.
     */
    var setChangeStyle = function setChangeStyle() {

      // Get browser-prefixed properties for transform and animation
      var prefix = getPrefix('transform'),
          prefixAnimation = getPrefix('animation'),
          effect = []; // Array to build the keyframe CSS

      // Validate the chosen effect, default to 'bounce' if invalid
      if (!isValidEffect(plugin.settings.effect)) {
        plugin.settings.effect = 'bounce';
      }

      // --- Generate keyframes based on the selected effect ---
      switch (plugin.settings.effect) {
        case 'bounce':
          effect = [
            '@' + prefixAnimation + 'keyframes outLeft {',
            '  0% { ' + prefix + 'transform: translateX(0);}',
            '  20% { opacity: 1;' + prefix + 'transform: translateX(20px);}',
            '  100% { opacity: 0;' + prefix + 'transform: translateX(-2000px);}',
            '}',
            '@' + prefixAnimation + 'keyframes inLeft {',
            '  0% {opacity: 0;' + prefix + 'transform: translateX(-2000px);}',
            '  60% {opacity: 1;' + prefix + 'transform: translateX(30px);}',
            '  80% {' + prefix + 'transform: translateX(-10px);}',
            '  100% {' + prefix + 'transform: translateX(0);}',
            '}',
            '@' + prefixAnimation + 'keyframes outRight {',
            '  0% {' + prefix + 'transform: translateX(0);}',
            '  20% {opacity: 1;' + prefix + 'transform: translateX(-20px);}',
            '  100% {opacity: 0;' + prefix + 'transform: translateX(2000px);}',
            '}',
            '@' + prefixAnimation + 'keyframes inRight {',
            '  0% {opacity: 0;' + prefix + 'transform: translateX(2000px);}',
            '  60% {opacity: 1;' + prefix + 'transform: translateX(-30px);}',
            '  80% {' + prefix + 'transform: translateX(10px);}',
            '  100% {' + prefix + 'transform: translateX(0);}',
            '}'
          ].join('');
          break;

        case 'fadeBig':
          effect = [
            '@' + prefixAnimation + 'keyframes outLeft {',
            '  0% { opacity: 1;' + prefix + 'transform: translateX(0);}',
            '  100% {opacity: 0;' + prefix + 'transform: translateX(-2000px);}',
            '}',
            '@' + prefixAnimation + 'keyframes inLeft {',
            '  0% { opacity: 0;' + prefix + 'transform: translateX(-2000px);}',
            '  100% {opacity: 1;' + prefix + 'transform: translateX(0);}',
            '}',
            '@' + prefixAnimation + 'keyframes outRight {',
            '  0% { opacity: 1;' + prefix + 'transform: translateX(0);}',
            '  100% {opacity: 0;' + prefix + 'transform: translateX(2000px);}',
            '}',
            '@' + prefixAnimation + 'keyframes inRight {',
            '  0% { opacity: 0;' + prefix + 'transform: translateX(2000px);}',
            '  100% {opacity: 1;' + prefix + 'transform: translateX(0);}',
            '}'
          ].join('');
          break;

        case 'fade':
          effect = [
            '@' + prefixAnimation + 'keyframes outLeft {',
            '  0% { opacity: 1;' + prefix + 'transform: translateX(0);}',
            '  100% {opacity: 0;' + prefix + 'transform: translateX(-200px);}',
            '}',
            '@' + prefixAnimation + 'keyframes inLeft {',
            '  0% { opacity: 0;' + prefix + 'transform: translateX(-200px);}',
            '  100% {opacity: 1;' + prefix + 'transform: translateX(0);}',
            '}',
            '@' + prefixAnimation + 'keyframes outRight {',
            '  0% { opacity: 1;' + prefix + 'transform: translateX(0);}',
            '  100% {opacity: 0;' + prefix + 'transform: translateX(200px);}',
            '}',
            '@' + prefixAnimation + 'keyframes inRight {',
            '  0% { opacity: 0;' + prefix + 'transform: translateX(200px);}',
            '  100% {opacity: 1;' + prefix + 'transform: translateX(0);}',
            '}'
          ].join('');
          break;

        case 'roll':
          effect = [
            '@' + prefixAnimation + 'keyframes outLeft {',
            '  0% { opacity: 1;' + prefix + 'transform: translateX(0px) rotate(0deg);}',
            '  100% {opacity: 0;' + prefix + 'transform: translateX(-100%) rotate(-120deg);}',
            '}',
            '@' + prefixAnimation + 'keyframes inLeft {',
            '  0% { opacity: 0;' + prefix + 'transform: translateX(-100%) rotate(-120deg);}',
            '  100% {opacity: 1;' + prefix + 'transform:  translateX(0px) rotate(0deg);}',
            '}',
            '@' + prefixAnimation + 'keyframes outRight {',
            '  0% { opacity: 1;' + prefix + 'transform:translateX(0px) rotate(0deg);}',
            '  100% {opacity: 0;' + prefix + 'transform:translateX(100%) rotate(120deg);}',
            '}',
            '@' + prefixAnimation + 'keyframes inRight {',
            '  0% { opacity: 0;' + prefix + 'transform: translateX(100%) rotate(120deg);}',
            '  100% {opacity: 1;' + prefix + 'transform:  translateX(0px) rotate(0deg);}',
            '}'
          ].join('');
          break;

        case 'rotate':
          effect = [
            '@' + prefixAnimation + 'keyframes outRight {',
            '  0% { opacity: 1;' + prefix + 'transform: rotate(0deg);' + prefix + 'transform-origin:left bottom;}',
            '  100% {opacity: 0;' + prefix + 'transform: rotate(-90deg);' + prefix + 'transform-origin:left bottom;}',
            '}',
            '@' + prefixAnimation + 'keyframes inLeft {',
            '  0% { opacity: 0;' + prefix + 'transform: rotate(90deg);' + prefix + 'transform-origin:left bottom;}',
            '  100% {opacity: 1;' + prefix + 'transform: rotate(0deg);' + prefix + 'transform-origin:left bottom;}',
            '}',
            '@' + prefixAnimation + 'keyframes outLeft {',
            '  0% { opacity: 1;' + prefix + 'transform: rotate(0deg);' + prefix + 'transform-origin:right bottom;}',
            '  100% {opacity: 0;' + prefix + 'transform: rotate(90deg);' + prefix + 'transform-origin:right bottom;}',
            '}',
            '@' + prefixAnimation + 'keyframes inRight {',
            '  0% { opacity: 0;' + prefix + 'transform: rotate(-90deg);' + prefix + 'transform-origin:right bottom;}',
            '  100% {opacity: 1;' + prefix + 'transform: rotate(0deg);' + prefix + 'transform-origin:right bottom;}',
            '}'
          ].join('');
          break;

        case 'flipX':
          effect = [
            '@' + prefixAnimation + 'keyframes outLeft {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
            '}',
            '@' + prefixAnimation + 'keyframes inLeft {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
            '  40% {' + prefix + 'transform: perspective(400px) rotateX(-10deg);}',
            '  70% {' + prefix + 'transform: perspective(400px) rotateX(10deg);}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
            '}',
            '@' + prefixAnimation + 'keyframes outRight {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
            '}',
            '@' + prefixAnimation + 'keyframes inRight {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateX(90deg);opacity: 0;}',
            '  40% {' + prefix + 'transform: perspective(400px) rotateX(-10deg);}',
            '  70% {' + prefix + 'transform: perspective(400px) rotateX(10deg);}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateX(0deg);opacity: 1;}',
            '}'
          ].join('');
          break;

        case 'flipY':
          effect = [
            '@' + prefixAnimation + 'keyframes outLeft {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateY(90deg);opacity: 0;}',
            '}',
            '@' + prefixAnimation + 'keyframes inLeft {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateY(90deg);opacity: 0;}',
            '  40% {' + prefix + 'transform: perspective(400px) rotateY(-10deg);}',
            '  70% {' + prefix + 'transform: perspective(400px) rotateY(10deg);}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
            '}',
            '@' + prefixAnimation + 'keyframes outRight {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateY(-90deg);opacity: 0;}',
            '}',
            '@' + prefixAnimation + 'keyframes inRight {',
            '  0% {' + prefix + 'transform: perspective(400px) rotateY(90deg);opacity: 0;}',
            '  40% {' + prefix + 'transform: perspective(400px) rotateY(-10deg);}',
            '  70% {' + prefix + 'transform: perspective(400px) rotateY(10deg);}',
            '  100% {' + prefix + 'transform: perspective(400px) rotateY(0deg);opacity: 1;}',
            '}'
          ].join('');
          break;
      }

      // --- Define CSS classes for applying animations ---
      var changeClass = [
        '.glisse-transitionOut-next {',
        '  ' + prefixAnimation + 'animation: ' + plugin.settings.changeSpeed + 'ms ease;',
        '  ' + prefixAnimation + 'animation-name: outLeft;',
        '  ' + prefixAnimation + 'animation-fill-mode: both;',
        '}',
        '.glisse-transitionIn-prev {',
        '  ' + prefixAnimation + 'animation: ' + plugin.settings.changeSpeed + 'ms ease;',
        '  ' + prefixAnimation + 'animation-name: inLeft;',
        '  ' + prefixAnimation + 'animation-fill-mode: both;',
        '}',
        '.glisse-transitionOut-prev {',
        '  ' + prefixAnimation + 'animation: ' + plugin.settings.changeSpeed + 'ms ease;',
        '  ' + prefixAnimation + 'animation-name: outRight;',
        '  ' + prefixAnimation + 'animation-fill-mode: both;',
        '}',
        '.glisse-transitionIn-next {',
        '  ' + prefixAnimation + 'animation: ' + plugin.settings.changeSpeed + 'ms ease;',
        '  ' + prefixAnimation + 'animation-name: inRight;',
        '  ' + prefixAnimation + 'animation-fill-mode: both;',
        '}'
      ].join('');

      // --- Inject or update the dynamic CSS into the head ---
      if (!document.getElementById('glisse-css')) {
        $('<style type="text/css" id="glisse-css">' + effect + changeClass + '</style>').appendTo('head');
      } else {
        $('#glisse-css').html(effect + changeClass);
      }
    }; // End of setChangeStyle

    // === Controls actions  =================

    /**
     * Updates the enabled/disabled state of navigation controls based on
     * the current picture's position in the group.
     */
    var setChangeStatus = function setChangeStatus() {
      // Find the current active image element
      var $currentEl = $('img[' + plugin.settings.dataName + '="' + pictureUrl + '"]'),
          // Determine the parent element, using 'parent' setting if provided
          parent = plugin.settings.parent ?
            $currentEl.closest(plugin.settings.parent) :
            $currentEl.parent();

      // Check if there is a next image
      if (!parent.next().find('img[rel=' + group + ']').length) {
        plugin.els['controls'].find('.glisse-next').addClass('ended'); // Add 'ended' class if no next
      } else {
        plugin.els['controls'].find('.glisse-next').removeClass('ended'); // Remove 'ended' if next exists
      }

      // Check if there is a previous image
      if (!parent.prev().find('img[rel=' + group + ']').length) {
        plugin.els['controls'].find('.glisse-prev').addClass('ended'); // Add 'ended' class if no previous
      } else {
        plugin.els['controls'].find('.glisse-prev').removeClass('ended'); // Remove 'ended' if previous exists
      }
    }; // End of setChangeStatus

    /**
     * Updates the title/legend displayed in the lightbox controls.
     * The title is taken from the 'title' attribute of the current image.
     */
    var setTitle = function setTitle() {
      // Find the current active image and get its title attribute
      var $currentEl = $('img[' + plugin.settings.dataName + '="' + pictureUrl + '"]'),
          title = $currentEl.attr('title') || ''; // Default to empty string if no title

      plugin.els['controlLegend'].html(title); // Set the HTML of the legend element
    }; // End of setTitle

    /**
     * Shows or hides the loading spinner.
     * @param {boolean} status - True to show spinner, false to hide.
     */
    var spinner = function spinner(status) {
      if (status) {
        plugin.els['spinner'].addClass('active'); // Add 'active' class to show spinner
      } else {
        plugin.els['spinner'].removeClass('active'); // Remove 'active' class to hide spinner
      }
    }; // End of spinner

    /**
     * Handles touch events for mobile navigation (swipe).
     * @param {Event} e - The touch event object.
     */
    var touchHandler = function touchHandler(e) {
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]; // Get the relevant touch object

      if (e.type === 'touchstart') {
        mobile.touching = true; // Set touching flag
        mobile.oX = touch.pageX; // Record original X position
        mobile.scrollX = window.pageXOffset; // Record scroll position
      } else if (e.type === 'touchmove' && mobile.touching) {
        e.preventDefault(); // Prevent default scroll behavior during swipe
        mobile.nx = touch.pageX; // Get new X position

        // Calculate horizontal movement and apply transform
        plugin.els['content'].css(getPrefix('transform') + 'transform', 'translateX(' + (touch.pageX - mobile.oX) + 'px)');
      } else if (e.type === 'touchend' && mobile.touching) {
        mobile.touching = false; // Reset touching flag

        // Determine if a swipe occurred and its direction
        if (mobile.oX - mobile.nx > 50) { // Swiped left (next)
          changePicture('next');
        } else if (mobile.oX - mobile.nx < -50) { // Swiped right (prev)
          changePicture('prev');
        } else {
          // If no significant swipe, reset content position
          plugin.els['content'].css(getPrefix('transform') + 'transform', 'translateX(0px)');
        }
      }
    }; // End of touchHandler

    /**
     * Gets the browser-specific prefix for a given CSS property.
     * @param {string} prop - The CSS property (e.g., 'transform', 'transition').
     * @returns {string} The prefixed property (e.g., '-webkit-transform') or empty string if not needed.
     */
    var getPrefix = function getPrefix(prop) {
      var prefixes = ['Moz', 'Webkit', 'O', 'ms'],
          elem = document.createElement('div'),
          upper = prop.charAt(0).toUpperCase() + prop.slice(1); // Capitalize first letter

      // Check for unprefixed version
      if (prop in elem.style) {
        return '';
      }

      // Check for prefixed versions
      for (var i = 0; i < prefixes.length; i++) {
        if (prefixes[i] + upper in elem.style) {
          return '-' + prefixes[i].toLowerCase() + '-';
        }
      }
      return ''; // No prefix found
    }; // End of getPrefix

    /**
     * Checks if the given effect name is valid.
     * @param {string} effect - The effect name to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    var isValidEffect = function isValidEffect(effect) {
      var validEffects = ['bounce', 'fadeBig', 'fade', 'roll', 'rotate', 'flipX', 'flipY'];
      return ($.inArray(effect, validEffects) !== -1);
    }; // End of isValidEffect

    // --- readyElement: A utility to observe when an element becomes available in the DOM ---
    var readyElement = (function () {
      var callbacks = []; // Array to store callbacks
      var isReady = false; // Flag to indicate if DOM is ready

      /**
       * Checks if an element exists in the DOM.
       * @param {string} id - The ID of the element to check.
       * @returns {boolean} True if the element exists, false otherwise.
       */
      function check(id) {
        return document.getElementById(id) !== null;
      }

      /**
       * Executes stored callbacks for elements that are now ready.
       */
      function fire() {
        if (!isReady) {
          isReady = true; // Mark as ready
          for (var i = 0; i < callbacks.length; i++) {
            if (check(callbacks[i].id)) {
              callbacks[i].fn(); // Execute callback
            }
          }
        }
      }

      // Listen for DOMContentLoaded or window load events
      if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", fire, false);
      } else if (document.attachEvent) {
        document.attachEvent("onreadystatechange", function () {
          if (document.readyState === "complete") {
            fire();
          }
        });
      }
      if (window.addEventListener) {
        window.addEventListener("load", fire, false);
      } else if (window.attachEvent) {
        window.attachEvent("onload", fire);
      }

      return {
        /**
         * Observes an element by its ID and executes a callback when it's ready.
         * @param {string} id - The ID of the element.
         * @param {Function} fn - The callback function to execute.
         */
        observe: function (id, fn) {
          if (check(id) && isReady) {
            fn(); // If already ready, execute immediately
          } else {
            callbacks.push({
              id: id,
              fn: fn
            }); // Otherwise, store callback
          }
        }
      };
    })(); // End of readyElement

    plugin.init(); // Initialize the plugin instance
  }; // End of $.glisse definition

  // Attach the Glisse plugin to jQuery's fn object for chainability
  $.fn.glisse = function (options) {
    return this.each(function () {
      if (undefined == $(this).data('glisse')) {
        var plugin = new $.glisse(this, options);
        $(this).data('glisse', plugin);
      }
    });
  };

}(jQuery, document)); // Pass jQuery and document objects to the IIFE