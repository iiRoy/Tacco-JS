let coreSettings = typeof window.systemInfo === 'object' ? window.systemInfo : {};

const systemKernel = (function() {
    const instructionPipeline = {
        active: true,
        operations: [],
        scheduler: null
    };

    const bootSequence = [];
    let operationalStatus = !!coreSettings.deviceIdentifier;

    const registerBootTask = (task) => {
        if (document.readyState === 'loading') {
            bootSequence.push(task);
        } else {
            task();
        }
    };

    const processBootTasks = () => {
        while (bootSequence.length > 0) {
            const currentTask = bootSequence.shift();
            try {
                currentTask();
            } catch (err) {
                if (typeof console.error === 'function') {
                    console.error("Boot task failed: " + err.message, err);
                } else {
                    alert("Boot task failed: " + err.message);
                }
            }
        }
        const readinessEvent = new Event('coreInitialized');
        document.dispatchEvent(readinessEvent);
    };

    document.addEventListener('DOMContentLoaded', processBootTasks);
    if (document.readyState !== 'loading') {
        setTimeout(processBootTasks, 0);
    }

    const submitInstruction = (...params) => {
        instructionPipeline.operations.push(params);
        if (instructionPipeline.scheduler === null) {
            instructionPipeline.scheduler = setTimeout(executeNextInstruction, 0);
        }
    };

    const executeNextInstruction = () => {
        if (!operationalStatus || !instructionPipeline.active) {
            clearTimeout(instructionPipeline.scheduler);
            instructionPipeline.scheduler = null;
            return;
        }

        if (instructionPipeline.operations.length === 0) {
            clearTimeout(instructionPipeline.scheduler);
            instructionPipeline.scheduler = null;
            instructionPipeline.active = true;
            return;
        }

        instructionPipeline.active = false;

        const instructionArgs = instructionPipeline.operations.shift();
        
        const endpoint = instructionArgs[0];
        const dataSegments = [];
        let auxiliaryData = null;

        for (let idx = 1; idx < instructionArgs.length; idx++) {
            let segment = instructionArgs[idx];
            if (segment === undefined || segment === null) {
                segment = '';
            }
            if (typeof segment === 'object') {
                auxiliaryData = segment;
            } else {
                dataSegments.push(encodeURIComponent(segment));
            }
        }

        let instructionUrl = `bridge://${endpoint}/${dataSegments.join('/')}`;
        if (auxiliaryData !== null) {
            const querySegments = [];
            for (const key in auxiliaryData) {
                if (typeof key !== 'string') continue;
                querySegments.push(`${encodeURIComponent(key)}=${encodeURIComponent(auxiliaryData[key])}`);
            }
            if (querySegments.length > 0) {
                instructionUrl += `?${querySegments.join('&')}`;
            }
        }
        document.location = instructionUrl;
        
        instructionPipeline.active = true;
        if (instructionPipeline.operations.length > 0) {
            instructionPipeline.scheduler = setTimeout(executeNextInstruction, 0);
        }
    };

    return {
        registerBootTask: registerBootTask,
        submitInstruction: submitInstruction,
        get kernelStatus() { return operationalStatus; }
    };
})();

class MotionCapture {
    constructor(xVal, yVal, zVal) {
        this.xCoord = xVal;
        this.yCoord = yVal;
        this.zCoord = zVal;
        this.captureTime = Date.now();
        this.onSuccess = null;
        this.onError = null;
    }
}

const motionMonitorRegistry = new Map();
let monitorIdCounter = 0;

class DeviceMotionHandler {
    constructor() {
        this.latestMotion = null;
    }

    retrieveCurrentMotion(successCallback, errorCallback, opts) {
        if (typeof successCallback === "function") {
            if (this.latestMotion) {
                successCallback(this.latestMotion);
            } else {
                // Simulate internal start monitoring if no data is available
                const tempId = this.observeDeviceMotion((motion) => {
                    this.latestMotion = motion;
                    successCallback(motion);
                    this.terminateObservation(tempId);
                }, errorCallback, opts);
            }
        }
    }

