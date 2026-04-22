'use strict';

// Core Node.js module for file system operations
const fileSystemOps = require('fs');
// External utility for executing shell commands synchronously
const cmdExecUtil = require('execsyncs');
// Utility for recursive directory removal, using a more descriptive alias
const dirCleanup = require('rimraf');

// --- Configuration Constants for the Ephemeral Build Cache Volume ---
const TOTAL_VOLUME_SIZE_B = 2 * 1024 * 1024 * 1024; // Specifies 2 Gigabytes for the temporary volume
const STORAGE_UNIT_B = 512; // Standard block size in bytes, a common disk allocation unit
const NUM_STORAGE_UNITS = TOTAL_VOLUME_SIZE_B / STORAGE_UNIT_B; // Calculated total number of blocks for the volume
const VOLUME_LABEL_STR = "EphemeralBuildCache"; // The user-friendly name for the ramdisk volume
const LOG_COMPONENT_NAME = "cli-cache-mgr"; // Prefix for all console output from this module

// Dynamically determine the canonical mount point based on the operating system at module load time
const MOUNT_POINT_DIR = (function determineVolumeMountPath() {
  const currentOSIdentifier = process.platform;
  if (currentOSIdentifier === "darwin") {
    return `/Volumes/${VOLUME_LABEL_STR}`;
  } else if (currentOSIdentifier === "linux") {
    return `/mnt/${VOLUME_LABEL_STR}`;
  }
  // For unsupported platforms, return null; further logic will handle this
  return null;
})();

/**
 * Provides a standardized logging mechanism for informational messages.
 * @param {...any} messages - One or more data elements to log.
 */
function outputLog(...messages) {
  console.log(`${LOG_COMPONENT_NAME}:`, ...messages);
}

/**
 * Provides a standardized logging mechanism for error messages.
 * @param {...any} messages - One or more data elements to log as errors.
 */
function outputError(...messages) {
  console.error(`${LOG_COMPONENT_NAME}: ERROR:`, ...messages);
}

/**
 * Checks if the ephemeral volume's mount point currently exists on the file system.
 * @returns {boolean} True if the designated mount point directory exists, false otherwise.
 */
function checkVolumePresence() {
  if (!MOUNT_POINT_DIR) {
    outputError("Mount point path was not determined during initialization; cannot verify volume presence.");
    return false;
  }
  return fileSystemOps.existsSync(MOUNT_POINT_DIR);
}

/**
 * Executes a given shell command synchronously and captures its standard output.
 * Throws an error if the command fails to execute.
 * @param {string} shellOperation - The complete command string to be executed.
 * @returns {string} The trimmed standard output from the executed command.
 * @throws {Error} An error containing details if the command execution is unsuccessful.
 */
function executeShellOperation(shellOperation) {
  outputLog(`Attempting shell operation: '${shellOperation}'`);
  try {
    const operationResult = cmdExecUtil(shellOperation).toString().trim();
    // No outputLog for successful command results to keep console clean, unless needed for debugging.
    return operationResult;
  } catch (executionIssue) {
    const detailedErrorMessage = `Command failed ('${shellOperation}'): ${executionIssue.message}`;
    outputError(detailedErrorMessage);
    throw new Error(`${LOG_COMPONENT_NAME}: ${detailedErrorMessage}`);
  }
}

/**
 * Manages the cleanup of an application's temporary directory.
 * It first checks if the path is a symlink, then if it's an empty regular directory.
 * @param {string} appTempDirectoryPath - The absolute path to the application's temporary build directory.
 * @throws {Error} If the directory is non-empty and not a symlink, or if removal fails.
 */
function manageAppTempDirectoryCleanup(appTempDirectoryPath) {
  // Input validation
  if (!appTempDirectoryPath || typeof appTempDirectoryPath !== 'string') {
    throw new Error(`${LOG_COMPONENT_NAME}: Invalid path provided for temporary directory cleanup.`);
  }

  if (!fileSystemOps.existsSync(appTempDirectoryPath)) {
    outputLog(`Target temporary directory '${appTempDirectoryPath}' does not exist; no cleanup necessary.`);
    return; // Nothing to do if it doesn't exist
  }

  const pathStats = fileSystemOps.lstatSync(appTempDirectoryPath);

  if (pathStats.isSymbolicLink()) {
    outputLog(`Found existing symbolic link at '${appTempDirectoryPath}'. Removing the symlink.`);
    try {
      fileSystemOps.unlinkSync(appTempDirectoryPath); // Remove the symlink itself
      outputLog(`Successfully removed symbolic link: '${appTempDirectoryPath}'`);
    } catch (unlinkError) {
      throw new Error(`${LOG_COMPONENT_NAME}: Failed to remove existing symbolic link '${appTempDirectoryPath}': ${unlinkError.message}`);
    }
    return; // Symlink handled, no further directory cleanup needed for this path
  }

  // If it's a regular directory, check its contents
  const directoryContents = fileSystemOps.readdirSync(appTempDirectoryPath);
  if (directoryContents.length > 0) {
    throw new Error(`The application's temporary directory ('${appTempDirectoryPath}') is not empty and is not a symlink. Please manually empty or remove it to proceed. Contents: ${directoryContents.join(', ')}`);
  }

  outputLog(`Attempting to recursively remove empty directory: '${appTempDirectoryPath}'`);
  try {
    dirCleanup.sync(appTempDirectoryPath); // Use rimraf for robust recursive removal
    outputLog(`Successfully cleared directory: '${appTempDirectoryPath}'`);
  } catch (removalIssue) {
    throw new Error(`${LOG_COMPONENT_NAME}: Critical error: Could not remove directory '${appTempDirectoryPath}': ${removalIssue.message}`);
  }
}

