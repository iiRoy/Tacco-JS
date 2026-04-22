var CarouselPanel = function(displayArea, config){
  // Configuration options for the carousel instance.
  this.config = _jq.extend({
    initialItem:        0,                     /* the starting visible item on setup */
    itemsPerPage:       1,                     // how many items are visible at once
    orientationVertical:false,              // defines if layout is horizontal or vertical
    dragThreshold:      0.5,                // drag distance (0-1) required to trigger a slide change
    transitionDuration: 0.3,                   // animation speed in seconds
    animationCurve:     'ease-out',           // easing function for transitions
    autoAdvance:        false,              // false, or time in seconds to start auto-advancing
    enableHardwareAccel:true,
    dotPaging:          'link',     // enables dot navigation: false, true, or 'link' (adds event handlers)
    arrowControls:      false, // adds previous and next navigation links
    onBeforeShift:      null,
    onAfterShift:       null                // callback after a slide transition completes
  }, config);

  this.isOrientedVertically  = !!this.config.orientationVertical;
  this.displayArea           = _jq(displayArea).addClass('ui-carousel-panel').addClass('ui-carousel-panel-'+(this.isOrientedVertically ? 'vertical' : 'horizontal'));
  this.contentStrip          = this.displayArea.children().first().addClass('ui-carousel-panel-strip');
  this.contentItems          = this.contentStrip.children().addClass('ui-carousel-panel-item');
  this.totalViewports        = Math.ceil(this.contentItems.length / this.config.itemsPerPage);
  this.currentViewport       = this.constrainViewportIndex(this.config.initialItem);
  this.inputState            = {};
  this.supportsTouch         = 'ontouchstart' in document.documentElement;
  this.interactionEvents     = {
    inputDown: this.supportsTouch ? 'touchstart' : 'mousedown',
    inputDrag: this.supportsTouch ? 'touchmove'  : 'mousemove',
    inputUp:   this.supportsTouch ? 'touchend touchcancel touchleave' : 'mouseup mouseout mouseleave',
    inputTap:  this.supportsTouch ? 'touchend' : 'click'
  };
  this.initializeDisplay();
  this.attachListeners();
  if (this.config.arrowControls) this.configureArrowControls();
  if (this.config.dotPaging) this.configureDotPaging();
  if (this.config.autoAdvance) this.autoAdvance();
};

