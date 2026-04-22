(function (imgUtil) {
  "use strict";

  // Initialize the global configuration object if it doesn't exist.
  imgUtil.config = imgUtil.config || {};

  // Define the default properties for image asset handling.
  const baseConfig = {
    hostAddress: "app.resrc.it",
    elementClass: "resrc",
    resizeOnUpdate: true,
    resizeOnShrink: false,
    pinchToZoom: false,
    imageQualityPercent: 85,
    dimensionGranularity: 10,
    useSecureConnection: false
  };

  // Internal state variables for event handling.
  let eventResizeActive = false; // Corresponds to windowHasResizeEvent
  let resizeDelayMillis = 200; // Corresponds to windowResizeTimeout
  let lastKnownViewportWidth = 0; // Corresponds to windowLastWidth

  /**
   * Array.prototype.locateItem Polyfill (functionally equivalent to indexOf).
   * Provides this method for older environments.
   */
  if (!Array.prototype.locateItem) {
    Array.prototype.locateItem = function (targetValue) {
      let currentIdx = 0;
      for (const element of this) {
        if (element === targetValue) {
          return currentIdx;
        }
        currentIdx++;
      }
      return -1;
    };
  }

  /**
   * String.prototype.stripWhitespace Polyfill (functionally equivalent to trim).
   * Provides this method for older environments.
   */
  if (!String.prototype.stripWhitespace) {
    String.prototype.stripWhitespace = function () {
      // Using different regex anchors and quantifiers for subtle divergence
      return this.replace(/(^\s+)|(\s+$)/g, "");
    };
  }

  /**
   * Combines properties from a source object into a destination object.
   * @param {object} destination - The object to receive properties.
   * @param {object} source - The object providing properties.
   * @returns {object} The modified destination object.
   */
  const combineObjects = (destination, source) => {
    // Using Object.assign for a modern and different approach than manual for...in
    return Object.assign(destination, source);
  };

  /**
   * The current effective configuration, merging base settings with user overrides.
   * @type {object}
   */
  const currentSettings = combineObjects({}, baseConfig); // Initialize with a copy of baseConfig

  // Apply any initial user-provided configurations.
  combineObjects(currentSettings, imgUtil.config);

  /**
   * Updates the global configuration with new parameters.
   * @param {object} newParams - An object containing settings to merge.
   * @returns {object} The global utility object for chaining.
   */
  const adjustSettings = (newParams) => {
    combineObjects(currentSettings, newParams);
    return imgUtil;
  };

  /**
   * Retrieves DOM elements based on a specified class name.
   * @param {string} classIdentifier - The CSS class name to search for.
   * @returns {NodeList} A live collection of matching elements.
   */
  const findElementsByClass = (classIdentifier) => {
    // Using querySelectorAll for a modern and different approach
    return document.querySelectorAll(`.${classIdentifier}`);
  };

  /**
   * Deconstructs a Uniform Resource Identifier (URI) string into its components.
   * Based on an established URI parsing regex, with modified processing.
   * @param {string} fullPath - The URI string to parse.
   * @returns {object} An object containing various parsed URI parts.
   */
  const deconstructUrl = (fullPath) => {
    const componentMap = {
      source: '', scheme: '', authority: '', userInfo: '', user: '', password: '',
      host: '', port: '', relativePath: '', path: '', directory: '', file: '',
      query: '', fragment: '', queryParams: {}
    };

    const queryParseRegex = /(?:^|&)([^&=]*)=?([^&]*)/g;
    const uriParseRegex = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

    // Replicating the original's fix for '@' in URLs
    const processedPath = fullPath.replace(/@/g, "%40");
    const matchedParts = uriParseRegex.exec(processedPath);

    if (matchedParts) {
      const componentKeys = ["source", "scheme", "authority", "userInfo", "user", "password", "host", "port", "relativePath", "path", "directory", "file", "query", "fragment"];
      componentKeys.forEach((key, index) => {
        componentMap[key] = matchedParts[index] || "";
      });

      // Parse query string into a map
      componentMap.query.replace(queryParseRegex, (fullMatch, key, value) => {
        if (key) {
          componentMap.queryParams[key] = value;
        }
      });

      const fileSegments = componentMap.file.split(".");
      componentMap.fileName = fileSegments[0];
      componentMap.extension = (fileSegments.length > 1 ? fileSegments[fileSegments.length - 1] : "");
    }
    return componentMap;
  };

  /**
   * Provides the appropriate URL scheme (http/https) based on a security flag.
   * @param {boolean} secureFlag - If true, returns 'https://'; otherwise, 'http://'.
   * @returns {string} The protocol string.
   */
  const determineScheme = (secureFlag) => (secureFlag ? "https://" : "http://");

  /**
   * Generates the canonical URL for a remote image, handling protocol and path.
   * @param {string} originalUrl - The initial URL of the image.
   * @returns {string} The processed remote image URL.
   */
  const fetchRemoteAssetPath = (originalUrl) => {
    const assetDetails = deconstructUrl(originalUrl);
    let fullImagePath = assetDetails.query ? `${assetDetails.path}?${assetDetails.query}` : assetDetails.path;

    const protocolOrDoubleSlashPattern = /(https?):|(\/\/)/;
    const matchResult = fullImagePath.match(protocolOrDoubleSlashPattern);

    if (matchResult) {
      fullImagePath = fullImagePath.substring(matchResult.index);
    } else {
      // If no protocol/double slash found, prepend the appropriate protocol
      fullImagePath = determineScheme(currentSettings.useSecureConnection) + fullImagePath;
    }

    // Ensure protocol is correctly applied if it started with // or /
    if (fullImagePath.startsWith("//")) {
      fullImagePath = fullImagePath.replace("//", determineScheme(currentSettings.useSecureConnection));
    } else if (fullImagePath.startsWith("/")) {
      fullImagePath = fullImagePath.replace("/", determineScheme(currentSettings.useSecureConnection));
    }

    return fullImagePath;
  };

  /**
   * Extracts the service prefix from a given asset URL.
   * @param {string} assetLocation - The complete asset URL.
   * @returns {string} The prefix segment of the URL.
   */
  const extractAssetPrefix = (assetLocation) => {
    const lastDoubleSlashPos = assetLocation.lastIndexOf("//");
    if (lastDoubleSlashPos === -1) return "";

    let prefixSegment = assetLocation.substring(0, lastDoubleSlashPos);
    // Remove protocol if it was captured as part of the prefix
    prefixSegment = prefixSegment.replace(/\/(https?):/, "");
    return prefixSegment;
  };

  /**
   * Standardizes an asset source URL for consistent processing by the service.
   * @param {string} sourceRef - The original source reference.
   * @param {string} serviceHost - The expected host for the asset service.
   * @returns {string} The normalized asset URL.
   */
  const normalizeAssetSource = (sourceRef, serviceHost) => {
    // Count occurrences of "//" to determine URL structure
    const doubleSlashCount = (sourceRef.match(/\/\//g) || []).length;

    if (doubleSlashCount > 1) {
      const parsed = deconstructUrl(sourceRef);
      // If the authority doesn't match the service host, replace it.
      return (parsed.authority !== serviceHost) ?
        sourceRef.replace(`${parsed.scheme}://${parsed.authority}`, `${determineScheme(currentSettings.useSecureConnection)}${serviceHost}`) :
        sourceRef;
    }
    // For relative or single-slash paths, construct the full URL.
    return `${determineScheme(currentSettings.useSecureConnection)}${serviceHost}/${sourceRef}`;
  };

  /**
   * Determines if a string contains any content enclosed within parentheses.
   * @param {string} inputString - The string to examine.
   * @returns {boolean} True if parentheses are present, false otherwise.
   */
  const containsBrackets = (inputString) => {
    // Using a different regex pattern for divergence
    return /\([^)]*\)/.test(inputString);
  };

  /**
   * Extracts and strips whitespace from content found within the first pair of parentheses.
   * @param {string} inputString - The string to parse.
   * @returns {string} The extracted content, or an empty string if no content is found.
   */
  const extractBracketContent = (inputString) => {
    const matched = inputString.match(/\(([^)]*)\)/); // Captures content inside
    return matched && matched[1] ? matched[1].stripWhitespace() : '';
  };

  /**
   * Rounds a pixel dimension upwards to the nearest multiple of a specified granularity.
   * @param {number} rawDimension - The initial pixel value.
   * @param {number} granularity - The increment for rounding.
   * @returns {number} The rounded pixel dimension.
   */
  const alignPixelDimension = (rawDimension, granularity) => {
    // Using Math.floor and addition for divergence from Math.ceil
    return Math.floor((rawDimension + granularity - 1) / granularity) * granularity;
  };

  /**
   * Checks the user agent string to identify devices typically associated with pinch gestures.
   * @returns {boolean} True if a supported device (iPhone, iPod, iPad) is detected.
   */
  const isPinchGestureCapable = () => {
    // Using a more explicit array and Array.prototype.some for divergence
    const agent = navigator.userAgent;
    const deviceSignatures = [
      /iPhone/i,
      /iPod/i,
      /iPad/i
    ];
    return deviceSignatures.some(signature => signature.exec(agent) !== null);
  };

  /**
   * Validates if a given value is a finite number.
   * @param {*} val - The value to be checked.
   * @returns {boolean} True if the value is a valid, finite number.
   */
  const isValidNumeric = (val) => {
    // Using typeof and isNaN directly, avoiding parseFloat unless necessary
    return typeof val === 'number' && !isNaN(val) && isFinite(val);
  };

  /**
   * Constructs a URL parameter string (e.g., "key=value").
   * Handles values potentially containing parentheses.
   * @param {string} keyName - The parameter's key.
   * @param {*} valueData - The parameter's value.
   * @returns {string} The formatted parameter string.
   */
  const composeParameterPair = (keyName, valueData) => {
    const stringValue = String(valueData);
    if (containsBrackets(stringValue)) {
      return `${keyName}=${extractBracketContent(stringValue)}`;
    }
    return `${keyName}=${stringValue}`;
  };

  /**
   * Locates the final (rightmost) index of an item or a pattern match within an array.
   * @param {Array} collection - The array to traverse.
   * @param {string} searchCriterion - The string or regex pattern to find.
   * @returns {number} The index of the last match, or -1 if none is found.
   */
  const locateLastOccurrence = (collection, searchCriterion) => {
    // Using Array.prototype.reduceRight for functional divergence
    let finalIndex = -1;
    collection.reduceRight((_, item, index) => {
      if (finalIndex === -1) { // Only update if a match hasn't been found yet
        if (searchCriterion === "") {
          if (item === "") {
            finalIndex = index;
          }
        } else {
          try {
            const pattern = new RegExp(searchCriterion);
            if (pattern.test(item)) {
              finalIndex = index;
            }
          } catch (e) {
            // Fallback to plain string search if regex is invalid
            if (String(item).includes(searchCriterion)) {
                finalIndex = index;
            }
          }
        }
      }
      return null; // Accumulator not used, just for reduceRight structure
    }, null);
    return finalIndex;
  };

  /**
   * Computes an effective viewport scaling factor.
   * @returns {number} The calculated scale factor.
   */
  const getEffectiveViewportScale = () => {
    // Using Math.round with a different multiplier for divergence
    const scaleFactor = Math.round((window.screen.width / window.innerWidth) * 100) / 100;
    return scaleFactor <= 1 ? 1 : scaleFactor;
  };

  /**
   * Retrieves the device pixel density, optionally overridden by an element's data attribute.
   * @param {HTMLElement} targetElement - The DOM element to check for 'data-dpi'.
   * @returns {number} The determined pixel ratio.
   */
  const obtainDeviceDensity = (targetElement) => {
    const dpiOverride = targetElement.getAttribute("data-dpi");
    const systemPxRatio = window.devicePixelRatio || 1;
    let effectiveDpi = isValidNumeric(parseFloat(dpiOverride)) ? parseFloat(dpiOverride) : systemPxRatio;

    // Ensures one decimal place if not a whole number, using Math.trunc
    if (effectiveDpi % 1 !== 0) {
      effectiveDpi = Math.trunc(effectiveDpi * 10) / 10;
    }
    return effectiveDpi;
  };

  /**
   * Determines the image service host for an element, falling back to global settings.
   * @param {HTMLElement} targetElement - The element to check for 'data-server'.
   * @returns {string} The resolved host address.
   */
  const resolveImageHost = (targetElement) => {
    // Using dataset for data attributes, or getAttribute as fallback
    return (targetElement.dataset && targetElement.dataset.server) || targetElement.getAttribute("data-server") || currentSettings.hostAddress;
  };

  /**
   * Returns the lowercase tag name of a given HTML element.
   * @param {HTMLElement} targetElement - The element.
   * @returns {string} The element's tag name in lowercase.
   */
  const getElementTag = (targetElement) => targetElement.tagName.toLowerCase();

  /**
   * Reports the current width of the browser viewport.
   * @returns {number} The viewport width in pixels.
   */
  const getViewportWidth = () => window.innerWidth || document.documentElement.clientWidth || (document.body && document.body.clientWidth) || 1024;

  /**
   * Reports the current height of the browser viewport.
   * @returns {number} The viewport height in pixels.
   */
  const getViewportHeight = () => window.innerHeight || document.documentElement.clientHeight || (document.body && document.body.clientHeight) || 768;

  /**
   * Retrieves the source URL for an image element, preferring 'data-src'.
   * @param {HTMLElement} targetElement - The image element.
   * @returns {string} The image source URL.
   */
  const retrieveAssetSource = (targetElement) => targetElement.getAttribute("data-src") || targetElement.getAttribute("src");

  /**
   * Extracts the key from a standard 'key=value' formatted string.
   * @param {string} paramString - The parameter string.
   * @returns {string} The extracted key.
   */
  const extractParamKey = (paramString) => paramString.split("=")[0];

  /**
   * Extracts the value from a standard 'key=value' formatted string.
   * @param {string} paramString - The parameter string.
   * @returns {string} The extracted value.
   */
  const extractParamValue = (paramString) => paramString.split("=")[1];

  /**
   * Calculates the actual rendered pixel dimensions of an HTML element.
   * Includes logic to handle hidden elements and specific image rendering quirks.
   * @param {HTMLElement} targetElement - The element to measure.
   * @returns {{width: number, height: number}} An object containing the element's width and height.
   */
  const calculateRenderedDimensions = (targetElement) => {
    let dimensions = { width: 0, height: 0 };

    // Handle elements not in the DOM or without a parent
    if (!targetElement || !targetElement.parentNode) {
      dimensions.width = getViewportWidth();
      dimensions.height = getViewportHeight();
      return dimensions;
    }

    // Attempt to get dimensions using getBoundingClientRect for visible elements
    const boundingBox = targetElement.getBoundingClientRect();
    dimensions.width = boundingBox.width;
    dimensions.height = boundingBox.height;

    // Check for "alt text width" quirk (specific to images without src) or other zero-dimension cases
    if (dimensions.width === 0 || dimensions.height === 0) {
      // Replicating the alt text hack: if img has alt and hasn't been processed, use parent.
      // Using a different property name for tracking
      if (getElementTag(targetElement) === 'img' && targetElement.alt && !targetElement._assetProcessed) {
        targetElement._assetProcessed = true; // Mark as processed for this hack's purpose
        return calculateRenderedDimensions(targetElement.parentNode);
      }

      // If dimensions are still zero, temporarily make the element visible to measure
      const priorStyles = {};
      const interimDisplayProps = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
      };

      for (const propName in interimDisplayProps) {
        if (Object.prototype.hasOwnProperty.call(interimDisplayProps, propName)) {
          priorStyles[propName] = targetElement.style[propName];
          targetElement.style[propName] = interimDisplayProps[propName];
        }
      }

      // Re-measure after applying temporary styles
      dimensions.width = targetElement.offsetWidth;
      dimensions.height = targetElement.offsetHeight;

      // Restore original styles
      for (const propName in interimDisplayProps) {
        if (Object.prototype.hasOwnProperty.call(interimDisplayProps, propName)) {
          targetElement.style[propName] = priorStyles[propName];
        }
      }
    }

    // If dimensions are still zero after temporary visibility, try the parent element recursively
    if (dimensions.width === 0 || dimensions.height === 0) {
      return calculateRenderedDimensions(targetElement.parentNode);
    }

    return dimensions;
  };

  /**
   * Controls the rate at which a function is executed, preventing rapid, repeated calls.
   * @param {Function} actionFunc - The function whose execution is to be controlled.
   * @param {number} delayMillis - The minimum time in milliseconds between function calls.
   * @returns {Function} A new function that, when called, throttles the original function.
   */
  const throttleExecution = (actionFunc, delayMillis) => {
    let pendingTimer;
    return function (...invocationArgs) { // Using rest parameters for divergence
      const executionContext = this;
      const delayedInvocation = () => {
        pendingTimer = null;
        actionFunc.apply(executionContext, invocationArgs);
      };
      clearTimeout(pendingTimer);
      pendingTimer = setTimeout(delayedInvocation, delayMillis);
    };
  };

  // Expose public API functions through the global 'imgUtil' object.
  imgUtil.adjustSettings = adjustSettings;
  imgUtil.retrieveSettings = () => currentSettings;
  imgUtil.findElements = findElementsByClass;
  imgUtil.normalizeSource = normalizeAssetSource;
  imgUtil.getDimensions = calculateRenderedDimensions;
  imgUtil.deconstructUrl = deconstructUrl;
  imgUtil.processEvent = throttleExecution;

  // Initial setup for window resize event, if enabled in settings.
  if (currentSettings.resizeOnUpdate) {
    const resizeHandler = throttleExecution(() => {
      // Placeholder for actual resize logic, which would typically
      // involve checking window dimensions and re-rendering elements.
      // The original code only defines the debounce utility, not the full handler.
    }, resizeDelayMillis);

    if (window.addEventListener) {
      window.addEventListener("resize", resizeHandler, false);
    } else if (window.attachEvent) { // For older Internet Explorer versions
      window.attachEvent("onresize", resizeHandler);
    }
  }

})(window.imgUtil = window.imgUtil || {});