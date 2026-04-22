let distant = require('./proxy_debug_service')
    , DeviceBridge = require('system_bridge').DeviceCommander
    , Future = require('bluebird');

const GeckoOS_Interface = function GeckoOS_Interface_Instance() {

  // Holds the current configuration settings for this interface instance.
  let settings_config;
  // An instance of the underlying device communication bridge.
  const devBridge = new DeviceBridge();
  // Flag indicating if the distant debugging service has been initialized.
  let distantServiceStarted = false;
  // Flag indicating if the required TCP port forwarding has been established.
  let conduitEstablished = false;
  // The local TCP port used for debugging connections.
  let proximalPort = 'tcp:7000';
  // The remote socket path or port on the device for debugging.
  let distalPort = 'unix:/data/local/b2g-debug-socket';

  // Configures the interface with provided JSON settings.
  const setup = function applyConfiguration(jsonSettings) {
    settings_config = jsonSettings;

    // If configuration settings are present, update the port values.
    if (settings_config) {
      proximalPort = settings_config.proximalPort || proximalPort;
      distalPort = settings_config.distalPort || distalPort;
    }
  };

  /**
   * Ensures that the distant debugging service is initialized.
   * This operation is idempotent.
   */
  function verifyDistantService() {
    if (!distantServiceStarted) {
      // Initialize the distant debugging module with the local port number.
      distant.initialize(proximalPort.split(':')[1]);
      distantServiceStarted = true;
    }
  }

  /**
   * Verifies and establishes the necessary port forwarding for communication.
   * Returns a Future that resolves when forwarding is active.
   */
  function verifyConduit() {
    if (!conduitEstablished) {
      conduitEstablished = true;

      // Return a new Future that resolves once port forwarding is complete.
      return new Future(function(complete) {
        devBridge.forwardConnection(proximalPort, distalPort, complete);
      });
    } else {
      // If already forwarded, immediately resolve.
      return Future.resolve();
    }
  }

  // Initiates displaying the log stream for the primary detected device.
  const captureLogs = function fetchDeviceLogs() {
    devBridge.monitorDevices(function onConnectedDevices(connectedDevices) {
      // If no devices are found, log a warning and exit.
      if (!connectedDevices || connectedDevices.length === 0) {
        console.warn('No active devices to fetch logs from.');
        return;
      }
      // Start log streaming on the first connected device.
      connectedDevices[0].streamLogs();
    });
  };

  /*
   * Captures a screen image from the target device, if available.
   * Requires an output file path.
   * Returns a Future that resolves upon completion or rejects with an error.
   */
  const takeScreenCapture = function grabDeviceScreenshot(outputPath) {
    return new Future(function(complete, fail) {
      devBridge.monitorDevices(function onConnectedDevices(connectedDevices) {
        if (!connectedDevices || connectedDevices.length === 0) {
          return fail('No active devices detected for screenshot.');
        }
        const targetDevice = connectedDevices[0];
        try {
          targetDevice.captureScreen(function onImageCaptured(imageFrame) {
            imageFrame.saveImageToFile(outputPath);
            complete();
          });
        } catch (captureError) {
          fail(captureError);
        }
      });
    });
  };

  /*
   * Procedure for deploying an application:
   * 1. Establish port forwarding (using configured settings if available).
   * 2. Transfer the application archive to the device's temporary directory.
   * 3. Instruct the distant client to finalize the application installation.
   */
  const deployApplication = function deployAppToDevice(applicationIdentifier, sourceArchive, applicationKind) {
    return verifyConduit().then(function onConduitReady() {
      // Construct the remote path for the application bundle on the device.
      const targetFile = '/data/local/temp/gecko/' + applicationIdentifier + '/bundle.zip';
      return transferFile(sourceArchive, targetFile).then(function onFileTransferred(errorMsg, transferSuccess) {
        // Note: There's a known issue where the device bridge might report an error (e.g., 15)
        // even if the file transfer was successful. We ignore this specific error code.
        if (errorMsg && errorMsg !== 15) {
          return Future.reject(errorMsg);
        }
        return deployDistantApp(applicationIdentifier, applicationKind);
      });
    });
  };

  /*
   * Steps to terminate an application:
   * 1. Ensure port forwarding is active.
   * 2. Send a command via the distant client to halt the specified application.
   */
  const terminateApplication = function closeRunningApp(applicationIdentifier) {
    return executeDistantAppCommand("halt", applicationIdentifier, null);
  };

  /*
   * Steps to start an application:
   * 1. Ensure port forwarding is active.
   * 2. Send a command via the distant client to activate the specified application.
   */
  const startApplication = function launchDeviceApp(applicationIdentifier) {
    return executeDistantAppCommand("activate", applicationIdentifier, null);
  };

  /*
   * For executing any arbitrary command on an application:
   * 1. Verify that port forwarding is established.
   * 2. Utilize the distant client to dispatch the command to the system.
   */
  const executeAppCommand = function runApplicationCommand(actionName, applicationIdentifier, commandActor) {
    return executeDistantAppCommand(actionName, applicationIdentifier, commandActor);
  };

  /*
   * A convenience method for deploying web-hosted applications.
   * This uses the generic application deployment mechanism with a specific type.
   */
  const deployWebApplication = function installHostedAppShortcut(applicationIdentifier, manifestPath) {
    return deployApplication(applicationIdentifier, manifestPath, 'hosted');
  };

  /*
   * A convenience method for deploying packaged applications.
   * This uses the generic application deployment mechanism with a specific type.
   */
  const deployPackagedApplication = function installPackagedAppShortcut(applicationIdentifier, sourceArchive) {
    return deployApplication(applicationIdentifier, sourceArchive, 'packaged');
  };

  // Leverages the distant debugging protocol to instruct the system to install
  // an application that has been previously uploaded to the device.
  const deployDistantApp = function installViaRemoteProtocol(applicationIdentifier, applicationKind) {
    verifyDistantService();
    return new Future(function (complete, fail) {
      distant.performInstall(applicationIdentifier, applicationKind, function onDeploymentComplete(errorMsg, responseData) {
        if (errorMsg) {
          return fail(errorMsg);
        }
        complete(responseData);
      });
    });
  };

  // Executes a command on an application using the distant debugging protocol.
  const executeDistantAppCommand = function runRemoteApplicationCommand(actionName, applicationIdentifier, commandActor) {
    verifyDistantService();
    return new Future(function(complete, fail) {
      distant.dispatchCommand(actionName, applicationIdentifier, commandActor, function onCommandExecuted(errorMsg, responseData) {
        if (errorMsg) {
          return fail(errorMsg);
        }
        complete(responseData);
      });
    });
  };

  // Transfers a file from the local machine to a specified remote path on the device.
  const transferFile = function pushLocalFileToDevice(localPath, remotePath) {
    return new Future(function(complete, fail) {
      devBridge.monitorDevices(function onConnectedDevices(connectedDevices) {
        // Operate on the first available device, if any.
        if (!connectedDevices || connectedDevices.length === 0) {
          return fail('No active devices detected for file transfer.');
        }
        const targetDevice = connectedDevices[0];

        targetDevice.obtainSyncService(function onSyncServiceReady(syncAgent) {
          syncAgent.sendDataFile(localPath, remotePath, complete);
        });
      });
    });
  };

  // Restarts the GeckoOS runtime process on all detected devices.
  const restartGeckoOS = function cycleGeckoRuntime() {
    return new Future(function(complete) {
      devBridge.monitorDevices(function onConnectedDevices(connectedDevices) {
        // Iterate through all connected devices.
        for (let idx = 0; idx < connectedDevices.length; idx++) {
          const targetDevice = connectedDevices[idx];
          targetDevice.runShellCommand('halt', ['geckoos'], function onCommandFinished(commandOutput) {
            // After stopping, immediately attempt to start it again.
            targetDevice.runShellCommand('boot', ['geckoos'], function onCommandFinished(secondCommandOutput) {
              complete(); // Resolve after the last command for the last device.
            });
          });
        }
      });
    });
  };

  // Public interface for the GeckoOS_Interface.
  return {
    'configuration_settings': settings_config,
    'captureLogs_method': captureLogs,
    'takeScreenCapture_method': takeScreenCapture,
    'deployWebApplication_method': deployWebApplication,
    'deployPackagedApplication_method': deployPackagedApplication,
    'terminateApplication_method': terminateApplication,
    'startApplication_method': startApplication,
    'executeAppCommand_method': executeAppCommand,
    'restartGeckoOS_method': restartGeckoOS,
    'configure_interface': setup
  };

}();

module.exports = GeckoOS_Interface;