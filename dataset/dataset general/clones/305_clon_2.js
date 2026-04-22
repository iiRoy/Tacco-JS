var globalObj = this,
    documentRef = this.document,
    undefinedVal;

/*
 * Range Control Library v1.0.0 (Custom Build)
 * Based on: http://modernizr.com/download/#-inputtypes-load
 */
;

globalObj.InteractiveRange = (function( currentWindow, currentDocument, undefinedInput ) {

    var libVersion = '1.0.0',

    InteractiveRange = {},


    mainDocElement = currentDocument.documentElement,

    featureTestId = 'capabilityTest',
    featureTestElement = currentDocument.createElement(featureTestId),
    elementStyle = featureTestElement.style,

    testInputBox  = currentDocument.createElement('input')  ,

    testString = 'hello',

    objToStringMethod = {}.toString,
    featureChecks = {},
    inputCapability = {},
    elementAttributes = {},

    detectedCapabilities = [],

    arraySlice = detectedCapabilities.slice,

    currentFeatureKey,



    internalHasOwn = ({}).hasOwnProperty,
    checkOwnProperty;

    // Check if the native hasOwnProperty method is available and callable.
    if ( !isType(internalHasOwn, 'undefined') && !isType(internalHasOwn.call, 'undefined') ) {
      checkOwnProperty = function (parentObject, propName) {
        return internalHasOwn.call(parentObject, propName);
      };
    }
    // Fallback for environments where hasOwnProperty might be problematic.
    else {
      checkOwnProperty = function (parentObject, propName) {
        return ((propName in parentObject) && isType(parentObject.constructor.prototype[propName], 'undefined'));
      };
    }


    // Polyfill for Function.prototype.bind if not natively available.
    if (!Function.prototype.bind) {
      Function.prototype.bind = function attachContext(bindContext) {

        var originalFunction = this;

        // Ensure the target is indeed a function.
        if (typeof originalFunction != "function") {
            throw new TypeError("Binding target must be a function.");
        }

        var boundArguments = arraySlice.call(arguments, 1),
            newlyBoundFunction = function () {

            // If called as a constructor, ensure `this` is correctly handled.
            if (this instanceof newlyBoundFunction) {

              var TempConstructor = function(){};
              TempConstructor.prototype = originalFunction.prototype;
              var instanceObject = new TempConstructor();

              var functionResult = originalFunction.apply(
                  instanceObject,
                  boundArguments.concat(arraySlice.call(arguments))
              );
              // If the original function returned an object, use it; otherwise, use the new instance.
              if (Object(functionResult) === functionResult) {
                  return functionResult;
              }
              return instanceObject;

            } else {

              // If called as a regular function, apply with the specified context.
              return originalFunction.apply(
                  bindContext,
                  boundArguments.concat(arraySlice.call(arguments))
              );

            }

        };

        return newlyBoundFunction;
      };
    }

    // Applies a CSS string to the feature test element's style.
    function applyCssString( styleValue ) {
        elementStyle.cssText = styleValue;
    }

    // Applies a CSS string with vendor prefixes.
    function applyPrefixedCss( primaryCss, secondaryCss ) {
        return applyCssString(prefixes.join(primaryCss + ';') + ( secondaryCss || '' ));
    }

    // Checks if an object's type matches a given string.
    function isType( itemToCheck, expectedType ) {
        return typeof itemToCheck === expectedType;
    }

    // Determines if a string contains a specified substring.
    function stringIncludes( mainString, subString ) {
        return !!~('' + mainString).indexOf(subString);
    }


    // Tests for the existence of properties on a DOM object.
    function inspectDOMProperties( propertyList, targetObject, domElement ) {
        for ( var idx in propertyList ) {
            var currentProperty = targetObject[propertyList[idx]];
            if ( currentProperty !== undefinedInput) {

                            // If domElement is false, just return the property name.
                            if (domElement === false) return propertyList[idx];

                            // If the property is a function, bind it to the element or object.
                            if (isType(currentProperty, 'function')){
                                return currentProperty.bind(domElement || targetObject);
                }

                            // Otherwise, return the property itself.
                            return currentProperty;
            }
        }
        return false;
    }
    // Detects support for various HTML5 input types.
    function checkInputTypes() {
                            InteractiveRange['inputtypes'] = (function(supportedTypes) {

            for ( var idx = 0, testResult, inputTypeIdentifier, domWindow, count = supportedTypes.length; idx < count; idx++ ) {

                testInputBox.setAttribute('type', inputTypeIdentifier = supportedTypes[idx]);
                testResult = testInputBox.type !== 'text';

                                                    // Perform additional checks for certain input types.
                                                    if ( testResult ) {

                    testInputBox.value         = testString;
                    testInputBox.style.cssText = 'position:absolute;visibility:hidden;';

                    // Special handling for 'range' type with Webkit.
                    if ( /^range$/.test(inputTypeIdentifier) && testInputBox.style.WebkitAppearance !== undefinedInput ) {

                      mainDocElement.appendChild(testInputBox);
                      domWindow = currentDocument.defaultView;

                                        testResult =  domWindow.getComputedStyle &&
                              domWindow.getComputedStyle(testInputBox, null).WebkitAppearance !== 'textfield' &&
                                                                                  (testInputBox.offsetHeight !== 0);

                      mainDocElement.removeChild(testInputBox);

                    } else if ( /^(search|tel)$/.test(inputTypeIdentifier) ){
                                                                                    // No specific additional checks for search/tel.
                                                                                    } else if ( /^(url|email)$/.test(inputTypeIdentifier) ) {
                                        // Check validity for URL/Email types.
                                        testResult = testInputBox.checkValidity && testInputBox.checkValidity() === false;

                    } else {
                                        // Default check: value should not be the test string.
                                        testResult = testInputBox.value != testString;
                    }
                }

                inputCapability[ supportedTypes[idx] ] = !!testResult;
            }
            return inputCapability;
        })('color range number time week month date datetime-local datetime email url tel search'.split(' '));
        }
    // Iterate through feature checks and update InteractiveRange object.
    for ( var feature in featureChecks ) {
        if ( checkOwnProperty(featureChecks, feature) ) {
                                    currentFeatureKey  = feature.toLowerCase();
            InteractiveRange[currentFeatureKey] = featureChecks[feature]();

            detectedCapabilities.push((InteractiveRange[currentFeatureKey] ? '' : 'no-') + currentFeatureKey);
        }
    }

    // Execute input type checks if not already done.
    InteractiveRange.input || checkInputTypes();


     // Method to add new feature tests dynamically.
     InteractiveRange.addTest = function ( testFeature, testFunction ) {
       if ( typeof testFeature == 'object' ) {
         for ( var propertyKey in testFeature ) {
           if ( checkOwnProperty( testFeature, propertyKey ) ) {
             InteractiveRange.addTest( propertyKey, testFeature[ propertyKey ] );
           }
         }
       } else {

         testFeature = testFeature.toLowerCase();

         if ( InteractiveRange[testFeature] !== undefinedInput ) {
                                              // If test already exists, return early.
                                              return InteractiveRange;
         }

         // Execute test function if it's a function, otherwise use the value directly.
         testFunction = typeof testFunction == 'function' ? testFunction() : testFunction;

         // Optionally add classes to the document element.
         if (typeof enableClasses !== "undefined" && enableClasses) {
           mainDocElement.className += ' ' + (testFunction ? '' : 'no-') + testFeature;
         }
         InteractiveRange[testFeature] = testFunction;

       }

       return InteractiveRange;
     };


    // Clean up temporary elements and styles.
    applyCssString('');
    featureTestElement = testInputBox = null;


    InteractiveRange._version      = libVersion;


    return InteractiveRange;

})(this, this.document);
/*
 * Asset Loading Utility (yepnope-like) | WTFPL License
 */
