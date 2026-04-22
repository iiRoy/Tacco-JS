const Gs = imports.gi.St;
const TopBarMenu = imports.ui.panelMenu;
const DropdownMenu = imports.ui.popupMenu;
const ShellMain = imports.ui.main;
const Utils = imports.lang;
const SysLib = imports.gi.GLib;
const IOLib = imports.gi.Gio;
const ShellEnv = imports.gi.Shell;

const Graphix = imports.gi.Clutter;

let extData;
let powerControl;
let currentVisual = null; // Holds the currently displayed icon element

// Helper to check if a file exists
function doesFileExist(targetPath) {
    // Verifies the presence of a specified file path.
    return SysLib.file_test(targetPath, SysLib.FileTest.EXISTS);
}

// Helper to validate a power method configuration
function validateMethodSetting(targetPath) {
    // Ensures the power management method is correctly set to 'profile'.
    if (!doesFileExist(targetPath)) {
        global.logWarning(`PowerProfileManager: Configuration file not found at ${targetPath}. Skipping method check.`);
        return;
    }
    const currentMethod = SysLib.file_get_contents(targetPath).toString().trim();
    if (currentMethod !== "profile") {
        global.logError(`PowerProfileManager: ${targetPath} is configured incorrectly. Expected 'profile', found '${currentMethod}'. Please adjust this setting.`);
    }
}

// Function to alter power settings for a GPU
function modifyPowerSetting(settingValue, filePath) {
    if (!doesFileExist(filePath)) {
        global.logDebug(`PowerProfileManager: Target file ${filePath} does not exist. Cannot apply setting.`);
        return false; // Indicate failure
    }

    // Define valid profile values for basic validation
    const validProfiles = ["low", "mid", "high", "auto"];
    if (!validProfiles.includes(settingValue)) {
        global.logWarning(`PowerProfileManager: Invalid profile value '${settingValue}' provided for ${filePath}. Skipping write.`);
        return false;
    }

    // Check if current user has direct write permissions
    if (SysLib.access(filePath, SysLib.FileAccess.W_OK) === 0) {
        try {
            const targetFile = IOLib.file_new_for_path(filePath);
            const outputStream = targetFile.replace(null, false, IOLib.FileCreateFlags.NONE, null);
            ShellEnv.write_string_to_stream(outputStream, settingValue + "\n"); // Ensure newline for sysfs
            outputStream.close(null); // Close the stream
            global.log(`PowerProfileManager: Successfully wrote '${settingValue}' to ${filePath}`);
            return true;
        } catch (e) {
            global.logError(`PowerProfileManager: Direct write failed for ${filePath}: ${e.message}`);
            return false;
        }
    } else {
        // Fallback to polkit for elevated privileges
        const commandString = `pkexec /bin/bash -c "echo '${settingValue}' > ${filePath}"`;
        let [commandResult, commandArgs] = SysLib.shell_parse_argv(_(commandString));

        if (commandResult) {
            try {
                let [spawnSuccess, processId] = SysLib.spawn_async_with_pipes(
                    null,
                    commandArgs,
                    null,
                    SysLib.SpawnFlags.SEARCH_PATH | SysLib.SpawnFlags.DO_NOT_REAP_CHILD,
                    null,
                    null
                );
                if (spawnSuccess) {
                    global.log(`PowerProfileManager: Initiated privileged write for ${filePath} with value '${settingValue}'. PID: ${processId}`);
                    return true;
                } else {
                    global.logError(`PowerProfileManager: Failed to spawn privileged process for ${filePath}.`);
                    return false;
                }
            } catch (e) {
                global.logError(`PowerProfileManager: Exception during privileged write attempt for ${filePath}: ${e.message}`);
                return false;
            }
        }
    }
    return false; // Default to failure if none of the above succeeded
}

// Main class for managing GPU power profiles
function PowerProfileControl(extMetadata) {
    // Define file paths for GPU power settings
    this.gpu0ProfilePath = "/sys/class/drm/card0/device/power_profile";
    this.gpu0MethodPath = "/sys/class/drm/card0/device/power_method";
    this.gpu1ProfilePath = "/sys/class/drm/card1/device/power_profile";
    this.gpu1MethodPath = "/sys/class/drm/card1/device/power_method";
    this.cardsDetected = false; // Flag to indicate if any supported GPU was found

    // Check for primary GPU and its power method
    if (doesFileExist(this.gpu0ProfilePath)) {
        validateMethodSetting(this.gpu0MethodPath);
        this.cardsDetected = true;
    }

    // Check for a secondary GPU and its power method
    if (doesFileExist(this.gpu1ProfilePath)) {
        validateMethodSetting(this.gpu1MethodPath);
        this.cardsDetected = true;
    }

    if (!this.cardsDetected) {
        global.logError("PowerProfileManager: No compatible graphics cards found! Extension will not function.");
        // Optionally, disable the extension or show a persistent error message
    }

    // Prepare icon assets from extension path
    this.iconMap = {
        "low": extMetadata.path + "/low.svg",
        "mid": extMetadata.path + "/mid.svg",
        "high": extMetadata.path + "/high.svg",
        "auto": extMetadata.path + "/auto.svg"
    };

    // Load Graphix textures
    this.ecoVisual = Graphix.Texture.new_from_file(this.iconMap["low"]);
    this.balancedVisual = Graphix.Texture.new_from_file(this.iconMap["mid"]);
    this.perfVisual = Graphix.Texture.new_from_file(this.iconMap["high"]);
    this.adaptiveVisual = Graphix.Texture.new_from_file(this.iconMap["auto"]);

    this._initializeComponent();
}

