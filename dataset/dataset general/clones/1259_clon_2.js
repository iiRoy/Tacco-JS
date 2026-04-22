globalScope.FeatureChecker = (function(globalScope, domDoc, undefVal){

  var libVersion = "1.6.0",

  resultObj = {},

  /**
   * !! DEPRECATED !!
   *
   * allowOldHTML is an internal configuration flag for advanced usage.
   * If enabled, the FeatureChecker.init() method will execute a brief loop
   * to dynamically create all HTML5 elements within the DOM. This is necessary
   * to allow Internet Explorer versions that do not inherently recognize
   * non-HTML4 elements to apply styles to them.
   *
   * allowOldHTML is activated by default.
   *
   * The allowOldHTML toggle option is considered DEPRECATED as of version 1.6.0
   * and is slated for removal in 2.0, in favor of 2.0's modular and configurable design.
   */
  allowOldHTML = true,


  htmlRoot = domDoc.documentElement,
  headElem = domDoc.head || domDoc.getElementsByTagName('head')[0],

  /**
   * Constructs our "featurecheck" element, which serves as the primary
   * target for most feature detection tests.
   */
  testIdStr = 'featurecheck',
  testDiv = domDoc.createElement( testIdStr ),
  testDivStyle = testDiv.style,

  /**
   * Creates an input element specifically for various Web Forms feature tests.
   */
  inputProbe = domDoc.createElement( 'input' ),

  happyFace = ':-)',

  objToStr = Object.prototype.toString,

  // A collection of vendor prefixes to apply to CSS property values for testing.
  // Refer to ticket #21 for context. The empty strings are intentional for join behavior.
  vendorPrefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-", "-khtml-", ""],

  // According to specification, vendor-specific style properties should be exposed as:
  //   element.style.WebkitBorderRadius
  // The following form would be incorrect:
  //   element.style.webkitBorderRadius

  // Webkit internally uses lowercase for its properties, while Opera and Mozilla do not.
  // Microsoft omitted prefixes entirely in IE8 and earlier, but appears to
  //   utilize a lowercase `ms` instead of the correct `Ms` in IE9.

  // More information: https://github.com/Modernizr/Modernizr/issues/issue/21
  jsDomPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'],

  namespaces = {'svg': 'http://www.w3.org/2000/svg'},

  featureTests = {},
  inputChecks = {},
  attributeChecks = {},

  cssClasses = [],

  currentFeature, // Variable for the feature testing iteration loop



  // Consider alternative: http://javascript.nwbox.com/CSSSupport/css-support.js
  checkMediaRule = function(mediaQuery){

    var styleTag = domDoc.createElement('style'),
        tempDiv = domDoc.createElement('div'),
        queryResult;

    styleTag.textContent = mediaQuery + '{#featurecheck{height:4px}}';
    headElem.appendChild(styleTag);
    tempDiv.id = 'featurecheck';
    htmlRoot.appendChild(tempDiv);

    queryResult = tempDiv.offsetHeight === 4;

    styleTag.parentNode.removeChild(styleTag);
    tempDiv.parentNode.removeChild(tempDiv);

    return !!queryResult;

  },


  /**
    * eventCheck determines if a given DOM element supports a specific event.
    * Function adapted from http://yura.thinkweb2.com/isEventSupported/
    */
  eventCheck = (function(){

    var eventToTagMap = {
      'select':'input','change':'input',
      'submit':'form','reset':'form',
      'error':'img','load':'img','abort':'img'
    };

    function checkEventSupport(evtName, targetElem) {

      targetElem = targetElem || domDoc.createElement(eventToTagMap[evtName] || 'div');
      evtName = 'on' + evtName;

      // Using `setAttribute` in IE skips "unload", WebKit skips "unload" and "resize".
      // Conversely, the `in` operator successfully detects these.
      var supportStatus = (evtName in targetElem);

      if (!supportStatus) {
        // If the element lacks `setAttribute` (i.e., doesn't implement Node interface),
        // attempt with a generic element.
        if (!targetElem.setAttribute) {
          targetElem = domDoc.createElement('div');
        }
        if (targetElem.setAttribute && targetElem.removeAttribute) {
          targetElem.setAttribute(evtName, '');
          supportStatus = isType(targetElem[evtName], 'function');

          // If the property was created, unset it (by assigning `undefVal`).
          if (!isType(targetElem[evtName], undefVal)) {
            targetElem[evtName] = undefVal;
          }
          targetElem.removeAttribute(evtName);
        }
      }

      targetElem = null; // Clean up the temporary element
      return supportStatus;
    }
    return checkEventSupport;
  })();


  // hasOwnProp shim by kangax for Safari 2.0 compatibility
  var baseHasOwn = ({}).hasOwnProperty, hasOwnProp;
  if (!isType(baseHasOwn, undefVal) && !isType(baseHasOwn.call, undefVal)) {
    hasOwnProp = function (objInstance, propKey) {
      return baseHasOwn.call(objInstance, propKey);
    };
  }
  else {
    hasOwnProp = function (objInstance, propKey) { /* Note: This might produce false positives/negatives in edge cases, but is generally sufficient. */
      return ((propKey in objInstance) && isType(objInstance.constructor.prototype[propKey], undefVal));
    };
  }

  /**
   * applyStyle applies the given CSS string to the FeatureChecker's internal DOM node.
   */
  function applyStyle( cssString ) {
    testDivStyle.cssText = cssString;
  }

  /**
   * applyVendorStyles expands a base CSS string into all vendor-prefixed versions.
   */
  function applyVendorStyles( baseStyle, additionalStyle ) {
    return applyStyle(vendorPrefixes.join(baseStyle + ';') + ( additionalStyle || '' ));
  }

  /**
   * isType returns a boolean indicating if the typeof a value exactly matches the specified type string.
   */
  function isType( valToCheck, expectedType ) {
    return typeof valToCheck === expectedType;
  }

  /**
   * stringHas returns a boolean indicating if a substring is present within a main string.
   */
  function stringHas( mainString, subString ) {
    return (''+mainString).indexOf( subString ) !== -1;
  }

  /**
   * testStyleProps is a general function for testing CSS / DOM properties.
   * If a browser supports a property, its value will not be `undefVal`.
   * A supported CSS property will return an empty string if not explicitly set.
   */
  function testStyleProps( propertyList, checkFn ) {
    for ( var idx in propertyList ) {
      if ( testDivStyle[ propertyList[idx] ] !== undefVal && ( !checkFn || checkFn( propertyList[idx], testDiv ) ) ) {
        return true;
      }
    }
  }

  /**
   * testAllStyleProps checks a comprehensive list of DOM properties.
   * This includes all known and likely properties on the element,
   * including the non-vendor prefixed one, for future compatibility.
   */
  function testAllStyleProps( baseProp, propCallback ) {

    var capitalizedProp = baseProp.charAt(0).toUpperCase() + baseProp.substr(1),
        allProps = (baseProp + ' ' + jsDomPrefixes.join(capitalizedProp + ' ') + capitalizedProp).split(' ');

    return !!testStyleProps( allProps, propCallback );
  }


  /**
   * Feature Tests Definitions
   */

  featureTests['flexbox'] = function() {
    /**
     * setPrefixedValue applies a style with vendor prefixes to the VALUE.
     * @param {Element} targetEl The element to style.
     * @param {string} propName The property name (unprefixed).
     * @param {string} propVal The property value (will be prefixed).
     * @param {string=} additional Additional CSS to append (unmodified).
     */
    function setPrefixedValue(targetEl, propName, propVal, additional) {
      propName += ':';
      targetEl.style.cssText = (propName + vendorPrefixes.join(propVal + ';' + propName)).slice(0, -propName.length) + (additional || '');
    }

    /**
     * setPrefixedProperty applies a style with vendor prefixes to the PROPERTY NAME.
     * @param {Element} targetEl The element to style.
     * @param {string} propName The property name (will be prefixed).
     * @param {string} propVal The property value (unprefixed).
     * @param {string=} additional Additional CSS to append (unmodified).
     */
    function setPrefixedProperty(targetEl, propName, propVal, additional) {
      targetEl.style.cssText = vendorPrefixes.join(propName + ':' + propVal + ';') + (additional || '');
    }

    var containerDiv = domDoc.createElement('div'),
        childElem = domDoc.createElement('div');

    setPrefixedValue(containerDiv, 'display', 'box', 'width:43px;padding:0;');
    setPrefixedProperty(childElem, 'box-flex', '1', 'width:10px;');

    containerDiv.appendChild(childElem);
    htmlRoot.appendChild(containerDiv);

    var flexResult = childElem.offsetWidth === 43;

    containerDiv.removeChild(childElem);
    htmlRoot.removeChild(containerDiv);

    return flexResult;
  };

  // On S60 and BB Storm, getContext exists but always returns undefVal.
  // https://github.com/Modernizr/Modernizr/issues/issue/97/
  featureTests['canvas'] = function() {
    var canvasEl = domDoc.createElement( 'canvas' );
    return !!(canvasEl.getContext && canvasEl.getContext('2d'));
  };

  featureTests['canvastext'] = function() {
    return !!(resultObj['canvas'] && isType(domDoc.createElement( 'canvas' ).getContext('2d').fillText, 'function'));
  };


  featureTests['webgl'] = function(){

    var glCanvas = domDoc.createElement( 'canvas' );

    try {
      if (glCanvas.getContext('webgl')){ return true; }
    } catch(err){ /* ignore */ }

    try {
      if (glCanvas.getContext('experimental-webgl')){ return true; }
    } catch(err){ /* ignore */ }

    return false;
  };

  /*
   * The FeatureChecker.touch test merely indicates if the browser supports
   *    touch interaction events. This does not necessarily guarantee a
   *    touchscreen device, as exemplified by Windows 7 tablets or
   *    Palm Pre / WebOS phones (which are touch-enabled).
   *
   * Additionally, Chrome (desktop) previously reported false positives for this,
   *    but this issue has since been resolved: http://crbug.com/36415
   *
   * We also incorporate a check for Firefox 4 Multitouch Support.
   *
   * For further details, see: https://modernizr.github.com/Modernizr/touch.html
   */

  featureTests['touch'] = function() {

    return ('ontouchstart' in globalScope) || checkMediaRule('@media ('+vendorPrefixes.join('touch-enabled),(')+'featurecheck)');

  };


  /**
   * geolocation checks for the new Geolocation API specification.
   *   This test strictly adheres to standards compliance. For more exhaustive
   *   testing, including a Google Gears fallback, please refer to:
   *   http://code.google.com/p/geo-location-javascript/
   * or examine a fallback solution utilizing Google's geo API:
   *   http://gist.github.com/366184
   */
  featureTests['geolocation'] = function() {
    return !!navigator.geolocation;
  };

  // As of 1.6:
  // This was previously FeatureChecker.crosswindowmessaging, but the longer
  // name has been deprecated in favor of a shorter, property-matching alternative.
  // The old API remains available in 1.6, but will issue a warning in 2.0,
  // and will be entirely removed in the subsequent release.
  featureTests['postmessage'] = function() {
    return !!globalScope.postMessage;
  };

  // Web SQL database detection presents challenges:

  // In Chrome's incognito mode, `openDatabase` appears truthy, but attempting
  //   to use it will trigger an exception: http://crbug.com/42380
  // While a dummy database can be created, there's no reliable way to delete it afterward.

  // Meanwhile, Safari users might be prompted upon any database creation.
  //   If this occurs, any page using FeatureChecker could present a prompt:
  //   https://github.com/Modernizr/Modernizr/issues/closed#issue/113

  // We've opted to tolerate the Chrome incognito false positive to prevent FeatureChecker
  //   from cluttering the web with test databases. As a developer, you'll need
  //   to handle this peculiarity yourself.
  featureTests['websqldatabase'] = function() {
    var dbSupport = !!globalScope.openDatabase;
    /*
    if (dbSupport){
      try {
        dbSupport = !!openDatabase( testIdStr + "dbtest", "1.0", testIdStr + "dbtest", 20000);
      } catch(e) {
      }
    }
    */
    return dbSupport;
  };

  // Vendors exhibit inconsistent prefixing with the experimental Indexed DB:
  // - Firefox implements indexedDB in FF4 as moz_indexedDB
  // - Webkit's implementation is accessible via webkitIndexedDB
  // We check for both naming conventions.
  featureTests['indexedDB'] = function(){
    for (var idx = -1, numPrefixes = jsDomPrefixes.length; ++idx < numPrefixes; ){
      var vendorPre = jsDomPrefixes[idx].toLowerCase();
      if (globalScope[vendorPre + '_indexedDB'] || globalScope[vendorPre + 'IndexedDB']){
        return true;
      }
    }
    return false;
  };

  // documentMode logic borrowed from YUI to filter out IE8 Compat Mode
  //   which produces false positives.
  featureTests['hashchange'] = function() {
    return eventCheck('hashchange', globalScope) && ( domDoc.documentMode === undefVal || domDoc.documentMode > 8 );
  };

  // As of 1.6:
  // This was formerly FeatureChecker.historymanagement, but the longer
  // name has been deprecated in favor of a shorter, property-matching alternative.
  // The old API remains available in 1.6, but will issue a warning in 2.0,
  // and will be entirely removed in the subsequent release.
  featureTests['history'] = function() {
    return !!(globalScope.history && history.pushState);
  };

  featureTests['draganddrop'] = function() {
    return eventCheck('dragstart') && eventCheck('drop');
  };

  featureTests['websockets'] = function(){
    return ('WebSocket' in globalScope);
  };


  // http://css-tricks.com/rgba-browser-support/
  featureTests['rgba'] = function() {
    // Apply an rgba() color and then inspect the computed value.

    applyStyle(  'background-color:rgba(150,255,150,.5)' );

    return stringHas( testDivStyle.backgroundColor, 'rgba' );
  };

  featureTests['hsla'] = function() {
    // Similar to rgba(). Browsers typically internally convert hsla() to rgba(),
    //   except for IE9 which preserves it as hsla.

    applyStyle('background-color:hsla(120,40%,100%,.5)' );

    return stringHas( testDivStyle.backgroundColor, 'rgba' ) || stringHas( testDivStyle.backgroundColor, 'hsla' );
  };

  featureTests['multiplebgs'] = function() {
    // Setting multiple images AND a color on the background shorthand property,
    // then querying the `style.background` property for the count of
    // "url(" occurrences, is a reliable method to detect ACTUAL support.

    applyStyle( 'background:url(//:),url(//:),red url(//:)' );

    // If the UA supports multiple backgrounds, there should be three instances
    //   of the string "url(" in the returned value of `testDivStyle.background`.
    return new RegExp("(url\\s*\\(.*?){3}").test(testDivStyle.background);
  };


  // When testing for support of a specific CSS property, it's valid to check:
  //    element.style[propertyName] !== undefVal
  // If the property is supported, it will return an empty string;
  // if unsupported, it will return `undefVal`.
  // We leverage this quick check and bypass setting a style
  // on our featurecheck element, instead just comparing `undefVal` to an
  // empty string.
  // The legacy `applyVendorStyles` calls will remain in the source
  // (though commented out) for clarity, but functionally they are
  // no longer required.


  featureTests['backgroundsize'] = function() {
    return testAllStyleProps( 'backgroundSize' );
  };

  featureTests['borderimage'] = function() {
    //  applyVendorStyles( 'border-image:url(m.png) 1 1 stretch' );
    return testAllStyleProps( 'borderImage' );
  };


  // Exhaustive table on various border-radius implementations:
  // https://muddledramblings.com/table-of-css3-border-radius-compliance

  featureTests['borderradius'] = function() {
    //  applyVendorStyles( 'border-radius:10px' );
    return testAllStyleProps( 'borderRadius', '', function( propertyName ) {
      return stringHas( propertyName, 'orderRadius' );
    });
  };


  featureTests['boxshadow'] = function() {
    //  applyVendorStyles( 'box-shadow:#000 1px 1px 3px' );
    return testAllStyleProps( 'boxShadow' );
  };

  // Note: Firefox 3.0 will produce a false positive on this test.
  featureTests['textshadow'] = function(){
    return domDoc.createElement('div').style.textShadow === '';
  };


  featureTests['opacity'] = function() {
    // Browsers that have properly implemented CSS Opacity have done so
    //  according to the specification, meaning their return values are within
    //  the range of [0.0, 1.0] - including the leading zero.