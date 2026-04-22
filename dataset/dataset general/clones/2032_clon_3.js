((jqScope) => {
  // Module: jQuery App Deep Linker
  // Purpose: Transforms standard web links into platform-specific URL schemes
  //          to facilitate deep linking into native applications on iOS devices.
  // Author: Adapted from original concept by [Your Name/Company Name]
  // Version: 1.1 (Type III Clone)

  /**
   * Initializes the app deep linking functionality for selected elements.
   * @param {object} pluginOptions - Configuration options for the plugin.
   * @returns {jqScope} The jQuery object for chainability.
   */
  jqScope.fn.appDeepLinker = function(pluginOptions) {

    // Internal state flag: true if the browser window has lost focus or become hidden,
    // which typically indicates a native app has been launched.
    let _browserWindowHidden = false;

    /**
     * Updates the internal state based on browser visibility changes.
     * This helps in determining if an app launch was successful.
     */
    const captureBrowserVisibilityState = () => {
      // document.hidden is a more direct indicator of page visibility.
      // document.hasFocus() complements this for blur events.
      _browserWindowHidden = document.hidden || !document.hasFocus();
    };

    // Attach event listeners to monitor the browser window's visibility.
    // 'visibilitychange' is a modern event, 'blur' and 'pagehide' provide broader compatibility.
    document.addEventListener('visibilitychange', captureBrowserVisibilityState);
    window.addEventListener('blur', captureBrowserVisibilityState);
    window.addEventListener('pagehide', captureBrowserVisibilityState); // Specifically useful for iOS Safari

    /**
     * Default configuration parameters for the deep linker.
     * These can be overridden by user-provided options.
     */
    const defaultConfiguration = {
      customSchemeDefinitions: [], // Array for additional, user-defined app scheme rules.
      enableConsoleOutput: false,  // If true, diagnostic messages will be logged to the console.
      redirectFallbackDelayMs: 1000, // Time (in ms) to wait before falling back to web link.
      // Sophisticated detection for Apple mobile devices (iPhone, iPad, iPod, and touch-enabled Macs).
      isMobileAppleDevice: (/iPad|iPhone|iPod/.test(navigator.userAgent)) ||
                           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    };

    // Merge the default settings with any options provided by the user.
    // This creates the effective configuration for the current plugin instance.
    const effectiveConfiguration = jqScope.extend({}, defaultConfiguration, pluginOptions);

    // --- Early Exit Condition ---
    // If not on an Apple mobile device and console output is not explicitly enabled for testing,
    // the plugin's core functionality is not relevant, so we exit.
    if (!effectiveConfiguration.isMobileAppleDevice && !effectiveConfiguration.enableConsoleOutput) {
      if (effectiveConfiguration.enableConsoleOutput) {
        console.log("[AppDeepLinker] Device not detected as Apple mobile. Plugin inactive.");
      }
      return this; // Preserve jQuery chainability.
    }

    /**
     * Defines the logic for handling various application deep links.
     * Each entry specifies an app's name, a URL pattern to match,
     * and a function to construct the app-specific URL scheme.
     */
    const applicationSchemeHandlers = [
      {
        appName: "Facebook",
        // Pattern to match Facebook profile/page/group URLs.
        urlMatcher: /(facebook\.com\/(?:profile\.php\?id=|groups\/|pages\/|(?!\w+\.php)\w+\/?$))/i,
        /**
         * Generates a Facebook app scheme URL.
         * Attempts to resolve usernames to numeric IDs via Graph API for robust linking.
         * @param {string} entityIdentifier - The Facebook username or numeric ID.
         * @returns {string} The fb:// profile URL.
         */
        schemeGenerator: (entityIdentifier) => {
          let resolvedFbID = "";
          const numericCandidate = Number(entityIdentifier);

          // Check if the identifier is already a valid numeric ID.
          if (Number.isInteger(numericCandidate) && String(numericCandidate) === entityIdentifier) {
            resolvedFbID = entityIdentifier;
          } else {
            // If not a numeric ID, assume it's a username and query the Graph API.
            try {
              // IMPORTANT: The original plugin used synchronous AJAX (async: false).
              // This is generally discouraged as it blocks the browser's main thread.
              // We maintain this behavior here for Type III cloning fidelity,
              // but for production, this should ideally be refactored to an
              // asynchronous approach (e.g., using Promises/async-await).
              jqScope.ajax({
                url: `https://graph.facebook.com/${entityIdentifier}`, // Use HTTPS for API calls.
                method: "GET",
                dataType: "json",
                async: false // Blocks until response; matches original behavior.
              })
              .done((apiResponse) => {
                if (apiResponse && apiResponse.id) {
                  resolvedFbID = apiResponse.id;
                } else {
                  if (effectiveConfiguration.enableConsoleOutput) {
                    console.warn(`[AppDeepLinker] Facebook API lookup failed for "${entityIdentifier}". No ID returned. Falling back.`);
                  }
                  resolvedFbID = entityIdentifier; // Fallback to original identifier.
                }
              })
              .fail((xhr, status, error) => {
                if (effectiveConfiguration.enableConsoleOutput) {
                  console.error(`[AppDeepLinker] Failed to retrieve Facebook ID for "${entityIdentifier}". Status: ${status}, Error: ${error}`);
                }
                resolvedFbID = entityIdentifier; // Fallback.
              });
            } catch (error) {
              if (effectiveConfiguration.enableConsoleOutput) {
                console.error(`[AppDeepLinker] Exception during Facebook ID resolution for "${entityIdentifier}":`, error);
              }
              resolvedFbID = entityIdentifier; // Fallback.
            }
          }
          return `fb://profile/${resolvedFbID}`;
        }
      },
      {
        appName: "LinkedIn",
        urlMatcher: /(linkedin\.com\/in\/)/i,
        schemeGenerator: (entityIdentifier) => `linkedin://#profile/${entityIdentifier}`
      },
      {
        appName: "Instagram",
        urlMatcher: /(instagram\.com\/)/i,
        schemeGenerator: (entityIdentifier) => `instagram://user?username=${entityIdentifier}`
      },
      {
        appName: "Quirky",
        urlMatcher: /(quirky\.com\/)/i,
        schemeGenerator: (entityIdentifier) => `quirky:///${entityIdentifier}`
      },
      {
        appName: "Twitter",
        urlMatcher: /(twitter\.com\/)/i,
        schemeGenerator: (entityIdentifier) => `twitter://user?screen_name=${entityIdentifier}`
      }
    ];

    // Append any custom scheme definitions provided by the plugin user.
    applicationSchemeHandlers.push(...effectiveConfiguration.customSchemeDefinitions);

    // --- Main Plugin Logic ---
    // Iterate over each jQuery-selected element (typically anchor tags).
    this.each(function() {
      const currentAnchorElement = jqScope(this);
      const initialHrefValue = currentAnchorElement.attr("href");

      // --- Input Validation / Guard Clause ---
      // If the element lacks an href attribute, it cannot be processed for deep linking.
      if (!initialHrefValue) {
        if (effectiveConfiguration.enableConsoleOutput) {
          console.warn("[AppDeepLinker] Skipping element: no 'href' attribute found.", this);
        }
        return; // Proceed to the next element in the selection.
      }

      // Attempt to retrieve a specific user identifier from a data attribute.
      let targetProfileIdentifier = currentAnchorElement.data("targetUser");

      // If no data attribute is present, try to extract the identifier from the URL path.
      if (!targetProfileIdentifier) {
        try {
          const urlObject = new URL(initialHrefValue);
          // Extract the last non-empty segment of the URL path.
          const pathSegments = urlObject.pathname.split('/').filter(segment => segment.length > 0);
          if (pathSegments.length > 0) {
            targetProfileIdentifier = pathSegments[pathSegments.length - 1];
          }
        } catch (e) {
          if (effectiveConfiguration.enableConsoleOutput) {
            console.error(`[AppDeepLinker] Failed to parse URL "${initialHrefValue}":`, e);
          }
          // If URL parsing fails, targetProfileIdentifier remains undefined.
        }
      }

      // Final fallback if no identifier could be determined.
      if (!targetProfileIdentifier) {
        targetProfileIdentifier = "unknown_entity"; // Provide a more descriptive default.
        if (effectiveConfiguration.enableConsoleOutput) {
          console.warn(`[AppDeepLinker] No specific identifier found for link: ${initialHrefValue}. Defaulting to "${targetProfileIdentifier}".`);
        }
      }

      // Search for a matching app scheme handler based on the original URL.
      const foundSchemeHandler = applicationSchemeHandlers.find((handler) => {
        return handler.urlMatcher && handler.urlMatcher.test(initialHrefValue);
      });

      if (foundSchemeHandler) {
        // If a handler is found, generate the app-specific deep link.
        const appSchemeLink = foundSchemeHandler.schemeGenerator(targetProfileIdentifier);
        currentAnchorElement.attr("href", appSchemeLink); // Update the href attribute.

        if (effectiveConfiguration.enableConsoleOutput) {
          console.log(`[AppDeepLinker] Rewrote link for ${foundSchemeHandler.appName}: "${initialHrefValue}" -> "${appSchemeLink}"`);
        }

        // Attach a click event handler to manage the deep link attempt and fallback.
        currentAnchorElement.on("click", function(event) {
          // Crucial: Prevent the browser's default navigation behavior immediately.
          event.preventDefault();

          if (effectiveConfiguration.enableConsoleOutput) {
            console.log(`[AppDeepLinker] Click detected. Attempting to launch app via: "${appSchemeLink}"`);
          }

          // Introduce a delay to allow the native app to launch.
          // If the app successfully launches, the browser window will typically lose focus or become hidden.
          setTimeout(() => {
            if (!_browserWindowHidden) {
              // If the browser window did not lose focus, the app likely failed to launch.
              // In this case, redirect the user to the original web URL as a fallback.
              document.location.href = initialHrefValue;
              if (effectiveConfiguration.enableConsoleOutput) {
                console.warn(`[AppDeepLinker] App did not launch for "${appSchemeLink}". Redirecting to web fallback: "${initialHrefValue}"`);
              }
            } else {
              // App is presumed to have launched. Reset the flag for future clicks.
              _browserWindowHidden = false;
              if (effectiveConfiguration.enableConsoleOutput) {
                console.info(`[AppDeepLinker] App likely launched successfully for "${appSchemeLink}".`);
              }
            }
          }, effectiveConfiguration.redirectFallbackDelayMs);
        });
      } else {
        if (effectiveConfiguration.enableConsoleOutput) {
          console.log(`[AppDeepLinker] No app scheme handler found for link: "${initialHrefValue}". Link remains unchanged.`);
        }
      }
    });

    return this; // Ensure jQuery chainability.
  };

})(jQuery);