// This file contains the implementation of the SimpleModal class for MooTools.
// It allows creation of modal windows for alerts, confirmations, or displaying external content.
//
// ---
// Description:
// SIMPLE MODAL is a lightweight plugin designed to create versatile modal windows.
// It supports generating alert or confirmation messages with minimal code.
// Confirmation dialogs can utilize callbacks for affirmative actions and operate asynchronously.
// Content can be loaded dynamically from external pages or provided inline.
// While not a full-fledged lightbox, its ability to hide parts of its layout gives it similar visual characteristics.
//
// License: MIT-style
//
// Authors:
// - Marco Dell'Anna
//
// Requires:
// - core/1.3: '*' (MooTools Core version 1.3 or higher)
//
// Provides:
// - SimpleModal
// ...
//
//
// MooTools Simple Modal
// Version 1.0
// Copyright (c) 2011 Marco Dell'Anna - http://www.plasm.it
//
// Requires:
// MooTools http://mootools.net
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//
// Log:
// 1.0 - Initial stable release implementation [Tested on: ie7/ie8/ie9/Chrome/Firefox7/Safari]
//

var SimpleModal = new Class({
  // Implement MooTools Options mixin for handling default and user-defined options.
  Implements: [Options],

  // Holds the current Request object for AJAX content loading.
  request: null,

  // An array to store all buttons added to the modal footer.
  buttons: [],

  // Default options for the modal window. These can be overridden during instantiation.
  options: {
    // Callback function executed when the modal is appended to the DOM.
    onAppend: Function,

    // Vertical offset from the top of the window. If null, a default is used.
    offsetTop: null,

    // Opacity level for the overlay background.
    overlayOpacity: .3,

    // Color of the overlay background.
    overlayColor: "#000000",

    // Width of the modal window in pixels.
    width: 400,

    // Determines if the modal window can be dragged by its header.
    draggable: true,

    // Enables or disables closing the modal with the ESC key.
    keyEsc: true,

    // If true, clicking the overlay will close the modal.
    overlayClick: true,

    // If true, a close 'X' button will be displayed in the header.
    closeButton: true,

    // If true, the modal header will be hidden.
    hideHeader: false,

    // If true, the modal footer will be hidden.
    hideFooter: false,

    // Label for the 'OK' or primary action button.
    btn_ok: "OK",

    // Label for the 'Cancel' or secondary action button.
    btn_cancel: "Cancel",

    // HTML template string for the modal structure. Placeholders like {_TITLE_} and {_CONTENTS_} will be replaced.
    template: "<div class=\"simple-modal-header\"><h1>{_TITLE_}</h1></div><div class=\"simple-modal-body\"><div class=\"contents\">{_CONTENTS_}</div></div><div class=\"simple-modal-footer\"></div>"
  },

  /**
   * Initialization method for the SimpleModal class.
   * @param {Object} options - User-defined options to override the defaults.
   */
  initialize: function(options) {
    // Apply user-provided options, merging them with the default options.
    this.setOptions(options);
  },

  /**
   * Public method to display the modal window.
   * Based on the 'model' option, it configures the modal as 'confirm', 'modal', 'modal-ajax', or default 'alert'.
   * @param {Object} options - Specific options for this particular modal instance, potentially overriding class options.
   * @returns {Element} The HTML node representing the modal window.
   */
  show: function(options) {
    // Ensure options object exists, initialize if not provided.
    if (!options) options = {};

    // Display the overlay that covers the background.
    this._overlay("show");

    // Determine the type of modal to display based on the 'model' option.
    switch (options.model) {
      // Confirmation modal: Requires title, contents, and a callback for the 'OK' action.
      case "confirm":
        // Add the primary 'OK' button.
        this.addButton(this.options.btn_ok, "btn primary btn-margin", function() {
          // Execute the callback function if it exists and handle potential errors.
          try {
            options.callback()
          } catch (err) {};
          // Hide the modal after the callback is executed.
          this.hide();
        });
        // Add the secondary 'Cancel' button.
        this.addButton(this.options.btn_cancel, "btn secondary");
        // Render the modal window structure.
        var node = this._drawWindow(options);
        // Enable ESC key behavior to close the modal.
        this._addEscBehaviour();
        break;

        // General purpose modal: Requires title and contents. Action buttons are defined externally.
      case "modal":
        // Render the modal window structure.
        var node = this._drawWindow(options);
        // Enable ESC key behavior to close the modal.
        this._addEscBehaviour();
        break;

        // AJAX modal: Requires title and a URL for content. Action buttons are defined externally.
      case "modal-ajax":
        // Render the modal window structure.
        var node = this._drawWindow(options);
        // Load contents asynchronously from the specified URL.
        this._loadContents({
          "url": options.param.url || "",
          "onRequestComplete": options.param.onRequestComplete || Function
        });
        break;

        // Default case: Alert modal. Requires title and contents.
      default:
        // Add the primary 'OK' button for the alert.
        this.addButton(this.options.btn_ok, "btn primary");
        // Render the modal window structure.
        var node = this._drawWindow(options);
        // Enable ESC key behavior to close the modal.
        this._addEscBehaviour();
        break;
    }

    // Set the custom width for the modal window.
    node.setStyles({
      width: this.options.width
    });

    // Conditionally hide the header and/or footer based on options.
    if (this.options.hideHeader) node.addClass("hide-header");
    if (this.options.hideFooter) node.addClass("hide-footer");

    // If enabled, add the 'X' close button to the modal header.
    if (this.options.closeButton) this._addCloseButton();

    // If draggable option is true, enable dragging functionality for the modal.
    if (this.options.draggable) {
      var headDrag = node.getElement(".simple-modal-header");
      new Drag(node, {
        handle: headDrag
      });
      // Set the cursor style for the draggable handle.
      headDrag.setStyle("cursor", "move");
      node.addClass("draggable");
    }
    // Adjust the modal's position on the screen.
    this._display();
  },

  /**
   * Public method to hide and destroy the modal window.
   * This also cancels any pending AJAX requests associated with the modal.
   * @returns {void}
   */
  hide: function() {
    // Attempt to cancel any active AJAX request to prevent memory leaks or unwanted callbacks.
    try {
      if (typeof(this.request) == "object") this.request.cancel();
    } catch (err) {}
    // Hide and remove the overlay and the modal itself.
    this._overlay('hide');
    return;
  },

  /**
   * Private method responsible for rendering the modal window's HTML structure.
   * It creates the modal element, injects the title and contents, and adds buttons.
   * @param {Object} options - Options containing title and contents for the modal.
   * @returns {Element} The newly created modal HTML element.
   */
  _drawWindow: function(options) {
    // Create the main modal div element and assign it an ID and class.
    var node = new Element("div#simple-modal", {
      "class": "simple-modal"
    });
    // Inject the modal element into the body of the document.
    node.inject($$("body")[0]);

    // Populate the modal template with the provided title and contents.
    var html = this._template(this.options.template, {
      "_TITLE_": options.title || "Untitled",
      "_CONTENTS_": options.contents || ""
    });
    // Set the inner HTML of the modal element.
    node.set("html", html);

    // Inject all previously added buttons into the modal's footer.
    this._injectAllButtons();
    // Execute the onAppend callback function, if defined.
    this.options.onAppend();
    return node;
  },

  /**
   * Public method to add a button to the modal's button array.
   * These buttons will be injected into the modal footer when _drawWindow is called.
   * @param {string} label - The text label for the button.
   * @param {string} classe - CSS classes to apply to the button.
   * @param {Function} clickEvent - The function to execute when the button is clicked. If not provided, the modal will hide.
   * @returns {Element} The newly created button HTML element.
   */
  addButton: function(label, classe, clickEvent) {
    var bt = new Element('a', {
      "title": label,
      "text": label,
      "class": classe,
      "events": {
        // Bind the click event to the provided function or to the hide method of the modal.
        click: (clickEvent || this.hide).bind(this)
      }
    });
    // Add the button element to the internal buttons array.
    this.buttons.push(bt);
    return bt;
  },

  /**
   * Private method to inject all buttons from the 'buttons' array into the modal's footer.
   * This is called after the modal structure has been drawn.
   * @returns {void}
   */
  _injectAllButtons: function() {
    // Iterate over each button in the array and inject it into the footer.
    this.buttons.each(function(e, i) {
      e.inject($("simple-modal").getElement(".simple-modal-footer"));
    });
    return;
  },

  /**
   * Private method to add the 'X' close button to the top of the modal.
   * It also attaches an event listener to hide the modal when clicked.
   * @returns {Element} The created close button HTML element.
   */
  _addCloseButton: function() {
    var b = new Element("a", {
      "class": "close",
      "href": "#",
      "html": "x"
    });
    // Inject the close button at the top of the modal.
    b.inject($("simple-modal"), "top");
    // Attach a click event listener to hide the modal.
    b.addEvent("click", function(e) {
      if (e) e.stop(); // Prevent default link behavior.
      this.hide();
    }.bind(this)); // Ensure 'this' refers to the SimpleModal instance.
    return b;
  },

  /**
   * Private method to manage the modal overlay (show/hide).
   * It creates or destroys the overlay and attaches/detaches resize and overlay click events.
   * @param {string} status - "show" to display the overlay, "hide" to remove it.
   * @returns {void}
   */
  _overlay: function(status) {
    switch (status) {
      case 'show':
        // Ensure any existing overlay is hidden before showing a new one.
        this._overlay('hide');
        var overlay = new Element("div", {
          "id": "simple-modal-overlay"
        });
        // Inject the overlay into the body.
        overlay.inject($$("body")[0]);
        // Set its background color and fade it in to the desired opacity.
        overlay.setStyle("background-color", this.options.overlayColor);
        overlay.fade("hide").fade(this.options.overlayOpacity);

        // If overlayClick is enabled, add an event listener to hide the modal when the overlay is clicked.
        if (this.options.overlayClick) {
          overlay.addEvent("click", function(e) {
            if (e) e.stop();
            this.hide();
          }.bind(this));
        }
        // Add a resize event listener to reposition the modal on window resize.
        this.__resize = this._display.bind(this);
        window.addEvent("resize", this.__resize);
        break;

      case 'hide':
        // Remove the resize event listener to prevent memory leaks.
        window.removeEvent("resize", this._display);

        // If ESC key behavior was active, remove its event listener.
        if (this.options.keyEsc) {
          var fixEV = Browser.name != 'ie' ? "keydown" : "onkeydown";
          window.removeEvent(fixEV, this._removeSM);
        }

        // Attempt to destroy the overlay element.
        try {
          $('simple-modal-overlay').destroy();
        } catch (err) {}
        // Attempt to destroy the modal element itself.
        try {
          $('simple-modal').destroy();
        } catch (err) {}
        break;
    }
    return;
  },

  /**
   * Private method to handle loading content for 'modal-ajax' type modals.
   * It supports loading images directly or making an AJAX request for HTML content.
   * @param {Object} param - An object containing 'url' and 'onRequestComplete' callback.
   * @returns {void}
   */
  _loadContents: function(param) {
    // Add a 'loading' class to the modal to show a loading indicator.
    $('simple-modal').addClass("loading");

    // Regular expression to check if the URL points to an image file.
    var re = new RegExp(/([^\/\\]+)\.(jpg|png|gif)$/i);

    // If the URL is an image, handle it as an image display.
    if (param.url.match(re)) {
      // For images, hide the modal footer.
      $('simple-modal').addClass("hide-footer");
      // Remove all events from the overlay to prevent unintended actions during image loading.
      $("simple-modal-overlay").removeEvents(); // Prevent Abort

      // Create an Asset.images instance to pre-load the image.
      var images = [param.url];
      new Asset.images(images, {
        onProgress: function(i) {
          immagine = this; // Store the image element reference.
        },
        onComplete: function() {
          try {
            // Remove the loading indicator.
            $('simple-modal').removeClass("loading");

            // Calculate new dimensions for the modal based on the image size.
            var content = $('simple-modal').getElement(".contents");
            var padding = content.getStyle("padding").split(" ");
            var width = (immagine.get("width").toInt()) + (padding[1].toInt() + padding[3].toInt());
            var height = immagine.get("height").toInt();

            // Animate the modal's width to fit the image.
            var myFx1 = new Fx.Tween($("simple-modal"), {
              duration: 'normal',
              transition: 'sine:out',
              link: 'cancel',
              property: 'width'
            }).start($("simple-modal").getCoordinates().width, width);

            // Animate the content area's height. Chained to inject image and reposition.
            var myFx2 = new Fx.Tween(content, {
              duration: 'normal',
              transition: 'sine:out',
              link: 'cancel',
              property: 'height'
            }).start(content.getCoordinates().height, height).chain(function() {
              // Inject the loaded image into the content area, fading it in.
              immagine.inject($('simple-modal').getElement(".contents").empty()).fade("hide").fade("in");
              // Reposition the modal after resizing.
              this._display();
              // Re-enable ESC key behavior.
              this._addEscBehaviour();
            }.bind(this));

            // Animate the modal's left position to center it horizontally.
            var myFx3 = new Fx.Tween($("simple-modal"), {
              duration: 'normal',
              transition: 'sine:out',
              link: 'cancel',
              property: 'left'
            }).start($("simple-modal").getCoordinates().left, (window.getCoordinates().width - width) / 2);
          } catch (err) {}
        }.bind(this) // Ensure 'this' context is maintained for the SimpleModal instance.
      });

    } else {
      // If it's not an image, perform an AJAX request for HTML content.
      this.request = new Request.HTML({
        evalScripts: false, // Do not evaluate scripts directly from the HTML response.
        url: param.url,
        method: 'get',
        onRequest: function() {
          // Callback fired when the request starts.
        },
        onSuccess: function(responseTree, responseElements, responseHTML, responseJavaScript) {
          // Remove loading indicator.
          $('simple-modal').removeClass("loading");
          // Inject the received HTML into the modal's content area.
          $('simple-modal').getElement(".contents").set("html", responseHTML);
          // Execute the custom onRequestComplete callback.
          param.onRequestComplete();
          // Manually evaluate JavaScript from the response if desired.
          eval(responseJavaScript);
          // Reposition the modal after content loading.
          this._display();
          // Re-enable ESC key behavior.
          this._addEscBehaviour();
        }.bind(this), // Ensure 'this' context.
        onFailure: function() {
          // Handle request failure.
          $('simple-modal').removeClass("loading");
          $('simple-modal').getElement(".contents").set("html", "loading failed");
        }
      }).send(); // Send the AJAX request.
    }
  },

  /**
   * Private method to dynamically adjust the position of the overlay and the modal window.
   * This is called on initial display and whenever the window is resized.
   * @returns {void}
   */
  _display: function() {
    // Update the height of the overlay to cover the entire window.
    try {
      $("simple-modal-overlay").setStyles({
        height: window.getCoordinates().height // Or $$("body")[0].getScrollSize().y for full document height.
      });
    } catch (err) {}

    // Update the position of the modal popup.
    try {
      // Calculate the vertical offset, defaulting to 40px if not specified.
      var offsetTop = this.options.offsetTop || 40;
      $("simple-modal").setStyles({
        top: offsetTop,
        // Center the modal horizontally.
        left: ((window.getCoordinates().width - $("simple-modal").getCoordinates().width) / 2)
      });
    } catch (err) {}
    return;
  },

  /**
   * Private method to add the ESC key event listener for closing the modal.
   * This behavior is enabled only if the 'keyEsc' option is true.
   * @returns {void}
   */
  _addEscBehaviour: function() {
    if (this.options.keyEsc) {
      // Define the event handler function.
      this._removeSM = function(e) {
        if (e.key == "esc") this.hide(); // If ESC key is pressed, hide the modal.
      }.bind(this); // Bind 'this' to the SimpleModal instance.

      // Add the event listener to the window.
      // Use "keydown" for most browsers, "onkeydown" for IE compatibility.
      var fixEV = Browser.name != 'ie' ? "keydown" : "onkeydown";
      window.addEvent(fixEV, this._removeSM);
    }
  },

  /**
   * Private utility method for simple templating.
   * Replaces placeholders in a string with values from a data object.
   * @param {string} s - The template string with placeholders (e.g., "{_KEY_}").
   * @param {Object} d - The data object containing key-value pairs for replacement.
   * @returns {string} The processed string with placeholders replaced.
   */
  _template: function(s, d) {
    // Iterate over the properties of the data object.
    for (var p in d)
      // Replace all occurrences of the placeholder with the corresponding data value.
      s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
    return s;
  }
});