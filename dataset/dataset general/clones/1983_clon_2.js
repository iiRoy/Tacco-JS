/*
 * This file is part of a custom navigation solution.
 * Copyright (c) 2023 by [Your Name/Company Name]
 * All rights reserved.
 */
(function(jQ){
  jQ.fn.fancyNav = function(opts) {
    var config = jQ.extend({
      // Defines the screen width (in pixels) where the mobile layout activates.
      handheldBreakpoint: 767,
      // The fixed width of the navigation panel in mobile view.
      panelSize: 260,
      // Duration for all panel and overlay animations in milliseconds.
      transitionDuration: 220,
      // Transparency level for the background dimmer when the panel is open.
      dimmerTransparency: 0.45,
      // CSS class for the button that toggles the navigation panel.
      toggleButtonClass: 'nav-toggle-button',
      // HTML string for the navigation toggle button.
      toggleButtonMarkup: '<div class="nav-toggle-button"><span></span><span></span><span></span></div>',
      // Text to display in the header bar on handheld devices.
      pageHeader: '',
      // Determines if the header bar should be visible on mobile.
      displayHeaderBar: false,
      // Scroll position (in pixels) at which the header bar becomes visible.
      // Set to 0 to always show the header.
      headerVisibilityScrollThreshold: 50,
      // Callback function executed when the navigation panel is opened.
      onPanelReveal: function(panelElement) {},
      // Callback function executed when the navigation panel is closed.
      onPanelConceal: function(panelElement) {},
      // Callback when the layout switches from desktop to handheld.
      onSwitchToHandheld: function(panelElement) {
        panelElement.parent().parent().addClass('stacked');
      },
      // Callback when the layout switches from handheld to desktop.
      onSwitchToDesktop: function(panelElement) {
        panelElement.parent().parent().removeClass('stacked');
      },
      // Callback for when the header bar becomes visible.
      onHeaderDisplay: function(headerElement) {},
      // Callback for when the header bar is hidden.
      onHeaderConceal: function(headerElement) {}
    }, opts);

    var DrawerComponent = function(mainElement, config) {
      // The current configuration settings for this instance.
      this.cfg = config;

      // The main navigation element (e.g., <ul>).
      this.mainElement = mainElement;

      // The overlay/dimmer element.
      this.dimmer = jQ([]);

      // The header bar element.
      this.headerBar = jQ([]);

      // Flag indicating if the header bar is currently shown.
      this.isHeaderVisible = false;

      // Flag indicating if the navigation panel is currently open.
      this.isPanelOpen = false;

      // Tracks if the view has recently switched to mobile.
      this.isMobileViewActive = false;

      // Tracks if the view has recently switched to desktop.
      this.isDesktopViewActive = false;

      // Initializes the navigation component.
      this.initialize = function() {
        var instance = this;

        this.setupElements();

        this.adjustViewBasedOnWidth();

        this.attachHandlers();

        jQ(window).resize(function() {
          instance.adjustViewBasedOnWidth();
        });
      };

      // Prepares and creates necessary DOM elements.
      this.setupElements = function() {
        this.mainElement.wrap(jQ('<div />', { 'class': 'side-panel-container' }));

        // If the header bar is configured to be shown, create it.
        if (this.cfg.displayHeaderBar) {
          // Check if a header bar already exists to avoid duplicates.
          var existingHeader = jQ('.app-header-strip');

          if (existingHeader.length === 0) {
            jQ('<div />', {
              'class': 'app-header-strip',
              'style': 'display:block;position:fixed;left:0px;top:0px;width:100%;height:60px;background-color:#fefefe;z-index:999998;'
            }).appendTo('body');

            // Get the newly created header element.
            this.headerBar = jQ('.app-header-strip');

            // Append the navigation toggle button.
            this.headerBar.append(jQ(this.cfg.toggleButtonMarkup).addClass(this.cfg.toggleButtonClass).css({ 'float': 'left', 'margin': '8px' }));

            // Append the header text.
            this.headerBar.append('<div class="app-header-text" style="float:left;line-height:60px;height:60px;margin-left:15px;">' + this.cfg.pageHeader + '</div>');

            // Show or hide the header bar based on initial scroll threshold.
            if (this.cfg.headerVisibilityScrollThreshold === 0) {
              this.displayHeader();
            } else {
              this.concealHeader();
            }
          } else {
            this.headerBar = existingHeader;
          }
        }

        var existingDimmer = jQ('.screen-dimmer-layer');

        // Check for existing dimmer to prevent recreation.
        if (existingDimmer.length === 1) {
          this.dimmer = existingDimmer;
        }
        // If no dimmer exists, create one.
        else {
          jQ('<div />', {
            'class': 'screen-dimmer-layer',
            'style': 'display:block;position:fixed;left:0px;top:0px;width:100%;height:100%;z-index:999998;background-color:#111111;'
          }).appendTo('body');

          this.dimmer = jQ('.screen-dimmer-layer');
        }

        this.dimmer
          // Initially set opacity to 0 for fade-in effect.
          .fadeTo(0, 0)
          // Ensure it's hidden by default.
          .css('display', 'none');
      };

      // Attaches event listeners to relevant elements.
      this.attachHandlers = function() {
        var instance = this;

        // Event for the navigation toggle button.
        jQ('.' + this.cfg.toggleButtonClass).click(function() {
          if (instance.isPanelOpen) {
            instance.hidePanel();
          } else {
            instance.revealPanel();
          }
        });

        // Event for clicking the dimmer layer.
        this.dimmer.click(function() {
          instance.hidePanel();
        });

        // Event for window scrolling to manage header visibility.
        jQ(window).scroll(function() {
          if (jQ(this).scrollTop() >= instance.cfg.headerVisibilityScrollThreshold) {
            instance.displayHeader();
          } else {
            instance.concealHeader();
          }
        });
      };

      // Adapts the menu's parent class and style based on viewport width.
      this.adjustViewBasedOnWidth = function() {
        if (this.getViewportWidth() <= this.cfg.handheldBreakpoint) {
          this.configureForHandheld();
        } else {
          this.configureForDesktop();
        }

        // Close the panel if it's open during a view mode change.
        if (this.isPanelOpen) {
          this.hidePanel();
        }
      };

      // Applies styles and classes for handheld device view.
      this.configureForHandheld = function() {
        // Prevent redundant updates.
        if (this.isMobileViewActive === false) {
          this.mainElement
            .parent() // The wrapper element.
            .removeClass('view-mode-desktop')
            .addClass('view-mode-handheld')
            .css({
              display: 'none',
              position: 'fixed',
              top: '0px',
              zIndex: '999999',
              overflow: 'auto',
              height: '100%',
              width: this.getPanelDimension() + 'px',
              left: '-' + this.getPanelDimension() + 'px'
            });

          if (this.cfg.displayHeaderBar) {
            this.headerBar.show();
          }

          this.isDesktopViewActive = false;
          this.isMobileViewActive = true;

          this.cfg.onSwitchToHandheld(this.mainElement);
        }
      };

      // Applies styles and classes for desktop view.
      this.configureForDesktop = function() {
        // Prevent redundant updates.
        if (this.isDesktopViewActive === false) {
          this.mainElement
            .parent() // The wrapper element.
            .removeClass('view-mode-handheld')
            .addClass('view-mode-desktop')
            .css({
              display: 'block',
              position: 'static',
              top: 'auto',
              zIndex: 'auto',
              overflow: 'visible',
              height: 'auto',
              width: 'auto',
              left: 'auto'
            });

          if (this.cfg.displayHeaderBar) {
            this.headerBar.hide();
          }

          this.isDesktopViewActive = true;
          this.isMobileViewActive = false;

          this.cfg.onSwitchToDesktop(this.mainElement);
        }
      };

      // Reveals the navigation panel.
      this.revealPanel = function() {
        var instance = this;

        if (instance.isPanelOpen === false && instance.getViewportWidth() <= instance.cfg.handheldBreakpoint) {
          instance.isPanelOpen = true;

          instance.mainElement.parent().show().animate({
            left: '0px'
          }, instance.cfg.transitionDuration);

          instance.dimmer.css('display', 'block').fadeTo(instance.cfg.transitionDuration, instance.cfg.dimmerTransparency);

          // Prevent body scrolling when the panel is visible.
          jQ('body').css('overflow', 'hidden');

          instance.cfg.onPanelReveal(instance.mainElement);
        }
      };

      // Conceals the navigation panel.
      this.hidePanel = function() {
        var instance = this;

        if (instance.isPanelOpen === true) {
          instance.isPanelOpen = false;

          instance.mainElement.parent().animate({
            left: '-' + instance.getPanelDimension() + 'px'
          }, instance.cfg.transitionDuration, function() {
            jQ(this).hide();
          });

          instance.dimmer.fadeTo(instance.cfg.transitionDuration, 0, function() {
            jQ(this).css('display', 'none');
            instance.cfg.onPanelConceal(instance.mainElement);
          });

          // Restore body scrolling.
          jQ('body').css('overflow', 'auto');
        }
      };

      // Makes the header bar visible.
      this.displayHeader = function() {
        if (this.isHeaderVisible === false && this.isMobileViewActive === true) {
          this.headerBar.show().fadeTo(this.cfg.transitionDuration, 1);
          this.isHeaderVisible = true;
          this.cfg.onHeaderDisplay(this.headerBar);
        }
      };

      // Hides the header bar.
      this.concealHeader = function() {
        if (this.isHeaderVisible === true) {
          this.headerBar.fadeTo(this.cfg.transitionDuration, 0, function() {
            jQ(this).hide();
          });
          this.isHeaderVisible = false;
          this.cfg.onHeaderConceal(this.headerBar);
        }
      };

      // Retrieves the configured width of the side panel in mobile view.
      this.getPanelDimension = function() {
        return this.cfg.panelSize;
      };

      // Determines the current width of the client's viewport.
      this.getViewportWidth = function() {
        // Modern browsers (non-IE).
        if (typeof( window.innerWidth ) === 'number') {
          return window.innerWidth;
        }
        // IE 6+ in standards-compliant mode.
        else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
          return document.documentElement.clientWidth;
        }
        // Older IE versions.
        else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
          return document.body.clientWidth;
        }
        // Fallback for extreme cases.
        else {
          return jQ('body, html').width();
        }
      };
    };

    return jQ(this).each(function() {
      var panelInstance = new DrawerComponent(jQ(this), config);
      panelInstance.initialize();
    });
  };
})(jQuery);