const debugClient = require('./remote_debugger'); // Client for remote debugging operations.
const AndroidBridge = require('adb').DebugBridge; // Interface for Android Debug Bridge.
const AsyncOp = require('promise'); // Promise library for asynchronous control flow.

// Main module for Firefox OS automation tasks.
const FirefoxOSAutomationAgent = function AutomationModule() {

  // Internal state variables, using `let` and `const` for modern JavaScript.
  let currentSettings = { // Default configuration for the agent, can be overridden.
    localPort: 'tcp:6000', // Local TCP port for the debugger client.
    remotePort: 'localfilesystem:/data/local/debugger-socket' // Remote socket path on the device.
  };
  const deviceBridge = new AndroidBridge(); // Instance of the ADB client for device interaction.
  let clientConnectionEstablished = false; // Flag to track remote client initialization status.
  let tunnelActive = false; // Flag to indicate if the ADB port forwarding tunnel is active.

  // --- Utility Helper Functions ---

  // Extracts the numeric port from a 'tcp:PORT' string.
  const _extractPortNumber = (portString) => {
    const parts = portString.split(':');
    if (parts.length > 1 && parts[0] === 'tcp') {
      const portNum = parseInt(parts[1], 10);
      if (!isNaN(portNum) && portNum > 0 && portNum < 65536) {
        return portNum;
      }
    }
    console.warn(`[Agent:Warn] Invalid port string format or value: '${portString}'. Falling back to default (6000).`);
    return 6000; // Default fallback port.
  };

  // Retrieves the first available Android device, or rejects if none are found.
  const _getSingleDevice = () => {
    return new AsyncOp((resolve, reject) => {
      deviceBridge.traceDevice((devices) => {
        if (!devices || devices.length === 0) {
          return reject(new Error('No connected Android devices were found. Please ensure a device is connected and ADB is working.'));
        }
        resolve(devices[0]); // Return the first device found.
      });
    });
  };

  // Constructs the remote file path for application deployment on the device.
  const _buildRemoteAppPath = (appIdentifier) => {
    if (!appIdentifier || typeof appIdentifier !== 'string') {
      throw new Error('Invalid application identifier provided for remote path construction.');
    }
    // Using template literals for clear path construction.
    return `/data/local/tmp/b2g/${appIdentifier}/application.zip`;
  };

  // --- Core Agent Functions ---

  /**
   * Applies new configuration settings to the agent.
   * @param {object} newSettings - An object containing updated configuration properties.
   */
  const applyConfiguration = (newSettings) => {
    if (!newSettings || typeof newSettings !== 'object' || Object.keys(newSettings).length === 0) {
      console.warn('[Agent:Warn] Attempted to apply invalid or empty configuration. Ignoring update.');
      return; // Exit early for invalid input.
    }
    // Merge new settings with existing ones, prioritizing new values.
    currentSettings = { ...currentSettings, ...newSettings };
    console.log('[Agent:Info] Configuration updated:', currentSettings);
  };

  /**
   * Ensures the remote debugging client is initialized and ready for communication.
   * This function is idempotent; it initializes only if not already done.
   */
  const ensureClientReadiness = () => {
    if (!clientConnectionEstablished) {
      const debugPort = _extractPortNumber(currentSettings.localPort);
      // Initialize the remote client with the extracted local port.
      debugClient.init(debugPort);
      clientConnectionEstablished = true;
      console.log(`[Agent:Info] Remote debug client successfully initialized on port ${debugPort}.`);
    } else {
      console.log('[Agent:Info] Remote debug client is already ready.');
    }
  };

  /**
   * Establishes a port forwarding tunnel from the local machine to the device via ADB.
   * This is a prerequisite for remote debugging and app installation.
   * @returns {AsyncOp<string>} A promise that resolves when the tunnel is active, or rejects on failure.
   */
  const establishPortTunnel = () => {
    if (tunnelActive) {
      console.log('[Agent:Info] ADB port tunnel already active. Skipping re-forwarding.');
      return AsyncOp.resolve('Port tunnel already established.');
    }

    return new AsyncOp((resolve, reject) => {
      const local = currentSettings.localPort;
      const remote = currentSettings.remotePort;

      console.log(`[Agent:Info] Attempting to forward ADB port: ${local} -> ${remote}`);
      deviceBridge.forward(local, remote, (err) => {
        if (err) {
          tunnelActive = false; // Reset flag if an error occurs.
          return reject(new Error(`Failed to forward port ${local} to ${remote}: ${err.message || err}`));
        }
        tunnelActive = true;
        console.log(`[Agent:Info] ADB port forwarding successful: ${local} -> ${remote}`);
        resolve('ADB port tunnel established.');
      });
    });
  };

  /**
   * Initiates continuous logcat monitoring for the primary connected device.
   * Logs device messages to the console.
   */
  const monitorDeviceLogs = () => {
    _getSingleDevice()
      .then(targetDevice => {
        console.log(`[Agent:Info] Starting logcat monitoring for device: ${targetDevice.id}`);
        targetDevice.logcat(); // Commands the device to start logging.
      })
      .catch(error => {
        console.error(`[Agent:Error] Could not start logcat monitoring: ${error.message}`);
      });
  };

  /**
   * Captures a screenshot from the primary connected device and saves it to a specified file path.
   * @param {string} outputPath - The local file path where the screenshot will be saved.
   * @returns {AsyncOp<string>} A promise that resolves upon successful capture and save, or rejects on error.
   */
  const captureScreenImage = (outputPath) => {
    if (!outputPath || typeof outputPath !== 'string' || outputPath.trim().length === 0) {
      return AsyncOp.reject(new Error('Invalid or empty output path provided for screenshot.'));
    }

    return _getSingleDevice()
      .then(targetDevice => {
        console.log(`[Agent:Info] Capturing screen snapshot from device ${targetDevice.id}...`);
        return new AsyncOp((resolve, reject) => {
          try {
            targetDevice.takeSnapshot(frameData => {
              // writeImageFile often has a callback for completion/errors.
              frameData.writeImageFile(outputPath, (err) => {
                if (err) {
                  return reject(new Error(`Failed to write screenshot to ${outputPath}: ${err.message || err}`));
                }
                console.log(`[Agent:Info] Screenshot successfully saved to: ${outputPath}`);
                resolve('Screenshot captured and saved successfully.');
              });
            });
          } catch (error) {
            reject(new Error(`An unexpected error occurred during screenshot capture: ${error.message}`));
          }
        });
      })
      .catch(error => {
        console.error(`[Agent:Error] Screenshot operation failed: ${error.message}`);
        return AsyncOp.reject(error);
      });
  };

  /**
   * Pushes a local file to a specified remote location on the device.
   * This function handles finding the device and initiating the sync service.
   * @param {string} sourcePath - The local path of the file to transfer.
   * @param {string} destinationPath - The remote path on the device where the file will be saved.
   * @returns {AsyncOp<string|Error>} A promise that resolves with a success message, or an Error object if the known ADB bug (code 15) occurs, otherwise rejects on other errors.
   */
  const transferFileToDevice = (sourcePath, destinationPath) => {
    if (!sourcePath || !destinationPath) {
      return AsyncOp.reject(new Error('Both source and destination paths are required for file transfer.'));
    }
    console.log(`[Agent:Info] Initiating file transfer from '${sourcePath}' to '${destinationPath}'...`);

    return _getSingleDevice()
      .then(targetDevice => {
        return new AsyncOp((resolve, reject) => {
          targetDevice.getSyncService((err, syncService) => {
            if (err) {
              return reject(new Error(`Failed to acquire sync service on device: ${err.message || err}`));
            }
            syncService.pushFile(sourcePath, destinationPath, (pushErr) => {
              if (pushErr) {
                // Known ADB bug: sometimes returns error 15 despite successful upload.
                // We resolve with the error object for specific handling in the caller.
                if (pushErr.code === 15) {
                  console.warn(`[Agent:Warn] ADB file push reported error code 15 for '${sourcePath}'. This is a known ADB bug; proceeding cautiously.`);
                  return resolve(pushErr); // Resolve with the error for special handling.
                }
                return reject(new Error(`File transfer failed: ${pushErr.message || pushErr}`));
              }
              console.log(`[Agent:Info] File successfully transferred: '${sourcePath}' -> '${destinationPath}'`);
              resolve('File transfer completed.');
            });
          });
        });
      })
      .catch(error => {
        console.error(`[Agent:Error] File transfer operation failed: ${error.message}`);
        return AsyncOp.reject(error);
      });
  };

  /**
   * Uses the remote debugging protocol to instruct the system to install a previously uploaded application.
   * @param {string} appIdentifier - The unique identifier of the application.
   * @param {string} deploymentType - The type of application (e.g., '1' for hosted, '2' for packaged).
   * @returns {AsyncOp<object>} A promise that resolves with installation data, or rejects on failure.
   */
  const initiateRemoteInstallation = (appIdentifier, deploymentType) => {
    ensureClientReadiness(); // Ensure the remote client is ready before sending commands.
    console.log(`[Agent:Info] Remotely installing application '${appIdentifier}' (type: ${deploymentType})...`);

    return new AsyncOp((resolve, reject) => {
      debugClient.installApp(appIdentifier, deploymentType, (err, responseData) => {
        if (err) {
          console.error(`[Agent:Error] Remote installation failed for '${appIdentifier}': ${err.message || err}`);
          return reject(new Error(`Remote installation error: ${err.message || 'Unknown error'}`));
        }
        console.log(`[Agent:Info] Remote installation successful for '${appIdentifier}'.`);
        resolve(responseData);
      });
    });
  };

  /**
   * Executes a command on an application via the remote debugging client.
   * This is a generic interface for app-specific remote actions.
   * @param {string} actionName - The name of the command to execute (e.g., "launch", "close").
   * @param {string} targetAppId - The identifier of the target application.
   * @param {string|null} actorIdentifier - An optional actor identifier related to the command.
   * @returns {AsyncOp<object>} A promise that resolves with the command's response data, or rejects on failure.
   */
  const executeAppCommand = (actionName, targetAppId, actorIdentifier) => {
    ensureClientReadiness(); // Ensure the remote client is ready.
    console.log(`[Agent:Info] Executing remote command '${actionName}' on app '${targetAppId}'.`);

    return new AsyncOp((resolve, reject) => {
      debugClient.appCommand(actionName, targetAppId, actorIdentifier, (err, responseData) => {
        if (err) {
          console.error(`[Agent:Error] Remote command '${actionName}' failed for '${targetAppId}': ${err.message || err}`);
          return reject(new Error(`Remote command error: ${err.message || 'Unknown error'}`));
        }
        console.log(`[Agent:Info] Remote command '${actionName}' successful for '${targetAppId}'.`);
        resolve(responseData);
      });
    });
  };

  /**
   * Deploys an application to the device, handling port forwarding, file transfer, and remote installation.
   * This is a composite operation.
   * @param {string} appIdentifier - The unique identifier for the application.
   * @param {string} packagePath - The local path to the application's zip or manifest file.
   * @param {string} deploymentType - The type of application deployment (e.g., '1' for hosted, '2' for packaged).
   * @returns {AsyncOp<object>} A promise that resolves with the installation details, or rejects on error.
   */
  const deployApplication = (appIdentifier, packagePath, deploymentType) => {
    // Basic input validation.
    if (!appIdentifier || !packagePath || !deploymentType) {
      return AsyncOp.reject(new Error('Missing required parameters for application deployment (identifier, path, type).'));
    }

    console.log(`[Agent:Info] Preparing to deploy app '${appIdentifier}' from local path: '${packagePath}'.`);

    return establishPortTunnel() // Step 1: Ensure port forwarding is active.
      .then(() => _buildRemoteAppPath(appIdentifier)) // Step 2: Construct the remote destination path.
      .then(remoteDestination => {
        console.log(`[Agent:Info] Pushing application package '${packagePath}' to device at '${remoteDestination}'...`);
        return transferFileToDevice(packagePath, remoteDestination) // Step 3: Transfer the package.
          .then((transferResult) => {
            // Handle the known ADB bug (error code 15) specifically.
            if (transferResult instanceof Error && transferResult.code === 15) {
              console.warn(`[Agent:Warn] File push for '${appIdentifier}' completed with ADB error 15 (known bug). Proceeding with installation.`);
            } else if (transferResult instanceof Error) {
              return AsyncOp.reject(transferResult); // Re-reject actual transfer errors.
            }
            console.log(`[Agent:Info] File transfer complete for '${appIdentifier}'. Initiating remote installation.`);
            return initiateRemoteInstallation(appIdentifier, deploymentType); // Step 4: Trigger remote installation.
          });
      })
      .catch(error => {
        console.error(`[Agent:Error] Application deployment failed for '${appIdentifier}': ${error.message}`);
        return AsyncOp.reject(error);
      });
  };

  /**
   * Restarts the B2G (Boot to Gecko) service on all connected devices.
   * This involves stopping and then starting the service.
   * @returns {AsyncOp<string>} A promise that resolves when the restart sequence is attempted on all devices.
   */
  const restartB2GService = () => {
    console.log('[Agent:Info] Initiating B2G service restart sequence on connected devices.');

    return new AsyncOp((resolve, reject) => {
      deviceBridge.traceDevice((devices) => {
        if (!devices || devices.length === 0) {
          console.warn('[Agent:Warn] No devices found to restart B2G service. Operation skipped.');
          return resolve('No devices available for B2G service restart.');
        }

        const restartPromises = devices.map(device => {
          return new AsyncOp((deviceResolve) => {
            console.log(`[Agent:Info] Stopping B2G service on device: ${device.id}...`);
            device.shellCmd('stop', ['b2g'], (stopResponse) => {
              if (stopResponse.error) {
                console.warn(`[Agent:Warn] Error stopping B2G on ${device.id}: ${stopResponse.error}`);
              }
              console.log(`[Agent:Info] Starting B2G service on device: ${device.id}...`);
              device.shellCmd('start', ['b2g'], (startResponse) => {
                if (startResponse.error) {
                  console.warn(`[Agent:Warn] Error starting B2G on ${device.id}: ${startResponse.error}`);
                }
                console.log(`[Agent:Info] B2G restart sequence completed for device: ${device.id}.`);
                deviceResolve(); // Resolve individual device promise.
              });
            });
          });
        });

        AsyncOp.all(restartPromises) // Wait for all device restart operations to complete.
          .then(() => {
            console.log('[Agent:Info] All B2G services restart attempts have concluded.');
            resolve('B2G services restarted on all detected devices.');
          })
          .catch(err => {
            console.error(`[Agent:Error] An error occurred during B2G service restart: ${err.message}`);
            reject(err);
          });
      });
    });
  };

  // --- Public API ---

  // The public interface exposed by the automation agent.
  return {
    // Exposing current settings as a read-only property (use applyConfiguration for changes).
    currentConfig: currentSettings,
    applyConfiguration: applyConfiguration,
    monitorDeviceLogs: monitorDeviceLogs,
    captureScreenImage: captureScreenImage,

    /**
     * Deploys a hosted application to the device.
     * @param {string} appIdentifier - The unique identifier of the hosted application.
     * @param {string} manifestFile - The local path to the application's manifest file.
     * @returns {AsyncOp<object>} A promise that resolves with installation details.
     */
    deployHostedApp: (appIdentifier, manifestFile) => {
      console.log(`[Agent:Info] Initiating deployment for hosted app: ${appIdentifier}`);
      return deployApplication(appIdentifier, manifestFile, '1'); // '1' typically denotes a hosted app.
    },

    /**
     * Deploys a packaged application to the device.
     * @param {string} appIdentifier - The unique identifier of the packaged application.
     * @param {string} localZipPackage - The local path to the application's .zip package.
     * @returns {AsyncOp<object>} A promise that resolves with installation details.
     */
    deployPackagedApp: (appIdentifier, localZipPackage) => {
      console.log(`[Agent:Info] Initiating deployment for packaged app: ${appIdentifier}`);
      return deployApplication(appIdentifier, localZipPackage, '2'); // '2' typically denotes a packaged app.
    },

    /**
     * Terminates a running application on the device.
     * @param {string} targetAppId - The identifier of the application to close.
     * @returns {AsyncOp<object>} A promise that resolves with command results.
     */
    terminateApplication: (targetAppId) => {
      console.log(`[Agent:Info] Requesting termination of application: ${targetAppId}`);
      return executeAppCommand("close", targetAppId, null);
    },

    /**
     * Launches an application on the device.
     * @param {string} targetAppId - The identifier of the application to launch.
     * @returns {AsyncOp<object>} A promise that resolves with command results.
     */
    startApplication: (targetAppId) => {
      console.log(`[Agent:Info] Requesting launch of application: ${targetAppId}`);
      return executeAppCommand("launch", targetAppId, null);
    },

    /**
     * Executes a generic action on an application via the remote debugger.
     * @param {string} actionName - The name of the action to perform (e.g., "focus", "debug").
     * @param {string} targetAppId - The identifier of the target application.
     * @param {string|null} actorIdentifier - Optional actor ID for the command.
     * @returns {AsyncOp<object>} A promise that resolves with command results.
     */
    triggerAppAction: (actionName, targetAppId, actorIdentifier) => {
      console.log(`[Agent:Info] Triggering custom action '${actionName}' for app '${targetAppId}'.`);
      return executeAppCommand(actionName, targetAppId, actorIdentifier);
    },

    restartB2GService: restartB2GService
  };

}();

// Export the instantiated automation agent for external use.
module.exports = FirefoxOSAutomationAgent;