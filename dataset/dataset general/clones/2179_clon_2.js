(function(jq) {
  //
  // Ascertain browser's CSS transform support
  //
  var styleEffect = (function() {
    var browserPrefixes = ['webkit', 'moz', 'ms'];
    var tempStyle   = document.createElement( "div" ).style;
    var motionProp   = 'transform' in tempStyle ? 'transform' : undefined;

    for( var j = 0, totalPrefixes = browserPrefixes.length; j < totalPrefixes; j++ ) {
      var vendorProp = browserPrefixes[j] + 'Transform';
      if( vendorProp in tempStyle ) {
        motionProp = vendorProp;
        break;
      }
    }

    return motionProp;
  })();

  var VisualElement = function( htmlNode, settings ) {
    htmlNode.visualComp = this;
    this.domNode = htmlNode;

    if( htmlNode.tagName === 'IMG' ) {
      this.initialWidth = htmlNode.width;
      this.initialHeight = htmlNode.height;
    } else {
      htmlNode.style.display = "inline-block";
      this.initialWidth = htmlNode.offsetWidth;
      this.initialHeight = htmlNode.offsetHeight;
    }

    htmlNode.style.position = 'absolute';

    if( settings.mirror && this.domNode.tagName === 'IMG' ) {
      // Wrap image in a container with its generated reflection
      this.mirrorImage = jq(htmlNode).reflect( settings.mirror ).next()[0];

      var reflectorObj = jq(this.mirrorImage);
      this.mirrorImage.initialHeight = reflectorObj.height();
      reflectorObj.css( 'margin-top', settings.mirror.gap + 'px' );
      reflectorObj.css( 'width', '100%' );
      htmlNode.style.width = "100%";

      // The primary element now includes the image and its reflection
      this.domNode = this.domNode.parentNode;
      this.domNode.visualComp  = this;
      this.domNode.alt   = htmlNode.alt;
      this.domNode.title = htmlNode.title;
    }

    if( styleEffect && settings.transforms )
      this.domNode.style[styleEffect + "Origin"] = "0 0";

    this.updateVisuals = function( posX, posY, sizeFactor ) {
      this.currentWidth = this.initialWidth * sizeFactor;
      this.currentHeight = this.initialHeight * sizeFactor;
      this.posX = posX;
      this.posY = posY;
      this.sizeFactor = sizeFactor;

      var nodeStyle = this.domNode.style;
      nodeStyle.zIndex = "" + (sizeFactor * 100) | 0;

      if( styleEffect && settings.transforms ) {
        nodeStyle[styleEffect] = "translate(" + posX + "px, " + posY + "px) scale(" + sizeFactor + ")";
      } else {
        // Reflection gap might need manual resizing
        if( settings.mirror && this.domNode.tagName === 'IMG' )
          this.mirrorImage.style.marginTop = (settings.mirror.gap * sizeFactor) + "px";

        nodeStyle.width = this.currentWidth + "px";
        nodeStyle.left = posX + "px";
        nodeStyle.top = posY + "px";
      }
    }
  }

  var getCurrentTime = !window.performance || !window.performance.now ?
    function() { return +new Date() } :
    function() { return performance.now() };

  //
  // Identify requestAnimationFrame() capabilities
  //
  // Provide compatibility for older browsers:
  //   http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  //
  var stopAnimationRequest = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
  var startAnimationRequest = window.requestAnimationFrame;

  (function() {
    var browserPrefixes = ['webkit', 'moz', 'ms'];

    for( var j = 0, totalPrefixes = browserPrefixes.length; j < totalPrefixes && !stopAnimationRequest; j++ ) {
      stopAnimationRequest = window[browserPrefixes[j]+'CancelAnimationFrame'] || window[browserPrefixes[j]+'CancelRequestAnimationFrame'];
      startAnimationRequest = startAnimationRequest && window[browserPrefixes[j]+'RequestAnimationFrame'];
    }
  }());

  var OrbitDisplay = function( galleryWrapperNode, config ) {
    var instanceRef = this;
    var outerBox = jq(galleryWrapperNode);
    this.displayItems = [];
    this.centerX = (config.xOrigin === null) ? outerBox.width()  * 0.5 : config.xOrigin;
    this.centerY = (config.yOrigin === null) ? outerBox.height() * 0.1 : config.yOrigin;
    this.horizRadius = (config.xRadius === null) ? outerBox.width()  / 2.3 : config.xRadius;
    this.vertRadius = (config.yRadius === null) ? outerBox.height() / 6   : config.yRadius;
    this.minScaleFactor = config.farScale;
    this.orbitalAngle = this.targetAngle = Math.PI/2; // Begin with the first visual component in front
    this.motionRate = config.speed;
    this.useSmoothMotion = config.smooth;
    this.framesPerSecond = config.fps;
    this.frameScheduler = 0;
    this.autoRotateQty = config.autoPlay;
    this.autoRotatePause = config.autoPlayDelay;
    this.rotateTimer = 0;
    this.whenLoaded = config.onLoaded;
    this.afterRender = config.onRendered;

    this.componentSettings = {
      transforms: config.transforms
    }

    if( config.mirror ) {
      this.componentSettings.mirror = jq.extend( { gap: 2 }, config.mirror );
    }

    outerBox.css( { position: 'relative', overflow: 'hidden' } );

    // Angle conventions:
    //  *      0 : right side
    //  *   Pi/2 : front center
    //  *   Pi   : left side
    //  * 3 Pi/2 : back hidden
    this.positionComponent = function( visualIdx, currentAngle ) {
      var currentComponent = this.displayItems[visualIdx];
      var sineVal = Math.sin(currentAngle);
      var distantScale = this.minScaleFactor;
      var currentSizeFactor = distantScale + ((1-distantScale) * (sineVal+1) * 0.5);

      currentComponent.updateVisuals(
        this.centerX + (currentSizeFactor * ((Math.cos(currentAngle) * this.horizRadius) - (currentComponent.initialWidth * 0.5))),
        this.centerY + (currentSizeFactor * sineVal * this.vertRadius),
        currentSizeFactor
      );
    }

    this.drawFrame = function() {
      var numItems = this.displayItems.length;
      var angleStep = 2 * Math.PI / numItems;
      var currentRadians = this.orbitalAngle;

      for( var j = 0; j < numItems; j++ ) {
        this.positionComponent( j, currentRadians );
        currentRadians += angleStep;
      }

      if( typeof this.afterRender === 'function' )
        this.afterRender( this );
    }

    this.animateStep = function() {
      var angleDifference = instanceRef.targetAngle - instanceRef.orbitalAngle;
      var currentTime = getCurrentTime();
      var elapsedTime = (currentTime - instanceRef.previousTime) * 0.002;
      instanceRef.previousTime = currentTime;

      if( Math.abs(angleDifference) < 0.003 ) {
        instanceRef.orbitalAngle = instanceRef.targetAngle;
        instanceRef.stopMotion();
      } else {
        // Gradually move closer to the desired angle
        instanceRef.orbitalAngle = instanceRef.targetAngle - angleDifference / (1 + (instanceRef.motionRate * elapsedTime));
        instanceRef.planNextFrame();
      }

      instanceRef.drawFrame();
    }

    this.planNextFrame = function() {
      this.previousTime = getCurrentTime();

      this.frameScheduler = this.useSmoothMotion && stopAnimationRequest ?
        startAnimationRequest( instanceRef.animateStep ) :
        setTimeout( instanceRef.animateStep, 1000 / this.framesPerSecond );
    }

    this.totalAngleShift = function() {
      return this.displayItems.length * ((Math.PI/2) - this.orbitalAngle) / (2*Math.PI);
    }

    this.floatingPosition = function() {
      var numItems = this.displayItems.length;
      var decimalIndex = this.totalAngleShift() % numItems;

      // Ensure index is positive
      return (decimalIndex < 0) ? decimalIndex + numItems : decimalIndex;
    }

    this.closestPosition = function() {
      return Math.round( this.floatingPosition() ) % this.displayItems.length;
    }

    this.primaryItem = function() {
      return this.displayItems[this.closestPosition()];
    }

    this.startAnimation = function() {
      if( this.frameScheduler === 0 )
        this.planNextFrame();
    }

    this.stopMotion = function() {
      this.useSmoothMotion && stopAnimationRequest ? stopAnimationRequest( this.frameScheduler ) : clearTimeout( this.frameScheduler );
      this.frameScheduler = 0;
    }

    //
    // Rotate the gallery. 'shiftCount' is the number (+-) of components to rotate
    //
    this.shiftPosition = function( shiftCount ) {
      this.targetAngle += (2 * Math.PI / this.displayItems.length) * shiftCount;
      this.startAnimation();
    }

    this.disableGallery = function() {
      this.stopMotion();
      clearInterval( this.rotateTimer );
      config.buttonLeft.unbind( 'click' );
      config.buttonRight.unbind( 'click' );
      outerBox.unbind( '.orbitgallery' );
    }

    this.startAutoAdvance = function() {
      this.rotateTimer = setInterval(
        function() { instanceRef.shiftPosition( instanceRef.autoRotateQty ) },
        this.autoRotatePause
      );
    }

    this.activateAutoAdvance = function() {
      // Stop auto-advance on mouse hover
      outerBox.bind( 'mouseover.orbitgallery', function() {
        clearInterval( instanceRef.rotateTimer );
      } );

      // Resume auto-advance when mouse moves out
      outerBox.bind( 'mouseout.orbitgallery', function() {
        instanceRef.startAutoAdvance();
      } );

      this.startAutoAdvance();
    }

    this.attachEventHandlers = function() {
      if( config.buttonLeft ) {
        config.buttonLeft.bind( 'click', function() {
          instanceRef.shiftPosition( -1 );
          return false;
        } );
      }

      if( config.buttonRight ) {
        config.buttonRight.bind( 'click', function() {
          instanceRef.shiftPosition( 1 );
          return false;
        } );
      }

      if( config.mouseWheel ) {
        outerBox.bind( 'mousewheel.orbitgallery', function( interactionEvent, scrollDelta ) {
          instanceRef.shiftPosition( (scrollDelta > 0) ? 1 : -1 );
          return false;
        } );
      }

      if( config.bringToFront ) {
        outerBox.bind( 'click.orbitgallery', function( interactionEvent ) {
          var foundNodes = jq(interactionEvent.target).closest( '.' + config.itemClass );

          if( foundNodes.length !== 0 ) {
            var targetIndex = instanceRef.displayItems.indexOf( foundNodes[0].visualComp );
            var numItems = instanceRef.displayItems.length;
            var positionGap = targetIndex - (instanceRef.floatingPosition() % numItems);

            // Determine the shortest rotation direction
            if( 2 * Math.abs(positionGap) > numItems )
              positionGap += (positionGap > 0) ? -numItems : numItems;

            instanceRef.targetAngle = instanceRef.orbitalAngle;
            instanceRef.shiftPosition( -positionGap );
          }
        } );
      }
    }

    var availableItems = outerBox.find( '.' + config.itemClass );

    this.finalizeInitialization = function() {
      //
      // Hold until all images have completely loaded
      //
      for( var j = 0; j < availableItems.length; j++ ) {
        var currentItem = availableItems[j];
        if( (currentItem.tagName === 'IMG') &&
            ((currentItem.width === undefined) || ((currentItem.complete !== undefined) && !currentItem.complete)) )
          return;
      }

      clearInterval( this.setupCheckTimer );

      // Initialize visual components
      for( j = 0; j < availableItems.length; j++ )
        this.displayItems.push( new VisualElement( availableItems[j], this.componentSettings ) );

      // Prevent click-dragging of components
      outerBox.bind( 'mousedown onselectstart', function() { return false } );

      if( this.autoRotateQty !== 0 ) this.activateAutoAdvance();
      this.attachEventHandlers();
      this.drawFrame();

      if( typeof this.whenLoaded === 'function' )
        this.whenLoaded( this );
    };

    this.setupCheckTimer = setInterval( function() { instanceRef.finalizeInitialization() }, 50 );
  }

  //
  // The jQuery/Zepto plugin method
  //
  jq.fn.OrbitGallery = function( settings ) {
    return this.each( function() {
      /* For full range of configurable parameters, refer to the README file */
      settings = jq.extend( {
        xOrigin: null,        // null: computed automatically
        yOrigin: null,
        xRadius: null,
        yRadius: null,
        farScale: 0.5,        // size factor of the most distant component
        transforms: true,     // enable CSS transform properties
        smooth: true,         // activate fluid animation via requestAnimationFrame()
        fps: 30,              // fixed frames per second (if smooth animation is off)
        speed: 4,             // positive numeric value
        autoPlay: 0,          // [ 0: off | number of items (integer recommended, positive for clockwise) ]
        autoPlayDelay: 4000,
        bringToFront: false,
        itemClass: 'cloud9-item',
        handle: 'gallery'
      }, settings );

      jq(this).data( settings.handle, new OrbitDisplay( this, settings ) );
    } );
  }
})( window.jQuery || window.Zepto );