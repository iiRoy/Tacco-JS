'use strict';

// This module provides advanced performance telemetry capabilities,
// integrating with an external analytics platform.
// It aims to capture key user experience timings for reporting.
(function(globalWindow, analyticsProviderReference) {

  // Centralized constants for critical performance event identifiers.
  // Using an Object.freeze to ensure immutability of these IDs.
  const PERFORMANCE_EVENTS = Object.freeze({
    NAVIGATION_START: 'app_load_start',
    DOM_CONTENT_READY: 'dom_parsed_complete',
    PAGE_FULLY_LOADED: 'resource_load_end'
  });

  /**
   * @class PerformanceWatcher
   * @description Manages the collection and dispatch of performance metrics.
   *              It records specific time points and calculates durations,
   *              then sends this data to a configured analytics service.
   * @param {object} [initialAnalyticsService=analyticsProviderReference] -
   *   Optional initial analytics service object. Defaults to global.NREUM.
   */
  globalWindow.PerformanceWatcher = function(initialAnalyticsService = analyticsProviderReference) {
    // A private Map to store high-resolution timestamps for various events.
    // Using Map offers better performance for frequent additions/lookups than a plain object.
    const collectedTimePoints = new Map();

    // The external analytics service instance this watcher will communicate with.
    // This allows for dynamic assignment or dependency injection.
    this.linkedAnalyticsService = initialAnalyticsService;

    // --- Internal Helper Functions (private scope) ---

    /**
     * Safely retrieves a recorded timestamp for a given event ID.
     * @param {string} eventKey - The unique key of the event.
     * @returns {number|null} The timestamp in milliseconds (high-res), or null if not found.
     */
    const retrieveTimestamp = (eventKey) => {
      return collectedTimePoints.get(eventKey) || null;
    };

    /**
     * Validates if the analytics service is properly configured and capable of transmitting data.
     * @returns {boolean} True if ready, false otherwise.
     */
    const isAnalyticsServiceReady = () => {
      return (this.linkedAnalyticsService && typeof this.linkedAnalyticsService.transmitData === 'function');
    };

    /**
     * Verifies that all essential performance milestones have been recorded.
     * This is a critical prerequisite before attempting to send a performance beacon.
     * @returns {boolean} True if all necessary events are present, false otherwise.
     */
    const checkRequiredTimestamps = () => {
      const essentialEvents = [
        PERFORMANCE_EVENTS.NAVIGATION_START,
        PERFORMANCE_EVENTS.DOM_CONTENT_READY,
        PERFORMANCE_EVENTS.PAGE_FULLY_LOADED
      ];
      return essentialEvents.every(key => collectedTimePoints.has(key));
    };

    // --- Public API Methods (instance methods) ---

    /**
     * Records the current high-resolution time for a specified event.
     * @param {string} eventIdentifier - A unique string identifier for the event.
     * @returns {boolean} True if the event was recorded successfully, false on invalid input.
     */
    this.capturePerformancePoint = (eventIdentifier) => {
      if (!eventIdentifier || typeof eventIdentifier !== 'string') {
        console.error("PerformanceWatcher: Invalid event identifier provided.");
        return false;
      }
      collectedTimePoints.set(eventIdentifier, performance.now()); // Using high-resolution timer
      return true;
    };

    /**
     * Calculates the elapsed time between two recorded performance points.
     * If only an end point is provided, it measures from that point to the current moment.
     * @param {string} endPointId - Identifier for the finishing event.
     * @param {string|null} [startPointId=null] - Identifier for the starting event.
     * @returns {number|null} The duration in milliseconds, or null if a required timestamp is missing or invalid.
     */
    this.calculateInterval = (endPointId, startPointId = null) => {
      let finalInstant = retrieveTimestamp(endPointId);
      let initialInstant;

      // Early exit if the end event itself was not recorded.
      if (finalInstant === null) {
        console.warn(`PerformanceWatcher: End point '${endPointId}' not found. Cannot calculate interval.`);
        return null;
      }

      // Determine the initial time source based on whether a startPointId was provided.
      if (startPointId) {
        initialInstant = retrieveTimestamp(startPointId);
        if (initialInstant === null) {
          console.warn(`PerformanceWatcher: Start point '${startPointId}' not found. Cannot calculate interval.`);
          return null;
        }
      } else {
        // If no start point, measure from the recorded end point to the current time.
        initialInstant = finalInstant;
        finalInstant = performance.now(); // Update finalInstant to current high-res time
      }

      // Defensive check for logically inverted timestamps.
      if (initialInstant > finalInstant) {
        console.warn(`PerformanceWatcher: Inconsistent timestamps detected. Initial point (${startPointId || 'recorded end'}) is after final point (${endPointId}). Returning 0.`);
        return 0;
      }

      return finalInstant - initialInstant;
    };

    /**
     * Dispatches the collected performance metrics to the configured analytics service.
     * This method orchestrates the calculation of key durations and formats them
     * into a payload suitable for the external service.
     * @param {string} [contextIdentifier] - An optional string representing the current page/route.
     * @returns {boolean} True if dispatch was attempted, false if prerequisites weren't met or an error occurred.
     */
    this.transmitMetricsBeacon = (contextIdentifier) => {
      // Pre-flight checks for service availability and data completeness.
      if (!isAnalyticsServiceReady()) {
        console.error("PerformanceWatcher: Analytics service is not ready. Cannot transmit data.");
        return false;
      }
      if (!checkRequiredTimestamps()) {
        console.error("PerformanceWatcher: Missing critical performance timestamps. Cannot send beacon.");
        return false;
      }

      // Determine the current context/route identifier.
      // Prioritize provided identifier, then URL hash, then a generic fallback.
      const currentRouteId = contextIdentifier || globalWindow.location.hash.substring(1) || 'unspecified_page';

      try {
        const domReadyDuration = this.calculateInterval(PERFORMANCE_EVENTS.DOM_CONTENT_READY, PERFORMANCE_EVENTS.NAVIGATION_START);
        const pageLoadDuration = this.calculateInterval(PERFORMANCE_EVENTS.PAGE_FULLY_LOADED, PERFORMANCE_EVENTS.NAVIGATION_START);

        // Ensure calculated durations are valid before proceeding.
        if (domReadyDuration === null || pageLoadDuration === null) {
          console.error("PerformanceWatcher: One or more calculated durations are invalid. Aborting beacon transmission.");
          return false;
        }

        // Construct the data payload for the analytics service.
        // This structure is more flexible than positional arguments.
        const telemetryPayload = {
          route: currentRouteId,
          metrics: {
            domInteractiveTime: domReadyDuration,
            fullPageLoadTime: pageLoadDuration
          },
          // Adding additional contextual data for richer analytics.
          context: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 'N/A' // Example of adding more data
          }
        };

        // Call the external analytics service's transmission method.
        // The original `inlineHit` had many `0`s; this new method takes a structured object.
        this.linkedAnalyticsService.transmitData(telemetryPayload);
        console.info(`PerformanceWatcher: Metrics beacon sent for route '${currentRouteId}'.`);
        return true;

      } catch (err) {
        console.error("PerformanceWatcher: An error occurred during metrics beacon transmission:", err);
        return false;
      }
    };

    /**
     * Clears all previously recorded performance time points.
     * Useful for single-page applications transitioning between views or for testing.
     */
    this.resetAllPoints = () => {
      collectedTimePoints.clear();
      console.log("PerformanceWatcher: All recorded time points have been cleared.");
    };

    /**
     * Retrieves a snapshot of all currently recorded performance points.
     * @returns {object} An object containing all recorded event IDs and their timestamps.
     */
    this.getRecordedPoints = () => {
      // Convert Map to a plain object for easier consumption by external code.
      return Object.fromEntries(collectedTimePoints);
    };

    // --- Constructor Initialization Logic ---
    // Automatically record the navigation start time when an instance is created.
    // This provides a baseline for all subsequent page load measurements.
    if (!collectedTimePoints.has(PERFORMANCE_EVENTS.NAVIGATION_START)) {
      this.capturePerformancePoint(PERFORMANCE_EVENTS.NAVIGATION_START);
    }
  };

  // Expose the constant event identifiers as a static property on the constructor.
  // This allows consumers to easily reference the standard event keys without instantiating.
  globalWindow.PerformanceWatcher.EventKeys = PERFORMANCE_EVENTS;

})(window, window.NREUM); // Passing global `window` and `window.NREUM` explicitly.