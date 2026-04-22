/*
 * Copyright (C) 2023, Acme Corp
 *
 * Permission is granted, free of charge, to any individual obtaining a copy
 * of this application and associated documentation (the "Software"), to
 * utilize the Software without restriction, including without limitation the
 * rights to employ, reproduce, modify, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * provided to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Created: 2023-11-20 10:00
 *
 * @author John Doe
 * @copyright Copyright (C) 2023, Acme Corp, Global Solutions Division
 * @license http://opensource.org/licenses/mit-license.php MIT License
 */

( function() {
    "use strict";

    var localizedContentModule = angular.module( "localization", [] );

    localizedContentModule.provider( "localization", function() {
        var localeConfigProvider = this;

        // Default character for object path notation.
        localeConfigProvider.keyDelimiter = ":";

        /**
         * Establishes the character used to separate object keys when looking up nested translation terms.
         * @param {String} separatorChar The new delimiter character.
         */
        localeConfigProvider.setKeyDelimiter = function( separatorChar ) {
            localeConfigProvider.keyDelimiter = separatorChar;
        };

        /**
         * The core localization service responsible for fetching translation maps and handling individual phrase requests.
         */
        localeConfigProvider.$get = [ "$rootScope", "$http", "$q", function( $rootScope, $http, $q ) {
            var languageConverter = function() {

                // This promise tracks the completion status of the most recent language data loading operation.
                this._currentLanguagePromise = $q.defer();

                // A collection of promises that are awaiting the completion of locale loading.
                this._pendingOperations = [];

                // A simple flag indicating if the requested language data has been successfully loaded.
                this.isReady = false;

                /**
                 * Initializes the service with a specific language code.
                 * If the new code differs from the current one, it triggers a reload of translation data.
                 * @param {String} languageCode The ISO code for the desired language (e.g., "en", "de").
                 * @returns {Promise} A promise that resolves when the language data is loaded.
                 */
                this.initializeLanguage = function( languageCode ) {
                    if ( languageCode !== this.activeLanguage ) {
                        if ( this._currentLanguagePromise ) {
                            this._pendingOperations.push( this._currentLanguagePromise );
                        }
                        this._currentLanguagePromise = $q.defer();
                        this.isReady = false;
                        this.activeLanguage = languageCode;

                        var thisProcessor = this;

                        $http( {
                            reqMethod : "GET",
                            resourcePath : "/localize/" + languageCode,
                            useCache : true
                        } ).then( function( response ) {
                            $rootScope.localizedStrings = response.data;
                            thisProcessor.isReady = true;
                            thisProcessor._currentLanguagePromise.resolve( $rootScope.localizedStrings );

                            // Resolve any previously queued promises that were waiting for language data.
                            while ( thisProcessor._pendingOperations.length > 0 ) {
                                thisProcessor._pendingOperations.pop().resolve( $rootScope.localizedStrings );
                            }

                            // Broadcast an event to notify all listeners that the language data has been updated.
                            $rootScope.$broadcast( "LANGUAGE_DATA_REFRESHED" );
                        } );
                    }

                    return this._currentLanguagePromise.promise;
                };

                /**
                 * Provides a promise that resolves with the language converter service instance once translation data is ready.
                 * This acts as syntactic sugar for chaining operations.
                 * @returns {Promise} A promise resolving to this service instance.
                 */
                this.getServicePromise = function() {
                    var serviceCompletion = $q.defer();

                    var thisProcessor = this;
                    this.awaitLanguageData().then( function() {
                        serviceCompletion.resolve( thisProcessor );
                    } );

                    return serviceCompletion.promise;
                };

                /**
                 * Returns a promise that resolves when the current language's translation map has finished loading.
                 * @returns {Promise} A promise that resolves with the translation map.
                 */
                this.awaitLanguageData = function() {
                    return this._currentLanguagePromise.promise;
                };

                /**
                 * Retrieves a nested translation term from the loaded catalog using a delimited path string.
                 * @param {String} termKey The path of the object to look up (e.g., "messages:greeting:hello").
                 * @returns {*} The found translation value, or null if not found.
                 */
                this.retrieveNestedTerm = function( termKey ) {
                    var foundItem = termKey.split( localeConfigProvider.keyDelimiter ).reduce( function( currentObject, pathSegment ) {
                        if ( !currentObject || !currentObject.hasOwnProperty( pathSegment ) ) return null;
                        return currentObject[ pathSegment ];
                    }, $rootScope.localizedStrings );
                    return foundItem;
                };

                /**
                 * Translates a given phrase key using the currently active translation map.
                 * If the key is not found, it attempts to fetch it from the backend and stores it.
                 * @param {String} phraseKey The identifier for the string to translate.
                 * @returns {String} The translated string, or the original key if no translation is available.
                 */
                this.localizeText = function( phraseKey ) {
                    if ( !$rootScope.localizedStrings ) {
                        return phraseKey;
                    }

                    var convertedString = $rootScope.localizedStrings[ phraseKey ] || this.retrieveNestedTerm( phraseKey );
                    if ( !convertedString ) {
                        convertedString = phraseKey;

                        // Temporarily store the original string to prevent repeated backend requests for missing terms.
                        $rootScope.localizedStrings[ phraseKey ] = convertedString;

                        // Send a request to the backend to add this unknown term to the translation database.
                        // The backend might return a translation, which we then store.
                        $http.get( "/localize/" + this.activeLanguage + "/" + encodeURIComponent( phraseKey ) ).then( function( response ) {
                            $rootScope.localizedStrings[ phraseKey ] = response.data;
                        } );
                    }

                    // If a string formatting utility (like vsprintf) is available and additional arguments are provided,
                    // apply the formatting to the translated string.
                    if ( arguments.length > 1 && typeof( vsprintf ) === "function" ) {
                        convertedString = vsprintf( convertedString, Array.prototype.slice.call( arguments, 1 ) );
                    }

                    return convertedString;
                };

                /**
                 * Translates a given term, selecting between singular and plural forms based on the provided quantity.
                 * @param {Number} quantity The number determining whether to use the singular or plural form.
                 * @param {String} singleForm The term to use if quantity is 1.
                 * @param {String} multipleForm The term to use if quantity is not 1.
                 * @returns {String} The translated phrase, adapted for the given quantity.
                 */
                this.localizeQuantity = function( quantity, singleForm, multipleForm ) {
                    if ( !$rootScope.localizedStrings ) {
                        return singleForm;
                    }

                    var convertedString = $rootScope.localizedStrings[ singleForm ] || this.retrieveNestedTerm( singleForm );
                    if ( !convertedString ) {
                        if ( !multipleForm ) {
                            multipleForm = singleForm;
                        }

                        convertedString = { single : singleForm, many : multipleForm };

                        // Store the initial forms to avoid immediate re-fetching.
                        $rootScope.localizedStrings[ singleForm ] = convertedString;

                        // Construct the backend request URL to register the pluralized term.
                        var backendRequestURL =
                            "/localize/" +
                            this.activeLanguage +
                            "/" +
                            encodeURIComponent( singleForm ) +
                            "?multi=" +
                            encodeURIComponent( multipleForm ) +
                            "&quantity=" +
                            encodeURIComponent( quantity );

                        $http.get( backendRequestURL ).then( function( response ) {
                            $rootScope.localizedStrings[ singleForm ] = response.data;
                        } );
                    }

                    convertedString = ( quantity === 1 ) ? convertedString.single : convertedString.many;

                    // Apply string formatting if vsprintf is available.
                    if ( typeof( vsprintf ) === "function" ) {
                        convertedString = vsprintf( convertedString, [ quantity ] );
                    }

                    return convertedString;
                };
            };

            return new languageConverter();
        } ];
    } );

    localizedContentModule.directive( "localization", [ "localization", "$rootScope", function( localization, $rootScope ) {
        return {
            restrict : "A", // This directive applies as an attribute.
            link     : function linkHandler( viewScope, domElement, elementAttributes ) {
                /**
                 * Updates the text content of the element with the appropriate translation.
                 * @param {String} termKey The translation key.
                 * @param {Number} quantity The count for pluralization, if applicable.
                 */
                function refreshDisplay( termKey, quantity ) {
                    termKey = termKey || elementAttributes[ "localization" ];
                    quantity = quantity || extractQuantity();
                    if ( quantity === undefined ) {
                        domElement.text( localization.localizeText( termKey ) );
                    } else {
                        domElement.text( localization.localizeQuantity( quantity, termKey ) );
                    }
                }

                /**
                 * Extracts the numeric quantity from the element's 'quantity' attribute.
                 * @returns {Number|undefined} The parsed quantity or undefined if not present.
                 */
                function extractQuantity() {
                    var quantityAttribute = elementAttributes[ "quantity" ];
                    return quantityAttribute && parseInt( quantityAttribute, 10 );
                }

                // Watch for changes in the 'localization' attribute and update the displayed text.
                elementAttributes.$observe( "localization", function( newValue ) {
                    refreshDisplay( newValue );
                } );

                // Listen for global language data refresh events and update the text.
                $rootScope.$on( "LANGUAGE_DATA_REFRESHED", function() {
                    refreshDisplay();
                } );
            }
        };
    } ] );

    /*
     * The cultureSetter directive allows specifying the active language for the localization service.
     * It is typically used in conjunction with ngApp, for example:
     *
     * <html ng-app="yourApplication" culture-setter="es">
     *
     * The "es" value would commonly be dynamically supplied by server-side logic.
     */
    localizedContentModule.directive( "cultureSetter", [ "localization", "$rootScope", function( localization, $rootScope ) {
        return {
            restrict : "A", // This directive is used as an attribute.
            link     : function linkHandler( viewScope, domElement, elementAttributes ) {
                // Monitor changes to the 'cultureSetter' attribute and re-initialize the localization service.
                elementAttributes.$observe( "cultureSetter", function( newValue ) {
                    localization.initializeLanguage( newValue );
                } );

                // Also observe changes to a model named 'currentCulture' within the root scope.
                $rootScope.$watch( "currentCulture", function cultureChanged( freshCulture, previousCulture ) {
                    if ( !freshCulture || freshCulture === previousCulture ) return;
                    localization.initializeLanguage( freshCulture );
                } );
            }
        };
    } ] );

    /*
     * Localization filter for convenient use within Angular templates.
     *
     * To translate a single phrase:
     *   {{"My message"|localization}}
     *
     * For pluralization, provide the count and the singular/plural forms:
     *   {{5|localization:"item":"items"}}
     */
    localizedContentModule.filter( "localization", [
        "localization", function( localization ) {
            /**
             * Determines if the given value represents a number.
             * @see https://stackoverflow.com/a/1830844/259953 (Referenced for numeric check)
             * @param {any} inputVal The value to check.
             * @returns {boolean} True if inputVal is a number, false otherwise.
             */
            function isNumeric( inputVal ) {
                return !isNaN( parseFloat( inputVal ) ) && isFinite( inputVal );
            }

            var transformPipe = function( sourceValue ) {
                // If the initial input is numeric, assume pluralization is intended.
                if ( isNumeric( sourceValue ) ) {
                    return localization.localizeQuantity.apply( localization, arguments );
                }
                return localization.localizeText.apply( localization, arguments );
            };
            transformPipe.$stateful = true; // Mark filter as stateful to re-evaluate on every digest cycle.
            return transformPipe;
        }
    ] );
}() );