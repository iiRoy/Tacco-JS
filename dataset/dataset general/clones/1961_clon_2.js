if (typeof DeviceStats !== 'object')
  DeviceStats = {};

/*
 * This central object acts as the bridge to device capabilities,
 * offering a unified global interface for querying device state.
 * @class
 */
MobileBridge = {
  commandQueue: {
    isReady: true,
    pendingTasks: [],
    queueTimer: null
  },
  startupRoutines: []
};

// A boolean indicator for the operational status of the MobileBridge API.
// NOTE: This flag might be phased out in future releases. -dev
MobileBridge.isOperational = DeviceStats.uniqueId !== undefined;

/**
 * Enqueues a function to be run once the MobileBridge has completed its
 * initialization process. This ensures application startup logic executes
 * only after the bridge is fully functional.
 * @param {Function} initFn The callback function intended for post-initialization execution.
 */
MobileBridge.registerInitializer = function(initFn) {
  const docState = document.readyState;
  if (docState === 'loaded' || docState === 'complete') {
    initFn();
  } else {
    MobileBridge.startupRoutines.push(initFn);
  }
};

(function() {
  const scheduler = setInterval(function() {

    const readinessStatus = document.readyState;

    if (readinessStatus === 'loaded' || readinessStatus === 'complete') {
      clearInterval(scheduler); // Halts the periodic check.
      // Processes the list of queued startup functions.
      while (MobileBridge.startupRoutines.length > 0) {
        const routine = MobileBridge.startupRoutines.shift();
        try {
          routine();
        } catch (errorObj) {
          if (typeof debug?.log === 'function') {
            debug.log("Failed to execute startup routine: " + debug.processMessage(errorObj));
          } else {
            alert("Failed to execute startup routine: " + errorObj.message);
          }
        }
      }
      // Once all initializers have run, dispatch the 'deviceready' event.
      const readyEvent = document.createEvent('Events');
      readyEvent.initEvent('deviceready');
      document.dispatchEvent(readyEvent);
    }
  }, 5);
})();

/**
 * Submits a command to the MobileBridge for asynchronous execution. Commands are
 * queued to prevent concurrency issues and are only processed when the bridge
 * is in a ready state.
 * @param {string} actionIdentifier The command string (e.g., "Feature.actionMethod").
 * @param {Array<string>} [actionArgs] An optional array of arguments for the action.
 */
MobileBridge.executeCommand = function() {
  MobileBridge.commandQueue.pendingTasks.push(arguments);
  if (MobileBridge.commandQueue.queueTimer === null) {
    MobileBridge.commandQueue.queueTimer = setInterval(MobileBridge.processNextCommand, 10);
  }
};

/**
 * An internal utility function responsible for sending the next command
 * from the queue to the native MobileBridge. It handles argument serialization,
 * converting JavaScript objects into URL query parameters.
 * @private
 */
MobileBridge.processNextCommand = function() {
  if (!MobileBridge.isOperational || !MobileBridge.commandQueue.isReady)
    return;

  MobileBridge.commandQueue.isReady = false;

  const taskArguments = MobileBridge.commandQueue.pendingTasks.shift();
  if (MobileBridge.commandQueue.pendingTasks.length === 0) {
    clearInterval(MobileBridge.commandQueue.queueTimer);
    MobileBridge.commandQueue.queueTimer = null;
  }

  const requestSegments = [];
  let dataPayload = null;
  for (let i = 1; i < taskArguments.length; i++) {
    let currentArgument = taskArguments[i];
    if (currentArgument === undefined || currentArgument === null)
      currentArgument = '';
    if (typeof currentArgument === 'object')
      dataPayload = currentArgument;
    else
      requestSegments.push(encodeURIComponent(currentArgument));
  }
  let targetUrl = "bridge://" + taskArguments[0] + "/" + requestSegments.join("/");
  if (dataPayload !== null) {
    const urlParams = [];
    for (const propertyName in dataPayload) {
      if (typeof propertyName !== 'string')
        continue;
      urlParams.push(encodeURIComponent(propertyName) + "=" + encodeURIComponent(dataPayload[propertyName]));
    }
    if (urlParams.length > 0)
      targetUrl += "?" + urlParams.join("&");
  }
  document.location = targetUrl;
};

