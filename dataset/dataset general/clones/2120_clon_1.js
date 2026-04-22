/*
 *   @authors      A. N. Author
 *   @fileoverview This file manages fullscreen mode and other base functionalities.
 *   @license      MIT License
 */

// Enable full screen mode capabilities across different browsers.
document.cancelFullScreen = document.webkitCancelFullScreen || document.mozCancelFullScreen;




/**
 * @constructor
 * @description Initializes a new SlideDeck instance.
 * @param {HTMLElement} el The container element for the slides, defaults to `slides` tag.
 */
function SlideDeck(el) {

    // Current slide index, 0-based.
    this.curSlide_ = 0;
    // Previous slide index, used for transitions.
    this.prevSlide_ = 0;
    // Configuration object for the presentation.
    this.config_ = null;

    // Main container for all slides.
    this.container = el || document.querySelector('slides');

    // Array of slide elements.
    this.slides = [];

    // Controller for speaker view or remote control.
    this.controller = null;


    // Determine the starting slide from the URL hash.
    this.getCurrentSlideFromHash_();

    // Explicitly call the DOM loaded handler.
    // Modernizr.load might not be finished until after the DOMContentLoaded event.
    this.onDomLoaded_.bind(this)();

} /* End of SlideDeck constructor */


/**
 * @const
 * @private
 * @description CSS classes used to position slides relative to the current one.
 */
SlideDeck.prototype.SLIDE_CLASSES_ = [
    'far-past',
    'past',
    'current',
    'next',
    'far-next'
];



/**
 * @const
 * @private
 * @description Base directory for CSS themes.
 */
SlideDeck.prototype.CSS_DIR_ = 'theme/css/';


/**
 * @private
 * @description Retrieves the current slide number from the URL hash and sets `curSlide_`.
 *              If no valid hash, defaults to the first slide.
 */
SlideDeck.prototype.getCurrentSlideFromHash_ = function() {

    var slideNo = parseInt(document.location.hash.substr(1)); // Extract slide number from hash.

    if (slideNo) {
        this.curSlide_ = slideNo - 1; // Adjust to 0-based index.
    } else {
        this.curSlide_ = 0; // Default to the very first slide.
    }

}; /* End getCurrentSlideFromHash_ */



/**
 * @param {number} slideNo The 1-based index of the slide to load.
 * @description Loads a specific slide by its number.
 */
SlideDeck.prototype.loadSlide = function(slideNo) {
    if (slideNo) {

        this.curSlide_ = slideNo - 1; // Convert to zero-based index.
        this.updateSlides_(); // Update the display of slides.
    }
}; /* End loadSlide */



/**
 * @private
 * @param {Event} e The DOMContentLoaded event object (optional).
 * @description Handler for when the DOM is fully loaded. Initializes slides,
 *              event listeners, and configuration.
 */
SlideDeck.prototype.onDomLoaded_ = function(e) {
    // document.body.classList.add('loaded'); // Add 'loaded' class for templates to use, if needed.

    // Select all visible slides, excluding hidden ones and backdrops.
    this.slides = this.container.querySelectorAll('slide:not([hidden]):not(.backdrop)');


    // Apply special styling for smartphones based on media queries.
    if (Modernizr.mq('only screen and (max-device-width: 480px)')) {
        // Example of dynamically adding a stylesheet for phone-specific styles.
        // var style = document.createElement('link');
        // style.rel = 'stylesheet';
        // style.type = 'text/css';
        // style.href = this.CSS_DIR_ + 'phone.css';
        // document.querySelector('head').appendChild(style);

        // Remove widescreen layout if on a phone.
        this.container.classList.remove('layout-widescreen');
    }

    // Load presentation configuration.
    this.loadConfig_(SLIDE_CONFIG);

    // Set up global event listeners.
    this.addEventListeners_();

    // Update the visual state of the slides.
    this.updateSlides_();


    // Iterate through each slide to add metadata and click handlers.
    var that = this; // Store 'this' for use within the event listener callback.
    for (var i = 0, slide; slide = this.slides[i]; ++i) {

        slide.dataset.slideNum = i + 1; // Store 1-based slide number.
        slide.dataset.totalSlides = this.slides.length; // Store total slide count.

        // Add a click listener to each slide for overview mode navigation.
        slide.addEventListener('click', function(e) {
            // Only respond if in overview mode.
            if (document.body.classList.contains('overview')) {
                that.loadSlide(this.dataset.slideNum); // Load the clicked slide.
                e.preventDefault(); // Prevent default link behavior.
                window.setTimeout(function() {
                    that.toggleOverview(); // Exit overview mode after a short delay.
                }, 500);
            }
        }, false);
    }

    // Initialize the SlideController only if not on a touch device.
    // This needs to happen after addEventListeners_() because it relies on the 'keydown' listener.
    if (!Modernizr.touch) {
        this.controller = new SlideController(this); // Create a new controller instance.
        if (this.controller.isPopup) {
            document.body.classList.add('popup'); // Add 'popup' class if this is the speaker notes window.
        }
    }
}; /* End onDomLoaded_ */



