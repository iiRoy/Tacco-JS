/*
 * This script addresses the click delay on mobile WebKit browsers.
 *
 * The original implementation used 'ontouchstart' in document.documentElement for touch feature detection.
 *
 * A key modification was made to pass a completion function to the primary handler,
 * instead of directly dispatching a click event on the interacted element.
 *
 * A persistent problem, particularly observed on certain Android devices, involves
 * phantom click events occurring after the main action. A click handler was included
 * to mitigate these, though its activation is infrequent.
 */

// Constructor function to initialize the touch interaction handler.
function InteractionHandler(targetElement, actionFunction) {
  // Determine if the provided element is an object or an ID string, then get the DOM element.
  this.triggeringElement = (typeof targetElement === 'object')
    ? targetElement
    : document.getElementById(targetElement);

  // Store the function to be executed upon a successful tap.
  this.completionRoutine = actionFunction;

  // Attach event listeners for touch start and click events to the element.
  // 'this' is passed as the listener to leverage the handleEvent method.
  this.triggeringElement.addEventListener('touchstart', this, false);
  this.triggeringElement.addEventListener('click', this, false);
}

// Define prototype methods for the InteractionHandler.
InteractionHandler.prototype = {

  // Central event handler for all events attached to the element.
  processEvent: function(eventData) {
    // A switch statement to dispatch events to specific handlers based on their type.
    switch (eventData.type) {
      case 'touchstart':
        this.onTouchInitiate(eventData);
        break;
      case 'touchmove':
        this.onTouchDrag(eventData);
        break;
      case 'touchend':
        this.onTouchTerminate(eventData);
        break;
      case 'click':
        this.onTapSuppress(eventData);
        break;
    }
  },

  // Handles the beginning of a touch interaction.
  onTouchInitiate: function(eventObj) {
    // Prevent default browser actions and stop event propagation.
    eventObj.preventDefault();
    eventObj.stopPropagation();
    this.hasDragged = false; // Initialize the drag flag.

    // Identify the precise element under the initial touch point.
    this.activeTarget = document.elementFromPoint(
      eventObj.targetTouches[0].clientX,
      eventObj.targetTouches[0].clientY
    );

    // If the identified target is a text node, use its parent element instead.
    if (this.activeTarget.nodeType === 3) {
      this.activeTarget = this.activeTarget.parentNode;
    }

    // Add a class to visually indicate the active state of the target.
    this.activeTarget.className += ' activeState';

    // Attach listeners for subsequent touch movement and release events.
    this.triggeringElement.addEventListener('touchmove', this, false);
    this.triggeringElement.addEventListener('touchend', this, false);
  },

  // Handles touch movement events.
  onTouchDrag: function(motionEvent) {
    this.hasDragged = true; // Set the flag indicating that movement has occurred.
    // Remove the active state class from the target, as it's no longer a simple tap.
    this.activeTarget.className = this.activeTarget.className.replace(/ ?activeState/gi, '');
  },

  // Handles the end of a touch interaction.
  onTouchTerminate: function(finishEvent) {
    // Prevent default browser actions and stop event propagation.
    finishEvent.preventDefault();
    finishEvent.stopPropagation();

    // Remove the temporary touchmove and touchend listeners.
    this.triggeringElement.removeEventListener('touchmove', this, false);
    this.triggeringElement.removeEventListener('touchend', this, false);

    // If no dragging occurred and a valid target was identified, execute the callback.
    if (!this.hasDragged && this.activeTarget) {
      // Ensure the active state class is removed before executing the routine.
      this.activeTarget.className = this.activeTarget.className.replace(/ ?activeState/gi, '');
      this.completionRoutine(this.activeTarget); // Invoke the stored action function.
    }

    // Clear the reference to the active target element.
    this.activeTarget = undefined;
  },

  // Handles standard click events, primarily to suppress ghost clicks.
  onTapSuppress: function(clickEvt) {
    clickEvt.stopPropagation(); // Prevent the click event from bubbling up.
    clickEvt.preventDefault(); // Prevent the default action for the click event.
    return false; // Explicitly return false to ensure suppression.
  }

};