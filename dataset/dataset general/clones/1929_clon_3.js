/*
 * Module: EnergyTracker
 * Filename: power_status_monitor.js
 *
 * Purpose: This module offers a streamlined abstraction layer for interacting
 *          with the various browser implementations of the HTML5 Battery Status API.
 *          It aims to provide a consistent interface for monitoring device power levels.
 *
 * Author:
 * - J. Doe <j.doe@example.com>
 *
 * Copyright:
 * (c) 2024 J. Doe. All rights reserved.
 * Distribution under MIT License terms.
 */
var EnergyTracker = (function() {

  // --- Internal Module Configuration & State ---

  // A unique identifier for when the battery API is not found or fails.
  const _POWER_API_UNAVAILABLE_CODE = 'PWR_API_NOT_FOUND';

  // Specific battery-related event types to observe for state changes.
  const _MONITORED_POWER_EVENTS = [
    'chargingchange',
    'chargingtimechange',
    'dischargingtimechange',
    'levelchange'
  ];

  // Safely reference the global 'navigator' object to prevent errors in non-browser environments.
  const _browserNavigator = typeof navigator !== 'undefined' ? navigator : {};

  // Simple internal logging utility for debugging purposes.
  // Can be expanded to filter by level or integrate with external logging.
  const _logActivity = (message, level = 'info') => {
    if (typeof console !== 'undefined' && console[level]) {
      console[level](`[EnergyTracker] ${message}`);
    }
  };

  // The primary object or function responsible for accessing the battery API.
  // Checks for standard, Mozilla-specific, and promise-based APIs.
  let _batteryApiAccessor = _browserNavigator.getBattery || _browserNavigator.battery || _browserNavigator.mozBattery;

  // Stores the most recently retrieved battery status object.
  let _currentDevicePowerState = null;

  // A callback function that gets invoked once the initial battery status is determined.
  let _initialStatusResolver = () => { /* No-op by default */ };

  // A callback function that gets invoked every time the battery status changes.
  let _powerStateChangeNotifier = () => { /* No-op by default */ };

  // --- Private Utility Functions ---

  /**
   * Processes an incoming battery status update.
   * Updates the internal state and notifies registered listeners.
   * @param {Object} latestPowerInfo - The battery status object provided by the API.
   */
  function handlePowerStatusUpdate(latestPowerInfo) {
    _currentDevicePowerState = latestPowerInfo;
    _powerStateChangeNotifier(_currentDevicePowerState);
    _logActivity('Power state updated and listeners notified.', 'debug');
  }

  /**
   * Attaches event listeners to the provided battery status object.
   * It ensures that state changes are captured and processed.
   * @param {Object} powerSourceTarget - The object (e.g., navigator.battery) to attach listeners to.
   */
  function setupPowerEventObservers(powerSourceTarget) {
    if (!powerSourceTarget || typeof powerSourceTarget.addEventListener !== 'function') {
      _logActivity('Attempted to register listeners on an invalid object.', 'error');
      return;
    }
    _MONITORED_POWER_EVENTS.forEach(eventName => {
      powerSourceTarget.addEventListener(eventName, handlePowerStatusUpdate);
      _logActivity(`Registered observer for '${eventName}'.`, 'debug');
    });
  }

  // --- Public Module Interface ---
  const publicInterface = {};

  /**
   * Method: queryCurrentStatus
   * Retrieves the current power status of the device. If the status is already
   * known, it's provided immediately. Otherwise, the callback is stored and
   * invoked once the API resolves.
   *
   * Parameters:
   * (Function) resultCallback(statusObject, errorCode) - Function to call with results.
   *                                                      'statusObject' is the battery data.
   *                                                      'errorCode' is provided if unsupported.
   */
  publicInterface.queryCurrentStatus = function(resultCallback) {
    if (typeof resultCallback !== 'function') {
      _logActivity('Provided callback for queryCurrentStatus is not a function.', 'warn');
      return; // Exit if the callback is invalid.
    }

    if (_currentDevicePowerState === _POWER_API_UNAVAILABLE_CODE) {
      resultCallback(null, _POWER_API_UNAVAILABLE_CODE);
      _logActivity('Query for status on an unsupported API.', 'info');
    } else if (_currentDevicePowerState) {
      resultCallback(_currentDevicePowerState);
      _logActivity('Current status provided instantly.', 'debug');
    } else {
      // If status is still being fetched, store this callback for later invocation.
      _initialStatusResolver = resultCallback;
      _logActivity('Initial status query pending, callback stored.', 'debug');
    }
  };

  /**
   * Method: registerForUpdates
   * Registers a callback function to be executed whenever the battery status
   * (like charging state, level, or time estimates) changes.
   *
   * Parameters:
   * (Function) updateHandler(statusObject) - The function to call with the new status.
   */
  publicInterface.registerForUpdates = function(updateHandler) {
    if (typeof updateHandler !== 'function') {
      _logActivity('Provided update handler for registerForUpdates is not a function.', 'warn');
      return; // Exit if the handler is invalid.
    }
    _powerStateChangeNotifier = updateHandler;
    _logActivity('Power state change notifier has been updated.', 'debug');
  };

  // --- Module Initialization Logic ---

  // First, check if any battery API reference was found at all.
  if (!_batteryApiAccessor) {
    _currentDevicePowerState = _POWER_API_UNAVAILABLE_CODE;
    _logActivity('No Battery Status API detected in this browsing environment.', 'error');
    // If an initial status request was made before initialization, resolve it now.
    _initialStatusResolver(null, _POWER_API_UNAVAILABLE_CODE);
  }
  // Case 1: The API accessor is a function (e.g., navigator.getBattery()), implying a Promise-based API.
  else if (typeof _batteryApiAccessor === 'function') {
    _logActivity('Attempting to initialize using the Promise-based Battery API (e.g., getBattery()).', 'info');
    _batteryApiAccessor.call(_browserNavigator) // Execute the function in the context of navigator.
      .then(function(batteryObjectResolved) {
        _currentDevicePowerState = batteryObjectResolved;
        _initialStatusResolver(_currentDevicePowerState); // Fulfill any pending initial status requests.
        setupPowerEventObservers(_currentDevicePowerState); // Attach listeners to the resolved battery object.
        _logActivity('Promise-based Battery API successfully initialized.', 'info');
      })
      .catch(function(errorDetails) {
        _currentDevicePowerState = _POWER_API_UNAVAILABLE_CODE;
        _logActivity(`Failed to access battery status via Promise: ${errorDetails.message}`, 'error');
        _initialStatusResolver(null, _POWER_API_UNAVAILABLE_CODE); // Notify of failure.
      });
  }
  // Case 2: The API accessor is a direct object (e.g., navigator.battery or navigator.mozBattery).
  else {
    _logActivity('Initializing using a direct Battery object API (e.g., navigator.battery).', 'info');
    _currentDevicePowerState = _batteryApiAccessor;
    setupPowerEventObservers(_currentDevicePowerState); // Attach listeners directly to the object.
    _initialStatusResolver(_currentDevicePowerState); // Fulfill any pending initial status requests.
  }

  // Return the public methods, making them accessible from outside the IIFE.
  return publicInterface;

  // The IIFE is immediately invoked. The `EnergyTracker` variable will hold the `publicInterface` object.
})();