/**
 * @private
 * @description Adds event listeners for keyboard input and browser history changes.
 */
SlideDeck.prototype.addEventListeners_ = function() {
    document.addEventListener('keydown', this.onBodyKeyDown_.bind(this), false); // Keyboard input handler.
    window.addEventListener('popstate', this.onPopState_.bind(this), false); // Browser history change handler.

    // The following code block is commented out in the original, preserving its state.
    // It pertains to handling CSS transition end events for loading iframes.
    /*
    // Define vendor-prefixed transition end event names.
    var transEndEventNames = {
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'msTransition': 'MSTransitionEnd',
      'transition': 'transitionend'
    };

    // Determine the correct transitionEnd event name for the current browser.
    window.transEndEventName = transEndEventNames[
        Modernizr.prefixed('transition')];

    // Attach an event listener to the container to detect when slides finish transitioning.
    // Upon completion, it enables iframes for the current slide.
    // Note: This only considers a single transition on the slide element itself,
    // not potential autobuilds or multiple property transitions.
    this.container.addEventListener(transEndEventName, function(e) {
        this.enableSlideFrames_(this.curSlide_);
    }.bind(this), false);
    */

    // Another commented-out block for 'slideenter' events, potentially for lazy loading.
    /*
    // Listener for a custom 'slideenter' event.
    // This could be used to enable iframes for the current and next slide after a delay.
    document.addEventListener('slideenter', function(e) {
      var slide = e.target; // The slide element that just entered.
      window.setTimeout(function() {
        this.enableSlideFrames_(e.slideNumber); // Enable frames for the current slide.
        this.enableSlideFrames_(e.slideNumber + 1); // And the next slide.
      }.bind(this), 300); // After a 300ms delay.
    }.bind(this), false);
    */

}; /* End addEventListeners_ */



/**
 * @private
 * @param {Event} e The popstate event object from browser history navigation.
 * @description Handles browser history changes, updating the current slide if a state is found.
 */
SlideDeck.prototype.onPopState_ = function(e) {
    if (e.state != null) { // Check if there's a valid state object.
        this.curSlide_ = e.state; // Set the current slide from the history state.
        this.updateSlides_(true); // Update slides, preventing new history entry.
    }
}; /* End onPopState_ */



/**
 * @param {Event} e The keyboard event object.
 * @description Handles keyboard input for navigation and other slide controls.
 */
