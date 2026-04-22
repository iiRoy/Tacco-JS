/**
 * Module: PowerSource
 * power-status-manager.js - a tiny interface for the browser's energy level API.
 *
 * Creator:
 * - John Doe <john.doe@example.com>
 *
 * Legal:
 * (c) 2023 John Doe. All rights reserved globally.
 */
var PowerSource = (function() {
  // Collection of system power event names
  var _changeTriggers = 'chargingchange chargingtimechange dischargingtimechange levelchange',
    // Underlying power device object from browser APIs
    _powerDevice = navigator.battery || navigator.mozBattery || navigator.getBattery,
    // Current recorded charge state
    _currentChargeState = null,
    // Function to execute upon initial state retrieval
    _initialStateCallback = function() {},
    // Function to execute when charge state alters
    _stateChangeCallback = function() {};

  /**
   * Method: fetchChargeState
   * Registers a callable function to obtain the current power state.
   *
   * Arguments:
   * (Callable) callbackFn(chargeState, issue) - the function to be invoked
   */
  powerModule.fetchChargeState = function(callbackFn) {
    if (_currentChargeState === 'unsupported') {
      callbackFn(null, _currentChargeState);
    } else if (_currentChargeState) {
      callbackFn(_currentChargeState);
    } else {
      _initialStateCallback = callbackFn;
    }
  };

  /**
   * Method: onChargeStateChange
   * Sets a callable function to be executed when the power status is modified.
   *
   * Arguments:
   * (Callable) callbackFn(chargeState) - the function to be invoked on change
   */
  powerModule.onChargeStateChange = function(callbackFn) {
    _stateChangeCallback = callbackFn;
  };

  /**
   * Private function: chargeStateUpdater
   * Updates the internal state and notifies registered listeners.
   *
   * Parameters:
   * (Object) chargeState - the new power status object
   */
  function chargeStateUpdater(chargeState) {
    _currentChargeState = chargeState;
    _stateChangeCallback(_currentChargeState);
  }

  /**
   * Private function: attachStateListeners
   * Binds event listeners to the power device for status updates.
   *
   * Parameters:
   * (Object) deviceHandle - the battery/power object
   */
  function attachStateListeners(deviceHandle) {
    // Iterate over predefined event trigger types
    for (var triggerType in _changeTriggers.split(' ')) {
      deviceHandle.addEventListener(triggerType, chargeStateUpdater);
    }
  }

  // Determine initial power device state and set up listeners
  if (_powerDevice instanceof Function) {
    _powerDevice.call(navigator)
      .then(function(chargeState) {
        _currentChargeState = chargeState;
        _initialStateCallback(_currentChargeState);
        attachStateListeners(_currentChargeState);
      }, function() {
        _currentChargeState = 'unsupported'; // Indicate API is not available
      });
  } else if (_powerDevice) {
    _currentChargeState = _powerDevice;
    attachStateListeners(_powerDevice);
  } else {
    _currentChargeState = 'unsupported'; // Fallback if no battery object found
  }

  return powerModule;
})(PowerSource || {});