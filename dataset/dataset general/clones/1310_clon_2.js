/*
 * jQuery Carousel Widget v1.0
 * http://widget.example.com
 *
 * Copyright 2023, A. Developer
 * Licensed under the Apache 2.0 license.
 * http://www.apache.org/licenses/LICENSE-2.0.html
 *
 * Contributor: J. Random
 */

;(function (jq) {
  
  // CarouselPlugin: Object Definition
  jq.somePlugin = function(targetElement, configOptions) {
    let component = targetElement;

    component.initialize = function() {
      component.settings = jq.extend({}, jq.somePlugin.baseConfig, configOptions);
      component.storeData('myCarousel', true);
      component.viewport = jq('.item-frames', component);
      component.items = jq('.item-frames > div', component);
      component.totalItems = component.items.length;
      component.isMoving = false;
      component.currentIndex = component.settings.initialIndex;
      component.targetIndex = component.currentIndex;
      component.isBoundary = (component.currentIndex === 0);
      component.interactionEvent = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
      component.replicationCount = 0;
      component.replicationOffset = 0;
      component.userPaused = false;
      component.isVertical = (component.settings.flowDirection === "vertical");
      component.styleProperty = (component.isVertical) ? "top" : "marginLeft";
      component.styleArgs = {};
      
      // Check for CSS3 transform support
      component.supportsTransitions = "webkitTransition" in document.body.style;
      if (component.supportsTransitions) {
        component.styleProperty = "-webkit-transform";
      }
      
      // Verify custom controls container
      if (component.settings.controlWrapper !== "") {
        component.controlElements = jq(component.settings.controlWrapper).eq(jq('.item-frames').index(component.viewport));
        component.hasCustomControls = component.controlElements.length > 0;
      }
      // Verify custom navigation elements
      if (component.settings.customNav !== "") {
        component.customNavItems = jq(component.settings.customNav, ((component.hasCustomControls) ? component.controlElements : component));
        component.hasCustomNav = component.customNavItems.length > 0;
      }
      
      ///////////////////////////////////////////////////////////////////
      // CarouselPlugin: Shuffle Slides
      if (component.settings.shuffleItems) {
        component.items.sort(function() { return (Math.round(Math.random())-0.5); });
        component.viewport.empty().append(component.items);
      }
      ///////////////////////////////////////////////////////////////////
      
      ///////////////////////////////////////////////////////////////////
      // CarouselPlugin: Initial Animation Setup
      if (component.settings.motionType.toLowerCase() === "swipe") {
        if (component.supportsTransitions) {
          component.resetTransition(0);
        }
        //component.css({"overflow": "hidden"});
        if (component.settings.loopMotion) {
          component.replicationCount = 2;
          component.replicationOffset = 1;
          component.viewport.append(component.items.filter(':first').clone().addClass('replicated')).prepend(component.items.filter(':last').clone().addClass('replicated'));
        }
        // capture all items including replicated ones
        component.allVisibleItems = jq('.item-frames > div', component);
        let currentPositionOffset = (-1 * (component.currentIndex + component.replicationOffset));
        if (component.isVertical) {
          component.allVisibleItems.css({"display": "block", "width": "100%", "float": "left"});
          component.viewport.height((component.totalItems + component.replicationCount) * 200 + "%").css("position", "absolute").width("100%");
          // Delay for browser to calculate initial dimensions correctly
          setTimeout(function() {
            component.css({"position": "relative"}).height(component.items.filter(':first').height());
            component.styleArgs[component.styleProperty] = (component.supportsTransitions) ? "translate3d(0," + currentPositionOffset * component.height() + "px,0)" : currentPositionOffset * component.height() + "px";
            component.viewport.css(component.styleArgs);
          }, 100);

        } else {
          component.styleArgs[component.styleProperty] = (component.supportsTransitions) ? "translate3d(" + currentPositionOffset * component.width() + "px,0,0)" : currentPositionOffset * component.width() + "px";
          component.viewport.width((component.totalItems + component.replicationCount) * 200 + "%").css(component.styleArgs);
          // Delay for browser to calculate initial dimensions correctly
          setTimeout(function() {
            component.allVisibleItems.width(component.width()).css({"float": "left", "display": "block"});
          }, 100);
        }
        
      } else { // Fallback to Fade
        // CSS3 transitions not supported for fade animation at this time
        component.supportsTransitions = false;
        component.items.css({"width": "100%", "float": "left", "marginRight": "-100%"}).eq(component.currentIndex).fadeIn(component.settings.fadeDuration); 
      }
      ///////////////////////////////////////////////////////////////////
      
      ///////////////////////////////////////////////////////////////////
      // CarouselPlugin: Index Navigation
      if (component.settings.indexNav) {
        if (component.hasCustomNav) {
          component.indexNavElements = component.customNavItems;
        } else {
          let indexNavStructure = jq('<ol class="carousel-index-nav"></ol>');
          let itemCounter = 1;
          for (let i = 0; i < component.totalItems; i++) {
            indexNavStructure.append('<li><a>' + itemCounter + '</a></li>');
            itemCounter++;
          }

          if (component.hasCustomControls) {
            jq(component.controlElements).append(indexNavStructure);
            component.indexNavElements = jq('.carousel-index-nav li a', component.controlElements);
          } else {
            component.append(indexNavStructure);
            component.indexNavElements = jq('.carousel-index-nav li a', component);
          }
        }

        component.indexNavElements.eq(component.currentIndex).addClass('current');

        component.indexNavElements.on(component.interactionEvent, function(e) {
          e.preventDefault();
          if (!jq(this).hasClass('current')) {
            (component.indexNavElements.index(jq(this)) > component.currentIndex) ? component.moveDirection = "forward" : component.moveDirection = "backward";
            component.performAnimation(component.indexNavElements.index(jq(this)), component.settings.pauseOnUserAction);
          }
        });
      }
      ///////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //CarouselPlugin: Directional Navigation
      if (component.settings.directionalNav) {
        let dirNavStructure = jq('<ul class="carousel-dir-nav"><li><a class="prev-btn" href="#">' + component.settings.prevLabel + '</a></li><li><a class="next-btn" href="#">' + component.settings.nextLabel + '</a></li></ul>');
        
        if (component.hasCustomControls) {
          jq(component.controlElements).append(dirNavStructure);
          component.dirNavElements = jq('.carousel-dir-nav li a', component.controlElements);
        } else {
          component.append(dirNavStructure);
          component.dirNavElements = jq('.carousel-dir-nav li a', component);
        }
        
        // Set initial inactive styles if applicable
        if (!component.settings.loopMotion) {
          if (component.currentIndex === 0) {
            component.dirNavElements.filter('.prev-btn').addClass('inactive');
          } else if (component.currentIndex === component.totalItems - 1) {
            component.dirNavElements.filter('.next-btn').addClass('inactive');
          }
        }
        
        component.dirNavElements.on(component.interactionEvent, function(e) {
          e.preventDefault();
          let targetIdx = (jq(this).hasClass('next-btn')) ? component.getDesiredIndex('forward') : component.getDesiredIndex('backward');
          
          if (component.canTransition(targetIdx)) {
            component.performAnimation(targetIdx, component.settings.pauseOnUserAction);
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //CarouselPlugin: Keyboard Control
      if (component.settings.keyboardControl && jq('ul.item-frames').length === 1) {
        function handleKeyPress(keyEvent) {
          if (component.isMoving) {
            return;
          } else if (keyEvent.keyCode !== 39 && keyEvent.keyCode !== 37){
            return;
          } else {
            if (keyEvent.keyCode === 39) {
              var targetIdx = component.getDesiredIndex('forward');
            } else if (keyEvent.keyCode === 37){
              var targetIdx = component.getDesiredIndex('backward');
            }
        
            if (component.canTransition(targetIdx)) {
              component.performAnimation(targetIdx, component.settings.pauseOnUserAction);
            }
          }
        }
        jq(document).on('keyup', handleKeyPress);
      }
      //////////////////////////////////////////////////////////////////
      
      ///////////////////////////////////////////////////////////////////
      // CarouselPlugin: Scroll Wheel Integration
      if (component.settings.mouseWheelNav) {
        component.scrollEventType = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        component.on(component.scrollEventType, function(scrollEvt) {
          scrollEvt.preventDefault();
          scrollEvt = scrollEvt ? scrollEvt : window.event;
          let scrollDelta = scrollEvt.detail ? scrollEvt.detail * -1 : scrollEvt.wheelDelta / 40,
              targetIdx = (scrollDelta < 0) ? component.getDesiredIndex('forward') : component.getDesiredIndex('backward');
          
          if (component.canTransition(targetIdx)) {
            component.performAnimation(targetIdx, component.settings.pauseOnUserAction);
          }
        });
      }
      ///////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //CarouselPlugin: Auto-Play Configuration
      if (component.settings.autoPlay) {
        // pause on mouse interaction
        if (component.settings.pauseOnHover && component.settings.autoPlay) {
          component.hover(function() {
            component.haltPlayback();
          }, function() {
            if (!component.userPaused) {
              component.startPlayback();
            }
          });
        }

        // Begin auto-transition
        component.autoPlayInterval = setInterval(component.advanceSlides, component.settings.playSpeed);
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //CarouselPlugin: Playback Control
      if (component.settings.showPlayPause) {
        let playbackControlMarkup = jq('<div class="carousel-playback"><span></span></div>');
      
        if (component.hasCustomControls) {
          component.controlElements.append(playbackControlMarkup);
          component.playPauseButton = jq('.carousel-playback span', component.controlElements);
        } else {
          component.append(playbackControlMarkup);
          component.playPauseButton = jq('.carousel-playback span', component);
        }
        
        let currentPlayState = (component.settings.autoPlay) ? 'paused' : 'playing';
        component.playPauseButton.addClass(currentPlayState).text((currentPlayState === 'paused') ? component.settings.pauseLabel : component.settings.playLabel);
        
        component.playPauseButton.on(component.interactionEvent, function(e) {
          e.preventDefault();
          if (jq(this).hasClass('paused')) {
            component.haltPlayback();
            component.userPaused = true;
          } else {
            component.startPlayback();
            component.userPaused = false;
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //CarouselPlugin: Touch Gestures
      // Inspired by: TouchSwipe - http://www.netcu.de/jquery-touchwipe-iphone-ipad-library
      // Inspired by: SwipeJS - http://swipejs.com
      if ('ontouchstart' in document.documentElement) {
        // Variables are initially named for horizontal scrolling
        // They are swapped if vertical scrolling is active
        // This reduces code duplication
        let touchStartX,
          touchStartY,
          itemOffset,
          visibleWidth,
          deltaX,
          touchStartTime,
          isScrolling = false;
              
        component.each(function() {
          if ('ontouchstart' in document.documentElement) {
            this.addEventListener('touchstart', handleTouchStart, {passive: false});
          }
        });
        
        function handleTouchStart(touchEvent) {
          if (component.isMoving) {
            touchEvent.preventDefault();
          } else if (touchEvent.touches.length === 1) {
            component.haltPlayback();
            visibleWidth = (component.isVertical) ? component.height() : component.width();
            touchStartTime = Number(new Date());
            itemOffset = (component.isVertical) ? (component.currentIndex + component.replicationOffset) * component.height() : (component.currentIndex + component.replicationOffset) * component.width();
            touchStartX = (component.isVertical) ? touchEvent.touches[0].pageY : touchEvent.touches[0].pageX;
            touchStartY = (component.isVertical) ? touchEvent.touches[0].pageX : touchEvent.touches[0].pageY;
            component.resetTransition(0);

            this.addEventListener('touchmove', handleTouchMove, {passive: false});
            this.addEventListener('touchend', handleTouchEnd, {passive: false});
          }
        }

        function handleTouchMove(touchEvent) {
          deltaX = (component.isVertical) ? touchStartX - touchEvent.touches[0].pageY : touchStartX - touchEvent.touches[0].pageX;
          isScrolling = (component.isVertical) ? (Math.abs(deltaX) < Math.abs(touchEvent.touches[0].pageX - touchStartY)) : (Math.abs(deltaX) < Math.abs(touchEvent.touches[0].pageY - touchStartY));

          if (!isScrolling) {
            touchEvent.preventDefault();
            if (component.settings.motionType === "swipe" && component.supportsTransitions) {
              if (!component.settings.loopMotion) {
                deltaX = deltaX/((component.currentIndex === 0 && deltaX < 0 || component.currentIndex === component.totalItems - 1 && deltaX > 0) ? (Math.abs(deltaX)/visibleWidth+2) : 1);
              }
              component.styleArgs[component.styleProperty] = (component.isVertical) ? "translate3d(0," + (-itemOffset - deltaX) + "px,0)": "translate3d(" + (-itemOffset - deltaX) + "px,0,0)";
              component.viewport.css(component.styleArgs);
            }
          }
        }
        
        function handleTouchEnd(touchEvent) {
          component.isMoving = false;
          if (component.targetIndex === component.currentIndex && !isScrolling && !(deltaX === null)) {
            let targetIdx = (deltaX > 0) ? component.getDesiredIndex('forward') : component.getDesiredIndex('backward');
            if (component.canTransition(targetIdx) && Number(new Date()) - touchStartTime < 550 && Math.abs(deltaX) > 20 || Math.abs(deltaX) > visibleWidth/2) {
              component.performAnimation(targetIdx, component.settings.pauseOnUserAction);
            } else {
              component.performAnimation(component.currentIndex, component.settings.pauseOnUserAction);
            }
          }
          
          // Clean up touch event listeners
          this.removeEventListener('touchmove', handleTouchMove, {passive: false});
          this.removeEventListener('touchend', handleTouchEnd, {passive: false});
          touchStartX = null;
          touchStartY = null;
          deltaX = null;
          itemOffset = null;
        }
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //CarouselPlugin: Responsive Adjustments
      if (component.settings.motionType.toLowerCase() === "swipe") {
        jq(window).on('resize', function(){
          if (!component.isMoving) {
            if (component.isVertical) {
              component.height(component.items.filter(':first').height());
              component.styleArgs[component.styleProperty] = (-1 * (component.currentIndex + component.replicationOffset))* component.items.filter(':first').height() + "px";
              if (component.supportsTransitions) {
                component.resetTransition(0);
                component.styleArgs[component.styleProperty] = (component.isVertical) ? "translate3d(0," + component.styleArgs[component.styleProperty] + ",0)" : "translate3d(" + component.styleArgs[component.styleProperty] + ",0,0)";
              }
              component.viewport.css(component.styleArgs);
            } else {
              component.allVisibleItems.width(component.width());
              component.styleArgs[component.styleProperty] = (-1 * (component.currentIndex + component.replicationOffset))* component.width() + "px";
              if (component.supportsTransitions) {
                component.resetTransition(0);
                component.styleArgs[component.styleProperty] = (component.isVertical) ? "translate3d(0," + component.styleArgs[component.styleProperty] + ",0)" : "translate3d(" + component.styleArgs[component.styleProperty] + ",0,0)";
              }
              component.viewport.css(component.styleArgs);
            }
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //CarouselPlugin: Instance Disposal
      // This is a working function, but not part of the minified release.
      // Bind this functionality to a custom event in your 'onStart' callback if needed.
      /*
      component.dispose = function() {
        component.haltPlayback();
        if (component.indexNavElements && component.settings.customNav === "") component.indexNavElements.closest('.carousel-index-nav').remove();
        if (component.dirNavElements) component.dirNavElements.closest('.carousel-dir-nav').remove();
        if (component.settings.showPlayPause) component.playPauseButton.closest('.carousel-playback').remove();
        if (component.settings.keyboardControl && jq('ul.item-frames').length === 1) jq(document).off('keyup', handleKeyPress);
        if (component.settings.mouseWheelNav) component.off(component.scrollEventType);
        if (component.supportsTransitions) component.each(function(){this.removeEventListener('touchstart', handleTouchStart, {passive: false});});
        if (component.settings.motionType === "swipe" && component.settings.loopMotion) component.allVisibleItems.filter('.replicated').remove();
        if (component.isVertical) component.height("auto");
        component.items.hide();
        component.removeData('myCarousel');
      }
      */
      //////////////////////////////////////////////////////////////////
      
      // CarouselPlugin: onStart Callback
      component.settings.onStart(component);
    }
    
    // CarouselPlugin: Core Animation Logic
    component.performAnimation = function(targetIdx, shouldPause) {
      if (!component.isMoving) {
        // Set animation flag
        component.isMoving = true;
        
        // CarouselPlugin: beforeTransition() Callback
        component.targetIndex = targetIdx;
        component.settings.beforeTransition(component);
        
        // Optional: pause auto-play on user interaction
        if (shouldPause) {
            component.haltPlayback();
        }
        
        // Update index navigation state   
        if (component.settings.indexNav) {
            component.indexNavElements.removeClass('current').eq(targetIdx).addClass('current');
        }
        
        // Check if at start or end
        component.isBoundary = (targetIdx === 0 || targetIdx === component.totalItems - 1);
        if (!component.settings.loopMotion && component.settings.directionalNav) {
          if (targetIdx === 0) {
            component.dirNavElements.removeClass('inactive').filter('.prev-btn').addClass('inactive');
          } else if (targetIdx === component.totalItems - 1) {
            component.dirNavElements.removeClass('inactive').filter('.next-btn').addClass('inactive');
          } else {
            component.dirNavElements.removeClass('inactive');
          }
        }
        
        if (!component.settings.loopMotion && targetIdx === component.totalItems - 1) {
          component.haltPlayback();
          // CarouselPlugin: onEnd() of cycle Callback
          component.settings.onEnd(component);
        }
        
        if (component.settings.motionType.toLowerCase() === "swipe") {
          let itemDimension = (component.isVertical) ? component.items.filter(':first').height() : component.items.filter(':first').width();
          
          if (component.currentIndex === 0 && targetIdx === component.totalItems - 1 && component.settings.loopMotion && component.moveDirection !== "forward") {
            component.positionString = "0px";
          } else if (component.currentIndex === component.totalItems - 1 && targetIdx === 0 && component.settings.loopMotion && component.moveDirection !== "backward") {
            component.positionString = (-1 * (component.totalItems + 1)) * itemDimension + "px";
          } else {
            component.positionString = (-1 * (targetIdx + component.replicationOffset)) * itemDimension + "px";
          }
          component.styleArgs[component.styleProperty] = component.positionString;

          if (component.supportsTransitions) {
              component.resetTransition(component.settings.fadeDuration); 
              component.styleArgs[component.styleProperty] = (component.isVertical) ? "translate3d(0," + component.positionString + ",0)" : "translate3d(" + component.positionString + ",0,0)";
              component.viewport.css(component.styleArgs).one("webkitTransitionEnd transitionend", function(){
                component.cleanupAnimation(itemDimension);
              });   
          } else {
            component.viewport.animate(component.styleArgs, component.settings.fadeDuration, function(){
                component.cleanupAnimation(itemDimension);
            });
          }
        } else { // Fallback to Fade
          component.items.eq(component.currentIndex).fadeOut(component.settings.fadeDuration);
          component.items.eq(targetIdx).fadeIn(component.settings.fadeDuration, function() {
            component.cleanupAnimation();
          });
        }
      }
    }
    
    // CarouselPlugin: Function to finalize animation steps
    component.cleanupAnimation = function(itemDimension) {
      if (component.settings.motionType === "swipe") {
        // Adjust position if looping
        if (component.currentIndex === 0 && component.targetIndex === component.totalItems - 1 && component.settings.loopMotion) {
          component.styleArgs[component.styleProperty] = (-1 * component.totalItems) * itemDimension + "px";
          if (component.supportsTransitions) {
            component.resetTransition(0);
            component.styleArgs[component.styleProperty] = (component.isVertical) ? "translate3d(0," + component.styleArgs[component.styleProperty] + ",0)" : "translate3d(" + component.styleArgs[component.styleProperty] + ",0,0)";
          }
          component.viewport.css(component.styleArgs);
        } else if (component.currentIndex === component.totalItems - 1 && component.targetIndex === 0 && component.settings.loopMotion) {
          component.styleArgs[component.styleProperty] = -1 * itemDimension + "px";
          if (component.supportsTransitions) {
            component.resetTransition(0);
            component.styleArgs[component.styleProperty] = (component.isVertical) ? "translate3d(0," + component.styleArgs[component.styleProperty] + ",0)" : "translate3d(" + component.styleArgs[component.styleProperty] + ",0,0)";
          }
          component.viewport.css(component.styleArgs);
        }
      }
      component.isMoving = false;
      component.currentIndex = component.targetIndex;
      // CarouselPlugin: afterTransition() Callback
      component.settings.afterTransition(component);
    }
    
    // CarouselPlugin: Automated Slide Advance
    component.advanceSlides = function() {
      if (!component.isMoving) {
        component.performAnimation(component.getDesiredIndex("forward"));
      }
    }
    
    // CarouselPlugin: Halt Auto-Playback
    component.haltPlayback = function() {
      clearInterval(component.autoPlayInterval);
      if (component.settings.showPlayPause) {
        component.playPauseButton.removeClass('paused').addClass('playing').text(component.settings.playLabel);
      }
    }
    
    // CarouselPlugin: Start/Resume Auto-Playback
    component.startPlayback = function() {
      component.autoPlayInterval = setInterval(component.advanceSlides, component.settings.playSpeed);
      if (component.settings.showPlayPause) {
        component.playPauseButton.removeClass('playing').addClass('paused').text(component.settings.pauseLabel);
      }
    }
    
    // CarouselPlugin: Determine Next/Previous Index
    component.getDesiredIndex = function(moveDirection) {
      let nextIndex = 0;
      if (moveDirection === "forward") {
        nextIndex = (component.currentIndex === component.totalItems - 1) ? (component.settings.loopMotion ? 0 : component.currentIndex) : component.currentIndex + 1;
      } else {
        nextIndex = (component.currentIndex === 0) ? (component.settings.loopMotion ? component.totalItems - 1 : 0) : component.currentIndex - 1;
      }
      return nextIndex;
    }
    
    // CarouselPlugin: Check if Transition is Possible
    component.canTransition = function(targetIdx) {
      // Cannot transition if already moving
      // or if not looping and trying to go past boundaries
      if (component.isMoving || (!component.settings.loopMotion && (targetIdx < 0 || targetIdx > component.totalItems - 1))) {
        return false;
      } else if (component.currentIndex === targetIdx) {
        return false; // Already on target slide
      } else {
        return true;
      }
    }
    
    // CarouselPlugin: Apply CSS Transition Speed
    component.resetTransition = function(transitionSpeed) {
      component.viewport.css({'-webkit-transition-duration': transitionSpeed / 1000 + "s"});
    }

    // Call initialize after all functions are defined
    component.initialize();
  }
  
  // CarouselPlugin: Default Configuration
  jq.somePlugin.baseConfig = {
    motionType: "swipe",              // "swipe" or "fade"
    flowDirection: "horizontal",      // "horizontal" or "vertical"
    fadeDuration: 600,                // Animation speed in ms
    easeFunction: "easeOutExpo",      // jQuery easing function
    reverseOrder: false,              // Reverse the animation direction
    controlWrapper: "",               // Selector for custom controls container
    customNav: "",                    // Selector for custom navigation links
    onStart: function(){},            // Callback after initialization
    beforeTransition: function(){},   // Callback before each slide transition
    afterTransition: function(){},    // Callback after each slide transition
    autoPlay: true,                   // Enable auto-play
    playSpeed: 7000,                  // Auto-play interval in ms
    pauseOnHover: false,              // Pause auto-play on mouse hover
    initialDelay: 0,                  // Delay before first auto-play transition
    shuffleItems: false,              // Randomize slide order
    indexNav: true,                   // Show index (pagination) navigation
    directionalNav: true,             // Show directional (next/prev) navigation
    prevLabel: "Previous",            // Text for previous button
    nextLabel: "Next",                // Text for next button
    keyboardControl: true,            // Enable keyboard navigation
    mouseWheelNav: false,             // Enable mousewheel navigation
    showPlayPause: false,             // Show play/pause button
    pauseLabel: "Pause",              // Text for pause button
    playLabel: "Play",                // Text for play button
    initialIndex: 0,                  // Starting slide index
    pauseOnUserAction: true,          // Pause auto-play on user interaction
    loopMotion: true                  // Loop animation
  };
  
  // CarouselPlugin: jQuery Plugin Integration
  jq.fn.somePlugin = function(configOptions) {
    return this.each(function() {
      if (jq(this).data('myCarousel') === true) {
        return; // Already initialized
      }
      new jq.somePlugin(jq(this), configOptions);
    });
  };
  
  // CarouselPlugin: Auto-initialize on window load
  jq(window).on('load', function() {
    jq('.my-carousel').somePlugin({});
  });

})(jQuery);