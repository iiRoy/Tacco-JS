/**
 * Deloitte Digital global namespace for modules.
 * This ensures DD exists before we attach anything to it.
 * @namespace DD
 */
; ( function () {

	'use strict' ; // Enable strict mode for better error handling and cleaner code.

	window . DD = window . DD || { } ; // Initialize DD namespace if it doesn't already exist.

	/**
	 * Breakpoints for JavaScript functionality.
	 * This module integrates with the Deloitte Digital SCSS @bp mixin.
	 *
	 * @namespace bp
	 * @memberof DD
	 * @version 1.0.0
	 * @copyright 2012-2014 Deloitte Digital Australia - http://www.deloittedigital.com/au
	 * @author Deloitte Digital Australia deloittedigital@deloitte.com.au
	 * @license BSD 3-Clause (http://opensource.org/licenses/BSD-3-Clause)
	 */
	window . DD . bp = ( function ( ) {

		var _minBreakpoints ,
			_maxBreakpoints ,
			_options = {
				isResponsive : true ,
				baseFontSize : 16 , // Default base font size in pixels.
				breakpoints : [
					{
						name : 'xxs' ,
						px : 359
					} ,
					{
						name : 'xs' ,
						px : 480
					} ,
					{
						name : 's' ,
						px : 640
					} ,
					{
						name : 'm' ,
						px : 768
					} ,
					{
						name : 'l' ,
						px : 1024
					} ,
					{
						name : 'xl' ,
						px : 1244
					} ,
					{
						name : 'xxl' ,
						px : 1410
					}
				] ,
				staticRange : {
					min : 0 ,
					max : 'xl' // 'xl' indicates the maximum breakpoint for the static range.
				}
			} ,
			_initBreakpoints ,
			_parseMinMaxInputs ,
			_pxToEms ,
			_bpToEms ,
			_bpIsValidForStatic ,
			_bpMin ,
			_bpMax ,
			_bpBetween ,
			get ,
			getHeight ,
			is ,
			isHeight ,
			options ; // Public options method.

		/**
		 * Sorts breakpoints and sets up quick lookup objects.
		 * This function is immediately called on module initialization.
		 *
		 * @memberof DD.bp
		 * @private
		 */
		_initBreakpoints = function ( ) {
			// Sort the breakpoints from smallest to largest pixel value.
			var sortedBreakpoints = _options . breakpoints . sort ( function ( a , b ) {
				// Only proceed with sorting if both 'a' and 'b' have a 'px' property.
				if ( a . px < b . px ) {
					return -1 ;
				}

				if ( a . px > b . px ) {
					return 1 ;
				}

				return 0 ; // If px values are equal, maintain original order.
			} ) ;

			// Reset breakpoint lookup objects for fresh population.
			_minBreakpoints = { } ;
			_maxBreakpoints = { } ;

			// Loop through the sorted breakpoints to create associative arrays for efficient access.
			for ( var i = 0 , len = sortedBreakpoints . length , last = len - 1 ; i < len ; i += 1 ) {
				_minBreakpoints [ sortedBreakpoints [ i ] . name ] = parseInt ( sortedBreakpoints [ i ] . px , 10 ) ;

				// For max breakpoints, skip the very last item as it has no upper limit defined.
				if ( i < last ) {
					// The maximum breakpoint is defined as 1px less than the next breakpoint's minimum.
					_maxBreakpoints [ sortedBreakpoints [ i ] . name ] = parseInt ( sortedBreakpoints [ i + 1 ] . px - 1 , 10 ) ;
				}
			}
		} ;
		// Execute initialization immediately.
		_initBreakpoints ( ) ;

		/**
		 * Parses min/max inputs, converting string values (e.g., 'xs,m' or '5') into appropriate types.
		 *
		 * @memberof DD.bp
		 * @private
		 * @param  {String|Number} min Input for the minimum breakpoint.
		 * @param  {String|Number} max Input for the maximum breakpoint.
		 * @return {Object} An object with 'min' and 'max' values, parsed as numbers or breakpoint names.
		 */
		_parseMinMaxInputs = function ( min , max ) {
			var parseValue = function ( val ) {
					if ( typeof ( val ) === 'string' ) {
						// Remove any whitespace from the string.
						val = val . replace ( /\s/g , '' ) ;

						// If the value consists only of digits, convert it to an integer.
						if ( /^\d+$/ . test ( val ) ) {
							val = parseInt ( val , 10 ) ;
						}
					}

					return val ;
				} ,
				bpArray ,
				resultMin = min ,
				resultMax = max || 0 ; // Default max to 0 if not provided.

			// Check for string syntax like "xs,m" when max is not explicitly set.
			if ( typeof ( min ) === 'string' && min . indexOf ( ',' ) !== -1 && resultMax === 0 ) {
				bpArray = min . split ( ',' ) ;
				if ( bpArray . length === 2 ) {
					resultMin = bpArray [ 0 ] ;
					resultMax = bpArray [ 1 ] ;
				}
			}

			return {
				min : parseValue ( resultMin ) ,
				max : parseValue ( resultMax )
			} ;
		} ;

		/**
		 * Converts a pixel value to an equivalent em value.
		 *
		 * @memberof DD.bp
		 * @private
		 * @param  {Number} px The pixel value to convert.
		 * @return {String} The converted value in ems, as a string.
		 */
		_pxToEms = function ( px ) {
			return px / _options . baseFontSize ;
		} ;

		/**
		 * Converts a breakpoint name or pixel value into its em equivalent.
		 *
		 * @memberof DD.bp
		 * @private
		 * @param  {String|Number} breakpoint The breakpoint name (e.g., 'l') or a pixel value.
		 * @param  {Boolean} [isMax=false] Flag indicating whether to use the max breakpoint value.
		 * @return {String} The converted em value as a string.
		 */
		_bpToEms = function ( breakpoint , isMax ) {
			if ( typeof ( breakpoint ) === 'number' ) {
				return _pxToEms ( breakpoint ) ;
			}

			var list = ( isMax === true ) ? _maxBreakpoints : _minBreakpoints ,
				ems = '0' ; // Default to '0' if breakpoint not found.

			// Iterate through the breakpoint list to find a match.
			for ( var key in list ) {
				if ( list . hasOwnProperty ( key ) ) {
					if ( breakpoint === key . toLowerCase ( ) ) {
						ems = _pxToEms ( list [ key ] ) ;
					}
				}
			}

			if ( ems === '0' ) {
				// Log a warning if the breakpoint name is not recognized.
				console . warn ( 'DD.bp: Breakpoint \'' + breakpoint + '\' doesn\'t exist - replacing with 0' ) ;
			}

			return ems ;
		} ;

		/**
		 * Checks if the given breakpoint falls within the configured static range.
		 * This is relevant when `isResponsive` is set to `false`.
		 *
		 * @memberof DD.bp
		 * @private
		 * @param  {String|Number} min The minimum breakpoint.
		 * @param  {String|Number} max The maximum breakpoint.
		 * @param  {String} [property='width'] The CSS property being checked (e.g., 'width', 'height').
		 * @return {Boolean} True if the breakpoint is valid for the static range, false otherwise.
		 */
		_bpIsValidForStatic = function ( min , max , property ) {
			if ( typeof ( property ) !== 'string' ) {
				property = 'width' ; // Default to width if property is not a string.
			}

			// Currently, static range validation is only for 'width'.
			if ( property !== 'width' ) {
				return false ;
			}

			var bpValidMin = _bpToEms ( _options . staticRange . min ) ,
				bpValidMax = _bpToEms ( _options . staticRange . max , true ) ,
				parsed = _parseMinMaxInputs ( min , max ) ,
				bpMin = _bpToEms ( parsed . min ) ,
				bpMax = _bpToEms ( parsed . max ) ;

			// Scenario: min-and-above (max is 0).
			if ( parsed . max === 0 ) {
				// Check if the minimum breakpoint is within the valid static range.
				if ( bpMin >= bpValidMin && bpMin < bpValidMax ) {
					return true ;
				}

				return false ;
			}

			// Scenario: max-and-below (min is 0).
			if ( parsed . min === 0 ) {
				// Check if the maximum breakpoint extends beyond or matches the static range's max.
				if ( bpMax >= bpValidMax ) {
					return true ;
				}

				return false ;
			}

			// Scenario: bp-between (both min and max are non-zero).
			// If the min is above the static max, or the max is below the static min, it's invalid.
			if ( bpMin > bpValidMax || bpMax < bpValidMin ) {
				return false ;
			}

			// If it's a 'between' range, ensure the upper bound is not entirely within the static range.
			// This means if the max is *less than* the valid max, it's considered invalid.
			if ( bpMax < bpValidMax ) {
				return false ;
			}

			return true ; // If all checks pass, the breakpoint is valid.
		} ;

		/**
		 * Generates a `min-width` media query string.
		 *
		 * @memberof DD.bp
		 * @private
		 * @param  {String|Number} min Breakpoint name or pixel value.
		 * @param  {String} [property='width'] CSS property (e.g., 'width', 'height').
		 * @return {String} The resulting media query string.
		 */
		_bpMin = function ( min , property ) {
			var bpMin = _bpToEms ( min ) ,
				bpType = ( typeof ( property ) === 'string' ) ? property : 'width' ; // Default property to 'width'.

			return '(min-' + bpType + ': ' + bpMin + 'em)' ;
		} ;

		/**
		 * Generates a `max-width` media query string.
		 *
		 * @memberof DD.bp
		 * @private
		 * @param  {String|Number} max Breakpoint name or pixel value.
		 * @param  {String} [property='width'] CSS property (e.g., 'width', 'height').
		 * @return {String} The resulting media query string.
		 */
		_bpMax = function ( max , property ) {
			var bpMax = _bpToEms ( max , true ) , // Use 'true' for isMax to get the correct max value.
				bpType = ( typeof ( property ) === 'string' ) ? property : 'width' ; // Default property to 'width'.

			return '(max-' + bpType + ': ' + bpMax + 'em)' ;
		} ;

		/**
		 * Generates a `min-width` and `max-width` media query string (a 'between' query).
		 *
		 * @memberof DD.bp
		 * @private
		 * @param  {String|Number} min The minimum breakpoint.
		 * @param  {String|Number} max The maximum breakpoint.
		 * @param  {String} [property='width'] CSS property (e.g., 'width', 'height').
		 * @return {String} The resulting media query string.
		 */
		_bpBetween = function ( min , max , property ) {
			var bpMin = _bpToEms ( min ) ,
				bpMax = _bpToEms ( max , true ) , // Use 'true' for isMax to get the correct max value.
				bpType = ( typeof ( property ) === 'string' ) ? property : 'width' ; // Default property to 'width'.

			return '(min-' + bpType + ': ' + bpMin + 'em) and (max-' + bpType + ': ' + bpMax + 'em)' ;
		} ;

		/**
		 * Main public function to get a media query string based on breakpoints.
		 * Supports min, max, and between ranges, and special cases like 'retina'.
		 *
		 * @memberof DD.bp
		 * @param  {String|Number} min Minimum breakpoint (name, px, or comma-separated string).
		 * @param  {String|Number} [max=0] Maximum breakpoint (name or px).
		 * @param  {String} [property='width'] CSS property to query (e.g., 'width', 'height').
		 * @return {String} The generated media query string.
		 */
		get = function ( min , max , property ) {
			var parsed = _parseMinMaxInputs ( min , max ) ,
				bpMin = parsed . min ,
				bpMax = parsed . max ;

			if ( typeof ( property ) !== 'string' ) {
				property = 'width' ; // Ensure property defaults to 'width' if not a string.
			}

			// Handle special 'retina' or 'hdpi' breakpoint.
			if ( bpMin === 'retina' || bpMin === 'hdpi' ) {
				return '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5)' ;
			} else if ( bpMax === 0 ) {
				// If max is 0, it's a 'min-and-above' query.
				return _bpMin ( bpMin , property ) ;
			} else if ( bpMin === 0 ) {
				// If min is 0, it's a 'max-and-below' query.
				return _bpMax ( bpMax , property ) ;
			} else {
				// Otherwise, it's a 'between' query.
				return _bpBetween ( bpMin , bpMax , property ) ;
			}
		} ;

		/**
		 * Shortcut for `get()` that specifically returns a height-based media query.
		 *
		 * @memberof DD.bp
		 * @param  {String|Number} min Minimum height breakpoint.
		 * @param  {String|Number} [max=0] Maximum height breakpoint.
		 * @return {String} The generated height media query string.
		 */
		getHeight = function ( min , max ) {
			return get ( min , max , 'height' ) ;
		} ;

		/**
		 * Checks if the current page matches a given media query breakpoint.
		 * Returns a boolean using `window.matchMedia`.
		 *
		 * @memberof DD.bp
		 * @param  {String|Number} min Minimum breakpoint for the query.
		 * @param  {String|Number} [max=0] Maximum breakpoint for the query.
		 * @param  {String} [property='width'] CSS property to check.
		 * @return {Boolean} True if the current environment matches the query, false otherwise.
		 */
		is = function ( min , max , property ) {
			// If responsiveness is disabled, use static range validation.
			if ( _options . isResponsive === false ) {
				return _bpIsValidForStatic ( min , max , property ) ;
			}

			// Use window.matchMedia if available.
			if ( window . matchMedia ) {
				return window . matchMedia ( get ( min , max , property ) ) . matches ;
			}

			// Fallback warning if matchMedia is not supported.
			console . warn ( 'DD.bp: Match Media not supported by this browser. Consider adding a polyfill.' ) ;

			return false ;
		} ;

		/**
		 * Shortcut for `is()` that specifically checks for height-based media queries.
		 *
		 * @memberof DD.bp
		 * @param  {String|Number} min Minimum height breakpoint.
		 * @param  {String|Number} [max=0] Maximum height breakpoint.
		 * @return {Boolean} True if the current environment matches the height query, false otherwise.
		 */
		isHeight = function ( min , max ) {
			return is ( min , max , 'height' ) ;
		} ;

		/**
		 * @typedef {Object} DD.bp.BreakpointOptions
		 * @property {String} name Name of the breakpoint (e.g., 's', 'm', 'l').
		 * @property {Number} px Pixel value for the breakpoint.
		 */

		/**
		 * @typedef {Object} DD.bp.Options
		 * @property {Number} [baseFontSize] Base font size in px for em calculations.
		 * @property {DD.bp.BreakpointOptions[]} [breakpoints] Array of breakpoint objects.
		 */

		/**
		 * Allows updating the module's configuration options.
		 * This function merges new options with existing ones.
		 *
		 * @memberof DD.bp
		 * @param {DD.bp.Options} newOptions The new options to apply.
		 */
		options = function ( newOptions ) {
			if ( typeof newOptions === 'object' && newOptions !== null ) {
				// Merge new options into _options.
				for ( var key in newOptions ) {
					if ( newOptions . hasOwnProperty ( key ) ) {
						_options [ key ] = newOptions [ key ] ;
					}
				}
				// Re-initialize breakpoints if 'breakpoints' array was updated.
				if ( newOptions . breakpoints ) {
					_initBreakpoints ( ) ;
				}
			}
		} ;


		// Public API for the DD.bp module.
		return {
			get : get ,
			getHeight : getHeight ,
			is : is ,
			isHeight : isHeight ,
			options : options
		} ;

	} ( ) ) ; // Immediately invoke the BP module function.

} ( ) ) ; // Immediately invoke the outer IIFE.