CarouselPanel.prototype = {
  // Public methods for controlling the carousel
  navigateToViewport: function(targetIndex) {
    this.haltAutoAdvance();
    var nextViewport = this.constrainViewportIndex(targetIndex), completionCallback;
    // Set callback if a viewport change actually occurs
    if (this.currentViewport !== nextViewport) {
      if(_jq.isFunction(this.config.onBeforeShift)) this.config.onBeforeShift(this, this.currentViewport, nextViewport);
      this.currentViewport = nextViewport;
      completionCallback   = _jq.proxy(this.onTransitionComplete, this);
    } else if (this.config.autoAdvance){
      completionCallback   = _jq.proxy(this.autoAdvance, this);
    }
    this.animateContent(0, this.config.transitionDuration, completionCallback);
    if (this.config.dotPaging) this.highlightCurrentDot();
  },

  toBeginning:     function(){ this.navigateToViewport(0); },
  toNext:          function(){ this.navigateToViewport(this.currentViewport+1); },
  toPrevious:      function(){ this.navigateToViewport(this.currentViewport-1); },
  toEnd:           function(){ this.navigateToViewport(this.totalViewports-1); },
  atBeginning:     function(){ return this.currentViewport === 0; },
  atEnd:           function(){ return this.currentViewport === this.totalViewports-1; },
  constrainViewportIndex: function(num){ return Math.max(Math.min(num, this.totalViewports-1), 0); },

  autoAdvance:  function(){
    // Prevents multiple timers from running
    if (this.advanceTimer) return false;
    var advanceFunction = this.atEnd() ? this.toBeginning : this.toNext;
    this.advanceTimer = setTimeout(_jq.proxy(advanceFunction, this), this.config.autoAdvance * 1000);
  },

  haltAutoAdvance:  function(){
    clearTimeout(this.advanceTimer);
    delete this.advanceTimer;
  },

  getVisibleItems: function(){
    return this.contentItems.slice(this.currentViewport, this.currentViewport+this.config.itemsPerPage);
  },

  // Private helper methods
  animateContent: function(coordOffset, timeDuration, completeHandler) {
    this.contentStrip.animate(this.getAnimationProps(coordOffset), { duration: timeDuration * 1000, easing: this.config.animationCurve, complete: completeHandler });
  },

  getAnimationProps: function(coordOffset) {
    var renderPosition = -this.currentViewport * this.viewportDimension + coordOffset + 'px', styleProps = {};
    if (this.config.enableHardwareAccel) {
      styleProps['transform3d'] = (this.isOrientedVertically ? '0,'+renderPosition : renderPosition+',0') + ',0';
    } else {
      styleProps[this.isOrientedVertically ? 'moveY' : 'moveX'] = renderPosition;
    }
    return styleProps;
  },

  initializeDisplay: function(){
    var dimensionMethod = this.isOrientedVertically ? 'height' : 'width';
    this.viewportDimension = this.displayArea[dimensionMethod]();
    this.dragThreshold     = this.config.dragThreshold * this.viewportDimension / 2;
    // Set the appropriate dimension (height or width) for the content strip and individual items
    this.contentStrip[dimensionMethod](this.viewportDimension * this.totalViewports + 'px');
    this.contentItems[dimensionMethod](this.viewportDimension / this.config.itemsPerPage + 'px');
    // Move to the initial item without animation
    this.animateContent(0,0);
  },

  attachListeners: function(){
    // Bind listeners for touch/mouse movement
    this.contentStrip
      .on(this.interactionEvents.inputDown, _jq.proxy(this.captureInputStart, this))
      .on(this.interactionEvents.inputDrag, _jq.proxy(this.captureInputMove, this))
      .on(this.interactionEvents.inputUp,   _jq.proxy(this.captureInputEnd, this));

    // Bind listeners to any elements with specific classes for navigation
    this.displayArea
      .on(this.interactionEvents.inputTap, '.next',  _jq.proxy(this.toNext,  this))
      .on(this.interactionEvents.inputTap, '.prev',  _jq.proxy(this.toPrevious,  this))
      .on(this.interactionEvents.inputTap, '.first', _jq.proxy(this.toBeginning, this))
      .on(this.interactionEvents.inputTap, '.last',  _jq.proxy(this.toEnd,  this));

    // Recalculate dimensions on window resize or orientation change
    _jq(window).on('resize', _jq.proxy(this.initializeDisplay, this));
  },

  captureInputStart: function(eventData){
    this.inputState.start = this.captureInputCoords(eventData);
    delete this.isScrolling;
    if (!this.supportsTouch) return false; // Prevent default for mouse events
  },

  captureInputMove: function(eventData){
    if (!this.inputState.start) return;
    this.inputState.end = this.captureInputCoords(eventData);
    var inputDistance   = this.calcInputDistance(this.isOrientedVertically);
    if (typeof this.isScrolling === 'undefined') {
      // Determine if the user is scrolling or dragging the carousel
      this.isScrolling = Math.abs(inputDistance) < Math.abs(this.calcInputDistance(!this.isOrientedVertically));
    }
    if (!this.isScrolling) {
      this.haltAutoAdvance();
      this.animateContent(this.applyResistance(inputDistance), 0);
      return false; // Prevent default scrolling
    }
  },

  captureInputEnd: function(eventData){
    if (!this.isScrolling) {
      var inputDistance = this.calcInputDistance(this.isOrientedVertically), offsetValue = 0;
      if (Math.abs(inputDistance) > this.dragThreshold) offsetValue = inputDistance < 0 ? 1 : -1;
      this.navigateToViewport(this.currentViewport + offsetValue);
    }
    this.inputState = {}; // Reset input state
    return false; // Prevent default actions
  },

  captureInputCoords: function(eventData) {
    var eventObj = this.supportsTouch ? eventData.touches[0] : eventData;
    return { x: eventObj.pageX, y: eventObj.pageY };
  },

  calcInputDistance: function(isVerticalAxis) {
    var coordAxis = isVerticalAxis ? 'y' : 'x';
    try { return this.inputState.end[coordAxis] - this.inputState.start[coordAxis]; } catch(err) {return 0;}
  },

  applyResistance: function(distValue){
    // Apply resistance effect at carousel boundaries
    if (this.atBeginning() && distValue > 0 || this.atEnd() && distValue < 0) distValue /= (1 + Math.abs(distValue) / this.viewportDimension);
    return distValue;
  },

  onTransitionComplete: function(){
    // Execute user-defined callback after transition
    if (_jq.isFunction(this.config.onAfterShift)) this.config.onAfterShift(this, this.currentViewport);
    if (this.config.autoAdvance) this.autoAdvance();
  },

  /* Navigation for 'Previous' / 'Next' controls */
  configureArrowControls: function() {
    this.displayArea.append('<ul class="ui-carousel-panel-nav"><li class="prev">Previous</li><li class="next">Next</li></ul>');
  },

  /* Navigation via bullet/dot indicators */
  configureDotPaging: function() {
    this.dotElements = _jq('<ul class="ui-carousel-panel-dots"></ul>');
    for (let idx=0; idx<this.totalViewports; idx++) {
      this.dotElements.append('<li data-index="'+idx+'">'+(idx+1)+'</li>');
    }
    if (this.config.dotPaging === 'link') {
      this.dotElements.on(this.interactionEvents.inputTap, 'li', _jq.proxy(function(eventData){
        this.navigateToViewport(parseInt(_jq(eventData.currentTarget).data('index'), 10));
      }, this));
    }
    this.displayArea.append(this.dotElements);
    this.highlightCurrentDot();
  },

  highlightCurrentDot: function() {
    this.dotElements.children('li').removeClass('active').eq(this.currentViewport).addClass('active');
  }
};


