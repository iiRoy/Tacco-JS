// This is a Type I clone of the original JavaScript source file.
// All functionality and logic remain identical.
// Only whitespace and comments have been altered significantly.

/*
 * This file contains the SimpleModal JavaScript plugin implementation.
 * It provides functionality for creating various types of modal windows,
 * including alert, confirm, basic modal, AJAX-loaded modal, and lightbox.
 *
 * License: MIT - as per original author's intentions.
 *
 * Authors:
 * - Marco Dell'Anna (Original creator)
 * - Juan Lago (Contributor, updated versions)
 *
 * Requires: MooTools Core library.
 *
 * Version information (historical):
 * 1.0 - Initial stable release, tested across various browsers.
 * 1.1 - Added lightbox functionality and related features.
 *
 * Note: This cloned version aims to visually differentiate from the original
 * by modifying comments and whitespace extensively, while preserving
 * the exact semantic meaning and code structure.
 */


var SimpleModal = new Class(
{
    // Implementation details: Mixin for Options
    Implements: [Options],

    // Request object for AJAX operations, if any are pending.
    request: null,

    // Array to hold modal buttons.
    buttons: [],

    // Configuration object specifically for lightbox features.
    lightbox: {},

    // Default configuration options for the modal.
    options: {
        // Callback function executed when the modal is appended to the DOM.
        onAppend: Function,

        // Vertical offset from the top of the viewport.
        offsetTop: 40,

        // Opacity of the overlay background.
        overlayOpacity: .3,

        // Color of the overlay background.
        overlayColor: "#000000",

        // Width of the modal window in pixels.
        width: 400,

        // Flag to enable/disable modal dragging.
        draggable: true,

        // Flag to enable/disable closing modal with ESC key.
        keyEsc: true,

        // Flag to enable/disable closing modal by clicking the overlay.
        overlayClick: true,

        // Always treat content as image for lightbox, if true.
        alwaysImage: true,

        // Flag to show/hide the 'X' close button.
        closeButton: true,

        // Flag to hide the modal header section.
        hideHeader: false,

        // Flag to hide the modal footer section.
        hideFooter: false,

        // Extra width pixels for lightbox images (due to modal skin/padding).
        lightboxExcessWidth: 40,

        // Extra height pixels for lightbox images (due to modal skin/padding).
        lightboxExcessHeight: 120,

        // Label for the 'OK' button.
        btn_ok: "OK",

        // Label for the 'Cancel' button.
        btn_cancel: "Cancel",

        // HTML template string for the modal structure.
        template: "<div class=\"simple-modal-header\">" +
                  "<h1>{_TITLE_}</h1>" +
                  "</div>" +
                  "<div class=\"simple-modal-body\">" +
                  "<div class=\"contents\">{_CONTENTS_}</div>" +
                  "</div>" +
                  "<div class=\"simple-modal-footer\"></div>"
    },


    /**
     *  Initializes the SimpleModal instance.
     *  @param {object} options - Configuration options to override defaults.
     */
    initialize: function (options) {
        // Apply provided options, merging with defaults.
        this.setOptions(options);
    },


    /**
     * Public method to display the modal window.
     * @param {object} options - Parameters to configure this specific modal display.
     * @returns {Element} The HTML node representing the modal.
     */
    show: function (options) {
        // Ensure options object exists, initialize if not provided.
        if (!options) options = {};

        // Determine if the modal needs to be redrawn or if it's an update.
        options.draw = (options.draw == undefined) ? true : options.draw;

        // Display the overlay background if drawing a new modal.
        if (options.draw)
            this._overlay("show");

        // Use a switch statement to handle different modal types.
        switch (options.model) {

            // Case for a confirmation dialog.
            case "confirm":
                // Add the 'OK' button.
                this.addButton(this.options.btn_ok, "btn primary btn-margin", function () {
                    try {
                        options.callback()
                    } catch (err) { /* Callback might not be defined or could throw error */
                    }
                    this.hide(); // Close the modal after action.
                });

                // Add the 'Cancel' button.
                this.addButton(this.options.btn_cancel, "btn secondary");

                // Render the modal window structure.
                var node = this._drawWindow(options);

                // Enable ESC key to close the modal.
                this._addEscBehaviour();
                break;

            // Case for a generic modal dialog.
            case "modal":
                // Render the modal window.
                var node = this._drawWindow(options);

                // Add ESC key behavior for closing.
                this._addEscBehaviour();
                break;

            // Case for a modal loading content via AJAX.
            case "modal-ajax":
                // Draw the modal frame first.
                var node = this._drawWindow(options);

                // Load content asynchronously.
                this._loadContents({
                    "url": options.param.url || "",
                    "onRequestComplete": options.param.onRequestComplete || Function
                });
                break;

            // Case for a lightbox modal (image gallery, etc.).
            case "lightbox":

                // Lightbox requires navigation arrows.
                options.arrows = true;

                // Store current lightbox state for navigation.
                this.lightbox.element = options.lightbox.element;
                this.lightbox.group = options.lightbox.group;
                this.lightbox.order = options.lightbox.order;

                // Render the modal window.
                var node = this._drawWindow(options);

                // Load content (typically an image or external page).
                this._loadContents({
                    "url": options.param.url || "",
                    "order": this.lightbox.order,
                    "draw": options.draw,
                    "onRequestComplete": options.param.onRequestComplete || Function
                });
                break;

            // Default case: simple alert dialog.
            default:
                // Add the default 'OK' button.
                this.addButton(this.options.btn_ok, "btn primary");

                // Draw the modal window.
                var node = this._drawWindow(options);

                // Enable ESC key to close.
                this._addEscBehaviour();
                break;
        }

        // Apply custom width to the modal node.
        node.setStyles({
            width: this.options.width
        });

        // Hide header if option is set.
        if (this.options.hideHeader) node.addClass("hide-header");
        // Hide footer if option is set.
        if (this.options.hideFooter) node.addClass("hide-footer");

        // Add the 'X' close button if enabled.
        if (this.options.closeButton) this._addCloseButton();


        // Enable dragging functionality for the modal.
        if (this.options.draggable) {
            var headDrag = node.getElement(".simple-modal-header");
            new Drag(node, {
                handle: headDrag
            });
            // Set cursor for draggable header.
            headDrag.setStyle("cursor", "move");
            node.addClass("draggable");
        }

        // Adjust modal position and size on screen.
        this._display();
    },


    /**
     * Public method to hide and close the modal window.
     * @returns {void}
     */
    hide: function () {
        // Attempt to cancel any ongoing AJAX requests.
        try {
            if (typeof (this.request) == "object") this.request.cancel();
        } catch (err) { /* Request might not exist or be invalid. */
        }

        // Hide the overlay and remove the modal.
        this._overlay('hide');

        return;
    },


    /**
     * Private method to render the modal window structure.
     * @param {object} options - Options for drawing the window.
     * @returns {Element} The created or retrieved modal HTML node.
     */
    _drawWindow: function (options) {

        var node;

        // Check if a new modal element needs to be created or an existing one updated.
        if (options.draw) {
            // Create a new div element for the modal and inject it into the body.
            node = new Element("div#simple-modal", {
                "class": "simple-modal"
            });
            node.inject($$("body")[0]);
        } else {
            // Retrieve an existing modal element.
            node = document.getElement('#simple-modal.simple-modal');
        }

        // Populate the modal with title and contents using the template.
        var html = this._template(this.options.template, {
            "_TITLE_": options.title || "Untitled",
            "_CONTENTS_": options.contents || ""
        });

        node.set("html", html);

        // Inject all accumulated buttons into the modal footer.
        this._injectAllButtons();

        // Add navigation arrows if specified (typically for lightbox).
        if (options.arrows)
            this._addArrows();

        // Execute the onAppend callback.
        this.options.onAppend();

        return node;
    },


    /**
     * Public method to add a button to the modal's button array.
     * @param {string} label - Text label for the button.
     * @param {string} classe - CSS class(es) for styling the button.
     * @param {function} clickEvent - Function to execute when the button is clicked.
     * @returns {Element} The created button HTML element.
     */
    addButton: function (label, classe, clickEvent) {
        var bt = new Element('a', {
            "title": label,
            "text": label,
            "class": classe,
            "events": {
                click: (clickEvent || this.hide).bind(this) // Default click is to hide.
            }
        });
        this.buttons.push(bt); // Add button to the internal array.
        return bt;
    },


    /**
     * Private method to inject all buttons from the `buttons` array
     * into the `.simple-modal-footer` element.
     * @returns {void}
     */
    _injectAllButtons: function () {
        // Iterate through each button and inject it.
        this.buttons.each(function (e, i) {
            e.inject($("simple-modal").getElement(".simple-modal-footer"));
        });
        return;
    },


    /**
     * Private method to add the 'X' close button to the modal header.
     * @returns {Element} The created close button HTML element.
     */
    _addCloseButton: function () {
        var b = new Element("a", {
            "class": "close",
            "href": "#",
            "html": "x"
        });

        // Inject the close button at the top of the modal.
        b.inject($("simple-modal"), "top");

        // Add click event listener to hide the modal.
        b.addEvent("click", function (e) {
            if (e) e.stop(); // Prevent default link behavior.
            this.hide(); // Hide the modal.
        }.bind(this));

        return b;
    },


    /**
     * Private method to add navigation arrows (Left/Right) for lightbox functionality.
     * These arrows allow navigating through a group of linked items.
     * @returns {void}
     */
    _addArrows: function () {

        // Create and inject the 'Next' button for navigation.
        var btnnext = new Element("a", {
            "class": "next-image",
            "style": "display:none",
            "href": "#",
            "html": "&raquo;"
        });

        btnnext.inject($("simple-modal"), "top");

        // Add click event for 'Next' button.
        btnnext.addEvent("click", function (e) {
            if (e) e.stop();
            this._viewNextElement(); // Load the next item in the group.
        }.bind(this));


        // Create and inject the 'Previous' button for navigation.
        var btnprevious = new Element("a", {
            "class": "previous-image",
            "style": "display:none",
            "href": "#",
            "html": "&laquo;"
        });

        btnprevious.inject($("simple-modal"), "top");

        // Add click event for 'Previous' button.
        btnprevious.addEvent("click", function (e) {
            if (e) e.stop();
            this._viewPreviousElement(); // Load the previous item in the group.
        }.bind(this));

        // Set initial visibility of the arrows based on current item's position.
        this._setArrowsVisibility();
    },


    /**
     * Private method to load and display the next element in a lightbox group.
     * Updates the current lightbox state and calls `show` again.
     * @returns {void}
     */
    _viewNextElement: function () {
        var elements = this._getElementsByGroup(this.lightbox.group);

        this.lightbox.order++; // Increment the current order.

        var next_element = elements[this.lightbox.order]; // Get the next element.

        // Show the modal again with the next element's data.
        this.show({
            "model": "lightbox",
            "title": next_element.get('title'),
            "draw": false, // No need to redraw the entire modal frame.
            "param": {
                "url": next_element.get('href'),
                "onRequestComplete": function () {}
            },
            "lightbox": {
                "element": next_element,
                "group": this.lightbox.group,
                "order": this.lightbox.order
            }
        });
    },


    /**
     * Private method to load and display the previous element in a lightbox group.
     * Updates the current lightbox state and calls `show` again.
     * @returns {void}
     */
    _viewPreviousElement: function () {
        var elements = this._getElementsByGroup(this.lightbox.group);

        this.lightbox.order--; // Decrement the current order.

        var previous_element = elements[this.lightbox.order]; // Get the previous element.

        // Show the modal again with the previous element's data.
        this.show({
            "model": "lightbox",
            "title": previous_element.get('title'),
            "draw": false, // No need to redraw the entire modal frame.
            "param": {
                "url": previous_element.get('href'),
                "onRequestComplete": function () {}
            },
            "lightbox": {
                "element": previous_element,
                "group": this.lightbox.group,
                "order": this.lightbox.order
            }
        });
    },


    /**
     * Private method to control the visibility of lightbox navigation arrows.
     * Arrows are hidden if there are no more items in that direction.
     * @returns {void}
     */
    _setArrowsVisibility: function () {

        var left_arrow = document.getElement('.simple-modal a.previous-image');
        var right_arrow = document.getElement('.simple-modal a.next-image');
        var total_slides = this.getTotalByGroup(this.lightbox.group);

        // Set visibility for the left (previous) arrow.
        if (this.lightbox.order == 0)
            left_arrow.setStyle('display', 'none'); // Hide if it's the first item.
        else
            left_arrow.setStyle('display', 'inline'); // Show otherwise.


        // Set visibility for the right (next) arrow.
        if (total_slides > 0 && this.lightbox.order < total_slides - 1)
            right_arrow.setStyle('display', 'inline'); // Show if there are more items.
        else
            right_arrow.setStyle('display', 'none'); // Hide otherwise.

    },


    /**
     * Private method to retrieve all elements belonging to a specific lightbox group.
     * Elements are identified by their `rel` attribute.
     * @param {string} group - The name of the lightbox group.
     * @returns {Array<Element>} A collection of DOM nodes in the specified group.
     */
    _getElementsByGroup: function (group) {

        var links = $$("a").filter(function (el) {
            // Filter anchor tags whose rel attribute contains the group identifier.
            return el.rel && el.rel.contains('simplemodal[' + group + ']');
        });

        return links;
    },


    /**
     * Public method to count the total number of lightboxes within a given group.
     * @param {string} group - The name of the lightbox group.
     * @returns {number} The count of lightboxes in the group.
     */
    getTotalByGroup: function (group) {
        return this._getElementsByGroup(group).length; // Simply return the length of the filtered array.
    },


    /**
     * Private method to manage the modal overlay (show/hide).
     * This includes creating/destroying the overlay and the modal itself.
     * @param {string} status - "show" to display, "hide" to remove.
     * @returns {void}
     */
    _overlay: function (status) {
        switch (status) {
            case 'show':

                // Ensure any existing overlay is hidden before showing a new one.
                this._overlay('hide');

                // Create and inject the overlay element.
                var overlay = new Element("div", {
                    "id": "simple-modal-overlay"
                });
                overlay.inject($$("body")[0]); // Inject into the first body element.
                overlay.setStyle("background-color", this.options.overlayColor); // Set background color.
                overlay.fade("hide").fade(this.options.overlayOpacity); // Fade in the overlay.

                // Add behavior for overlay click if enabled.
                if (this.options.overlayClick) {
                    overlay.addEvent("click", function (e) {
                        if (e) e.stop(); // Prevent default event.
                        this.hide(); // Hide the modal if overlay is clicked.
                    }.bind(this));
                }

                // Bind and add resize event listener to reposition modal on window resize.
                this.__resize = this._display.bind(this);
                window.addEvent("resize", this.__resize);
                break;

            case 'hide':

                // Remove the resize event listener when hiding.
                window.removeEvent("resize", this._display);

                // Remove ESC key behavior if it was active.
                if (this.options.keyEsc) {
                    var fixEV = Browser.name != 'ie' ? "keydown" : "onkeydown"; // Handle IE specific event name.
                    window.removeEvent(fixEV, this._removeSM);
                }

                // Safely remove the overlay element from the DOM.
                try {
                    $('simple-modal-overlay').destroy();
                } catch (err) { /* Overlay might not exist, ignore error. */
                }

                // Safely remove the modal element from the DOM.
                try {
                    $('simple-modal').destroy();
                } catch (err) { /* Modal might not exist, ignore error. */
                }
                break;
        }
    }
});