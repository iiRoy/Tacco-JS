var PREFIXED_TOUCH_ACTION = prefixed ( TEST_ELEMENT.style, 'touchAction' );
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

//  These constants define the possible values for the touch-action CSS property,
//  which controls how touch events are handled by the browser.
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
/* This touch action value is currently not supported or implemented. */
var TOUCH_ACTION_MANIPULATION = 'manipulation';
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';


/**
 *  @class TouchAction
 *  Manages the touch-action property of an element, enabling
 *  or disabling default browser touch behaviors.
 *  It can utilize native CSS `touch-action` or a JavaScript polyfill.
 *
 *  @param {Manager} manager  The Hammer.js Manager instance.
 *  @param {String}  value    The initial touch action configuration.
 *  @constructor
 */
function TouchAction ( manager, value ) {
  this.manager = manager; //  Store the manager instance for later use.
  this.set ( value );     //  Initialize the touch action with the provided value.
}

TouchAction.prototype = {
  /**
   *  Applies the specified touch action value to the managed element.
   *  This method dynamically determines if native support is available
   *  or if the JavaScript polyfill logic should be engaged.
   *
   *  @param {String} value  The touch action string to be set.
   */
  set: function ( value ) {
    //  If 'compute' is passed, the actual touch-action is derived from active recognizers.
    if ( value == TOUCH_ACTION_COMPUTE ) {
      value = this.compute ( );
    }

    //  If the browser supports native `touch-action`, apply it directly to the element's style.
    if ( NATIVE_TOUCH_ACTION ) {
      this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
    }
    //  Store the processed touch action values, ensuring they are lowercase and trimmed.
    this.actions = value.toLowerCase ( ).trim ( );
  },

  /*
   *  Re-evaluates and applies the touch action based on the manager's current options.
   *  This is typically called when recognizer configurations change.
   */
  update: function ( ) {
    this.set ( this.manager.options.touchAction ); //  Retrieve and set the latest touchAction from options.
  },

  /**
   *  Calculates the aggregate `touch-action` value by inspecting
   *  the settings of all enabled recognizers associated with the manager.
   *
   *  @returns {String} The computed and cleaned touch action string.
   */
  compute: function ( ) {
    var actions = [ ]; //  Initialize an array to collect touch action fragments.

    //  Iterate through all registered recognizers.
    each ( this.manager.recognizers, function ( recognizer ) {
      //  Only include actions from recognizers that are currently enabled.
      if ( boolOrFn ( recognizer.options.enable, [ recognizer ] ) ) {
        actions = actions.concat ( recognizer.getTouchAction ( ) ); //  Collect touch actions.
      }
    } );
    //  Join the collected actions and clean them up into a valid CSS touch-action value.
    return cleanTouchActions ( actions.join ( ' ' ) );
  },

  /**
   *  This method is invoked during each input cycle to prevent
   *  default browser behaviors (e.g., scrolling, zooming) based on
   *  the element's computed `touch-action`.
   *
   *  @param {Object} input  The input event data object.
   */
  preventDefaults: function ( input ) {
    //  If native `touch-action` is supported, the browser handles prevention,
    //  so no JavaScript intervention is needed.
    if ( NATIVE_TOUCH_ACTION ) {
      return; //  Exit early.
    }

    var srcEvent = input.srcEvent;       //  The original DOM event.
    var direction = input.offsetDirection; //  The detected direction of movement.

    //  If a default action has already been prevented in the current session,
    //  continue preventing it for subsequent events in this session.
    if ( this.manager.session.prevented ) {
      srcEvent.preventDefault ( );
      return;
    }

    var actions = this.actions; //  The current effective touch actions.

    //  Check for the presence of specific touch action keywords.
    var hasNone = inStr ( actions, TOUCH_ACTION_NONE );
    var hasPanY = inStr ( actions, TOUCH_ACTION_PAN_Y );
    var hasPanX = inStr ( actions, TOUCH_ACTION_PAN_X );

    //  Determine if the default event behavior should be prevented.
    //  Prevention occurs if:
    //  - `TOUCH_ACTION_NONE` is active.
    //  - `TOUCH_ACTION_PAN_Y` is active AND the movement is horizontal.
    //  - `TOUCH_ACTION_PAN_X` is active AND the movement is vertical.
    if ( hasNone ||
         ( hasPanY && direction & DIRECTION_HORIZONTAL ) ||
         ( hasPanX && direction & DIRECTION_VERTICAL ) ) {
      return this.preventSrc ( srcEvent ); //  Trigger the actual prevention.
    }
  },

  /**
   *  A helper function to mark the current session as 'prevented'
   *  and call `preventDefault()` on the source event.
   *
   *  @param {Object} srcEvent  The source event object to prevent.
   */
  preventSrc: function ( srcEvent ) {
    this.manager.session.prevented = true; //  Set a flag indicating prevention.
    srcEvent.preventDefault ( );           //  Execute `preventDefault` on the event.
  }
}; //  End of TouchAction.prototype definition


/**
 *  This utility function processes a raw string of collected touch actions,
 *  resolving conflicts and combining them into a single, valid `touch-action` CSS value.
 *
 *  @param {String} actions  A space-separated string containing various touch action tokens.
 *  @returns {String}        A canonical, cleaned touch action string.
 */
function cleanTouchActions ( actions ) {
  //  Rule 1: If 'none' is present, it takes precedence over all other actions.
  if ( inStr ( actions, TOUCH_ACTION_NONE ) ) {
    return TOUCH_ACTION_NONE;
  }

  //  Check for the individual pan actions.
  var hasPanX = inStr ( actions, TOUCH_ACTION_PAN_X );
  var hasPanY = inStr ( actions, TOUCH_ACTION_PAN_Y );

  //  Rule 2: 'pan-x' and 'pan-y' can be combined.
  if ( hasPanX && hasPanY ) {
    return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
  }

  //  Rule 3: If only one pan action is present, return it.
  if ( hasPanX || hasPanY ) {
    return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
  }

  //  Rule 4: If 'manipulation' is present and no pan actions, return it.
  if ( inStr ( actions, TOUCH_ACTION_MANIPULATION ) ) {
    return TOUCH_ACTION_MANIPULATION;
  }

  //  Rule 5: If no specific actions are determined, default to 'auto'.
  return TOUCH_ACTION_AUTO;
}