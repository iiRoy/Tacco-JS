// This script enables dynamic, auto-scrolling content within a specified container.

;(function ( jq, win, doc ) { // Renamed jQuery to jq for variation
	
    // Internal identifier for the plugin
    var pluginIdentifier = "dynamicContentScroller";

    // Default configuration settings for the scroller instance
    var standardSettings = {
        scrollDirection: 'up',        // 'up' or 'down'
        animationEasing: 'swing',     // jQuery easing function name
        animationSpeed: 'slow',       // 'slow', 'fast', or a number in milliseconds
        scrollInterval: 2000,         // Time between scrolls in milliseconds
        containerHeight: 'auto',      // 'auto' or a fixed height (e.g., '200px')
        visibleItemsCount: 0,         // Number of items to show if height is 'auto' (0 for all)
        pauseOnHover: true,           // Pause scrolling when mouse is over the container
        controls: {
            upButton: null,           // Selector for the 'scroll up' button (e.g., '#myUpBtn')
            downButton: null,         // Selector for the 'scroll down' button
            toggleButton: null,       // Selector for the 'play/pause' button
            playLabel: 'Resume',      // Text for the toggle button when paused
            stopLabel: 'Pause'        // Text for the toggle button when playing
        },
        restartOnManualControl: false, // Should auto-scrolling resume after a manual button press?
        debugMode: false              // Enable console logging for debugging
    };

    /**
     * @class DynamicContentScroller
     * @param {HTMLElement} elementRef - The DOM element to initialize the scroller on.
     * @param {Object} userConfig - User-defined options to override standardSettings.
     */
    function DynamicContentScroller( elementRef, userConfig ) {
		
		var self = this; // Using 'self' for internal instance reference
		
        // Merge default and user-provided configurations deeply
        self.configuration = jq.extend( true, {}, standardSettings, userConfig ); 
        
        // Store references to key DOM elements, ensuring they are jQuery objects
        self.rootElement = jq(elementRef); // The main container element
        self.viewportContent = self.rootElement.children(':first-child'); // The immediate child holding the scrollable items
        
        // Internal state variables for managing plugin behavior
        self.scrollTimerId = null; // Stores the ID of the setInterval timer for auto-scrolling
        self.wasRunningBeforeHover = false; // Flag to track if scrolling was active before a mouse hover event
        self.isWindowActive = true; // Tracks if the browser window currently has focus
        self.isScrollingActive = false; // Explicitly tracks the active state of auto-scrolling

        // Initial setup routines
        this.initializePlugin();
        this.beginAutoScroll(); // Start the automatic scrolling right away

        // Global event listeners for window focus/blur events
        jq(win).off('focus.scroller').on('focus.scroller', function(){
            self.isWindowActive = true;
            // If auto-scrolling was active and stopped due to window blur, resume it
            if (self.isScrollingActive && self.scrollTimerId === null) {
                self.beginAutoScroll(); 
            }
        }).off('blur.scroller').on('blur.scroller', function(){
            self.isWindowActive = false;
            // Temporarily pause if window loses focus, but keep isScrollingActive state
            if (self.scrollTimerId !== null) {
                self.haltAutoScroll(true); // Pause but don't change the `isScrollingActive` state
            }
        });
		
        // Mouse interaction for pausing on hover, if enabled in configuration
        if( self.configuration.pauseOnHover === true ){
            self.rootElement.on('mouseenter.scroller', function(){
                if (self.isScrollingActive) { // Only record if it was actively scrolling
                    self.wasRunningBeforeHover = true;
                    self.haltAutoScroll(false); // Pause, and update isScrollingActive to false
                } else {
                    self.wasRunningBeforeHover = false; // It wasn't running, so no need to restart
                }
            }).on('mouseleave.scroller', function(){
                if( self.wasRunningBeforeHover === true ) {
                    self.beginAutoScroll(); // Resume if it was active before hover
                }
            });
        }
		
        // Bind control button events as defined in the configuration
        self.bindControlButtons();

    } // End of DynamicContentScroller Constructor

    /**
     * Binds click handlers to the control buttons specified in the configuration.
     * This method is called once during plugin initialization.
     * @private
     */
    DynamicContentScroller.prototype.bindControlButtons = function() {
        var self = this;
        var ctrl = self.configuration.controls;

        // Basic validation for controls object
        if (!ctrl || typeof ctrl !== 'object') {
            if (self.configuration.debugMode) console.warn("Scroller controls configuration is invalid.");
            return;
        }

        // Bind Scroll Up control
        if (ctrl.upButton && jq(ctrl.upButton).length) {
            jq(ctrl.upButton).on('click.scroller', function(event){
                event.preventDefault(); // Prevent default button action
                self.initiateDirectionalShift('up');
            });
        } else if (self.configuration.debugMode) {
             console.log("Up button selector not found or invalid:", ctrl.upButton);
        }

        // Bind Scroll Down control
        if (ctrl.downButton && jq(ctrl.downButton).length) {
            jq(ctrl.downButton).on('click.scroller', function(event){
                event.preventDefault();
                self.initiateDirectionalShift('down');
            });
        } else if (self.configuration.debugMode) {
            console.log("Down button selector not found or invalid:", ctrl.downButton);
        }

        // Bind Play/Pause toggle control
        if (ctrl.toggleButton && jq(ctrl.toggleButton).length) {
            jq(ctrl.toggleButton).on('click.scroller', function(event){
                event.preventDefault();
                if( self.isScrollingActive ) { // Check explicit state
                    self.haltAutoScroll(false); // Pause and update state
                } else {
                    self.beginAutoScroll(); // Start
                }
            });
            // Update the button's initial visual state
            self.updateToggleButtonState();
        } else if (self.configuration.debugMode) {
            console.log("Toggle button selector not found or invalid:", ctrl.toggleButton);
        }
    };

    /**
     * Initializes the plugin's DOM elements and applies essential styles.
     * @private
     */
    DynamicContentScroller.prototype.initializePlugin = function(){
        var self = this;

        // Guard clause: ensure root element is valid before proceeding
        if (!self.rootElement || self.rootElement.length === 0) {
            console.error("DynamicContentScroller: Root element not found or invalid. Initialization aborted.");
            return;
        }
        
        // Remove any default margins from direct children and their immediate children.
        // This helps ensure consistent positioning for scrolling.
        self.rootElement.find('> *').css('margin', 0);
        self.rootElement.find('> * > *').css('margin', 0); // Apply to grandchildren as well

        // Apply necessary CSS properties to the main container
        self.rootElement.css({
            position : 'relative', // Essential for absolute positioning of viewportContent
            height: self.configuration.containerHeight, // Set initial height
            overflow : 'hidden' // Hide any content that overflows the container boundaries
        });
        
        // Apply necessary CSS properties to the content wrapper, which holds the scrollable items
        self.viewportContent.css({
            'position' : 'absolute', // Allows movement via 'top' property during animation
            'margin' : 0, // Ensure no external margins interfere with positioning
            'width': '100%' // Ensure content takes full available width
        });

        // Perform an initial height adjustment without animation to set up correctly
        self.synchronizeContainerHeight(false);
    };

    /**
     * Starts the automatic content scrolling interval.
     * @private
     */
    DynamicContentScroller.prototype.beginAutoScroll = function(){
        var self = this;

        // Guard: Prevent starting if the scroller is already active
        if (self.scrollTimerId !== null) {
            if (self.configuration.debugMode) console.log("Scroller already active, ignoring start request.");
            return;
        }
        
        // Set up the interval timer to periodically shift content
        self.scrollTimerId = setInterval(function(){
            // Only scroll if the browser window is currently active (in focus)
            if( self.isWindowActive === true ){
                self.shiftContent( self.configuration.scrollDirection );
            }
        }, self.configuration.scrollInterval);

        self.isScrollingActive = true; // Update the explicit scrolling state
        self.updateToggleButtonState(); // Update the UI of the toggle button
        
        if (self.configuration.debugMode) console.log("Auto-scrolling commenced.");
    };

    /**
     * Halts the automatic content scrolling by clearing the interval timer.
     * @param {boolean} [preserveActiveState=false] - If true, keeps `isScrollingActive` as true (e.g., for window blur events).
     * @private
     */
    DynamicContentScroller.prototype.haltAutoScroll = function( preserveActiveState ){
        var self = this;

        // Guard: Prevent stopping if the scroller is already inactive
        if( self.scrollTimerId === null ) {
            if (self.configuration.debugMode) console.log("Scroller already inactive, ignoring stop request.");
            return;
        }

        clearInterval( self.scrollTimerId ); // Clear the interval timer
        self.scrollTimerId = null; // Reset the timer ID
        
        // Update the `isScrollingActive` state unless explicitly told to preserve it
        if (preserveActiveState !== true) { 
            self.isScrollingActive = false;
        }
        self.updateToggleButtonState(); // Update the UI of the toggle button

        if (self.configuration.debugMode) console.log("Auto-scrolling halted.");
    };
    
    /**
     * Updates the text and CSS class of the toggle button based on the current scrolling state.
     * @private
     */
    DynamicContentScroller.prototype.updateToggleButtonState = function() {
        var self = this;
        var toggleBtn = jq(self.configuration.controls.toggleButton);
        if (toggleBtn.length === 0) return; // Exit if no toggle button is defined or found

        if (self.isScrollingActive) {
            // Scroller is running: show 'Pause' label and 'et-running' class
            toggleBtn.removeClass('et-paused').addClass('et-running').html(self.configuration.controls.stopLabel);
        } else {
            // Scroller is paused: show 'Resume' label and 'et-paused' class
            toggleBtn.removeClass('et-running').addClass('et-paused').html(self.configuration.controls.playLabel);
        }
    };


    /**
     * Performs a single shift of content within the scroller, moving one item.
     * @param {string} scrollDirection - 'up' or 'down'.
     * @private
     */
    DynamicContentScroller.prototype.shiftContent = function( scrollDirection ){
        var self = this;
        var childSelector, positionOperator, contentAppendMethod;

        // Guard: Ensure the container is visible before attempting to scroll
        if( !self.rootElement.is(':visible') ) {
            if (self.configuration.debugMode) console.log("Scroller container not visible, skipping content shift.");
            return;
        }

        // Determine the child element to move and the animation parameters based on the desired direction
        if( scrollDirection === 'up' ){
            childSelector = ':first-child';      // Select the top-most item
            positionOperator = '-=';             // Animate upwards (negative top offset)
            contentAppendMethod = 'appendTo';    // Move to the end of the list
        } else if ( scrollDirection === 'down' ){
            childSelector = ':last-child';       // Select the bottom-most item
            positionOperator = '+=';             // Animate downwards (positive top offset)
            contentAppendMethod = 'prependTo';   // Move to the beginning of the list
        } else {
            // Log a warning for an invalid direction and exit
            if (self.configuration.debugMode) console.warn("Invalid scroll direction provided:", scrollDirection);
            return; 
        }
        
        var targetChildElement = self.viewportContent.children(childSelector);
        if (targetChildElement.length === 0) {
            // Log if no items are found to scroll
            if (self.configuration.debugMode) console.log("No child elements to scroll in direction:", scrollDirection);
            return; 
        }

        // Calculate the full height of the element that will be moved, including margins
        var itemHeight = targetChildElement.outerHeight(true); 

        // Stop any ongoing animations on the content wrapper before starting a new one
        // (true, true) clears queue and jumps to end of current animation
        self.viewportContent.stop(true, true).animate({
            'top': positionOperator + itemHeight + "px" // Animate the 'top' property
        }, self.configuration.animationSpeed, self.configuration.animationEasing, function(){
            // This callback executes once the animation is complete:
            
            // 1. Hide the element instantly before repositioning to prevent visual flicker
            targetChildElement.css('display', 'none'); 
            
            // 2. Move the element to the opposite end of the content wrapper
            targetChildElement[contentAppendMethod]( self.viewportContent );
            
            // 3. Immediately reset the 'top' position of the content wrapper to 0
            // This prepares it for the next animation cycle
            self.viewportContent.css('top', 0);
            
            // 4. Reveal the moved element with a fade-in effect for a smoother transition
            targetChildElement.fadeIn(self.configuration.animationSpeed / 2); // Use a faster fade-in

            // 5. Re-adjust the container height if it's set to 'auto'
            self.synchronizeContainerHeight(true); // Animate height change if applicable
        });
    };

    /**
     * Initiates a manual directional content shift (up or down) triggered by a control.
     * @param {string} desiredDirection - 'up' or 'down'.
     * @private
     */
    DynamicContentScroller.prototype.initiateDirectionalShift = function( desiredDirection ){
        var self = this;
        
        self.haltAutoScroll(false); // Stop auto-scrolling immediately and update state
        self.shiftContent(desiredDirection); // Perform the manual shift

        // If configured, restart auto-scrolling after a brief delay
        if (self.configuration.restartOnManualControl) {
            setTimeout(function() {
                self.beginAutoScroll();
            }, self.configuration.scrollInterval / 2); // Resume quickly after a short pause
        }
    };

    /**
     * Calculates the full height of all content items combined.
     * This is used when `containerHeight` is 'auto' and `visibleItemsCount` is 0,
     * meaning the container should expand to show all content.
     * @private
     */
    DynamicContentScroller.prototype.calculateTotalHeight = function(){
        var self = this;
        var totalCalculatedHeight = 0;
        var originalDisplaySetting = self.rootElement.css('display'); // Preserve original display style

        // Temporarily set display to 'block' to ensure accurate height calculation
        // (hidden elements might report 0 height)
        self.rootElement.css('display', 'block');
                
        // Iterate through all children of the viewport and sum their outer heights (including margins)
        self.viewportContent.children().each(function(){
            totalCalculatedHeight += jq(this).outerHeight(true);
        });
    
        // Restore original display style and apply the newly calculated total height
        self.rootElement.css({
            'display' : originalDisplaySetting,
            'height' : totalCalculatedHeight
        });

        if (self.configuration.debugMode) console.log("Calculated total height:", totalCalculatedHeight);
    };

    /**
     * Adjusts the container height to fit a specified number of visible items.
     * This is used when `containerHeight` is 'auto' and `visibleItemsCount` is greater than 0.
     * @param {boolean} shouldAnimate - True to animate the height change, false for instant application.
     * @private
     */
    DynamicContentScroller.prototype.adjustVisibleHeight = function( shouldAnimate ){
        var self = this;
        var calculatedWrapperHeight = 0;
        
        // Sum the outer heights of the first `visibleItemsCount` children
        self.viewportContent.children().slice(0, self.configuration.visibleItemsCount).each(function(){
            calculatedWrapperHeight += jq(this).outerHeight(true);
        });
        
        // Apply the calculated height to the root element, with or without animation
        if( shouldAnimate === true ){
            self.rootElement.stop(true, true).animate({height: calculatedWrapperHeight}, self.configuration.animationSpeed);
        }else{
            self.rootElement.css( 'height', calculatedWrapperHeight);
        }

        if (self.configuration.debugMode) console.log("Adjusted visible height to:", calculatedWrapperHeight);
    };

    /**
     * Determines and applies the correct height to the main container based on configuration.
     * This function acts as a central dispatcher for all height adjustment logic.
     * @param {boolean} animateHeightChange - True to animate the height change, false for instant application.
     * @private
     */
    DynamicContentScroller.prototype.synchronizeContainerHeight = function( animateHeightChange ){
        var self = this;

        // Only proceed if the container height is set to 'auto'
        if (self.configuration.containerHeight === 'auto') {
            if (self.configuration.visibleItemsCount > 0) {
                // If a specific number of items should be visible, adjust to that height
                self.adjustVisibleHeight(animateHeightChange);
            } else {
                // If all items should be visible, calculate and apply the full height
                self.calculateTotalHeight();
            }
        }
        // If `containerHeight` is a fixed value (e.g., '200px'), no dynamic adjustment is needed here.
    };
    
    // Public API methods exposed by the plugin instance for external interaction
    DynamicContentScroller.prototype.api = {
        /** Scrolls the content upwards by one item. */
        scrollUp: function(){ this.initiateDirectionalShift('up'); },
        /** Scrolls the content downwards by one item. */
        scrollDown: function(){ this.initiateDirectionalShift('down'); },
        /** Begins or resumes the automatic content scrolling. */
        startScrolling: function(){ this.beginAutoScroll(); },
        /** Halts the automatic content scrolling. */
        stopScrolling: function(){ this.haltAutoScroll(false); },
        /** Retrieves the current configuration settings of the scroller instance. */
        getSettings: function(){ return this.configuration; },
        /** 
         * Refreshes the container's height calculation, useful if content changes dynamically.
         * @param {boolean} animate - If true, the height change will be animated.
         */
        refreshHeight: function(animate){ this.synchronizeContainerHeight(animate || false); }
    };

    // Attach the DynamicContentScroller object as a jQuery plugin
    jq.fn[pluginIdentifier] = function ( userConfig ) {
        return this.each(function () {
            // Prevent multiple initializations on the same DOM element
            if (!jq.data(this, pluginIdentifier)) {
                // Create a new instance of the scroller
                var instance = new DynamicContentScroller( this, userConfig );
                // Store the public API of the instance in jQuery's data cache
                jq.data(this, pluginIdentifier, instance.api); 
            }
        });
    };

})( jQuery, window, document );