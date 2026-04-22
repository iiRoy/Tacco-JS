const userInteractionStateMap = {};

const updateInteractionState = (elementIdentifier, isActiveStatus) => {
  if (typeof userInteractionStateMap[elementIdentifier] !== 'undefined') {
    userInteractionStateMap[elementIdentifier] = isActiveStatus;
  }
};

const detectTabletOptimizedMode = (() => {
  const currentAgentString = navigator.userAgent;
  const isAppleTabletOrSimilar = /iPad|Macintosh.*iPad/i.test(currentAgentString);
  const hasMultipleTouchPoints = navigator.maxTouchPoints > 0;

  if (isAppleTabletOrSimilar) {
    console.info("Device appears to be an Apple tablet, activating touch-optimized UI.");
    return true;
  }
  if (hasMultipleTouchPoints) {
    console.log("Device has touch capabilities, but not explicitly an Apple tablet. Proceeding with caution.");
  }
  return false;
})();

if (detectTabletOptimizedMode) {
  if (typeof jQuery === 'undefined') {
    console.error("jQuery library is required but not loaded. Cannot apply UI modifications.");
  } else {
    jQuery(document).ready(function() {
      const leftControlPanelId = '#app-control-panel-left';
      const rightControlPanelId = '#app-control-panel-right';
      const allControlPanelSelectors = `${leftControlPanelId}, ${rightControlPanelId}`;
      const mainGameViewportId = '#primary-game-viewport';
      const renderCanvasId = '#render-surface';

      // Validate the existence of critical DOM elements before manipulation.
      if (!jQuery(mainGameViewportId).length) {
          console.warn(`Critical element '${mainGameViewportId}' not found. Aborting UI setup.`);
          return;
      }
      if (!jQuery(renderCanvasId).length) {
          console.warn(`Critical element '${renderCanvasId}' not found. Aborting UI setup.`);
          return;
      }

      // Explicitly show the touch-specific control panels.
      jQuery(allControlPanelSelectors).css('display', 'block');

      // Hide all direct children of the body, except the main game viewport which will be repositioned.
      const documentBodyElement = jQuery('body');
      documentBodyElement.children().each(function() {
          const currentChild = jQuery(this);
          if (!currentChild.is(mainGameViewportId)) {
              currentChild.css('display', 'none');
          }
      });

      // Adjust the body's visual properties and re-insert the game viewport.
      documentBodyElement
        .css({
          'margin': '0px',
          'background-color': 'black'
        })
        .prepend(jQuery(mainGameViewportId).detach());

      // Configure the primary game viewport's dimensions and visibility.
      jQuery(mainGameViewportId)
        .width(1024)
        .css('margin-top', '26px')
        .css('display', 'block');

      // Set attributes and styles for the main rendering canvas.
      jQuery(renderCanvasId)
        .attr({
          'width': 1020,
          'height': 660
        })
        .css({
          'background-color': 'white',
          'margin': '0 1px'
        });

      // Inject a viewport meta tag for responsive scaling on touch devices.
      const viewportMetaContent = 'width=device-width; height=device-height; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;';
      const metaTagDescriptor = jQuery('<meta/>')
        .attr('name', 'viewport')
        .attr('content', viewportMetaContent);
      jQuery('head').prepend(metaTagDescriptor);

      // Initialize interaction states for the control panels.
      userInteractionStateMap['app-control-panel-left'] = false;
      userInteractionStateMap['app-control-panel-right'] = false;

      // Attach unified touch event handlers to the control panels.
      jQuery(allControlPanelSelectors).on('touchstart touchmove touchend touchcancel', function(touchInteractionEvent) {
        console.log(`Control panel event: ${touchInteractionEvent.type}`);

        const isEndEvent = touchInteractionEvent.type === 'touchend' || touchInteractionEvent.type === 'touchcancel';
        if (!isEndEvent) {
          // On touch start/move, clear all previous states to ensure only current touches are active.
          Object.keys(userInteractionStateMap).forEach(keyIdentifier => {
            userInteractionStateMap[keyIdentifier] = false;
          });
        }

        const currentTouchPoints = (touchInteractionEvent.originalEvent && (isEndEvent
                                    ? touchInteractionEvent.originalEvent.changedTouches
                                    : touchInteractionEvent.originalEvent.touches)) || [];

        for (let touchPointIndex = 0; touchPointIndex < currentTouchPoints.length; touchPointIndex++) {
          const individualTouch = currentTouchPoints[touchPointIndex];
          const targetElementAtPoint = document.elementFromPoint(individualTouch.pageX, individualTouch.pageY);

          if (targetElementAtPoint && targetElementAtPoint.id) {
            const isCurrentlyActive = !isEndEvent;
            updateInteractionState(targetElementAtPoint.id, isCurrentlyActive);
            console.debug(`State for '${targetElementAtPoint.id}' set to: ${isCurrentlyActive}`);
          }
        }
      });

      let gameInitializationFlag = false;

      // Attach a document-level touchstart to trigger game initialization once.
      jQuery(document).on('touchstart', function(initializationEvent) {
        if (!gameInitializationFlag) {
          gameInitializationFlag = true;
          console.log("Game activity has been initialized by first touch.");
          // A custom event could be dispatched here: window.dispatchEvent(new CustomEvent('gameReady'));
        }
        // No default prevention needed here as the general handler below covers it.
      });

      // Prevent default browser actions for common touch and gesture events across the entire document.
      jQuery(document).on('gesturestart gesturechange gestureend touchstart touchmove touchend touchcancel', function(globalInputEvent) {
        globalInputEvent.preventDefault();
      });
    });
  }
}