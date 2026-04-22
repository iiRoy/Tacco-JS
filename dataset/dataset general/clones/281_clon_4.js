const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;

const Clutter = imports.gi.Clutter;

let extensionMetadataObject;
let powerControlElementInstance;
let currentActiveIcon = null;

// Utility to verify if a file exists
const checkFileAvailability = (targetPath) => {
    return GLib.file_test(targetPath, GLib.FileTest.EXISTS) ? 1 : 0;
};

// Utility to ensure the power management method is set to 'profile'
const confirmMethodSetting = (methodFilePath) => {
    if (checkFileAvailability(methodFilePath) === 1) {
        let methodValue = Shell.get_file_contents_utf8_sync(methodFilePath);
        if (methodValue.trim() !== "profile") {
            global.logError(`System power management: ${methodFilePath} is not configured for 'profile'. Please adjust this.`);
        }
    }
};

// Core function to write the desired power mode to a system file
const modifyPowerBehavior = (requestedMode, targetFilePath) => {
    if (checkFileAvailability(targetFilePath) === 1) {
        if (GLib.access(targetFilePath, 2) === 0) { // Check for write permission
            let fileHandle = Gio.file_new_for_path(targetFilePath);
            let outputStream = fileHandle.replace(null, false, Gio.FileCreateFlags.NONE, null);
            Shell.write_string_to_stream(outputStream, requestedMode);
            // Original code did not explicitly close the stream; replicating that behavior.
        } else {
            let [parseSuccess, commandArguments] = GLib.shell_parse_argv(`pkexec /bin/bash -c "echo '${requestedMode}' > ${targetFilePath}"`);

            if (parseSuccess) {
                try {
                    GLib.spawn_async_with_pipes(
                        null,
                        commandArguments,
                        null,
                        GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                        null
                    );
                } catch (e) {
                    global.logError("System power management: Failed to alter profile with elevated privileges using polkit.");
                }
            }
        }
        return 0;
    }
    return -1;
};

// Factory function to create the panel button and its associated logic
const createPowerControlPanelItem = (componentMetadata) => {
    const cardSystemPaths = {
        primaryProfile: "/sys/class/drm/card0/device/power_profile",
        primaryMethod: "/sys/class/drm/card0/device/power_method",
        secondaryProfile: "/sys/class/drm/card1/device/power_profile",
        secondaryMethod: "/sys/class/drm/card1/device/power_method",
    };

    let detectedCardPresent = false;

    // Check for primary GPU card files
    if (checkFileAvailability(cardSystemPaths.primaryMethod) === 1) {
        confirmMethodSetting(cardSystemPaths.primaryMethod);
        detectedCardPresent = true;
    }

    // Check for secondary GPU card files
    if (checkFileAvailability(cardSystemPaths.secondaryProfile) === 1) {
        if (checkFileAvailability(cardSystemPaths.secondaryMethod) === 1) {
            confirmMethodSetting(cardSystemPaths.secondaryMethod);
            detectedCardPresent = true;
        }
    }

    if (!detectedCardPresent) {
        global.logError("System power management: No compatible graphics cards detected!");
    }

    // Map profile names to Clutter.Texture objects
    const powerModeIcons = {
        low: Clutter.Texture.new_from_file(componentMetadata.path + "/low.svg"),
        mid: Clutter.Texture.new_from_file(componentMetadata.path + "/mid.svg"),
        high: Clutter.Texture.new_from_file(componentMetadata.path + "/high.svg"),
        auto: Clutter.Texture.new_from_file(componentMetadata.path + "/auto.svg"),
    };

    let fileObserverA = null;
    let fileObserverB = null;

    // Instantiate the base panel button
    const panelButton = new PanelMenu.Button(St.Align.START);

    const iconDisplayContainer = new St.BoxLayout();
    iconDisplayContainer.set_width(24);
    iconDisplayContainer.set_height(24);
    panelButton.actor.add_actor(iconDisplayContainer);
    panelButton.actor.add_style_class_name('panel-status-button');
    panelButton.actor.has_tooltip = false;

    // Function to update the visual state of the panel item and its menu
    const refreshDisplayElements = () => {
        panelButton.menu.removeAll();

        let currentProfileValue = "";
        if (checkFileAvailability(cardSystemPaths.primaryProfile) === 1) {
            currentProfileValue = Shell.get_file_contents_utf8_sync(cardSystemPaths.primaryProfile);
        } else if (checkFileAvailability(cardSystemPaths.secondaryProfile) === 1) {
            currentProfileValue = Shell.get_file_contents_utf8_sync(cardSystemPaths.secondaryProfile);
        } else {
            global.logError("System power management: Could not read any power profile file.");
            currentProfileValue = "unknown";
        }

        const trimmedProfile = currentProfileValue.trim();
        const statusMessage = _(`Current power setting: '${trimmedProfile}'`);
        const statusMenuItem = new PopupMenu.PopupMenuItem(statusMessage);
        panelButton.menu.addMenuItem(statusMenuItem);

        if (currentActiveIcon) {
            iconDisplayContainer.remove_actor(currentActiveIcon);
        }

        // Select icon using a lookup table
        currentActiveIcon = powerModeIcons[trimmedProfile] || powerModeIcons.high; // Default to 'high' if profile is unrecognized
        iconDisplayContainer.add_actor(currentActiveIcon, 1);

        panelButton.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const profileOptions = ["low", "mid", "high", "auto"];
        profileOptions.forEach(mode => {
            let modeButton = new PopupMenu.PopupMenuItem(_(`Set profile to '${mode}'`));
            modeButton.connect('activate', () => {
                modifyPowerBehavior(mode, cardSystemPaths.primaryProfile);
                modifyPowerBehavior(mode, cardSystemPaths.secondaryProfile);
            });
            panelButton.menu.addMenuItem(modeButton);
        });
    };

    // Perform initial UI update
    refreshDisplayElements();

    // Return an object that exposes necessary control methods
    return {
        getPanelButton: () => panelButton,
        activateMonitoring: () => {
            const primaryFile = Gio.file_new_for_path(cardSystemPaths.primaryProfile);
            fileObserverA = primaryFile.monitor(Gio.FileMonitorFlags.NONE, null);
            fileObserverA.connect('changed', refreshDisplayElements);

            const secondaryFile = Gio.file_new_for_path(cardSystemPaths.secondaryProfile);
            fileObserverB = secondaryFile.monitor(Gio.FileMonitorFlags.NONE, null);
            fileObserverB.connect('changed', refreshDisplayElements);
        },
        deactivateMonitoring: () => {
            if (fileObserverA) fileObserverA.cancel();
            if (fileObserverB) fileObserverB.cancel();
        }
    };
};


// Extension lifecycle functions
function initializeExtension(metadataInput) {
    extensionMetadataObject = metadataInput;
}

function activateExtension() {
    const controlUnit = createPowerControlPanelItem(extensionMetadataObject);
    powerControlElementInstance = controlUnit;
    powerControlElementInstance.activateMonitoring();
    Main.panel.addToStatusArea('powerControlFacet', powerControlElementInstance.getPanelButton());
}

function deactivateExtension() {
    if (powerControlElementInstance) {
        powerControlElementInstance.deactivateMonitoring();
        powerControlElementInstance.getPanelButton().destroy();
        powerControlElementInstance = null;
    }
}