SlideDeck.prototype.onBodyKeyDown_ = function(e) {

    // Ignore key presses if the event target is an input field or contenteditable element.
    if (
        /^(input|textarea)$/i.test(e.target.nodeName) ||
        e.target.isContentEditable
    ) {
        return;
    }

    // If this instance is a popup (speaker notes), forward keydowns to the main slides.
    if (this.controller && this.controller.isPopup) {
        this.controller.sendMsg({
            keyCode: e.keyCode
        });
    }


    // Handle different key codes for slide navigation and features.
    switch (e.keyCode) {

        case 13: // Enter key
            // If in overview mode, toggle out of it.
            if (document.body.classList.contains('overview')) {
                this.toggleOverview();
            }
            break;

        case 39: // Right arrow key
        case 32: // Spacebar
        case 34: // Page Down key
            this.nextSlide(); // Advance to the next slide or build item.
            e.preventDefault(); // Prevent default browser actions (e.g., scrolling).
            break;

        case 37: // Left arrow key
        case 8: // Backspace key
        case 33: // Page Up key
            this.prevSlide(); // Go to the previous slide or build item.
            e.preventDefault(); // Prevent default browser actions.
            break;

        case 40: // Down arrow key
            this.nextSlide(); // Treat down arrow as next slide.
            e.preventDefault(); // Prevent scrolling.
            break;

        case 38: // Up arrow key
            this.prevSlide(); // Treat up arrow as previous slide.
            e.preventDefault(); // Prevent scrolling.
            break;

        case 72: // 'H' key: Toggle code highlighting.
            document.body.classList.toggle('highlight-code');
            break;

        case 79: // 'O' key: Toggle overview mode.
            this.toggleOverview();
            break;

        case 80: // 'P' key: Toggle speaker notes visibility.
            if (this.controller && this.controller.isPopup) {
                // If this is the popup window, toggle its own notes.
                document.body.classList.toggle('with-notes');
            } else if (this.controller && !this.controller.popup) {
                // If this is the main window and a controller exists (but not a popup), toggle notes.
                document.body.classList.toggle('with-notes');
            }
            break;

        case 82: // 'R' key
            // TODO: Implement refresh logic for main slides when the popup is refreshed.
            break;

        case 27: // Escape key: Hide notes, highlighting, and exit overview mode.
            document.body.classList.remove('with-notes'); // Hide speaker notes.
            document.body.classList.remove('highlight-code'); // Disable code highlighting.

            if (document.body.classList.contains('overview')) {
                this.toggleOverview(); // Exit overview mode if active.
            }
            break;

        case 70: // 'F' key: Toggle fullscreen mode.
            // Only respond if the event target is the document body
            // and it's not a browser's native fullscreen shortcut (e.g., Cmd+Shift+F).
            if (e.target == document.body && !(e.shiftKey && e.metaKey)) {
                // Check for different browser fullscreen APIs.
                if (document.mozFullScreen !== undefined && !document.mozFullScreen) {
                    document.body.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); // Firefox.
                } else if (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen) {
                    document.body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); // Chrome/Safari.
                } else {
                    document.cancelFullScreen(); // Exit fullscreen if already active.
                }
            }
            break;

        case 87: // 'W' key: Toggle widescreen layout.
            // Only respond if the event target is the document body.
            if (e.target == document.body && !(e.shiftKey && e.metaKey)) {
                this.container.classList.toggle('layout-widescreen');
            }
            break;
    }
}; /* End onBodyKeyDown_ */



/**
 * @private
 * @description Applies CSS transforms to position slides for the overview mode.
 */
SlideDeck.prototype.focusOverview_ = function() {

    var overview = document.body.classList.contains('overview'); // Check if overview mode is active.

    // Iterate through all slides and apply appropriate transform styles.
    for (var i = 0, slide; slide = this.slides[i]; i++) {
        slide.style[Modernizr.prefixed('transform')] = overview ?
            'translateZ(-2500px) translate(' + ((i - this.curSlide_) * 105) +
            '%, 0%)' :
            ''; // Reset transform if not in overview.
    }
}; /* End focusOverview_ */



/**
 * @description Toggles the overview mode for the presentation.
 *              In overview, all slides are shown in a grid-like view.
 */
SlideDeck.prototype.toggleOverview = function() {

    document.body.classList.toggle('overview'); // Add or remove the 'overview' class from the body.

    this.focusOverview_(); // Apply the necessary visual transforms.
}; /* End toggleOverview */



/**
 * @private
 * @param {Object} config The configuration object for the slide deck.
 * @description Loads and applies various configuration settings for the presentation,
 *              such as theme, fonts, analytics, and presenter information.
 */