(function(globalScope, documentRef, undefinedVal){
    // Checks if the given object is a function.
    function isFunction(obj){return"[object Function]"==objToStringMethod.call(obj)}
    // Checks if the given object is a string.
    function isString(obj){return"string"==typeof obj}
    // An empty function, used as a placeholder.
    function noopFunc(){}
    // Determines if a script/link element has finished loading.
    function isElementLoaded(el){return!el||"loaded"==el||"complete"==el||"uninitialized"==el}
    // Processes the next item in the loading queue.
    function executeNextItem(){
        var currentItem=executionQueue.shift();
        isProcessingQueue=1;
        currentItem?currentItem.t?asyncTimeout(function(){("c"==currentItem.t?resourceLoader.injectCss:resourceLoader.injectJs)(currentItem.s,0,currentItem.a,currentItem.x,currentItem.e,1)},0):(currentItem(),executeNextItem()):isProcessingQueue=0
    }
    // Inserts a script or link element into the DOM.
    function insertElement(tagType, resourceUrl, dataType, index, errorTimeout, attributes, isAsync){
        function onLoadCallback(event){
            if(!isLoaded&&isElementLoaded(createdElement.readyState)&&(resourceDetails.r=isLoaded=1,!isProcessingQueue&&executeNextItem(),createdElement.onload=createdElement.onreadystatechange=null,event)){
                "img"!=tagType&&asyncTimeout(function(){insertionParent.removeChild(createdElement)},50);
                for(var prop in resourceStatus[resourceUrl])resourceStatus[resourceUrl].hasOwnProperty(prop)&&resourceStatus[resourceUrl][prop].onload()
            }
        }
        var timeoutDuration=isAsync||resourceLoader.errorTimeout,
            createdElement=documentRef.createElement(tagType),
            isLoaded=0,
            isCached=0,
            resourceDetails={t:dataType,s:resourceUrl,e:errorTimeout,a:attributes,x:timeoutDuration};
        1===resourceStatus[resourceUrl]&&(isCached=1,resourceStatus[resourceUrl]=[]),
        "object"==tagType?createdElement.data=resourceUrl:(createdElement.src=resourceUrl,createdElement.type=tagType),
        createdElement.width=createdElement.height="0",
        createdElement.onerror=createdElement.onload=createdElement.onreadystatechange=function(){onLoadCallback.call(this,isCached)},
        executionQueue.splice(index,0,resourceDetails),
        "img"!=tagType&&(isCached||2===resourceStatus[resourceUrl]?(insertionParent.insertBefore(createdElement,canCompareNodes?null:firstScriptElement),asyncTimeout(onLoadCallback,timeoutDuration)):resourceStatus[resourceUrl].push(createdElement))
    }
    // Loads a resource (CSS or JS).
    function loadResource(url, type, isNoExec, attrs, timeoutVal, isForceAsync){
        return isProcessingQueue=0,
        type=type||"j",
        isString(url)?insertElement("c"==type?linkTagType:scriptTagType,url,type,this.resourceIndex++,isNoExec,attrs,timeoutVal):(executionQueue.splice(this.resourceIndex++,0,url),1==executionQueue.length&&executeNextItem()),
        this
    }
    // Initializes and returns the loader object.
    function initializeLoader(){
        var loaderInstance=resourceLoader;
        return loaderInstance.loader={load:loadResource,resourceIndex:0},loaderInstance
    }
    var docRoot=documentRef.documentElement,
        asyncTimeout=globalScope.setTimeout,
        firstScriptElement=documentRef.getElementsByTagName("script")[0],
        objToStringMethod={}.toString,
        executionQueue=[],
        isProcessingQueue=0,
        isMozAppearance="MozAppearance"in docRoot.style,
        canCompareNodes=isMozAppearance&&!!documentRef.createRange().compareNode,
        insertionParent=canCompareNodes?docRoot:firstScriptElement.parentNode,
        docRoot=globalScope.opera&&"[object Opera]"==objToStringMethod.call(globalScope.opera),
        docRoot=!!documentRef.attachEvent&&!docRoot,
        objectTagType=isMozAppearance?"object":docRoot?"script":"img",
        scriptTagType=docRoot?"script":objectTagType,
        isArray=Array.isArray||function(obj){return"[object Array]"==objToStringMethod.call(obj)},
        prefixHandlers=[],
        resourceStatus={},
        configHandlers={timeout:function(resourceObj,params){return params.length&&(resourceObj.timeout=params[0]),resourceObj}},
        domContentLoadedCallback,
        resourceLoader;

    resourceLoader=function(resourceConfig){
        // Parses a resource path to extract prefixes and URL.
        function parseResourcePath(path){
            var parts=path.split("!"),
                handlerCount=prefixHandlers.length,
                resourceURL=parts.pop(),
                prefixCount=parts.length,
                parsedResource={url:resourceURL,origUrl:resourceURL,prefixes:parts},
                prefixHandler,
                propName,
                handlerResult;
            for(propName=0;propName<prefixCount;propName++)handlerResult=parts[propName].split("="),(prefixHandler=configHandlers[handlerResult.shift()])&&(parsedResource=prefixHandler(parsedResource,handlerResult));
            for(propName=0;propName<handlerCount;propName++)parsedResource=prefixHandlers[propName](parsedResource);
            return parsedResource
        }
        // Processes a single resource for loading.
        function processResource(resourceUrl, callback, loaderObj, index, isForceAsync){
            var parsedItem=parseResourcePath(resourceUrl),
                autoCallback=parsedItem.autoCallback;
            parsedItem.url.split(".").pop().split("?").shift(),
            parsedItem.bypass||(callback&&(callback=isFunction(callback)?callback:callback[resourceUrl]||callback[index]||callback[resourceUrl.split("/").pop().split("?")[0]]),
            parsedItem.instead?parsedItem.instead(resourceUrl,callback,loaderObj,index,isForceAsync):(
                resourceStatus[parsedItem.url]?parsedItem.noexec=!0:resourceStatus[parsedItem.url]=1,
                loaderObj.load(parsedItem.url,parsedItem.forceCSS||!parsedItem.forceJS&&"css"==parsedItem.url.split(".").pop().split("?").shift()?"c":scriptTagType,parsedItem.noexec,parsedItem.attrs,parsedItem.timeout),
                (isFunction(callback)||isFunction(autoCallback))&&loaderObj.load(function(){
                    executeNextItem(),
                    callback&&callback(parsedItem.origUrl,isForceAsync,index),
                    autoCallback&&autoCallback(parsedItem.origUrl,isForceAsync,index),
                    resourceStatus[parsedItem.url]=2
                })
            ))
        }
        // Handles a configuration object containing multiple resources.
        function handleConfigObject(configObj, loaderObj){
            function innerProcess(items, isForced){
                if(items){
                    if(isString(items))isForced||(callbackFn=function(){var args=[].slice.call(arguments);finalCallback.apply(this,args),completionFn()}),processResource(items,callbackFn,loaderObj,0,configObjRef);
                    else if(Object(items)===items)for(propertyKey in totalItems=function(){var count=0,prop;for(prop in items)items.hasOwnProperty(prop)&&count++;return count}(),items)items.hasOwnProperty(propertyKey)&&(!isForced&&!--totalItems&&(isFunction(callbackFn)?callbackFn=function(){var args=[].slice.call(arguments);finalCallback.apply(this,args),completionFn()}:callbackFn[propertyKey]=function(fn){return function(){var args=[].slice.call(arguments);fn&&fn.apply(this,args),completionFn()}}(finalCallback[propertyKey])),processResource(items[propertyKey],callbackFn,loaderObj,propertyKey,configObjRef))
                }else!isForced&&completionFn()
            }
            var configObjRef=!!configObj.test,
                loadItems=configObj.load||configObj.both,
                callbackFn=configObj.callback||noopFunc,
                finalCallback=callbackFn,
                completionFn=configObj.complete||noopFunc,
                totalItems,
                propertyKey;
            innerProcess(configObjRef?configObj.yep:configObj.nope,!!loadItems),
            loadItems&&innerProcess(loadItems)
        }
        var currentResource,
            resourceItem,
            loaderObj=this.assetLoader.loader;
        if(isString(resourceConfig))processResource(resourceConfig,0,loaderObj,0);
        else if(isArray(resourceConfig))for(currentResource=0;currentResource<resourceConfig.length;currentResource++)resourceItem=resourceConfig[currentResource],isString(resourceItem)?processResource(resourceItem,0,loaderObj,0):isArray(resourceItem)?resourceLoader(resourceItem):Object(resourceItem)===resourceItem&&handleConfigObject(resourceItem,loaderObj);
        else Object(resourceConfig)===resourceConfig&&handleConfigObject(resourceConfig,loaderObj)
    },
    resourceLoader.addPrefix=function(prefixName,handler){configHandlers[prefixName]=handler},
    resourceLoader.addFilter=function(filterFn){prefixHandlers.push(filterFn)},
    resourceLoader.errorTimeout=1e4,
    null==documentRef.readyState&&documentRef.addEventListener&&(documentRef.readyState="loading",documentRef.addEventListener("DOMContentLoaded",domContentLoadedCallback=function(){documentRef.removeEventListener("DOMContentLoaded",domContentLoadedCallback,0),documentRef.readyState="complete"},0)),
    globalScope.assetLoader=initializeLoader(),
    globalScope.assetLoader.executeStack=executeNextItem,
    globalScope.assetLoader.injectJs=function(jsUrl, callback, attrs, timeoutVal, isForceAsync, isExecuteStack){
        var scriptElement=documentRef.createElement("script"),
            isLoaded,
            prop,
            timeoutDuration=timeoutVal||resourceLoader.errorTimeout;
        scriptElement.src=jsUrl;
        for(prop in attrs)scriptElement.setAttribute(prop,attrs[prop]);
        callback=isExecuteStack?executeNextItem:callback||noopFunc,
        scriptElement.onreadystatechange=scriptElement.onload=function(){!isLoaded&&isElementLoaded(scriptElement.readyState)&&(isLoaded=1,callback(),scriptElement.onload=scriptElement.onreadystatechange=null)},
        asyncTimeout(function(){isLoaded||(isLoaded=1,callback(1))},timeoutDuration),
        isForceAsync?scriptElement.onload():firstScriptElement.parentNode.insertBefore(scriptElement,firstScriptElement)
    },
    globalScope.assetLoader.injectCss=function(cssUrl, callback, attrs, timeoutVal, isForceAsync, isExecuteStack){
        var linkElement=documentRef.createElement("link"),
            prop,
            callbackFn=isExecuteStack?executeNextItem:callback||noopFunc;
        linkElement.href=cssUrl,
        linkElement.rel="stylesheet",
        linkElement.type="text/css";
        for(prop in attrs)linkElement.setAttribute(prop,attrs[prop]);
        isForceAsync||(firstScriptElement.parentNode.insertBefore(linkElement,firstScriptElement),asyncTimeout(callbackFn,0))
    }
})(this,document);
InteractiveRange.loadAssets=function(){assetLoader.apply(globalObj,[].slice.call(arguments,0));};
;