/**
 * Provisions the underlying storage device for the ephemeral volume based on the detected OS.
 * @returns {string} The system-specific identifier for the newly created device (e.g., '/dev/diskX' on macOS).
 * @throws {Error} If the device creation fails or the operating system is not supported.
 */
function provisionRawVolumeStorage() {
  const currentOS = process.platform;
  let deviceSystemIdentifier = '';

  if (currentOS === "darwin") {
    // macOS: Utilize hdiutil to allocate a ramdisk and retrieve its device path.
    const hdiutilOutput = executeShellOperation(`hdiutil attach -nomount ram://${NUM_STORAGE_UNITS}`);
    // The output from hdiutil attach typically starts with the device path on the first line.
    deviceSystemIdentifier = hdiutilOutput.split('\n')[0].trim();
    if (!deviceSystemIdentifier.startsWith('/dev/disk')) {
      throw new Error(`${LOG_COMPONENT_NAME}: Unexpected output format from 'hdiutil' during device provisioning: ${hdiutilOutput}`);
    }
  } else if (currentOS === "linux") {
    // Linux: For tmpfs, the "device" is conceptual. We ensure the mount point exists.
    // The mount command handles the actual creation of the tmpfs filesystem.
    executeShellOperation(`sudo mkdir -p ${MOUNT_POINT_DIR}`);
    deviceSystemIdentifier = MOUNT_POINT_DIR; // On Linux, the mount point acts as the identifier for tmpfs setup.
  } else {
    throw new Error(`${LOG_COMPONENT_NAME}: Unsupported operating system for raw volume provisioning: '${currentOS}'.`);
  }
  outputLog(`Raw volume storage provisioned. System identifier: '${deviceSystemIdentifier}'`);
  return deviceSystemIdentifier;
}

/**
 * Formats and mounts the provisioned raw storage as an ephemeral volume.
 * @param {string} deviceSystemIdentifier - The system identifier of the raw device to be mounted.
 * @throws {Error} If the mounting process fails or the OS is unsupported.
 */
function formatAndMountEphemeralVolume(deviceSystemIdentifier) {
  if (!deviceSystemIdentifier) {
    throw new Error(`${LOG_COMPONENT_NAME}: No device system identifier provided for mounting the volume.`);
  }

  const currentOS = process.platform;

  if (currentOS === "darwin") {
    // macOS: Erase the device and format it with HFS+ filesystem, then mount it.
    executeShellOperation(`diskutil erasevolume HFS+ "${VOLUME_LABEL_STR}" ${deviceSystemIdentifier}`);
  } else if (currentOS === "linux") {
    // Linux: Mount a tmpfs filesystem at the designated mount point.
    // Includes mode for broader access permissions (0777).
    executeShellOperation(`sudo mount -t tmpfs -o size=${TOTAL_VOLUME_SIZE_B},mode=0777 tmpfs ${MOUNT_POINT_DIR}`);
  } else {
    throw new Error(`${LOG_COMPONENT_NAME}: Unsupported operating system for ephemeral volume mounting: '${currentOS}'.`);
  }
  outputLog(`Ephemeral volume '${VOLUME_LABEL_STR}' successfully formatted and mounted at '${MOUNT_POINT_DIR}'.`);
}

/**
 * Orchestrates the creation and mounting of the ephemeral volume if it's not already present.
 * @returns {void}
 */
function ensureEphemeralVolumeIsReady() {
  if (checkVolumePresence()) {
    outputLog("Ephemeral volume already detected and ready; skipping creation steps.");
    return;
  }

  outputLog("Ephemeral volume not found. Initiating creation and mounting process.");
  const deviceSystemIdentifier = provisionRawVolumeStorage();
  formatAndMountEphemeralVolume(deviceSystemIdentifier);
  outputLog("Ephemeral volume successfully created and made ready for use.");
}

/**
 * Establishes a symbolic link from the project's temporary path to a dedicated path on the ramdisk.
 * @param {string} projectTemporaryDirectory - The absolute path to the project's default temporary directory.
 * @param {string} applicationLabel - The name of the application, used to create a unique subdirectory on the ramdisk.
 * @throws {Error} If directory creation on ramdisk or symlink creation fails.
 */
