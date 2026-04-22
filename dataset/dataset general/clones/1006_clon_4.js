window.BrowserFeatures = (function( currentWindow, currentDocument, undefined ) {

    const versionIdentifier = '1.0.0';
    const featureCollector = {};
    const applyFeatureClasses = true;
    const rootElement = currentDocument.documentElement;
    const testElementTag = 'probe';
    const tempTestElement = currentDocument.createElement(testElementTag);
    const tempTestElementStyle = tempTestElement.style;
    const testInputValue = currentDocument.createElement('input');
    const positiveIndicator = ':)';
    const objectStringifier = {}.toString;

    const stylePrefixes = ['-webkit-', '-moz-', '-o-', '-ms-', ''];
    const domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
    const jsDomPrefixes = domPrefixes.map(p => p.toLowerCase());

    const namespaceMap = { 'svg': 'http://www.w3.org/2000/svg' };

    const capabilityTests = {};
    const inputAttributes = {};
    const detectedClasses = [];
    const arraySlice = Array.prototype.slice;

    function typeCheck( subject, expectedType ) {
        return typeof subject === expectedType;
    }

    function stringHasSubstring( mainString, subString ) {
        return ('' + mainString).includes(subString);
    }

    function applySingleStyle( cssText ) {
        tempTestElementStyle.cssText = cssText;
    }

    function applyPrefixedStyles( baseStyle, additionalStyle ) {
        return applySingleStyle(stylePrefixes.map(p => p + baseStyle + ';').join('') + ( additionalStyle || '' ));
    }

    function inspectProperty( propertiesList, returnPfx ) {
        for ( const propName of propertiesList ) {
            if ( !stringHasSubstring(propName, "-") && tempTestElementStyle[propName] !== undefined ) {
                return returnPfx === 'pfx' ? propName : true;
            }
        }
        return false;
    }

    function inspectDOMProperty( propertiesList, targetObject, optionalContext ) {
        for ( const propName of propertiesList ) {
            const item = targetObject[propName];
            if ( item !== undefined ) {
                if ( optionalContext === false ) return propName;
                if ( typeCheck(item, 'function') ) {
                    return item.bind(optionalContext || targetObject);
                }
                return item;
            }
        }
        return false;
    }

    function evaluateFeatureProperty( baseProp, prefixType, elementContext ) {
        const capitalizedProp = baseProp.charAt(0).toUpperCase() + baseProp.slice(1);
        let propVariations;

        if ( typeCheck(prefixType, "string") || typeCheck(prefixType, "undefined") ) {
            propVariations = [baseProp, ...domPrefixes.map(p => p + capitalizedProp)].join(' ').split(' ');
            return inspectProperty(propVariations, prefixType);
        } else {
            propVariations = [baseProp, ...jsDomPrefixes.map(p => p + capitalizedProp)].join(' ').split(' ');
            return inspectDOMProperty(propVariations, prefixType, elementContext);
        }
    }

    function performStyleTest( styleRule, testCallback, nodeCount, testNames ) {
        let styleTag, testResult, tempNode, docScrollState;
        const testContainer = currentDocument.createElement('div');
        const currentBody = currentDocument.body;
        const syntheticBody = currentBody || currentDocument.createElement('body');

        if ( parseInt(nodeCount, 10) ) {
            for (let i = 0; i < nodeCount; i++) {
                tempNode = currentDocument.createElement('div');
                tempNode.id = testNames ? testNames[i] : testElementTag + (i + 1);
                testContainer.appendChild(tempNode);
            }
        }

        styleTag = ['&#173;', '<style id="s', testElementTag, '">', styleRule, '</style>'].join('');
        testContainer.id = testElementTag;
        (currentBody ? testContainer : syntheticBody).innerHTML += styleTag;
        syntheticBody.appendChild(testContainer);

        if ( !currentBody ) {
            syntheticBody.style.background = '';
            syntheticBody.style.overflow = 'hidden';
            docScrollState = rootElement.style.overflow;
            rootElement.style.overflow = 'hidden';
            rootElement.appendChild(syntheticBody);
        }

        testResult = testCallback(testContainer, styleRule);

        if ( !currentBody ) {
            syntheticBody.parentNode.removeChild(syntheticBody);
            rootElement.style.overflow = docScrollState;
        } else {
            testContainer.parentNode.removeChild(testContainer);
        }

        return !!testResult;
    }

    const checkEventAvailability = (function() {
        const elementMappings = {
            'select': 'input', 'change': 'input',
            'submit': 'form', 'reset': 'form',
            'error': 'img', 'load': 'img', 'abort': 'img'
        };

        function checker( eventName, targetElement ) {
            targetElement = targetElement || currentDocument.createElement(elementMappings[eventName] || 'div');
            eventName = 'on' + eventName;

            let isSupported = eventName in targetElement;

            if ( !isSupported ) {
                if ( !targetElement.setAttribute ) {
                    targetElement = currentDocument.createElement('div');
                }
                if ( targetElement.setAttribute && targetElement.removeAttribute ) {
                    targetElement.setAttribute(eventName, '');
                    isSupported = typeCheck(targetElement[eventName], 'function');

                    if ( !typeCheck(targetElement[eventName], 'undefined') ) {
                        targetElement[eventName] = undefined;
                    }
                    targetElement.removeAttribute(eventName);
                }
            }

            targetElement = null;
            return isSupported;
        }
        return checker;
    })();

    const objectOwnsProperty = (function() {
        const standardHasProp = ({}).hasOwnProperty;
        if ( !typeCheck(standardHasProp, 'undefined') && !typeCheck(standardHasProp.call, 'undefined') ) {
            return function ( targetObj, propKey ) {
                return standardHasProp.call(targetObj, propKey);
            };
        } else {
            return function ( targetObj, propKey ) {
                return ((propKey in targetObj) && typeCheck(targetObj.constructor.prototype[propKey], 'undefined'));
            };
        }
    })();

    const featureDetectors = new Map();

    featureDetectors.set('flexibleLayout', function() {
        return evaluateFeatureProperty('flexWrap');
    });

    featureDetectors.set('drawingCanvas', function() {
        const tempCanvas = currentDocument.createElement('canvas');
        return !!(tempCanvas.getContext && tempCanvas.getContext('2d'));
    });

    featureDetectors.set('canvasTextSupport', function() {
        return !!(featureCollector['drawingCanvas'] && typeCheck(currentDocument.createElement('canvas').getContext('2d').fillText, 'function'));
    });

    featureDetectors.set('threeDGraphics', function() {
        return !!currentWindow.WebGLRenderingContext;
    });

    featureDetectors.set('touchInteraction', function() {
        let capability = false;
        if(('ontouchstart' in currentWindow) || (currentWindow.DocumentTouch && currentDocument instanceof currentWindow.DocumentTouch)) {
          capability = true;
        } else {
          performStyleTest(['@media (',stylePrefixes.map(p => p + 'touch-enabled),(').join(''),testElementTag,')','{', `#${testElementTag}`, '{top:9px;position:absolute}}'].join(''), function( node ) {
            capability = node.offsetTop === 9;
          });
        }
        return capability;
    });

    featureDetectors.set('geoLocationAPI', function() {
        return 'geolocation' in currentWindow.navigator;
    });

    featureDetectors.set('crossWindowMessaging', function() {
      return !!currentWindow.postMessage;
    });

    featureDetectors.set('webSQLStorage', function() {
      return !!currentWindow.openDatabase;
    });

    featureDetectors.set('indexedDBStorage', function() {
      return !!evaluateFeatureProperty("indexedDB", currentWindow);
    });

    featureDetectors.set('urlHashChange', function() {
      return checkEventAvailability('hashchange', currentWindow) && (currentDocument.documentMode === undefined || currentDocument.documentMode > 7);
    });

    featureDetectors.set('historyAPI', function() {
      return !!(currentWindow.history && currentWindow.history.pushState);
    });

    featureDetectors.set('fileDragDrop', function() {
        const tempDiv = currentDocument.createElement('div');
        return ('draggable' in tempDiv) || ('ondragstart' in tempDiv && 'ondrop' in tempDiv);
    });

    featureDetectors.set('webSockets', function() {
        return 'WebSocket' in currentWindow || 'MozWebSocket' in currentWindow;
    });

    featureDetectors.set('rgbaColorSupport', function() {
        applySingleStyle('background-color:rgba(150,255,150,.5)');
        return stringHasSubstring(tempTestElementStyle.backgroundColor, 'rgba');
    });

    featureDetectors.set('hslaColorSupport', function() {
        applySingleStyle('background-color:hsla(120,40%,100%,.5)');
        return stringHasSubstring(tempTestElementStyle.backgroundColor, 'rgba') || stringHasSubstring(tempTestElementStyle.backgroundColor, 'hsla');
    });

    featureDetectors.set('multiBackgrounds', function() {
        applySingleStyle('background:url(https://),url(https://),red url(https://)');
        return (/(url\s*\(.*?){3}/).test(tempTestElementStyle.background);
    });

    featureDetectors.set('backgroundSizeProperty', function() {
        return evaluateFeatureProperty('backgroundSize');
    });

    featureDetectors.set('borderImageProperty', function() {
        return evaluateFeatureProperty('borderImage');
    });

    featureDetectors.set('borderRadiusProperty', function() {
        return evaluateFeatureProperty('borderRadius');
    });

    featureDetectors.set('boxShadowProperty', function() {
        return evaluateFeatureProperty('boxShadow');
    });

    featureDetectors.set('textShadowProperty', function() {
        return currentDocument.createElement('div').style.textShadow === '';
    });

    featureDetectors.set('opacityProperty', function() {
        applyPrefixedStyles('opacity:.55');
        return (/^0.55$/).test(tempTestElementStyle.opacity);
    });

    featureDetectors.set('cssAnimations', function() {
        return evaluateFeatureProperty('animationName');
    });

    featureDetectors.set('cssColumns', function() {
        return evaluateFeatureProperty('columnCount');
    });

    featureDetectors.set('cssGradients', function() {
        const gradientStyle1 = 'background-image:',
              gradientRule2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
              gradientRule3 = 'linear-gradient(left top,#9f9, white);';

        let constructedCssParts = [];
        constructedCssParts.push(gradientStyle1 + '-webkit-' + gradientRule2);

        for (const pfx of stylePrefixes) {
            constructedCssParts.push(gradientStyle1 + pfx + gradientRule3);
        }

        applySingleStyle(constructedCssParts.join('').slice(0, -gradientStyle1.length));

        return stringHasSubstring(tempTestElementStyle.backgroundImage, 'gradient');
    });

    featureDetectors.set('cssReflections', function() {
        return evaluateFeatureProperty('boxReflect');
    });

    featureDetectors.set('cssTransforms', function() {
        return !!evaluateFeatureProperty('transform');
    });

    featureDetectors.set('cssTransforms3D', function() {
        let result = !!evaluateFeatureProperty('perspective');
        if ( result && 'webkitPerspective' in rootElement.style ) {
          performStyleTest('@media (transform-3d),(-webkit-transform-3d){#probe{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            result = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return result;
    });

    featureDetectors.set('cssTransitions', function() {
        return evaluateFeatureProperty('transition');
    });

    featureDetectors.set('webFontLoading', function() {
        let support = false;
        performStyleTest('@font-face {font-family:"customFont";src:url("https://")}', function( node, rule ) {
          const styleSheetElement = currentDocument.getElementById('s' + testElementTag);
          const sheet = styleSheetElement.sheet || styleSheetElement.styleSheet;
          const cssContent = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';
          support = /src/i.test(cssContent) && cssContent.indexOf(rule.split(' ')[0]) === 0;
        });
        return support;
    });

    featureDetectors.set('generatedContent', function() {
        let support = false;
        performStyleTest(['#',testElementTag,'{font:0/0 a}#',testElementTag,':after{content:"',positiveIndicator,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          support = node.offsetHeight >= 3;
        });
        return support;
    });

    featureDetectors.set('videoPlayback', function() {
        const videoElem = currentDocument.createElement('video');
        let support = false;
        try {
            if ( support = !!videoElem.canPlayType ) {
                support = new Boolean(support);
                support.ogg = videoElem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');
                support.h264 = videoElem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');
                support.webm = videoElem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }
        } catch(e) { /* ignore */ }
        return support;
    });

    featureDetectors.set('audioPlayback', function() {
        const audioElem = currentDocument.createElement('audio');
        let support = false;
        try {
            if ( support = !!audioElem.canPlayType ) {
                support = new Boolean(support);
                support.ogg = audioElem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                support.mp3 = audioElem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');
                support.wav = audioElem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                support.m4a = ( audioElem.canPlayType('audio/x-m4a;')            ||
                                audioElem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { /* ignore */ }
        return support;
    });

    featureDetectors.set('localDataStorage', function() {
        try {
            currentWindow.localStorage.setItem(testElementTag, testElementTag);
            currentWindow.localStorage.removeItem(testElementTag);
            return true;
        } catch(e) {
            return false;
        }
    });

    featureDetectors.set('sessionDataStorage', function() {
        try {
            currentWindow.sessionStorage.setItem(testElementTag, testElementTag);
            currentWindow.sessionStorage.removeItem(testElementTag);
            return true;
        } catch(e) {
            return false;
        }
    });

    featureDetectors.set('webWorkersAPI', function() {
        return !!currentWindow.Worker;
    });

    featureDetectors.set('applicationCacheAPI', function() {
        return !!currentWindow.applicationCache;
    });

    for (const [featureName, detectorFunction] of featureDetectors.entries()) {
        const result = detectorFunction();
        featureCollector[featureName] = result;

        if (applyFeatureClasses) {
            const className = featureName.replace(/([A-Z])/g, '-$1').toLowerCase();
            rootElement.classList.add(result ? className : 'no-' + className);
        }
    }

    featureCollector.version = versionIdentifier;
    featureCollector.prefixed = function(prop, obj, elem) {
        return evaluateFeatureProperty(prop, obj, elem);
    };
    featureCollector.hasEvent = function(eventName, element) {
        return checkEventAvailability(eventName, element);
    };
    featureCollector.testStyles = function(rule, callback, nodes, testnames) {
        return performStyleTest(rule, callback, nodes, testnames);
    };
    featureCollector.mq = function(mq) {
        const style = currentWindow.matchMedia || currentWindow.msMatchMedia;
        if (style) {
            return style(mq).matches;
        }
        return false;
    };

    return featureCollector;

})( window, document );