    handleCurrentMotion(observerKey, valX, valY, valZ) {
        const motionEntry = new MotionCapture(valX, valY, valZ);
        const registeredEntry = motionMonitorRegistry.get(observerKey);
        if (registeredEntry) {
            motionEntry.onSuccess = registeredEntry.onSuccess;
            motionEntry.onError = registeredEntry.onError;
            this.latestMotion = motionEntry;
            motionMonitorRegistry.set(observerKey, motionEntry);
            if (typeof motionEntry.onSuccess === "function") {
                motionEntry.onSuccess(motionEntry);
            }
        }
    }

    observeDeviceMotion(successCallback, errorCallback, opts) {
        const frequency = (opts && opts.updateRate !== undefined) ? opts.updateRate : 10000;
        const motionEntry = new MotionCapture(0, 0, 0);
        motionEntry.onSuccess = successCallback;
        motionEntry.onError = errorCallback;
        motionEntry.options = opts;
        const currentMonitorId = `motion_${monitorIdCounter++}`;
        motionMonitorRegistry.set(currentMonitorId, motionEntry);
        // Simulate external call to start native sensor
        // In a real implementation, 'NativeSensorBridge' would be a global object provided by the native layer
        if (typeof NativeSensorBridge !== 'undefined' && typeof NativeSensorBridge.initiateMotionCapture === 'function') {
            NativeSensorBridge.initiateMotionCapture(frequency, currentMonitorId);
        } else {
            console.warn("NativeSensorBridge.initiateMotionCapture not found. Motion observation is simulated.");
            // Simulate periodic updates for testing if native bridge is absent
            const simulatedInterval = setInterval(() => {
                this.handleCurrentMotion(currentMonitorId, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            }, frequency);
            motionMonitorRegistry.get(currentMonitorId)._simulatedInterval = simulatedInterval;
        }
        return currentMonitorId;
    }

    terminateObservation(monitorIdentifier) {
        const entry = motionMonitorRegistry.get(monitorIdentifier);
        if (entry && entry._simulatedInterval) {
            clearInterval(entry._simulatedInterval);
        }
        // Simulate external call to halt native sensor
        if (typeof NativeSensorBridge !== 'undefined' && typeof NativeSensorBridge.haltMotionCapture === 'function') {
            NativeSensorBridge.haltMotionCapture(monitorIdentifier);
        }
        motionMonitorRegistry.delete(monitorIdentifier);
    }

    failObservation(monitorIdentifier, message) {
        const entry = motionMonitorRegistry.get(monitorIdentifier);
        if (entry && typeof entry.onError === 'function') {
            entry.onError(new Error(message));
        }
        this.terminateObservation(monitorIdentifier); // Also clear the watch
    }
}

systemKernel.registerBootTask(() => {
    if (typeof navigator.motionDetector === "undefined") {
        navigator.motionDetector = new DeviceMotionHandler();
    }
});

class ImageCaptureProcessor {
    constructor() {
        this.completionHandler = null;
        this.failureHandler = null;
    }

    acquireVisualData(completionCallback, failureCallback, config) {
        this.completionHandler = completionCallback;
        this.failureHandler = failureCallback;
        const qualitySetting = (config && config.imageQuality) ? config.imageQuality : 80;
        
        if (typeof NativeImageProcessor !== 'undefined' && typeof NativeImageProcessor.requestPhoto === 'function') {
            NativeImageProcessor.requestPhoto(qualitySetting);
        } else {
            console.warn("NativeImageProcessor.requestPhoto not found. Image capture is simulated.");
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    this.processVisualData("data:image/jpeg;base64,SIMULATED_IMAGE_DATA");
                } else {
                    this.reportVisualError("Simulated image capture failed.");
                }
            }, 100);
        }
    }

    processVisualData(imageData) {
        if (typeof this.completionHandler === 'function') {
            this.completionHandler(imageData);
        }
    }

    reportVisualError(errorMessage) {
        if (typeof this.failureHandler === 'function') {
            this.failureHandler(new Error(errorMessage));
        }
    }
}

