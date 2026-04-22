/*
 * React v0.11.2 - This is a Type I clone.
 * Original source: A minified/bundled version of React.
 */
!function( e )
{
  // Check for CommonJS environment (Node.js, Browserify, Webpack)
  if ( "object" == typeof exports && "undefined" != typeof module ) {
    module.exports = e();
  }
  // Check for AMD environment (RequireJS)
  else if ( "function" == typeof define && define.amd ) {
    define( [], e );
  }
  // Otherwise, assume a browser global environment
  else
  {
    var f;

    // Determine the global object (window, global, self)
    "undefined" != typeof window ? f = window :
    "undefined" != typeof global ? f = global :
    "undefined" != typeof self && ( f = self ) ;

    // Assign the React library to the global object
    f.React = e();
  }
} ( function ()
{
  // These variables are typically defined by module loaders
  var define, module, exports;

  // The core module loading and bundling logic (Browserify-like)
  return ( function e( t, n, r )
  {
    // Inner function 's' to handle module loading
    function s( o, u )
    {
      if ( !n[ o ] )
      {
        if ( !t[ o ] )
        {
          var a = typeof require == "function" && require;

          if ( !u && a )
          {
            return a( o, !0 );
          }

          if ( i )
          {
            return i( o, !0 );
          }

          // Error if module cannot be found
          throw new Error( "Cannot find module '" + o + "'" );
        }

        var f = n[ o ] = { exports: {} };

        t[ o ][ 0 ].call(
          f.exports,
          function( e )
          {
            var n = t[ o ][ 1 ][ e ];
            return s( n ? n : e );
          },
          f,
          f.exports,
          e,
          t,
          n,
          r
        );
      }
      return n[ o ].exports;
    }

    var i = typeof require == "function" && require;

    // Load all required modules
    for ( var o = 0; o < r.length; o++ )
    {
      s( r[ o ] );
    }

    return s;
  } ) (
  {
    1: [ function( _dereq_, module, exports )
    {
      /*
       * Copyright 2013-2014 Facebook, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
       * @providesModule AutoFocusMixin
       * @typechecks static-only
       */

      "use strict"; // Enforce strict mode for better code quality

      var focusNode = _dereq_( "./focusNode" ); // Import helper for focusing DOM nodes

      /**
       * AutoFocusMixin
       * A mixin for components that need to automatically focus on mount.
       */
      var AutoFocusMixin = {

        /**
         * Invoked once, immediately after the initial rendering of the component.
         */
        componentDidMount: function()
        {
          // Check if the autoFocus prop is set to true
          if ( this.props.autoFocus )
          {
            // Focus the underlying DOM node
            focusNode( this.getDOMNode() );
          }
        }
      };

      // Export the AutoFocusMixin for use by other modules
      module.exports = AutoFocusMixin;

    }, { "./focusNode": 106 } ],
    2: [ function( _dereq_, module, exports )
    {
      /*
       * Copyright 2013 Facebook, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
       * @providesModule BeforeInputEventPlugin
       * @typechecks static-only
       */

      "use strict";

      // Module dependencies
      var EventConstants      = _dereq_( "./EventConstants" );
      var EventPropagators    = _dereq_( "./EventPropagators" );
      var ExecutionEnvironment = _dereq_( "./ExecutionEnvironment" );
      var SyntheticInputEvent = _dereq_( "./SyntheticInputEvent" );

      var keyOf = _dereq_( "./keyOf" ); // Utility for creating keys

      // Determine if the browser supports the native 'textInput' event
      var canUseTextInputEvent = (
        ExecutionEnvironment.canUseDOM &&
        'TextEvent' in window &&
        !( 'documentMode' in document || isPresto() )
      );

      /**
       * Opera <= 12 includes TextEvent in window, but does not fire
       * text input events. Rely on keypress instead.
       * This function checks if the browser is an older Opera version.
       */
      function isPresto()
      {
        var opera = window.opera;
        return (
          typeof opera === 'object' &&
          typeof opera.version === 'function' &&
          parseInt( opera.version(), 10 ) <= 12
        );
      }

      // Constants for spacebar key
      var SPACEBAR_CODE = 32;
      var SPACEBAR_CHAR = String.fromCharCode( SPACEBAR_CODE );

      // Get top-level event types from EventConstants
      var topLevelTypes = EventConstants.topLevelTypes;

      // Definition of event types for this plugin.
      // 'beforeInput' is the synthetic event we want to generate.
      var eventTypes = {
        beforeInput: {
          phasedRegistrationNames: {
            bubbled: keyOf( { onBeforeInput: null } ),
            captured: keyOf( { onBeforeInputCapture: null } )
          },
          // Dependencies are native events that can trigger 'beforeInput'
          dependencies: [
            topLevelTypes.topCompositionEnd,
            topLevelTypes.topKeyPress,
            topLevelTypes.topTextInput,
            topLevelTypes.topPaste
          ]
        }
      };

      // Variable to track characters inserted via keypress and composition events.
      var fallbackChars = null;

      /**
       * Determines if a native keypress event is considered a command.
       * Firefox fires `keypress` for key commands (cut, copy, select-all)
       * even when no character is inserted.
       * @param {object} nativeEvent - The native browser event.
       * @return {boolean} True if the keypress is a command, false otherwise.
       */
      function isKeypressCommand( nativeEvent )
      {
        return (
          ( nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey ) &&
          // ctrlKey && altKey is equivalent to AltGr, and is not a command.
          !( nativeEvent.ctrlKey && nativeEvent.altKey )
        );
      }

      /**
       * Create an `onBeforeInput` event to match
       * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
       *
       * This event plugin is based on the native `textInput` event
       * available in Chrome, Safari, Opera, and IE. This event fires after
       * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
       *
       * `beforeInput` is spec'd but not implemented in any browsers, and
       * the `input` event does not provide any useful information about what has
       * actually been added, contrary to the spec. Thus, `textInput` is the best
       * available event to identify the characters that have actually been inserted
       * into the target node.
       */
      var BeforeInputEventPlugin = {

        eventTypes: eventTypes,

        /**
         * Extracts synthetic events from a native event.
         * @param {string} topLevelType Record from `EventConstants`.
         * @param {DOMEventTarget} topLevelTarget The listening component root node.
         * @param {string} topLevelTargetID ID of `topLevelTarget`.
         * @param {object} nativeEvent Native browser event.
         * @return {*} An accumulation of synthetic events.
         * @see {EventPluginHub.extractEvents}
         */
        extractEvents: function(
            topLevelType,
            topLevelTarget,
            topLevelTargetID,
            nativeEvent
        )
        {
          var chars; // Variable to store characters to be inserted.

          if ( canUseTextInputEvent )
          {
            // If native textInput events are available, prioritize them.
            switch ( topLevelType )
            {
              case topLevelTypes.topKeyPress:
                /**
                 * If native `textInput` events are available, our goal is to make
                 * use of them. However, there is a special case: the spacebar key.
                 * In Webkit, preventing default on a spacebar `textInput` event
                 * cancels character insertion, but it *also* causes the browser
                 * to fall back to its default spacebar behavior of scrolling the
                 * page.
                 *
                 * Tracking at:
                 * https://code.google.com/p/chromium/issues/detail?id=355103
                 *
                 * To avoid this issue, use the keypress event as if no `textInput`
                 * event is available.
                 */
                var which = nativeEvent.which;
                if ( which !== SPACEBAR_CODE )
                {
                  return; // Not a spacebar, let textInput handle it.
                }

                chars = String.fromCharCode( which ); // Spacebar character
                break;

              case topLevelTypes.topTextInput:
                // Record the characters to be added to the DOM.
                chars = nativeEvent.data;

                // If it's a spacebar character, assume that we have already handled
                // it at the keypress level and bail immediately.
                if ( chars === SPACEBAR_CHAR )
                {
                  return;
                }

                // Otherwise, carry on.
                break;

              default:
                // For other native event types, do nothing.
                return;
            }
          }
          else
          {
            // Fallback for browsers that don't support native textInput events.
            switch ( topLevelType )
            {
              case topLevelTypes.topPaste:
                // If a paste event occurs after a keypress, throw out the input
                // chars. Paste events should not lead to BeforeInput events.
                fallbackChars = null;
                break;

              case topLevelTypes.topKeyPress:
                /**
                 * As of v27, Firefox may fire keypress events even when no character
                 * will be inserted. A few possibilities:
                 *
                 * - `which` is `0`. Arrow keys, Esc key, etc.
                 *
                 * - `which` is the pressed key code, but no char is available.
                 *   Ex: 'AltGr + d` in Polish. There is no modified character for
                 *   this key combination and no character is inserted into the
                 *   document, but FF fires the keypress for char code `100` anyway.
                 *   No `input` event will occur.
                 *
                 * - `which` is the pressed key code, but a command combination is
                 *   being used. Ex: `Cmd+C`. No character is inserted, and no
                 *   `input` event will occur.
                 */
                if ( nativeEvent.which && !isKeypressCommand( nativeEvent ) )
                {
                  fallbackChars = String.fromCharCode( nativeEvent.which );
                }
                break;

              case topLevelTypes.topCompositionEnd:
                fallbackChars = nativeEvent.data;
                break;
            }

            // If no changes have occurred to the fallback string, no relevant
            // event has fired and we're done.
            if ( fallbackChars === null )
            {
              return;
            }

            chars = fallbackChars; // Assign collected chars for processing.
          }

          // If no characters are being inserted, no BeforeInput event should
          // be fired.
          if ( !chars )
          {
            return;
          }

          // Create a new synthetic input event
          var event = SyntheticInputEvent.getPooled(
            eventTypes.beforeInput,
            topLevelTargetID,
            nativeEvent
          );

          event.data = chars; // Set the character data
          fallbackChars = null; // Reset fallback characters
          EventPropagators.accumulateTwoPhaseDispatches( event ); // Accumulate event listeners
          return event; // Return the synthetic event
        }
      };

      module.exports = BeforeInputEventPlugin;

    }, { "./EventConstants": 15, "./EventPropagators": 20, "./ExecutionEnvironment": 21, "./SyntheticInputEvent": 86, "./keyOf": 127 } ],
    3: [ function( _dereq_, module, exports )
    {
      /*
       * Copyright 2013-2014 Facebook, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
       * @providesModule CSSProperty
       */

      "use strict";

      /**
       * CSS properties which accept numbers but are not in units of "px".
       * This object helps determine if a numeric style value should have 'px' appended.
       */
      var isUnitlessNumber = {
        columnCount: true,
        fillOpacity: true,
        flex: true,
        flexGrow: true,
        flexShrink: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        widows: true,
        zIndex: true,
        zoom: true
      };

      /**
       * Prefixes a CSS property key with a vendor prefix.
       * @param {string} prefix vendor-specific prefix, eg: Webkit
       * @param {string} key style name, eg: transitionDuration
       * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
       * WebkitTransitionDuration
       */
      function prefixKey( prefix, key )
      {
        return prefix + key.charAt( 0 ).toUpperCase() + key.substring( 1 );
      }

      /**
       * Support style names that may come passed in prefixed by adding permutations
       * of vendor prefixes to the `isUnitlessNumber` map.
       */
      var prefixes = [ 'Webkit', 'ms', 'Moz', 'O' ];

      // Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
      // infinite loop, because it iterates over the newly added props too.
      Object.keys( isUnitlessNumber ).forEach( function( prop )
      {
        prefixes.forEach( function( prefix )
        {
          isUnitlessNumber[ prefixKey( prefix, prop ) ] = isUnitlessNumber[ prop ];
        } );
      } );

      /**
       * Most style properties can be unset by doing .style[prop] = '' but IE8
       * doesn't like doing that with shorthand properties so for the properties that
       * IE8 breaks on, which are listed here, we instead unset each of the
       * individual properties. See http://bugs.jquery.com/ticket/12385.
       * The 4-value 'clock' properties like margin, padding, border-width seem to
       * behave without any problems. Curiously, list-style works too without any
       * special prodding.
       * This object maps shorthand properties to their expanded individual properties.
       */
      var shorthandPropertyExpansions = {
        background: {
          backgroundImage: true,
          backgroundPosition: true,
          backgroundRepeat: true,
          backgroundColor: true
        },
        border: {
          borderWidth: true,
          borderStyle: true,
          borderColor: true
        },
        borderBottom: {
          borderBottomWidth: true,
          borderBottomStyle: true,
          borderBottomColor: true
        },
        borderLeft: {
          borderLeftWidth: true,
          borderLeftStyle: true,
          borderLeftColor: true
        },
        borderRight: {
          borderRightWidth: true,
          borderRightStyle: true,
          borderRightColor: true
        },
        borderTop: {
          borderTopWidth: true,
          borderTopStyle: true,
          borderTopColor: true
        },
        font: {
          fontStyle: true,
          fontVariant: true,
          fontWeight: true,
          fontSize: true,
          lineHeight: true,
          fontFamily: true
        }
      };

      /**
       * CSSProperty module exports information about CSS properties.
       */
      var CSSProperty = {
        isUnitlessNumber: isUnitlessNumber,
        shorthandPropertyExpansions: shorthandPropertyExpansions
      };

      module.exports = CSSProperty;

    }, {} ],
    4: [ function( _dereq_, module, exports )
    {
      /*
       * Copyright 2013-2014 Facebook, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
       * @providesModule CSSPropertyOperations
       * @typechecks static-only
       */

      "use strict";

      var CSSProperty         = _dereq_( "./CSSProperty" );

      var dangerousStyleValue   = _dereq_( "./dangerousStyleValue" );
      var hyphenateStyleName  = _dereq_( "./hyphenateStyleName" );
      var memoizeStringOnly   = _dereq_( "./memoizeStringOnly" );

      // Memoized function to hyphenate style names for CSS output
      var processStyleName = memoizeStringOnly( function( styleName )
      {
        return hyphenateStyleName( styleName );
      } );

      /**
       * Operations for dealing with CSS properties.
       * This module provides utilities for serializing and applying CSS styles.
       */
      var CSSPropertyOperations = {

        /**
         * Serializes a mapping of style properties for use as inline styles:
         *
         *   > createMarkupForStyles({width: '200px', height: 0})
         *   "width:200px;height:0;"
         *
         * Undefined values are ignored so that declarative programming is easier.
         * The result should be HTML-escaped before insertion into the DOM.
         *
         * @param {object} styles A JavaScript object representing CSS styles.
         * @return {?string} The serialized CSS style string, or null if no styles.
         */
        createMarkupForStyles: function( styles )
        {
          var serialized = '';

          for ( var styleName in styles )
          {
            // Ensure we only process own properties
            if ( !styles.hasOwnProperty( styleName ) )
            {
              continue;
            }

            var styleValue = styles[ styleName ];

            if ( styleValue != null )
            {
              serialized += processStyleName( styleName ) + ':';
              serialized += dangerousStyleValue( styleName, styleValue ) + ';';
            }
          }
          return serialized || null;
        },

        /**
         * Sets the value for multiple styles on a DOM node.
         * If a value is specified as '' (empty string), the corresponding style property will be unset.
         *
         * @param {DOMElement} node The DOM element to apply styles to.
         * @param {object} styles An object containing style property-value pairs.
         */
        setValueForStyles: function( node, styles )
        {
          var style = node.style;

          for ( var styleName in styles )
          {
            if ( !styles.hasOwnProperty( styleName ) )
            {
              continue;
            }

            var styleValue = dangerousStyleValue( styleName, styles[ styleName ] );

            if ( styleValue )
            {
              style[ styleName ] = styleValue;
            }
            else
            {
              var expansion = CSSProperty.shorthandPropertyExpansions[ styleName ];
              if ( expansion )
              {
                // Shorthand property that IE8 won't like unsetting, so unset each
                // component to placate it
                for ( var individualStyleName in expansion )
                {
                  style[ individualStyleName ] = '';
                }
              }
              else
              {
                style[ styleName ] = '';
              }
            }
          }
        }

      };

      module.exports = CSSPropertyOperations;

    }, { "./CSSProperty": 3, "./dangerousStyleValue": 101, "./hyphenateStyleName": 118, "./memoizeStringOnly": 129 } ],
    5: [ function( _dereq_, module, exports )
    {
      /*
       * Copyright 2013-2014 Facebook, Inc.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       * http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
       * @providesModule CallbackQueue
       */