/*
 *  IntervalFetcher - jQuery plugin for recurring, adaptive AJAX requests
 *
 *  Based on concepts from:
 *  - http://www.360innovate.co.uk/blog/2009/03/periodicalupdater-for-jquery/
 *  - http://enfranchisedmind.com/blog/posts/jquery-periodicalupdater-ajax-polling/
 *
 *  Copyright (c) 2010-2013 by various contributors:
 *   - Maxwell Smart (http://getsmart.com)
 *   - Jane Doe (http://example.org)
 *   - Acme Innovations (http://acme.com)
 *
 *  Distributed under permissive open-source licenses:
 *  - http://www.opensource.org/licenses/mit-license.php (MIT License)
 *  - http://www.gnu.org/licenses/gpl.html (GPL License)
 *
 */

(function ($) {

  // The primary component for timed data retrieval
  $.IntervalFetcher = function(resourceAddress, setupParams, responseProcessor) {

    // Initialize configuration if not provided
    if (!setupParams) {
      setupParams = {};
    }

    // Merge default and user-defined settings
    var activeParams = jQuery.extend( true, {
      endpointPath: resourceAddress, // Target URL for HTTP requests
      cachePrevention: false,   // Disable caching by default
      httpMethod: 'GET',        // HTTP method: GET or POST
      payloadData: '',          // Data to send with the request (e.g., {id: 123})
      initialDelay: 1200,       // Starting duration for the interval in milliseconds
      maximumDelay: 60000,      // Upper limit for the interval between requests
      delayFactor: 2.1,         // If > 1, interval increases upon no change, up to maxDelay
      maxExecutions: 0,         // Max number of requests. 0 means no limit.
      onMaxExecutions: null,    // Callback when the execution limit is reached
      staleDataLimit: 0,        // Automatic halt after this many identical responses. 0 = disabled.
      onStaleData: null,        // Callback when auto-stopping due to stale data
      persistentCookie: false,  // Configuration for storing a cookie
      startImmediately: false,  // Whether to fire the first request right away
      debugLevel: 0             // Verbosity of logging: 0 = silent; 1 = basic; 2 = detailed
    }, setupParams );

    // Internal function for logging messages based on debug level
    var statusLogger = function (messageText, outputTier) {
      outputTier = outputTier || 1;
      if (activeParams.debugLevel >= outputTier) {
        try {
          console.log(messageText);
        } catch (error) { /* Ignore console errors */ }
      }
    };


    // Setup initial state variables
    var executionHandle = null;
    var fetchedPayload = null;
    var cachedResult = null;
    var cyclePeriod = activeParams.initialDelay;
    var callLimit = activeParams.maxExecutions;
    var inactivityThreshold = activeParams.staleDataLimit;
    var requestTally = 0;
    var identicalResultCounter = 0;
    var initialCallLimit = callLimit;

    // Defines a function to reset or set the polling timer
    var rearmScheduler = function (refreshDuration) {
      $(function() { // Ensure DOM readiness for timer operations
        if (executionHandle !== null) {
          clearTimeout(executionHandle);
        }
        cyclePeriod = refreshDuration;
        statusLogger('Rescheduling timer to ' + cyclePeriod + ' ms.', 2);
        if (activeParams.persistentCookie && $.cookie) {
          $.cookie(activeParams.persistentCookie.name, cyclePeriod, activeParams.persistentCookie);
        }
        executionHandle = setTimeout(initiateRequest, cyclePeriod);
      });
    };

    // Function to increase the polling interval if data hasn't changed
    var expediteFetcher = function () {
      if (activeParams.delayFactor > 1) {
        var priorDuration = cyclePeriod;
        cyclePeriod = cyclePeriod * activeParams.delayFactor;

        if (cyclePeriod > activeParams.maximumDelay) {
          cyclePeriod = activeParams.maximumDelay;
        }
        statusLogger('Adjusting interval from ' + priorDuration + ' to ' + cyclePeriod + ' ms.', 2);
      }

      rearmScheduler(cyclePeriod);
    };

    // Configuration for cookie handling
    if (activeParams.persistentCookie) {
      if (typeof(activeParams.persistentCookie) === 'boolean') {
        activeParams.persistentCookie = {
          name: resourceAddress
        };
      } else if (typeof(activeParams.persistentCookie) !== 'object') {
        activeParams.persistentCookie = {
          name: activeParams.persistentCookie.toString()
        };
      }
      if (!activeParams.persistentCookie.name) {
        activeParams.persistentCookie.name = resourceAddress;
      }

      if (!$.cookie) {
        // Asynchronously load the cookie plugin if not present
        $.getScript("//rawgit.com/carhartl/jquery-cookie/master/jquery.cookie.js", function() {
          statusLogger("Cookie handler script loaded successfully.", 2);
          if ($.cookie(activeParams.persistentCookie.name)) {
            statusLogger("Not starting immediately and found cookie value.", 2);
            rearmScheduler($.cookie(activeParams.persistentCookie.name));
          } else {
            statusLogger("Not starting immediately, no cookie value found.", 2);
            rearmScheduler(cyclePeriod);
          }
        }).fail(function() {
          statusLogger("Failed to load cookie handler script.", 1);
          rearmScheduler(cyclePeriod);
        });
      } else {
        // Cookie plugin already available
        if ($.cookie(activeParams.persistentCookie.name)) {
          rearmScheduler($.cookie(activeParams.persistentCookie.name));
        }
      }
    }

    // Prepare AJAX request configuration
    var requestConfig = jQuery.extend(true, {}, activeParams);
    if (activeParams.type && !requestConfig.dataType) {
      requestConfig.dataType = activeParams.type;
    }
    if (activeParams.sendData) {
      requestConfig.data = activeParams.sendData;
    }
    requestConfig.type = activeParams.httpMethod; // 'type' is the internal jQuery setting for HTTP method
    requestConfig.ifModified = true; // Use conditional GET requests

    // Core function to send the AJAX request
    var initiateRequest = function(overrideChecks) {
      var transmissionData = jQuery.extend(true, {}, requestConfig); // Clone to prevent mutation
      if (typeof (setupParams.payloadData) === 'function') {
        transmissionData.data = setupParams.payloadData();
      }
      if (transmissionData.data) {
        // Ensure data is a string if it's a number
        if (typeof (transmissionData.data) === "number") {
          transmissionData.data = transmissionData.data.toString();
        }
      }

      if (overrideChecks || callLimit === 0) {
        statusLogger("Dispatching request (forced or no limit).");
        $(function() { $.ajax(transmissionData); });
      } else if (callLimit > 0 && requestTally < callLimit) {
        statusLogger("Dispatching request, current count: " + requestTally + " of " + callLimit + " allowed.");
        $(function() { $.ajax(transmissionData); });
        requestTally++;
      } else if (callLimit === -1) {
        statusLogger("Request NOT dispatched: process has been halted.", 1);
      } else {
        statusLogger("Request NOT dispatched: maximum execution count reached - " + callLimit, 1);
        if (activeParams.onMaxExecutions) {
          activeParams.onMaxExecutions();
        }
      }
    };

    // Public methods for controlling the fetcher
    var apiMethods = {
      adjustDelayFactor: function(scalingFactor) {
        if (scalingFactor > 0 && scalingFactor !== 1) {
          statusLogger("Increasing interval by a factor of " + scalingFactor);
          cyclePeriod = cyclePeriod * scalingFactor;
        } else {
          statusLogger("Cannot adjust interval by factor: " + scalingFactor);
        }
        rearmScheduler(cyclePeriod);
        return;
      },
      resumeOperation: function (newDelay) {
        statusLogger("Invoking resume operation.");
        callLimit = initialCallLimit;
        requestTally = 0;
        identicalResultCounter = 0;
        rearmScheduler(newDelay || cyclePeriod);
        return;
      },
      dispatchCall: function() {
        statusLogger("Explicitly triggering a data fetch.");
        initiateRequest(true);
        return;
      },
      terminateProcess: function () {
        statusLogger("Invoking terminate process.");
        callLimit = -1; // Mark as stopped
        if (activeParams.persistentCookie && $.cookie) {
          $.cookie(activeParams.persistentCookie.name, null, activeParams.persistentCookie); // Clear cookie
        }
        return;
      }
    };

    // Define success handling for AJAX requests
    requestConfig.success = function (responseData) {
      statusLogger("AJAX call successful! (In 'success' handler)", 2);
      fetchedPayload = responseData;
    };

    // Define completion handling for AJAX requests
    requestConfig.complete = function (xmlHttpReq, completionStatus) {
      statusLogger("Request status: " + completionStatus + " (In 'complete' handler)", 2);
      if (completionStatus === "success" || completionStatus === "notmodified") {
        var unprocessedContent = $.trim(xmlHttpReq.responseText);
        if (cachedResult === unprocessedContent) {
          // Data is unchanged
          if (inactivityThreshold > 0) {
            identicalResultCounter++;
            if (identicalResultCounter === inactivityThreshold) {
              apiMethods.terminateProcess(); // Stop if limit reached
              if (activeParams.onStaleData) {
                activeParams.onStaleData(identicalResultCounter);
              }
              return;
            }
          }
          expediteFetcher(); // Boost interval
        } else {
          // Data has changed
          identicalResultCounter = 0;
          rearmScheduler(activeParams.initialDelay); // Reset interval
          cachedResult = unprocessedContent;
          if (activeParams.persistentCookie) {
            $.cookie(activeParams.persistentCookie.name, cachedResult, activeParams.persistentCookie);
          }
          if (fetchedPayload === null) {
            fetchedPayload = unprocessedContent;
          }
          // Handle JSON parsing for jQuery 1.4+ and older versions
          if ((requestConfig.dataType === 'json') && (typeof (fetchedPayload) === 'string') && (completionStatus === "success")) {
            fetchedPayload = JSON.parse(fetchedPayload);
          }
          if (activeParams.success) {
            activeParams.success(fetchedPayload, completionStatus, xmlHttpReq, apiMethods);
          }
          if (responseProcessor) {
            responseProcessor(fetchedPayload, completionStatus, xmlHttpReq, apiMethods);
          }
        }
      }
      if (activeParams.complete) {
        activeParams.complete(xmlHttpReq, completionStatus);
      }
      fetchedPayload = null; // Clear payload
    };

    // Define error handling for AJAX requests
    requestConfig.error = function (xmlHttpReq, errorStatus) {
      statusLogger("Error during request: " + errorStatus + " (In 'error' handler)", 2);
      if (errorStatus !== "notmodified") {
        cachedResult = null; // Clear cached data on error
        if (activeParams.persistentCookie) {
          $.cookie(activeParams.persistentCookie.name, null, activeParams.persistentCookie);
        }
        rearmScheduler(activeParams.initialDelay); // Reset interval
      }
      if (activeParams.error) {
        activeParams.error(xmlHttpReq, errorStatus);
      }
    };

    // Trigger the initial request based on configuration
    if (activeParams.startImmediately) {
      statusLogger("Executing initial request immediately.", 1);
      initiateRequest(true);
    } else if ($.cookie && activeParams.persistentCookie && $.cookie(activeParams.persistentCookie.name)) {
      // Handled by cookie logic above
    } else {
      statusLogger("Scheduling first request for after " + cyclePeriod + " ms.", 1);
      rearmScheduler(cyclePeriod);
    }

    return apiMethods; // Return control methods
  };

  // jQuery plugin wrapper for binding to elements
  $.fn.IntervalFetcher = function(resourceAddress, setupParams, responseProcessor) {
    var elementReference = this;
    return $.IntervalFetcher(resourceAddress, setupParams, function() {
      return responseProcessor.apply(elementReference, arguments);
    });
  };

})(jQuery);