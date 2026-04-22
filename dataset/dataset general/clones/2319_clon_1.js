SugarAds = {
  /*
   * Configuration constants for Sugar Ads module.
   * These define various IDs, class names, and attribute names
   * used throughout the ad rendering process.
   */
  adDivCssClassName:  'sugarad',
  adDivIdPrefix:      'sugarad-',
  adIframeIdSuffix:   '-iframe',

  adDivWidthAttrib:   'data-sugar-ad_width',
  adDivHeightAttrib:  'data-sugar-ad_height',

  analytics:        false, // Flag to enable/disable analytics tracking.
  fifurl:           '/sugarfif.html?3', // URL for the friendly iframe.

  urlRandLength:    12,
  urlRandNum:       0,

  adsData:          {},      // Stores general ad targeting data.
  adCreatives:      {},      // Holds creative HTML/JS for ads.
  adJsUrls:         {},      // Stores URLs for JavaScript-based ads.

  stitialOverlayId:       'sugarad-stitial-overlay',
  stitialHtmlElementClass: 'sugarad-stitial-open',
  stitialTimeout:         10000, // Stitial display duration in milliseconds.
  stitialAdType:          false, // Type of stitial ad, if any.

  adServer:         false, // Currently selected ad server.

  /*
   * Definitions for various ad servers supported.
   * Each server object must provide `getUrl` and `jsonpCallback` methods.
   */
  adServers: {
    ignadwrapper: {
      /**
       * Constructs the URL for fetching ads from IGN Ad Wrapper.
       * @param {object} sugar - Reference to the SugarAds object.
       * @param {Array<string>} adsToFetch - List of ad types to fetch.
       * @returns {string} The complete URL for the ad request.
       */
      getUrl: function ( sugar, adsToFetch ) {
        var data = sugar.adsData; /* Local reference to ad data. */

        var url = 'http://wrapper.ign.com/services/ads/pagetype/' + data.pagetype + '/sizes/' + adsToFetch.toString() + '.js?callback=?';

        // Examine the current page's URL for special parameters.
        var currentPageUrl = document.location;

        if (currentPageUrl.search.indexOf('special') != -1) {
          var queryParams = currentPageUrl.search.substr(1).split('&');

          for (var i = 0, len = queryParams.length; i < len; i++) {
            if (queryParams[i].indexOf('special') != -1) {
              url += '&' + queryParams[i];
            }
          }
        }

        /* Iterate through all ad data parameters and append them to the URL. */
        for (var param in data) {
          // 'pagetype' is already integrated into the URL path.
          if (param == 'pagetype') {
            continue; // Skip this parameter.
          }

          var val = data[param];

          // Handle array-type values by encoding each element.
          if (sugar._isArray(val)) {
            for (var i = 0, len = val.length; i < len; i++) {
              url += '&' + param + '=' + encodeURIComponent(val[i]);
            }
          }
          // For single values, just encode and append.
          else {
            url += '&' + param + '=' + encodeURIComponent(val);
          }
        }

        // Include the document referrer if available.
        var referrer = document.referrer;

        if (referrer != '') {
          url += '&r=' + encodeURIComponent(referrer);
        }

        return url;
      },

      /**
       * JSONP callback handler for IGN Ad Wrapper responses.
       * This function processes the received JSON and sets up ad creatives.
       * @param {object} sugar - Reference to the SugarAds object.
       * @param {Array<string>} adsToRender - List of ad types that were requested.
       * @returns {function} A function that takes the JSON response.
       */
      jsonpCallback: function ( sugar, adsToRender ) {
        return function ( json ) {
          var stitialSize = 'prestitial'; /* Default identifier for a prestitial ad. */

          // Populate the `adCreatives` hash with the fetched ad creatives.
          for (var i = 0, len = json.length; i < len; i++) {
            // Determine if the current ad item is a stitial.
            if (json[i].size.substr(-7) == 'stitial') {
              // Check if it's a valid stitial with an impression tracker.
              if (json[i].impressionTracker == false) {
                sugar.stitialAdType = stitialSize; // Mark stitial as active.
                sugar.adCreatives[stitialSize] = json[i].creative; // Store creative.
              } else {
                sugar.adCreatives[stitialSize] = ''; // No creative for this stitial.
              }
            } else {
              // Store regular ad creatives by their size.
              sugar.adCreatives[json[i].size] = json[i].creative;
            }
          }
          // After processing, invoke the general fetch callback.
          sugar._fetchAdsCallback(adsToRender);
        };
      }
    },

    dfp: {
      /* TODO: The DFP ad server integration needs to be completed here. */
      getUrl: function ( adsToFetch, data ) {
        return 'http://example.com/ads/' + adsToFetch.toString() + '.jsonp';
      },

      jsonpCallback: function ( sugar, adsToRender ) {
        return function ( json ) {
          /* Placeholder: Logic to populate sugar.adCreatives with DFP creatives. */
          // Currently, this is an empty function body and needs implementation.
        };
      }
    }
  },

  /**
   * Initiates the rendering process for a given set of ad types.
   * Handles single ad type strings by converting them into an array.
   * @param {string|Array<string>} adsToRender - Ad type(s) to be rendered.
   */
  renderAds: function ( adsToRender ) {
    // Ensure `adsToRender` is always an array for consistent processing.
    if ( typeof adsToRender == 'string' ) {
      adsToRender = new Array(adsToRender);
    }

    // Decide whether to use ad creatives or direct JS URLs based on adServer configuration.
    if ( this.adServer != false ) {
      this._renderAdCreatives(adsToRender);
    } else {
      this._renderAdJsUrls(adsToRender);
    }
  },

  /**
   * Displays the prestitial/stitial overlay.
   * This involves setting a class on the HTML element and making the overlay visible.
   */
  showStitial: function () {
    /* Apply a special class to the page's root HTML element.
     * This provides styling hooks for the overlay and allows managing z-index
     * issues with elements like Flash content.
     */
    var htmlElement = document.getElementsByTagName('html')[0];
    var stitialOverlayElement = document.getElementById(this.stitialOverlayId);

    htmlElement.className = this.stitialHtmlElementClass;
    stitialOverlayElement.style.display = 'block'; // Make the overlay visible.

    // Configure a timeout to automatically hide the stitial after a set duration.
    this.stitialSetTimeout = setTimeout(
      (function ( sugar ) {
        return function () {
          sugar.hideStitial();
        };
      })(this),
      this.stitialTimeout
    );
  },

  /**
   * Hides the prestitial/stitial overlay.
   * Clears any active timers and reverts the page's HTML element styling.
   */
  hideStitial: function () {
    // Cancel the auto-hide timer if the stitial was closed manually.
    clearTimeout(this.stitialSetTimeout);

    // Remove the special styling from the HTML element.
    var htmlElement = document.getElementsByTagName('html')[0];
    var stitialOverlayElement = document.getElementById(this.stitialOverlayId);

    htmlElement.className = ''; // Reset the class.
    stitialOverlayElement.style.display = 'none'; // Conceal the overlay.

    // Proceed with rendering ads that were delayed by the stitial.
    this.renderAdsDelayedByStitial();
  },

  /**
   * A placeholder callback function for ads that need to be rendered
   * after a stitial ad has been hidden. This is dynamically defined
   * when a stitial is present.
   */
  renderAdsDelayedByStitial: function () {
    // This function will be assigned a concrete implementation if a stitial ad is encountered.
  },

  /**
   * Sets the `fifwidth` and `fifheight` properties on a frame element.
   * These properties are custom and used internally for iframe dimensions.
   * @param {HTMLElement} frameElement - The iframe element.
   * @param {number} w - The desired width.
   * @param {number} h - The desired height.
   */
  setFifDim: function ( frameElement, w, h ) {
    if ( typeof w == 'number' ) frameElement.fifwidth = w;
    if ( typeof h == 'number' ) frameElement.fifheight = h;
  },

  /**
   * Callback executed when a friendly iframe has loaded its content.
   * This function handles analytics tracking and applies styling.
   * @param {Window} frameWindow - The window object of the loaded iframe.
   */
  fifOnload: function ( frameWindow ) {
    var timerStop = new Date().getTime(); // Record the load completion time.

    // If analytics are enabled, push an event to Google Analytics.
    if ( this.analytics ) {
      _gaq.push([
        '_trackEvent',
        'Sugar Ads',
        frameWindow.frameElement.adtype,
        frameWindow.frameElement.adjsurl,
        timerStop - frameWindow.sugarTimerStart // Calculate load duration.
      ]);
    }
    // Apply necessary styling to the ad container.
    this._stylizeAdContainer(frameWindow);
  },

  /**
   * Adjusts the styling of the ad container based on iframe dimensions.
   * Hides containers with no content to prevent layout issues.
   * @param {Window} frameWindow - The window object of the iframe.
   */
  _stylizeAdContainer: function ( frameWindow ) {
    var frameElement = frameWindow.frameElement;

    /* If the iframe has no content (width and height are zero)
     * and is currently visible, hide its parent container.
     * This prevents visual glitches from empty ad slots.
     */
    if (
      frameElement.fifwidth  == 0 &&
      frameElement.fifheight == 0 &&
      frameElement.parentNode.style.display != 'none'
    ) {
      frameElement.parentNode.style.display = 'none'; // Hide the parent div.
    } else {
      // Set dimensions for the iframe itself.
      frameElement.style.cssText += ';width:' + frameElement.fifwidth + 'px;height:' + frameElement.fifheight + 'px;';

      // Set dimensions and ensure visibility for the parent container.
      frameElement.parentNode.style.cssText = 'width:' + frameElement.fifwidth + 'px;height:auto;display:block;';
    }
  },

  /**
   * Iterates through a list of ad types and creates/appends iframes for them.
   * Includes validation to ensure ad data is available.
   * @param {Array<string>} adTypes - An array of ad type identifiers.
   */
  _flushAndPlaceAds: function ( adTypes ) {
    /* Loop over each specified ad type. */
    for (var i = 0, len = adTypes.length; i < len; i++) {
      var adType = adTypes[i];

      // Validate if a JS URL is defined for non-ad-server scenarios.
      if ( this.adServer == false && !(adType in this.adJsUrls) ) {
        this._warn('Failed to render sugar ad. No ad js url has been defined for ad type "' + adType + '".');
        continue; // Skip to the next ad type.
      }

      // Validate if a creative is defined for ad-server scenarios.
      if ( this.adServer != false && !(adType in this.adCreatives) ) {
        this._warn('Failed to render sugar ad. No ad creative has been defined for ad type "' + adType + '".');
        continue; // Skip to the next ad type.
      }

      // Proceed to create and insert the iframe for the ad.
      this._createAndAppendFriendlyIframe(adType);
    }
  },

  /**
   * Creates a friendly iframe for a specific ad type and appends it to its container.
   * Handles pre-existing iframes to avoid layout shifts.
   * @param {string} adType - The identifier for the ad type.
   * @returns {boolean} False if the ad container is not found, otherwise implicitly true.
   */
  _createAndAppendFriendlyIframe: function ( adType ) {
    var adDivDomId = this.adDivIdPrefix + adType;
    var adContainer = document.getElementById(adDivDomId);

    // Check if the target DOM element exists.
    if ( typeof adContainer == 'undefined' || adContainer == null ) {
      this._warn('Failed to render sugar ad. No dom element with id "' + adDivDomId + '" exists.');
      return false; // Cannot proceed without a container.
    }

    // Preserve the height of a previously rendered iframe to prevent page reflow.
    var adContainerIframe = document.getElementById(adDivDomId + this.adIframeIdSuffix);

    if (
      typeof adContainerIframe != 'undefined' && adContainerIframe != null &&
      typeof adContainerIframe.fifheight != 'undefined' && adContainerIframe.fifheight != null
    ) {
      adContainer.style.height = adContainerIframe.fifheight + 'px';
    }

    // Clear any existing content within the ad container.
    adContainer.innerHTML = '';

    /* If an ad server was used and yielded an empty creative,
     * then no iframe should be created for this ad slot.
     */
    if ( this.adServer != false && this.adCreatives[adType] == '' ) {
      delete this.adCreatives[adType]; // Remove the empty creative from the hash.
      return; // Exit, no iframe needed.
    }

    // Construct the new iframe element.
    var adIframeId = adDivDomId + this.adIframeIdSuffix;
    var iframe = document.createElement('iframe');

    iframe.id = adIframeId;
    iframe.name = adIframeId;
    iframe.src = this.fifurl;
    iframe.style.border = '0px';
    iframe.width = 0;
    iframe.height = 0;
    iframe.scrolling = 'no';
    iframe.seamless = 'seamless'; // HTML5 attribute for improved integration.

    // Retrieve custom dimensions from the ad container's data attributes.
    iframe.fifwidth = adContainer.getAttribute(this.adDivWidthAttrib);
    iframe.fifheight = adContainer.getAttribute(this.adDivHeightAttrib);
    iframe.adtype = adType;

    // Assign either ad creative or JS URL based on ad server usage.
    if ( this.adServer != false ) {
      iframe.adcreative = this.adCreatives[adType];
      delete this.adCreatives[adType]; // Prevent reuse of this creative.
    } else {
      iframe.adjsurl = this.adJsUrls[adType];
    }

    // Apply specific styling for Internet Explorer compatibility.
    if ( navigator.userAgent.indexOf("MSIE") != -1 ) {
      iframe.frameBorder = '0';
      iframe.allowTransparency = 'true';
    }

    // Finally, insert the newly created iframe into the DOM.
    adContainer.appendChild(iframe);
  },

  /**
   * Renders ads by first fetching their creatives from the configured ad server.
   * Only requests creatives that are not already present in `adCreatives`.
   * @param {Array<string>} adsToRender - List of ad types to render.
   */
  _renderAdCreatives: function ( adsToRender ) {
    var adsToFetch = [];

    // Filter out ads for which we already have creatives.
    for (var i = 0, len = adsToRender.length; i < len; i++) {
      if ( !(adsToRender[i] in this.adCreatives) ) {
        adsToFetch.push(adsToRender[i]);
      }
    }

    // If there are new ads to fetch, initiate a JSONP request.
    if ( adsToFetch.length > 0 ) {
      this._jsonp(
        this.adServers[this.adServer].getUrl(this, adsToFetch),
        this.adServers[this.adServer].jsonpCallback(this, adsToRender)
      );
    } else {
      // If all creatives are already available, proceed directly to the callback.
      this._fetchAdsCallback(adsToRender);
    }
  },

  /**
   * Prepares and places ads when using direct JavaScript URLs.
   * This involves randomizing URLs and then flushing/placing ads.
   * @param {Array<string>} adsToRender - List of ad types to render.
   */
  _renderAdJsUrls: function ( adsToRender ) {
    this._randomizeAdJsUrls(); // Add cache-busting parameters.
    this._flushAndPlaceAds(adsToRender); // Create iframes for the ads.
  },

  /**
   * Central callback function invoked after ad creatives/URLs have been fetched.
   * Manages stitial ad display logic and subsequent normal ad rendering.
   * @param {Array<string>} adsToRender - The original list of ad types to render.
   */
  _fetchAdsCallback: function ( adsToRender ) {
    // Check if a stitial ad type has been identified.
    if ( this.stitialAdType != false ) {
      /* If a stitial is present, prepare a delayed rendering function
       * for all other ads, which will execute once the stitial is hidden.
       */
      var delayedAdsToRender = [];
      for (var i = 0, len = adsToRender.length; i < len; i++) {
        var adToRender = adsToRender[i];
        // Collect all non-stitial ads for later rendering.
        if ( adToRender != this.stitialAdType ) {
          delayedAdsToRender.push(adToRender);
        }
      }

      // Assign the delayed rendering logic to `renderAdsDelayedByStitial`.
      this.renderAdsDelayedByStitial = (function ( sugar ) {
        return function () {
          sugar._flushAndPlaceAds(delayedAdsToRender);
        };
      })(this);

      // Immediately flush and place only the stitial ad.
      this._flushAndPlaceAds([this.stitialAdType]);
      this.stitialAdType = false; // Reset stitial type to prevent re-execution.

      this.showStitial(); // Display the stitial overlay.
    } else {
      // If no stitial ad is defined, render all requested ads directly.
      this._flushAndPlaceAds(adsToRender);
    }
  },

  /**
   * Modifies ad JavaScript URLs to include a unique random query string parameter.
   * This helps in cache-busting for ad requests.
   */
  _randomizeAdJsUrls: function () {
    // Initialize or increment the random number for cache-busting.
    if ( this.urlRandNum == 0 ) {
      this.urlRandNum = Math.floor(Math.random() * Math.pow(10, this.urlRandLength));
    } else {
      this.urlRandNum++;
    }

    var randQsKey = 'sugar-rand';
    var newQsKeyValue = randQsKey + '=' + this.urlRandNum;
    // Regular expression to find existing 'sugar-rand' parameters.
    var searchRegexp = new RegExp(randQsKey + '=\\d{' + this.urlRandLength + '}', 'g');

    // Iterate through all stored ad JS URLs.
    for (adType in this.adJsUrls) {
      var adJsUrl = this.adJsUrls[adType];
      var randQsKeyValue = adJsUrl.match(searchRegexp); // Attempt to find existing rand param.

      // If a 'sugar-rand' parameter is already present, replace it.
      if ( randQsKeyValue != null ) {
        this.adJsUrls[adType] = adJsUrl.replace(randQsKeyValue[0], newQsKeyValue);
      } else {
        // If no 'sugar-rand' exists, append it to the URL.
        var questionPos = adJsUrl.search(/\?/); // Find the position of the first '?'

        // If a query string already exists, insert the new parameter.
        if ( questionPos != -1 ) {
          this.adJsUrls[adType] = adJsUrl.replace('?', '?' + newQsKeyValue + '&');
        } else {
          // Otherwise, append it to the end (handling potential existing '&').
          this.adJsUrls[adType] = adJsUrl.replace(/&*$/, '&' + newQsKeyValue);
        }
      }
    }
  },

  /**
   * Executes a JSONP request by dynamically creating a script tag.
   * Handles callback function naming and cleanup.
   * @param {string} url - The URL for the JSONP request, containing '=?'.
   * @param {function} callback - The function to call with the JSON response.
   */
  _jsonp: function ( url, callback ) {
    // Basic validation for the JSONP URL format.
    if ( url.indexOf('=?') == -1 ) {
      this._warn('The sugar jsonp url must specify the callback function in the query string i.e. callback=?');
      return;
    }
    // Basic validation for the callback function type.
    if ( typeof callback != 'function' ) {
      this._warn('The sugar jsonp callback must be a function');
      return;
    }

    // Generate a unique function name for the JSONP callback.
    var randFunctionName = 'jsonp' + Math.floor(Math.random() * 10000000000);

    /* Define the global callback function.
     * This function will execute the actual callback and then attempt to clean itself up.
     */
    window[randFunctionName] = function ( json ) {
      callback(json); // Execute the provided callback with the JSON data.

      // Attempt to delete the global function to avoid memory leaks.
      try {
        delete window[randFunctionName];
      } catch ( e ) {
        // Fallback for IE, which might not allow deleting properties from `window`.
        window[randFunctionName] = undefined;
      }
    };

    // Create and append a script element to trigger the JSONP request.
    var jsonp = document.createElement('script');
    jsonp.src = url.split('=?').join('=' + randFunctionName); // Inject the callback name.
    document.getElementsByTagName('head')[0].appendChild(jsonp); // Add script to document head.
  },

  /**
   * Utility function to check if a given object is an array.
   * @param {*} o - The object to test.
   * @returns {boolean} True if the object is an array, false otherwise.
   */
  _isArray: function ( o ) {
    return Object.prototype.toString.call(o) === '[object Array]';
  },

  /**
   * Logs a warning message to the console if available.
   * Prevents errors in environments without a console object.
   * @param {string} msg - The warning message to display.
   */
  _warn: function ( msg ) {
    if ( window.console && console.warn ) {
      console.warn(msg);
    }
  }
};