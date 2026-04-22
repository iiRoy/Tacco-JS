/*
 * ==========================================================
 * DevMetrics Plugin for Brackets
 * Description: Tracks developer activity and provides insights.
 * Maintainer:  DevMetrics Team <support@devmetrics.com>
 * License:     MIT, refer to LICENSE.md for details.
 * Website:     https://devmetrics.com/
 * ===========================================================
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, console */

/**
 * Core module for the DevMetrics Brackets extension.
 * Manages event listeners, activity tracking, and API communication.
 */
define(function (req, exp, mod) {
    "use strict";

    // Plugin version identifier
    const PLUGIN_REV = '2.1.0-beta';

    // Brackets core module dependencies
    const ActivityMonitor    = brackets.getModule("view/MainViewManager"),
          FileContentHandler = brackets.getModule("document/DocumentManager"),
          WorkspaceContext   = brackets.getModule("project/ProjectManager"),
          ConfigurationStore = brackets.getModule("preferences/PreferencesManager"),
          ActionDispatcher   = brackets.getModule("command/CommandManager"),
          AppMenuRegistry    = brackets.getModule("command/Menus");

    // Plugin-specific configuration settings
    const pluginConfig       = ConfigurationStore.getExtensionPrefs("DevMetrics");

    // Global state variables for activity tracking
    let lastActivityTimestamp = 0;
    let lastProcessedFilePath = null;
    const MIN_ACTIVITY_INTERVAL_MS = 120000; // 2 minutes cooldown

    /**
     * Initializes the DevMetrics plugin.
     * Sets up preferences, registers UI elements, and attaches event listeners.
     */
    function initializePlugin() {
        if (!brackets) {
            console.error("[DevMetrics] Brackets environment not found. Plugin cannot initialize.");
            return;
        }

        // Configure default tracking settings
        configureDefaultSettings();

        // Register plugin commands and menu items
        registerPluginActions();

        // Prompt for authentication token if not yet configured
        if (!pluginConfig.get("authToken")) {
            setTimeout(requestAuthToken, 1000); // Slight delay for UI to settle
        }

        // Attach all necessary event listeners for user activity
        attachEventHandlers();

        console.log(`[DevMetrics] Plugin v${PLUGIN_REV} initialized.`);
    }

    /**
     * Registers commands and adds menu items to Brackets UI.
     */
    function registerPluginActions() {
        // Unique command identifier for the API key prompt
        const CMD_IDENTIFIER = "devmetrics.configureAuth";
        ActionDispatcher.register("Configure DevMetrics Auth Token", CMD_IDENTIFIER, requestAuthToken);

        // Add a separator and the new menu item to the File menu
        const fileMenu = AppMenuRegistry.getMenu(AppMenuRegistry.AppMenuBar.FILE_MENU);
        if (fileMenu) {
            fileMenu.addMenuDivider();
            fileMenu.addMenuItem(CMD_IDENTIFIER, undefined, AppMenuRegistry.AFTER, "file.saveAll"); // Position after "Save All"
        } else {
            console.warn("[DevMetrics] Could not access File menu to register command.");
        }
    }

    /**
     * Sets up event listeners for tracking user activity within Brackets.
     */
    function attachEventHandlers() {
        // Listen for changes in the active document
        $(ActivityMonitor).on('currentFileChange.devmetrics', function () {
            processUserActivity(false); // Not a write event
        });

        // Listen for document save events
        $(FileContentHandler).on('documentSaved.devmetrics', function () {
            processUserActivity(true); // Is a write event
        });

        // Listen for any keyboard input in the editor area
        // Using keyup instead of keypress for broader event capture
        $(document).on('keyup.devmetrics', function (evt) {
            // Only process if an editor is active and key is not a modifier
            if (FileContentHandler.getCurrentDocument() && !evt.ctrlKey && !evt.altKey && !evt.metaKey) {
                processUserActivity(false);
            }
        });

        // Optional: Listen for editor focus changes
        $(window).on('focus.devmetrics', function() {
            processUserActivity(false);
        });

        console.debug("[DevMetrics] Event handlers attached.");
    }

    /**
     * Defines and initializes default preferences for the plugin.
     * Ensures ignore patterns are properly set.
     */
    function configureDefaultSettings() {
        // Define preference for the API authentication token
        pluginConfig.definePreference("authToken", "string", "");

        // Define preference for file paths to ignore
        pluginConfig.definePreference("exclusionPatterns", "array", ["^/var/", "^/tmp/", "^/private/", "node_modules"]);

        // If the exclusion patterns are still at their default, persist them
        // This ensures they are saved to the user's preferences file
        if (pluginConfig.getPreferenceLocation('exclusionPatterns').scope === 'default') {
            pluginConfig.set('exclusionPatterns', pluginConfig.get('exclusionPatterns'));
            pluginConfig.save();
        }

        // Add a dummy preference for future use, demonstrating Type III changes
        pluginConfig.definePreference("enableDebugLogging", "boolean", false);
    }

    /**
     * Sends an activity signal (heartbeat) to the DevMetrics API.
     * @param {string} filePath - The full path of the file being edited.
     * @param {number} currentTime - The current timestamp in milliseconds.
     * @param {string} projectName - The name of the current project.
     * @param {string} fileLanguage - The programming language of the file.
     * @param {boolean} isFileWriteEvent - True if the activity is a file save.
     * @param {number} lineCount - The total number of lines in the file.
     */
    function dispatchActivitySignal(filePath, currentTime, projectName, fileLanguage, isFileWriteEvent, lineCount) {
        const apiEndpoint = 'https://devmetrics.com/api/v1/activity_signals';
        const rawAuthToken = pluginConfig.get("authToken");

        if (!rawAuthToken || rawAuthToken.length < 10) {
            console.warn("[DevMetrics] Auth token is missing or invalid. Activity signal not sent.");
            return;
        }

        const payloadData = {
            timestamp: currentTime / 1000, // Convert ms to seconds
            active_file: filePath,
            project_name: projectName || 'Unknown Project',
            coding_language: fileLanguage || 'Plain Text',
            is_file_modified: !!isFileWriteEvent, // Ensures boolean
            total_lines: lineCount,
            plugin_version: `brackets-devmetrics/${PLUGIN_REV}`,
            editor_id: 'brackets' // Added a new field
        };

        try {
            $.ajax({
                type: 'POST',
                url: apiEndpoint,
                contentType: 'application/json',
                data: JSON.stringify(payloadData),
                headers: {
                    'Authorization': 'Basic ' + btoa(rawAuthToken + ':'), // Assuming basic auth with empty password
                    'X-DevMetrics-Client': `Brackets/${PLUGIN_REV}` // Custom header
                },
                success: function(response) {
                    console.log("[DevMetrics] Activity signal sent successfully.", response);
                },
                error: function(xhr, status, error) {
                    console.error("[DevMetrics] Failed to send activity signal:", status, error, xhr.responseText);
                }
            });
            lastActivityTimestamp = currentTime;
            lastProcessedFilePath = filePath;
        } catch (e) {
            console.error("[DevMetrics] Error during AJAX call:", e.message);
        }
    }

    /**
     * Checks if enough time has passed since the last activity signal was sent.
     * @returns {boolean} True if the cooldown period has expired.
     */
    function isCooldownPeriodExpired() {
        return (Date.now() - lastActivityTimestamp) > MIN_ACTIVITY_INTERVAL_MS;
    }

    /**
     * Determines if a given file path should be ignored based on configured patterns.
     * @param {string} checkFilePath - The file path to check.
     * @returns {boolean} True if the file should be ignored.
     */
    function isFileExcludedFromTracking(checkFilePath) {
        const exclusionList = pluginConfig.get("exclusionPatterns");
        if (!exclusionList || exclusionList.length === 0) {
            return false; // No patterns to match, so nothing is excluded
        }

        // Using Array.prototype.some for cleaner iteration
        return exclusionList.some(pattern => {
            try {
                // Using 'i' for case-insensitive matching, 'g' is not needed for test()
                const regex = new RegExp(pattern, "i");
                return regex.test(checkFilePath);
            } catch (e) {
                console.warn(`[DevMetrics] Invalid regex pattern '${pattern}': ${e.message}`);
                return false; // Treat invalid patterns as non-matching
            }
        });
    }

    /**
     * Processes user activity, deciding whether to send an activity signal.
     * @param {boolean} isWriteEvent - True if the activity was a file write (save).
     */
    function processUserActivity(isWriteEvent) {
        const activeDoc = FileContentHandler.getCurrentDocument();

        // Guard clause for no active document
        if (!activeDoc) {
            console.debug("[DevMetrics] No active document to process activity.");
            return;
        }

        const currentFile = activeDoc.file;

        // Ensure we have a valid file object that is actually a file
        if (!currentFile || !currentFile.isFile) {
            console.debug("[DevMetrics] Active document is not a file or file object is invalid.");
            return;
        }

        const currentTimestamp = Date.now();
        const fullPath = currentFile.fullPath;

        // Determine if an activity signal should be sent
        const shouldSendSignal = isWriteEvent || // Always send on save
                                 isCooldownPeriodExpired() || // Send if cooldown elapsed
                                 (lastProcessedFilePath !== fullPath); // Send if file changed

        if (shouldSendSignal) {
            if (isFileExcludedFromTracking(fullPath)) {
                console.debug(`[DevMetrics] File '${fullPath}' is excluded from tracking.`);
                return;
            }

            // Extract relevant details for the activity signal
            const docLanguage = activeDoc.language ? activeDoc.language.getName() : 'unknown';
            const currentProject = WorkspaceContext.getProjectRoot();
            const projectName = currentProject ? currentProject.name : 'No Project';

            // Safely get editor line count
            let currentLineCount = undefined;
            if (activeDoc._masterEditor) { // Accessing internal property
                 currentLineCount = activeDoc._masterEditor.lineCount();
            } else if (typeof activeDoc.getEditor === 'function') { // More robust way if Brackets API changes
                const editorInstance = activeDoc.getEditor();
                if (editorInstance) {
                    currentLineCount = editorInstance.lineCount();
                }
            }

            // Dispatch the signal
            dispatchActivitySignal(fullPath, currentTimestamp, projectName, docLanguage, isWriteEvent, currentLineCount);
        } else {
            console.debug("[DevMetrics] Activity ignored: Cooldown active or same file without write event.");
        }
    }

    /**
     * Prompts the user to enter their DevMetrics authentication token.
     * Saves the token to preferences upon successful input.
     */
    function requestAuthToken() {
        const currentToken = pluginConfig.get("authToken");
        let userPrompt = "[DevMetrics] Please enter your DevMetrics API authentication token:";
        if (currentToken) {
            userPrompt += ` (Current: ${currentToken.substring(0, 4)}...${currentToken.substring(currentToken.length - 4)})`;
        }

        const inputToken = window.prompt(userPrompt, currentToken);

        if (inputToken) {
            const trimmedToken = inputToken.trim();
            // Basic validation for token length
            if (trimmedToken.length >= 10 && trimmedToken.length <= 64) { // Example length constraints
                pluginConfig.set("authToken", trimmedToken);
                pluginConfig.save();
                console.info("[DevMetrics] Authentication token updated successfully.");
            } else {
                window.alert("[DevMetrics] Invalid token format. Please enter a token between 10 and 64 characters.");
                console.warn("[DevMetrics] User entered an invalid token length.");
            }
        } else {
            console.info("[DevMetrics] Authentication token prompt cancelled by user.");
        }
    }

    // Initialize the plugin upon module load
    initializePlugin();

});