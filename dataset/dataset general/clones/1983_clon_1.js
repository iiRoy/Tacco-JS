/*
 *  This software is provided under the MIT License (http://en.wikipedia.org/wiki/MIT_License)
 *
 *  Copyright (c) 2014 by Adam Banaszkiewicz.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 *  associated documentation files (the "Software"), to deal in the Software without restriction,
 *  including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *  and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial
 *  portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 *  LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *  @version 0.0.1
 *  @date    2014.11.02
 *  @author  Adam Banaszkiewicz
 */
( function ( $ ) {

  $.fn.materialmenu = function ( options ) {

    // Default configuration for the plugin, extended by user-provided options.
    var options = $.extend( {

      /*
       * Define the breakpoint width in pixels for mobile devices.
       * Below this width, the menu behaves as a mobile menu.
       * @type integer
       */
      mobileWidth:    768,

      // This is the fixed width for the menu wrapper when in mobile view.
      // Only applies to mobile layout.
      // @type integer
      width:          250,

      // Duration of animation transitions in milliseconds.
      // Affects opening/closing of menu and title bar.
      // @type integer
      animationTime:  200,

      /**
       * Opacity level for the overlay that appears when the menu is open.
       * Value between 0.0 and 1.0.
       * @type float
       */
      overlayOpacity: 0.4,

      /**
       * CSS class name for the menu toggle button.
       * This button triggers the menu's visibility.
       * @type string
       */
      buttonClass:    'material-menu-button',

      /*
       * HTML string for the menu button.
       * This allows custom button styling and content.
       * It will be appended to the generated title bar.
       * @type string
       */
      buttonHTML:     '<div class="material-menu-button"><span></span><span></span><span></span></div>',

      /**
       * The text to be displayed as the page title on mobile devices.
       * @type string
       */
      title:          '',

      /**
       * Flag to determine if the title bar should be shown on mobile devices.
       * @type boolean
       */
      showTitle:      false,

      /**
       * Scroll position (in pixels from top) at which the mobile title bar appears.
       * If set to 0, the title bar is always visible.
       * @type integer
       */
      titleShowOn:    40,

      /**
       * Callback function fired when the menu is opened.
       * @param  jQuery object element The menu (UL) element.
       * @return void
       */
      onOpen:         function ( element ) {},

      /**
       * Callback function fired when the menu is closed.
       * @param  jQuery object element The menu (UL) element.
       * @return void
       */
      onClose:        function ( element ) {},

      /**
       * Callback function fired when the window width transitions from desktop to mobile.
       * Adds a 'vertical' class to the menu's grandparent element.
       * @param  jQuery object element The menu (UL) element.
       * @return void
       */
      onChangeMobile: function ( element ) {
        element.parent().parent().addClass( 'vertical' );
      },

      /**
       * Callback function fired when the window width transitions from mobile to desktop.
       * Removes the 'vertical' class from the menu's grandparent element.
       * @param  jQuery object element The menu (UL) element.
       * @return void
       */
      onChangeDesktop: function ( element ) {
        element.parent().parent().removeClass( 'vertical' );
      },

      /**
       * Callback function fired when the title bar becomes visible.
       * @param  jQuery object element The title bar element.
       * @return void
       */
      onShowTitlebar: function ( element ) {},

      /**
       * Callback function fired when the title bar becomes hidden.
       * @param  jQuery object element The title bar element.
       * @return void
       */
      onHideTitlebar: function ( element ) {}

    }, options ); // End of $.extend for options.

    // MaterialMenu constructor function.
    var MaterialMenu = function ( element, options ) {

      /**
       * Plugin options, including defaults and user overrides.
       * @type object
       */
      this.options = options;

      /**
       * The main menu element (jQuery object, typically a UL).
       * @type jQuery object
       */
      this.element = element;

      /**
       * The overlay element that appears when the menu is open.
       * Initially empty, populated in `prepare`.
       * @type jQuery object
       */
      this.overlay = $( [] );

      /**
       * The title bar element for mobile view.
       * Initially empty, populated in `prepare`.
       * @type jQuery object
       */
      this.title = $( [] );

      /**
       * Tracks if the mobile title bar is currently visible.
       * @type boolean
       */
      this.isTitleShowed = false;

      /**
       * Tracks if the mobile menu is currently visible (open).
       * @type boolean
       */
      this.isShowed = false;

      /**
       * Flag to prevent multiple `onChangeMobile` events.
       * Set to true once the layout changes to mobile.
       * @type boolean
       */
      this.changedOnMobile = false;

      /**
       * Flag to prevent multiple `onChangeDesktop` events.
       * Set to true once the layout changes to desktop.
       * @type boolean
       */
      this.changedOnDesktop = false;

      /**
       * Initializes the plugin: prepares elements, sets up initial view, and binds events.
       * @return void
       */
      this.init = function () {
        var self = this; // Cache 'this' for use in callbacks.

        this.prepare(); // Set up DOM elements.

        this.showMenuDependentByWidth(); // Determine initial menu state based on window width.

        this.bindEvents(); // Attach event listeners.

        // Re-evaluate menu state on window resize.
        $( window ).resize( function () {
          self.showMenuDependentByWidth();
        } );
      };

      /**
       * Prepares and inserts necessary DOM elements like the menu wrapper, title bar, and overlay.
       * @return void
       */
      this.prepare = function () {
        // Wrap the original menu element with a new div for styling and positioning.
        this.element.wrap( $( '<div />', { 'class': 'material-menu-wrapper' } ) );

        // Check if a title bar should be created based on options.
        if ( this.options.showTitle ) {
          // Look for an existing title bar to avoid duplication.
          var title = $( '.material-menu-titlebar' );

          if ( title.length == 0 ) {
            // If no title bar exists, create and append a new one to the body.
            $( '<div />', {
              'class': 'material-menu-titlebar',
              'style': 'display:block;position:fixed;left:0px;top:0px;width:100%;height:55px;background-color:#fff;z-index:999998;'
            } ).appendTo( 'body' );

            // Store the newly created title element.
            this.title = $( '.material-menu-titlebar' );

            // Add the menu button to the title bar.
            this.title.append( $( this.options.buttonHTML ).addClass( this.options.buttonClass ).css( { 'float': 'left', 'margin': '5px' } ) );

            // Add the title text to the title bar.
            this.title.append( '<div class="material-menu-title" style="float:left;line-height:55px;height:55px;margin-left:10px;">' + this.options.title + '</div>' );

            // Set initial visibility of the title bar based on `titleShowOn` option.
            if ( this.options.titleShowOn == 0 )
              this.showTitle();
            else
              this.hideTitle();
          } else {
            // If title bar already exists, just reference it.
            this.title = title;
          }
        }

        // --- Overlay preparation ---
        var overlay = $( '.material-menu-overlay' );

        // If an overlay already exists in the DOM, reuse it.
        if ( overlay.length == 1 ) {
          this.overlay = overlay;
        } else {
          // Otherwise, create a new overlay element and append it to the body.
          $( '<div />', {
            'class': 'material-menu-overlay',
            'style': 'display:block;position:fixed;left:0px;top:0px;width:100%;height:100%;z-index:999998;background-color:#000000;'
          } ).appendTo( 'body' );

          // Store the newly created overlay element.
          this.overlay = $( '.material-menu-overlay' );
        }

        // Initialize overlay to be transparent and hidden.
        this.overlay
          .fadeTo( 0, 0 ) // Set initial opacity to 0 instantly.
          .css( 'display', 'none' ); // Hide it by default.
      };

      /**
       * Binds event listeners to the menu button, overlay, and window scroll.
       * @return void
       */
      this.bindEvents = function () {
        var self = this; // Reference to the current MaterialMenu instance.

        // Event listener for the menu toggle button.
        $( '.' + this.options.buttonClass ).click( function () {
          if ( self.isShowed ) {
            self.close(); // If menu is open, close it.
          } else {
            self.open(); // If menu is closed, open it.
          }
        } );

        // Event listener for the overlay to close the menu when clicked.
        this.overlay.click( function () {
          self.close();
        } );

        // Scroll event listener for showing/hiding the mobile title bar.
        $( window ).scroll( function () {
          if ( $( this ).scrollTop() >= self.options.titleShowOn ) {
            self.showTitle(); // Show title if scrolled past threshold.
          } else {
            self.hideTitle(); // Hide title if scrolled above threshold.
          }
        } );
      };

      /**
       * Adjusts menu parent class and styles based on the current window width (mobile vs. desktop).
       * @return void
       */
      this.showMenuDependentByWidth = function () {
        if ( this.getWindowWidth() <= this.options.mobileWidth ) {
          this.showForMobile(); // Apply mobile-specific styles.
        } else {
          this.showForDesktop(); // Apply desktop-specific styles.
        }

        // If the menu is currently open, close it when switching views.
        if ( this.isShowed ) {
          this.close();
        }
      };

      /**
       * Configures the menu for mobile display when the window width is below the mobile breakpoint.
       * @return void
       */
      this.showForMobile = function () {
        // Prevent re-applying styles and firing events if already in mobile mode.
        if ( this.changedOnMobile == false ) {
          this.element
            .parent() // Access the wrapper element.
            .removeClass( 'material-menu-view-desktop' ) // Remove desktop class.
            .addClass( 'material-menu-view-mobile' ) // Add mobile class.
            .css( {
              display:  'none', // Hide initially.
              position: 'fixed', // Fixed position for mobile slide-out.
              top:      '0px',
              zIndex:   '999999',
              overflow: 'auto', // Allow scrolling within the menu.
              height:   '100%',
              width:    this.getMenuWidth() + 'px', // Set fixed mobile menu width.
              left:     '-' + this.getMenuWidth() + 'px' // Position off-screen to the left.
            } );

          // Show the title bar if enabled in options.
          if ( this.options.showTitle ) {
            this.title.show();
          }

          this.changedOnDesktop = false; // Reset desktop change flag.
          this.changedOnMobile  = true; // Set mobile change flag.

          // Trigger the mobile change callback.
          this.options.onChangeMobile( this.element );
        }
      };

      /**
       * Configures the menu for desktop display when the window width is above the mobile breakpoint.
       * @return void
       */
      this.showForDesktop = function () {
        // Prevent re-applying styles and firing events if already in desktop mode.
        if ( this.changedOnDesktop == false ) {
          this.element
            .parent() // Access the wrapper element.
            .removeClass( 'material-menu-view-mobile' ) // Remove mobile class.
            .addClass( 'material-menu-view-desktop' ) // Add desktop class.
            .css( {
              display:  'block', // Make visible.
              position: 'static', // Revert to normal flow positioning.
              top:      'auto',
              zIndex:   'auto',
              overflow: 'visible', // Allow content to overflow if needed.
              height:   'auto',
              width:    'auto',
              left:     'auto'
            } );

          // Hide the title bar in desktop view.
          if ( this.options.showTitle ) {
            this.title.hide();
          }

          this.changedOnDesktop = true; // Set desktop change flag.
          this.changedOnMobile  = false; // Reset mobile change flag.

          // Trigger the desktop change callback.
          this.options.onChangeDesktop( this.element );
        }
      };

      /**
       * Opens the mobile menu with an animation.
       * @return void
       */
      this.open = function () {
        var self = this; // Reference to the current MaterialMenu instance.

        // Only open if not already showed and in mobile view.
        if ( self.isShowed == false && self.getWindowWidth() <= self.options.mobileWidth ) {
          self.isShowed = true; // Mark menu as open.

          // Animate the menu wrapper to slide into view.
          self.element.parent().show().animate( {
            left: '0px'
          }, self.options.animationTime );

          // Fade in the overlay.
          self.overlay.css( 'display', 'block' ).fadeTo( self.options.animationTime, self.options.overlayOpacity );

          // Prevent body scrolling when the menu is open.
          $( 'body' ).css( 'overflow', 'hidden' );

          // Trigger the onOpen callback.
          self.options.onOpen( self.element );
        }
      };

      /**
       * Closes the mobile menu with an animation.
       * @return void
       */
      this.close = function () {
        var self = this; // Reference to the current MaterialMenu instance.

        // Only close if menu is currently showed.
        if ( self.isShowed == true ) {
          self.isShowed = false; // Mark menu as closed.

          // Animate the menu wrapper to slide out of view, then hide it.
          self.element.parent().animate( {
            left: '-' + self.getMenuWidth() + 'px'
          }, self.options.animationTime, function () {
            $( this ).hide();
          } );

          // Fade out the overlay, then hide it and trigger onClose callback.
          self.overlay.fadeTo( self.options.animationTime, 0, function () {
            $( this ).css( 'display', 'none' );
            self.options.onClose( self.element );
          } );

          // Restore body scrolling.
          $( 'body' ).css( 'overflow', 'auto' );
        }
      };

      /**
       * Makes the mobile title bar visible with a fade-in effect.
       * @return void
       */
      this.showTitle = function () {
        // Only show if not already showed and currently in mobile view.
        if ( this.isTitleShowed == false && this.changedOnMobile == true ) {
          this.title.show().fadeTo( this.options.animationTime, 1 ); // Show and fade to full opacity.
          this.isTitleShowed = true; // Mark title as showed.
          this.options.onShowTitlebar( this.title ); // Trigger callback.
        }
      };

      /**
       * Hides the mobile title bar with a fade-out effect.
       * @return void
       */
      this.hideTitle = function () {
        // Only hide if currently showed.
        if ( this.isTitleShowed == true ) {
          this.title.fadeTo( this.options.animationTime, 0, function () {
            $( this ).hide(); // Fade out and then hide.
          } );
          this.isTitleShowed = false; // Mark title as hidden.
          this.options.onHideTitlebar( this.title ); // Trigger callback.
        }
      };

      /**
       * Returns the configured width of the menu for mobile view.
       * @return integer The menu width in pixels.
       */
      this.getMenuWidth = function () {
        return this.options.width;
      };

      /**
       * Returns the current width of the client window in pixels.
       * Handles cross-browser compatibility.
       * @return integer The window width.
       */
      this.getWindowWidth = function () {
        // For modern browsers (Non-IE)
        if ( typeof ( window.innerWidth ) == 'number' ) {
          return window.innerWidth;
        }
        // For IE 6+ in 'standards compliant mode'
        else if ( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
          return document.documentElement.clientWidth;
        }
        // For older IE (4 compatible)
        else if ( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
          return document.body.clientWidth;
        }
        // Fallback, using jQuery to get width of body or html
        else {
          return $( 'body, html' ).width();
        }
      };
    }; // End of MaterialMenu constructor.

    // Iterate over each selected element and initialize MaterialMenu.
    return $( this ).each( function () {
      var menu = new MaterialMenu( $( this ), options ); // Create a new instance for each element.
      menu.init(); // Initialize the menu.
    } );
  }; // End of $.fn.materialmenu.

} )( jQuery ); // End of IIFE, passing jQuery.