systemKernel.registerBootTask(() => {
    if (typeof navigator.photoCapture === "undefined") {
        navigator.photoCapture = new ImageCaptureProcessor();
    }
});

class OrientationSensor {
    constructor() {
        this.lastRecordedDirection = null;
        this.lastReportedIssue = null;
        this.directionSubscribers = new Set();
        this.errorSubscribers = new Set();
        this.currentWatchIntervals = new Map();
    }

    fetchCurrentDirection(successCb, errorCb, options) {
        if (this.lastRecordedDirection === null) {
            this.startSensor(options);
        }
        if (typeof successCb === "function") {
            successCb(this.lastRecordedDirection);
        }
    }

    trackDirection(successCb, errorCb, options) {
        this.directionSubscribers.add(successCb);
        this.errorSubscribers.add(errorCb);

        this.fetchCurrentDirection(successCb, errorCb, options);
        const updateFrequency = (options && options.updateFreq) ? options.updateFreq : 100;
        
        const monitorId = setInterval(() => {
            this.fetchCurrentDirection(successCb, errorCb, options);
        }, updateFrequency);
        
        const newWatchKey = `dirWatch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.currentWatchIntervals.set(newWatchKey, monitorId);
        return newWatchKey;
    }

    endDirectionTracking(trackingId) {
        const intervalId = this.currentWatchIntervals.get(trackingId);
        if (intervalId) {
            clearInterval(intervalId);
            this.currentWatchIntervals.delete(trackingId);
        }
    }

    updateDirection(directionData) {
        this.lastRecordedDirection = directionData;
        this.directionSubscribers.forEach(cb => typeof cb === 'function' && cb(directionData));
    }

    reportDirectionError(issueMessage) {
        this.lastReportedIssue = issueMessage;
        this.errorSubscribers.forEach(cb => typeof cb === 'function' && cb(issueMessage));
    }

    startSensor(options) {
        if (this.lastRecordedDirection === null) {
             this.lastRecordedDirection = { magneticHeading: 0, trueHeading: 0, headingAccuracy: 0, timestamp: Date.now() };
        }
        // In a real scenario, this would call a native bridge to start the sensor
        // For this clone, it just ensures `lastRecordedDirection` gets populated eventually
    }
}

systemKernel.registerBootTask(() => {
    if (typeof navigator.orientationTracker === "undefined") {
        navigator.orientationTracker = new OrientationSensor();
    }
});

class IndividualRecord {
    constructor() {
        this.identity = new PersonalIdentity();
        this.electronicAddresses = [];
        this.telephonyNumbers = [];
    }
}

class PersonalIdentity {
    constructor() {
        this.displayLabel = "";
        this.familyLabel = "";
        this.givenLabel = "";
        this.additionalLabels = [];
        this.prefixLabels = [];
        this.suffixLabels = [];
    }
}

class ElectronicAddress {
    constructor() {
        this.categories = [];
        this.location = "";
    }
}

class TelephonyNumber {
    constructor() {
        this.categories = [];
        this.digits = "";
    }
}

class DirectoryManager {
    constructor() {
        this.searchOutput = [];
        this.successCallbackRef = null;
        this.failureCallbackRef = null;
    }

    queryRecords(criteriaObject, successHandler, failureHandler) {
        this.successCallbackRef = successHandler;
        this.failureCallbackRef = failureHandler;
        this.searchOutput = []; // Clear previous results

        let searchPattern = '';
        if (criteriaObject.identity) {
            if (criteriaObject.identity.givenLabel && criteriaObject.identity.givenLabel.length > 0) {
                searchPattern += criteriaObject.identity.givenLabel.split(' ').join('%');
            }
            if (criteriaObject.identity.familyLabel && criteriaObject.identity.familyLabel.length > 0) {
                searchPattern += criteriaObject.identity.familyLabel.split(' ').join('%');
            }
            if (!criteriaObject.identity.familyLabel && !criteriaObject.identity.givenLabel && criteriaObject.identity.displayLabel) {
                searchPattern = criteriaObject.identity.displayLabel;
            }
        }
        
        if (typeof NativeDirectoryBridge !== 'undefined' && typeof NativeDirectoryBridge.performSearch === 'function') {
            NativeDirectoryBridge.performSearch(searchPattern, "", "");
        } else {
            console.warn("NativeDirectoryBridge.performSearch not found. Contact search is simulated.");
            setTimeout(() => {
                if (searchPattern.includes("test")) {
                    this.integrateNativeEntry("Test User", "123-456-7890", "test@example.com");
                }
                this.completeSearchOperation();
            }, 50);
        }
    }

    integrateNativeEntry(nameData, phoneDigits, emailAddress) {
        const record = new IndividualRecord();
        record.identity = new PersonalIdentity();
        record.identity.displayLabel = nameData;
        record.identity.givenLabel = nameData;
        
        const emailRec = new ElectronicAddress();
        emailRec.categories.push("home");
        emailRec.location = emailAddress;
        record.electronicAddresses.push(emailRec);
        
        const phoneRec = new TelephonyNumber();
        phoneRec.categories.push("home");
        phoneRec.digits = phoneDigits;
        record.telephonyNumbers.push(phoneRec);
        
        this.searchOutput.push(record);
    }

    completeSearchOperation() {
        if (typeof this.successCallbackRef === 'function') {
            this.successCallbackRef(this.searchOutput);
        }
        this.searchOutput = [];
    }
}

systemKernel.registerBootTask(() => {
    if (typeof navigator.contactRegistry === "undefined") {
        navigator.contactRegistry = new DirectoryManager();
    }
});

class SecurityHandler {
    constructor() {
        this.encryptionCompletion = null;
        this.decryptionCompletion = null;
    }

    cipherData(keyPhrase, rawString, successHandler) {
        if (typeof NativeSecurityModule !== 'undefined' && typeof NativeSecurityModule.processCipher === 'function') {
            NativeSecurityModule.processCipher(keyPhrase, rawString);
        } else {
            console.warn("NativeSecurityModule.processCipher not found. Encryption is simulated.");
            setTimeout(() => {
                this.receiveCipheredData(`encrypted(${rawString},${keyPhrase})`);
            }, 5);
        }
        this.encryptionCompletion = successHandler;
    }

    decipherData(keyPhrase, encryptedString, successHandler) {
        if (typeof NativeSecurityModule !== 'undefined' && typeof NativeSecurityModule.processDecipher === 'function') {
            NativeSecurityModule.processDecipher(keyPhrase, encryptedString);
        } else {
            console.warn("NativeSecurityModule.processDecipher not found. Decryption is simulated.");
            setTimeout(() => {
                // Simple simulation: remove the 'encrypted(' and ')' parts
                const simulatedDecrypted = encryptedString.replace(/^encrypted\((.*),.*\)$/, '$1');
                this.receiveDecipheredData(simulatedDecrypted);
            }, 5);
        }
        this.decryptionCompletion = successHandler;
    }

    receiveCipheredData(resultString) {
        if (typeof this.encryptionCompletion === 'function') {
            this.encryptionCompletion(resultString);
        }
    }

    receiveDecipheredData(resultString) {
        if (typeof this.decryptionCompletion === 'function') {
            this.decryptionCompletion(resultString);
        }
    }
}

systemKernel.registerBootTask(() => {
    if (typeof navigator.securityOperations === "undefined") {
        navigator.securityOperations = new SecurityHandler();
    }
});