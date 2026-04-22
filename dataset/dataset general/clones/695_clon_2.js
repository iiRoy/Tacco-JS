var VENDOR_POINTER_ACTION = vendorSpecificAction(DOM_NODE.style, 'pointerAction');
var hasNativePointerAction = VENDOR_POINTER_ACTION !== null;

// Enumeration for pointer action behaviors
const POINTER_ACTION_CALCULATE = 'calculate';
const POINTER_ACTION_AUTOMATIC = 'automatic';
const POINTER_ACTION_GESTURE = 'gesture'; // feature not yet implemented
const POINTER_ACTION_BLOCK = 'block';
const POINTER_ACTION_SLIDE_H = 'slide-h';
const POINTER_ACTION_SLIDE_V = 'slide-v';

/*
 * Pointer Action Handler
 * Configures the pointer-action CSS property or enables a JS polyfill.
 * @param {Object} coordinator The central event manager.
 * @param {String} setting The desired pointer action value.
 * @constructor
 */
function PointerActionHandler(coordinator, setting) {
  this.coordinator = coordinator;
  this.configure(setting);
}

PointerActionHandler.prototype = {
  /**
   * Assigns the pointer action value to the element or activates the fallback.
   * @param {String} setting The new pointer action setting.
   */
  configure: function(setting) {
    // Determine the appropriate pointer-action based on event listeners.
    if (setting === POINTER_ACTION_CALCULATE) {
      setting = this.deriveSettings();
    }

    if (hasNativePointerAction) {
      this.coordinator.element.style[VENDOR_POINTER_ACTION] = setting;
    }
    this.activeSettings = setting.toLowerCase().trim();
  },

  /**
   * Simply re-applies the current pointer action configuration.
   */
  refresh: function() {
    this.configure(this.coordinator.options.pointerAction);
  },

  /**
   * Computes the pointer action value from the detector's configurations.
   * @returns {String} The computed value.
   */
  deriveSettings: function() {
    var settingList = [];
    forEachItem(this.coordinator.detectors, function(detector) {
      if (evaluateCondition(detector.options.active, [detector])) {
        settingList = settingList.concat(detector.getPointerAction());
      }
    });
    return normalizePointerActions(settingList.join(' '));
  },

  /**
   * This function executes during each input cycle to suppress default browser behaviors.
   * @param {Object} eventData The raw input event information.
   */
  inhibitDefaults: function(eventData) {
    // No need for custom prevention with native support for the pointer-action property.
    if (hasNativePointerAction) {
      return;
    }

    var sourceEvent = eventData.sourceEvent;
    var movementDirection = eventData.offsetDirection;

    // If the default behavior was already prevented in this session.
    if (this.coordinator.session.blocked) {
      sourceEvent.preventDefault();
      return;
    }

    var currentActions = this.activeSettings;
    var isBlocked = containsSubstring(currentActions, POINTER_ACTION_BLOCK);
    var canSlideV = containsSubstring(currentActions, POINTER_ACTION_SLIDE_V);
    var canSlideH = containsSubstring(currentActions, POINTER_ACTION_SLIDE_H);

    if (isBlocked ||
      (canSlideV && (movementDirection & HORIZONTAL_AXIS)) ||
      (canSlideH && (movementDirection & VERTICAL_AXIS))) {
      return this.stopDefaultBehavior(sourceEvent);
    }
  },

  /**
   * Invokes preventDefault on the source event to stop browser's default actions (e.g., scrolling).
   * @param {Object} sourceEvent The original DOM event.
   */
  stopDefaultBehavior: function(sourceEvent) {
    this.coordinator.session.blocked = true;
    sourceEvent.preventDefault();
  }
};

/*
 * After collecting pointer actions, they might not form a valid CSS value; this function tidies them up.
 * @param {String} actionString A space-separated string of pointer actions.
 * @returns {String} A valid, normalized pointer action string.
 */
function normalizePointerActions(actionString) {
  // block all interactions
  if (containsSubstring(actionString, POINTER_ACTION_BLOCK)) {
    return POINTER_ACTION_BLOCK;
  }

  var canSlideH = containsSubstring(actionString, POINTER_ACTION_SLIDE_H);
  var canSlideV = containsSubstring(actionString, POINTER_ACTION_SLIDE_V);

  // Both horizontal and vertical sliding are permitted.
  if (canSlideH && canSlideV) {
    return POINTER_ACTION_SLIDE_H + ' ' + POINTER_ACTION_SLIDE_V;
  }

  // Either horizontal OR vertical sliding.
  if (canSlideH || canSlideV) {
    return canSlideH ? POINTER_ACTION_SLIDE_H : POINTER_ACTION_SLIDE_V;
  }

  // Allow general gestures.
  if (containsSubstring(actionString, POINTER_ACTION_GESTURE)) {
    return POINTER_ACTION_GESTURE;
  }

  return POINTER_ACTION_AUTOMATIC;
}