var CarouselPanel3D = function(displayArea, config) {
  CarouselPanel.call(this, displayArea, config);
  this.displayArea.addClass('ui-carousel-panel-3d');
};
CarouselPanel3D.prototype = new CarouselPanel();

_jq.extend(CarouselPanel3D.prototype, {
  initializeDisplay: function() {
    var dimensionMethod = this.isOrientedVertically ? 'height' : 'width';
    this.viewportDimension = this.displayArea[dimensionMethod]();
    this.dragThreshold     = this.config.dragThreshold * this.viewportDimension / 2;
    this.rotationAngle     = 360/this.contentItems.length * (this.isOrientedVertically ? -1 : 1);
    this.cylinderRadius    = Math.round((this.viewportDimension/2) / Math.tan(Math.PI / this.contentItems.length));
    this.contentItems.each(_jq.proxy(this.setSlidePosition, this));
    this.animateContent(0,0);
  },

  constrainViewportIndex: function(num){
    // Allows circular navigation for 3D carousel
    if (num < 0) num += this.totalViewports;
    else if (num >= this.totalViewports) num %= this.totalViewports;
    return num;
  },

  getAnimationProps: function(coordOffset) {
    var rotationDelta = (this.rotationAngle * coordOffset / this.viewportDimension) - (this.rotationAngle * this.currentViewport);
    return { transform3d: '0,0,'+ -this.cylinderRadius + 'px', rotate3d: this.getRotationVector(rotationDelta) };
  },

  setSlidePosition: function(idx, itemElement){
    _jq(itemElement).animate({ rotate3d: this.getRotationVector(idx*this.rotationAngle), transform3d: '0,0,'+this.cylinderRadius+'px' }, {duration: 0});
  },

  getRotationVector: function(angleDegrees){
    return (this.isOrientedVertically ? '1,0' : '0,1') + ',0,' + angleDegrees + 'deg';
  },

  applyResistance: function(distValue) {return distValue;} // 3D carousel has no resistance
});

// _jq plugin wrapper for carousel functionality
;(function(_jq) {
  _jq.fn.carouselPanel = function(config) {
    var PanelConstructor = (config=config||{}).is3D ? CarouselPanel3D : CarouselPanel;
    return this.each(function() {
      var panelInstance = new PanelConstructor(this, config);
      // Store instance data, remove if it's a string (old behavior)
      if (typeof(_jq(this).data("carouselInstance", panelInstance).data("carouselInstance")) === "string") {
        _jq(this).removeAttr("data-carouselInstance");
      }
      return;
    });
  };
})(window.Zepto || window.jQuery); // Use Zepto or jQuery if available