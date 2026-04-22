/*
 *  Application     : Obscuring Layer
 *  Purpose : A lightweight jQuery extension to place one element over another with interaction.
 *  Creator         : M. S. Developer
 *  Permit          : MIT  https://opensource.org/licenses/MIT
*/

(function(jQ) {

jQ.fn.overlayControl = function(configOptions) {

  // Establish default configuration settings
  var preferences = jQ.extend({

    vertMargin      : 45, // Vertical boundary offset
    horizMargin     : 45, // Horizontal boundary offset
    initialX        : 45, // Initial X position for the control
    initialY        : 45, // Initial Y position for the control
    orientation     : "sideToSide" // Movement direction

  }, configOptions);

  // Iterate over each matched element
  return this.each(function() {

    // Component Setup
    //--------------------------------

    var jQCurrentElement = jQ(this);
    var jQOverlayPanel = jQCurrentElement.find('>.dynamic-panel');
    var jQInteractionGrabber = jQCurrentElement.find('>.control-handle');
    var containerWidth = jQCurrentElement.innerWidth();
    var containerHeight = jQCurrentElement.innerHeight();
    var previousCoordX = null;
    var previousCoordY = null;
    var dragStartPointX = null;
    var dragStartPointY = null;
    var minimumLeftBound = preferences.horizMargin;
    var maximumLeftBound = containerWidth - preferences.horizMargin;

    var minimumTopBound = preferences.vertMargin;
    var maximumTopBound = containerHeight - preferences.vertMargin;
    var currentXPos = preferences.initialX;
    var currentYPos = preferences.initialY;

    // Apply background images based on data attributes
    jQCurrentElement.css('background-image', 'url(' + jQCurrentElement.data('baseImage') + ')');
    jQOverlayPanel.css('background-image', 'url(' + jQCurrentElement.data('activeImage') + ')');

    // Ensure overlay panel matches container height initially
    jQOverlayPanel.height(jQCurrentElement.height());

    // Adjust initial X position if it's out of bounds
    if(currentXPos < minimumLeftBound) {
      currentXPos = minimumLeftBound;
    }

    // Adjust initial Y position if it's out of bounds
    if(currentYPos < minimumTopBound) {
      currentYPos = minimumTopBound;
    }

    // Add visual indicators to the grabber and set its initial position
    jQInteractionGrabber.append('<span class="left-indicator arrow-left"></span><span class="right-indicator arrow-right"/></span>');
    jQInteractionGrabber.css('left', currentXPos);
    jQInteractionGrabber.css('top', currentYPos);

    // Determine and apply panel orientation
    //----------------------------------

    if (preferences.orientation === "sideToSide") {
      jQOverlayPanel.width(currentXPos);
      jQOverlayPanel.css('border-right', '1px solid #CCC');
    }

    else if (preferences.orientation === "upDown") {
      jQCurrentElement.height(jQOverlayPanel.height());
      jQOverlayPanel.height(currentYPos);
      jQOverlayPanel.css('border-bottom', '1px solid #CCC');
      jQInteractionGrabber.addClass('upright-mode');
    }

    // Enable Drag Functionality
    //----------------------------------

    jQInteractionGrabber.on('pointerDown', function(mouseEvent) {

      mouseEvent.preventDefault(); // Prevent default browser drag behavior
      jQInteractionGrabber.addClass('movable-element');
      previousCoordX = parseInt(jQInteractionGrabber.css('left'), 10);
      dragStartPointX = mouseEvent.pageX;
      previousCoordY = parseInt(jQInteractionGrabber.css('top'), 10);
      dragStartPointY = mouseEvent.pageY;

    });

    jQ(document).on('pointerUp', function(releaseEvent) {
      jQInteractionGrabber.removeClass('movable-element');
    });

    // Attach the movement handler to the container
    jQCurrentElement.bind('pointerMove', movementHandler);

    // Function to handle mouse movement for dragging
    function movementHandler(motionEvent) {

      var computedLeft = previousCoordX + (motionEvent.pageX - dragStartPointX);
      if (computedLeft < minimumLeftBound) computedLeft = minimumLeftBound;
      else if (computedLeft > maximumLeftBound) computedLeft = maximumLeftBound;

      jQ('.movable-element').css('left', computedLeft);

      var computedTop = previousCoordY + (motionEvent.pageY - dragStartPointY);
      if (computedTop < minimumTopBound) computedTop = minimumTopBound;
      else if (computedTop > maximumTopBound) computedTop = maximumTopBound;

      jQ('.movable-element').css('top', computedTop);

      // Only adjust dimensions if an element is actively being dragged
      if (jQ('.movable-element').length) {
        updatePanelDimensions(computedLeft, computedTop);
      }

    }

    // Function to modify width or height of the overlay panel
    //------------------------------------

    function updatePanelDimensions(newPanelWidth, newPanelHeight) {

      if (preferences.orientation === "sideToSide") {
        jQOverlayPanel.width(newPanelWidth);
      }

      else if (preferences.orientation === "upDown") {
        jQOverlayPanel.height(newPanelHeight);
      }

    }

  }); // End of each element iteration

}; // End of plugin definition

})(jQuery); // Pass jQuery object