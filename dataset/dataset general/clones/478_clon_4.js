const debuggerClient = require('./remote_debugger');
const DeviceAccess = require('adb').DebugBridge;
const AsyncOp = require('promise');

function generateSystemInterface() {
    let systemParameters = {};
    const deviceGateway = new DeviceAccess();
    let debuggerStatus = false;
    let connectivityStatus = false;
    let localPortIdentifier = 'tcp:6000';
    let remotePortIdentifier = 'localfilesystem:/data/local/debugger-socket';

    const adjustSystemParameters = function(configurationObject) {
        systemParameters = configurationObject;
        if (systemParameters) {
            localPortIdentifier = systemParameters.localPort || localPortIdentifier;
            remotePortIdentifier = systemParameters.remotePort || remotePortIdentifier;
        }
    };

    const verifyDebuggerReadiness = function() {
        if (!debuggerStatus) {
            debuggerClient.init(localPortIdentifier.split(':')[1]);
            debuggerStatus = true;
        }
    };

    const establishConnectionTunnel = async function() {
        if (connectivityStatus) {
            return;
        }
        connectivityStatus = true;
        return new AsyncOp(resolve => {
            deviceGateway.forward(localPortIdentifier, remotePortIdentifier, resolve);
        });
    };

    const acquirePrimaryDevice = async function() {
        return new AsyncOp((resolve, reject) => {
            deviceGateway.traceDevice(devices => {
                if (!devices || devices.length === 0) {
                    return reject(new Error('No compatible gadgets found.'));
                }
                resolve(devices[0]);
            });
        });
    };

    const sendFileToTarget = async function(sourcePath, destinationPath) {
        const targetDevice = await acquirePrimaryDevice();
        return new AsyncOp((resolve, reject) => {
            targetDevice.getSyncService(syncAgent => {
                syncAgent.pushFile(sourcePath, destinationPath, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });
    };

    const deployRemoteApplication = async function(appId, appKind) {
        verifyDebuggerReadiness();
        return new AsyncOp((resolve, reject) => {
            debuggerClient.installApp(appId, appKind, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    };

    const transmitApplicationCommand = async function(cmd, appId, actorRef) {
        verifyDebuggerReadiness();
        return new AsyncOp((resolve, reject) => {
            debuggerClient.appCommand(cmd, appId, actorRef, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    };

    const monitorDeviceLogs = async function() {
        const activeDevice = await acquirePrimaryDevice();
        activeDevice.logcat();
    };

    const captureDeviceDisplay = async function(outputFilename) {
        const activeDevice = await acquirePrimaryDevice();
        return new AsyncOp((resolve, reject) => {
            try {
                activeDevice.takeSnapshot(imageData => {
                    imageData.writeImageFile(outputFilename);
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    const installSoftwarePackage = async function(appIdentifier, localArchive, appVariant) {
        await establishConnectionTunnel();
        const remoteArchivePath = `/data/local/tmp/b2g/${appIdentifier}/application.zip`;
        try {
            await sendFileToTarget(localArchive, remoteArchivePath);
        } catch (transferErr) {
            if (transferErr && transferErr.message !== '15') {
                throw transferErr;
            }
        }
        return deployRemoteApplication(appIdentifier, appVariant);
    };

    const deployWebApplication = async function(appIdentifier, manifestFile) {
        return installSoftwarePackage(appIdentifier, manifestFile, '1');
    };

    const deployBundledApplication = async function(appIdentifier, localZipFile) {
        return installSoftwarePackage(appIdentifier, localZipFile, '2');
    };

    const terminateRunningApplication = async function(appIdentifier) {
        return transmitApplicationCommand("close", appIdentifier, null);
    };

    const initiateTargetApplication = async function(appIdentifier) {
        return transmitApplicationCommand("launch", appIdentifier, null);
    };

    const issueGenericApplicationCommand = async function(commandName, appIdentifier, actorDetails) {
        return transmitApplicationCommand(commandName, appIdentifier, actorDetails);
    };

    const cycleRuntimeEnvironment = async function() {
        const activeDevice = await acquirePrimaryDevice();
        return new AsyncOp(resolve => {
            activeDevice.shellCmd('stop', ['b2g'], () => {
                activeDevice.shellCmd('start', ['b2g'], () => resolve());
            });
        });
    };

    return {
        'systemParameters': systemParameters,
        'monitorLogs': monitorDeviceLogs,
        'captureDisplay': captureDeviceDisplay,
        'installWeb': deployWebApplication,
        'installBundled': deployBundledApplication,
        'closeApp': terminateRunningApplication,
        'launchApp': initiateTargetApplication,
        'issueCommand': issueGenericApplicationCommand,
        'resetRuntime': cycleRuntimeEnvironment
    };
}

module.exports = generateSystemInterface();