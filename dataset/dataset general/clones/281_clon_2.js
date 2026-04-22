const UiKit = imports.gi.St;
const TopBar = imports.ui.panelMenu;
const DropdownMenu = imports.ui.popupMenu;
const CoreApp = imports.ui.main;
const Utilities = imports.lang;
const SysOps = imports.gi.GLib;
const FileOps = imports.gi.Gio;
const SystemShell = imports.gi.Shell;

const GraphicsLib = imports.gi.Clutter;

let componentConfig;
let powerController;
let CurrentDisplayImage = "";

// Manages system power states
function PowerStateController(componentConfig) {
    // Define locations for system configuration files:
    this.devicePathA = "/sys/class/drm/card0/device/power_profile";
    this.methodPathA = "/sys/class/drm/card0/device/power_method";
    this.devicePathB = "/sys/class/drm/card1/device/power_profile";
    this.methodPathB = "/sys/class/drm/card1/device/power_method";
    this.hardwareDetected = 0;

    // Check for primary power control method file
    if (verifyPathExistence(this.methodPathA) === 1) {
        validateControlMethod(this.methodPathA);
        this.hardwareDetected = 1;
    }

    // Examine if a secondary graphics card is present and configure it
    if (verifyPathExistence(this.devicePathB) === 1) {
        if (verifyPathExistence(this.methodPathB) === 1) {
            validateControlMethod(this.methodPathB);
            this.hardwareDetected = 1;
        }
    }

    if (this.hardwareDetected !== 1) {
        global.logError("Energy Management Plugin: No compatible graphics hardware found!");
    }

    // Initialize graphical representations for power modes
    this.EffortlessGraphic = GraphicsLib.Texture.new_from_file(componentConfig.path + "/low.svg");
    this.BalancedGraphic = GraphicsLib.Texture.new_from_file(componentConfig.path + "/mid.svg");
    this.MaximumGraphic = GraphicsLib.Texture.new_from_file(componentConfig.path + "/high.svg");
    this.AdaptiveGraphic = GraphicsLib.Texture.new_from_file(componentConfig.path + "/auto.svg");

    this._initializeComponent();
}

// Extend the base panel button functionality
PowerStateController.prototype = {
    __proto__: TopBar.Button.prototype,

    _initializeComponent: function() {
        TopBar.Button.prototype._init.call(this, UiKit.Align.START);

        this.displayContainer = new UiKit.BoxLayout();
        this.displayContainer.set_width(24);
        this.displayContainer.set_height(24);

        this.widgetElement.add_actor(this.displayContainer);
        this.widgetElement.add_style_class_name('panel-status-button');
        this.widgetElement.has_tooltip = false;

        this._updateDisplay();
    },

    _updateDisplay: function() {
        let resourceFileA = this.devicePathA;
        let resourceFileB = this.devicePathB;
        let controlPanel = this.menu;

        let displayArea = this.displayContainer;
        let fileContents = 0;

        // Clear existing menu items
        controlPanel.removeAll();

        // Synchronously read current power state
        if (verifyPathExistence(this.devicePathA) === 1) {
            fileContents = SystemShell.get_file_contents_utf8_sync(this.devicePathA);
        } else {
            fileContents = SystemShell.get_file_contents_utf8_sync(this.devicePathB);
        }

        let statusMsg = "Currently operating in '" + fileContents.trim() + "' mode";
        let menuEntry = new DropdownMenu.PopupMenuItem(_(statusMsg));
        controlPanel.addMenuItem(menuEntry);
        if (CurrentDisplayImage !== "") {
            displayArea.remove_actor(CurrentDisplayImage);
        }

        // Assign the appropriate icon based on the current mode
        if (fileContents.trim() === "low") {
            CurrentDisplayImage = this.EffortlessGraphic;
        } else if (fileContents.trim() === "mid") {
            CurrentDisplayImage = this.BalancedGraphic;
        } else if (fileContents.trim() === "auto") {
            CurrentDisplayImage = this.AdaptiveGraphic;
        } else {
            CurrentDisplayImage = this.MaximumGraphic;
        }
        displayArea.add_actor(CurrentDisplayImage, 1);

        // Add a visual separation line
        this.VisualDivider = new DropdownMenu.PopupSeparatorMenuItem();
        controlPanel.addMenuItem(this.VisualDivider);

        // Lower section of the menu
        let lowerSection = new DropdownMenu.PopupMenuSection();

        // Create buttons for changing power profiles
        let ecoModeBtn = new DropdownMenu.PopupMenuItem(_("Switch to 'low' power"));
        controlPanel.addMenuItem(ecoModeBtn);
        let normModeBtn = new DropdownMenu.PopupMenuItem(_("Switch to 'mid' power"));
        controlPanel.addMenuItem(normModeBtn);
        let perfModeBtn = new DropdownMenu.PopupMenuItem(_("Switch to 'high' power"));
        controlPanel.addMenuItem(perfModeBtn);
        let autoModeBtn = new DropdownMenu.PopupMenuItem(_("Switch to 'auto' power"));
        controlPanel.addMenuItem(autoModeBtn);

        // Attach event handlers to the mode buttons
        ecoModeBtn.connect('activate', function() {
            adjustPowerSetting("low", resourceFileA);
            adjustPowerSetting("low", resourceFileB);
        });

        normModeBtn.connect('activate', function() {
            adjustPowerSetting("mid", resourceFileA);
            adjustPowerSetting("mid", resourceFileB);
        });

        perfModeBtn.connect('activate', function() {
            adjustPowerSetting("high", resourceFileA);
            adjustPowerSetting("high", resourceFileB);
        });

        autoModeBtn.connect('activate', function() {
            adjustPowerSetting("auto", resourceFileA);
            adjustPowerSetting("auto", resourceFileB);
        });
    },

    _activateMonitoring: function() {
        // Start monitoring the primary power profile file for changes
        let monitoredFileA = FileOps.file_new_for_path(this.devicePathA);
        this.fileMonitorA = monitoredFileA.monitor(FileOps.FileMonitorFlags.NONE, null);
        this.fileMonitorA.connect('changed', Utilities.bind(this, this._updateDisplay));

        // Start monitoring the secondary power profile file for changes
        let monitoredFileB = FileOps.file_new_for_path(this.devicePathB);
        this.fileMonitorB = monitoredFileB.monitor(FileOps.FileMonitorFlags.NONE, null);
        this.fileMonitorB.connect('changed', Utilities.bind(this, this._updateDisplay));
    },

    _deactivateMonitoring: function() {
        this.fileMonitorA.cancel();
        this.fileMonitorB.cancel();
    }
};