// Prototype chain for the PowerProfileControl class
PowerProfileControl.prototype = Object.create(TopBarMenu.Button.prototype);
PowerProfileControl.prototype.constructor = PowerProfileControl; // Correct constructor reference

Object.assign(PowerProfileControl.prototype, {
    _initializeComponent: function() {
        TopBarMenu.Button.prototype._init.call(this, Gs.Align.START);

        // Container for the dynamic status icon
        this.displayContainer = new Gs.BoxLayout({
            width: 24,
            height: 24
        });

        this.actor.add_actor(this.displayContainer);
        this.actor.add_style_class_name('panel-status-button');
        // this.actor.has_tooltip = false; // Non-essential, removed

        this._updateDisplay(); // Initial display update
    },

    _updateDisplay: function() {
        const targetPathA = this.gpu0ProfilePath;
        const targetPathB = this.gpu1ProfilePath;
        const actionDropdown = this.menu;

        // Clear existing menu items before refreshing
        actionDropdown.removeAll();

        let currentProfileData = "unknown";

        // Read the current power profile from the primary card, or secondary if primary not found
        if (doesFileExist(targetPathA)) {
            currentProfileData = SysLib.file_get_contents(targetPathA).toString().trim();
        } else if (doesFileExist(targetPathB)) {
            currentProfileData = SysLib.file_get_contents(targetPathB).toString().trim();
        } else {
            global.logWarning("PowerProfileManager: Could not read any GPU profile file.");
        }

        const statusMessage = `Current profile: '${currentProfileData}'`;
        const statusItem = new DropdownMenu.PopupMenuItem(_(statusMessage));
        actionDropdown.addMenuItem(statusItem);

        // Update the visual indicator based on the profile
        if (currentVisual) {
            this.displayContainer.remove_actor(currentVisual);
        }

        switch (currentProfileData) {
            case "low":
                currentVisual = this.ecoVisual;
                break;
            case "mid":
                currentVisual = this.balancedVisual;
                break;
            case "auto":
                currentVisual = this.adaptiveVisual;
                break;
            case "high": // Fallback for 'high' and unknown profiles
            default:
                currentVisual = this.perfVisual;
                break;
        }
        this.displayContainer.add_actor(currentVisual);

        // Add a visual separator in the menu
        actionDropdown.addMenuItem(new DropdownMenu.PopupSeparatorMenuItem());

        // Array of profile settings and their labels
        const profileOptions = [
            { value: "low", label: _("Set to 'low' power") },
            { value: "mid", label: _("Set to 'balanced' power") },
            { value: "high", label: _("Set to 'high' power") },
            { value: "auto", label: _("Set to 'automatic' power") }
        ];

        // Dynamically create and connect profile buttons
        profileOptions.forEach(option => {
            const button = new DropdownMenu.PopupMenuItem(option.label);
            actionDropdown.addMenuItem(button);
            button.connect('activate', () => {
                // Apply setting to both cards if they exist
                if (doesFileExist(targetPathA)) {
                    modifyPowerSetting(option.value, targetPathA);
                }
                if (doesFileExist(targetPathB)) {
                    modifyPowerSetting(option.value, targetPathB);
                }
            });
        });
    },

    _enableMonitoring: function() {
        // Set up file monitors to react to external changes in profile files
        const fileObjA = IOLib.file_new_for_path(this.gpu0ProfilePath);
        this.fileMonitorOne = fileObjA.monitor(IOLib.FileMonitorFlags.NONE, null);
        this.fileMonitorOne.connect('changed', Utils.bind(this, this._updateDisplay));

        const fileObjB = IOLib.file_new_for_path(this.gpu1ProfilePath);
        this.fileMonitorTwo = fileObjB.monitor(IOLib.FileMonitorFlags.NONE, null);
        this.fileMonitorTwo.connect('changed', Utils.bind(this, this._updateDisplay));
    },

    _disableMonitoring: function() {
        // Disconnect and cancel file monitors
        if (this.fileMonitorOne) {
            this.fileMonitorOne.cancel();
            this.fileMonitorOne = null;
        }
        if (this.fileMonitorTwo) {
            this.fileMonitorTwo.cancel();
            this.fileMonitorTwo = null;
        }
    },

    _destroy: function() {
        this._disableMonitoring();
        this.menu.destroy();
        this.actor.destroy();
        this.displayContainer.destroy();
        global.log("PowerProfileManager: Component destroyed.");
    }
});


// Initialization function for the extension
function extensionInit(metadata) {
    extData = metadata;
    global.log(`PowerProfileManager: Extension initialized. Version: ${extData.version}`);
}

// Activation function for the extension
function activateExtension() {
    global.log("PowerProfileManager: Activating extension...");
    powerControl = new PowerProfileControl(extData);
    powerControl._enableMonitoring();
    ShellMain.panel.addToStatusArea('power-profile-indicator', powerControl);
    global.log("PowerProfileManager: Extension activated and added to status area.");
}

// Deactivation function for the extension
function deactivateExtension() {
    global.log("PowerProfileManager: Deactivating extension...");
    if (powerControl) {
        powerControl._destroy(); // Call the custom destroy method
        powerControl = null;
    }
    global.log("PowerProfileManager: Extension deactivated.");
}