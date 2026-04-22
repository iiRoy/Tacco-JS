/*
 * WakaTime Brackets Extension
 * This file contains the core logic for integrating WakaTime analytics.
 * Developed by WakaTime, with contributions from the open-source community.
 * For more details, visit https://wakatime.com/
 *
 * Licensed under the BSD License.
 */

/* global define, $, brackets, window */
/* jshint esversion: 6 */

// Module definition for the WakaTime extension.
define(function (require, exports, module) {
  "use strict";

  // Current version of the Brackets WakaTime plugin.
  var VERSION = '1.0.4';

  // Retrieve necessary Brackets modules.
  var MainViewManager = brackets.getModule("view/MainViewManager"),
    DocumentManager = brackets.getModule("document/DocumentManager"),
    ProjectManager = brackets.getModule("project/ProjectManager"),
    PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
    CommandManager = brackets.getModule("command/CommandManager"),
    Menus = brackets.getModule("command/Menus"),
    prefs = PreferencesManager.getExtensionPrefs("WakaTime"); // WakaTime specific preferences.

  // Variables to track activity.
  var lastAction = 0,
    lastFile = undefined;

  /**
   * Initializes the WakaTime extension.
   * Sets up preferences, menu items, and event listeners.
   */
  function init() {
    setupPreferences(); // Configure user preferences.

    addMenuItem(); // Add WakaTime menu items.

    // Check if API key is set; if not, prompt the user.
    if (!prefs.get("apikey")) {
      promptForApiKey();
    }

    setupEventListeners(); // Attach handlers for editor events.
  }

  /**
   * Adds the WakaTime API Key menu item to Brackets' File menu.
   */
  function addMenuItem() {
    // Define a unique command ID for the API key prompt.
    var COMMAND_ID = "wakatime.apikey";
    CommandManager.register("WakaTime API Key", COMMAND_ID, promptForApiKey);

    // Get the File menu and add our command.
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuDivider(); // Visual separation.
    menu.addMenuItem(COMMAND_ID); // The actual menu item.
  }

  /**
   * Sets up event listeners for editor activities.
   * Monitors file changes, document saves, and key presses.
   */
  function setupEventListeners() {
    $(MainViewManager).on('currentFileChange', function () {
      handleAction(); // Trigger action on file change.
    });

    $(DocumentManager).on('documentSaved', function () {
      handleAction(true); // Trigger action on document save, with 'isWrite' flag.
    });

    $(window).on('keypress', function () {
      handleAction(); // Trigger action on any key press.
    });
  }

  /**
   * Defines and initializes WakaTime preferences.
   */
  function setupPreferences() {
    // Define the 'apikey' preference as a string, default empty.
    prefs.definePreference("apikey", "string", "");

    // Define 'ignore' preference as an array of regex patterns.
    prefs.definePreference("ignore", "array", ["^/var/", "^/tmp/", "^/private/"]);

    // If 'ignore' preference is still at its default location, save it to user prefs.
    if (prefs.getPreferenceLocation('ignore').scope == 'default') {
      prefs.set('ignore', prefs.get('ignore'));
      prefs.save();
    }
  }

  /**
   * Sends a heartbeat to the WakaTime API.
   * @param {string} file - Full path of the current file.
   * @param {number} time - Unix timestamp of the action.
   * @param {string} project - Name of the current project.
   * @param {string} language - Programming language of the file.
   * @param {boolean} isWrite - True if the action was a file save/write.
   * @param {number} lines - Number of lines in the file.
   */
  function sendHeartbeat(file, time, project, language, isWrite, lines) {
    $.ajax({
      type: 'POST',
      url: 'https://wakatime.com/api/v1/actions',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        time: time / 1000, // Convert milliseconds to seconds.
        file: file,
        project: project,
        language: language,
        is_write: isWrite ? true : false,
        lines: lines,
        plugin: 'brackets-wakatime/' + VERSION, // Plugin identifier and version.
      }),
      headers: {
        'Authorization': 'Basic ' + btoa(prefs.get("apikey")), // Base64 encode API key for auth.
      },
    });

    // Update last action time and file path.
    lastAction = time;
    lastFile = file;
  }

  /**
   * Checks if enough time has passed since the last heartbeat.
   * Heartbeats are sent at most every 2 minutes (120,000 ms).
   * @returns {boolean} True if more than 2 minutes have elapsed.
   */
  function enoughTimePassed() {
    return lastAction + 120000 < Date.now();
  }

  /**
   * Checks if a given file path should be ignored based on user preferences.
   * @param {string} file - The full path of the file to check.
   * @returns {boolean} True if the file path matches any ignore pattern.
   */
  function fileIsIgnored(file) {
    var patterns = prefs.get("ignore");
    var ignore = false;
    for (var i = 0; i < patterns.length; i++) {
      var re = new RegExp(patterns[i], "gi"); // Create a case-insensitive regex.
      if (re.test(file)) {
        ignore = true; // File matches an ignore pattern.
        break;
      }
    }
    return ignore;
  }

  /**
   * Handles an editor action (file change, save, keypress).
   * Determines if a heartbeat should be sent based on time, file, and write status.
   * @param {boolean} isWrite - Optional. True if the action was a file write/save.
   */
  function handleAction(isWrite) {
    var currentDocument = DocumentManager.getCurrentDocument();
    if (currentDocument) {
      var file = currentDocument.file;
      if (file && file.isFile) {
        var time = Date.now(); // Current timestamp.

        // Decide whether to send a heartbeat.
        if (isWrite || enoughTimePassed() || lastFile !== file.fullPath) {
          // Only send if the file is not ignored.
          if (!fileIsIgnored(file.fullPath)) {
            var language = currentDocument.language ? currentDocument.language.getName() : undefined;
            var project = ProjectManager.getProjectRoot() ? ProjectManager.getProjectRoot().name : undefined;
            var editor = currentDocument._masterEditor;
            var lines = editor ? editor.lineCount() : undefined;

            sendHeartbeat(file.fullPath, time, project, language, isWrite, lines);
          }
        }
      }
    }
  }

  /**
   * Prompts the user to enter their WakaTime API key.
   * Saves the entered key to preferences.
   */
  function promptForApiKey() {
    var apikey = window.prompt("[WakaTime] Enter your wakatime.com api key:", prefs.get("apikey"));
    if (apikey) {
      prefs.set("apikey", apikey); // Store the new API key.
      prefs.save(); // Persist preferences.
    }
  }

  // Initialize the extension when the module loads.
  init();
});