/*
 * vr-range-component
 * (c) 2013-2014 Venturocket, Inc. http://github.com/Venturocket
 * License: MIT
 */

angular.module('app.components.range', ['ui.gesture']).directive('rangeControl',
	['$timeout', '$document', '$interpolate', '$swipe',
	 	function(asyncService, domService, textFormatService, gestureService) {

            /**
             * How firm the handle grips the slider.
             * @type {number}
             */
            var HANDLE_GRIP_FACTOR = 5;

            /**
             * You want custom interpolation delimiters? You can have custom delimiters.
             * @type {string}
             */
            var interpStartDelimiter = textFormatService.startSymbol(),
                interpEndDelimiter = textFormatService.endSymbol();

            /**
             * Converts a standard DOM element into an Angular-wrapped element.
             * @param {object} standardElement
             * @returns {object} The Angular-enhanced element.
             */
            function wrapWithAngular(standardElement) {
                return angular.element(standardElement);
            }

            /**
             * Appends 'px' to a numeric position value.
             * @param {(string|Number)} positionValue
             * @returns {string} The pixel-suffixed string.
             */
            function convertToPixels(positionValue) {
                return "" + positionValue + "px";
            }

            /**
             * Adjusts the opacity of a given element.
             * @param {object} targetElement
             * @param {Number} transparencyValue
             * @returns {object} The modified element.
             */
            function adjustVisibility(targetElement, transparencyValue) {
                return targetElement.css({
                    opacity: transparencyValue
                });
            }

            /**
             * Sets an element's opacity to zero, making it invisible.
             * @param {object} targetElement
             * @returns {object} The modified element.
             */
            function concealElement(targetElement) {
                return adjustVisibility(targetElement, 0);
            }

            /**
             * Sets an element's opacity to one, making it fully visible.
             * @param {object} targetElement
             * @returns {object} The modified element.
             */
            function revealElement(targetElement) {
                return adjustVisibility(targetElement, 1);
            }

            /**
             * Positions an element from the left side.
             * @param {object} targetElement
             * @param {Number|string} leftPosition
             * @returns {object} The modified element.
             */
            function positionLeft(targetElement, leftPosition) {
                return targetElement.css({
                    left: leftPosition
                });
            }

            /**
             * Determines the computed width of an element.
             * @param {object} targetElement
             * @returns {number} The element's width in pixels.
             */
            function getElementWidth(targetElement) {
                var calculatedWidth = parseFloat(targetElement.css('width'));
                return isNaN(calculatedWidth) ? targetElement[0].offsetWidth : calculatedWidth;
            }

            /**
             * Computes half the width of a given element.
             * @param {object} targetElement
             * @returns {number} Half of the element's width.
             */
            function getHalfWidth(targetElement) {
                return getElementWidth(targetElement) / 2;
            }

            /**
             * Calculates the left boundary position of an element relative to the viewport.
             * @param {object} targetElement
             * @returns {Number} The element's left offset.
             */
            function getLeftBoundary(targetElement) {
                try {return targetElement.offset().left;} catch(e) {}
                return targetElement[0].getBoundingClientRect().left; // + scrollX;
            }

            /**
             * Computes the clear space between two elements.
             * @param {object} firstElement
             * @param {object} secondElement
             * @returns {number} The gap distance.
             */
            function calculateElementGap(firstElement, secondElement) {
                if(getLeftBoundary(firstElement) > getLeftBoundary(secondElement)) {
                    return getLeftBoundary(firstElement) - getLeftBoundary(secondElement) - getElementWidth(secondElement);
                }
                return getLeftBoundary(secondElement) - getLeftBoundary(firstElement) - getElementWidth(firstElement);
            }

            /**
             * Binds an HTML string as a template to an element.
             * @param {object} targetElement
             * @param {string} htmlContent
             * @returns {object} The modified element.
             */
            function setHtmlBinding(targetElement, htmlContent) {
                return targetElement.attr('ng-bind-template', htmlContent);
            }

            /**
             * Adjusts a value to the nearest valid step within a given range and precision.
             * @param {Number} [currentValue = 0]
             * @param {Number} [decimalPlaces = 0]
             * @param {Number} [incrementSize = 1/Math.pow(10, decimalPlaces)]
             * @param {Number} [lowerBound = 0]
             * @param {Number} [upperBound]
             * @returns {Number} The value snapped to the nearest step.
             */
            function snapToNearestStep(currentValue, decimalPlaces, incrementSize, lowerBound, upperBound) {

                // decimalPlaces is an optional parameter.
                if(angular.isUndefined(decimalPlaces) || !decimalPlaces) {
                    decimalPlaces = 0;
                }

                // incrementSize is an optional parameter.
                if(angular.isUndefined(incrementSize) || !incrementSize || incrementSize == 0) {
                    incrementSize = 1 / Math.pow(10, decimalPlaces);
                }

                // lowerBound is an optional parameter.
                if(angular.isUndefined(lowerBound) || !lowerBound) {
                    lowerBound = 0;
                }

                // currentValue is an optional parameter.
                if(angular.isUndefined(currentValue) || !currentValue) {
                    currentValue = 0;
                }

                // Calculate the remainder when divided by the step.
                var remainder = (currentValue - lowerBound) % incrementSize;

                // Round the currentValue to the nearest step.
                var alignedValue = remainder > (incrementSize / 2) ? currentValue + incrementSize - remainder : currentValue - remainder;

                // upperBound is an optional parameter.
                if(angular.isUndefined(upperBound) || !upperBound) {
                    upperBound = alignedValue;
                }

                // Clamp the value within the specified range.
                alignedValue = Math.min(Math.max(alignedValue, lowerBound), upperBound);

                // Apply the specified precision.
                return parseFloat(alignedValue.toFixed(decimalPlaces));
            }

			/**
			 * Rounds a number to the nearest multiple of a given step.
			 * @param {number} inputNumber
			 * @param {number} roundingStep
			 * @returns {number} The rounded number.
			 */
			function alignToGrid(inputNumber, roundingStep) {
				return Math.floor((inputNumber / roundingStep) + 0.5) * roundingStep;
			}

            /**
             * Rounds the buffer value up to the nearest multiple of the step.
             * @param {Number} incrementSize
             * @param {Number} currentBuffer
             * @returns {Number} The adjusted buffer.
             */
            function adjustBufferToStep(incrementSize, currentBuffer) {
                if(incrementSize > 0 && !isNaN(currentBuffer)) {
                    return Math.ceil(currentBuffer / incrementSize) * incrementSize;
                }
                return currentBuffer;
            }

            /**
             * Wraps a given expression with the application's interpolation delimiters.
             * @param {string} exprString
             * @returns {string} The formatted expression.
             */
            function formatExpression(exprString) {
                return interpStartDelimiter + " " + exprString + " " + interpEndDelimiter;
            }

            return {
                restrictionType: 'AE', // Attribute or Element
				requiredController: 'valueModel',
                isolationScope: {
                    minVal            	: '@',   // The absolute minimum value for the slider.
                    maxVal          	: '@',   // The absolute maximum value for the slider.
                    incrementSize     	: '@',   // The size of each step; omit or set to 0 for no steps.
					incrementDimension	: '@',   // An alias for incrementSize to avoid naming conflicts.
                    decimalPlaces     	: '@',   // The number of decimal places to consider.
                    proximityBuffer   	: '@',   // The minimum allowed distance between two handles in a dual slider.
                    gripStrength      	: '@',   // How "sticky" the slider handles should feel.
                    displayIncrements 	: '@',   // Boolean to show or hide step value bubbles.
                    modelValue        	: '=',   // Binding for single handle or low value in dual handle mode.
                    rangeModelValue   	: '=',   // Binding for the high value in dual handle mode.
					isDisabled		 	: '=',   // Boolean to enable or disable the slider.
					onValueChange		: '&',   // Callback function to execute when a value changes.
                    translateValue   	: '&',   // Function to customize display of single handle values.
                    translateRange   	: '&',   // Function to customize display of range values.
                    translateCombined	: '&',   // Function to customize display of combined values.
                    scaleFunction    	: '&',   // Function to apply custom scaling to slider values.
                    inverseScaleFunction: '&'    // Function to reverse custom scaling.
                },
                componentTemplate: // The main slider track background.
                    "<span class='track full'></span>" + // Secondary tracks for visual representation of steps.
                    "<span class='track increments'><span class='bubble increment' ng-repeat='step in stepBubbles()'></span></span>" + // Bubbles displaying step values.
                    "<span class='track selection'></span><span class='track unselected low'></span><span class='track unselected high'></span>" + // The slider handles.
                    "<span class='handle low'></span><span class='handle high'></span>" + // Current value bubbles for each handle.
                    "<span class='bubble low'></span><span class='bubble high'></span><span class='bubble center'></span><span class='bubble range'></span>" + // Low, high, center, and range selection bubbles.
                    "<span class='bubble boundary min'></span><span class='bubble boundary max'></span>" + // Bubbles for the minimum and maximum limits.
                    "<input type='range' class='input low' /><input type='range' class='input high' /><input type='range' class='input range' />", // Native HTML5 range inputs for browser compatibility.

                compileFunction: function(elementNode, elementAttributes) {
                    // Check if step bubbles should be displayed.
                    var displayIncrements = elementAttributes.displayIncrements;

					// Determine whether to use 'incrementSize' or 'incrementDimension' attribute.
					var incrementKey = elementAttributes.incrementDimension ? 'incrementDimension' : 'incrementSize';

                    // Identify if this is a dual-handle slider.
                    var hasDualHandles = elementAttributes.rangeModelValue != null,

                    // Initialize an object to store references to child elements.
                        childRefs = {},

                    // Define keys for referencing low, high, and selection bar values.
                        lowValueKey = 'modelValue',
                        highValueKey = 'rangeModelValue',
                        selectionBarKey = 'selectBar',

                    // List of properties to watch for changes in the scope.
                        watchedProperties = ['minVal', 'maxVal', 'gripStrength', lowValueKey];

                    /**
                     * Retrieves references to all direct child elements of the given parent.
                     * @param {object} [parentElement = elementNode] The parent element to inspect.
                     * @returns {Array} An array of Angular-wrapped child elements.
                     */
                    function getChildElements(parentElement) {
                        if(!parentElement) {
                            parentElement = elementNode;
                        }
                        var retrievedRefs = [];
                        angular.forEach(parentElement.children(), function(childEl) {
                            retrievedRefs.push(wrapWithAngular(childEl));
                        });
                        return retrievedRefs;
                    }

                    /**
                     *