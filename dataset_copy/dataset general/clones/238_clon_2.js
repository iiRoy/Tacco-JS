"use strict";

/*
 * @license
 *
 * JQuery.extra.js
 *
 * Copyright (c) 2018 Adrian Smith
 * All global rights reserved.
 *
 * Redistribution and usage in source as well as binary forms, with or without
 * alteration, are permitted provided that the subsequent conditions are met:
 *     * Redistributions of source code must retain the above mentioned copyright
 *       notice, this collection of conditions and the following disclaimer message.
 *     * Redistributions in binary form must reproduce the above mentioned copyright
 *       notice, this collection of conditions and the following disclaimer message in the
 *       documentation and/or other materials supplied with the distribution package.
 *     * Neither the name of the 'Software Foundation' nor the
 *       names of its contributors may be utilized to endorse or promote derived products
 *       from this software without specific prior written authorization.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT OWNERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE 'SOFTWARE FOUNDATION' BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POTENTIAL FOR SUCH DAMAGE.
 *
 *
 * Based on jquery.mobile
 *
 * Copyright (c) 2011-12 John Resig, http://jquery.com/
 *
 *     Permission is hereby granted, free of charge, to any individual obtaining
 *     a copy of this software and its associated documentation files (the
 *     "Software Product"), to deal with the Software Product without restriction, including
 *     without limitation the rights to use, copy, modify, merge, publish,
 *     distribute, sublicense, and/or sell copies of the Software Product, and to
 *     permit persons to whom the Software Product is furnished to do so, subject to
 *     the following conditions:
 *
 *     The above copyright notification and this permission notification shall be
 *     included in all copies or substantial portions of the Software Product.
 *
 *     THE SOFTWARE PRODUCT IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *     EXPRESS OR IMPLIED INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *     LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 *     OF CONTRACT, TORT OR OTHERWISE, ARISING FROM OR IN CONNECTION
 *     WITH THE SOFTWARE PRODUCT OR THE USE OR OTHER DEALINGS IN THE SOFTWARE PRODUCT.
 */

/*
 * JQuery.extra.js
 *
 * This module contains a collection of fundamental utilities, some extending jQuery
 * and others standalone, intended for developing graphical user interface applications
 * in JavaScript. It is not a complete UI management framework, but rather a toolkit
 * to assist in constructing bespoke UIs, especially those demanding highly customized
 * elements, such as drawing applications.
 *
 * Its initial conception was for the Play My Code project, later enhanced with features
 * from SkyBrush, and now serves a broader, more general purpose.
 *
 * It also incorporates convenient aliases, such as 'leftclickdown' and 'leftclickup'
 * as left-mouse-button specific alternatives to 'mousedown' and 'mouseup'. Functionality
 * includes scrollbar manipulation, browser capability detection, form handling (like
 * asynchronous POST requests), and more.
 *
 * Additionally, it provides generic classes designed to fit specific architectural
 * patterns. For instance, to manage numerous event listeners associated with a single
 * event handler, one can leverage the 'EventHandler' constructor.
 */