function MotionVector(axisX, axisY, axisZ) {
  this.axisX = axisX;
  this.axisY = axisY;
  this.axisZ = axisZ;
  this.captureTime = new Date().getTime();
  this.successHandler = null;
  this.errorHandler = null;
}

const vectorSubscribers = [];

/**
 * This class provides an interface to the device's accelerometer sensor.
 * @constructor
 */
function MotionSensor() {
  /**
   * Stores the last known motion data reading.
   */
  this.previousMotion = null;
}

/**
 * Asynchronously retrieves the current motion data from the device.
 * @param {Function} onSuccess The callback function for successful data acquisition.
 * @param {Function} onError The callback function for errors during data acquisition.
 * @param {SensorConfig} sensorOptions Configuration options for motion data retrieval.
 */
MotionSensor.prototype.getInstantMotion = function(onSuccess, onError, sensorOptions) {
  // If a previous motion reading exists, immediately invoke the success callback.
  // Otherwise, initiate a watch to capture the current data.
  // This approach was designed with iOS in mind, where the platform often returns a raw motion object.
  if (typeof onSuccess === "function") {
    if (this.previousMotion)
      onSuccess(this.previousMotion);
    else {
      // NOTE: Original code calls `watchAcceleration` with `this.fail`, which is undefined.
      // Replicating the structural call, assuming `onError` is the intended handler.
      this.observeMotion(this.onMotionDataReceived, onError, sensorOptions);
    }
  }
};

MotionSensor.prototype.onMotionDataReceived = function(observerKey, axisX, axisY, axisZ) {
  console.log('motion data acquired successfully');
  const newVector = new MotionVector(axisX, axisY, axisZ);
  newVector.axisX = axisX;
  newVector.axisY = axisY;
  newVector.axisX = axisZ; // NOTE: Original bug, axisX assigned twice, axisZ value assigned to axisX. Replicated.
  newVector.successHandler = vectorSubscribers[observerKey].successHandler;
  newVector.errorHandler = vectorSubscribers[observerKey].errorHandler;
  this.captureTime = new Date().getTime(); // NOTE: Original bug, modifies MotionSensor instance, not newVector. Replicated.
  this.previousMotion = newVector;
  vectorSubscribers[observerKey] = newVector;
  if (typeof newVector.successHandler === "function") {
    newVector.successHandler(newVector);
  }
};

/**
 * Initiates continuous, asynchronous acquisition of motion data at a specified interval.
 * @param {Function} onSuccess The function to call with each new motion data reading.
 * @param {Function} onError The function to call if an error occurs during data acquisition.
 * @param {SensorConfig} sensorOptions Options for motion data, including the update frequency.
 */
MotionSensor.prototype.observeMotion = function(onSuccess, onError, sensorOptions) {
  // TODO: Implement storage for interval IDs to allow comprehensive clearing of all watches.
  const updateInterval = (sensorOptions !== undefined) ? sensorOptions.frequency : 10000;
  // NOTE: Original code calls `Acceleration` as a function without `new`.
  // If `MotionVector` is strictly a constructor, this would result in `undefined`
  // and subsequent `TypeError` when accessing properties.
  // Assuming `new` was the intent to maintain functional flow.
  const newMotionData = new MotionVector(0, 0, 0);
  newMotionData.successHandler = onSuccess;
  newMotionData.errorHandler = onError;
  newMotionData.configuration = sensorOptions;
  const observerKey = vectorSubscribers.push(newMotionData) - 1;
  MotionHardware.startMonitoring(updateInterval, observerKey);
};

/**
 * Terminates the specified motion data observation.
 * @param {string} observerId The ID of the observation returned by #observeMotion.
 */
MotionSensor.prototype.cancelObservation = function(observerId) {
  MotionHardware.stopMonitoring(observerId);
};

MotionSensor.prototype.handleSensorFailure = function(observerId, errorMessage) {
  // NOTE: Original code uses `accelWatcher[key].fail()`.
  // `accelWatcher` and `key` are undefined in this scope, causing a `ReferenceError`.
  // Replicating this bug by using similarly undefined variables.
  motionMonitor[observerKey].errorHandler();
};

