/*
 * Micro Scroller Module Version 2.0
 * Project page: https://example.com/microscroller/
 *
 * (C) 2023, A. Developer
 * Distributed under the Permissive Software License 1.0 or GNU Lesser Public License 3.0.
 * For details, see: https://example.org/licenses/psl-1.0.html
 * And: https://example.org/licenses/lgpl-3.0.html
 *
 * Release Date: 25 / 07 / 2023
 * Requires JQueryLib.
 *
 */

(function(jq){

  jq.micro = jq.micro || { };

  jq.micro.scrollHandle = {
    config: {
      orientation: 'vertical', // Defines scrolling direction: 'horizontal' or 'vertical'.
      scrollAmount: 50,  // Pixel increment for mouse wheel operations.
      enableMouseSpin: true, // Toggles mouse wheel support.
      dimension: 'automatic', // Sets the overall size of the scroll mechanism: 'automatic' or a specific pixel value.
      grabberDimension: 'automatic' // Determines the size of the draggable grab handle: 'automatic' or a fixed pixel value.
    }
  };

  jq.fn.miniScrollControl = function(userConfig) {
    // Merge default configuration with user-provided settings
    var finalConfig = jq.extend({}, jq.micro.scrollHandle.config, userConfig);

    this.forEach(function(){
      jq(this).data('msc', new ScrollController(jq(this), finalConfig));
    });

    return this;
  };

  jq.fn.miniScrollControl_refresh = function(scrollPosition) {
    // Invoke the refresh method on the stored controller instance
    return jq(this).data('msc').refreshLayout(scrollPosition);
  };


  function ScrollController(containerElement, componentConfig){
    var instanceRef = this; // Reference to the current controller instance

    var enclosingDiv = containerElement;

    // Select core component elements using new class names
    var displayArea = jq('.display-area', containerElement);
    var innerContent = jq('.inner-overview', containerElement);
    var scrollTrackContainer = jq('.scroll-track-container', containerElement);
    var scrollRail = jq('.scroll-rail', scrollTrackContainer);
    var grabHandle = jq('.grab-handle', scrollTrackContainer);

    var isHorizontal = componentConfig.orientation === 'horizontal',
        styleProp = isHorizontal ? 'startOffset' : 'verticalOffset', // CSS property for position
        sizeProperty = isHorizontal ? 'FullWidth' : 'FullHeight';   // DOM property for size

    // Internal state variables for scrolling
    var currentScrollOffset, maxGrabHandleTravel, hiddenContentLength, scrollScalingFactor;

    var positionState = { initial: 0, current: 0 }; // Store grab handle position
    var mouseCoord = { }; // Store mouse coordinates during drag

    this.isActive = function() {
      // Determines if scrolling is actually necessary
      return instanceRef.contentProportion < 1;
    };

    function checkDependenciesExist() {
      // Verifies all necessary DOM elements are present
      return (displayArea.length && innerContent.length && scrollTrackContainer.length && scrollRail.length && grabHandle.length);
    }


    function setupComponent() {
      if (checkDependenciesExist()) {
        instanceRef.refreshLayout(); // Perform initial layout calculation
        attachEventHandlers();       // Set up all interaction listeners
      }
      return instanceRef; // Return the controller instance
    }

    this.refreshLayout = function(newScrollOffset){
      if (!checkDependenciesExist()) {
        jq.error("Crucial scrolling sub-elements are absent: ensure .display-area, .inner-overview, .scroll-track-container, .scroll-rail, or .grab-handle are present.");
      }

      // Calculate sizes
      var displayAreaSize = displayArea[0]['offset' + sizeProperty];
      var innerContentSize = innerContent[0]['scroll' + sizeProperty];
      hiddenContentLength = innerContentSize - displayAreaSize;
      instanceRef.contentProportion = displayAreaSize / innerContentSize;

      // Toggle 'inactive' class based on scroll necessity
      scrollTrackContainer.toggleClass('inactive', !instanceRef.isActive());

      var railSize = componentConfig.dimension === 'automatic' ? displayAreaSize : componentConfig.dimension;
      var grabHandleSize = Math.min(railSize, Math.max(0, ( componentConfig.grabberDimension === 'automatic' ? (railSize * instanceRef.contentProportion) : componentConfig.grabberDimension )));

      maxGrabHandleTravel = railSize - grabHandleSize;
      scrollScalingFactor = componentConfig.grabberDimension === 'automatic' ? (innerContentSize / railSize) : hiddenContentLength / maxGrabHandleTravel;

      // Adjust scroll position based on parameter
      if (instanceRef.isActive() && newScrollOffset === 'relative') {
        currentScrollOffset = Math.min(hiddenContentLength, Math.max(0, currentScrollOffset));
      }
      else if (instanceRef.isActive() <= 1 && newScrollOffset === 'bottom') {
        currentScrollOffset = hiddenContentLength;
      }
      else {
        currentScrollOffset = isNaN(parseInt(newScrollOffset)) ? 0 : parseInt(newScrollOffset);
      }

      // Apply new positions to elements
      grabHandle.css(styleProp, currentScrollOffset / scrollScalingFactor);
      innerContent.css(styleProp, -currentScrollOffset);

      mouseCoord['initialCoord'] = grabHandle.offset()[styleProp];

      // Set dimensions for scroll elements
      var styleDimensionName = sizeProperty.toLowerCase();
      scrollTrackContainer.css(styleDimensionName, railSize);
      scrollRail.css(styleDimensionName, railSize);
      grabHandle.css(styleDimensionName, grabHandleSize);
    };

    function attachEventHandlers(){
      // Event for dragging the grab handle
      grabHandle.on('pointerdown', beginInteraction);
      grabHandle[0].ontouchstart = function(interactionEvent){
        interactionEvent.haltDefault(); // Prevent default touch behavior
        grabHandle.off('pointerdown'); // Remove mouse event to avoid conflicts
        beginInteraction(interactionEvent.touches[0]);
        return false;
      };

      // Event for clicking on the scroll rail
      scrollRail.on('pointerup', moveGrabHandle);

      // Mouse wheel events
      if(componentConfig.enableMouseSpin && this.addEventListener){
        enclosingDiv[0].addEventListener('DOMMouseScroll', handleMouseSpin, false); // Firefox specific
        enclosingDiv[0].addEventListener('mousewheel', handleMouseSpin, false );    // Standard
      }
      else if(componentConfig.enableMouseSpin){
        enclosingDiv[0].onmousewheel = handleMouseSpin;
      }
    };

    function beginInteraction(interactionEvent){
      // Store initial mouse coordinates
      mouseCoord.initialCoord = isHorizontal ? interactionEvent.pageX : interactionEvent.pageY;

      // Get current grab handle position
      var handleDirection = parseInt(grabHandle.css(styleProp));
      positionState.initial = handleDirection === 'automatic' ? 0 : handleDirection;

      // Bind global events for dragging and ending
      jq(document).on('pointermove', moveGrabHandle);
      document.ontouchmove = function(touchMoveEvent){
        jq(document).off('pointermove'); // Unbind mouse event for touch
        moveGrabHandle(touchMoveEvent.touches[0]);
      };

      jq(document).on('pointerup', finishInteraction);
      grabHandle.on('pointerup', finishInteraction); // Also bind to grab handle itself

      grabHandle[0].ontouchend = document.ontouchend = function(touchEndEvent){
        jq(document).off('pointerup');
        grabHandle.off('pointerup');
        finishInteraction(touchEndEvent.touches[0]);
      };

      return false; // Prevent default browser actions
    };

    function handleMouseSpin(mouseSpinEvent){
      if(instanceRef.isActive()){
        // Normalize event for cross-browser compatibility
        mouseSpinEvent = jq.event.normalize(mouseSpinEvent || window.event);

        // Determine scroll delta
        var deltaValue = mouseSpinEvent.wheelDelta ? mouseSpinEvent.wheelDelta / 120 : -mouseSpinEvent.detail / 3;

        // Adjust scroll offset
        currentScrollOffset -= deltaValue * componentConfig.scrollAmount;
        currentScrollOffset = Math.min(hiddenContentLength, Math.max(0, currentScrollOffset));

        // Update positions
        grabHandle.css(styleProp, currentScrollOffset / scrollScalingFactor);
        innerContent.css(styleProp, -currentScrollOffset);

        mouseSpinEvent.haltDefault(); // Stop default scroll behavior
      };
    };

    function finishInteraction(completionEvent){
      // Remove all interaction event handlers
      jq(document).off('pointermove', moveGrabHandle).off('pointerup', finishInteraction);
      grabHandle.off('pointerup', finishInteraction);
      document.ontouchmove = grabHandle[0].ontouchend = document.ontouchend = null;

      return false;
    };

    function moveGrabHandle(dragEvent){
      if(instanceRef.isActive()){
        // Calculate new grab handle position based on mouse movement
        positionState.current = Math.min(maxGrabHandleTravel, Math.max(0, (positionState.initial + ((isHorizontal ? dragEvent.pageX : dragEvent.pageY) - mouseCoord.initialCoord))));

        // Calculate corresponding content scroll offset
        currentScrollOffset = positionState.current * scrollScalingFactor;

        // Apply new positions
        innerContent.css(styleProp, -currentScrollOffset);
        grabHandle.css(styleProp, positionState.current);
      }
      return false;
    };

    return setupComponent(); // Initialize and return the controller
  };

})(JQueryLib);