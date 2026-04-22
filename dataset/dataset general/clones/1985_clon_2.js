(function(assetLib) {
  "use strict";

  // Configure the asset library settings, or initialize an empty configuration object.
  assetLib.settings = assetLib.settings || {};

  // Define the default configuration parameters.
  var baseConfig = {
    hostName : "cdn.assetlib.dev",
    assetClass : "image-asset",
    resizeOnWindowChange : true,
    resizeOnShrink : false,
    pinchToZoomEnabled : false,
    pictureQuality : 92,
    unitSnapping : 10,
    useHttps : false
  };

  // Initialize various window-related state variables.
  var browserHasResizeHandler = false;
  var browserResizeDelay = 200;
  var browserPreviousWidth = 0;

  /*
   * Array.prototype.indexOf Polyfill.
   * This method was introduced in the ECMA-262 standard, 5th edition.
   * It may not be available in older browser environments,
   * for example, Internet Explorer versions prior to 9.
   */
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchItem) {
      for (var k = 0; k < this.length; k++) {
        if (this[k] === searchItem) {
          return k;
        }
      }
      return -1;
    };
  }

  /*
   * String.prototype.trim Polyfill.
   * The 'trim' method was added to the ECMA-262 standard in its 5th edition.
   * It might not be available in all browsers,
   * for example, in Internet Explorer versions earlier than 9.
   */
  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }

  /**
   * Combines properties from a source object into a target object.
   * @param targetObj - The object to receive properties.
   * @param sourceObj - The object whose properties will be copied.
   * @returns {Object} The modified target object.
   */
  var combineObjects = function (targetObj, sourceObj) {
    if (targetObj && sourceObj) {
      for (var propName in sourceObj) {
        if (sourceObj.hasOwnProperty(propName)) {
          targetObj[propName] = sourceObj[propName];
        }
      }
    }
    return targetObj;
  };

  /**
   * Defines the active configuration for the asset library.
   * This object is a result of merging the default settings with any user-provided overrides.
   * @type {Object}
   */
  var currentSettings = combineObjects(baseConfig, assetLib.settings);

  /**
   * Helper function for updating the asset library's configuration.
   * It merges new options over existing values.
   * @param addedSettings {Object} - An object containing new settings to merge.
   * @returns {Object} The main asset library object for chaining.
   */
  var updateAssetSettings = function(addedSettings) {
    combineObjects(currentSettings, addedSettings);
    return assetLib;
  };

  /**
   * Provides a cross-browser compatible implementation for `getElementsByClassName`.
   * This DOM method may not be available in older browser versions,
   * such as Internet Explorer prior to version 9.
   * @param cssClass - The class name to search for.
   * @returns {Array|NodeList} A collection of elements matching the specified class.
   */
  var findElementsByClass = function (cssClass) {
    if (typeof document.getElementsByClassName !== "undefined") {
      return document.getElementsByClassName(cssClass);
    } else {
      var results = [];
      var classPattern = new RegExp("(^|\\s)" + cssClass + "(\\s|$)");
      var allElements = document.getElementsByTagName("*");
      for (var j = 0, total = allElements.length; j < total; j++) {
        if (allElements[j].className.match(classPattern)) {
          results.push(allElements[j]);
        }
      }
      return results;
    }
  };

  /**
   * Deconstructs a well-formed Uniform Resource Identifier (URI) into its constituent components.
   * Acknowledgment to Steven Levithan <http://stevenlevithan.com> (MIT License).
   * @property authority
   * @property params
   * @property folder
   * @param urlString - The URI string to parse.
   * @returns {Object} An object containing various parts of the URI.
   */
  var analyzeUrl = function (urlString) {
    var urlSchema = {
      partsMap : [ "fullString", "scheme", "authority", "credentialInfo", "userIdentifier", "userSecret", "domain", "portNumber", "relativePath", "pathOnly", "folder", "fileBase", "params", "fragment" ],
      querySpec : {
        keyName : "queryParameters",
        regexExtractor : /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      urlRegex : /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    };
    // Correctly handle '@' symbols within URLs, for example: http://example.com/@profile.
    urlString = urlString.replace(/@/g, "%40");
    var matches = urlSchema.urlRegex.exec(urlString);
    var urlData = {};
    var count = 14;
    while (count--) {
      urlData[urlSchema.partsMap[count]] = matches[count] || "";
    }
    urlData[urlSchema.querySpec.keyName] = {};
    urlData[urlSchema.partsMap[12]].replace(urlSchema.querySpec.regexExtractor, function (matchAll, paramKey, paramVal) {
      if (paramKey) {
        urlData[urlSchema.querySpec.keyName][paramKey] = paramVal;
      }
    });
    var fileParts = urlData.fileBase.split(".");
    urlData.baseName = fileParts[0];
    urlData.extension = ( fileParts.length > 1 ? fileParts[fileParts.length - 1] : "" );
    return urlData;
  };

  /**
   * Determines the appropriate URL protocol (scheme) based on the secure flag.
   * @param secureFlag - A boolean indicating whether to use HTTPS.
   * @returns {string} The protocol string, either "https://" or "http://".
   */
  var retrieveScheme = function (secureFlag) {
    if (secureFlag === true) {
      return "https://";
    }
    return "http://";
  };

  /**
   * Constructs the full URL for a remote image, serving as a fallback.
   * @param imageUrl - The base URL of the image.
   * @returns {string} The complete remote image URL.
   */
  var fetchRemotePicturePath = function (imageUrl) {
    var fullPath;
    var patternToFind;
    var matchPosition;
    var finalResult;
    var analyzedUrl = analyzeUrl(imageUrl);
    fullPath = analyzedUrl.params ? analyzedUrl.pathOnly + "?" + analyzedUrl.params : analyzedUrl.pathOnly;
    patternToFind = /(https?):|(\/\/)/;
    matchPosition = fullPath.search(patternToFind);
    finalResult = fullPath.substring(matchPosition);
    if (finalResult.indexOf("://") === -1) {
      finalResult = finalResult.replace("//", retrieveScheme(currentSettings.useHttps));
    }
    if (finalResult.charAt(0) === "/") {
      finalResult = finalResult.replace("/", retrieveScheme(currentSettings.useHttps));
    }
    return finalResult;
  };

  /**
   * Retrieves the prefix path that should be prepended to a remote image URL.
   * @param sourceUrl - The original URL of the image.
   * @returns {string} The calculated path prefix.
   */
  var retrieveAssetPrefix = function (sourceUrl) {
    var sourcePath;
    var searchString;
    var lastPosition;
    var protocolRegex;
    var resultString;
    sourcePath = sourceUrl;
    searchString = "//";
    protocolRegex = /\/(https?):/;
    lastPosition = sourcePath.lastIndexOf(searchString);
    resultString = sourcePath.slice(0, lastPosition).replace(protocolRegex, "");
    return resultString;
  };

  /**
   * Processes an image source path to ensure it conforms to a consistent URL format.
   *
   * 1. If the URL contains multiple occurrences of "//" beyond the initial scheme (e.g., "http://").
   *    A. It checks if the image's authority (domain) matches the configured asset host.
   *    B. If there's a mismatch, the URL is updated to use the correct asset host.
   *
   * 2. If no additional "//" are found after the scheme.
   *    A. The full URL is constructed by combining the protocol, asset host, and the source path.
   *
   * @param sourcePath - The original image source string.
   * @param targetHost - The intended asset host server.
   * @returns {string} The URL formatted uniformly.
   */
  var formatSourcePath = function (sourcePath, targetHost) {
    if (sourcePath.match(/\/\//g).length > 1) {
      var analyzedUrl = analyzeUrl(sourcePath);
      return analyzedUrl.authority !== targetHost ? sourcePath.replace(analyzedUrl.scheme + "://" + analyzedUrl.authority, retrieveScheme(currentSettings.useHttps) + targetHost) : sourcePath;
    }
    return retrieveScheme(currentSettings.useHttps) + targetHost + "/" + sourcePath;
  };

  /**
   * Checks if the provided string contains any characters enclosed in parentheses.
   * @param inputString - The string to be evaluated.
   * @returns {boolean} True if parentheses are found, otherwise false.
   */
  var containsBrackets = function (inputString) {
    var bracketPattern = /\((.*?)\)/g;
    return bracketPattern.test(inputString);
  };

  /**
   * Extracts the content located inside parentheses within a given string.
   * @param textInput - The string from which to extract content.
   * @returns {string} The extracted content, as a comma-separated string if multiple matches.
   */
  var extractContentInBrackets = function (textInput) {
    var resultMatch;
    var collectedItems = [];
    var bracketRegex = /\((.*?)\)/g;
    while ((resultMatch = bracketRegex.exec(textInput)) !== null) {
      collectedItems.push(resultMatch[1].trim());
    }
    return collectedItems.toString();
  };

  /**
   * Rounds a numerical dimension value based on a specified increment, typically for pixel alignment.
   * @param dimensionValue - The original size in pixels.
   * @param roundingIncrement - The value to round to the nearest multiple of.
   * @returns {Number} The rounded dimension value.
   */
  var roundDimension = function (dimensionValue, roundingIncrement) {
    return Math.ceil(dimensionValue / roundingIncrement) * roundingIncrement;
  };

  /**
   * Determines if the current user agent corresponds to a device that supports
   * pinch-to-zoom functionality for assets (e.g., iPhone, iPod, or iPad).
   * @returns {boolean} True if the device is compatible, false otherwise.
   */
  var isPinchZoomCompatibleDevice = function () {
    return (/iPhone|iPod|iPad/i).test(navigator.userAgent);
  };

  /**
   * Validates if the given input value is a finite number.
   * @param inputVal - The value to check.
   * @returns {boolean} True if the value is a number, false otherwise.
   */
  var checkIsNumeric = function (inputVal) {
    return !isNaN(parseFloat(inputVal)) && isFinite(inputVal);
  };

  /**
   * Creates a key-value pair string for a URL parameter,
   * handling cases where the value might be enclosed in parentheses.
   * @param keyName - The name of the parameter.
   * @param paramValue - The value of the parameter.
   * @returns {string} The formatted parameter string (e.g., "key=value").
   */
  var createParameterPair = function (keyName, paramValue) {
    if (containsBrackets(paramValue)) {
      return keyName + "=" + extractContentInBrackets(paramValue);
    }
    return keyName + "=" + paramValue;
  };

  /**
   * Finds the last index position of a specified string (or an empty string) within an array.
   * @param dataArray - The array to search within.
   * @param searchString - The string to find.
   * @returns {Number} The last found index, or -1 if the string is not present.
   */
  var findLastArrayIndex = function (dataArray, searchString) {
    var idx = dataArray.length;
    while (idx--) {
      if (searchString === "") {
        if (dataArray[idx] === "") {
          return idx;
        }
      } else {
        var searchPattern = new RegExp(searchString);
        var matchResult = searchPattern.exec(dataArray[idx]);
        if (matchResult !== null) {
          return idx;
        }
      }
    }
    return -1;
  };

  /**
   * Calculates a zoom or scaling multiplier based on the device screen width
   * relative to the browser's inner window width.
   * @returns {Number} The computed scaling factor.
   */
  var calculateViewportZoomFactor = function () {
    var scaleFactor = Math.round((screen.width / window.innerWidth) * 10) / 10;
    return scaleFactor <= 1 ? 1 : scaleFactor;
  };

  /**
   * Retrieves the pixel density ratio for a given HTML element.
   * It prioritizes a 'data-density' attribute on the element;
   * otherwise, it falls back to the device's native pixel ratio.
   * @param targetElement - The HTML element to inspect.
   * @returns {Number} The effective pixel density (DPI).
   */
  var retrievePixelDensity = function (targetElement) {
    var densityOverride = targetElement.getAttribute("data-density");
    var nativeDeviceRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    var effectiveDensity = checkIsNumeric(densityOverride) === true ? parseFloat(densityOverride) : nativeDeviceRatio;
    if (effectiveDensity % 1 !== 0) {
      effectiveDensity = effectiveDensity.toFixed(1);
    }
    return effectiveDensity;
  };

  /**
   * Obtains the asset server hostname associated with an element.
   * It first checks for a 'data-host' attribute on the element,
   * then defaults to the globally configured `currentSettings.hostName`.
   * @param elementNode - The HTML element to query.
   * @returns {string} The determined server hostname.
   */
  var getElementHost = function (elementNode) {
    return elementNode.getAttribute("data-host") || currentSettings.hostName;
  };

  /**
   * Retrieves the tag name of an HTML element, converted to lowercase.
   * @param htmlElement - The HTML element.
   * @returns {string} The lowercase tag name (e.g., "img", "div").
   */
  var fetchElementTag = function (htmlElement) {
    return htmlElement.tagName.toLowerCase();
  };

  /**
   * Determines the current width of the browser's viewport.
   * @returns {Number} The viewport width in pixels, defaulting to 1080 if undetectable.
   */
  var retrieveViewportWidth = function () {
    return document.documentElement.clientWidth || document.body && document.body.clientWidth || 1080;
  };

  /**
   * Determines the current height of the browser's viewport.
   * @returns {Number} The viewport height in pixels, defaulting to 800 if undetectable.
   */
  var retrieveViewportHeight = function () {
    return document.documentElement.clientHeight || document.body && document.body.clientHeight || 800;
  };

  /**
   * Fetches the image source URL for an element.
   * It prioritizes the 'data-source' attribute, then falls back to the standard 'src' attribute.
   * @param imageElement - The HTML image element.
   * @returns {string} The image source URL.
   */
  var getImageSource = function (imageElement) {
    return imageElement.getAttribute("data-source") || imageElement.getAttribute("src");
  };

  /**
   * Extracts the key name from a key-value parameter string (e.g., "key=value" -> "key").
   * @param paramString - The full parameter string.
   * @returns {string} The extracted parameter key.
   */
  var extractParameterKey = function(paramString) {
    return paramString.split("=")[0];
  };

  /**
   * Extracts the value from a key-value parameter string (e.g., "key=value" -> "value").
   * @param inputParamString - The full parameter string.
   * @returns {string} The extracted parameter value.
   */
  var extractParameterValue = function(inputParamString) {
    return inputParamString.split("=")[1];
  };

  /**
   * Calculates an HTML element's rendered pixel dimensions (width and height).
   * It includes a workaround for images with `alt` attributes but no `src`.
   * @param targetElement - The HTML element to measure.
   * @returns {Object} An object containing `width` and `height` properties.
   */
  var getRenderedDimensions = function (targetElement) {
    var dimensions = {};
    dimensions.width = targetElement.offsetWidth;
    dimensions.height = targetElement.offsetHeight;
    if (targetElement.parentNode === null) {
      dimensions.width = retrieveViewportWidth();
      dimensions.height = retrieveViewportHeight();
      return dimensions;
    }

    if (dimensions.width !== 0 || dimensions.height !== 0) {
      /*
       * This is an initial workaround for image elements that have an 'alt' attribute but lack an 'src' tag.
       * Example: `<img data-source="image.jpg" alt="A descriptive image"/>`
       * In such cases, without a parseable 'src', the browser might incorrectly report the width of the 'alt' text (e.g., 20px).
       * This behavior is surprising but logical within browser rendering. We initially return the parent node's dimensions.
       * On subsequent processing rounds, this specific logic is bypassed, and the correct values are returned.
       */
      if (targetElement.alt && !targetElement.assetProcessed) {
        targetElement.assetProcessed = true;
        return getRenderedDimensions(targetElement.parentNode);
      }
      return dimensions;
    } else {
      var calculatedVal;
      var styleProp;
      var originalStyles = {};
      var tempStyles = { position : "absolute", visibility : "hidden", display : "block" };
      for (styleProp in tempStyles) {
        if (tempStyles.hasOwnProperty(styleProp)) {
          originalStyles[styleProp] = targetElement.style[styleProp];
          targetElement.style[styleProp] = tempStyles[styleProp];
        }
      }
      calculatedVal = dimensions;
      for (styleProp in tempStyles) {
        if (tempStyles.hasOwnProperty(styleProp)) {
          targetElement.style[styleProp] = originalStyles[styleProp];
        }
      }
      if (calculatedVal.width === 0 || calculatedVal.height === 0) {
        return getRenderedDimensions(targetElement.parentNode);
      } else {
        return calculatedVal;
      }
    }
  };

  /**
   * Implements a throttling mechanism for function calls,
   * ensuring the function is not executed more frequently than a specified delay.
   * @param callbackFn - The function to be throttled.
   * @param delayMs - The minimum time (in milliseconds) between consecutive executions.
   * @returns {Function} A new function that wraps the original with throttling logic.
   */
  var throttleExecution = function (callbackFn, delayMs) {
    var timerId;
    return function () {
      var currentContext = this;
      var functionArgs = arguments;
      var executeLater = function () {
        timerId = null;
        callbackFn.apply(currentContext, functionArgs);
      };
      clearTimeout(timerId);
      timerId = setTimeout(executeLater, delayMs);