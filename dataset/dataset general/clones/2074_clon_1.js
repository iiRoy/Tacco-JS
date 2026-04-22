var pullAndZoom=function(   opts   )
{

  // Initialize options, defaulting to an empty object if none provided.
  opts = opts || {};
  // Assign main page element from options.
  this.mainPage = opts.mainPage;
  // Assign background element.
  this.background = opts.background;
  // Assign background image element.
  this.backgroundImage = opts.backgroundImage;

  // Check if the user agent indicates an iOS device (iPad, iPhone, iPod).
  this.isIos = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );

  // Bind 'this' context to various methods for event listeners or callbacks.
  this.pingBinded = this.ping.bind(this);
  this.setScrollBinded = this.setScroll.bind(this);
  this.adjustScrollBinded = this.adjustScroll.bind(this);
  this.enableEffectBinded = this.enableEffect.bind(this);
  this.lastRefreshBinded = this.lastRefresh.bind(this); // Another binded method.

  /*
   * Conditional initialization based on device type.
   * If not an iOS device, initialize iScroll.
   * Otherwise, set up scroll adjustment and event listeners.
   */
  if (  !this.isIos  )
  {
    this.iScroll = new IScroll(this.mainPage);
  }
  else
  {
    this.adjustScroll(); // Adjust scroll position for iOS.
    this.events();       // Attach relevant events for iOS.
  }
  // Always set up ping-related events.
  this.pingEvents();
};

/*
 * Prototype methods for the pullAndZoom functionality.
 * These methods extend the functionality of the pullAndZoom object.
 */
pullAndZoom.prototype.events = function()
{

  // Prevent default touchmove behavior on the main page to avoid conflicts.
  this.mainPage.addEventListener('touchmove', function(e)
  {
    e.stopPropagation(); // Stop event propagation.
  }, false);


  // Listen for scroll events on the main page, binding 'this' context.
  this.mainPage.addEventListener( 'scroll' , this.setScrollBinded , false );

  // Prevent default touchmove behavior on the document level.
  document.addEventListener('touchmove', function(e)
  {
    e.preventDefault(); // Prevent default browser scroll/zoom.
  }, false);
};

pullAndZoom.prototype.pingEvents = function()
{
  // Attach touch start event to enable the visual effect.
  this.mainPage.addEventListener('touchstart', this.enableEffectBinded, false);
  // Attach touchend event to trigger a last refresh.
  this.mainPage.addEventListener('touchend', this.lastRefreshBinded, false);
  // Attach touchcancel event as well, in case touch ends unexpectedly.
  this.mainPage.addEventListener('touchcancel', this.lastRefreshBinded, false);
}

pullAndZoom.prototype.setScroll = function()
{
  // Schedule scroll adjustment using setTimeout to ensure it runs after current event cycle.
  setTimeout(this.adjustScrollBinded, 0);
};

pullAndZoom.prototype.adjustScroll = function()
{
  // If the scroll position is at the very top, push it down by 1 pixel.
  // This is often a workaround for iOS scroll issues.
  if ( this.mainPage.scrollTop === 0 )
  {
    this.mainPage.scrollTop = 1;
  }
};

pullAndZoom.prototype.ping = function()
{
  // Use webkitRequestAnimationFrame for smooth animation frame updates.
  webkitRequestAnimationFrame(this.pingBinded);
  // Call the refresh method to update the visual state.
  this.refresh();
};

pullAndZoom.prototype.enableEffect = function()
{
  // Set a flag to indicate that the visual pull-to-refresh effect should be active.
  this.doEffect = true;
};

pullAndZoom.prototype.lastRefresh = function()
{
  // Perform a refresh, potentially forcing the scroll top to 1.
  this.refresh({forcedScrollTop: 1});
  // Disable the effect after the last refresh.
  this.doEffect = false;
};

pullAndZoom.prototype.refresh = function( opts )
{
  // Ensure options object exists.
  opts = opts || {};
  // Only apply the effect if the 'doEffect' flag is set.
  if (  this.doEffect  )
  {
    // Determine the current scroll position.
    // If forcedScrollTop is provided, use it.
    // Otherwise, use iScroll's y position (inverted) or mainPage's scrollTop.
    var scrollTop = opts.forcedScrollTop || (this.iScroll ? this.iScroll.y * -1 : this.mainPage.scrollTop);
    var scaleFactor = 1;      // Initial scale factor.
    var translateFactor = 0;  // Initial translate factor.
    var transition = "-webkit-transform 0.5s"; // Default transition.

    // If scrolled beyond the top (negative scrollTop), calculate scale and translate.
    if (  scrollTop < 0  )
    {
      scaleFactor = (scrollTop * -0.005) + 1; // Increase scale as user pulls down.
      translateFactor = Math.ceil(scrollTop * 1.1); // Translate further down.
      transition = "-webkit-transform 0.1s linear"; // Faster transition for active pull.
    }

    // Apply the calculated transition to the background image.
    this.backgroundImage.style.webkitTransition = transition;
    // Apply the calculated transform (translate and scale) to create the pull effect.
    this.backgroundImage.style.webkitTransform = "translateZ(0) translateY(" + translateFactor + "px) scale(" + scaleFactor + ")";
  }
};