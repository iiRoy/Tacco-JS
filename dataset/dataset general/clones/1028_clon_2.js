/*
 * ---
 * document: This module provides a basic framework for creating overlay dialogs.
 * It's designed for simple alerts or confirmations, supporting both
 * synchronous and asynchronous content loading. It can integrate external
 * content or use inline HTML. While not a full-fledged lightbox, its ability
 * to customize layout sections offers similar visual flexibility.
 *
 * license: MIT style
 *
 * contributors:
 * - Marco Dell'Anna (original author)
 *
 * requirements:
 * - core/1.3: '*'
 *
 * exports:
 * - LightBoxWindow
 * ...
 *
 * MooTools LightBox Window
 * Version 1.0.0
 * Copyright (c) 2011 Marco Dell'Anna - http://www.plasm.it
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
 * 1.0.0 - Initial stable release implementation [Tested on: ie7/ie8/ie9/Chrome/Firefox7/Safari]
 */
var LightBoxWindow = new Class({

    // Mixins
    Includes: [Settings],

    // Member variables for asynchronous operations and panel controls
    asyncOperation: null,
    actionButtons:  [],

    // Default configuration
    config: {
        onElementInserted: function() {}, // Callback after DOM injection
        vertOffsetPx:      null,
        backdropVisibility:.3,
        backdropTint:      "#000000",
        panelWidthPx:      400,
        isMovable:         true,
        escapeKeyClose:    true,
        backdropDismiss:   true,
        displayCloseIcon:  true, // 'X' dismiss button
        omitHeaderSection: false,
        omitFooterSection: false,
        confirmButtonText: "Okay", // Label for confirmation
        cancelButtonText:  "Cancel", // Label for cancellation
        markupStructure:   "<div class=\"lightbox-header\"><h1>{_HEADING_}</h1></div><div class=\"lightbox-body\"><div class=\"main-content\">{_BODY_TEXT_}</div></div><div class=\"lightbox-footer\"></div>"
    },

    /**
     * Module initialization
     * @param {Object} initSettings - Custom settings to override defaults
     */
    initModule: function(initSettings) {
        // Apply provided settings
        this.setOptions(initSettings);
    },

    /**
     * Public method to display the dialog
     * Opens the modal window with specified options
     * @param {Object} displayOptions - Options specific to this display instance
     * @return {Element} The rendered HTML node of the panel
     */
    displayPanel: function(displayOptions) {
      if (!displayOptions) displayOptions = {};

      // Render the overlay
      this._manageOverlay("present");

      // Determine panel behavior based on layout type
      switch (displayOptions.layoutType) {

        // Requires caption, body content, and a callback for confirmation
        case "confirmation":
          // Add the primary confirmation button
          this.addControlElement(this.config.confirmButtonText, "action primary spaced-button", function() {
              try { displayOptions.onConfirmAction() } catch (err) {};
              this.concealPanel();
          });
          // Add the secondary cancellation button
          this.addControlElement(this.config.cancelButtonText, "action secondary");
          // Construct the panel
          var panelElement = this._constructPanel(displayOptions);
          // Attach escape key handler
          this._enableEscDismiss();
        break;

        // Requires caption and body content (action buttons defined externally)
        case "generic":
          // Construct the panel
          var panelElement = this._constructPanel(displayOptions);
          // Attach escape key handler
          this._enableEscDismiss();
        break;

        // Requires caption and remote content URL (action buttons defined externally)
        case "remote-content":
          // Construct the panel
          var panelElement = this._constructPanel(displayOptions);
          this._fetchContent({
            "resourceURL":        displayOptions.requestParameters.resourceURL || "",
            "onContentFetchComplete": displayOptions.requestParameters.onContentFetchComplete || function() {}
          });
        break;

        // Default: simple alert dialog
        default:
          // Add the default confirmation button
          this.addControlElement(this.config.confirmButtonText, "action primary");
          // Construct the panel
          var panelElement = this._constructPanel(displayOptions);
          // Attach escape key handler
          this._enableEscDismiss();
        break;
      }

      // Apply custom width to the panel
      panelElement.setStyles({width: this.config.panelWidthPx});

      // Conditionally hide header and/or footer sections
      if (this.config.omitHeaderSection) panelElement.addClass("no-header");
      if (this.config.omitFooterSection) panelElement.addClass("no-footer");

      // Add the 'X' dismiss button if configured
      if (this.config.displayCloseIcon) this._attachCloseIcon();

      // Enable window dragging if configured
      if (this.config.isMovable) {
        var dragHandle = panelElement.getElement(".lightbox-header");
        new Drag(panelElement, { handle: dragHandle });
        // Set cursor for the drag handle
        dragHandle.setStyle("cursor", "grab");
        panelElement.addClass("movable");
      }

      // Adjust panel position on stage
      this._adjustPosition();
    },

    /**
     * Public method to conceal the dialog
     * Closes the modal window
     * @return {void}
     */
    concealPanel: function() {
        try {
            if (typeof(this.asyncOperation) == "object") this.asyncOperation.cancel();
        } catch (err) {}
        this._manageOverlay('conceal');
        return;
    },

    /**
     * Private method to render the dialog panel
     * @param {Object} renderOptions - Options for rendering the panel
     * @return {Element} The generated panel HTML node
     */
    _constructPanel: function(renderOptions) {
        // Create and inject the panel node into the DOM
        var panelElement = new Element("div#lightbox-window", {"class": "lightbox-panel"});
        panelElement.inject( $$("body")[0] );

        // Populate the panel with content using a template
        var generatedHtml = this._processTemplate(this.config.markupStructure, {
            "_HEADING_":    renderOptions.caption || "Untitled",
            "_BODY_TEXT_": renderOptions.bodyContent || ""
        });
        panelElement.set("html", generatedHtml);

        // Inject all prepared action buttons
        this._insertAllControlElements();

        // Execute the onAppend callback
        this.config.onElementInserted();
        return panelElement;
    },

    /**
     * Public method to add an action button to the panel
     * @param {string} buttonText - The text displayed on the button
     * @param {string} buttonClass - CSS class(es) for styling the button
     * @param {Function} clickHandler - Function to execute on button click
     * @return {Element} The created button HTML node
     */
    addControlElement: function(buttonText, buttonClass, clickHandler) {
        var controlBtn = new Element('a', {
                                        "label":       buttonText,
                                        "displayText": buttonText,
                                        "styleClass":  buttonClass,
                                        "eventHandlers": {
                                            tap: (clickHandler || this.concealPanel).bind(this)
                                        }
                                  });
        this.actionButtons.push(controlBtn);
        return controlBtn;
    },

    /**
     * Private method to inject all accumulated buttons into the footer
     * @return {void}
     */
    _insertAllControlElements: function() {
        this.actionButtons.each(function(currentButton, index) {
            currentButton.inject( $("lightbox-window").getElement(".lightbox-footer") );
        });
        return;
    },

    /**
     * Private method to create and inject the 'X' close button
     * @return {Element} The created close button HTML node
     */
    _attachCloseIcon: function() {
        var dismissBtn = new Element("a", {"styleClass": "dismiss", "href": "#", "innerHtml": "x"});
        dismissBtn.inject($("lightbox-window"), "top");

        // Appends the X close button and its event listener
        dismissBtn.addEvent("tap", function(evt) {
            if (evt) evt.stop();
            this.concealPanel();
        }.bind(this));
        return dismissBtn;
    },

    /**
     * Private method to manage the overlay and panel visibility
     * @param {string} actionState - 'present' to show, 'conceal' to hide
     * @return {void}
     */
    _manageOverlay: function(actionState) {
       switch (actionState) {
           case 'present':
               this._manageOverlay('conceal'); // Ensure any existing overlay is removed
               var backdrop = new Element("div", {"id": "lightbox-backdrop"});
               backdrop.inject( $$("body")[0] );
               backdrop.setStyle("background-color", this.config.backdropTint);
               backdrop.fade("out").fade(this.config.backdropVisibility);

               // Add backdrop dismissal behavior
               if (this.config.backdropDismiss) {
                   backdrop.addEvent("tap", function(evt) {
                       if (evt) evt.stop();
                       this.concealPanel();
                   }.bind(this));
               }

               // Attach resize control
               this.__viewportAdjust = this._adjustPosition.bind(this);
               window.addEvent("resize", this.__viewportAdjust);
           break;

           case 'conceal':
               // Remove resize event listener
               window.removeEvent("resize", this._adjustPosition);

               // Remove escape key event listener
               if (this.config.escapeKeyClose) {
                 var eventType = Browser.name != 'ie' ? "keydown" : "onkeydown";
                 window.removeEvent(eventType, this._escKeyHandler);
               }

               // Remove backdrop element
               try {
                   $('lightbox-backdrop').destroy();
               } catch (err) {}

               // Remove panel element
               try {
                   $('lightbox-window').destroy();
               } catch (err) {}
           break;
       }
       return;
    },

    /**
     * Private method to load content asynchronously for ajax panels
     * @param {Object} fetchParams - Parameters for the content fetch, including URL
     * @return {void}
     */
    _fetchContent: function(fetchParams) {
        // Indicate loading state
        $('lightbox-window').addClass("fetching");

        // Regex to detect image files
        var imgPattern = new RegExp( /([^\/\\]+)\.(jpg|png|gif)$/i );
        if (fetchParams.resourceURL.match(imgPattern)) {

            // Hide footer for image display
            $('lightbox-window').addClass("no-footer");
            // Prevent overlay dismissal during image loading
            $("lightbox-backdrop").removeEvents();

            // Load image asset
            var imageResources = [fetchParams.resourceURL];
            new Media.Images(imageResources, {
                onLoadProgress: function(idx) {
                    // Current image being loaded
                    retrievedImage = this;
                },
                onAllLoaded: function() {
                    try {
                        // Remove loading indicator
                        $('lightbox-window').removeClass("fetching");

                        // Calculate new dimensions for the panel
                        var contentArea = $('lightbox-window').getElement(".main-body");
                        var contentPadding = contentArea.getStyle("padding").split(" ");
                        var newWidth   = (retrievedImage.get("width").toInt()) + (contentPadding[1].toInt() + contentPadding[3].toInt());
                        var newHeight  = retrievedImage.get("height").toInt();

                        // Animate width change
                        var widthAnimator = new Fx.Tween($("lightbox-window"), {
                            duration: 'normal',
                            transition: 'sine:out',
                            link: 'cancel',
                            property: 'width'
                        }).start($("lightbox-window").getCoordinates().width, newWidth);

                        // Animate height change and chain subsequent actions
                        var heightAnimator = new Fx.Tween(contentArea, {
                            duration: 'normal',
                            transition: 'sine:out',
                            link: 'cancel',
                            property: 'height'
                        }).start(contentArea.getCoordinates().height, newHeight).chain(function() {
                            // Inject and fade in the image
                            retrievedImage.inject( $('lightbox-window').getElement(".main-body").empty() ).fade("out").fade("in");
                            this._adjustPosition();
                            // Re-enable escape key dismissal
                            this._enableEscDismiss();
                        }.bind(this));

                        // Animate left position to re-center
                        var leftAnimator = new Fx.Tween($("lightbox-window"), {
                            duration: 'normal',
                            transition: 'sine:out',
                            link: 'cancel',
                            property: 'left'
                        }).start($("lightbox-window").getCoordinates().left, (window.getSize().x - newWidth) / 2);

                    } catch (err) {}
                }.bind(this)
            });

        } else {
            // Request HTML content
            this.asyncOperation = new Ajax.HtmlRequest({
                evalScripts: false,
                url: fetchParams.resourceURL,
                method: 'get',
                onBeginRequest: function() {
                    // Placeholder for request start
                },
                onCompleteSuccess: function(responseTree, responseElements, pageContent, scriptPayload) {
                    $('lightbox-window').removeClass("fetching");
                    $('lightbox-window').getElement(".main-body").set("html", pageContent);
                    fetchParams.onContentFetchComplete();
                    // Execute any scripts found in the loaded content
                    eval(scriptPayload);
                    // Re-adjust panel position
                    this._adjustPosition();
                    // Re-enable escape key dismissal
                    this._enableEscDismiss();
                }.bind(this),
                onFailedRequest: function() {
                    $('lightbox-window').removeClass("fetching");
                    $('lightbox-window').getElement(".main-body").set("html", "content retrieval failed");
                }
            }).send();
        }
    },

    /**
     * Private method to reposition the panel and update overlay size
     * @return {void}
     */
    _adjustPosition: function() {
        // Update backdrop dimensions
        try {
            $("lightbox-backdrop").setStyles({
                height: window.getSize().y
            });
        } catch (err) {}

        // Update panel's position
        try {
            var verticalOffset = this.config.vertOffsetPx || 40; // Default offset if not specified
            $("lightbox-window").setStyles({
                top: verticalOffset,
                left: ((window.getSize().x - $("lightbox-window").getCoordinates().width) / 2)
            });
        } catch (err) {}
        return;
    },

    /**
     * Private method to set up escape key dismissal
     * @return {void}
     */
    _enableEscDismiss: function() {
        if (this.config.escapeKeyClose) {
            this._escKeyHandler = function(eventData) {
                if (eventData.key == "escape") this.concealPanel();
            }.bind(this);

            // Add event listener for escape key
            var eventName = Browser.name != 'ie' ? "keydown" : "onkeydown";
            window.addEvent(eventName, this._escKeyHandler);
        }
    },

    /**
     * Private method for simple template processing
     * Replaces placeholders in a string with data object values.
     * @param {string} templateString - The template string with placeholders
     * @param {Object} dataObject - Object containing data for placeholders
     * @return {string} The processed string
     */
    _processTemplate: function(templateString, dataObject) {
        for (var placeholderName in dataObject) {
            templateString = templateString.replace(new RegExp('{' + placeholderName + '}', 'g'), dataObject[placeholderName]);
        }
        return templateString;
    }
});