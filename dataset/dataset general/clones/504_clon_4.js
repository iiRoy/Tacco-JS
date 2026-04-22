window.BrowserCapabilities = (function( currentWindow, currentDocument, absenceIndicator ) {

    const systemVersion = '1.0.0';
    let capabilityResults = {};
    const enableDomClasses = true;

    const rootElement = currentDocument.documentElement;
    const baseClassToken = 'capability-probe';
    const probeElement = currentDocument.createElement(baseClassToken);
    const probeStyleContext = probeElement.style;

    const inputElementProbe = currentDocument.createElement('input');
    const successEmoji = '👍';

    const objectTypeExaminer = {}.toString;

    const stylePrefixes = [ '-webkit-', '-moz-', '-o-', '-ms-' ];
    const vendorPrefixesRaw = 'Webkit Moz O ms';
    const vendorPrefixesCSSOM = vendorPrefixesRaw.split(' ');
    const vendorPrefixesDOM = vendorPrefixesRaw.toLowerCase().split(' ');

    const svgNamespace = {'svg': 'http://www.w3.org/2000/svg'};

    let collectedTests = {};
    let formInputChecks = {};
    let elementAttributes = {};

    let appliedClasses = [];
    const arraySegmenter = Array.prototype.slice;

    let currentFeatureIdentifier;

    const dynamicStyleApplier = function( styleBlock, evaluationCallback, nodeQuantity, nodeIDList ) {

        let currentStyleDecl, finalOutcome, tempNode, initialDocOverflow,
            wrapperDiv = currentDocument.createElement('div'),
            docBody = currentDocument.body,
            simulatedBody = docBody || currentDocument.createElement('body');

        if ( parseInt(nodeQuantity, 10) ) {
            Array.from({ length: nodeQuantity }).forEach((_, index) => {
                tempNode = currentDocument.createElement('div');
                tempNode.id = nodeIDList ? nodeIDList[index] : baseClassToken + (index + 1);
                wrapperDiv.appendChild(tempNode);
            });
        }

        currentStyleDecl = ['&#173;','<style id="s', baseClassToken, '">', styleBlock, '</style>'].join('');
        wrapperDiv.id = baseClassToken;
        (docBody ? wrapperDiv : simulatedBody).insertAdjacentHTML('beforeend', currentStyleDecl);
        simulatedBody.appendChild(wrapperDiv);

        if ( !docBody ) {
            simulatedBody.style.background = '';
            simulatedBody.style.overflow = 'hidden';
            initialDocOverflow = rootElement.style.overflow;
            rootElement.style.overflow = 'hidden';
            rootElement.appendChild(simulatedBody);
        }

        finalOutcome = evaluationCallback(wrapperDiv, styleBlock);

        if ( !docBody ) {
            simulatedBody.parentNode.removeChild(simulatedBody);
            rootElement.style.overflow = initialDocOverflow;
        } else {
            wrapperDiv.parentNode.removeChild(wrapperDiv);
        }

        return !!finalOutcome;
    };

    const eventReadinessChecker = (function() {

      const eventElementMap = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function probeEvent( eventIdentifier, targetElement ) {

        targetElement = targetElement || currentDocument.createElement(eventElementMap[eventIdentifier] || 'div');
        eventIdentifier = 'on' + eventIdentifier;

        let supportStatus = Reflect.has(targetElement, eventIdentifier);

        if ( !supportStatus ) {
            if ( !targetElement.setAttribute ) {
                targetElement = currentDocument.createElement('div');
            }
            if ( targetElement.setAttribute && targetElement.removeAttribute ) {
                targetElement.setAttribute(eventIdentifier, '');
                supportStatus = (typeof targetElement[eventIdentifier] === 'function');

                if ( typeof targetElement[eventIdentifier] !== 'undefined' ) {
                    targetElement[eventIdentifier] = absenceIndicator;
                }
                targetElement.removeAttribute(eventIdentifier);
            }
        }

        targetElement = null;
        return supportStatus;
      }
      return probeEvent;
    })();

    const objectPropertyExistenceCheck = (function() {
        const standardChecker = ({}).hasOwnProperty;
        return (typeof standardChecker !== 'undefined' && typeof standardChecker.call !== 'undefined')
            ? (obj, prop) => standardChecker.call(obj, prop)
            : (obj, prop) => (prop in obj && typeof obj.constructor.prototype[prop] === 'undefined');
    })();

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bindingFunction(contextObject) {
        const originalFunction = this;
        if (typeof originalFunction !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        const initialArguments = arraySegmenter.call(arguments, 1);
        const boundInvoker = function() {
            if (this instanceof boundInvoker) {
              const TempConstructor = function(){};
              TempConstructor.prototype = originalFunction.prototype;
              const instance = new TempConstructor();
              const result = originalFunction.apply(
                  instance,
                  initialArguments.concat(arraySegmenter.call(arguments))
              );
              return Object(result) === result ? result : instance;
            } else {
              return originalFunction.apply(
                  contextObject,
                  initialArguments.concat(arraySegmenter.call(arguments))
              );
            }
        };
        return boundInvoker;
      };
    }

    function applyStyleString( declaration ) {
        probeStyleContext.cssText = declaration;
    }

    function applyPrefixedStyles( primaryDecl, secondaryDecl ) {
        return applyStyleString(stylePrefixes.map(prefix => prefix + primaryDecl).join('') + ( secondaryDecl || '' ));
    }

    function checkType( item, kind ) {
        return typeof item === kind;
    }

    function stringIncludes( haystack, needle ) {
        return String(haystack).includes(needle);
    }

    function checkStyleProperties( propertyArray, prefixType ) {
        return propertyArray.some(prop => {
            if ( !stringIncludes(prop, "-") && probeStyleContext[prop] !== absenceIndicator ) {
                return prefixType === 'pfx' ? prop : true;
            }
            return false;
        });
    }

    function checkObjectProperties( propertyArray, targetObject, elementContext ) {
        const found = propertyArray.find(prop => {
            const itemValue = targetObject[prop];
            if ( itemValue !== absenceIndicator) {
                return true;
            }
            return false;
        });
        if (found !== absenceIndicator) {
            const itemValue = targetObject[found];
            if (elementContext === false) return found;
            if (checkType(itemValue, 'function')){
                return itemValue.bind(elementContext || targetObject);
            }
            return itemValue;
        }
        return false;
    }

    function unifiedPropertyCheck( baseProperty, prefixSpecifier, contextElement ) {

        const capitalizedProp = baseProperty.charAt(0).toUpperCase() + baseProperty.slice(1);
        let propertyList;

        if(checkType(prefixSpecifier, "string") || checkType(prefixSpecifier, "undefined")) {
            propertyList = (baseProperty + ' ' + vendorPrefixesCSSOM.map(p => p + capitalizedProp).join(' ') + ' ' + capitalizedProp).split(' ');
            return checkStyleProperties(propertyList, prefixSpecifier);
        } else {
            propertyList = (baseProperty + ' ' + vendorPrefixesDOM.map(p => p + capitalizedProp).join(' ') + ' ' + capitalizedProp).split(' ');
            return checkObjectProperties(propertyList, prefixSpecifier, contextElement);
        }
    }

    const featureDetectionModules = [
        {
            id: 'flexbox',
            detector: () => unifiedPropertyCheck('flexWrap')
        },
        {
            id: 'canvas',
            detector: () => {
                const drawingElement = currentDocument.createElement('canvas');
                return !!(drawingElement.getContext && drawingElement.getContext('2d'));
            }
        },
        {
            id: 'canvastext',
            detector: () => {
                return !!(capabilityResults['canvas'] && checkType(currentDocument.createElement('canvas').getContext('2d').fillText, 'function'));
            }
        },
        {
            id: 'webgl',
            detector: () => !!currentWindow.WebGLRenderingContext
        },
        {
            id: 'touch',
            detector: () => {
                let status;
                if(('ontouchstart' in currentWindow) || (currentWindow.DocumentTouch && currentDocument instanceof currentWindow.DocumentTouch)) {
                    status = true;
                } else {
                    dynamicStyleApplier(['@media (',stylePrefixes.map(p => p + 'touch-enabled),(').join(''),baseClassToken,')','{#',baseClassToken,'{top:9px;position:absolute}}'].join(''), function( elementNode ) {
                        status = elementNode.offsetTop === 9;
                    });
                }
                return status;
            }
        },
        {
            id: 'geolocation',
            detector: () => 'geolocation' in navigator
        },
        {
            id: 'postmessage',
            detector: () => !!currentWindow.postMessage
        },
        {
            id: 'websqldatabase',
            detector: () => !!currentWindow.openDatabase
        },
        {
            id: 'indexedDB',
            detector: () => !!unifiedPropertyCheck("indexedDB", currentWindow)
        },
        {
            id: 'hashchange',
            detector: () => eventReadinessChecker('hashchange', currentWindow) && (currentDocument.documentMode === absenceIndicator || currentDocument.documentMode > 7)
        },
        {
            id: 'history',
            detector: () => !!(currentWindow.history && currentWindow.history.pushState)
        },
        {
            id: 'draganddrop',
            detector: () => {
                const testDiv = currentDocument.createElement('div');
                return (Reflect.has(testDiv, 'draggable')) || (Reflect.has(testDiv, 'ondragstart') && Reflect.has(testDiv, 'ondrop'));
            }
        },
        {
            id: 'websockets',
            detector: () => 'WebSocket' in currentWindow || 'MozWebSocket' in currentWindow
        },
        {
            id: 'rgba',
            detector: () => {
                applyStyleString('background-color:rgba(150,255,150,.5)');
                return stringIncludes(probeStyleContext.backgroundColor, 'rgba');
            }
        },
        {
            id: 'hsla',
            detector: () => {
                applyStyleString('background-color:hsla(120,40%,100%,.5)');
                return stringIncludes(probeStyleContext.backgroundColor, 'rgba') || stringIncludes(probeStyleContext.backgroundColor, 'hsla');
            }
        },
        {
            id: 'multiplebgs',
            detector: () => {
                applyStyleString('background:url(https://),url(https://),red url(https://)');
                return (/(url\s*\(.*?){3}/).test(probeStyleContext.background);
            }
        },
        {
            id: 'backgroundsize',
            detector: () => unifiedPropertyCheck('backgroundSize')
        },
        {
            id: 'borderimage',
            detector: () => unifiedPropertyCheck('borderImage')
        },
        {
            id: 'borderradius',
            detector: () => unifiedPropertyCheck('borderRadius')
        },
        {
            id: 'boxshadow',
            detector: () => unifiedPropertyCheck('boxShadow')
        },
        {
            id: 'textshadow',
            detector: () => currentDocument.createElement('div').style.textShadow === ''
        },
        {
            id: 'opacity',
            detector: () => {
                applyPrefixedStyles('opacity:.55');
                return (/^0.55$/).test(probeStyleContext.opacity);
            }
        },
        {
            id: 'cssanimations',
            detector: () => unifiedPropertyCheck('animationName')
        },
        {
            id: 'csscolumns',
            detector: () => unifiedPropertyCheck('columnCount')
        },
        {
            id: 'cssgradients',
            detector: () => {
                const decl1 = 'background-image:',
                    decl2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
                    decl3 = 'linear-gradient(left top,#9f9, white);';

                applyStyleString(
                    (decl1 + stylePrefixes.map(p => p + decl2 + decl1).join('') +
                    stylePrefixes.map(p => p + decl3 + decl1).join('')).slice(0, -decl1.length)
                );
                return stringIncludes(probeStyleContext.backgroundImage, 'gradient');
            }
        },
        {
            id: 'cssreflections',
            detector: () => unifiedPropertyCheck('boxReflect')
        },
        {
            id: 'csstransforms',
            detector: () => !!unifiedPropertyCheck('transform')
        },
        {
            id: 'csstransforms3d',
            detector: () => {
                let result = !!unifiedPropertyCheck('perspective');
                if ( result && 'webkitPerspective' in rootElement.style ) {
                    dynamicStyleApplier('@media (transform-3d),(-webkit-transform-3d){#'+baseClassToken+'{left:9px;position:absolute;height:3px;}}', function( elementNode ) {
                        result = elementNode.offsetLeft === 9 && elementNode.offsetHeight === 3;
                    });
                }
                return result;
            }
        },
        {
            id: 'csstransitions',
            detector: () => unifiedPropertyCheck('transition')
        },
        {
            id: 'fontface',
            detector: () => {
                let status;
                dynamicStyleApplier('@font-face {font-family:"font";src:url("https://")}', function( elementNode, ruleText ) {
                    const styleSheetElement = currentDocument.getElementById('s'+baseClassToken);
                    const sheetRef = styleSheetElement ? (styleSheetElement.sheet || styleSheetElement.styleSheet) : null;
                    const cssContent = sheetRef ? (sheetRef.cssRules && sheetRef.cssRules[0] ? sheetRef.cssRules[0].cssText : sheetRef.cssText || '') : '';
                    status = /src/i.test(cssContent) && cssContent.indexOf(ruleText.split(' ')[0]) === 0;
                });
                return status;
            }
        },
        {
            id: 'generatedcontent',
            detector: () => {
                let status;
                dynamicStyleApplier(['#',baseClassToken,'{font:0/0 a}#',baseClassToken,':after{content:"',successEmoji,'";visibility:hidden;font:3px/1 a}'].join(''), function( elementNode ) {
                    status = elementNode.offsetHeight >= 3;
                });
                return status;
            }
        },
        {
            id: 'video',
            detector: () => {
                const mediaElement = currentDocument.createElement('video');
                let status = false;
                try {
                    if ( status = !!mediaElement.canPlayType ) {
                        status      = new Boolean(status);
                        status.ogg  = mediaElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,'');
                        status.h264 = mediaElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,'');
                        status.webm = mediaElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
                    }
                } catch(e) { /* swallow error */ }
                return status;
            }
        },
        {
            id: 'audio',
            detector: () => {
                const mediaElement = currentDocument.createElement('audio');
                let status = false;
                try {
                    if ( status = !!mediaElement.canPlayType ) {
                        status      = new Boolean(status);
                        status.ogg  = mediaElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                        status.mp3  = mediaElement.canPlayType('audio/mpeg;').replace(/^no$/,'');
                        status.wav  = mediaElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/,'');
                        status.m4a  = ( mediaElement.canPlayType('audio/x-m4a;') || mediaElement.canPlayType('audio/aac;')).replace(/^no$/,'');
                    }
                } catch(e) { /* swallow error */ }
                return status;
            }
        },
        {
            id: 'localstorage',
            detector: () => {
                try {
                    currentWindow.localStorage.setItem(baseClassToken, baseClassToken);
                    currentWindow.localStorage.removeItem(baseClassToken);
                    return true;
                } catch(e) {
                    return false;
                }
            }
        },
        {
            id: 'sessionstorage',
            detector: () => {
                try {
                    currentWindow.sessionStorage.setItem(baseClassToken, baseClassToken);
                    currentWindow.sessionStorage.removeItem(baseClassToken);
                    return true;
                } catch(e) {
                    return false;
                }
            }
        },
        {
            id: 'webworkers',
            detector: () => !!currentWindow.Worker
        },
        {
            id: 'applicationcache',
            detector: () => !!currentWindow.applicationCache
        }
    ];

    featureDetectionModules.forEach(module => {
        currentFeatureIdentifier = module.id;
        const detectionResult = module.detector();
        capabilityResults[module.id] = detectionResult;

        if (enableDomClasses) {
            const className = baseClassToken + (detectionResult ? '' : 'no-') + module.id;
            appliedClasses.push(className);
        }
    });

    if (enableDomClasses) {
        rootElement.className += ' ' + appliedClasses.join(' ');
    }

    capabilityResults.version = systemVersion;
    capabilityResults.addTest = function(nameOrObject, func) {
        if (typeof nameOrObject === 'object') {
            for (let prop in nameOrObject) {
                if (objectPropertyExistenceCheck(nameOrObject, prop)) {
                    this.addTest(prop, nameOrObject[prop]);
                }
            }
        } else {
            const testName = nameOrObject.toLowerCase();
            const result = func();
            collectedTests[testName] = result;
            if (enableDomClasses) {
                rootElement.classList.add(baseClassToken + (result ? '' : 'no-') + testName);
            }
            this[testName] = result;
        }
        return this;
    };

    capabilityResults.prefixed = function(property, obj, element) {
        if (!obj) {
            return unifiedPropertyCheck(property, 'pfx');
        } else {
            return unifiedPropertyCheck(property, obj, element);
        }
    };
    capabilityResults.testAllProps = unifiedPropertyCheck;
    capabilityResults.testProp = function(prop) {
        return checkStyleProperties([prop]);
    };
    capabilityResults.testStyles = dynamicStyleApplier;
    capabilityResults.hasEvent = eventReadinessChecker;
    capabilityResults.prefixes = stylePrefixes;
    capabilityResults.domPrefixes = vendorPrefixesDOM;
    capabilityResults.cssomPrefixes = vendorPrefixesCSSOM;

    return capabilityResults;

})(window, document);