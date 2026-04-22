/*
 * Carousel Module for ZURB Playground
 * Developed by ZURB, 2010. All rights reserved.
 * Licensed under the MIT License terms.
 * More info: http://www.opensource.org/licenses/mit-license.php
 */
( function ( jQ ) {
  "use strict"; // Enforce strict JavaScript mode for cleaner code.
  
  /**
   * Extends jQuery's prototype with a custom function to find the first image.
   * This method searches within the first element of the matched set,
   * then checks the original element itself if it's an image.
   * @returns {jQuery} The first jQuery image object found.
   */
  jQ.fn.locateInitialPicture = function () {
    return this.first() // Select the initial element from the set.
            .find( 'img' ) // Look for descendant image elements.
            .addBack().filter( 'img' ) // Include the original element if it's an image.
            .first(); // Return the very first image that matches.
  };

  /**
   * The core object encapsulating all carousel logic and state.
   */
  var SLIDER_CORE = {

    /**
     * Default configuration options for any carousel instance.
     * These can be overridden by user-provided settings.
     */
    initialOptions: {
      transitionEffect: 'horizontal-push',     // Defines the visual animation style: 'fade', 'horizontal-slide', 'vertical-slide', 'horizontal-push', 'vertical-push'.
      effectDuration: 0x258,        // Animation speed in milliseconds.
      autoAdvance: !0,            // Set to true for automatic panel progression.
      progressInterval: 4000,         // Time in milliseconds between automatic transitions.
      haltOnMouseOver: !1,        // If true, the carousel pauses when the mouse cursor is over it.
      commenceAdvanceOnMouseLeave: !1,    // If true, the auto-advance timer restarts after the mouse leaves the carousel.
      delayBeforeAdvanceOnMouseLeave: 1000,  // Delay (ms) before the timer resumes after mouse-out.
      directionControls: !0,         // Enables or disables the left/right navigation buttons.
      rightControlLabel: 'Next', // Text content for the right navigation button.
      leftControlLabel: 'Previous', // Text content for the left navigation button.
      textOverlays: !0,           // Flag to determine if captions/text overlays should be displayed.
      overlayTransition: 'fade',       // Animation for captions: 'fade', 'slideOpen', 'none'.
      overlayTransitionSpeed: 600,     // Speed (ms) for caption animations.
      reinitTimerOnManualClick: !1,      // If true, manual navigation resets and restarts the auto-advance timer.
      indicatorDots: !1,           // Enables or disables bullet-style navigation indicators.
      dotThumbnails: !1,        // If true, uses thumbnails instead of numbers for bullets.
      thumbNailDirectory: '',      // Base URL path for thumbnail images.
      onPanelShiftComplete: function(){},   // Callback function executed after a panel transition completes.
      onContentReady: function(){}, // Callback function invoked after all carousel content has loaded.
      responsiveLayout: !0, // Enables responsive resizing behavior.
      centerIndicators: !0    // Automatically centers the bullet navigation using JS. Disable for custom CSS positioning.
    },

    // Internal state variables for the carousel's operation.
    currentPanelIdx: 0, // Zero-based index of the currently active panel.
    totalPanels: 0, // Total count of panels available in the carousel.
    panelContainerWidth: void 0, // Stored width of the carousel container.
    panelContainerHeight: void 0, // Stored height of the carousel container.
    isLocked: void 0, // A flag to prevent overlapping animations.
    autoProgressActive: void 0, // Indicates if the automatic progression is currently running.
    rotationAngle: 0, // Current rotation angle for the circular timer animation.
    containerMarkup: '<div class="caro-viewport" />', // HTML string for the primary wrapper.
    progressIndicatorMarkup: '<div class="caro-clock"><span class="cover-arc"><span class="dial"></span></span><span class="pause-icon"></span></div>', // HTML for the progress timer element.
    overlayMarkup: '<div class="caro-text-block"></div>', // HTML for the caption/text overlay container.
    navigationControlsMarkup: '<div class="caro-nav-controls"><span class="next-btn"></span><span class="prev-btn"></span></div>', // HTML for directional navigation buttons.
    indicatorListMarkup: '<ul class="caro-nav-dots"></ul>', // HTML for the bullet navigation list.

    /**
     * Initializes a new carousel instance.
     * @param {HTMLElement} targetElement The DOM element to be converted into a carousel.
     * @param {Object} userSettings Custom options provided by the user.
     */
    initialize: function ( targetElement, userSettings ) {
      var jqImagePanels, // A jQuery collection of panels that are images.
          loadedImageCounter = 0, // Tracks the number of images that have finished loading.
          instanceRef = this; // A consistent reference to the current carousel instance.

      // Pre-bind event handler methods to ensure they execute in the correct context.
      this.handleIndicatorClick = jQ.proxy( this.handleIndicatorClick, this );
      this.appendIndicator = jQ.proxy( this.appendIndicator, this );
      this.resetAndReleaseLock = jQ.proxy( this.resetAndReleaseLock, this );
      this.haltProgress = jQ.proxy( this.haltProgress, this );
      this.resumeProgressOnMouseOut = jQ.proxy( this.resumeProgressOnMouseOut, this );
      this.clearMouseLeaveTimer = jQ.proxy( this.clearMouseLeaveTimer, this );
      this.animateIndicator = jQ.proxy( this.animateIndicator, this );

      // Combine default settings with any user-provided overrides.
      this.userSettings = jQ.extend( {}, this.initialOptions, userSettings );
      // Explicitly convert string "false" options to boolean false.
      if ( this.userSettings.autoAdvance === 'false' ) this.userSettings.autoAdvance = !1;
      if ( this.userSettings.textOverlays === 'false' ) this.userSettings.textOverlays = !1;
      if ( this.userSettings.directionControls === 'false' ) this.userSettings.directionControls = !1;

      // Cache jQuery objects for frequently accessed DOM elements.
      this.jqTarget = jQ( targetElement );
      this.jqContainer = this.jqTarget.wrap( this.containerMarkup ).parent();
      this.jqPanels = this.jqTarget.children( 'img, a, div' );
      
      // Attach custom event handlers for programmatic control of the carousel.
      this.jqTarget.bind( 'carousel.next', function () {
        instanceRef.transitionPanel( 'next' );
      });

      this.jqTarget.bind( 'carousel.prev', function () {
        instanceRef.transitionPanel( 'prev' );
      });

      this.jqTarget.bind( 'carousel.goto', function ( evt, panelIndex ) {
        instanceRef.transitionPanel( panelIndex );
      });

      this.jqTarget.bind( 'carousel.start', function ( evt, panelIndex ) {
        instanceRef.activateProgress();
      });

      this.jqTarget.bind( 'carousel.stop', function ( evt, panelIndex ) {
        instanceRef.haltProgress();
      });

      // Identify panels that are images for specific loading behavior.
      jqImagePanels = this.jqPanels.filter( 'img' );

      // If no images are present, proceed directly to content readiness.
      if ( jqImagePanels.length === 0 ) {
        this.contentReady();
      } else {
        // For image panels, wait for each image to be fully loaded.
        jqImagePanels.bind( 'graphicReady', function () {
          loadedImageCounter += 1;
          // When all images are loaded, signal content readiness.
          if ( loadedImageCounter === jqImagePanels.length ) {
            instanceRef.contentReady();
          }
        });
      }
    },

    /**
     * Executes once all initial content (especially images) has been loaded.
     * This sets up the carousel's visual elements and behaviors.
     */
    contentReady: function () {
      this.jqTarget
        .addClass( 'caro-active' ) // Add a class indicating the carousel is active.
        .css( { width: '1px', height: '1px' } ); // Set initial minimal dimensions.
      
      this.jqPanels.addClass( 'caro-panel' ); // Apply a common class to all carousel panels.

      this.adjustDimensionsToLargestPanel(); // Determine the carousel's overall size.
      this.modifySettingsForSinglePanel(); // Adjust options if there's only one panel.
      this.configureInitialPanel(); // Set up the display for the very first panel.

      // If auto-advance is enabled, initialize and start the timer.
      if ( this.userSettings.autoAdvance ) {
        this.configureProgressIndicator();
        this.activateProgress();
      }

      // If text overlays (captions) are enabled, set them up.
      if ( this.userSettings.textOverlays ) {
        this.configureTextOverlays();
      }

      // If directional navigation is enabled, create the buttons.
      if ( this.userSettings.directionControls ) {
        this.configureNavigationControls();
      }

      // If bullet navigation is enabled, set up the indicators.
      if ( this.userSettings.indicatorDots ) {
        this.configureIndicatorNavigation();
        this.highlightActiveIndicator(); // Highlight the current panel's indicator.
      }

      this.userSettings.onContentReady.call( this ); // Invoke the user-defined callback.
      // Assumes 'Holder.run()' is an external function call for placeholder images.
      Holder.run();
    },

    /**
     * Retrieves the jQuery object for the panel currently displayed.
     * @returns {jQuery} The active panel element.
     */
    getCurrentPanel: function () {
      return this.jqPanels.eq( this.currentPanelIdx );
    },

    /**
     * Determines the maximum width and height among all panels and
     * sets the carousel container's dimensions accordingly.
     */
    adjustDimensionsToLargestPanel: function () {
      // Loop through all panels to find the largest dimensions.
      var instanceRef = this,
          jqResponsiveSpacer; // Placeholder for responsive sizing.
      
      instanceRef.jqTarget.add( instanceRef.jqContainer ).width( this.jqPanels.first().outerWidth() );
      instanceRef.jqTarget.add( instanceRef.jqContainer ).height( this.jqPanels.first().height() );
      instanceRef.panelContainerWidth = this.jqPanels.first().outerWidth();
      instanceRef.panelContainerHeight = this.jqPanels.first().height();
      jqResponsiveSpacer = this.jqPanels.first().locateInitialPicture().clone(); // Clone the first image for initial spacer.


      this.jqPanels.each( function () {
        var currentPanel = jQ( this ),
            panelCurrentWidth = currentPanel.outerWidth(),
            panelCurrentHeight = currentPanel.height();

        // Update carousel width if a wider panel is encountered.
        if ( panelCurrentWidth > instanceRef.jqTarget.outerWidth() ) {
          instanceRef.jqTarget.add( instanceRef.jqContainer ).width( panelCurrentWidth );
          instanceRef.panelContainerWidth = instanceRef.jqTarget.outerWidth();
        }
        // Update carousel height if a taller panel is encountered.
        if ( panelCurrentHeight > instanceRef.jqTarget.height() ) {
          instanceRef.jqTarget.add( instanceRef.jqContainer ).height( panelCurrentHeight );
          instanceRef.panelContainerHeight = instanceRef.jqTarget.height();
          jqResponsiveSpacer = jQ( this ).locateInitialPicture().clone(); // Update spacer if a new tallest panel is found.
        }
        instanceRef.totalPanels += 1; // Increment the count of panels.
      });

      // Implement fluid (responsive) layout if enabled.
      if ( this.userSettings.responsiveLayout ) {
        if ( typeof this.userSettings.responsiveLayout === "string" ) {
          // If a string is provided (e.g., "16x9"), use it for Holder.js placeholder.
          jqResponsiveSpacer = jQ( "<img>" ).attr( "data-src", "holder.js/" + this.userSettings.responsiveLayout );
        }
        
        instanceRef.jqTarget.prepend( jqResponsiveSpacer ); // Insert the responsive spacer element.
        jqResponsiveSpacer.addClass( 'responsive-placeholder' );
        instanceRef.jqTarget.add( instanceRef.jqContainer ).css( { width: 'inherit' } );
        instanceRef.jqTarget.add( instanceRef.jqContainer ).css( { height: 'inherit' } );

        // Recalculate dimensions on window resize for dynamic responsiveness.
        jQ( window ).bind( 'resize', function () {
          instanceRef.panelContainerWidth = instanceRef.jqTarget.outerWidth();
          instanceRef.panelContainerHeight = instanceRef.jqTarget.height();
        });
      }
    },

    /**
     * Sets a lock to prevent concurrent carousel animations.
     */
    acquireLock: function () {
      this.isLocked = !0;
    },

    /**
     * Releases the lock, allowing new carousel animations to proceed.
     */
    releaseLock: function () {
      this.isLocked = !1;
    },

    /**
     * Adjusts carousel options if there's only a single panel, disabling unnecessary features.
     */
    modifySettingsForSinglePanel: function () {
      if( this.jqPanels.length === 1 ) {
        this.userSettings.directionControls = !1; // Disable directional buttons.
        this.userSettings.autoAdvance = !1; // Disable auto-progression.
        this.userSettings.indicatorDots = !1; // Disable navigation bullets.
      }
    },

    /**
     * Configures the initial display state of the first panel.
     */
    configureInitialPanel: function () {
      // Set the first panel's z-index to bring it to the front and fade it in.
      var instanceRef = this;
      this.jqPanels.first()
        .css( { "z-index" : 3 } )
        .fadeIn( function() {
          // Ensure all other panels are visible after the initial fade-in,
          // in case CSS initially hid them.
          instanceRef.jqPanels.css( { "display":"block" } )
      });
    },

    /**
     * Initiates the automatic panel progression (the timer).
     */
    activateProgress: function () {
      var instanceRef = this;

      if( !this.userSettings.autoAdvance ) {
        return !1; // If auto-advance is disabled, do nothing.
      }

      // Check if the visual progress indicator is hidden.
      if ( this.jqProgressIndicator.is( ':hidden' ) ) {
        // If hidden, use a simple interval to trigger 'next' events.
        this.progressClock = setInterval( function () {
          instanceRef.jqTarget.trigger( 'carousel.next' );
        }, this.userSettings.progressInterval );
      } else {
        // If visible, animate the circular timer.
        this.autoProgressActive = !0; // Mark auto-progress as running.
        this.jqPauseElement.removeClass( 'active' ); // Ensure pause icon is not active.
        this.progressClock = setInterval( this.animateIndicator, this.userSettings.progressInterval / 180, !1 );
      }
    },

    /**
     * Animates the circular progress indicator.
     * @param {boolean} resetFlag If true, immediately resets the animation and triggers next panel.
     */
    animateIndicator: function ( resetFlag ) {
      var rotationStyle = "rotate(" + this.rotationAngle + "deg)"; // CSS transform string for rotation.
      this.rotationAngle += 2; // Increment the rotation angle by 2 degrees.
      this.jqRotatorElement.css( {
        "-webkit-transform": rotationStyle,
        "-moz-transform": rotationStyle,
        "-o-transform": rotationStyle,
        "-ms-transform": rotationStyle
      } );
      // After 180 degrees, add 'move' class to change the mask's appearance.
      if( this.rotationAngle > 180 ) {
        this.jqRotatorElement.addClass( 'move' );
        this.jqMaskElement.addClass( 'move' );
      }
      // If a full rotation is complete or a reset is requested, reset and advance.
      if( this.rotationAngle > 360 || resetFlag ) {
        this.jqRotatorElement.removeClass( 'move' );
        this.jqMaskElement.removeClass( 'move' );
        this.rotationAngle = 0; // Reset the rotation angle.
        this.jqTarget.trigger( 'carousel.next' ); // Trigger the next panel transition.
      }
    },

    /**
     * Halts the automatic panel progression.
     */
    haltProgress: function () {
      if ( !this.userSettings.autoAdvance ) {
        return !1; // Do nothing if auto-advance is not enabled.
      } else {
        this.autoProgressActive = !1; // Mark auto-progress as inactive.
        clearInterval( this.progressClock ); // Stop the interval timer.
        this.jqPauseElement.addClass( 'active' ); // Activate the pause icon.
      }
    },

    /**
     * Sets up the visual progress indicator (circular timer).
     */
    configureProgressIndicator: function () {
      this.jqProgressIndicator = jQ( this.progressIndicatorMarkup ); // Create the timer element from markup.
      this.jqContainer.append( this.jqProgressIndicator ); // Append it to the main carousel container.

      this.jqRotatorElement = this.jqProgressIndicator.find( '.dial' ); // Cache the rotating part.
      this.jqMaskElement = this.jqProgressIndicator.find( '.cover-arc' ); // Cache the mask part.
      this.jqPauseElement = this.jqProgressIndicator.find( '.pause-icon' ); // Cache the pause button.

      this.jqProgressIndicator.click( this.handleIndicatorClick ); // Bind click event to toggle play/pause.

      // Set up mouse event handlers for timer control based on settings.
      if ( this.userSettings.commenceAdvanceOnMouseLeave ) {
        this.jqContainer.mouseleave( this.resumeProgressOnMouseOut );
        this.jqContainer.mouseenter( this.clearMouseLeaveTimer );
      }

      if ( this.userSettings.haltOnMouseOver ) {
        this.jqContainer.mouseenter( this.haltProgress );
      }
    },

    /**
     * Resumes the automatic progression after a delay when the mouse leaves the carousel area.
     */
    resumeProgressOnMouseOut: function () {
      var instanceRef = this;

      this.mouseOutDelay = setTimeout( function() {
        if( !instanceRef.autoProgressActive ){ // Only restart if it's currently paused.
          instanceRef.activateProgress();
        }
      }, this.userSettings.delayBeforeAdvanceOnMouseLeave );
    },

    /**
     * Clears any pending timer resumption initiated by a mouse leave event.
     */
    clearMouseLeaveTimer: function () {
      clearTimeout( this.mouseOutDelay );
    },

    /**
     * Toggles the automatic progression (play/pause) when the timer element is clicked.
     */
    handleIndicatorClick: function () {
      if( !this.autoProgressActive ) {
          this.activateProgress(); // If paused, start it.
      } else {
          this.haltProgress(); // If running, pause it.
      }
    },

    /**
     * Sets up the caption/text overlay display for the carousel.
     */
    configureTextOverlays: function () {
      this.jqOverlayElement = jQ( this.overlayMarkup ); // Create the caption element.
      this.jqContainer.append( this.jqOverlayElement ); // Append it to the main container.
      this.updateOverlayText(); // Set the initial caption text.
    },

    /**
     * Updates the content and animation of the current caption/text overlay.
     */
    updateOverlayText: function () {
      var overlayDataSource = this.getCurrentPanel().attr( 'data-caption' ), // Get caption source from current panel's data attribute.
          overlayContent; // Variable to hold the retrieved caption HTML.

      if ( !this.userSettings.textOverlays ) {
        return !1; // If captions are disabled, exit.
      }

      // If a data-caption attribute is found for the current panel.
      if ( overlayDataSource ) {
        // If the caption text is empty after trimming whitespace, do not show.
        if ( jQ.trim( jQ( overlayDataSource ).text() ).length < 1 ){
          return !1;
        }
        overlayContent = jQ( overlayDataSource ).html(); // Retrieve the HTML content from the specified source.
        this.jqOverlayElement
          .attr( 'id', overlayDataSource ) // Set an ID (possibly for CSS targeting).
          .html( overlayContent ); // Update the caption element's HTML.
          // Animate the caption's entrance based on configured setting.
        switch ( this.userSettings.overlayTransition ) {
          case 'none':
            this.jqOverlayElement.show();
            break;
          case 'fade':
            this.jqOverlayElement.fadeIn( this.userSettings.overlayTransitionSpeed );
            break;
          case 'slideOpen':
            this.jqOverlayElement.slideDown( this.userSettings.overlayTransitionSpeed );
            break;
        }
      } else {
        // If no data-caption is found, animate the caption's exit.
        switch ( this.userSettings.overlayTransition ) {
          case 'none':
            this.jqOverlayElement.hide();
            break;
          case 'fade':
            this.jqOverlayElement.fadeOut( this.userSettings.overlayTransitionSpeed );
            break;
          case 'slideOpen':
            this.jqOverlayElement.slideUp( this.userSettings.overlayTransitionSpeed );
            break;
        }
      }
    },

    /**
     * Sets up the directional navigation buttons (left/right).
     */
    configureNavigationControls: function () {
      var instanceRef = this,
          jqNavigationElements = jQ( this.navigationControlsMarkup ); // Create navigation elements from markup.

      // Set the text for the forward and backward buttons.
      jqNavigationElements.find( '.next-btn' ).html( this.userSettings.rightControlLabel );
      jqNavigationElements.find( '.prev-btn' ).html( this.userSettings.leftControlLabel );

      this.jqContainer.append( jqNavigationElements ); // Append navigation to the main container.

      // Bind click handler for the 'previous' button.
      this.jqContainer.find( '.prev-btn' ).click( function () {
        instanceRef.haltProgress(); // Stop auto-advance.
        if ( instanceRef.userSettings.reinitTimerOnManualClick ) {
          instanceRef.animateIndicator( !0 ); // Reset timer animation.
          instanceRef.activateProgress(); // Restart auto-advance.
        }
        instanceRef.jqTarget.trigger( 'carousel.prev' ); // Trigger the custom 'prev' event.
      });

      // Bind click handler for the 'next' button.
      this.jqContainer.find( '.next-btn' ).click( function () {
        instanceRef.haltProgress(); // Stop auto-advance.
        if ( instanceRef.userSettings.reinitTimerOnManualClick ) {
          instanceRef.animateIndicator( !0 ); // Reset timer animation.
          instanceRef.activateProgress(); // Restart auto-advance.
        }
        instanceRef.jqTarget.trigger( 'carousel.next' ); // Trigger the custom 'next' event.
      });
    },

    /**
     * Sets up the bullet navigation indicators.
     */
    configureIndicatorNavigation: function () {
      this.jqIndicatorList = jQ( this.indicatorListMarkup ); // Create the bullet list element.
      this.jqContainer.append( this.jqIndicatorList ); // Append it to the main container.
      this.jqPanels.each( this.addNavigationIndicator ); // Add a bullet for each panel.
      this.jqTarget.addClass( 'with-indicators' ); // Add a class to the carousel for styling.
      // Center the bullet navigation if the option is enabled.
      if ( this.userSettings.centerIndicators ) this.jqIndicatorList.css( 'margin-left', -this.jqIndicatorList.outerWidth() / 2 );
    },

    /**
     * Adds a single navigation indicator (bullet) for a given panel.
     * @param {number} itemIndex The zero-based index of the panel.
     * @param {HTMLElement} itemPanel The DOM element of the panel.
     */
    addNavigationIndicator: function ( itemIndex, itemPanel ) {
      var ordinalPosition = itemIndex + 1, // 1-based position for display.
          jqListItem = jQ( '<li>' + (ordinalPosition) + '</li>' ), // Create the list item for the bullet.
          thumbnailSource, // URL for the thumbnail image.
          instanceRef = this; // Reference to the current carousel instance.

      // If thumbnail bullets are enabled.
      if ( this.userSettings.dotThumbnails ) {
        thumbnailSource = jQ( itemPanel ).attr( 'data-thumb' ); // Get thumbnail source from panel's data attribute.
        if ( thumbnailSource ) {
          jqListItem
            .addClass( 'has-thumbnail' ) // Add class for styling.
            .css( { background: "url(" + this.userSettings.thumbNailDirectory + thumbnailSource + ") no-repeat" } ); // Set thumbnail as background.
        }
      }
      this.jqIndicatorList.append( jqListItem ); // Add the bullet to the indicator list.
      jqListItem.data( 'index', itemIndex ); // Store the panel's index in the bullet's data.
      // Bind click handler to the bullet for direct panel navigation.
      jqListItem.click( function () {
        instanceRef.haltProgress(); // Stop auto-advance.
        if ( instanceRef.userSettings.reinitTimerOnManualClick ) {
          instanceRef.animateIndicator( !0 ); // Reset timer animation.
          instanceRef.activateProgress(); // Restart auto-advance.
        }
        instanceRef.jqTarget.trigger( 'carousel.goto', [ jqListItem.data( 'index' ) ] ) // Trigger the custom 'goto' event.
      });
    },

    /**
     * Highlights the navigation indicator corresponding to the currently active panel.
     */
    highlightActiveIndicator: function () {
      if( !this.userSettings.indicatorDots ) { return !1; } else {
        this.jqIndicatorList.find( 'li' )
          .removeClass( 'active' ) // Remove 'active' class from all indicators.
          .eq( this.currentPanelIdx ) // Select the indicator for the current panel.
          .addClass( 'active' ); // Add 'active' class to highlight it.
      }
    },

    /**
     * Resets the z-index of the previously active panel and releases the animation lock.
     */
    resetAndRelease: function () {
      this.jqPanels
        .eq( this.previousPanelIdx )
        .css( { "z-index" : 1 } ); // Reset the previous panel's z-index to a lower value.
      this.releaseLock(); // Release the animation lock.
      // Execute the user-defined callback after the slide change.
      this.userSettings.onPanelShiftComplete.call( this, this.jqPanels.eq( this.previousPanelIdx ), this.jqPanels.eq( this.currentPanelIdx ) );
    },

    /**
     * Manages the transition to a new panel, based on direction or specific index.
     * @param {string|number} panelMovementDirection Can be 'next', 'prev', or a numerical index.
     */
    transitionPanel: function ( panelMovementDirection ) {
      // Store the index of the panel that was active before this transition.
      this.previousPanelIdx = this.currentPanelIdx;

      // If the requested panel is already the current one, do nothing.
      if ( this.previousPanelIdx === panelMovementDirection ) { return !1; }

      // If there's only one panel, no transitions are needed.
      if ( this.jqPanels.length === 1 ) { return !1; }
      // Proceed only if no other animation is currently in progress.
      if ( !this.isLocked ) {
        this.acquireLock(); // Set a lock to prevent further transitions until this one completes.
        // Determine the index of the next panel to be displayed.
        if ( panelMovementDirection === "next" ) {
          this.currentPanelIdx++;
          if ( this.currentPanelIdx === this.totalPanels ) {
              this.currentPanelIdx = 0; // Loop back to the first panel.
          }
        } else if ( panelMovementDirection === "prev" ) {
          this.currentPanelIdx--;
          if ( this.currentPanelIdx < 0 ) {
            this.currentPanelIdx = this.totalPanels - 1; // Loop to the last panel.
          }
        } else {
          // Direct navigation to a specific panel by its index.
          this.currentPanelIdx = panelMovementDirection;
          // Infer the direction for animation purposes if navigating by index.
          if ( this.previousPanelIdx < this.currentPanelIdx ) {
            panelMovementDirection = "next";
          } else if ( this.previousPanelIdx > this.currentPanelIdx ) {
            panelMovementDirection = "prev";
          }
        }

        // Update the visual state of the navigation indicators.
        this.highlightActiveIndicator();

        // Set the z-index of the panel that was previously active to be below the new one.
        this.jqPanels
          .eq( this.previousPanelIdx )
          .css( { "z-index" : 2 } );

        // Apply specific animation logic based on the configured transition effect.
        if ( this.userSettings.transitionEffect === "fade" ) {
          this.jqPanels
            .eq( this.currentPanelIdx )
            .css( { "opacity" : 0, "z-index" : 3 } )
            // The original code was truncated here. This line would typically be followed by an animation call.
            // For cloning purposes, we stop exactly where the original code stops.
        }
      }
    }
  }; // End of SLIDER_CORE object definition.

  // Standard jQuery plugin pattern: attach SLIDER_CORE functionality.
  // This part is inferred as missing from the provided snippet but necessary for a functional plugin.
  // We'll follow the pattern of defining the object and then binding it.
  jQ.fn.carousel = function ( option ) {
    return this.each( function () {
      var $this = jQ( this ),
          data = $this.data( 'carousel' ),
          options = typeof option === 'object' && option;
      if ( !data ) {
        $this.data( 'carousel', ( data = new SLIDER_CORE.initialize( this, options ) ) );
      }
      if ( typeof option === 'string' ) {
        data[ option ]();
      }
    });
  };

})(jQuery);