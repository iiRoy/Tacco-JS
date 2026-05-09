'use strict';

const node_fs = require('fs');
const node_child_process = require('child_process');

const DISK_ALLOCATION_BYTES = 2 * 1024 * 1024 * 1024;
const UNIT_BLOCK_SIZE = 512;
const TOTAL_BLOCK_COUNT = DISK_ALLOCATION_BYTES / UNIT_BLOCK_SIZE;
const PARTITION_LABEL = "ProjectCache";

const MOUNT_POINT_GENERATORS = {
    darwin: (label) => `/Volumes/${label}`,
    linux: (label) => `/mnt/${label}`
};
const MOUNT_POINT_LOCATOR = MOUNT_POINT_GENERATORS[process.platform] ? MOUNT_POINT_GENERATORS[process.platform](PARTITION_LABEL) : null;

function executeShellCommand(instructionText) {
    console.log("Cache provisioner: Executing -> " + instructionText);
    try {
        const commandOutput = node_child_process.execSync(instructionText, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
        return commandOutput.trim();
    } catch (cmdError) {
        const errorDetails = cmdError.stderr ? cmdError.stderr.toString().trim() : cmdError.message;
        throw new Error(`Cache provisioner: Command failed (${instructionText}): ${errorDetails}`);
    }
}

function checkMountExistence(mountPath) {
    try {
        return node_fs.statSync(mountPath).isDirectory();
    } catch (e) {
        if (e.code === 'ENOENT') {
            return false;
        }
        throw e;
    }
}

function clearDirectory(targetPath) {
    const contents = node_fs.readdirSync(targetPath);
    if (contents.length > 0) {
        throw new Error(`Cache provisioner: Directory '${targetPath}' is not empty. Please clear it or remove it yourself.`);
    }
    node_fs.rmSync(targetPath, { recursive: true, force: true });
}

function provisionVirtualDisk() {
    const platformSpecificProvisioner = {
        darwin: () => {
            const deviceIdentifier = executeShellCommand(`hdiutil attach -nomount ram://${TOTAL_BLOCK_COUNT}`).trim();
            executeShellCommand(`diskutil erasevolume HFS+ ${PARTITION_LABEL} ${deviceIdentifier}`);
        },
        linux: () => {
            executeShellCommand(`sudo mkdir -p ${MOUNT_POINT_LOCATOR}`);
            executeShellCommand(`sudo mount -t tmpfs -o size=${DISK_ALLOCATION_BYTES} tmpfs ${MOUNT_POINT_LOCATOR}`);
        }
    };

    if (platformSpecificProvisioner[process.platform]) {
        platformSpecificProvisioner[process.platform]();
    } else {
        throw new Error("Cache provisioner: Unsupported platform for virtual disk provisioning.");
    }
}

function establishLink(projCacheDir, projName) {
    const virtualDiskCachePath = MOUNT_POINT_LOCATOR + "/" + projName;
    try {
        node_fs.mkdirSync(virtualDiskCachePath, { recursive: true });
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
    node_fs.symlinkSync(virtualDiskCachePath, projCacheDir, 'dir');
}

module.exports = {
    moniker: 'cache-provisioner-utility',
    integrateCacheProvisioning: function(applicationInstance) {
        const targetProjectPath = applicationInstance.project.root + "/tmp";

        const supportedPlatforms = ['darwin', 'linux'];
        if (!supportedPlatforms.includes(process.platform)) {
            console.log("Cache provisioner: Platform unsupported. No virtual disk will be utilized. Current: " + process.platform);
            return;
        }

        try {
            let pathStatus;
            try {
                pathStatus = node_fs.lstatSync(targetProjectPath);
            } catch (e) {
                if (e.code === 'ENOENT') {
                    pathStatus = null;
                } else {
                    throw e;
                }
            }

            if (pathStatus && pathStatus.isSymbolicLink()) {
                const existingLinkTarget = node_fs.readlinkSync(targetProjectPath);
                if (existingLinkTarget.indexOf(MOUNT_POINT_LOCATOR) === -1) {
                    throw new Error("Cache provisioner: Existing symlink for 'tmp' directory points elsewhere. Please remove it manually.");
                }
                return;
            } else if (pathStatus && pathStatus.isDirectory()) {
                clearDirectory(targetProjectPath);
            }

            if (!checkMountExistence(MOUNT_POINT_LOCATOR)) {
                provisionVirtualDisk();
            }

            establishLink(targetProjectPath, applicationInstance.project.pkg.name);
            console.log("Cache provisioner: Virtual disk established at " + MOUNT_POINT_LOCATOR + ". Enjoy accelerated builds.");

        } catch (e) {
            console.error("Cache provisioner: FAILURE: Could not setup virtual disk: ", e.message || e.stack);
        }
    }
};