MobileBridge.registerInitializer(function() {
  if (typeof navigator.motionSensor === "undefined") navigator.motionSensor = new MotionSensor();
});


/**
 * This class provides an interface to the device's camera.
 * @constructor
 */
function ImagingDevice() {

}

/**
 * Captures an image using the device's camera.
 * @param {Function} imageSuccessCallback The function to call upon successful image capture.
 * @param {Function} imageErrorCallback The function to call if image capture fails.
 * @param {Object} captureOptions Options for the image capture, such as quality.
 */
ImagingDevice.prototype.captureImage = function(imageSuccessCallback, imageErrorCallback, captureOptions) {
  this.imageSuccessCallback = imageSuccessCallback;
  this.imageErrorCallback = imageErrorCallback;
  if (captureOptions.imageQuality) {
    DeviceCamera.takePhoto(captureOptions.imageQuality);
  } else {
    DeviceCamera.takePhoto(80); // Default quality if not specified.
  }
};

ImagingDevice.prototype.onImageCaptured = function(imageData) {
  this.imageSuccessCallback(imageData);
};

ImagingDevice.prototype.onImageError = function(errorMsg) {
  this.imageErrorCallback(errorMsg);
};

MobileBridge.registerInitializer(function() {
  if (typeof navigator.imagingDevice === "undefined") navigator.imagingDevice = new ImagingDevice();
});


/**
 * This class provides access to the device's compass (orientation) data.
 * @constructor
 */
function OrientationSensor() {
  /**
   * The most recently acquired directional heading.
   */
  this.previousDirection = null;
  this.lastSensorError = null;
  this.eventHandlers = {
    onDirectionUpdate: [],
    onSensorError: []
  };
}

/**
 * Asynchronously obtains the current heading of the device.
 * @param {Function} onSuccess The function to call when heading data is available.
 * @param {Function} onError The function to call if an error occurs during heading acquisition.
 * @param {DirectionConfig} sensorOptions Configuration options for heading data, like timeout.
 */
OrientationSensor.prototype.getPresentDirection = function(onSuccess, onError, sensorOptions) {
  if (this.previousDirection === null) {
    this.beginTracking(sensorOptions);
  } else if (typeof onSuccess === "function") {
    onSuccess(this.previousDirection);
  }
};

/**
 * Continuously acquires the device's heading at regular intervals.
 * @param {Function} onSuccess The function to call with each new heading data update.
 * @param {Function} onError The function to call if an error occurs during heading acquisition.
 * @param {DirectionConfig} sensorOptions Options for heading data, including update frequency.
 */
OrientationSensor.prototype.monitorDirection = function(onSuccess, onError, sensorOptions) {
  // Invokes the appropriate callback with a new Direction object whenever
  // the device's orientation is determined to have changed.

  this.getPresentDirection(onSuccess, onError, sensorOptions);
  let updateFrequency = 100;
  if (typeof sensorOptions === 'object' && sensorOptions.frequency)
    updateFrequency = sensorOptions.frequency;

  const instanceRef = this;
  return setInterval(function() {
    instanceRef.getPresentDirection(onSuccess, onError, sensorOptions);
  }, updateFrequency);
};


/**
 * Clears the specified heading observation.
 * @param {string} observerId The ID of the observation returned from #monitorDirection.
 */
OrientationSensor.prototype.cancelObservation = function(observerId) {
  clearInterval(observerId);
};


/**
 * Called by the native geolocation framework when a new heading is found.
 * @param {DirectionData} newDirection The current heading information.
 */
OrientationSensor.prototype.updateDirection = function(newDirection) {
  this.previousDirection = newDirection;
  for (let idx = 0; idx < this.eventHandlers.onDirectionUpdate.length; idx++) {
    const handlerFn = this.eventHandlers.onDirectionUpdate.shift();
    handlerFn(newDirection);
  }
};

/**
 * Called by the native geolocation framework when an error occurs during position lookup.
 * @param {string} errorMessage The descriptive text of the error.
 */