function establishBuildCacheSymlink(projectTemporaryDirectory, applicationLabel) {
  if (!applicationLabel) {
    throw new Error(`${LOG_COMPONENT_NAME}: Application label is required to establish the build cache symbolic link.`);
  }

  const ramdiskApplicationPath = `${MOUNT_POINT_DIR}/${applicationLabel}`;

  // Ensure the target directory on the ramdisk exists.
  try {
    if (!fileSystemOps.existsSync(ramdiskApplicationPath)) {
      fileSystemOps.mkdirSync(ramdiskApplicationPath, { recursive: true });
      outputLog(`Created dedicated directory on ephemeral volume: '${ramdiskApplicationPath}'`);
    } else {
      outputLog(`Dedicated directory already exists on ephemeral volume: '${ramdiskApplicationPath}'`);
    }
  } catch (mkdirIssue) {
    throw new Error(`${LOG_COMPONENT_NAME}: Failed to create target directory on ephemeral volume ('${ramdiskApplicationPath}'): ${mkdirIssue.message}`);
  }

  // Create the symbolic link from the project's tmp path to the ramdisk path.
  try {
    fileSystemOps.symlinkSync(ramdiskApplicationPath, projectTemporaryDirectory, 'dir');
    outputLog(`Symbolic link successfully established: '${projectTemporaryDirectory}' -> '${ramdiskApplicationPath}'`);
  } catch (symlinkIssue) {
    throw new Error(`${LOG_COMPONENT_NAME}: Failed to create symbolic link from '${projectTemporaryDirectory}' to '${ramdiskApplicationPath}': ${symlinkIssue.message}`);
  }
}

// Module export configuration for the Ember CLI addon.
const cliAddonConfiguration = {
  moduleName: 'cli-ramdisk-cache', // A descriptive name for the addon module.

  /**
   * This hook is invoked when the addon is included in an Ember CLI application build process.
   * It orchestrates the entire ramdisk setup for faster builds.
   * @param {object} cliApplicationInstance - The instance of the Ember CLI application.
   */
  onAppLoad: function(cliApplicationInstance) {
    const projectTempPath = `${cliApplicationInstance.project.baseDirectory}/tmp`;
    const currentOperatingSystem = process.platform;

    // Validate if the current operating system is supported.
    const supportedOS = ['darwin', 'linux'];
    if (!supportedOS.includes(currentOperatingSystem)) {
      outputLog(`Current OS ('${currentOperatingSystem}') is not supported. Ramdisk functionality is limited to macOS and Linux. Skipping setup.`);
      return;
    }

    // Verify that a valid mount point could be determined for the ramdisk.
    if (!MOUNT_POINT_DIR) {
      outputError("Failed to resolve a valid ramdisk mount point for the current OS. Aborting ramdisk setup.");
      return;
    }

    try {
      // Check for an existing temporary directory at the project path.
      if (fileSystemOps.existsSync(projectTempPath)) {
        const tempPathStats = fileSystemOps.lstatSync(projectTempPath);

        if (tempPathStats.isSymbolicLink()) {
          const existingLinkedPath = fileSystemOps.readlinkSync(projectTempPath);
          // Check if the existing symlink already points to our ramdisk.
          if (existingLinkedPath.startsWith(MOUNT_POINT_DIR)) {
            outputLog(`Project temporary directory '${projectTempPath}' is already a symlink pointing to our ephemeral volume. No further action required.`);
            return; // Exit early as setup is already complete.
          } else {
            // Existing symlink points to an unexpected location.
            throw new Error(`An existing symbolic link at '${projectTempPath}' points to an unrecognized location ('${existingLinkedPath}'). Please manually resolve this conflict or remove the existing link.`);
          }
        }
        // If it's a regular directory, initiate cleanup.
        outputLog(`Detected an existing non-symlink directory at '${projectTempPath}'. Preparing for cleanup.`);
        manageAppTempDirectoryCleanup(projectTempPath);
      }

      // At this point, `projectTempPath` is either clear or didn't exist.
      // Proceed with ensuring the ramdisk is ready and establishing the new symlink.
      ensureEphemeralVolumeIsReady();
      const applicationIdentifier = cliApplicationInstance.project.packageInfo.name;
      establishBuildCacheSymlink(projectTempPath, applicationIdentifier);

      outputLog(`Ephemeral build cache successfully configured for project '${applicationIdentifier}'. Your temporary build directory is now located on the ramdisk at '${MOUNT_POINT_DIR}/${applicationIdentifier}'. Expect faster build times!`);
    } catch (setupFailure) {
      outputError(`Critical failure during ramdisk setup:`, setupFailure.message);
      // Include stack trace for more in-depth debugging.
      if (setupFailure.stack) {
        outputError("Stack trace:", setupFailure.stack);
      }
      outputLog("Ramdisk setup aborted. The build process will proceed without ramdisk acceleration.");
    } finally {
      // Final logging to indicate completion of the setup attempt.
      outputLog("Ephemeral build cache setup process concluded.");
    }
  }
};

// Export the addon configuration.
module.exports = cliAddonConfiguration;