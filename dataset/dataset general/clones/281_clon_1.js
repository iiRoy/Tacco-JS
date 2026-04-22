/*******************************************************************************
 * This JavaScript extension was developed by:
 * - Francisco Pina Martins (https://github.com/StuntsPT)
 *
 * It is distributed under the GNU General Public License, version 2 or later.
 * Please refer to http://www.gnu.org/licenses/ for more details.
 *
 * Copyright (c) 2012 Francisco Pina Martins
 *
 * This file is an integral part of the Radeon Power Profile Manager project.
 *
 * Radeon Power Profile Manager is free software. You are welcome to redistribute
 * it and/or modify it according to the terms of the GNU General Public License.
 * This can be either version 2 of the License, or, at your discretion, any
 * later version published by the Free Software Foundation.
 *
 * This software is provided "as is", in the hope that it will be useful.
 * However, it comes WITHOUT ANY WARRANTY whatsoever, including but not limited
 * to the implied warranties of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * For the full text of the GNU General Public License, please see the accompanying
 * file or visit <http://www.gnu.org/licenses/>.
 *******************************************************************************/


const St = imports.gi.St; // Shell Toolkit for UI elements
const PanelMenu = imports.ui.panelMenu; // Panel menu integration
const PopupMenu = imports.ui.popupMenu; // For creating popup menus
const Main = imports.ui.main; // Main Gnome Shell environment
const Lang = imports.lang; // Language utilities
const GLib = imports.gi.GLib; // GLib utility functions
const Gio = imports.gi.Gio; // GIO for file operations
const Shell = imports.gi.Shell; // Shell specific utilities

const Clutter = imports.gi.Clutter; // Clutter for graphics and animations

let meta; // Stores metadata about the extension
let profilemanager; // Instance of the ProfileManager
let Icon = ""; // Current icon displayed in the panel

// Main ProfileManager constructor function
function ProfileManager(metadata) {

    // These lines are commented out, likely for testing purposes
    // this.profile0 = metadata.path + "/stubs/power_profile";
    // this.powerMethod = metadata.path + "/stubs/power_method";
    // this.profile1 = metadata.path + "/stubs/power_profile2";
    // this.powerMethod2 = metadata.path + "/stubs/power_method";

    // Define paths to sysfs files for power management
    this.profile0 = "/sys/class/drm/card0/device/power_profile";
    this.powerMethod0 = "/sys/class/drm/card0/device/power_method";
    this.profile1 = "/sys/class/drm/card1/device/power_profile";
    this.powerMethod1 = "/sys/class/drm/card1/device/power_method";
    this.foundCard = 0; // Flag to indicate if any compatible card was found

    // Check for the first graphics card and its power method
    if (CheckForFile(this.powerMethod0) == 1) {
        CheckMethod(this.powerMethod0);
        this.foundCard = 1;
    }

    // Check for a second graphics card, if present
    if (CheckForFile(this.profile1) == 1) {
        if (CheckForFile(this.powerMethod1) == 1) {
            CheckMethod(this.powerMethod1);
            this.foundCard = 1;
        }
    }

    // Log an error if no compatible card is detected
    if (this.foundCard != 1) {
        global.logError("Radeon Power Profile Manager: No cards found!");
    }

    // Initialize icons from SVG files located in the extension's path
    this.LowPowerIcon = Clutter.Texture.new_from_file(metadata.path + "/low.svg");
    this.MidPowerIcon = Clutter.Texture.new_from_file(metadata.path + "/mid.svg");
    this.HighPowerIcon = Clutter.Texture.new_from_file(metadata.path + "/high.svg");
    this.AutoPowerIcon = Clutter.Texture.new_from_file(metadata.path + "/auto.svg");

    // Call the internal initialization method
    this._init();
}