SlideDeck.prototype.loadConfig_ = function(config) {
    if (!config) {
        return; // Exit if no configuration is provided.
    }

    this.config_ = config; // Store the configuration.

    var settings = this.config_.settings; // Extract settings for easier access.


    this.loadTheme_(settings.theme || []); // Load the specified theme(s).

    if (settings.favIcon) {
        this.addFavIcon_(settings.favIcon); // Add a favicon if specified.
    }

    // Initialize Prettyprint if enabled (default is on).
    if (!!!('usePrettify' in settings) || settings.usePrettify) {
        prettyPrint();
    }

    if (settings.analytics) {
        this.loadAnalytics_(); // Load analytics tracking.
    }

    if (settings.fonts) {
        this.addFonts_(settings.fonts); // Add custom fonts.
    }

    // Initialize slide builds if enabled (default is on).
    if (!!!('useBuilds' in settings) || settings.useBuilds) {
        this.makeBuildLists_();
    }

    if (settings.title) {
        // Set document title and update data-config-title element.
        document.title = settings.title.replace(/<br\/?>/, ' ') + ' - Open Web Camp IV ApplicationCache Presentation';
        document.querySelector('[data-config-title]').innerHTML = settings.title;
    }

    if (settings.subtitle) {
        // Update data-config-subtitle element.
        document.querySelector('[data-config-subtitle]').innerHTML = settings.subtitle;
    }

    // Handle presenter information.
    if (this.config_.presenters) {
        var presenters = this.config_.presenters;
        var dataConfigContact = document.querySelector('[data-config-contact]');

        var html = []; // Array to build presenter HTML.
        if (presenters.length == 1) {
            var p = presenters[0]; // Single presenter.

            html = [p.name, p.company].join('<br>'); // Name and company.

            // Construct social links.
            var gplus = p.gplus ? '<span>g+</span><a href="' + p.gplus +
                '">' + p.gplus.replace(/https?:\/\//, '') + '</a>' : '';

            var twitter = p.twitter ? '<span>twitter</span>' +
                '<a href="http://twitter.com/' + p.twitter + '">' +
                p.twitter + '</a>' : '';

            var www = p.www ? '<span>www</span><a href="' + p.www +
                '">' + p.www.replace(/https?:\/\//, '') + '</a>' : '';

            var github = p.github ? '<span>github</span><a href="' + p.github +
                '">' + p.github.replace(/https?:\/\//, '') + '</a>' : '';

            var html2 = [gplus, twitter, www, github].join('<br>'); // Join social links.

            if (dataConfigContact) {
                dataConfigContact.innerHTML = html2; // Update contact info.
            }
        } else {
            // Multiple presenters.
            for (var i = 0, p; p = presenters[i]; ++i) {
                html.push(p.name + ' - ' + p.company); // Add each presenter's info.
            }
            html = html.join('<br>'); // Join with line breaks.
            dataConfigContact.innerHTML = html; // Update contact info.
        }

        var dataConfigPresenter = document.querySelector('[data-config-presenter]');
        if (dataConfigPresenter) {
            document.querySelector('[data-config-presenter]').innerHTML = html; // Update presenter info.
        }
    }

    /* Configure Left/Right tap areas for navigation. Default to including. */
    if (!!!('enableSlideAreas' in settings) || settings.enableSlideAreas) {
        var el = document.createElement('div');
        el.classList.add('slide-area');
        el.id = 'prev-slide-area';
        el.addEventListener('click', this.prevSlide.bind(this), false);
        this.container.appendChild(el);

        var el = document.createElement('div');
        el.classList.add('slide-area');
        el.id = 'next-slide-area';
        el.addEventListener('click', this.nextSlide.bind(this), false);
        this.container.appendChild(el);
    }

    // Enable touch gestures if on a touch device and setting permits.
    if (Modernizr.touch && (!!!('enableTouch' in settings) || settings.enableTouch)) {
        var self = this; // Capture 'this' for use in event handlers.

        // Prevent mobile browser zooming and iOS scroll effects.
        window.addEventListener('touchstart', function(e) {
            e.preventDefault();
        }, false);

        // Initialize Hammer.js for drag gestures.
        var hammer = new Hammer(this.container);
        hammer.ondragend = function(e) {
            if (e.direction == 'right' || e.direction == 'down') {
                self.prevSlide(); // Swipe right/down for previous slide.
            } else if (e.direction == 'left' || e.direction == 'up') {
                self.nextSlide(); // Swipe left/up for next slide.
            }
        };
    }
}; /* End loadConfig_ */



/**
 * @private
 * @param {Array.<string>} fonts An array of font names to load from Google Fonts.
 * @description Dynamically adds Google Fonts to the document head.
 */
SlideDeck.prototype.addFonts_ = function(fonts) {

    var el = document.createElement('link'); // Create a new link element.
    el.rel = 'stylesheet'; // Specify it's a stylesheet.
    // Construct the Google Fonts URL, respecting current protocol.
    el.href = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://fonts.googleapis.com/css?family=' + fonts.join('|') + '&v2';
    document.querySelector('head').appendChild(el); // Append to the document head.
}; /* End addFonts_ */



/**
 * @private
 * @description Advances to the next build item on the current slide.
 *              If no more build items, returns false.
 * @returns {boolean} True if a build item was advanced, false otherwise.
 */
SlideDeck.prototype.buildNextItem_ = function() {
    var slide = this.slides[this.curSlide_]; // Get the current slide.
    var toBuild = slide.querySelector('.to-build'); // Find the next item to build.
    var built = slide.querySelector('.build-current'); // Find the currently built item.

    if (built) {
        built.classList.remove('build-current'); // Remove 'build-current' from the previously built item.
        if (built.classList.contains('fade')) {
            built.classList.add('build-fade'); // Add 'build-fade' if it's a fade-out item.
        }
    }

    if (!toBuild) {
        // If there are no more items to build, clear all 'build-fade' classes.
        var items = slide.querySelectorAll('.build-fade');
        for (var j = 0, item; item = items[j]; j++) {
            item.classList.remove('build-fade');
        }
        return false; // Indicate no more build items.
    }

    toBuild.classList.remove('to-build'); // Mark the item as built.
    toBuild.classList.add('build-current'); // Make it the current built item.

    return true; // Indicate a build item was advanced.
}; /* End buildNextItem_ */



/**
 * @param {boolean=} opt_dontPush Optional: If true, prevents pushing the state to browser history.
 * @description Navigates to the previous slide in the deck.
 */
SlideDeck.prototype.prevSlide = function(opt_dontPush) {

    if (this.curSlide_ > 0) { // Check if not already on the first slide.
        var bodyClassList = document.body.classList;
        bodyClassList.remove('highlight-code'); // Remove code highlighting.

        // Toggle off speaker notes if they're showing and this is the main presentation view.
        // Speaker notes popup should retain them.
        if (this.controller && !this.controller.isPopup) {
            bodyClassList.remove('with-notes');
        } else if (!this.controller) { // If no controller, assume main view.
            bodyClassList.remove('with-notes');
        }

        this.prevSlide_ = this.curSlide_--; // Decrement current slide index and store old value.

        this.updateSlides_(opt_dontPush); // Update the visual display of slides.
    }
}; /* End prevSlide */



/**
 * @param {boolean=} opt_dontPush Optional: If true, prevents pushing the state to browser history.
 * @description Navigates to the next slide in the deck or advances a build item on the current slide.
 */
SlideDeck.prototype.nextSlide = function(opt_dontPush) {

    // If not in overview mode and there are build items, advance the next build item.
    if (!document.body.classList.contains('overview') && this.buildNextItem_()) {
        return; // If a build item was advanced, do not change slides.
    }

    if (this.curSlide_ < this.slides.length - 1) { // Check if not already on the last slide.
        var bodyClassList = document.body.classList;
        bodyClassList.remove('highlight-code'); // Remove code highlighting.

        // Toggle off speaker notes if they're showing and this is the main presentation view.
        // Speaker notes popup should retain them.
        if (this.controller && !this.controller.isPopup) {
            bodyClassList.remove('with-notes');
        } else if (!this.controller) { // If no controller, assume main view.
            bodyClassList.remove('with-notes');
        }

        this.prevSlide_ = this.curSlide_++; // Increment current slide index and store old value.

        this.updateSlides_(opt_dontPush); // Update the visual display of slides.
    }
}; /* End nextSlide */


/* Slide event dispatching utility */


/**
 * @private
 * @description Utility function to dispatch custom 'slideenter' and 'slideleave' events.
 * @param {string} type The type of event to trigger (e.g., 'slideenter', 'slideleave').
 * @param {number} slideNo The 0-based index of the slide that is triggering the event.
 */
// The actual implementation of dispatching these events is missing in the provided code,
// but the JSDoc for it is present. This comment block maintains the structure.
// This function would typically be called from `updateSlides_`.