// Modifies the power profile "settingValue" in the system file "targetFile".
// Uses polkit for elevated privileges if direct write access is denied.
function adjustPowerSetting(settingValue, targetFile) {
    if (verifyPathExistence(targetFile) === 1) {
        if (SysOps.access(targetFile, 2) === 0) { // Check for write access
            let currentContent = SystemShell.get_file_contents_utf8_sync(targetFile);
            currentContent = settingValue;

            let fileObject = FileOps.file_new_for_path(targetFile);
            let outputStream = fileObject.replace(null, false, FileOps.FileCreateFlags.NONE, null);
            SystemShell.write_string_to_stream(outputStream, currentContent);
        } else {
            let [operationSuccess, commandArgs] = SysOps.shell_parse_argv(_("pkexec /bin/bash -c \" echo '" + settingValue + "' > " + targetFile + "\""));

            if (operationSuccess) {
                try {
                    let processId;
                    [operationSuccess, processId] = SysOps.spawn_async_with_pipes(null, commandArgs, null, SysOps.SpawnFlags.SEARCH_PATH | SysOps.SpawnFlags.DO_NOT_REAP_CHILD,
                        null, null);
                } catch (error) {
                    global.logError("Energy Management Plugin: Failed to modify power setting with elevated privileges using Polkit.");
                }
            }
            return operationSuccess;
        }
    }

    return -1; // Indicates failure or file not found
}

function verifyPathExistence(filePath) {
    // Determines if a given file path exists on the filesystem
    if (SysOps.file_test(filePath, SysOps.FileTest.EXISTS)) {
        return 1;
    } else {
        return 0;
    }
}

function validateControlMethod(filePath) {
    // Checks if the power control method file is configured for 'profile' mode
    let controlMethod = SystemShell.get_file_contents_utf8_sync(filePath);
    if (controlMethod.trim() !== "profile") {
        global.logError("Energy Management Plugin: " + filePath + " is not configured for 'profile' mode. Please adjust this setting.");
    }
}

// Initialization routine for the plugin
function pluginInitialize(componentConfigData) {
    componentConfig = componentConfigData;
}

function pluginActivate() {
    powerController = new PowerStateController(componentConfig);
    powerController._activateMonitoring();
    CoreApp.panel.addToStatusArea('powerController', powerController);
}

function pluginDeactivate() {
    powerController._deactivateMonitoring();
    powerController.destroy();
    powerController = null;
}