// Prototype chain for ProfileManager, inheriting from PanelMenu.Button
ProfileManager.prototype = {

    __proto__: PanelMenu.Button.prototype, // Inherit methods from PanelMenu.Button

    // Internal initialization method
    _init: function() {
        // Call the parent constructor
        PanelMenu.Button.prototype._init.call(this, St.Align.START);

        // Create a container for the icon
        this.temp = new St.BoxLayout();
        this.temp.set_width(24); // Set width of the icon container
        this.temp.set_height(24); // Set height of the icon container

        // Add the icon container to the panel actor
        this.actor.add_actor(this.temp);
        this.actor.add_style_class_name('panel-status-button'); // Apply CSS class
        this.actor.has_tooltip = false; // Disable default tooltip

        // Perform an initial refresh of the menu and icon
        this._refresh();

    }, // End of _init method

    // Refreshes the menu and updates the panel icon
    _refresh: function() {
        let varfile0 = this.profile0; // Path to the first profile file
        let varfile1 = this.profile1; // Path to the second profile file
        let tasksMenu = this.menu; // Reference to the popup menu

        let temp = this.temp; // Reference to the icon container
        let content = 0; // Variable to store file content

        // Clear all existing items from the menu
        tasksMenu.removeAll();

        // Synchronously read the content of the power profile file
        if (CheckForFile(this.profile0) == 1) {
            content = Shell.get_file_contents_utf8_sync(this.profile0);
        } else {
            // Fallback to the second profile file if the first isn't found
            content = Shell.get_file_contents_utf8_sync(this.profile1);
        }

        // Create a menu item displaying the current profile
        let message = "Currently on '" + content.trim() + "' profile";
        let item = new PopupMenu.PopupMenuItem(_(message));
        tasksMenu.addMenuItem(item);

        // Remove the old icon if one exists
        if (Icon != "") {
            temp.remove_actor(Icon);
        }

        // Set the appropriate icon based on the current power profile
        if (content.trim() == "low") {
            Icon = this.LowPowerIcon;
        } else if (content.trim() == "mid") {
            Icon = this.MidPowerIcon;
        } else if (content.trim() == "auto") {
            Icon = this.AutoPowerIcon;
        } else {
            Icon = this.HighPowerIcon;
        }
        temp.add_actor(Icon, 1); // Add the new icon to the panel

        // Add a separator to the menu
        this.Separator = new PopupMenu.PopupSeparatorMenuItem();
        tasksMenu.addMenuItem(this.Separator);

        // Create a new section for the power profile buttons (though not strictly necessary here)
        let bottomSection = new PopupMenu.PopupMenuSection();

        // Create menu items (buttons) for changing power profiles
        let lowpowerbutton = new PopupMenu.PopupMenuItem(_("Set profile to 'low'"));
        tasksMenu.addMenuItem(lowpowerbutton);
        let midpowerbutton = new PopupMenu.PopupMenuItem(_("Set profile to 'mid'"));
        tasksMenu.addMenuItem(midpowerbutton);
        let highpowerbutton = new PopupMenu.PopupMenuItem(_("Set profile to 'high'"));
        tasksMenu.addMenuItem(highpowerbutton);
        let autopowerbutton = new PopupMenu.PopupMenuItem(_("Set profile to 'auto'"));
        tasksMenu.addMenuItem(autopowerbutton);

        // Connect activate signals to the profile changing functions
        lowpowerbutton.connect('activate', function() {
            changeProfile("low", varfile0);
            changeProfile("low", varfile1);
        });

        midpowerbutton.connect('activate', function() {
            changeProfile("mid", varfile0);
            changeProfile("mid", varfile1);
        });

        highpowerbutton.connect('activate', function() {
            changeProfile("high", varfile0);
            changeProfile("high", varfile1);
        });

        autopowerbutton.connect('activate', function() {
            changeProfile("auto", varfile0);
            changeProfile("auto", varfile1);
        });
    }, // End of _refresh method

    // Enables file monitoring for profile changes
    _enable: function() {
        // Monitor the first profile file for changes
        let fileM = Gio.file_new_for_path(this.profile0);
        this.monitor1 = fileM.monitor(Gio.FileMonitorFlags.NONE, null);
        this.monitor1.connect('changed', Lang.bind(this, this._refresh));

        // Monitor the second profile file for changes (if it exists)
        let fileM2 = Gio.file_new_for_path(this.profile1);
        this.monitor2 = fileM2.monitor(Gio.FileMonitorFlags.NONE, null);
        this.monitor2.connect('changed', Lang.bind(this, this._refresh));
    },

    // Disables file monitoring
    _disable: function() {
        this.monitor1.cancel(); // Stop monitoring the first file
        this.monitor2.cancel(); // Stop monitoring the second file
    }
}; // End of ProfileManager.prototype

// Function to change the power profile in the sysfs file.
// It will attempt to use polkit for privilege elevation if direct write access is denied.
function changeProfile(text, file) {
    // Only proceed if the file actually exists
    if (CheckForFile(file) == 1) {
        // Check if the user has write access to the file (mode 2)
        if (GLib.access(file, 2) == 0) {
            // If write access is granted, directly write the new profile
            let content = Shell.get_file_contents_utf8_sync(file); // Read current content (not strictly needed for writing, but in original code)
            content = text; // Set new content

            let f = Gio.file_new_for_path(file);
            let out = f.replace(null, false, Gio.FileCreateFlags.NONE, null); // Create output stream
            Shell.write_string_to_stream(out, content); // Write new profile
        } else {
            // If no write access, use pkexec to elevate privileges
            let [result, argv] = GLib.shell_parse_argv(_("pkexec /bin/bash -c \" echo '" + text + "' > " + file + "\""));

            if (result) {
                try {
                    // Spawn a new process with elevated privileges
                    [result, pid] = GLib.spawn_async_with_pipes(null, argv, null, GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                        null, null);
                } catch (e) {
                    // Log an error if polkit execution fails
                    global.logError("Radeon Power Profile Manager: Failed to change profile with elevated privileges using polkit.");
                }
            }
            return result; // Return the result of the spawn operation
        }
    }

    return -1; // Return -1 if the file does not exist
}

// Checks for the existence of a given file path
function CheckForFile(filename) {
    // Uses GLib's file_test to check for file existence
    if (GLib.file_test(filename, GLib.FileTest.EXISTS)) {
        return 1; // File exists
    } else {
        return 0; // File does not exist
    }
}

// Checks if the power_method file is set to 'profile'
function CheckMethod(filename) {
    // Reads the content of the power_method file
    let method = Shell.get_file_contents_utf8_sync(filename);
    // If the method is not 'profile', log an error
    if (method.trim() != "profile") {
        global.logError("Radeon Power Profile Manager: " + filename + " is not set for 'profile'. Please change this.");
    }
}

// Extension initialization function
function init(metadata) {
    meta = metadata; // Store the metadata globally
}

// Function called when the extension is enabled
function enable() {
    profilemanager = new ProfileManager(meta); // Create a new instance of ProfileManager
    profilemanager._enable(); // Enable file monitoring for the manager
    Main.panel.addToStatusArea('profilemanager', profilemanager); // Add the manager to the Gnome Shell panel
}

// Function called when the extension is disabled
function disable() {
    profilemanager._disable(); // Disable file monitoring
    profilemanager.destroy(); // Destroy the panel button and associated resources
    profilemanager = null; // Clear the reference to the manager
}