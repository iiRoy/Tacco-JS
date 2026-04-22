;

/* Feature Detection Library (Version 2.6.2) | Permissive License */
globalThis.FeatureDetect = (function( currentWindow, currentDocument, undefinedValue ) {

    const libVersion = '2.6.2';

    let FeatureDetect = {};

    const enableHtmlClasses = true;

    const htmlRoot = currentDocument.documentElement;

    const detectionPrefix = 'feature-check';
    const testElement = currentDocument.createElement(detectionPrefix);
    const testElementStyle = testElement.style;

    const tempInputElement = currentDocument.createElement('input');

    const smileyIndicator = String.fromCharCode(58, 41); // ASCII for :)

    const objToString = Object.prototype.toString;

    const cssVendorPrefixes = ['-webkit-', '-moz-', '-o-', '-ms-', '']; // Common CSS vendor prefixes

    const domVendorStrings = 'Webkit,Moz,O,ms'.split(',');

    const cssObjectModelPrefixes = domVendorStrings;

    const domPropertyPrefixes = domVendorStrings.map(p => p.toLowerCase());

    const xmlNsMap = { 'svg': 'http://www.w3.org/2000/svg' };

    const capabilityChecks = {};
    const inputFeatureChecks = {};
    const attributeFeatureChecks = {};

    const detectedClasses = [];

    const arraySliceMethod = Array.prototype.slice;

    let currentTestName;


    const injectTestStyles = function( cssRuleString, successCallback, numberOfNodes, nodeIds ) {

      let styleBlock, result, tempNode, originalDocOverflow;
      const wrapperDiv = currentDocument.createElement('div');
      const docBody = currentDocument.body;
      const tempBody = docBody || currentDocument.createElement('body');

      if ( parseInt(numberOfNodes, 10) ) {
                      while ( numberOfNodes-- ) {
              tempNode = currentDocument.createElement('div');
              tempNode.id = nodeIds ? nodeIds[numberOfNodes] : detectionPrefix + (numberOfNodes + 1).toString();
              wrapperDiv.appendChild(tempNode);
          }
      }

                styleBlock = ['\u00AD','<style id="s', detectionPrefix, '">', cssRuleString, '</style>'].join('');
      wrapperDiv.id = detectionPrefix;
          (docBody ? wrapperDiv : tempBody).innerHTML += styleBlock;
      tempBody.appendChild(wrapperDiv);
      if ( !docBody ) {
                tempBody.style.background = 'none';
                tempBody.style.overflow = 'hidden';
          originalDocOverflow = htmlRoot.style.overflow;
          htmlRoot.style.overflow = 'hidden';
          htmlRoot.appendChild(tempBody);
      }

      result = successCallback(wrapperDiv, cssRuleString);
        if ( !docBody ) {
          tempBody.parentNode.removeChild(tempBody);
          htmlRoot.style.overflow = originalDocOverflow;
      } else {
          wrapperDiv.parentNode.removeChild(wrapperDiv);
      }

      return !!result;

    };


    const checkDomEvent = (function() {

      const eventElementMap = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'image', 'load': 'image', 'abort': 'image'
      };

      function testEventAvailability( eventIdentifier, targetElement ) {

        targetElement = targetElement || currentDocument.createElement(eventElementMap[eventIdentifier] || 'div');
        eventIdentifier = 'on' + eventIdentifier;

            let isEventPresent = eventIdentifier in targetElement;

        if ( !isEventPresent ) {
                if ( !targetElement.setAttribute ) {
            targetElement = currentDocument.createElement('div');
          }
          if ( targetElement.setAttribute && targetElement.removeAttribute ) {
            targetElement.setAttribute(eventIdentifier, '');
            isEventPresent = checkType(targetElement[eventIdentifier], 'function');

                    if ( !checkType(targetElement[eventIdentifier], 'undefined') ) {
              targetElement[eventIdentifier] = undefined;
            }
            targetElement.removeAttribute(eventIdentifier);
          }
        }

        targetElement = null;
        return isEventPresent;
      }
      return testEventAvailability;
    })();


    const objectHasOwnProperty = Object.prototype.hasOwnProperty;
    let checkObjectProperty;

    if ( !checkType(objectHasOwnProperty, 'undefined') && !checkType(objectHasOwnProperty.call, 'undefined') ) {
      checkObjectProperty = function (itemObject, propertyName) {
        return objectHasOwnProperty.call(itemObject, propertyName);
      };
    }
    else {
      checkObjectProperty = function (itemObject, propertyName) {
        return ((propertyName in itemObject) && checkType(itemObject.constructor.prototype[propertyName], 'undefined'));
      };
    }


    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(contextObject) {

        const originalFunction = this;

        if (typeof originalFunction !== "function") {
            throw new TypeError("Function.prototype.bind - calling object must be a function");
        }

        const initialArguments = arraySliceMethod.call(arguments, 1);
        const boundFunction = function () {

            if (this instanceof boundFunction) {

              const TempConstructor = function(){};
              TempConstructor.prototype = originalFunction.prototype;
              const instance = new TempConstructor();

              const applyResult = originalFunction.apply(
                  instance,
                  initialArguments.concat(arraySliceMethod.call(arguments))
              );
              if (Object(applyResult) === applyResult) {
                  return applyResult;
              }
              return instance;

            } else {

              return originalFunction.apply(
                  contextObject,
                  initialArguments.concat(arraySliceMethod.call(arguments))
              );

            }

        };

        return boundFunction;
      };
    }

    function applySingleCss( styleString ) {
        testElementStyle.cssText = styleString;
    }

    function applyPrefixedCss( primaryRule, secondaryRule ) {
        return applySingleCss(cssVendorPrefixes.join(primaryRule + ';') + ( secondaryRule || '' ));
    }

    function checkType( item, expectedType ) {
        return typeof item === expectedType;
    }

    function stringIncludes( mainString, subString ) {
        return (mainString + '').indexOf(subString) !== -1;
    }

    function checkCssProperties( propertyNames, returnPfx ) {
        for ( var i in propertyNames ) {
            const currentProp = propertyNames[i];
            if ( !stringIncludes(currentProp, "-") && testElementStyle[currentProp] !== undefinedValue ) {
                return returnPfx === 'pfx' ? currentProp : true;
            }
        }
        return false;
    }

    function checkDomProperties( propertyList, targetObject, elementContext ) {
        for ( var i in propertyList ) {
            const currentItem = targetObject[propertyList[i]];
            if ( currentItem !== undefinedValue) {

                            if (elementContext === false) return propertyList[i];

                            if (checkType(currentItem, 'function')){
                                return currentItem.bind(elementContext || targetObject);
                }

                            return currentItem;
            }
        }
        return false;
    }

    function testAllPossibleProperties( baseProperty, prefixOption, elementForContext ) {

        const camelProp  = baseProperty.charAt(0).toUpperCase() + baseProperty.substring(1);
        let propertyArray   = (baseProperty + ' ' + cssObjectModelPrefixes.join(camelProp + ' ') + camelProp).split(' ');

            if(checkType(prefixOption, "string") || checkType(prefixOption, "undefined")) {
          return checkCssProperties(propertyArray, prefixOption);

            } else {
          propertyArray = (baseProperty + ' ' + (domPropertyPrefixes).join(camelProp + ' ') + camelProp).split(' ');
          return checkDomProperties(propertyArray, prefixOption, elementForContext);
        }
    }
    capabilityChecks['flexbox'] = function() {
      return testAllPossibleProperties('flexWrap');
    };
    capabilityChecks['canvas'] = function() {
        const canvasElement = currentDocument.createElement('canvas');
        return !!(canvasElement.getContext && canvasElement.getContext('2d'));
    };

    capabilityChecks['canvastext'] = function() {
        return !!(FeatureDetect['canvas'] && checkType(currentDocument.createElement('canvas').getContext('2d').fillText, 'function'));
    };


    capabilityChecks['webgl'] = function() {
        return !!currentWindow.WebGLRenderingContext;
    };


    capabilityChecks['touch'] = function() {
        let touchSupport;

        if(('ontouchstart' in currentWindow) || (currentWindow.DocumentTouch && currentDocument instanceof currentWindow.DocumentTouch)) {
          touchSupport = true;
        } else {
          injectTestStyles(['@media (',cssVendorPrefixes.join('touch-enabled),('),detectionPrefix,')','{#feature-check{top:9px;position:absolute}}'].join(''), function( testNode ) {
            touchSupport = testNode.offsetTop === 9;
          });
        }

        return touchSupport;
    };


    capabilityChecks['geolocation'] = function() {
        return 'geolocation' in currentWindow.navigator;
    };


    capabilityChecks['postmessage'] = function() {
      return !!currentWindow.postMessage;
    };


    capabilityChecks['websqldatabase'] = function() {
      return !!currentWindow.openDatabase;
    };

    capabilityChecks['indexeddb'] = function() {
      return !!testAllPossibleProperties("indexedDB", currentWindow);
    };

    capabilityChecks['hashchange'] = function() {
      return checkDomEvent('hashchange', currentWindow) && (currentDocument.documentMode === undefined || currentDocument.documentMode > 7);
    };

    capabilityChecks['history'] = function() {
      return !!(currentWindow.history && currentWindow.history.pushState);
    };

    capabilityChecks['draganddrop'] = function() {
        const tempDiv = currentDocument.createElement('div');
        return ('draggable' in tempDiv) || ('ondragstart' in tempDiv && 'ondrop' in tempDiv);
    };

    capabilityChecks['websockets'] = function() {
        return 'WebSocket' in currentWindow || 'MozWebSocket' in currentWindow;
    };


    capabilityChecks['rgba'] = function() {
        applySingleCss('background-color:rgba(150,255,150,.5)');

        return stringIncludes(testElementStyle.backgroundColor, 'rgba');
    };

    capabilityChecks['hsla'] = function() {
            applySingleCss('background-color:hsla(120,40%,100%,.5)');

        return stringIncludes(testElementStyle.backgroundColor, 'rgba') || stringIncludes(testElementStyle.backgroundColor, 'hsla');
    };

    capabilityChecks['multiplebgs'] = function() {
                applySingleCss('background:url(https://),url(https://),red url(https://)');

            return (new RegExp('(url\\s*\\(.*?){3}')).test(testElementStyle.background);
    };
    capabilityChecks['backgroundsize'] = function() {
        return testAllPossibleProperties('backgroundSize');
    };

    capabilityChecks['borderimage'] = function() {
        return testAllPossibleProperties('borderImage');
    };


    capabilityChecks['borderradius'] = function() {
        return testAllPossibleProperties('borderRadius');
    };

    capabilityChecks['boxshadow'] = function() {
        return testAllPossibleProperties('boxShadow');
    };

    capabilityChecks['textshadow'] = function() {
        return currentDocument.createElement('div').style.textShadow === '';
    };


    capabilityChecks['opacity'] = function() {
                applyPrefixedCss('opacity:.55');

                    return (new RegExp('^0.55$')).test(testElementStyle.opacity);
    };


    capabilityChecks['cssanimations'] = function() {
        return testAllPossibleProperties('animationName');
    };


    capabilityChecks['csscolumns'] = function() {
        return testAllPossibleProperties('columnCount');
    };


    capabilityChecks['cssgradients'] = function() {
        const rulePart1 = 'background-image:';
        const rulePart2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));';
        const rulePart3 = 'linear-gradient(left top,#9f9, white);';

        applySingleCss(
                       (rulePart1 + '-webkit- '.split(' ').join(rulePart2 + rulePart1) +
                       cssVendorPrefixes.join(rulePart3 + rulePart1)).slice(0, -rulePart1.length)
        );

        return stringIncludes(testElementStyle.backgroundImage, 'gradient');
    };


    capabilityChecks['cssreflections'] = function() {
        return testAllPossibleProperties('boxReflect');
    };


    capabilityChecks['csstransforms'] = function() {
        return !!testAllPossibleProperties('transform');
    };


    capabilityChecks['csstransforms3d'] = function() {

        let has3dTransform = !!testAllPossibleProperties('perspective');

                        if ( has3dTransform && 'webkitPerspective' in htmlRoot.style ) {

                      injectTestStyles('@media (transform-3d),(-webkit-transform-3d){#feature-check{left:9px;position:absolute;height:3px;}}', function( testNode, mediaRule ) {
            has3dTransform = testNode.offsetLeft === 9 && testNode.offsetHeight === 3;
          });
        }
        return has3dTransform;
    };


    capabilityChecks['csstransitions'] = function() {
        return testAllPossibleProperties('transition');
    };


    capabilityChecks['fontface'] = function() {
        let fontFaceSupported;

        injectTestStyles('@font-face {font-family:"customFont";src:url("https://")}', function( testNode, cssRule ) {
          const styleTag = currentDocument.getElementById('s' + detectionPrefix);
          const styleSheet = styleTag.sheet || styleTag.styleSheet;
          const sheetContent = styleSheet ? (styleSheet.cssRules && styleSheet.cssRules[0] ? styleSheet.cssRules[0].cssText : styleSheet.cssText || '') : '';

          fontFaceSupported = /src/i.test(sheetContent) && sheetContent.indexOf(cssRule.split(' ')[0]) === 0;
        });

        return fontFaceSupported;
    };

    capabilityChecks['generatedcontent'] = function() {
        let contentGenerated;

        injectTestStyles(['#',detectionPrefix,'{font:0/0 a}#',detectionPrefix,':after{content:"',smileyIndicator,'";visibility:hidden;font:3px/1 a}'].join(''), function( testNode ) {
          contentGenerated = testNode.offsetHeight >= 3;
        });

        return contentGenerated;
    };
    capabilityChecks['video'] = function() {
        const videoPlayer = currentDocument.createElement('video');
        let videoSupport = false;

            try {
            if ( videoSupport = !!videoPlayer.canPlayType ) {
                videoSupport      = new Boolean(videoSupport);
                videoSupport.ogg  = videoPlayer.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                            videoSupport.h264 = videoPlayer.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                videoSupport.webm = videoPlayer.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(err) { }

        return videoSupport;
    };

    capabilityChecks['audio'] = function() {
        const audioPlayer = currentDocument.createElement('audio');
        let audioSupport = false;

        try {
            if ( audioSupport = !!audioPlayer.canPlayType ) {
                audioSupport      = new Boolean(audioSupport);
                audioSupport.ogg  = audioPlayer.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                audioSupport.mp3  = audioPlayer.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                                                    audioSupport.wav  = audioPlayer.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                audioSupport.m4a  = ( audioPlayer.canPlayType('audio/x-m4a;')            ||
                              audioPlayer.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(err) { }

        return audioSupport;
    };


    capabilityChecks['localstorage'] = function() {
        try {
            currentWindow.localStorage.setItem(detectionPrefix, detectionPrefix);
            currentWindow.localStorage.removeItem(detectionPrefix);
            return true;
        } catch(err) {
            return false;
        }
    };

    capabilityChecks['sessionstorage'] = function() {
        try {
            currentWindow.sessionStorage.setItem(detectionPrefix, detectionPrefix);
            currentWindow.sessionStorage.removeItem(detectionPrefix);
            return true;
        } catch(err) {
            return false;
        }
    };


    capabilityChecks['webworkers'] = function() {
        return !!currentWindow.Worker;
    };


    capabilityChecks['applicationcache'] = function() {
        return !!currentWindow.applicationCache;
    };

    return FeatureDetect;

})( currentWindow, currentDocument, undefined );