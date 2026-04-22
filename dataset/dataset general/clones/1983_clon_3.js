/*
 * This file is part of a JavaScript component for a sliding navigation panel.
 * It is provided under the terms of the MIT License, allowing for broad usage.
 *
 * Copyright (c) 2014 by Adam Banaszkiewicz.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @version 0.1.0
 * @last_updated 2023.10.27 (Re-cloned version)
 * @author Original Author: Adam Banaszkiewicz
 * @contributor Clone Generator
 */
(function(jq) {
  // Ensure jQuery/Zepto is available before proceeding.
  if (!jq) {
    console.error("jQuery-like object (jq) is not defined. Cannot initialize slideNav plugin.");
    return;
  }

  /**
   * Extends jQuery/Zepto prototypes to include a slide-in navigation panel.
   * @param {object} customConfig - User-defined configuration options for the navigation.
   * @returns {jq} The jQuery object for chaining, allowing further method calls.
   */
  jq.fn.slideNav = function(customConfig) {
    const defaultSettings = {
      // Screen width (in pixels) that delineates mobile vs. desktop viewports.
      breakpointPx: 768,
      // The fixed width of the navigation panel in mobile view (pixels).
      panelWidth: 250,
      // Duration of panel animations (in milliseconds).
      animDurationMs: 200,
      // Opacity level for the overlay backdrop when the panel is open (0.0 to 1.0).
      backdropAlpha: 0.4,
      // CSS class for the button that toggles the navigation panel.
      triggerCls: 'slide-nav-toggle-btn',
      // HTML string for the menu toggle button, appended to the header if displayed.
      triggerMarkup: '<button class="slide-nav-toggle-btn" aria-label="Toggle navigation"><span></span><span></span><span></span></button>',
      // Text content for the page header displayed on mobile.
      pageHeader: '',
      // Flag to determine if a mobile-specific header should be generated and shown.
      displayHeader: false,
      // Scroll position (pixels) from the top at which the header becomes visible.
      headerShowThreshold: 40,
      // Callback function executed when the navigation panel is opened.
      onPanelOpen: function(navElement) {},
      // Callback function executed when the navigation panel is closed.
      onPanelClose: function(navElement) {},
      // Callback when the layout switches from desktop to mobile.
      onSwitchToMobile: function(navElement) {
        navElement.parent().parent().addClass('vertical-layout');
      },
      // Callback when the layout switches from mobile to desktop.
      onSwitchToDesktop: function(navElement) {
        navElement.parent().parent().removeClass('vertical-layout');
      },
      // Callback when the mobile header bar is shown.
      onHeaderDisplay: function(headerElem) {},
      // Callback when the mobile header bar is hidden.
      onHeaderConceal: function(headerElem) {}
    };

    // Merge default settings with user-provided configurations using a deep extend.
    const cfg = jq.extend(true, {}, defaultSettings, customConfig);

    /**
     * Core class for managing the slide navigation panel.
     * @param {jq} primaryElement - The jQuery object representing the main navigation UL.
     * @param {object} componentConfig - The merged configuration options for this instance.
     */
    const SlideNavigation = function(primaryElement, componentConfig) {
      this.cfg = componentConfig;
      this.targetElement = primaryElement;
      this.backdropLayer = jq([]); // jQuery object for the overlay backdrop
      this.headerBar = jq([]); // jQuery object for the mobile header bar
      this.isHeaderVisible = false;
      this.isPanelOpen = false;
      this.viewModeChangedToMobile = false; // Tracks if the layout was last set to mobile
      this.viewModeChangedToDesktop = false; // Tracks if the layout was last set to desktop
      this.initialSetupComplete = false; // Flag to prevent multiple initializations

      const self = this; // Cache 'this' for consistent access within nested functions

      /**
       * Initializes the navigation component by setting up DOM, attaching events,
       * and performing an initial view adjustment.
       */
      this.initialize = function() {
        // Guard clause: prevent re-initialization if already completed.
        if (self.initialSetupComplete) {
          return;
        }

        self.setupComponents();
        self.attachListeners();
        self.adjustViewBasedOnWidth(); // Set initial layout based on current window size

        // Attach a debounced or throttled resize event for performance in production,
        // but for this clone, a direct call is sufficient.
        jq(window).on('resize.slideNav', function() {
          self.adjustViewBasedOnWidth();
        });

        self.initialSetupComplete = true;
      };

      /**
       * Prepares and inserts necessary DOM elements such as the wrapper,
       * overlay backdrop, and the mobile header bar.
       */
      this.setupComponents = function() {
        // Wrap the main navigation element in a container div.
        self.targetElement.wrap(
          jq('<div />', { 'class': 'slide-nav-container' })
        );

        // Conditional creation of the mobile header bar.
        if (self.cfg.displayHeader) {
          let existingHeader = jq('.slide-nav-header-bar');
          if (existingHeader.length === 0) {
            // Create and append a new header bar if one doesn't exist.
            self.headerBar = jq('<div />', {
              'class': 'slide-nav-header-bar',
              'style': 'display:block; position:fixed; left:0; top:0; width:100%; height:55px; background-color:#fff; z-index:999998; box-shadow: 0 2px 5px rgba(0,0,0,0.2);'
            }).appendTo('body');

            // Add the menu toggle button to the header.
            self.headerBar.append(
              jq(self.cfg.triggerMarkup).addClass(self.cfg.triggerCls).css({ 'float': 'left', 'margin': '5px' })
            );

            // Add the title text to the header.
            self.headerBar.append(
              `<div class="slide-nav-header-text" style="float:left; line-height:55px; height:55px; margin-left:10px;">${self.cfg.pageHeader}</div>`
            );

            // Set initial header visibility based on scroll threshold.
            if (self.cfg.headerShowThreshold === 0) {
              self.displayHeaderBar();
            } else {
              self.concealHeaderBar();
            }
          } else {
            // If an existing header is found, use it.
            self.headerBar = existingHeader;
          }
        }

        // Handle the creation or retrieval of the overlay backdrop.
        let existingBackdrop = jq('.slide-nav-backdrop');
        if (existingBackdrop.length === 0) {
          // Create a new backdrop element if it doesn't exist.
          self.backdropLayer = jq('<div />', {
            'class': 'slide-nav-backdrop',
            'style': 'display:block; position:fixed; left:0; top:0; width:100%; height:100%; z-index:999998; background-color:#000000;'
          }).appendTo('body');
        } else {
          // If an existing backdrop is found, use it.
          self.backdropLayer = existingBackdrop;
        }

        // Initialize backdrop state: fully transparent and hidden.
        self.backdropLayer.css({
          'opacity': 0,
          'display': 'none'
        });
      };

      /**
       * Attaches various event listeners to interactive elements
       * like the toggle button, backdrop, and window scroll.
       */
      this.attachListeners = function() {
        // Event listener for the menu toggle button, using delegation for robustness.
        jq(document).on('click.slideNav', `.${self.cfg.triggerCls}`, function() {
          if (self.isPanelOpen) {
            self.hidePanel();
          } else {
            self.revealPanel();
          }
        });

        // Event listener for the backdrop layer to close the panel.
        self.backdropLayer.on('click.slideNav', function() {
          self.hidePanel();
        });

        // Event listener for window scroll to manage mobile header visibility.
        if (self.cfg.displayHeader && self.cfg.headerShowThreshold > 0) {
          jq(window).on('scroll.slideNav', function() {
            if (jq(this).scrollTop() >= self.cfg.headerShowThreshold) {
              self.displayHeaderBar();
            } else {
              self.concealHeaderBar();
            }
          });
        }
      };

      /**
       * Determines and applies the correct layout (mobile or desktop)
       * based on the current window width.
       */
      this.adjustViewBasedOnWidth = function() {
        if (self.getViewportWidth() <= self.cfg.breakpointPx) {
          self.activateMobileLayout();
        } else {
          self.activateDesktopLayout();
        }

        // Always close the panel if it's open when the view mode changes.
        if (self.isPanelOpen) {
          self.hidePanel();
        }
      };

      /**
       * Applies styling and behavior specific to the mobile viewport.
       */
      this.activateMobileLayout = function() {
        // Guard clause: only apply changes if not already in mobile view.
        if (!self.viewModeChangedToMobile) {
          const navParent = self.targetElement.parent(); // Reference to .slide-nav-container

          navParent
            .removeClass('slide-nav-mode-desktop')
            .addClass('slide-nav-mode-mobile')
            .css({
              display: 'none', // Panel is initially hidden in mobile view
              position: 'fixed',
              top: '0px',
              zIndex: '999999',
              overflowY: 'auto', // Allow vertical scrolling within the panel
              height: '100%',
              width: `${self.getPanelDimension()}px`,
              left: `-${self.getPanelDimension()}px`, // Position off-screen to the left
              boxSizing: 'border-box' // Include padding and border in the element's total width
            });

          if (self.cfg.displayHeader) {
            self.headerBar.show(); // Ensure mobile header is visible
          }

          // Update internal state flags.
          self.viewModeChangedToDesktop = false;
          self.viewModeChangedToMobile = true;

          // Execute the mobile layout change callback.
          self.cfg.onSwitchToMobile(self.targetElement);
        }
      };

      /**
       * Applies styling and behavior specific to the desktop viewport.
       */
      this.activateDesktopLayout = function() {
        // Guard clause: only apply changes if not already in desktop view.
        if (!self.viewModeChangedToDesktop) {
          const navParent = self.targetElement.parent(); // Reference to .slide-nav-container

          navParent
            .removeClass('slide-nav-mode-mobile')
            .addClass('slide-nav-mode-desktop')
            .css({
              display: 'block', // Panel is always visible on desktop
              position: 'static', // Revert to normal document flow
              top: 'auto',
              zIndex: 'auto',
              overflowY: 'visible', // Revert vertical overflow behavior
              height: 'auto',
              width: 'auto',
              left: 'auto',
              boxSizing: 'content-box' // Revert box-sizing to default
            });

          if (self.cfg.displayHeader) {
            self.headerBar.hide(); // Hide mobile header on desktop
            self.concealHeaderBar(); // Ensure internal state is consistent
          }

          // Update internal state flags.
          self.viewModeChangedToDesktop = true;
          self.viewModeChangedToMobile = false;

          // Execute the desktop layout change callback.
          self.cfg.onSwitchToDesktop(self.targetElement);
        }
      };

      /**
       * Reveals the navigation panel with an animation.
       */
      this.revealPanel = function() {
        // Guard clause: only open if not already open and within mobile breakpoint.
        if (!self.isPanelOpen && self.getViewportWidth() <= self.cfg.breakpointPx) {
          self.isPanelOpen = true;

          const navContainer = self.targetElement.parent();
          navContainer.show().animate({
            left: '0px'
          }, self.cfg.animDurationMs, 'swing'); // Added 'swing' easing

          self.backdropLayer.css('display', 'block').animate({
            opacity: self.cfg.backdropAlpha
          }, self.cfg.animDurationMs, 'swing');

          // Prevent the main body from scrolling when the panel is active.
          jq('body').css('overflow', 'hidden');

          self.cfg.onPanelOpen(self.targetElement);
        }
      };

      /**
       * Conceals the navigation panel with an animation.
       */
      this.hidePanel = function() {
        // Guard clause: only close if the panel is currently open.
        if (self.isPanelOpen) {
          self.isPanelOpen = false;

          const navContainer = self.targetElement.parent();
          navContainer.animate({
            left: `-${self.getPanelDimension()}px`
          }, self.cfg.animDurationMs, 'swing', function() {
            jq(this).hide(); // Fully hide the container after animation
          });

          self.backdropLayer.animate({
            opacity: 0
          }, self.cfg.animDurationMs, 'swing', function() {
            jq(this).css('display', 'none'); // Fully hide the backdrop after animation
            self.cfg.onPanelClose(self.targetElement);
          });

          // Re-enable scrolling for the main body.
          jq('body').css('overflow', 'auto');
        }
      };

      /**
       * Makes the mobile header bar visible.
       */
      this.displayHeaderBar = function() {
        // Guard clause: only show if not already visible and in mobile view.
        if (!self.isHeaderVisible && self.viewModeChangedToMobile) {
          // Stop any current animation before starting a new one.
          self.headerBar.stop(true, true).show().animate({ opacity: 1 }, self.cfg.animDurationMs);
          self.isHeaderVisible = true;
          self.cfg.onHeaderDisplay(self.headerBar);
        }
      };

      /**
       * Hides the mobile header bar.
       */
      this.concealHeaderBar = function() {
        // Guard clause: only hide if currently visible.
        if (self.isHeaderVisible) {
          // Stop any current animation before starting a new one.
          self.headerBar.stop(true, true).animate({ opacity: 0 }, self.cfg.animDurationMs, function() {
            jq(this).hide(); // Fully hide the header bar after animation
          });
          self.isHeaderVisible = false;
          self.cfg.onHeaderConceal(self.headerBar);
        }
      };

      /**
       * Retrieves the configured width of the navigation panel, with basic validation.
       * @returns {number} The panel width in pixels, or a default if configuration is invalid.
       */
      this.getPanelDimension = function() {
        const widthVal = parseInt(self.cfg.panelWidth, 10);
        // Return the parsed width if valid, otherwise fallback to a default.
        return isNaN(widthVal) || widthVal <= 0 ? 250 : widthVal;
      };

      /**
       * Calculates and returns the current width of the client viewport.
       * @returns {number} The viewport width in pixels.
       */
      this.getViewportWidth = function() {
        // Prioritize modern, standard properties for accuracy.
        if (typeof window.innerWidth === 'number') {
          return window.innerWidth;
        } else if (document.documentElement && document.documentElement.clientWidth) {
          return document.documentElement.clientWidth;
        } else if (document.body && document.body.clientWidth) {
          return document.body.clientWidth;
        } else {
          // Fallback to jQuery's cross-browser width method for older environments.
          return jq(window).width();
        }
      };
    };

    // Iterate over each selected element and initialize the SlideNavigation.
    return this.each(function() {
      const currentElement = jq(this);
      // Prevent multiple initializations on the same element by checking for a data attribute.
      if (!currentElement.data('slideNavInstance')) {
        const navInstance = new SlideNavigation(currentElement, cfg);
        navInstance.initialize();
        currentElement.data('slideNavInstance', navInstance); // Store the instance for future reference
      } else {
        // Log a warning if an attempt is made to re-initialize an already initialized element.
        console.warn('SlideNav already initialized on this element. Skipping re-initialization.');
      }
    });
  };
})(jQuery); // Pass jQuery as 'jq' for internal consistency and clarity