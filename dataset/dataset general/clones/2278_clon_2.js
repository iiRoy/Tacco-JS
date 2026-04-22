(function($) {

  /*
   * jQuery Carousel Component
   * @module jquery.carousel.js
   * @summary Dynamic Content Carousel
   * @creator John Doe - http://example.com
   * @version 1.0.0
   * @releaseDate January 01, 2020
   * @lastUpdated March 15, 2023
   * @copyright (c) 2020 John Doe - http://example.com
   * @license Permissively licensed under MIT or Apache 2.0
   * @demo http://example.com/projects/jquery/carousel/
   */

  var widgetCount = 0; // Tracks number of carousel instances
  var widgetInstances = []; // Stores references to each carousel instance

  $.fn.carousel = function(config) {
    return this.each(function() {
      // Check if this element already has a carousel attached
      if ($(this).data('carousel_index') === undefined) {
        $(this).data('carousel_index', widgetCount); // Assign a unique index
        widgetInstances.push(new $crsl(this, config, widgetCount)); // Initialize and store
        widgetCount++; // Increment the global counter
      }
    });
  };

  var standardSettings = {
    // Speed multiplier for transitions
    speedFactor: 1.0,

    // Time between automatic slide advancements
    slideDuration: 2500.0,

    // The default transition effect to use
    transitionType: '',

    // Should navigation numbers be displayed?
    showIndicators: true,

    // Should 'next'/'previous' controls be visible?
    showControls: true,

    // Should image captions be shown?
    showCaptions: true,

    // Default easing function for animations
    defaultEasing: '',

    // Reference to the main carousel wrapper element (internal use)
    carouselContainer: null,

    // @deprecated: Previous interval configuration
    obsoleteInterval: null,

    // Array of media items and their associated data (internal)
    mediaItems: null,

    // Current active media source URL (internal)
    currentMedia: null,

    // Current active media's hyperlink (internal)
    currentLink: null,

    // Current active media's caption text (internal)
    currentCaption: null,

    // Target window/frame for the current link (internal)
    currentTarget: '_current',

    // Calculated width of the carousel viewport (internal)
    containerWidth: null,

    // Calculated height of the carousel viewport (internal)
    containerHeight: null,

    // Index of the currently displayed media item (internal)
    mediaIndex: 1,

    // Flag indicating if a slide transition is in progress (internal)
    isTransitioning: false,

    // Flag indicating if the carousel area is currently hovered (internal)
    isHovered: false,

    // Algorithm for smart random playback (internal)
    randomAlgorithm: null,

    // Enable random ordering of slides
    randomizeSlides: false,

    // Use thumbnail images for navigation
    thumbnailNav: false,

    // Styles/animation for inactive number/dot indicators
    indicatorIdleStyle: false,

    // Styles/animation for hovered number/dot indicators
    indicatorHoverStyle: false,

    // Styles/animation for the active number/dot indicator
    indicatorActiveStyle: false,

    // Automatically hide UI elements (controls, indicators)
    autoHideUI: false,

    // Enable full-screen display mode
    fullScreenMode: false,

    // Load slide data from an XML document
    xmlSource: false,

    // Use small dots for navigation indicators
    dotNav: false,

    // Custom width for the caption display area
    captionWidth: null,

    // Desired opacity for UI elements when `autoHideUI` is active
    uiOpacity: 0.75,

    // Duration for UI elements to fade in when hovered
    uiFadeInDuration: 200,

    // Duration for UI elements to fade out
    uiFadeOutDuration: 300,

    // Callback function triggered when the carousel is fully loaded
    onCarouselReady: null,

    // Callback function invoked after a slide changes
    onSlideChange: null,

    // @deprecated: Maximum height for number indicators
    deprecatedMaxHeight: 20,

    // Positioning of the navigation indicators (numbers/dots/thumbs)
    indicatorAlignment: 'start',

    // Show a preview of the next/previous slide
    showPreviews: false,

    // Enable focus mode for specific content
    focusEnabled: false,

    // Is focus mode currently active? (internal)
    focusActive: false,

    // Placement of the focus button
    focusBtnPosition: 'middle',

    // Display play/pause controls
    playPauseControls: false,

    // Placement of the play/pause buttons
    playPauseBtnPosition: 'middle',

    // Show a visual progress bar for slide duration
    showProgressBar: false,

    // Custom CSS styles for the progress bar
    progressBarStyles: {},

    // Is the carousel currently paused? (internal)
    isPlaybackPaused: false,

    // Is the display currently blurred? (internal)
    isBlurred: false,

    // Is the timer for auto-advance paused? (internal)
    isTimePaused: false,

    // Timestamp when the current slide started (internal)
    startTime: 0.0,

    // Time elapsed since the current slide started (internal)
    durationElapsed: 0.0,

    // Pause auto-advance when mouse hovers over carousel
    pauseOnHover: true,

    // Enable keyboard navigation (arrow keys)
    enableKeyboardNav: false,

    // List of specific allowed transition animations
    allowedTransitions: [],

    // Function to execute when mouse enters a navigation button
    onControlHoverIn: null,

    // Function to execute when mouse leaves a navigation button
    onControlHoverOut: null,

    // Determines if the carousel should start advancing automatically
    autoAdvance: true,

    // Animation type for captions
    captionTransition: 'revealUp',

    // Specifies a visual theme for the carousel
    visualTheme: null,

    // Base HTML structure for the carousel (internal)
    htmlStructure: '<a href="#" class="back_control">back</a>' +
      '<a href="#" class="forward_control">forward</a>' +
      '<span class="status_bar"></span>' +
      '<div class="viewport_wrapper">' +
      '<div class="media_item">' +
      '<a href=""><img class="main_media" /></a>' +
      '<div class="caption_display"></div>' +
      '</div>' +
      '</div>'

  };

  $.carousel = function(elementRef, userConfig, instanceIdx) {
    this.carouselContainer = $(elementRef);
    this.advanceTimer = null;
    this.currentSettings = $.extend({}, standardSettings, userConfig || {});
    this.widgetIdentifier = instanceIdx;
    this.initialize();
  };

  // Create a shorthand reference for the carousel prototype
  var $crsl = $.carousel;

  $crsl.fn = $crsl.prototype = {};

  $crsl.fn.extend = $.extend;

  $crsl.fn.extend({

    /*
     * Initialize the carousel instance
     */
    initialize: function() {
      var instance = this;

      // Handle full-screen mode configuration
      if (this.currentSettings.fullScreenMode) {
        var viewportWidth = $(window).width();
        var viewportHeight = $(window).height();
        this.carouselContainer.width(viewportWidth).height(viewportHeight);
        this.carouselContainer.css({
          'position': 'absolute',
          'top': 0,
          'left': 0,
          'z-index': 1000
        });
        this.currentSettings.pauseOnHover = false;
        $('body').css({
          'overflow': 'hidden_content'
        });
      }

      this.currentSettings.containerWidth = parseFloat(this.carouselContainer.css('width'));
      this.currentSettings.containerHeight = parseFloat(this.carouselContainer.css('height'));

      // Critical check for valid dimensions
      if (!this.currentSettings.containerWidth || !this.currentSettings.containerHeight) {
        console.warn('Container width or height is invalid! - Carousel Widget');
        return false;
      }

      // Apply the specified visual theme
      if (this.currentSettings.visualTheme) {
        this.carouselContainer.addClass('carousel-' + this.currentSettings.visualTheme);
      }

      // Insert the base HTML structure
      this.carouselContainer.append(this.currentSettings.htmlStructure);

      // Process easing function for transitions
      this.currentSettings.defaultEasing = this.retrieveEasing(this.currentSettings.transitionEasing);

      // Normalize speed factor
      if (this.currentSettings.speedFactor >= 2.0) this.currentSettings.speedFactor = 1.3;
      if (this.currentSettings.speedFactor <= 0.0) this.currentSettings.speedFactor = 1.0;

      // Hide initial UI elements
      this.carouselContainer.find('.status_bar').hide();
      this.carouselContainer.find('.caption_display').hide();
      this.carouselContainer.find('.back_control').hide();
      this.carouselContainer.find('.forward_control').hide();

      // Set dimensions for the main viewport
      this.carouselContainer.find('.viewport_wrapper').width(this.currentSettings.containerWidth);
      this.carouselContainer.find('.viewport_wrapper').height(this.currentSettings.containerHeight);

      // Determine caption area width
      var captionAreaWidth = this.currentSettings.captionWidth ? this.currentSettings.captionWidth : this.currentSettings.containerWidth;
      this.carouselContainer.find('.caption_display').width(captionAreaWidth);

      var firstSelectionClass = ' media_indicator_active';
      var itemCounter = 0;
      this.currentSettings.mediaItems = []; // Initialize media items array

      // Helper function to add a media entry
      var registerMediaEntry = function(itemUrl, mediaPath, transitionStyle, itemCaptionText, linkTarget) {
        instance.currentSettings.mediaItems.push([mediaPath, itemUrl, transitionStyle, itemCaptionText, linkTarget]);
        if (instance.currentSettings.thumbnailNav) {
          var thumbSizeAttribute = '';
          if (instance.currentSettings.containerWidth > instance.currentSettings.containerHeight) {
            thumbSizeAttribute = 'height="100"';
          } else {
            thumbSizeAttribute = 'width="100"';
          }
          instance.carouselContainer.find('.status_bar').append(
            '<span class="media_indicator' + firstSelectionClass + '" rel="' + (itemCounter - 1) + '" id="slide_id_' + itemCounter + '_' + instance.widgetIdentifier + '">' +
            '<img src="' + mediaPath + '" ' + thumbSizeAttribute + ' />' +
            '</span> '
          );
        } else {
          instance.carouselContainer.find('.status_bar').append(
            '<span class="media_indicator' + firstSelectionClass + '" rel="' + (itemCounter - 1) + '" id="slide_id_' + itemCounter + '_' + instance.widgetIdentifier + '">' + itemCounter + '</span> '
          );
        }
        firstSelectionClass = ''; // Reset for subsequent items
      };

      // Load data from an external XML file
      if (this.currentSettings.xmlSource) {
        $.ajax({
          type: 'GET',
          url: this.currentSettings.xmlSource,
          async: false,
          dataType: 'xml',
          success: function(xmlDoc) {
            var tempListElement = $('<ul></ul>'); // This variable is not used
            $(xmlDoc).find('carousel-data media-entry').each(function() {
              itemCounter++;
              var entryUrl = ($(this).find('link').text()) ? $(this).find('link').text() : '#';
              var entrySrc = $(this).find('media').text();
              var entryTransition = $(this).find('media').attr('type');
              var entryCaption = $(this).find('caption').text();
              var entryTarget = ($(this).find('target').text()) ? $(this).find('target').text() : '_current';
              registerMediaEntry(entryUrl, entrySrc, entryTransition, entryCaption, entryTarget);
            });
          }
        });
      }
      // Placeholder for JSON data loading
      else if (this.currentSettings.jsonSource) {
        // Implementation for JSON loading would go here
      }
      // Load data directly from existing HTML elements
      else {
        this.carouselContainer.find('div.slide-item').each(function() {
          itemCounter++;
          var anchorElement = $(this).find('a');
          var imageElement = $(this).find('img');

          var entryUrl = (anchorElement.length) ? anchorElement.attr('href') : '#';
          var entrySrc = imageElement.attr('src');
          var entryTransition = (imageElement.attr('class')) ? imageElement.attr('class') : '';
          var entryCaption = $(this).find('.caption_content').html();
          var entryTarget = (anchorElement.length && anchorElement.attr('target')) ? anchorElement.attr('target') : '_current';
          registerMediaEntry(entryUrl, entrySrc, entryTransition, entryCaption, entryTarget);
        });
      }

      // Configure thumbnail navigation
      if (instance.currentSettings.thumbnailNav && !instance.currentSettings.fullScreenMode) {
        // Redefine indicator styles for thumbnails
        instance.currentSettings.indicatorIdleStyle = {
          opacity: 0.30
        };
        instance.currentSettings.indicatorHoverStyle = {
          opacity: 0.50
        };
        instance.currentSettings.indicatorActiveStyle = {
          opacity: 1.0
        };

        instance.carouselContainer.find('.status_bar').addClass('thumb_navigation');
        var totalThumbPanelWidth = (itemCounter + 1) * instance.carouselContainer.find('.thumb_navigation .media_indicator').width();
        instance.carouselContainer.find('.thumb_navigation').width(totalThumbPanelWidth);
        instance.carouselContainer.css({
          height: instance.carouselContainer.height() + instance.carouselContainer.find('.status_bar').height()
        });

        instance.carouselContainer.append('<div class="thumbnail_wrapper"></div>');
        var clonedStatusPanel = instance.carouselContainer.find('.status_bar').clone();
        instance.carouselContainer.find('.status_bar').remove();
        instance.carouselContainer.find('.thumbnail_wrapper')
          .width(instance.currentSettings.containerWidth)
          .append(clonedStatusPanel);

        // Implement scrolling behavior for thumbnails on mouse movement
        var cumulativeThumbWidth = 0;
        var containerWidth = this.currentSettings.containerWidth;
        var containerHeight = this.currentSettings.containerHeight;
        var thumbPanelActualWidth = 0;
        var thumb_navigation = instance.carouselContainer.find('.thumb_navigation');
        var offsetXCoord = 0;
        var offsetYCoord = instance.carouselContainer.offset().top;

        thumb_navigation.find('.media_indicator').each(function() {
          cumulativeThumbWidth += $(this).outerWidth();
        });

        thumb_navigation.width(cumulativeThumbWidth + 'px');
        thumbPanelActualWidth = thumb_navigation.width();
        var effectiveWidth = this.currentSettings.containerWidth;

        effectiveWidth = containerWidth - 100;

        if (totalThumbPanelWidth > instance.currentSettings.containerWidth) {
          instance.carouselContainer.on('mousemove', function(mouseEvent) {
            offsetXCoord = instance.carouselContainer.offset().left + 90;

            var cursorPositionX = mouseEvent.pageX;
            var cursorPositionY = mouseEvent.pageY;
            var newPositionX = 0;

            cursorPositionX = cursorPositionX - offsetXCoord;
            cursorPositionY = cursorPositionY - offsetYCoord;
            var scrollableRange = thumbPanelActualWidth - effectiveWidth;
            newPositionX = -((scrollableRange * cursorPositionX) / effectiveWidth);

            if (newPositionX > 0) newPositionX = 0;
            if (newPositionX < -(thumbPanelActualWidth - containerWidth)) newPositionX = -(thumbPanelActualWidth - containerWidth);

            if (cursorPositionY > containerHeight) {
              thumb_navigation.css({
                left: newPositionX
              });
            }
          });
        }

        instance.carouselContainer.find('.thumbnail_scroll_area').css({
          'left': 10.0
        });

        if (totalThumbPanelWidth < instance.currentSettings.containerWidth) {
          instance.carouselContainer.find('.status_bar').width('auto');
          instance.carouselContainer.find('.thumbnail_scroll_container').hide();

          var panelIdentifierClass = '.status_bar';
          switch (instance.currentSettings.indicatorAlignment) {
            case 'middle':
              var calculatedLeftOffset = (instance.currentSettings.containerWidth - instance.carouselContainer.find(panelIdentifierClass).width()) / 2.0;
              instance.carouselContainer.find(panelIdentifierClass).css({
                'left': calculatedLeftOffset
              });
              break;

            case 'end':
              instance.carouselContainer.find(panelIdentifierClass).css({
                'left': 'auto',
                'right': '-5px'
              });
              break;

            case 'start':
              instance.carouselContainer.find(panelIdentifierClass).css({
                'left': '0px'
              });
              break;
          }
        }

      } else {
        var panelIdentifierClass = '.status_bar';

        if (instance.currentSettings.dotNav) {
          instance.carouselContainer.find('.status_bar').addClass('dot_navigation').removeClass('status_bar');
          panelIdentifierClass = '.dot_navigation';
        }

        switch (instance.currentSettings.indicatorAlignment) {
          case 'middle':
            var calculatedLeftOffset = (instance.currentSettings.containerWidth - instance.carouselContainer.find(panelIdentifierClass).width()) / 2.0;
            instance.carouselContainer.find(panelIdentifierClass).css({
              'left': calculatedLeftOffset
            });
            break;

          case 'end':
            instance.carouselContainer.find(panelIdentifierClass).css({
              'left': 'auto',
              'right': '15px'
            });
            break;

          case 'start':
            instance.carouselContainer.find(panelIdentifierClass).css({
              'left': '15px'
            });
            break;
        }

        if (!instance.currentSettings.dotNav) {
          if (instance.carouselContainer.find('.status_bar').height() > 20.0) {
            instance.carouselContainer.find('.status_bar').hide();
          }
        }
      }

      this.carouselContainer.find('div.hidden-items').hide();

      // Randomize slide order if enabled
      if (this.currentSettings.randomizeSlides) {
        this.currentSettings.mediaItems.sort(function(a, b) {
          return Math.random() - 0.5;
        });
      }

      // Set initial slide data
      this.currentSettings.currentMedia = this.currentSettings.mediaItems[0][0];
      this.currentSettings.currentLink = this.currentSettings.mediaItems[0][1];
      this.currentSettings.currentCaption = this.currentSettings.mediaItems[0][3];
      this.currentSettings.currentTarget = this.currentSettings.mediaItems[0][4];

      // Attach event handlers for navigation controls
      if (this.currentSettings.mediaItems.length > 1) {
        this.carouselContainer.find('.back_control').on('click', function() {
          if (instance.currentSettings.isTransitioning === false) {

            instance.currentSettings.mediaIndex -= 2.0;

            if (instance.currentSettings.mediaIndex === -2.0) {
              instance.currentSettings.mediaIndex = instance.currentSettings.mediaItems.length - 2.0;
            } else if (instance.currentSettings.mediaIndex === -1.0) {
              instance.currentSettings.mediaIndex = instance.currentSettings.mediaItems.length - 1.0;
            }

            instance.goToSlide(instance.currentSettings.mediaIndex);
          }
          return false;
        });

        this.carouselContainer.find('.forward_control').on('click', function() {
          instance.goToSlide(instance.currentSettings.mediaIndex);
          return false;
        });

        instance.carouselContainer.find('.forward_control, .back_control').on('mouseenter', instance.currentSettings.onControlHoverIn);
        instance.carouselContainer.find('.forward_control, .back_control').on('mouseleave', instance.currentSettings.onControlHoverOut);