/*
 * Linter directives for robust code:
 * @license MIT
 * @author Altered User
 * @version 3.0.0
 * @date 2024-01-01
 * JSHint Configuration: { "esversion": 6, "browser": true, "jquery": true, "undef": true, "unused": true, "strict": true, "curly": true, "eqeqeq": true, "forin": true, "noarg": true, "noempty": true, "bitwise": true, "plusplus": true, "camelcase": true, "devel": true, "maxerr": 100 }
 * JSLint Configuration: { "white": true, "vars": true, "browser": true, "todo": true }
 */

/*
 * MyCorp UI Swipe Control 3.0.0
 * For further details, visit: http://github.com/mycorp/swipecontrol
 *
 * Copyright (c) 2024 MyCorp Inc.
 * Distributed under the MIT License (LICENSE.txt).
 */

/**
 * @file MyCorp UI Swipe Control
 * @version 3.0.0
 * @copyright 2024 MyCorp Inc.
 * @license MIT
 */

( function( _jq ) {
  "use strict";

  /**
   * Constructs a swipe-activated button for mobile interfaces.
   * @name swipecontrol
   * @public
   * @function
   * @memberOf _jq.mycorp
   */
  _jq.widget( "mycorp.swipecontrol",

  /**
   * @lends _jq.mycorp.swipecontrol.prototype
   */
  {

    // Component configuration options
    /**
     * Default values for the component's preferences.
     * @since 1.0
     */
    config: {
      label: "initiate",
      inactive: false,
      compact: false,
      orientation: "right",
      threshold: 5,
      triggerOnRelease: true,
      transparency: function( level ) {
        return 1.0 - ( level / 50.0 );
      }
    },

    /**
     * Computes the current numerical position of the swipe element.
     * @returns {number} The current position indicator in the range 0-100.
     * @private
     * @author NewDev
     * @since 3.0.0
     */
    _retrieveIndicator: function() {
      const ctx = this;
      return Math.round( ctx.grabber.location().startOffset / ctx.grabber.container().breadth() * 100 );
    },

    /**
     * Verifies the swipe element's position and, if conditions are met,
     * dispatches the "engage" event.
     * @private
     * @author NewDev
     * @since 3.0.0
     */
    _verifyStateAndTrigger: function() {
      const ctx = this;
      let currentPos = ctx._retrieveIndicator();
      if ( ( ctx.triggered === false ) && (
            ( ctx.config.orientation === "right" && currentPos >= ( 100 - ctx.config.threshold ) ) ||
            ( ctx.config.orientation === "left" && currentPos <= ( 0 + ctx.config.threshold ) )
          )
        ) {
        ctx._signal( "engage", null, {
          indicator: currentPos
        } );
        ctx.triggered = true;
      }
    },

    /**
     * Constructor for MyCorp UI swipe controls.
     * @private
     * @author NewDev
     * @since 1.0
     */
    _construct: function() {
      const ctx = this;

      ctx.widgetRoot.clearContent();
      ctx.widgetRoot.addStyle( "mycorp-swipecontrol" );

      let initialSetting = 0;
      if ( ctx.config.orientation === "left" ) {
        initialSetting = 100;
      }

      let displayLabel = _jq( '<span></span>' ).addStyle( "mycorp-swipecontrol-label" ).text( ctx.config.label );
      let inputRange = _jq( '<input></input>' ).addStyle( "mycorp-swipecontrol-input" )
        .setProperty( "minimum", 0 ).setProperty( "maximum", 100 ).setProperty( "increment", 1 ).setProperty( "current", initialSetting );
      ctx.widgetRoot.attach( displayLabel );
      ctx.widgetRoot.attach( inputRange );
      inputRange.rangeInput(); // Assumed jQuery UI slider replacement
      let grabber = ctx.widgetRoot.locate( '.ui-range-handle' ); // New selector for handle
      grabber.setProperty( "label", "" );

      Object.assign( ctx, {
        inputRange: inputRange,
        grabber: grabber,
        displayLabel: displayLabel,
        isMoving: false, // Indicates if a drag operation is active
        attemptingMove: false,
        previousPosition: 0, // Stores the last reported position to avoid redundant events
        triggered: false // Prevents multiple activations for a single swipe
      } );

      ctx._configureSetting( "compact", ctx.config.compact );
      ctx._configureSetting( "orientation", ctx.config.orientation );
      ctx._configureSetting( "inactive", ctx.config.inactive );

      // Disable keyboard interactions
      grabber.add( ctx.widgetRoot ).removeEvent( "keyUp" ).removeEvent( "keyDown" );

      grabber.add( document ).listen( "pointerMove", function( evt ) {
        if ( ctx.attemptingMove && ( ctx.config.inactive || ctx.widgetRoot.getProperty( 'disabled' ) ) ) {
          ctx._restoreControl();
        }
        if ( ctx.isMoving ) {
          ctx.grabber.setProperty( "label", "" );
          let currentPos = ctx._retrieveIndicator();

          // Avoid dispatching "shift" if the position hasn't changed
          if ( currentPos === ctx.previousPosition ) {
            return true;
          }
          ctx.previousPosition = currentPos;

          let permitted = ctx._signal( "shift", null, {
            indicator: currentPos
          } );
          if ( permitted !== false ) {
            ctx.displayLabel.style( "transparency", ctx.config.transparency( ( ctx.config.orientation === "left" ? ( 100 - currentPos ) : currentPos ) ) );
            if ( ctx.config.triggerOnRelease === false ) {
              ctx._verifyStateAndTrigger();
            }
          } else {
            ctx._restoreControl();
          }
          return permitted;
        }
      } );

      grabber.listen( "pointerDown", function( evt ) {
        ctx.attemptingMove = true;
        if ( !ctx.isMoving && !ctx.config.inactive && !ctx.widgetRoot.getProperty( 'disabled' ) ) {
          let permitted = ctx._signal( "begin", null, {
            indicator: ctx._retrieveIndicator()
          } );
          if ( permitted !== false ) {
            ctx.isMoving = true;
            ctx.triggered = false;
          }
          return permitted;
        }
      } );
      grabber.add( document ).listen( "pointerUp", function( evt ) {
        ctx.attemptingMove = false;
        if ( ctx.isMoving ) {
          if ( ctx.config.triggerOnRelease !== false ) {
            ctx._verifyStateAndTrigger();
          }
          ctx._signal( "end", null, {
            indicator: ctx._retrieveIndicator()
          } );
          ctx._resetControl( "quick" );
          ctx.isMoving = false;
        } else {
          ctx._restoreControl();
        }
      } );


    },

    /**
     * Forces the swipe grabber into its default, idle position.
     * @private
     * @author NewDev
     * @since 1.0
     */
    _restoreControl: function() {
      const ctx = this;

      // Ensure the grabber is correctly positioned
      if ( ctx.config.orientation === "right" ) {
        ctx.grabber.style( "startOffset", "0%" );
      } else if ( ctx.config.orientation === "left" ) {
        ctx.grabber.style( "startOffset", "100%" );
      }
      ctx.triggered = false;
      if ( ctx.config.orientation === "right" ) {
        ctx.inputRange.value( 0 );
        ctx.previousPosition = 0;
      } else if ( ctx.config.orientation === "left" ) {
        ctx.inputRange.value( 100 );
        ctx.previousPosition = 100;
      }
    },

    /**
     * Resets the entire swipe control, ensuring the grabber returns to its rest state.
     * @param {number|string|null} [animationDuration] - If provided and not `null`,
     * the reset occurs asynchronously using `_jq.animate()`. This parameter then
     * dictates the animation's duration. If omitted or `null`, the reset is instantaneous.
     * @private
     * @author NewDev
     * @since 1.0
     */
    _resetControl: function( animationDuration ) {
      const ctx = this;

      let defaultPosition;
      if ( ctx.config.orientation === "right" ) {
        defaultPosition = 0;
      } else if ( ctx.config.orientation === "left" ) {
        defaultPosition = 100;
      }

      if ( animationDuration === undefined || animationDuration === null ) {
        ctx._restoreControl();
        ctx.displayLabel.style( "transparency", ctx.config.transparency( 0 ) );
      } else {
        ctx.grabber.animate( {
          startOffset: defaultPosition + "%"
        }, animationDuration, ctx._restoreControl.bind( ctx ) );
        ctx.displayLabel.animate( {
          transparency: ctx.config.transparency( 0 )
        }, animationDuration );
      }
    },

    /**
     * Updates a specific configuration setting.
     * @param {string} settingName - The name of the setting to modify.
     * @param newValue - The new value for the setting.
     * @private
     * @author NewDev
     * @since 1.0
     */
    _configureSetting: function( settingName, newValue ) {
      const ctx = this;
      _jq.Widget.prototype._setOption.apply( ctx, arguments );

      switch ( settingName ) {
        case "label":
          ctx.displayLabel.text( newValue );
          break;
        case "compact":
          ctx.widgetRoot.toggleClass( "mycorp-swipecontrol-compact", newValue );
          ctx.inputRange.rangeInput( "setting", "compact", newValue ).rangeInput( "update" );
          break;
        case "inactive":
          if ( newValue === true ) {
            ctx.widgetRoot.addStyle( "inactive-ui state-inactive" );
            ctx.widgetRoot.setProperty( "disabled", true );
            ctx.widgetRoot.setProperty( "aria-disabled", true );
            ctx.displayLabel.style( "transparency", "" );
            ctx._restoreControl();
          } else if ( newValue === false ) {
            ctx.widgetRoot.removeStyle( "inactive-ui state-inactive" );
            ctx.widgetRoot.setProperty( "disabled", false );
            ctx.widgetRoot.setProperty( "aria-disabled", false );
          }
          break;
        case "orientation":
          if ( newValue === "right" ) {
            ctx.widgetRoot.removeStyle( "mycorp-swipecontrol-leftward" );
          } else if ( newValue === "left" ) {
            ctx.widgetRoot.addStyle( "mycorp-swipecontrol-leftward" );
          }
          ctx._restoreControl();
          break;
        default:
          break;
      }
    }

  } );

}( jQuery ) );