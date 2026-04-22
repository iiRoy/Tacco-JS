/*
 * ---
 * summary: EASY DIALOG is a lightweight module for creating dynamic popup windows. It can generate alerts or confirmations with minimal code. Confirmations utilize callbacks for positive actions and support asynchronous content loading from external sources or inline content.
 *
 * license: MIT-style
 *
 * authors:
 * - Marco Dell'Anna (Original)
 * - Juan Lago (Original)
 * - AI Assistant (Clone)
 *
 * requirements:
 * - core/1.3: '*'
 *
 * exports:
 * - EasyDialog
 * ...
 *
 * MooTools Easy Dialog
 * Version 1.0 (Clone)
 * Copyright (c) 2023 AI Assistant - Generated Code
 *
 * Based on Simple Modal by Marco Dell'Anna and Juan Lago
 *
 * Requires:
 * MooTools http://mootools.net
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * Changelog:
 * 1.0 - Initial Type II clone generation.
 */
var EasyDialog = new Class({

    // Mixins
    Implements: [Parameters],

    ajaxRequest: null, // Stores active AJAX requests.
    actionButtons: [], // Array for interactive buttons.

    // Private section for gallery features.
    galleryInfo: {},

    // Component configurations.
    settings: {
        onRendered:         Function, // Callback after DOM injection.
        verticalOffset:     40,       // Distance from top.
        backdropTransparency: .3,     // Opacity of the background overlay.
        backdropTint:       "#000000",// Color of the overlay.
        dialogWidth:        400,      // Default width of the dialog.
        isDraggable:        true,     // Can the dialog be moved by dragging?
        escapeKeyClose:     true,     // Close dialog with ESC key.
        backdropClickable:  true,     // Close dialog by clicking overlay.
        alwaysShowImage:    true,     // For lightbox, always show image? (Unused in original, but kept for structure)
        showCloseButton:    true,     // Display the 'X' close button.
        concealHeader:      false,    // Hide the top bar.
        concealFooter:      false,    // Hide the bottom bar.
        galleryPadWidth:    40,       // Extra horizontal space for images.
        galleryPadHeight:   120,      // Extra vertical space for images.
        confirmButtonText:  "Confirm",// Label for the affirmative button.
        cancelButtonText:   "Cancel", // Label for the negative button.
        markupTemplate:     "<section class=\"easy-dialog-head\"> \
            <h2>{_HEADING_}</h2> \
          </section> \
          <section class=\"easy-dialog-main\"> \
            <article class=\"dialog-content-area\">{_BODY_TEXT_}</article> \
          </section> \
          <section class=\"easy-dialog-foot\"></section>"
    },

    /**
     * Component initialization.
     * @param {Object} params - Configuration parameters.
     */
    initComponent: function(params) {

        this.setParameters(params); // Apply initial settings.
    },

    /**
     * Public method to display the dialog.
     * Opens the modal window.
     * @param {Object} params - Overriding parameters for this display.
     * @returns {Element} The HTML node of the dialog.
     */
    display: function(params){
      if(!params) params = {};

	  // Should the dialog be redrawn?
	  params.render = params.render == undefined ? true : params.render;

      // Insert the background overlay.
	  if (params.render)
		this._manageBackdrop("open");

      // Handle different dialog types.
      switch( params.mode ){

		// Requires title, body content, and a callback function.
        case "affirm":
			// Add the confirm action button.
			this.addActionButton(this.settings.confirmButtonText, "btn main-action btn-spacing", function(){
				try{ params.actionComplete() } catch(err){};
				this.conceal();
			});

			// Add the cancel button.
			this.addActionButton(this.settings.cancelButtonText, "btn secondary-action");

			// Render the dialog structure.
			var dialogNode = this._renderWindow(params);

			// Enable ESC key to close.
			this._attachEscapeHandler();

        break;

		// Requires title and body content. Action buttons are defined externally.
        case "generic":
			// Render the dialog structure.
			var dialogNode = this._renderWindow(params);

			// Enable ESC key to close.
			this._attachEscapeHandler();
        break;

        // Requires title and URL for content (action buttons defined externally).
        case "remote-content":
			// Render the dialog structure.
			var dialogNode = this._renderWindow(params);

			this._fetchContent({
				"address":params.data.address || "",
				"onContentLoaded":params.data.onContentLoaded||Function
			});
        break;

		// Requires title, content URL, gallery group, and item order within group.
		case "media-gallery":

			// Gallery mode requires navigation arrows.
			params.showNavArrows = true;

			// Store current gallery item information.
			this.galleryInfo.currentItem = params.gallery.currentItem;
			this.galleryInfo.collection = params.gallery.collection;
			this.galleryInfo.currentIndex = params.gallery.currentIndex;

			// Render the dialog structure.
			var dialogNode = this._renderWindow(params);

			this._fetchContent({
				"address": params.data.address || "",
				"currentIndex": this.galleryInfo.currentIndex,
				"render": params.render,
				"onContentLoaded": params.data.onContentLoaded||Function
			});
		break;

		// Default case: simple alert dialog.
        default:
			// Add an "OK" button.
			this.addActionButton(this.settings.confirmButtonText, "btn main-action");

			// Render the dialog structure.
			var dialogNode = this._renderWindow(params);

			// Enable ESC key to close.
			this._attachEscapeHandler();
        break;
      }

		// Apply custom dialog width.
		dialogNode.setStyles({width:this.settings.dialogWidth});

		// Hide header and/or footer if configured.
		if( this.settings.concealHeader ) dialogNode.addClass("hidden-head");
		if( this.settings.concealFooter ) dialogNode.addClass("hidden-foot");

		// Add the 'X' close button if enabled.
		if( this.settings.showCloseButton ) this._createCloseButton();

		// Enable window dragging if configured.
		if( this.settings.isDraggable ){
			var headerHandle = dialogNode.getElement(".easy-dialog-head");
			new Drag(dialogNode, { handler:headerHandle });
			// Set cursor for draggable handle.
			headerHandle.setStyle("cursor", "grab");
			dialogNode.addClass("moveable");
		}

		// Adjust dialog position and size.
		this._adjustPosition();
    },

    /**
     * Public method to hide the dialog.
     * Closes the modal window.
     * @returns {void}
     */
    conceal: function(){

		try{
			if( typeof(this.ajaxRequest) == "object" )  this.ajaxRequest.cancel();
		}catch(err){/* No active request to cancel. */}

		this._manageBackdrop('close');

		return;
    },

    /**
     * Private method to render the dialog window.
     * Creates and injects the dialog HTML structure.
     * @param {Object} params - Dialog parameters.
     * @returns {Element} The dialog HTML element.
     */
	_renderWindow: function(params) {

		var dialogNode;

		if (params.render)
		{
			// Create and inject the main dialog element into the DOM.
			dialogNode = new Element("div#easy-dialog", {"class":"easy-dialog"});

			dialogNode.inject(document.body);
		}
		else
			dialogNode = document.getElement('#easy-dialog.easy-dialog');

		// Populate the dialog with content using the template.
		var pageMarkup = this._formatMarkup(this.settings.markupTemplate, {"_HEADING_":params.title || "No Title", "_BODY_TEXT_":params.body || ""});

		dialogNode.set("html", pageMarkup);

		// Insert all accumulated action buttons.
		this._insertAllButtons();

		// Add navigation arrows if required (for galleries).
		if (params.showNavArrows)
			this._createNavArrows();

		// Execute the onRendered callback.
		this.settings.onRendered();

		return dialogNode;
	},

    /**
     * Public method to add a button to the dialog's button array.
     * @param {String} caption - Text label for the button.
     * @param {String} styleClass - CSS classes for styling the button.
     * @param {Function} clickHandler - Function to execute on button click.
     * @returns {Element} The created button HTML element.
     */
     addActionButton: function(caption, styleClass, clickHandler){
         var buttonElement = new Element('a',{
                                     "title" : caption,
                                     "text"  : caption,
                                     "class" : styleClass,
                                     "events": {
                                         click: (clickHandler || this.conceal).bind(this)
                                     }
                               });
         this.actionButtons.push(buttonElement);
 		     return buttonElement;
     },

    /**
     * Private method to inject all queued buttons into the dialog's footer.
     * @returns {void}
     */
    _insertAllButtons: function(){
      this.actionButtons.each( function(element){
        element.inject( $("easy-dialog").getElement(".easy-dialog-foot") );
      });
		return;
    },

    /**
     * Private method to create and inject the 'X' close button.
     * @returns {Element} The close button HTML element.
     */
    _createCloseButton: function(){
		var closeBtn = new Element("a", {"class":"close-btn", "href":"#", "html":"x"});

		closeBtn.inject($("easy-dialog"), "top");

		// Attach click event to close the dialog.
        closeBtn.addEvent("click", function(evt){
			if(evt) evt.stop();
			this.conceal();
        }.bind( this ));

		return closeBtn;
    },

	/**
	 * Private method to create and inject navigation arrows for galleries.
	 * Includes 'Next' and 'Previous' buttons.
	 */
	_createNavArrows: function(){

		// Create and inject the 'Next' button.
		var nextBtn = new Element("a", {"class":"next-item", "style":"display:none", "href":"#", "html":"&raquo;"});

		nextBtn.inject($("easy-dialog"), "top");

		nextBtn.addEvent("click", function(evt){
			if(evt) evt.stop();

			this._advanceItem(); // Load the next item.
		}.bind(this));

		// Create and inject the 'Previous' button.
		var prevBtn = new Element("a", {"class":"prev-item", "style":"display:none", "href":"#", "html":"&laquo;"});

		prevBtn.inject($("easy-dialog"), "top");

		prevBtn.addEvent("click", function(evt){
			if(evt) evt.stop();

			this._recedeItem(); // Load the previous item.
		}.bind(this));

		// Set initial visibility of the arrows.
		this._updateArrowVisibility();

	},
	/**
	 * Private method to load and display the next item in a gallery.
	 */
	_advanceItem: function(){
		var groupItems = this._getGroupMembers(this.galleryInfo.collection);

		this.galleryInfo.currentIndex++; // Increment current index.

		var nextGalleryItem = groupItems[this.galleryInfo.currentIndex];

		this.display({
				"mode": "media-gallery",
				"title": nextGalleryItem.get('title'),
				"render": false,	// No need to redraw the main dialog structure.
				"data":{
					"address": nextGalleryItem.get('href'),
					"onContentLoaded": function(){ }
				},
				"gallery": {
					"currentItem" : nextGalleryItem,
					"collection": this.galleryInfo.collection,
					"currentIndex": this.galleryInfo.currentIndex
				}
		});
	},
	/**
	 * Private method to load and display the previous item in a gallery.
	 */
	_recedeItem: function(){
		var groupItems = this._getGroupMembers(this.galleryInfo.collection);

		this.galleryInfo.currentIndex--; // Decrement current index.

		var prevGalleryItem = groupItems[this.galleryInfo.currentIndex];

		this.display({
				"mode": "media-gallery",
				"title": prevGalleryItem.get('title'),
				"render": false,	// No need to redraw the main dialog structure.
				"data":{
					"address": prevGalleryItem.get('href'),
					"onContentLoaded": function(){ }
				},
				"gallery": {
					"currentItem" : prevGalleryItem,
					"collection": this.galleryInfo.collection,
					"currentIndex": this.galleryInfo.currentIndex
				}
		});
	},
	/**
	 * Private method to automatically set the visibility of navigation arrows.
	 */
	_updateArrowVisibility: function(){

		var leftNavArrow = document.getElement('.easy-dialog a.prev-item');
		var rightNavArrow = document.getElement('.easy-dialog a.next-item');
		var totalMembers = this.getMemberCount(this.galleryInfo.collection);

		// Set visibility for the left arrow (previous item).
		if (this.galleryInfo.currentIndex == 0)
			leftNavArrow.setStyle('display', 'none');
		else
			leftNavArrow.setStyle('display', 'inline');


		// Set visibility for the right arrow (next item).
		if (totalMembers > 0 && this.galleryInfo.currentIndex < totalMembers - 1)
			rightNavArrow.setStyle('display', 'inline');
		else
			rightNavArrow.setStyle('display', 'none');

	},
	/**
	 * Private method to retrieve all elements belonging to a specific gallery group.
	 * @param {String} groupName - The name of the gallery group.
	 * @returns {Array<Element>} A collection of DOM nodes.
	 */
	_getGroupMembers: function(groupName) {

		var links = $$("a").filter(function(item) {
			return item.rel && item.rel.contains('easydialog[' + groupName + ']');
		});

		return links;
	},
	/**
	 * Public method to count the number of items in a given gallery group.
	 * @param {String} groupName - The name of the gallery group.
	 * @returns {Number} The total count of items in the group.
	 */
	getMemberCount: function(groupName) {
		return this._getGroupMembers(groupName).length;
	},
    /**
     * Private method to manage the backdrop (overlay) element.
     * Creates or destroys the overlay and handles associated events.
     * @param {String} state - "open" to show, "close" to hide.
     * @returns {void}
     */
    _manageBackdrop: function(state) {
		switch( state ) {
			case 'open':

				this._manageBackdrop('close'); // Ensure any existing backdrop is removed first.

				var backdropElement = new Element("div", {"id":"easy-dialog-backdrop"});
                backdropElement.inject( document.body );
                backdropElement.setStyle("background-color", this.settings.backdropTint);
                backdropElement.fade("hide").fade(this.settings.backdropTransparency);

				// Add behavior: close on backdrop click if enabled.
                if( this.settings.backdropClickable){
					backdropElement.addEvent("click", function(evt){
						if(evt) evt.stop();
						this.conceal();
					}.bind(this));
                }

				// Store bound resize handler for removal.
				this.__windowResizer = this._adjustPosition.bind(this);
				window.addEvent("resize", this.__windowResizer );
			break;

			case 'close':

				// Remove the resize event listener.
				window.removeEvent("resize", this.__windowResizer);

				// Remove the ESC key event listener if it was added.
				if(this.settings.escapeKeyClose)
				{
					var keyEventType = Browser.name != 'ie' ? "keydown" : "onkeydown";
					window.removeEvent(keyEventType, this.__escapeKeyCloseHandler);
				}

				// Safely remove the backdrop element.
				try
				{
					$('easy-dialog-backdrop').destroy();
				}
				catch(err){/* Backdrop already removed or not present. */}

				// Safely remove the dialog element.
				try{
					$('easy-dialog').destroy();
				}
				catch(err){/* Dialog already removed or not present. */}
		}
    },

    /**
     * Private method to load content via AJAX into the dialog body.
     * @param {Object} contentParams - Parameters for content loading (url, callback).
     * @returns {void}
     */
    _fetchContent: function(contentParams){
        var dialogNode = document.getElement(".easy-dialog-main .dialog-content-area");
        if( dialogNode ){
            dialogNode.set("html", "<div class=\"dialog-loader\"></div>"); // Show loading spinner.

            this.ajaxRequest = new Request.HTML({
                url: contentParams.address,
                method: "get",
                update: dialogNode,
                noCache: true,
                onComplete: function(){
                    this.ajaxRequest = null; // Clear request reference.
                    this._adjustPosition(); // Re-adjust dialog after content loads.
                    contentParams.onContentLoaded();
                }.bind(this)
            }).send();
        }
    },

    /**
     * Private method to adjust the dialog's position on screen.
     * Centers the dialog and handles gallery image sizing.
     * @returns {void}
     */
    _adjustPosition: function(){
        var dialogNode = $('easy-dialog');
        if( !dialogNode ) return;

        var scrollOffset = window.getScroll().y;
        var dialogHeight = dialogNode.getSize().y;
        var windowHeight = window.getSize().y;

        // Calculate top position, ensuring it's not too high.
        var topPosition = ((windowHeight - dialogHeight) / 2) + scrollOffset;
        if( topPosition < this.settings.verticalOffset ) topPosition = this.settings.verticalOffset;

        dialogNode.setStyles({
            top: topPosition,
            left: (window.getSize().x - dialogNode.getSize().x) / 2
        });
    },

    /**
     * Private method to attach the ESC key listener for closing the dialog.
     * @returns {void}
     */
    _attachEscapeHandler: function(){
        if( this.settings.escapeKeyClose ) {
            var keyEventType = Browser.name != 'ie' ? "keydown" : "onkeydown";
            this.__escapeKeyCloseHandler = function(keyEvent){
                if( keyEvent.key == "esc" ) this.conceal();
            }.bind(this);
            window.addEvent(keyEventType, this.__escapeKeyCloseHandler);
        }
    },

    /**
     * Private method for simple template processing.
     * Replaces placeholders in a string with provided values.
     * @param {String} templateString - The template string with placeholders.
     * @param {Object} data - Key-value pairs for replacement.
     * @returns {String} The processed string.
     */
    _formatMarkup: function(templateString, data){
        for( var key in data ){
            templateString = templateString.replace( new RegExp(key, "g"), data[key] );
        }
        return templateString;
    }

});

// MooTools Mixin for managing parameters (equivalent to Options).
var Parameters = new Class({
    setParameters: function(userParameters){
        this.settings = Object.merge({}, this.settings, userParameters);
        return this;
    }
});