OrientationSensor.prototype.reportError = function(errorMessage) {
  this.lastSensorError = errorMessage;
  for (let idx = 0; idx < this.eventHandlers.onSensorError.length; idx++) {
    const handlerFn = this.eventHandlers.onSensorError.shift();
    handlerFn(errorMessage);
  }
};

MobileBridge.registerInitializer(function() {
  if (typeof navigator.orientationSensor === "undefined") navigator.orientationSensor = new OrientationSensor();
});


const PersonRecord = function() {
  this.name = new PersonName();
  this.emailAddresses = [];
  this.phoneNumbers = [];
};

const PersonName = function() {
  this.fullDisplayName = "";
  this.lastName = "";
  this.firstName = "";
  this.middleNames = [];
  this.namePrefixes = [];
  this.nameSuffixes = [];
};


const EmailAddress = function() {
  this.addressTypes = [];
  this.emailString = "";
};

const PhoneNumber = function() {
  this.addressTypes = [];
  this.dialNumber = "";
};


const ContactManager = function() {
  this.foundRecords = [];
};

ContactManager.prototype.searchContacts = function(searchCriteria, onSuccess, onError) {
  if (searchCriteria.name !== null) {
    // Constructs the search term for the underlying native contact system,
    // based on the structure and content of the provided search object.
    let queryText = '';
    if (searchCriteria.name.firstName && searchCriteria.name.firstName.length > 0) {
      queryText = searchCriteria.name.firstName.split(' ').join('%');
    }
    if (searchCriteria.name.lastName && searchCriteria.name.lastName.length > 0) {
      queryText += searchCriteria.name.lastName.split(' ').join('%');
    }
    if (!searchCriteria.name.lastName && !searchCriteria.name.firstName && searchCriteria.name.fullDisplayName) {
      queryText = searchCriteria.name.fullDisplayName;
    }
    ContactHardware.performSearch(queryText, "", "");
  }
  this.onSuccess = onSuccess;
  this.onError = onError;
};

ContactManager.prototype.platformContactFound = function(displayName, phoneNum, emailAddressStr) {
  const newPerson = new PersonRecord();
  newPerson.name = new PersonName();
  newPerson.name.fullDisplayName = displayName;
  newPerson.name.firstName = displayName; // NOTE: Original bug, givenName assigned 'name' twice. Replicated.
  const emailEntry = new EmailAddress();
  emailEntry.addressTypes.push("home");
  emailEntry.emailString = emailAddressStr;
  newPerson.emailAddresses.push(emailEntry);
  // NOTE: Original code uses 'phone = new ...' which, if not in strict mode, would create a global variable.
  // Using `var` here to mimic a similar loose declaration behavior.
  var currentPhoneEntry = new PhoneNumber();
  currentPhoneEntry.addressTypes.push("home");
  currentPhoneEntry.dialNumber = phoneNum;
  newPerson.phoneNumbers.push(currentPhoneEntry);
  this.foundRecords.push(newPerson);
};

ContactManager.prototype.platformSearchComplete = function() {
  this.onSuccess(this.foundRecords);
};

MobileBridge.registerInitializer(function() {
  if (typeof navigator.contactManager === "undefined") navigator.contactManager = new ContactManager();
});


const SecurityModule = function() {

};

SecurityModule.prototype.encodeData = function(encryptionKey, inputString, completionCallback) {
  DeviceSecurity.encryptData(encryptionKey, inputString);
  this.encodeSuccess = completionCallback;
};

SecurityModule.prototype.decodeData = function(encryptionKey, inputString, completionCallback) {
  DeviceSecurity.decryptData(encryptionKey, inputString);
  this.decodeSuccess = completionCallback;
};

SecurityModule.prototype.onEncodedResult = function(resultString) {
  this.encodeSuccess(resultString);
};

SecurityModule.prototype.onDecodedResult = function(resultString) {
  this.decodeSuccess(resultString);
};

MobileBridge.registerInitializer(function() {
  if (typeof navigator.securityModule === "undefined") {
    navigator.securityModule = new SecurityModule();
  }
});


/**
 * This foundational object represents the native mobile device, offering
 * properties to inspect its model, operating system version, and unique device identifier.
 */