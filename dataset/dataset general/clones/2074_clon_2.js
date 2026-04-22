var ScrollMagnifier = function(configuration)
{
    // Ensure the configuration object is properly initialized.
    configuration = configuration || {};

    // Store references to key DOM elements from the configuration.
    this.primaryDisplayElement = configuration.primaryDisplayElement;
    this.visualBackdrop = configuration.visualBackdrop;
    this.visualBackdropImage = configuration.visualBackdropImage;

    // Detect if the user agent string indicates an iOS device.
    this.isAppleMobile = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );

    // Pre-bind all event handler methods to the current instance's context.
    this.heartbeatBound = this.sendHeartbeat.bind(this);
    this.offsetSetterBound = this.setScrollPosition.bind(this);
    this.offsetAdjusterBound = this.adjustScrollPosition.bind(this);
    this.effectEnablerBound = this.activateVisualEffect.bind(this);
    this.finalUpdaterBound = this.performFinalUpdate.bind(this);

    // Initialize the custom scroller for non-iOS platforms, or set up native events for iOS.
    if ( !this.isAppleMobile )
    {
        this.customScrollerInstance = new CustomScroller(this.primaryDisplayElement);
    }
    else
    {
        this.adjustScrollPosition();
        this.setupDOMHandlers();
    }
    // Always attach the heartbeat-related event listeners.
    this.setupHeartbeatHandlers();
};


ScrollMagnifier.prototype.setupDOMHandlers = function()
{
    // Prevent event propagation for touchmove events on the primary display.
    this.primaryDisplayElement.addEventListener('touchmove', function(eventObject)
    {
        eventObject.stopPropagation();
    }, false);

    // Attach the scroll position setter to the scroll event of the main element.
    this.primaryDisplayElement.addEventListener('scroll', this.offsetSetterBound, false);
    
    // Globally prevent default touchmove actions on the entire document.
    document.addEventListener('touchmove', function(eventObject)
    {
        eventObject.preventDefault();
    }, false);
};


ScrollMagnifier.prototype.setupHeartbeatHandlers = function()
{
    // Configure touch event listeners for activating and deactivating the visual effect.
    this.primaryDisplayElement.addEventListener('touchstart', this.effectEnablerBound, false);
    this.primaryDisplayElement.addEventListener('touchend', this.finalUpdaterBound, false);
    this.primaryDisplayElement.addEventListener('touchcancel', this.finalUpdaterBound, false);
};


ScrollMagnifier.prototype.setScrollPosition = function()
{
    // Defer the actual scroll adjustment to the next available event loop cycle.
    setTimeout(this.offsetAdjusterBound, 0);
};


ScrollMagnifier.prototype.adjustScrollPosition = function()
{
    // If the element is scrolled to the very top, slightly offset it to enable bounce effect.
    if ( this.primaryDisplayElement.scrollTop === 0 )
    {
        this.primaryDisplayElement.scrollTop = 1;
    }
};


ScrollMagnifier.prototype.sendHeartbeat = function()
{
    // Request a browser animation frame for continuous updates.
    webkitRequestAnimationFrame(this.heartbeatBound);
    // Trigger a visual update.
    this.updateVisuals();
};


ScrollMagnifier.prototype.activateVisualEffect = function()
{
    // Set a flag to indicate that the visual effect should be active.
    this.isEffectCurrentlyActive = true;
};


ScrollMagnifier.prototype.performFinalUpdate = function()
{
    // Execute a final visual update, potentially forcing a specific scroll value.
    this.updateVisuals({ forcedVerticalOffset: 1 });
    // Deactivate the visual effect after the final update.
    this.isEffectCurrentlyActive = false;
};


ScrollMagnifier.prototype.updateVisuals = function(displayOptions)
{
    // Initialize display options, if not provided.
    displayOptions = displayOptions || {};

    // Proceed only if the visual effect is currently enabled.
    if ( this.isEffectCurrentlyActive )
    {
        // Determine the current vertical scroll offset.
        // It can be forced, from a custom scroller, or the native scroll position.
        var verticalOffset = displayOptions.forcedVerticalOffset || ( this.customScrollerInstance ? this.customScrollerInstance.yCoord * -1 : this.primaryDisplayElement.scrollTop );
        
        var zoomFactor = 1; // Default scaling factor.
        var shiftFactor = 0; // Default translation factor.
        var transformCSS = "-webkit-transform 0.5s"; // Default CSS transition property.

        // Apply dynamic scaling and translation if the scroll position is negative (pulled beyond top).
        if ( verticalOffset < 0 )
        {
            zoomFactor = ( verticalOffset * -0.005 ) + 1;
            shiftFactor = Math.ceil( verticalOffset * 1.1 );
            transformCSS = "-webkit-transform 0.1s linear"; // Faster transition for active pull.
        }

        // Apply the calculated CSS transitions and transformations to the background image's style.
        this.visualBackdropImage.style.webkitTransition = transformCSS;
        this.visualBackdropImage.style.webkitTransform = "translateZ(0) translateY(" + shiftFactor + "px) scale(" + zoomFactor + ")";
    }
};