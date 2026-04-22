/* FeatureProbe 2.6.3 (Comprehensive Build) | Licensing: MIT & BSD
 *  Build Details: http://featureprobe.org/download/#-webfonts-backgroundsizing-imageborders-roundedcorners-shadowboxes-flexbox-hsla-multibackgrounds-opacity-rgba-textshadow-animations-csscolumns-generatedcontent-gradients-reflections-transforms-transforms3d-transitions-appcache-canvas-canvastext-dragdrop-hashchange-history-audio-video-indexeddb-inputs-inputtypes-localstorage-postmessaging-sessionstorage-websockets-sqlstorage-webworkers-geolocation-svginline-smil-svg-svgclippaths-touch-webgl-shiv-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-cors-json-load
 *  This script detects browser capabilities.
 */
;


globalScope.FeatureProbe = (function(globalObj, docObj, undefVal) {

  // Current library version
  var libVersion = '2.6.2';

  // The main object that will hold all feature results
  var FeatureProbe = {};

  // Flag to control adding CSS classes to the HTML element
  var activateStylesheets = true;

  // Reference to the root HTML element
  var htmlNode = docObj.documentElement;

  // Unique identifier for temporary elements and styles
  var probeKey = 'featureprobe';
  // Create a temporary element for styling tests
  var testNode = docObj.createElement(probeKey);
  // Get its style object
  var elementStyle = testNode.style;

  // Create an input element for testing form control capabilities
  var testInput = docObj.createElement('input');

  // A small emoji for generated content tests
  var happyFace = ':)';

  // Optimized way to get an object's string representation (e.g., "[object Function]")
  var typeChecker = {}.toString;

  // Standard CSS vendor prefixes
  var vendorPrefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

  // Camel-cased prefixes for JS property access (e.g., WebkitTransition)
  var jsPrefixes = 'Webkit Moz O ms';

  // Split and store the JS prefixes
  var domStylePrefixes = jsPrefixes.split(' ');

  // Lowercase versions of JS prefixes for DOM property checks (e.g., webkitTransform)
  var jsPropertyPrefixes = jsPrefixes.toLowerCase().split(' ');

  // Namespace map for SVG
  var xmlNamespaces = {'svg': 'http://www.w3.org/2000/svg'};

  // Object to store the results of all feature tests
  var capabilityChecks = {};
  // Object to store input-related feature results
  var inputCapabilities = {};
  // Object to store attribute-related feature results
  var elementAttributeChecks = {};

  // Array to hold CSS classes to be added to the HTML element
  var styleClasses = [];

  // Optimized Array.prototype.slice reference
  var partExtractor = styleClasses.slice;

  // Variable to hold the name of the current feature being processed
  var propIdentifier;

  /*
   * Inserts a temporary element into the DOM, applies styles, and runs a callback.
   * This is crucial for testing CSS features that require an element to be rendered.
   *
   * @param {string} cssRule - The CSS rule string to apply.
   * @param {function} checkFunction - A callback function to run on the inserted element.
   * @param {number} [numNodes] - The number of child divs to create inside the temporary element.
   * @param {Array<string>} [nodeNames] - Optional array of IDs for the child divs.
   * @returns {boolean} - The result of the checkFunction.
   */
  var insertAndEvaluateCss = function(cssRule, checkFunction, numNodes, nodeNames) {

    var cssString,
      resultVal,
      childNode,
      originalOverflow,
      tempContainer = docObj.createElement('div'),
      mainBody = docObj.body,
      stagingBody = mainBody || docObj.createElement('body'); // Create a fake body if real body not ready

    // If numNodes is a positive integer, create that many child divs
    if (parseInt(numNodes, 10)) {
      while (numNodes--) {
        childNode = docObj.createElement('div');
        childNode.id = nodeNames ? nodeNames[numNodes] : probeKey + (numNodes + 1);
        tempContainer.appendChild(childNode);
      }
    }

    // Construct the full style string for insertion
    cssString = ['&#173;', '<style id="s', probeKey, '">', cssRule, '</style>'].join('');
    tempContainer.id = probeKey; // Set ID for the main test container

    // Add the style to the temporary element's innerHTML
    (mainBody ? tempContainer : stagingBody).innerHTML += cssString;
    stagingBody.appendChild(tempContainer); // Append the test container to the (fake) body

    // If there was no real body, we need to temporarily append the fake body to the document
    if (!mainBody) {
      stagingBody.style.background = ''; // Clear background to avoid visual artifacts
      stagingBody.style.overflow = 'hidden'; // Hide overflow to prevent scrollbars
      originalOverflow = htmlNode.style.overflow;
      htmlNode.style.overflow = 'hidden'; // Hide root element overflow too
      htmlNode.appendChild(stagingBody); // Attach fake body to the document
    }

    // Execute the callback function with the temporary element and CSS rule
    resultVal = checkFunction(tempContainer, cssRule);

    // Clean up the temporary elements
    if (!mainBody) {
      stagingBody.parentNode.removeChild(stagingBody); // Remove fake body
      htmlNode.style.overflow = originalOverflow; // Restore original overflow
    } else {
      tempContainer.parentNode.removeChild(tempContainer); // Remove test container from real body
    }

    // Return the boolean result
    return !!resultVal;

  };


  /*
   * Checks if a given event is supported by the browser.
   *
   * @returns {function(string, Element): boolean} A function to check event support.
   */
  var checkEventCapability = (function() {

    // Map common event names to appropriate HTML tags for testing
    var eventToElementMap = {
      'select': 'input', 'change': 'input',
      'submit': 'form', 'reset': 'form',
      'error': 'img', 'load': 'img', 'abort': 'img'
    };

    /**
     * Internal function to perform the event support check.
     * @param {string} eventIdentifier - The name of the event (e.g., 'click', 'hashchange').
     * @param {Element} [targetElement] - An optional element to test the event on.
     * @returns {boolean} True if the event is supported, false otherwise.
     */
    function isEventSupportedInternal(eventIdentifier, targetElement) {

      // Create a suitable element if not provided
      targetElement = targetElement || docObj.createElement(eventToElementMap[eventIdentifier] || 'div');
      eventIdentifier = 'on' + eventIdentifier; // Prepend 'on' for event handler property name

      // Check if the event property exists directly on the element
      var eventExists = eventIdentifier in targetElement;

      // If not directly supported, try setting and checking attribute
      if (!eventExists) {
        // Fallback for older IE or if setAttribute is missing
        if (!targetElement.setAttribute) {
          targetElement = docObj.createElement('div');
        }
        // If setAttribute/removeAttribute exist, try the standard method
        if (targetElement.setAttribute && targetElement.removeAttribute) {
          targetElement.setAttribute(eventIdentifier, '');
          eventExists = isType(targetElement[eventIdentifier], 'function'); // Check if it became a function

          // Clean up the event handler property
          if (!isType(targetElement[eventIdentifier], 'undefined')) {
            targetElement[eventIdentifier] = undefVal;
          }
          targetElement.removeAttribute(eventIdentifier); // Remove the attribute
        }
      }

      targetElement = null; // Clean up element reference
      return eventExists;
    }
    return isEventSupportedInternal;
  })(),

  // Reference to Object.prototype.hasOwnProperty
  objHasProperty = ({}).hasOwnProperty,
  // Function to check if an object has its own property (not inherited)
  hasDirectProperty;

  // Check if native hasOwnProperty is reliable
  if (!isType(objHasProperty, 'undefined') && !isType(objHasProperty.call, 'undefined')) {
    hasDirectProperty = function(targetObj, propName) {
      return objHasProperty.call(targetObj, propName);
    };
  }
  // Fallback for environments where hasOwnProperty might be problematic
  else {
    hasDirectProperty = function(targetObj, propName) {
      return ((propName in targetObj) && isType(targetObj.constructor.prototype[propName], 'undefined'));
    };
  }


  // Polyfill for Function.prototype.bind if not natively available
  if (!Function.prototype.bind) {
    /**
     * Creates a new function that, when called, has its 'this' keyword set to the provided value,
     * with a given sequence of arguments preceding any provided when the new function is called.
     * @param {*} contextObj - The value to be passed as the 'this' parameter to the target function.
     * @returns {function} A new bound function.
     */
    Function.prototype.bind = function attachContext(contextObj) {

      var originalFunc = this; // The function to be bound

      // Ensure the target is actually a function
      if (typeof originalFunc !== "function") {
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      // Collect initial arguments (excluding 'thisArg')
      var initialArgs = partExtractor.call(arguments, 1),
        // The new function that will be returned
        newlyBoundFunc = function() {

          // Check if the bound function is being used as a constructor (with 'new')
          if (this instanceof newlyBoundFunc) {

            // Create a temporary constructor to correctly set up the prototype chain
            var TempCtor = function() {};
            TempCtor.prototype = originalFunc.prototype;
            var instanceObj = new TempCtor(); // Create new instance

            // Apply the original function with the new instance as 'this' and combined arguments
            var invocationResult = originalFunc.apply(
              instanceObj,
              initialArgs.concat(partExtractor.call(arguments)) // Combine initial and runtime arguments
            );
            // If the result is an object, return it; otherwise, return the new instance
            if (Object(invocationResult) === invocationResult) {
              return invocationResult;
            }
            return instanceObj;

          } else {
            // If not called with 'new', simply apply the function with the bound context and arguments
            return originalFunc.apply(
              contextObj,
              initialArgs.concat(partExtractor.call(arguments))
            );

          }

        };

      // Return the new bound function
      return newlyBoundFunc;
    };
  }

  /**
   * Directly sets the CSS text for the temporary style element.
   * @param {string} styleText - The CSS string to apply.
   */
  function applyStyleString(styleText) {
    elementStyle.cssText = styleText;
  }

  /**
   * Applies a CSS style string with all known vendor prefixes.
   * @param {string} baseStyle - The base CSS style declaration (e.g., 'opacity:.55').
   * @param {string} [optionalSuffix] - An optional suffix to append after the prefixed rules.
   * @returns {string} The combined CSS text.
   */
  function applyVendorStyles(baseStyle, optionalSuffix) {
    return applyStyleString(vendorPrefixes.join(baseStyle + ';') + (optionalSuffix || ''));
  }

  /**
   * Checks the type of an object.
   * @param {*} valueToCheck - The value to check.
   * @param {string} expectedType - The expected type string (e.g., 'function', 'string', 'undefined').
   * @returns {boolean} True if the value's type matches the expected type.
   */
  function isType(valueToCheck, expectedType) {
    return typeof valueToCheck === expectedType;
  }

  /**
   * Checks if a string contains a specific substring.
   * @param {string} haystack - The string to search within.
   * @param {string} needle - The substring to search for.
   * @returns {boolean} True if the substring is found.
   */
  function stringIncludes(haystack, needle) {
    return !!~('' + haystack).indexOf(needle);
  }

  /**
   * Tests a list of CSS properties for support in the current browser.
   * @param {Array<string>} propertyList - An array of CSS property names to test.
   * @param {string} [prefixType] - If 'pfx', returns the supported prefixed property name.
   * @returns {boolean|string} True if any property is supported, false otherwise. If prefixType is 'pfx', returns the supported property name.
   */
  function checkCssProperties(propertyList, prefixType) {
    for (var idx in propertyList) {
      var cssProperty = propertyList[idx];
      // Check if property doesn't contain a hyphen (i.e., not a custom property) and exists in element's style
      if (!stringIncludes(cssProperty, "-") && elementStyle[cssProperty] !== undefVal) {
        return prefixType === 'pfx' ? cssProperty : true;
      }
    }
    return false;
  }

  /**
   * Tests a list of DOM properties for support on a given object.
   * @param {Array<string>} propertyNames - An array of DOM property names to test.
   * @param {object} targetObject - The object (e.g., window, navigator) to check properties on.
   * @param {Element} [targetElement] - An optional element to bind functions to.
   * @returns {boolean|*} The supported property value, or false if none are supported.
   */
  function checkDomProperties(propertyNames, targetObject, targetElement) {
    for (var idx in propertyNames) {
      var propValue = targetObject[propertyNames[idx]];
      if (propValue !== undefVal) {

        // If targetElement is false, just return the property name
        if (targetElement === false) return propertyNames[idx];

        // If the property is a function, bind it to targetElement or targetObject
        if (isType(propValue, 'function')) {
          return propValue.attachContext(targetElement || targetObject);
        }

        return propValue; // Return the property value itself
      }
    }
    return false;
  }

  /**
   * Tests a CSS or DOM property for support, including vendor prefixes.
   * @param {string} baseProperty - The base property name (e.g., 'flexWrap', 'transform').
   * @param {string|object} [prefixMode] - 'string' or 'undefined' for CSS property test, object for DOM property test.
   * @param {Element} [targetNode] - An optional element for DOM property tests.
   * @returns {boolean|string|*} The test result.
   */
  function testFullPropertySupport(baseProperty, prefixMode, targetNode) {

    var capitalizedProp = baseProperty.charAt(0).toUpperCase() + baseProperty.slice(1),
      // Generate prefixed CSS property names (e.g., 'flexWrap WebkitFlexWrap MozFlexWrap...')
      cssProps = (baseProperty + ' ' + domStylePrefixes.join(capitalizedProp + ' ') + capitalizedProp).split(' ');

    // If prefixMode is a string or undefined, perform CSS property test
    if (isType(prefixMode, "string") || isType(prefixMode, "undefined")) {
      return checkCssProperties(cssProps, prefixMode);

    } else {
      // Otherwise, perform DOM property test with lowercased prefixes
      var domProps = (baseProperty + ' ' + (jsPropertyPrefixes).join(capitalizedProp + ' ') + capitalizedProp).split(' ');
      return checkDomProperties(domProps, prefixMode, targetNode);
    }
  }

  // --- Start of Feature Detection Tests ---

  // CSS Flexbox Layout Module
  capabilityChecks['flexibleBoxes'] = function() {
    return testFullPropertySupport('flexWrap'); // Test for flex-wrap property
  };

  // HTML5 Canvas API
  capabilityChecks['drawingCanvas'] = function() {
    var canvasElement = docObj.createElement('canvas');
    return !!(canvasElement.getContext && canvasElement.getContext('2d')); // Check for getContext method
  };

  // HTML5 Canvas Text API
  capabilityChecks['canvasTextRendering'] = function() {
    return !!(FeatureProbe['drawingCanvas'] && isType(docObj.createElement('canvas').getContext('2d').fillText, 'function'));
  };


  // WebGL 3D Graphics API
  capabilityChecks['threeDContext'] = function() {
    return !!globalObj.WebGLRenderingContext; // Check for WebGLRenderingContext constructor
  };


  // Touch Events (mobile devices)
  capabilityChecks['touchInteraction'] = function() {
    var isSupported;

    // Direct check for 'ontouchstart' or DocumentTouch API
    if (('ontouchstart' in globalObj) || (globalObj.DocumentTouch && docObj instanceof globalObj.DocumentTouch)) {
      isSupported = true;
    } else {
      // Fallback: Inject a media query to detect touch capabilities via CSS
      insertAndEvaluateCss(['@media (', vendorPrefixes.join('touch-enabled),('), probeKey, ')', '{#featureprobe{top:9px;position:absolute}}'].join(''), function(testDiv) {
        isSupported = testDiv.offsetTop === 9; // Check if CSS rule was applied
      });
    }

    return isSupported;
  };


  // Geolocation API
  capabilityChecks['geoPositioning'] = function() {
    return 'geolocation' in globalNavigator; // Check for 'geolocation' object in navigator
  };


  // Cross-document messaging (PostMessage)
  capabilityChecks['crossWindowMessaging'] = function() {
    return !!globalObj.postMessage; // Check for window.postMessage function
  };


  // Web SQL Database API
  capabilityChecks['sqlStorage'] = function() {
    return !!globalObj.openDatabase; // Check for window.openDatabase function
  };

  // IndexedDB API
  capabilityChecks['indexedDbStorage'] = function() {
    return !!testFullPropertySupport("indexedDB", globalObj); // Test for indexedDB property on window
  };

  // Hashchange Event
  capabilityChecks['urlHashChange'] = function() {
    // Check for 'hashchange' event support and ensure not in old IE document modes
    return checkEventCapability('hashchange', globalObj) && (docObj.documentMode === undefVal || docObj.documentMode > 7);
  };

  // History API (pushState, replaceState)
  capabilityChecks['browserHistory'] = function() {
    return !!(globalObj.history && globalObj.history.pushState); // Check for history object and pushState method
  };

  // Drag and Drop API
  capabilityChecks['dragDropApi'] = function() {
    var tempDiv = docObj.createElement('div');
    return ('draggable' in tempDiv) || ('ondragstart' in tempDiv && 'ondrop' in tempDiv); // Check 'draggable' attribute or event handlers
  };

  // WebSockets API
  capabilityChecks['socketCommunication'] = function() {
    return 'WebSocket' in globalObj || 'MozWebSocket' in globalObj; // Check for WebSocket or MozWebSocket constructors
  };


  // RGBA Color Support
  capabilityChecks['alphaColors'] = function() {
    applyStyleString('background-color:rgba(150,255,150,.5)'); // Apply an RGBA background color

    return stringIncludes(elementStyle.backgroundColor, 'rgba'); // Check if 'rgba' is present in the computed style
  };

  // HSLA Color Support
  capabilityChecks['hueSaturationLightness'] = function() {
    applyStyleString('background-color:hsla(120,40%,100%,.5)'); // Apply an HSLA background color

    // Check for 'rgba' (browser conversion) or 'hsla'
    return stringIncludes(elementStyle.backgroundColor, 'rgba') || stringIncludes(elementStyle.backgroundColor, 'hsla');
  };

  // Multiple Backgrounds
  capabilityChecks['multiBackgrounds'] = function() {
    applyStyleString('background:url(https://),url(https://),red url(https://)'); // Apply multiple backgrounds

    return (/(url\s*\(.*?){3}/).test(elementStyle.background); // Check for at least three 'url()' patterns
  };

  // CSS Background Size property
  capabilityChecks['backgroundSizing'] = function() {
    return testFullPropertySupport('backgroundSize'); // Test for 'backgroundSize' property
  };

  // CSS Border Image property
  capabilityChecks['imageBorders'] = function() {
    return testFullPropertySupport('borderImage'); // Test for 'borderImage' property
  };


  // CSS Border Radius property
  capabilityChecks['roundedCorners'] = function() {
    return testFullPropertySupport('borderRadius'); // Test for 'borderRadius' property
  };

  // CSS Box Shadow property
  capabilityChecks['shadowBoxes'] = function() {
    return testFullPropertySupport('boxShadow'); // Test for 'boxShadow' property
  };

  // CSS Text Shadow property
  capabilityChecks['shadowText'] = function() {
    return docObj.createElement('div').style.textShadow === ''; // Check if setting textShadow results in empty string (supported)
  };


  // CSS Opacity property
  capabilityChecks['elementOpacity'] = function() {
    applyVendorStyles('opacity:.55'); // Apply opacity with vendor prefixes

    return (/^0.55$/).test(elementStyle.opacity); // Check if computed opacity is 0.55
  };


  // CSS Animations
  capabilityChecks['cssAnimations'] = function() {
    return testFullPropertySupport('animationName'); // Test for 'animationName' property
  };


  // CSS Columns Layout
  capabilityChecks['cssColumnsLayout'] = function() {
    return testFullPropertySupport('columnCount'); // Test for 'columnCount' property
  };


  // CSS Gradients
  capabilityChecks['cssGradients'] = function() {
    var stylePart1 = 'background-image:',
      stylePart2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
      stylePart3 = 'linear-gradient(left top,#9f9, white);';

    // Apply various gradient syntaxes with vendor prefixes
    applyStyleString(
      (stylePart1 + '-webkit- '.split(' ').join(stylePart2 + stylePart1) +
        vendorPrefixes.join(stylePart3 + stylePart1)).slice(0, -stylePart1.length)
    );

    return stringIncludes(elementStyle.backgroundImage, 'gradient'); // Check if 'gradient' is present in background-image
  };


  // CSS Reflections (box-reflect)
  capabilityChecks['cssReflections'] = function() {
    return testFullPropertySupport('boxReflect'); // Test for 'boxReflect' property
  };


  // CSS 2D Transforms
  capabilityChecks['cssTransforms'] = function() {
    return !!testFullPropertySupport('transform'); // Test for 'transform' property
  };


  // CSS 3D Transforms
  capabilityChecks['cssTransforms3D'] = function() {

    var isSupported = !!testFullPropertySupport('perspective'); // Check for 'perspective' property

    // If 'perspective' is supported and webkit prefix is present, perform a more robust test
    if (isSupported && 'webkitPerspective' in htmlNode.style) {

      // Inject a media query with 3D transforms and check element position/size
      insertAndEvaluateCss('@media (transform-3d),(-webkit-transform-3d){#featureprobe{left:9px;position:absolute;height:3px;}}', function(testElem) {
        isSupported = testElem.offsetLeft === 9 && testElem.offsetHeight === 3;
      });
    }
    return isSupported;
  };


  // CSS Transitions
  capabilityChecks['cssTransitions'] = function() {
    return testFullPropertySupport('transition'); // Test for 'transition' property
  };


  // CSS @font-face rule
  capabilityChecks['customFonts'] = function() {
    var fontSupport;

    // Inject a @font-face rule and check if it's parsed correctly
    insertAndEvaluateCss('@font-face {font-family:"font";src:url("https://")}', function(testNode, ruleText) {
      var styleTag = docObj.getElementById('s' + probeKey),
        styleSheetObj = styleTag.sheet || styleTag.styleSheet,
        // Get the CSS text from the stylesheet
        ruleContent = styleSheetObj ? (styleSheetObj.cssRules && styleSheetObj.cssRules[0] ? styleSheetObj.cssRules[0].cssText : styleSheetObj.cssText || '') : '';

      // Check if 'src' is present and the rule starts with the expected font-family
      fontSupport = /src/i.test(ruleContent) && ruleContent.indexOf(ruleText.split(' ')[0]) === 0;
    });

    return fontSupport;
  };

  // CSS Generated Content (::before, ::after)
  capabilityChecks['generatedCssContent'] = function() {
    var contentSupport;

    // Inject a rule with generated content and check the element's height
    insertAndEvaluateCss(['#', probeKey, '{font:0/0 a}#', probeKey, ':after{content:"', happyFace, '";visibility:hidden;font:3px/1 a}'].join(''), function(testDiv) {
      contentSupport = testDiv.offsetHeight >= 3; // If height is 3px or more, content was generated
    });

    return contentSupport;
  };

  // HTML5 Video API
  capabilityChecks['videoPlayback'] = function() {
    var videoElement = docObj.createElement('video'),
      canPlay = false;

    try {
      // Check if canPlayType method exists
      if (canPlay = !!videoElement.canPlayType) {
        canPlay = new Boolean(canPlay); // Convert to Boolean object to add properties
        canPlay.ogg = videoElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
        canPlay.h264 = videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');
        canPlay.webm = videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
      }
    } catch (err) { /* Error during canPlayType check */ }

    return canPlay;
  };

  // HTML5 Audio API
  capabilityChecks['audioPlayback'] = function() {
    var audioElement = docObj.createElement('audio'),
      canPlayAudio = false;

    try {
      // Check if canPlayType method exists
      if (canPlayAudio = !!audioElement.canPlayType) {
        canPlayAudio = new Boolean(canPlayAudio); // Convert to Boolean object to add properties
        canPlayAudio.ogg = audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
        canPlayAudio.mp3 = audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '');
        canPlayAudio.wav = audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
        canPlayAudio.m4a = (audioElement.canPlayType('audio/x-m4a;') ||
          audioElement.canPlayType('audio/aac;')).replace(/^no$/, '');
      }
    } catch (err) { /* Error during canPlayType check */ }

    return canPlayAudio;
  };


  // Local Storage API
  capabilityChecks['localStorageApi'] = function() {
    try {
      // Attempt to set and remove an item to check for functionality and quota errors
      globalObj.localStorage.setItem(probeKey, probeKey);
      globalObj.localStorage.removeItem(probeKey);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Session Storage API
  capabilityChecks['sessionStorageApi'] = function() {
    try {
      // Attempt to set and remove an item
      globalObj.sessionStorage.setItem(probeKey, probeKey);
      globalObj.sessionStorage.removeItem(probeKey);
      return true;
    } catch (err) {
      return false;
    }
  };


  // Web Workers API
  capabilityChecks['webWorkerSupport'] = function() {
    return !!globalObj.Worker; // Check for Worker constructor
  };


  // Application Cache API
  capabilityChecks['appCache'] = function() {
    return !!globalObj.applicationCache; // Check for applicationCache object
  };

  // --- End of Feature Detection Tests ---

  // Placeholder for the main return object (FeatureProbe initialization)
  return FeatureProbe;

})(window, document); // Pass window and document as arguments for minification and scope control