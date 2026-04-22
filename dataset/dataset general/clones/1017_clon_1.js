/*
 * jQuery UI Dialog - Version 1.8.16
 *
 * This modified version includes support for Minimize & Maximize functionalities.
 * Original author of extensions: Elijah Horton (fieryprophet@yahoo.com)
 *
 * Copyright 2011, The jQuery UI Authors (http://jqueryui.com/about)
 * Licensed under either the MIT or GPL Version 2 licenses.
 * See: http://jquery.org/license for details.
 *
 * Official documentation: http://docs.jquery.com/UI/Dialog
 *
 * Dependencies for this widget:
 *   - jquery.ui.core.js
 *   - jquery.ui.widget.js
 *   - jquery.ui.button.js
 *   - jquery.ui.draggable.js
 *   - jquery.ui.mouse.js
 *   - jquery.ui.position.js
 *   - jquery.ui.resizable.js
 */

// Encapsulate the dialog widget within an Immediately Invoked Function Expression (IIFE)
// to prevent global scope pollution and ensure 'undefined' is truly undefined.
(function( $, undefined ) {

  // Define common CSS classes for the dialog structure.
  // These classes are applied to the main dialog container.
  var uiDialogClasses =
        'ui-dialog '                +
        'ui-widget '                +
        'ui-widget-content '        +
        'ui-corner-all ',

    // Options that might affect the dialog's size or layout.
    // Used internally to determine when to refresh the dialog's dimensions.
    sizeRelatedOptions = {
      buttons:   true,
      height:    true,
      maxHeight: true,
      maxWidth:  true,
      minHeight: true,
      minWidth:  true,
      width:     true
    },

    // Options specifically related to the resizable functionality.
    resizableRelatedOptions = {
      maxHeight: true,
      maxWidth:  true,
      minHeight: true,
      minWidth:  true
    },

    // Support for jQuery 1.3.2 and older versions.
    // This object provides a fallback for `$.attrFn` which was used
    // for methods that could act as both getters and setters.
    attrFn = $.attrFn || {
      val:   true,
      css:   true,
      html:  true,
      text:  true,
      data:  true,
      width: true,
      height: true,
      offset: true,
      click: true
    };

  // The main dialog widget definition.
  // Extends jQuery UI's base widget functionality.
  $.widget( "ui.dialog", {

    // Default options for the dialog.
    // These can be overridden by passing an options object during initialization.
    options: {
      autoOpen:      true,          // Whether the dialog should open automatically on creation.
      buttons:       {},            // Object of buttons to display in the dialog's button pane.
      closeOnEscape: true,          // Whether the dialog should close when the escape key is pressed.
      closeText:     'close',       // Text for the close button.
      dialogClass:   '',            // Additional CSS class(es) to add to the dialog.
      draggable:     true,          // Whether the dialog can be dragged.
      hide:          null,          // Effect to use when hiding the dialog.
      height:        'auto',        // The height of the dialog. Can be 'auto' or a number.
      maxHeight:     false,         // The maximum height of the dialog.
      maxWidth:      false,         // The maximum width of the dialog.
      minHeight:     150,           // The minimum height of the dialog.
      minWidth:      300,           // The minimum width of the dialog.
      minimizeText:  'minimize',    // Text for the minimize button.
      maximizeText:  'maximize',    // Text for the maximize button.
      minimize:      true,          // Enable minimize button.
      maximize:      true,          // Enable maximize button.
      modal:         false,         // Whether the dialog should be modal (with an overlay).
      position: {                   // Specifies the dialog's initial position.
        my:          'center',
        at:          'center',
        collision:   'fit',
        // Custom function to ensure the titlebar is always visible within the document.
        using: function(pos) {
          var topOffset = $(this)
                            .css(pos)
                            .offset().top;

          if (topOffset < 0) {
            $(this).css('top', pos.top - topOffset);
          }
        }
      },
      resizable:     true,          // Whether the dialog can be resized.
      show:          null,          // Effect to use when showing the dialog.
      stack:         true,          // Whether the dialog should stack on top of other dialogs.
      title:         '',            // The title of the dialog.
      width:         300,           // The width of the dialog.
      zIndex:        1000           // The z-index for the dialog.
    },

    /*
     * _create Method: Initializes the dialog widget.
     * This method is called automatically when the widget is instantiated.
     */
    _create: function() {
      // Store the original title of the element, if it exists.
      this.originalTitle = this.element.attr('title');

      // jQuery UI #5742: .attr() might return a DOMElement,
      // ensure originalTitle is a string.
      if ( typeof this.originalTitle !== "string" ) {
        this.originalTitle = "";
      }

      // Use the provided title option, or fall back to the original element title.
      this.options.title = this.options.title || this.originalTitle;

      // Cache 'this' and 'options' for easier access within the method.
      var self        = this,
          options     = self.options,

          // Determine the title text, defaulting to a non-breaking space if empty.
          title       = options.title || '&#160;',
          // Generate a unique ID for the dialog's titlebar.
          titleId     = $.ui.dialog.getTitleId(self.element),

          // Create the main dialog container element.
          uiDialog    = (self.uiDialog = $('<div></div>'))

            // Append the dialog to the document body.
            .appendTo(document.body)
            // Initially hide the dialog.
            .hide()
            // Apply core dialog classes and any custom classes.
            .addClass(uiDialogClasses + options.dialogClass)
            // Set the initial z-index from options.
            .css({
              zIndex: options.zIndex
            })
            // Make the dialog focusable and remove outline on focus for better aesthetics.
            .attr('tabIndex', -1)
            .css('outline', 0)
            // Attach a keydown event handler for 'escape' key to close the dialog.
            .keydown(function(event) {
              if (options.closeOnEscape           &&
                  !event.isDefaultPrevented()     &&
                  event.keyCode                     &&
                  event.keyCode === $.ui.keyCode.ESCAPE) {

                self.close(event);
                event.preventDefault();
              }
            })
            // Set ARIA attributes for accessibility.
            .attr({
              role:              'dialog',
              'aria-labelledby': titleId
            })
            // Attach a mousedown event to bring the dialog to front on click.
            .mousedown(function(event) {
              self.moveToTop(false, event);
            }),

          // Get the content element and prepare it for dialog use.
          uiDialogContent = self.element
            .show()
            // Remove the original title attribute to prevent browser tooltips.
            .removeAttr('title')
            // Apply content-specific classes.
            .addClass(
              'ui-dialog-content ' +
              'ui-widget-content')
            // Move the content into the dialog container.
            .appendTo(uiDialog),

          // Create the dialog titlebar element.
          uiDialogTitlebar = (self.uiDialogTitlebar = $('<div></div>'))
            // Apply titlebar-specific classes.
            .addClass(
              'ui-dialog-titlebar '     +
              'ui-widget-header '       +
              'ui-corner-all '          +
              'ui-helper-clearfix'
            )
            // Prepend the titlebar to the dialog container.
            .prependTo(uiDialog);

      // Conditionally create the minimize button if enabled and not a modal dialog.
      if (options.minimize && !options.modal) {
        var uiDialogTitlebarMinimize = $('<a href="#"></a>')
          .addClass(
            'ui-dialog-titlebar-minimize ' +
            'ui-corner-all'
          )
          .attr('role', 'button')
          // Add hover state classes.
          .hover(
            function() {
              uiDialogTitlebarMinimize.addClass('ui-state-hover');
            },
            function() {
              uiDialogTitlebarMinimize.removeClass('ui-state-hover');
            }
          )
          // Add focus state classes.
          .focus(function() {
            uiDialogTitlebarMinimize.addClass('ui-state-focus');
          })
          .blur(function() {
            uiDialogTitlebarMinimize.removeClass('ui-state-focus');
          })
          // Attach click handler to minimize the dialog.
          .click(function(event) {
            self.minimize(event);
            return false; // Prevent default link action.
          })
          .appendTo(uiDialogTitlebar);

        // Create the icon span for the minimize button.
        var uiDialogTitlebarMinimizeText = (self.uiDialogTitlebarMinimizeText = $('<span></span>'))
          .addClass(
            'ui-icon '           +
            'ui-icon-minusthick'
          )
          .text(options.minimizeText)
          .appendTo(uiDialogTitlebarMinimize);
      }

      // Conditionally create the maximize button if enabled and not a modal dialog.
      if (options.maximize && !options.modal) {
        var uiDialogTitlebarMaximize = $('<a href="#"></a>')
          .addClass(
            'ui-dialog-titlebar-maximize ' +
            'ui-corner-all'
          )
          .attr('role', 'button')
          // Add hover state classes.
          .hover(
            function() {
              uiDialogTitlebarMaximize.addClass('ui-state-hover');
            },
            function() {
              uiDialogTitlebarMaximize.removeClass('ui-state-hover');
            }
          )
          // Add focus state classes.
          .focus(function() {
            uiDialogTitlebarMaximize.addClass('ui-state-focus');
          })
          .blur(function() {
            uiDialogTitlebarMaximize.removeClass('ui-state-focus');
          })
          // Attach click handler to maximize the dialog.
          .click(function(event) {
            self.maximize(event);
            return false; // Prevent default link action.
          })
          .appendTo(uiDialogTitlebar);

        // Create the icon span for the maximize button.
        var uiDialogTitlebarMaximizeText = (self.uiDialogTitlebarMaximizeText = $('<span></span>'))
          .addClass(
            'ui-icon '          +
            'ui-icon-plusthick'
          )
          .text(options.maximizeText)
          .appendTo(uiDialogTitlebarMaximize);

        // Allow double-clicking the titlebar to maximize/restore.
        $(uiDialogTitlebar).dblclick(function(event) {
          self.maximize(event);
          return false;
        });
      }

      // Conditionally create the close button if not explicitly disabled.
      if (options.close !== false) {
        var uiDialogTitlebarClose = $('<a href="#"></a>')
          .addClass(
            'ui-dialog-titlebar-close ' +
            'ui-corner-all'
          )
          .attr('role', 'button')
          // Add hover state classes.
          .hover(
            function() {
              uiDialogTitlebarClose.addClass('ui-state-hover');
            },
            function() {
              uiDialogTitlebarClose.removeClass('ui-state-hover');
            }
          )
          // Add focus state classes.
          .focus(function() {
            uiDialogTitlebarClose.addClass('ui-state-focus');
          })
          .blur(function() {
            uiDialogTitlebarClose.removeClass('ui-state-focus');
          })
          // Attach click handler to close the dialog.
          .click(function(event) {
            self.close(event);
            return false; // Prevent default link action.
          })
          .appendTo(uiDialogTitlebar);

        // Create the icon span for the close button.
        var uiDialogTitlebarCloseText = (self.uiDialogTitlebarCloseText = $('<span></span>'))
          .addClass(
            'ui-icon '          +
            'ui-icon-closethick'
          )
          .text(options.closeText)
          .appendTo(uiDialogTitlebarClose);
      }

      // Create the span for the dialog title itself.
      var uiDialogTitle = $('<span></span>')
        .addClass('ui-dialog-title')
        .attr('id', titleId)
        .html(title)
        .prependTo(uiDialogTitlebar);

      // Handle deprecated 'beforeclose' option (for backward compatibility).
      // TODO: This should be removed in future versions (e.g., 1.9pre).
      if ($.isFunction(options.beforeclose) && !$.isFunction(options.beforeClose)) {
        options.beforeClose = options.beforeclose;
      }

      // Prevent text selection on the titlebar and its children,
      // which can interfere with dragging.
      uiDialogTitlebar.find("*").add(uiDialogTitlebar).disableSelection();

      // Initialize draggable functionality if enabled and Draggable widget is available.
      if (options.draggable && $.fn.draggable) {
        self._makeDraggable();
      }

      // Initialize resizable functionality if enabled and Resizable widget is available.
      if (options.resizable && $.fn.resizable) {
        self._makeResizable();
      }

      // Create the dialog buttons, if any are defined in options.
      self._createButtons(options.buttons);

      // Initialize internal state flags.
      self._isOpen = false;
      self._min    = false;

      // Apply bgiframe fix for IE6 z-index issues if the plugin is available.
      if ($.fn.bgiframe) {
        uiDialog.bgiframe();
      }
    },

    /*
     * _init Method: Called after _create, or on subsequent calls to $(...).dialog().
     */
    _init: function() {
      // If autoOpen is true, open the dialog immediately.
      if ( this.options.autoOpen ) {
        this.open();
      }
    },

    /*
     * destroy Method: Cleans up the dialog instance.
     */
    destroy: function() {
      var self = this;

      // Destroy the overlay if it exists.
      if (self.overlay) {
        self.overlay.destroy();
      }

      // Hide the dialog and reset the content element.
      self.uiDialog.hide();
      self.element
        .unbind('.dialog')                  // Remove dialog-specific event handlers.
        .removeData('dialog')               // Remove stored dialog data.
        .removeClass('ui-dialog-content ui-widget-content') // Remove dialog content classes.
        .hide()                             // Hide the original content element.
        .appendTo('body');                  // Move original content back to body.

      // Remove the dialog container from the DOM.
      self.uiDialog.remove();

      // Restore the original title attribute to the element.
      if (self.originalTitle) {
        self.element.attr('title', self.originalTitle);
      }

      return self; // Return the instance for chaining.
    },

    /*
     * widget Method: Returns the main dialog container element.
     */
    widget: function() {
      return this.uiDialog;
    },

    /*
     * minimize Method: Minimizes the dialog window.
     * @param {Event} event - The event that triggered the minimize action.
     */
    minimize: function(event) {
      var self = this,
          ui   = self.uiDialog;

      // Trigger 'beforeMinimize' event; if it returns false, stop minimization.
      if (false === self._trigger('beforeMinimize', event)) {
        return;
      }

      // Check if the dialog is not already minimized.
      if (!ui.data('is-minimized')) {
        // Custom minimize behavior (e.g., move to a taskbar).
        if (self.options.minimize && typeof self.options.minimize !== "boolean" && $(self.options.minimize).length > 0) {
          self._min = $('<a>' + (ui.find('span.ui-dialog-title').html().replace(/&nbsp;/, '') || 'Untitled Dialog') + '</a>')
            .attr('title', 'Click to restore dialog')
            .addClass('ui-corner-all ui-button')
            .click(function(event){
              self.unminimize(event);
            });
          $(self.options.minimize).append(self._min);
          ui.data('is-minimized', true).hide();
        } else { // Default minimization behavior (collapse in place).
          // Store resizable state and destroy it if active.
          if (ui.is( ":data(resizable)" )) {
            ui.data('was-resizable', true).resizable('destroy');
          } else {
            ui.data('was-resizable', false);
          }

          // Store current height, hide content, and adjust titlebar buttons.
          ui.data('minimized-height', ui.height());
          ui.find('.ui-dialog-content').hide();
          ui.find('.ui-dialog-titlebar-maximize').hide();
          ui.find('.ui-dialog-titlebar-minimize')
            .css('right', '1.8em')
            .removeClass('ui-icon-minusthick')
            .addClass('ui-icon-arrowthickstop-1-s')
            .find('span')
              .removeClass('ui-icon-minusthick')
              .addClass('ui-icon-arrowthickstop-1-s')
              .click(function(event){
                self.unminimize(event);
                return false;
              });

          // Mark as minimized and collapse height.
          ui.data('is-minimized', true).height('auto');
        }
      }
      return self;
    },

    /*
     * unminimize Method: Restores the dialog from a minimized state.
     * @param {Event} event - The event that triggered the unminimize action.
     */
    unminimize: function(event) {
      var self = this,
          ui   = self.uiDialog;

      // Trigger 'beforeUnminimize' event; if it returns false, stop restoration.
      if (false === self._trigger('beforeUnminimize', event)) {
        return;
      }

      // Check if the dialog is currently minimized.
      if (ui.data('is-minimized')) {
        // Custom minimize behavior restoration.
        if (self._min) {
          self._min.unbind().remove();
          self._min = false;
          ui.data('is-minimized', false).show();
          self.moveToTop(); // Bring to front after unminimizing.
        } else { // Default minimization behavior restoration.
          // Restore height, show content, and reset titlebar buttons.
          ui.height(ui.data('minimized-height'))
            .data('is-minimized', false)
            .removeData('minimized-height')
            .find('.ui-dialog-content').show();
          ui.find('.ui-dialog-titlebar-maximize').show();
          ui.find('.ui-dialog-titlebar-minimize')
            .css('right', '3.3em')
            .removeClass('ui-icon-arrowthickstop-1-s')
            .addClass('ui-icon-minusthick')
            .find('span')
              .removeClass('ui-icon-arrowthickstop-1-s')
              .addClass('ui-icon-minusthick')
              .click(function(event){
                self.minimize(event);
                return false;
              });

          // Re-enable resizable if it was active before minimization.
          if (ui.data('was-resizable') == true) {
            self._makeResizable(true);
          }
        }
      }
      return self;
    },

    /*
     * maximize Method: Maximizes the dialog window to fill the viewport.
     * @param {Event} event - The event that triggered the maximize action.
     */
    maximize: function(event) {
      var self = this,
          ui   = self.uiDialog;

      // Trigger 'beforeMaximize' event; if it returns false, stop maximization.
      if (false === self._trigger('beforeMaximize', event)) {
        return;
      }

      // Check if the dialog is not already maximized.
      if (!ui.data('is-maximized')) {
        // Store draggable state and destroy if active.
        if (ui.is( ":data(draggable)" )) {
          ui.data('was-draggable', true).draggable('destroy');
        } else {
          ui.data('was-draggable', false);
        }
        // Store resizable state and destroy if active.
        if (ui.is( ":data(resizable)" )) {
          ui.data('was-resizable', true).resizable('destroy');
        } else {
          ui.data('was-resizable', false);
        }

        // Store original dimensions and position, then maximize.
        ui.data('maximized-height', ui.height())
          .data('maximized-width', ui.width())
          .data('maximized-top', ui.css('top'))
          .data('maximized-left', ui.css('left'))
          .data('is-maximized', true)
          .height($(window).height() - 8) // Adjust for padding/border.
          .width($(window).width() + 9)   // Adjust for padding/border.
          .css({"top": 0, "left": 0})     // Position at top-left.
          .find('.ui-dialog-titlebar-minimize').hide(); // Hide minimize button.

        // Change maximize button icon and behavior.
        ui.find('.ui-dialog-titlebar-maximize')
          .removeClass('ui-icon-plusthick')
          .addClass('ui-icon-arrowthick-1-sw')
          .find('span')
            .removeClass('ui-icon-plusthick')
            .addClass('ui-icon-arrowthick-1-sw')
            .click(function(event){
              self.unmaximize(event);
              return false;
            });

        // Update double-click behavior for titlebar.
        ui.find('.ui-dialog-titlebar').dblclick(function(event){
          self.unmaximize(event);
          return false;
        });
      }
      return self;
    },

    /*
     * unmaximize Method: Restores the dialog from a maximized state.
     * @param {Event} event - The event that triggered the unmaximize action.
     */
    unmaximize: function(event) {
      var self = this,
          ui   = self.uiDialog;

      // Trigger 'beforeUnmaximize' event; if it returns false, stop restoration.
      if (false === self._trigger('beforeUnmaximize', event)) {
        return;
      }

      // Check if the dialog is currently maximized.
      if (ui.data('is-maximized')) {
        // Restore original dimensions and position.
        ui.height(ui.data('maximized-height'))
          .width(ui.data('maximized-width'))
          .css({"top": ui.data('maximized-top'), "left": ui.data('maximized-left')})
          .data('is-maximized', false)
          .removeData('maximized-height')
          .removeData('maximized-width')
          .removeData('maximized-top')
          .removeData('maximized-left')
          .find('.ui-dialog-titlebar-minimize').show(); // Show minimize button.

        // Change restore button icon and behavior.
        ui.find('.ui-dialog-titlebar-maximize')
          .removeClass('ui-icon-arrowthick-1-sw')
          .addClass('ui-icon-plusthick')
          .find('span')
            .removeClass('ui-icon-arrowthick-1-sw')
            .addClass('ui-icon-plusthick')
            .click(function(){
              self.maximize(event);
              return false;
            });

        // Reset double-click behavior for titlebar.
        ui.find('.ui-dialog-titlebar').dblclick(function(event){
          self.maximize(event);
          return false;
        });

        // Re-enable draggable if it was active before maximization.
        if (ui.data('was-draggable') == true) {
          self._makeDraggable(true);
        }
        // Re-enable resizable if it was active before maximization.
        if (ui.data('was-resizable') == true) {
          self._makeResizable(true);
        }
      }
      return self;
    },

    /*
     * close Method: Closes the dialog window.
     * @param {Event} event - The event that triggered the close action.
     */
    close: function(event) {
      var self  = this,
          maxZ,
          thisZ;

      // Trigger 'beforeClose' event; if it returns false, prevent closing.
      if (false === self._trigger('beforeClose', event)) {
        return;
      }

      // Destroy the overlay if it exists.
      if (self.overlay) {
        self.overlay.destroy();
      }

      // Unbind dialog-specific keypress events.
      self.uiDialog.unbind('keypress.ui-dialog');

      // Update internal state.
      self._isOpen = false;

      // Hide the dialog using the configured effect, or immediately.
      if (self.options.hide) {
        self.uiDialog.hide(self.options.hide, function() {
          self._trigger('close', event); // Trigger 'close' event after animation.
        });
      } else {
        self.uiDialog.hide();
        self._trigger('close', event); // Trigger 'close' event immediately.
      }

      // Resize any existing modal overlays.
      $.ui.dialog.overlay.resize();

      // Adjust the maxZ to allow other modal dialogs to continue to work (see #4309).
      if (self.options.modal) {
        maxZ = 0;
        $('.ui-dialog').each(function() {
          if (this !== self.uiDialog[0]) {
            thisZ = $(this).css('z-index');
            if(!isNaN(thisZ)) {
              maxZ = Math.max(maxZ, thisZ);
            }
          }
        });
        $.ui.dialog.maxZ = maxZ;
      }
      return self;
    },

    /*
     * isOpen Method: Checks if the dialog is currently open.
     * @returns {boolean} True if the dialog is open, false otherwise.
     */
    isOpen: function() {
      return this._isOpen;
    },

    /*
     * moveToTop Method: Brings the dialog to the front (highest z-index).
     * The 'force' parameter allows moving modal dialogs to their correct position on open.
     * @param {boolean} force - If true, forces the dialog to move to top even if not stackable.
     * @param {Event} event - The event that triggered the move to top action.
     */
    moveToTop: function(force, event) {
      var self      = this,
          options   = self.options,
          saveScroll;

      // Do nothing if it's a modal dialog and not forced, or if not stackable and not modal.
      if ((options.modal && !force) ||
          (!options.stack && !options.modal)) {
        return self._trigger('focus', event);
      }

      // Update the global maximum z-index if this dialog's z-index is higher.
      if (options.zIndex > $.ui.dialog.maxZ) {
        $.ui.dialog.maxZ = options.zIndex;
      }

      // If an overlay exists, update its z-index.
      if (self.overlay) {
        $.ui.dialog.maxZ += 1;
        self.overlay.$el.css('z-index', $.ui.dialog.overlay.maxZ = $.ui.dialog.maxZ);
      }

      // Save and then restore scroll position for Opera 9.5+ due to z-index change bug.
      // Reference: http://ui.jquery.com/bugs/ticket/3193
      saveScroll = {
        scrollTop: self.element.scrollTop(),
        scrollLeft: self.element.scrollLeft()
      };

      // Increment global maxZ and apply to the dialog.
      $.ui.dialog.maxZ += 1;
      self.uiDialog.css('z-index', $.ui.dialog.maxZ);

      // Restore scroll position.
      self.element.attr(saveScroll);

      // Trigger the 'focus' event.
      self._trigger('focus', event);

      return self;
    }

  }); // End of $.widget("ui.dialog", { ... });

})( $, undefined ); // Pass jQuery and undefined to the IIFE.