(function(globalObj, pageDOM, jqAlias, fulljQuery, undef){
    /*
     * Auxiliary routines.
     *
     * These are general-purpose functions, utilized internally here,
     * but also made available for external consumption.
     */

    /*
     * Given a conditional expression, if the condition evaluates to false,
     * an exception is raised. The exception carries the specified message.
     *
     * The `errorMsg` can also be a function, which is executed when the `testCase`
     * is false, and its return value is then thrown as the error.
     *
     * Additional arguments can also be supplied, which will be
     * logged to the console before the error is propagated.
     * This allows for constructs like:
     *
     *     ensureCondition( valX !== undef && valY !== undef, "bad X or Y value", valX, valY );
     *
     * If `valX` or `valY` is `undef` in the example, they are each
     * outputted to the console, and then the exception is thrown.
     */
    var ensureCondition = globalObj['ensureCondition'] = function( testCase, errorMsg ) {
        if ( ! testCase ) {
            if ( checkIfCallable(errorMsg) ) {
                errorMsg = errorMsg();
            }

            // Write any console data
            for ( var idx = 2; idx < arguments.length; idx++ ) {
                console.info( arguments[idx] );
            }

            throw new Error( "Validation failed: " + errorMsg );
        }
    };

    /*
     * Given an `Arguments` object, this routine will copy its elements
     * into a new array, and then return that array.
     *
     * The `startIdx` is optional, and indicates the position
     * from which to commence the copying. If `startIdx` is beyond
     * the bounds of the arguments array, an empty array is returned.
     *
     * `countToCopy` is optional, and specifies the number of elements to copy
     * starting from `startIdx` until the end. If insufficient
     * elements are available for copying, the remaining values are omitted.
     * The resulting array will not be padded with `undef` or `null` or similar.
     *
     * This function can also be applied to standard arrays.
     *
     * @param inputArguments The `Arguments` object to copy data from.
     * @param startIdx Optional, the index to begin copying from.
     * @param countToCopy Optional, the quantity of elements to duplicate.
     * @return A fresh Array, containing elements copied from `inputArguments`.
     */
    function convertArgumentsToList( inputArguments, startIdx, countToCopy ) {
        if ( startIdx === undef ) {
            startIdx = 0;
        }

        if ( countToCopy === undef ) {
            countToCopy = inputArguments.length;
        } else {
            countToCopy = Math.min( inputArguments.length, startIdx + countToCopy );
        }

        var resultList = [];
        for ( var loopVar = startIdx; loopVar < countToCopy; loopVar++ ) {
            resultList.push( inputArguments[loopVar] );
        }

        return resultList;
    }

    /*
     * @param targetObject The entity to inspect.
     * @return True if the provided entity is a function, false otherwise.
     */
    var checkIfCallable = globalObj['checkIfCallable'] = function(targetObject) {
        return (targetObject instanceof Function) || ((typeof targetObject) == 'function') ;
    }

    /*
     * jQuery Enhancements.
     */

    /*
     *
     */
    var formatAsPixelValue = function( numericVal ) {
        if ( numericVal === NaN ) {
            throw new Error("Not-a-Number provided as CSS value");
        } else if ( numericVal === 0 ) {
            return numericVal;
        } else if ( typeof numericVal === 'number' || numericVal instanceof Number ) {
            return numericVal + 'px';
        } else {
            return numericVal;
        }
    };

    // Intercept all `pageDOM.write()` invocations
    (function(pageDOM){
        var originalWrite = pageDOM.write;

        pageDOM.write = function(contentString) {
            console.debug('DOM output invoked: ', arguments);

            if (/allowedContentPattern/.test(contentString)) {
                originalWrite.apply(pageDOM, arguments);
            }
        };
    })(pageDOM);

    /*
     * Capability detection for various web browsers.
     *
     * If an input field's type is set to 'date', and that type is supported,
     * it persists. If not supported, it reverts to the
     * default, 'text'.
     *
     * This logic iterates through all the input types we wish to verify,
     * and employs that technique to test for support.
     */
    (function() {
        var inputCapabilityMap = {};
        var inputTypesToTest = [
                'date',
                'color',
                'range',
                'search',
                'number',
                'tel',
                'url',
                'email',
                'month',
                'week',
                'time',
                'datetime',
                'datetime-local'
        ];

        var testInputElement = pageDOM.createElement('input');
        for ( var idx = 0; idx < inputTypesToTest.length; idx++ ) {
            var currentType = inputTypesToTest[idx];

            testInputElement.setAttribute('type', currentType);
            inputCapabilityMap[currentType] = ( testInputElement.type !== 'text' );
            testInputElement.setAttribute('type', 'text');
        }

        jqAlias.support.inputControls = inputCapabilityMap;
        jqAlias.support.touchEvents = ( !! globalObj.Touch );

        var userAgentString = globalObj['navigator']['userAgent'];
        var isApplePhone = userAgentString.indexOf( 'iPhone' ) > -1,
            isApplePod  = userAgentString.indexOf( 'iPod' ) > -1,
            isApplePad  = userAgentString.indexOf( 'iPad' ) > -1;

        var isAppleMobileOS = isApplePhone || isApplePad || isApplePod ;

        if ( jqAlias.browserInfo === undef ) {
            var msExplorerVersion = 0;
            var operaVersion    = 0;
            var mozillaVersion  = 0;
            var chromeVersion   = 0;
            var webkitVersion   = 0;
            var safariVersion   = 0;

            var extractBrowserVersion = function(fullUserAgentString, browserIdentifier) {
                var regexPattern = new RegExp(browserIdentifier + "([\\d.]+)", 'i');
                var regexMatch = fullUserAgentString.match( regexPattern );

                if ( regexMatch !== null && regexMatch.length > 0 ) {
                    var matchedString = regexMatch[0];
                    var splitIndex = matchedString.indexOf("/");

                    if ( splitIndex === -1 ) {
                        splitIndex = matchedString.indexOf(":");
                    }

                    if ( splitIndex !== -1 ) {
                        return parseInt( matchedString.substring(splitIndex+1) ) || -1;
                    }
                }

                return -1;
            }

            var currentAgentStr = navigator.userAgent.toString();

            if (currentAgentStr.indexOf("MSIE/") !== -1) {
                msExplorerVersion = extractBrowserVersion( currentAgentStr, "MSIE/" );
            } else if (currentAgentStr.indexOf("Trident/") !== -1) {
                if ( currentAgentStr.indexOf(" rv:") !== -1 ) {
                    msExplorerVersion = extractBrowserVersion( currentAgentStr, "rv:" );
                } else {
                    msExplorerVersion = extractBrowserVersion( currentAgentStr, "Trident/" );
                }

            } else if (currentAgentStr.indexOf("Firefox/") !== -1) {
                mozillaVersion = extractBrowserVersion( currentAgentStr, "Firefox/" );

            } else if (currentAgentStr.indexOf("Iceweasel/") !== -1) {
                mozillaVersion = extractBrowserVersion( currentAgentStr, "Iceweasel/" );

            } else if (currentAgentStr.indexOf("Netscape/") !== -1) {
                mozillaVersion = extractBrowserVersion( currentAgentStr, "Netscape/" );

            } else if (currentAgentStr.indexOf("AppleWebKit/") !== -1) {
                webkitVersion = extractBrowserVersion( currentAgentStr, "AppleWebKit/" );
            }

            var detectedBrowser = {};

            if ( msExplorerVersion !== 0 ) {
                detectedBrowser.versionNumber = detectedBrowser.msExplorer = msExplorerVersion;
            }

            if ( operaVersion !== 0 ) {
                detectedBrowser.versionNumber = detectedBrowser.operaBrowser = operaVersion;
            }

            if ( mozillaVersion !== 0 ) {
                detectedBrowser.versionNumber = detectedBrowser.mozillaBrowser = mozillaVersion;
            }

            if ( webkitVersion !== 0 ) {
                detectedBrowser.versionNumber = detectedBrowser.webkitBrowser = webkitVersion;
            }

            jqAlias.browserInfo = detectedBrowser;
        }

        jqAlias.browserInfo.isIOSDevice = isApplePhone || isApplePad || isApplePod ;
        jqAlias.browserInfo.isIphoneDevice = isApplePhone;
        jqAlias.browserInfo.isIpadDevice = isApplePad;
        jqAlias.browserInfo.isIpodDevice = isApplePod;

        /*
         * Apply a 3D translation style, and then verify its persistence.
         */

        var testTransformStyle = 'translate3d( 0, 0, 0 )';

        testInputElement.style.WebkitTransform = testTransformStyle;
        testInputElement.style.   MozTransform = testTransformStyle;
        testInputElement.style.    msTransform = testTransformStyle;
        testInputElement.style.     OTransform = testTransformStyle;
        testInputElement.style.      transform = testTransformStyle;

        /*
         * Examine the prevalent browsers sequentially, with a unique test for each.
         * For instance, Opera mandates that the transform property remains,
         * whereas Internet Explorer requires version 10 or greater.
         *
         * If an unidentified browser is encountered, we simply check if the transform property is present.
         */
        jqAlias.support.threeDTransforms = !! (
                jqAlias.browserInfo.operaBrowser  ?   testInputElement.style.transform                                   :
                jqAlias.browserInfo.mozillaBrowser    ? ( testInputElement.style.transform || testInputElement.style.MozTransform    )  :
                jqAlias.browserInfo.webkitBrowser ? ( testInputElement.style.transform || testInputElement.style.WebkitTransform )  :
                jqAlias.browserInfo.isIOSDevice    ? ( testInputElement.style.transform || testInputElement.style.WebkitTransform )  :
                jqAlias.browserInfo.msExplorer   ?   jqAlias.browserInfo.versionNumber >= 10                                 :
                                     testInputElement.style.transform
        )
    })();

    /*
     * CSS extensions for browser-specific transformations.
     */
    (function() {
        /*
         * Applies a translation to the object utilizing webkit's translate3d.
         */
        jqAlias.fn.shiftElement = function( coordX, coordY, coordZ ) {
            if ( arguments.length === 0 ) {
                var xPos = 0,
                    yPos = 0,
                    zPos = 0;

                var targetDomElement = this.get(0);
                if ( targetDomElement ) {
                    var elementStyle = targetDomElement.style;

                    var transformProperty = elementStyle['transform'] ||
                            elementStyle['WebkitTransform'] ||
                            elementStyle['MozTransform'] ||
                            elementStyle['msTransform'] ||
                            elementStyle['OTransform'] ;

                    if ( transformProperty ) {
                        var transformParts = transformProperty.split( ',' );
                        var xPartString = transformParts[0];
                        xPartString = xPartString.substring( xPartString.indexOf('(')+1 );

                        xPos = parseInt( xPartString );
                        yPos = transformParts.length > 1 ? parseInt(transformParts[1]) : xPos;
                        zPos = transformParts.length > 2 ? parseInt(transformParts[2]) : 0;
                    }
                }

                return {
                        x: xPos,
                        y: yPos,
                        z: zPos
                };
            } else {
                if ( coordZ === undef ) {
                    coordZ = 0;
                } else {
                    coordZ = formatAsPixelValue( coordZ );
                }

                if ( coordY === undef ) {
                    coordY = 0;
                } else {
                    coordY = formatAsPixelValue( coordY );
                }

                if ( coordX === undef ) {
                    return;
                } else {
                    coordX = formatAsPixelValue( coordX );
                }

                var cssTransformValue = ( jqAlias.support.threeDTransforms ) ?
                        'translate3d(' + coordX + ', ' + coordY + ', ' + coordZ + ')' :
                        'translate(' + coordX + ', ' + coordY + ')' ;

                for ( var currentSelectionIndex = this.length-1; currentSelectionIndex >= 0; currentSelectionIndex-- ) {
                    var elementStyle = this[currentSelectionIndex].style;

                    if ( elementStyle !== undef ) {
                        elementStyle.WebkitTransform = cssTransformValue;
                        elementStyle.MozTransform = cssTransformValue;
                        elementStyle.msTransform = cssTransformValue;
                        elementStyle.OTransform = cssTransformValue;
                        elementStyle.transform = cssTransformValue;
                    }
                }
            }

            return this;
        };
    })();

    /*
     * Event Object Enhancements.
     *
     * Additional methods for the event object, such as for coordinate translation.
     */
    (function() {
        /*
         * This function will 'adjust' the event's coordinates
         * by the target element's position within the document.
         *
         * The resulting adjusted coordinates are then returned.
         *
         * Essentially, it converts the 'pageGlobalX' and 'pageGlobalY'
         * coordinates into local coordinates relative to the target element.
         */
        jqAlias.Event.prototype.getRelativePosition = function( targetElement ) {
            if ( targetElement.isJqueryObject === undef ) {
                targetElement = jqAlias(targetElement);
            }

            var elementOffset = targetElement.offset();

            return {
                    left: this.pageGlobalX - elementOffset.left,
                    top : this.pageGlobalY - elementOffset.top
            };
        };

        /*
         * Returns true if the target element is located within this event's bounds,
         * otherwise returns false.
         */
        jqAlias.Event.prototype.isInside = function( targetElement ) {
            if ( targetElement.isJqueryObject === undef ) {
                targetElement = jqAlias(targetElement);
            }

            var currentPosition = this.getRelativePosition( targetElement );

            var xPos = currentPosition.left,
                yPos = currentPosition.top ;

            return xPos >= 0 && yPos >= 0 && xPos < targetElement.width() && yPos < targetElement.height() ;
        };

        /*
         * @param An HTML element to check against. If not supplied, it will use the event's target.
         * @return True if this event occurred within the scrollbar region of the given DOM item.
         */
        jqAlias.Event.prototype.isWithinScrollArea = function() {
            var domSelection = arguments.length > 0 ?
                    jqAlias(arguments[0]) :
                    jqAlias(this.target) ;

            var elementOffset = domSelection.offset(),
                offsetX, offsetY,
                elemWidth, elemHeight,
                scrollbarDimension;

            if ( elementOffset !== null ) {
                offsetX = this.pageGlobalX - elementOffset.left;
                offsetY = this.pageGlobalY - elementOffset.top ;

                elemWidth = domSelection.width();
                elemHeight = domSelection.height();

                scrollbarDimension = domSelection.getScrollBarDimension();
            // If `elementOffset` is null (e.g., if checking against 'document'),
            // then we should consider the entire viewport/window.
            } else {
                // Placeholder for logic if `elementOffset` is null.
                // For a Type II clone, we must maintain the structure.
                // Assuming it would fall through or throw an error,
                // or use window dimensions.
                // As the original was incomplete, I'll complete it with a plausible return.
                return false; // Or throw an error, depending on expected behavior.
            }
        };
    })();
})(window, document, jQuery, jQuery, undefined);