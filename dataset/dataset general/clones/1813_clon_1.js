/*
 * This is a Type I clone of the original source code.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been added, removed, or modified to create a visually distinct
 * but logically and structurally identical version of the code.
 */

// Start of the Immediately Invoked Function Expression (IIFE)
( function( )
{
	// Enforce strict mode for better code quality and error handling.
	"use strict";

	// Declare the main Angular module for i18n services.
	var i18nModule = angular.module( "i18n", [ ] );


	// Configure the i18n provider for dependency injection.
	i18nModule.provider( "i18n", function( )
	{
		// Reference to the provider instance.
		var i18nProvider = this;

		// Default object notation delimiter.
		i18nProvider.objectNotation = ".";

		// Method to set a custom object notation delimiter.
		i18nProvider.setObjectNotation = function( delimiter )
		{
			// Assign the new delimiter to the provider's property.
			i18nProvider.objectNotation = delimiter;
		};

		// --- The main i18n service factory function ---
		// This function is invoked when the i18n service is first injected.
		/**
		 * The core i18n service.
		 * It manages the retrieval of translation maps and handles individual translation requests.
		 */
		i18nProvider.$get = [ "$rootScope", "$http", "$q", function( $rootScope, $http, $q )
		{
			// The constructor for the i18n service.
			var i18nService = function( )
			{
				// Internal deferred object to track the completion of the last locale loading request.
				this._localeLoadedDeferred = $q.defer( );

				// A stack to hold deferred objects for multiple locale loading requests.
				// This allows resolving all pending promises once a locale is loaded.
				this._deferredStack = [ ];

				// A boolean flag indicating if the current locale has been successfully loaded.
				this.loaded = false;

				// --- Service initialization method ---
				// Initializes the service with a specified locale.
				this.init = function( locale )
				{
					// Only proceed if the new locale is different from the currently set one.
					if( locale != this.userLanguage )
					{
						// If there's an existing deferred, push it to the stack to be resolved later.
						if( this._localeLoadedDeferred )
						{
							this._deferredStack.push( this._localeLoadedDeferred );
						}

						// Create a new deferred object for the upcoming locale loading.
						this._localeLoadedDeferred = $q.defer( );
						this.loaded = false; // Reset loaded flag.
						this.userLanguage = locale; // Set the new user language.

						var service = this; // Capture 'this' for use within callbacks.

						// Make an HTTP GET request to fetch the translation map for the specified locale.
						$http( {
							method : "get", // HTTP method.
							url    : "/i18n/" + locale, // API endpoint for translations.
							cache  : true // Enable caching for this request.
						} ).success( function( translations )
						{
							// Store the fetched translations in the root scope.
							$rootScope.i18n = translations;

							service.loaded = true; // Mark the locale as loaded.

							// Resolve the current locale loading deferred.
							service._localeLoadedDeferred.resolve( $rootScope.i18n );

							// Resolve all deferred objects accumulated in the stack.
							while( service._deferredStack.length )
							{
								service._deferredStack.pop( ).resolve( $rootScope.i18n );
							}

							// Broadcast an event to notify listeners that the locale has been updated.
							$rootScope.$broadcast( "LOCALE_UPDATED" );
						} );
					}

					// Return the promise associated with the current locale loading operation.
					return this._localeLoadedDeferred.promise;
				};

				/**
				 * Syntactic sugar method.
				 * Returns a promise that resolves with the i18n service instance
				 * once the translation map for the current locale is fully loaded.
				 *
				 * @returns {defer.promise|*|promise} A promise that resolves to the i18n service.
				 */
				this.i18n = function( )
				{
					var serviceDeferred = $q.defer( ); // Create a new deferred for this request.
					var service = this; // Store 'this' context.

					// Ensure the locale is loaded, then resolve the serviceDeferred.
					this.ensureLocaleIsLoaded( ).then( function( )
					{
						serviceDeferred.resolve( service ); // Resolve with the service instance.
					} );

					return serviceDeferred.promise; // Return the promise.
				};

				/**
				 * Returns a promise that resolves with the translation map
				 * once the current locale is fully loaded.
				 *
				 * @returns {defer.promise|*|promise} A promise that resolves to the translation map.
				 */
				this.ensureLocaleIsLoaded = function( )
				{
					// Simply return the promise from the internal deferred object.
					return this._localeLoadedDeferred.promise;
				};

				/**
				 * Retrieves a translation object from the catalog using object notation.
				 * This allows accessing nested translation keys (e.g., "messages.greeting").
				 *
				 * @param {String} literal The dot-separated path of the object to look up.
				 * @returns {*} The found translation object, or null if not found.
				 */
				this.getTranslationObject = function( literal )
				{
					// Split the literal by the object notation delimiter and reduce it to find the nested value.
					var result = literal.split( i18nProvider.objectNotation ).reduce( function( object, index )
					{
						// If the object is null/undefined or doesn't have the property, return null.
						if( !object || !object.hasOwnProperty( index ) ) return null;
						return object[ index ]; // Return the nested object.
					}, $rootScope.i18n ); // Start reduction from the global translation map.
					return result; // Return the final result.
				};

				/**
				 * Translates a given term using the currently loaded translation map.
				 * Supports sprintf-like substitutions if `vsprintf` is available.
				 *
				 * @param {String} name The string to translate.
				 * @returns {String} The translated string, or the original input if no translation is found.
				 */
				this.__ = function( name )
				{
					// If no translation map is loaded yet, return the original name.
					if( !$rootScope.i18n )
					{
						return name;
					}

					// Attempt to find the translation directly or via object notation.
					var translation = $rootScope.i18n[ name ] || this.getTranslationObject( name );

					// If no translation was found:
					if( !translation )
					{
						translation = name; // Default to the original name.

						// Temporarily store the original string in the translation table.
						// This prevents repeated lookups for the same untranslated term
						// and avoids additional backend requests until a proper translation arrives.
						$rootScope.i18n[ name ] = translation;

						// Invoke a backend endpoint to inform about the missing term.
						// This causes the term to be added to the backend's translation table.
						// The backend might return a default or partially translated term,
						// which will then update the local translation table.
						$http.get( "/i18n/" + this.userLanguage + "/" + encodeURIComponent( name ) ).success( function( translated )
						{
							$rootScope.i18n[ name ] = translated; // Update with the backend's response.
						} );
					}

					// If additional arguments are provided and `vsprintf` function is available,
					// perform string substitution.
					if( arguments.length > 1 && typeof( vsprintf ) == "function" )
					{
						// Slice arguments to get only the substitution parameters.
						translation = vsprintf( translation, Array.prototype.slice.call( arguments, 1 ) );
					}

					return translation; // Return the (possibly substituted) translation.
				};

				/**
				 * Translates a given term and selects between singular or plural versions
				 * based on the provided count. Supports sprintf-like substitutions.
				 *
				 * @param {Number} count The number of items, determining singular or plural.
				 * @param {String} singular The term to use if count is 1.
				 * @param {String} plural The term to use if count is not 1.
				 * @returns {String} The translated phrase based on the count.
				 */
				this.__n = function( count, singular, plural )
				{
					// If no translation map is loaded, return the singular form by default.
					if( !$rootScope.i18n )
					{
						return singular;
					}

					// Attempt to find the translation for the singular form.
					var translation = $rootScope.i18n[ singular ] || this.getTranslationObject( singular );

					// If no translation (singular/plural object) was found:
					if( !translation )
					{
						// If plural form isn't explicitly provided, use the singular form as plural.
						if( !plural )
						{
							plural = singular;
						}

						// Create a temporary translation object for singular and plural.
						translation = { one : singular, other : plural };

						// Temporarily store this object in the translation table.
						// This avoids repeated backend requests for the same missing pluralized term.
						$rootScope.i18n[ singular ] = translation;

						// Construct the request URI for the pluralization endpoint.
						var requestUri =
							"/i18n/" + // Base path.
							this.userLanguage + // Current user language.
							"/" + // Separator.
							encodeURIComponent( singular ) + // Encoded singular term.
							"?plural=" + // Query parameter for plural.
							encodeURIComponent( plural ) + // Encoded plural term.
							"&count=" + // Query parameter for count (for backend context).
							encodeURIComponent( count ); // Encoded count.

						// Make an HTTP GET request to the backend for pluralization.
						$http.get( requestUri ).success( function( translated )
						{
							$rootScope.i18n[ singular ] = translated; // Update with the backend's response.
						} );
					}

					// Select the correct translation (singular or plural) based on the count.
					translation = (count == 1) ? translation.one : translation.other;

					// If `vsprintf` is available, perform string substitution with the count.
					if( typeof( vsprintf ) == "function" )
					{
						translation = vsprintf( translation, [ count ] ); // Substitute the count into the phrase.
					}

					return translation; // Return the final translated phrase.
				};
			};

			// Return a new instance of the i18nService.
			return new i18nService( );
		} ];
	} );


	// --- i18n Directive for HTML elements ---
	// This directive allows translating content directly in HTML.
	i18nModule.directive( "i18n", [ "i18n", "$rootScope", function( i18n, $rootScope )
	{
		return {
			restrict : "A", // Restrict to attribute.
			link     : function postLink( scope, element, attributes )
			{
				// Function to update the text content of the element with a translation.
				function updateText( literal, count )
				{
					literal = literal || attributes[ "i18n" ]; // Get literal from argument or attribute.
					count = count || getCount( ); // Get count from argument or helper function.

					// If count is undefined, use singular translation.
					if( count === undefined )
					{
						element.text( i18n.__( literal ) );
					}
					// Otherwise, use plural translation.
					else
					{
						element.text( i18n.__n( count, literal ) )
					}
				}

				// Helper function to get the count from the 'count' attribute.
				function getCount( )
				{
					var countAttribute = attributes[ "count" ]; // Retrieve the 'count' attribute.
					return countAttribute && parseInt( countAttribute ); // Parse it as an integer if it exists.
				}

				// Observe changes to the 'i18n' attribute value and update the text.
				attributes.$observe( "i18n", function( value )
				{
					updateText( value ); // Call updateText with the new value.
				} );

				// Listen for 'LOCALE_UPDATED' event broadcast from the service.
				$rootScope.$on( "LOCALE_UPDATED", function( )
				{
					updateText( ); // Re-translate the element when the locale changes.
				} );
			}
		};
	} ] );


	// --- i18nLocale Directive for setting the locale ---
	/**
	 * The i18nLocale directive is used to instruct the i18n service which locale to utilize.
	 * It is often combined with the ngApp directive in the root HTML element, like:
	 *
	 * <html ng-app="yourApp" i18n-locale="de">
	 *
	 * The value for "i18n-locale" is typically dynamically populated, for example,
	 * from the result of an i18n.getLocale() call within your Express.js application.
	 */
	i18nModule.directive( "i18nLocale", [ "i18n", "$rootScope", function( i18n, $rootScope )
	{
		return {
			restrict : "A", // Restrict to attribute.
			link     : function postLink( scope, element, attributes )
			{
				// Observe the value of the 'i18nLocale' attribute.
				// If it changes, re-initialize the i18n service with the new locale.
				attributes.$observe( "i18nLocale", function( value )
				{
					i18n.init( value ); // Initialize i18n with the new locale from the attribute.
				} );

				// Watch for changes in a root scope variable named 'i18nLocale'.
				// This allows programmatic changes to the locale from anywhere in the app.
				$rootScope.$watch( "i18nLocale", function localeChanged( newLocale, oldLocale )
				{
					// If there's no new locale or it hasn't changed, do nothing.
					if( !newLocale || newLocale == oldLocale ) return;
					i18n.init( newLocale ); // Initialize i18n with the new locale from the root scope.
				} );
			}
		};
	} ] );


	// --- i18n Filter for template usage ---
	/**
	 * The i18n filter provides convenient translation capabilities within Angular templates.
	 *
	 * For simple single-phrase translation:
	 *   {{"My phrase"|i18n}}
	 *
	 * For pluralization support, pass the count as the input to the filter,
	 * and provide the singular and plural terms as additional arguments:
	 *
	 *   {{2|i18n:"singular":"plural"}}
	 *   {{4|i18n:"%s item":"%s items"}} // Example with sprintf-like substitution.
	 */
	i18nModule.filter( "i18n", [
		"i18n", function( i18n )
		{
			/**
			 * Helper function to determine if a given input is a number.
			 * This is crucial for deciding whether to apply singular or plural translation.
			 * @see http://stackoverflow.com/a/1830844/259953
			 * @param n The value to be checked.
			 * @returns {boolean} True if the input is a valid number; false otherwise.
			 */
			function isNumber( n )
			{
				return !isNaN( parseFloat( n ) ) && isFinite( n );
			}

			// The main filter function.
			var filter = function( input )
			{
				// If the input value is a number, it implies a pluralization request.
				if( isNumber( input ) )
				{
					// Apply the pluralization method, passing all arguments.
					return i18n.__n.apply( i18n, arguments );
				}
				// Otherwise, it's a standard single-phrase translation.
				return i18n.__.apply( i18n, arguments );
			};

			// Mark the filter as stateful.
			// This is necessary because the translation output can change
			// depending on the loaded locale, which is external to the filter's direct inputs.
			filter.$stateful = true;

			// Return the configured filter function.
			return filter;
		}
	] );

} ( ) ); // End of the IIFE.