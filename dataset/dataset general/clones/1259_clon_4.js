window.BrowserFeatures = (function(globalScope, docRef, undefValue) {

    const systemIdentifier = 'FeatureCheckEngine';
    let featureRegistry = {};

    const primaryHostElement = docRef.documentElement;
    const headSectionElement = docRef.head || docRef.getElementsByTagName('head')[0];

    const utilityTestElementId = 'utilityTestContainer';
    const utilityTestElement = docRef.createElement(utilityTestElementId);
    let utilityElementStyle = utilityTestElement.style;

    const inputTestElement = docRef.createElement('input');

    const typeStringifier = Object.prototype.toString;

    const cssVendorPrefixes = ['-webkit-', '-moz-', '-o-', '-ms-', '-khtml-', ''];

    const domPropertyPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml', ''];

    function valueIsType(val, expectedType) {
        return typeof val === expectedType;
    }

    function stringIncludesSubstring(mainStr, subStr) {
        return ('' + mainStr).includes(subStr);
    }

    function retrieveComputedStyle(element, propertyName) {
        return globalScope.getComputedStyle ? globalScope.getComputedStyle(element, null).getPropertyValue(propertyName) : element.currentStyle[propertyName];
    }

    function verifyMediaQuery(queryExpression) {
        if (globalScope.matchMedia) {
            return globalScope.matchMedia(queryExpression).matches;
        }

        const temporaryStyleNode = docRef.createElement('style');
        const temporaryDisplayNode = docRef.createElement('div');
        temporaryDisplayNode.id = 'tempQueryVerification';
        temporaryDisplayNode.style.cssText = 'position:absolute;visibility:hidden;';
        temporaryStyleNode.textContent = queryExpression + '{#tempQueryVerification{height:1px}}';

        headSectionElement.appendChild(temporaryStyleNode);
        docRef.body.appendChild(temporaryDisplayNode);

        const isMatch = (temporaryDisplayNode.offsetHeight === 1);

        docRef.body.removeChild(temporaryDisplayNode);
        headSectionElement.removeChild(temporaryStyleNode);

        return isMatch;
    }

    function checkEventSupport(eventName, elementTag = 'div') {
        let eventTester = docRef.createElement(elementTag);
        let isSupported = false;

        const eventProperty = `on${eventName}`;

        if (eventProperty in eventTester) {
            isSupported = true;
        } else {
            eventTester.setAttribute(eventProperty, 'return;');
            isSupported = valueIsType(eventTester[eventProperty], 'function');
            eventTester.removeAttribute(eventProperty);
        }

        eventTester = null;
        return isSupported;
    }

    function checkCssProperty(propertyName, initialValue = '', customCheck = null) {
        let supportDetected = false;
        const originalCssText = utilityElementStyle.cssText;

        for (let i = 0; i < cssVendorPrefixes.length; i++) {
            const currentPrefix = cssVendorPrefixes[i];
            const fullPropertyName = currentPrefix + propertyName;

            utilityElementStyle.cssText = '';
            utilityElementStyle.setProperty(fullPropertyName, initialValue);

            if (utilityElementStyle[fullPropertyName] !== undefValue) {
                if (!customCheck || customCheck(fullPropertyName, utilityTestElement)) {
                    supportDetected = true;
                    break;
                }
            }
        }
        utilityElementStyle.cssText = originalCssText;
        return supportDetected;
    }

    function checkDomProperty(propertyName, customCheck = null) {
        const capitalizedProp = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
        const propertyVariations = [propertyName].concat(
            domPropertyPrefixes.map(p => p + capitalizedProp).filter(p => p !== capitalizedProp)
        );

        for (let i = 0; i < propertyVariations.length; i++) {
            const currentProp = propertyVariations[i];
            if (utilityElementStyle[currentProp] !== undefValue) {
                if (!customCheck || customCheck(currentProp, utilityTestElement)) {
                    return true;
                }
            }
        }
        return false;
    }

    const detectionServices = {};

    detectionServices.testFlexLayout = function() {
        const primaryContainer = docRef.createElement('div');
        const childItem = docRef.createElement('div');

        cssVendorPrefixes.forEach(p => {
            primaryContainer.style.setProperty(p + 'display', 'flex');
        });
        childItem.style.setProperty('flex', '1');
        childItem.style.setProperty('width', '10px');

        primaryContainer.appendChild(childItem);
        primaryHostElement.appendChild(primaryContainer);

        primaryContainer.style.width = '42px';
        const finalChildWidth = childItem.offsetWidth;

        primaryHostElement.removeChild(primaryContainer);

        return finalChildWidth === 42;
    };

    detectionServices.testCanvasApi = function() {
        const drawingSurface = docRef.createElement('canvas');
        return !!(drawingSurface.getContext && drawingSurface.getContext('2d'));
    };

    detectionServices.testCanvasTextApi = function() {
        return !!(featureRegistry.canvasApi && valueIsType(docRef.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    detectionServices.testWebGLApi = function() {
        const drawingSurface = docRef.createElement('canvas');
        try {
            return !!(drawingSurface.getContext('webgl') || drawingSurface.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    };

    detectionServices.testTouchInteraction = function() {
        const directTouchSupport = ('ontouchstart' in globalScope);
        const mqTouchSupport = verifyMediaQuery(`(touch-enabled),(${cssVendorPrefixes.join('touch-enabled),(')}feature-check)`);
        return directTouchSupport || mqTouchSupport;
    };

    detectionServices.testGeoLocationApi = function() {
        return !!globalScope.navigator.geolocation;
    };

    detectionServices.testCrossWindowMessaging = function() {
        return !!globalScope.postMessage;
    };

    detectionServices.testWebDatabase = function() {
        return !!globalScope.openDatabase;
    };

    detectionServices.testIndexedDatabase = function() {
        return domPropertyPrefixes.some(p => {
            const underscoreKey = p.toLowerCase() + '_indexedDB';
            const camelCaseKey = p + 'IndexedDB';
            return globalScope[underscoreKey] !== undefValue || globalScope[camelCaseKey] !== undefValue;
        });
    };

    detectionServices.testHashChangeEvent = function() {
        return checkEventSupport('hashchange', 'window') && (docRef.documentMode === undefValue || docRef.documentMode > 7);
    };

    detectionServices.testHistoryManipulation = function() {
        return !!(globalScope.history && globalScope.history.pushState);
    };

    detectionServices.testDragAndDrop = function() {
        return checkEventSupport('dragstart') && checkEventSupport('drop');
    };

    detectionServices.testWebSocketsApi = function() {
        return ('WebSocket' in globalScope);
    };

    detectionServices.testRgbaColorSupport = function() {
        const temporaryElement = docRef.createElement('div');
        docRef.body.appendChild(temporaryElement);
        temporaryElement.style.backgroundColor = 'rgba(10,20,30,0.5)';
        const computedColor = retrieveComputedStyle(temporaryElement, 'background-color');
        docRef.body.removeChild(temporaryElement);
        return stringIncludesSubstring(computedColor, 'rgba');
    };

    detectionServices.testHslaColorSupport = function() {
        const temporaryElement = docRef.createElement('div');
        docRef.body.appendChild(temporaryElement);
        temporaryElement.style.backgroundColor = 'hsla(120,50%,50%,0.5)';
        const computedColor = retrieveComputedStyle(temporaryElement, 'background-color');
        docRef.body.removeChild(temporaryElement);
        return stringIncludesSubstring(computedColor, 'rgba') || stringIncludesSubstring(computedColor, 'hsla');
    };

    detectionServices.testMultipleBackgrounds = function() {
        const temporaryElement = docRef.createElement('div');
        docRef.body.appendChild(temporaryElement);
        temporaryElement.style.backgroundImage = 'url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==), url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==), url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)';
        const computedImage = retrieveComputedStyle(temporaryElement, 'background-image');
        docRef.body.removeChild(temporaryElement);
        return (computedImage.split('url(').length - 1) >= 3;
    };

    detectionServices.testBackgroundSize = function() {
        return checkDomProperty('backgroundSize');
    };

    detectionServices.testBorderImage = function() {
        return checkDomProperty('borderImage');
    };

    detectionServices.testBorderRadius = function() {
        return checkDomProperty('borderRadius', (prop) => stringIncludesSubstring(prop, 'orderRadius'));
    };

    detectionServices.testBoxShadow = function() {
        return checkDomProperty('boxShadow');
    };

    detectionServices.testTextShadow = function() {
        return utilityElementStyle.textShadow !== undefValue && utilityElementStyle.textShadow === '';
    };

    detectionServices.testCssOpacity = function() {
        utilityElementStyle.opacity = '0.5';
        const isSupported = stringIncludesSubstring(utilityElementStyle.opacity, '0.5');
        utilityElementStyle.opacity = '';
        return isSupported;
    };

    function executeAllDetections() {
        primaryHostElement.appendChild(utilityTestElement);

        featureRegistry.flexLayout = detectionServices.testFlexLayout();
        featureRegistry.canvasApi = detectionServices.testCanvasApi();
        featureRegistry.canvasTextApi = detectionServices.testCanvasTextApi();
        featureRegistry.webglApi = detectionServices.testWebGLApi();
        featureRegistry.touchInteraction = detectionServices.testTouchInteraction();
        featureRegistry.geoLocationApi = detectionServices.testGeoLocationApi();
        featureRegistry.postMessage = detectionServices.testCrossWindowMessaging();
        featureRegistry.webSqlDatabase = detectionServices.testWebDatabase();
        featureRegistry.indexedDB = detectionServices.testIndexedDatabase();
        featureRegistry.hashChangeEvent = detectionServices.testHashChangeEvent();
        featureRegistry.historyManipulation = detectionServices.testHistoryManipulation();
        featureRegistry.dragAndDrop = detectionServices.testDragAndDrop();
        featureRegistry.webSocketsApi = detectionServices.testWebSocketsApi();
        featureRegistry.rgbaColorSupport = detectionServices.testRgbaColorSupport();
        featureRegistry.hslaColorSupport = detectionServices.testHslaColorSupport();
        featureRegistry.multipleBackgrounds = detectionServices.testMultipleBackgrounds();
        featureRegistry.backgroundSize = detectionServices.testBackgroundSize();
        featureRegistry.borderImage = detectionServices.testBorderImage();
        featureRegistry.borderRadius = detectionServices.testBorderRadius();
        featureRegistry.boxShadow = detectionServices.testBoxShadow();
        featureRegistry.textShadow = detectionServices.testTextShadow();
        featureRegistry.cssOpacity = detectionServices.testCssOpacity();

        primaryHostElement.removeChild(utilityTestElement);

        for (const key in featureRegistry) {
            if (Object.prototype.hasOwnProperty.call(featureRegistry, key)) {
                const featureClassName = (featureRegistry[key] ? '' : 'no-') + key.replace(/([A-Z])/g, '-$1').toLowerCase();
                primaryHostElement.className += ' ' + featureClassName;
            }
        }
    }

    executeAllDetections();

    return featureRegistry;

})(window, document, undefined);