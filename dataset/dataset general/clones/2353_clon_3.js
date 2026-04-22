/*
   Module: Tab State Archiver
   Purpose: Periodically saves the URLs and titles of all open browser tabs to a file.
   Original Author: Joseph Turian
   Refactored By: A Code Generation Engine
   License: BSD 3-Clause License (as per original project)

   This software is provided "as is," without warranty of any kind, express or
   implied. The authors and copyright holders disclaim all warranties, including,
   but not limited to, implied warranties of merchantability and fitness for a
   particular purpose. In no event shall the authors or copyright holders be
   liable for any direct, indirect, incidental, special, exemplary, or
   consequential damages arising from the use or inability to use this software.
*/

const tabSnapshotManager = {

    // Core Mozilla XPCOM interfaces
    componentFactory: Components.classes,
    interfaceSpecifier: Components.interfaces,

    // Configuration object for preferences
    prefServiceBranch: null,

    // Internal flag to prevent re-initialization
    isModuleInitialized: false,

    // Helper to ensure numbers are two digits (e.g., 5 -> "05")
    #padTwoDigits(inputNum) {
        return String(inputNum).padStart(2, '0');
    },

    // Fetches a user or system identifier from environment variables
    #retrieveSystemIdentifier() {
        const environmentAccess = this.componentFactory["@mozilla.org/process/environment;1"]
            .getService(this.interfaceSpecifier.nsIEnvironment);
        let systemUserAlias = "unknown_user"; // Default identifier

        if (environmentAccess.exists("USERNAME")) { // Prioritize Windows USERNAME
            systemUserAlias = environmentAccess.get('USERNAME');
        } else if (environmentAccess.exists("USER")) { // Then Unix USER
            systemUserAlias = environmentAccess.get('USER');
        } else if (environmentAccess.exists("COMPUTERNAME")) { // Fallback to computer name
            systemUserAlias = environmentAccess.get('COMPUTERNAME');
        }
        // If still "unknown_user", it will remain so.
        return systemUserAlias.replace(/[^a-zA-Z0-9_\-]/g, '_'); // Sanitize for filename
    },

    /**
     * Initializes the tab snapshot manager.
     * Sets up preferences and schedules the first capture.
     */
    initializeModule: function() {
        if (this.isModuleInitialized) {
            // Module already set up, no need to re-run.
            return;
        }

        try {
            // Access the Mozilla preferences service
            const preferencesServiceInstance = this.componentFactory["@mozilla.org/preferences-service;1"]
                .getService(this.interfaceSpecifier.nsIPrefService);

            // Get the specific branch for this extension's settings
            this.prefServiceBranch = preferencesServiceInstance.getBranch("extensions.tabsnapshot."); // Changed branch name

            this.isModuleInitialized = true; // Mark as initialized
            this.scheduleNextCapture(); // Kick off the periodic saving process
        } catch (error) {
            console.error("TabSnapshotManager: Failed to initialize module.", error);
            // Optionally, disable functionality or show a user alert.
        }
    },

    /**
     * Captures the state of all open browser tabs and saves them to a file.
     * This method ensures only the most recent window triggers the save.
     */
    captureBrowserState: function() {
        // Ensure preferences are loaded before proceeding
        if (!this.prefServiceBranch) {
            console.warn("TabSnapshotManager: Preferences not loaded. Skipping capture.");
            this.scheduleNextCapture(); // Try again later
            return;
        }

        // Check if this window is the primary browser window
        const windowManager = this.componentFactory["@mozilla.org/appshell/window-mediator;1"]
            .getService(this.interfaceSpecifier.nsIWindowMediator);

        if (window !== windowManager.getMostRecentWindow("navigator:browser")) {
            // Not the primary window, defer the action to the main instance.
            this.scheduleNextCapture();
            return;
        }

        const collectedTabInfo = []; // Array to store formatted tab data

        let currentWindowIndex = 1;
        const browserWindowIterator = windowManager.getEnumerator("navigator:browser");

        // Iterate through all open browser windows
        while (browserWindowIterator.hasMoreElements()) {
            const currentBrowserWindow = browserWindowIterator.getNext();
            const tabbedBrowserInstance = currentBrowserWindow.gBrowser;

            let currentTabIndex = 1;
            // Iterate through all tabs within the current window
            Array.from(tabbedBrowserInstance.browsers).forEach(currentTabBrowser => { // Using Array.from and forEach
                const tabUrl = currentTabBrowser.currentURI.spec.replace(/\t/g, ' '); // Replace tabs in URL
                const tabTitle = currentTabBrowser.contentDocument.title.replace(/\t/g, ' '); // Replace tabs in title
                collectedTabInfo.push(`Window #${currentWindowIndex}/Tab #${currentTabIndex++}\t${tabUrl}\t${tabTitle}`);
            });
            currentWindowIndex++; // Increment window counter for next iteration
        }

        // Get current timestamp for filename
        const currentDateTime = new Date();
        const fullYear = currentDateTime.getFullYear();
        const monthValue = this.#padTwoDigits(currentDateTime.getMonth() + 1); // Month is 0-indexed
        const dayOfMonth = this.#padTwoDigits(currentDateTime.getDate());
        const hoursValue = this.#padTwoDigits(currentDateTime.getHours());
        const minutesValue = this.#padTwoDigits(currentDateTime.getMinutes());

        // Determine the output directory based on user preferences
        let outputFileHandle = null;
        const destinationDirectoryPath = this.prefServiceBranch.getCharPref("outputDirectory"); // Changed pref name

        switch (destinationDirectoryPath) {
            case "Profile":
                outputFileHandle = this.componentFactory["@mozilla.org/file/directory_service;1"]
                    .getService(this.interfaceSpecifier.nsIProperties)
                    .get("ProfD", this.interfaceSpecifier.nsIFile);
                break;
            case "Home":
                outputFileHandle = this.componentFactory["@mozilla.org/file/directory_service;1"]
                    .getService(this.interfaceSpecifier.nsIProperties)
                    .get("Home", this.interfaceSpecifier.nsIFile);
                break;
            default:
                // For custom paths, ensure it's a valid local file path
                if (destinationDirectoryPath && destinationDirectoryPath.length > 0) {
                    try {
                        outputFileHandle = this.componentFactory["@mozilla.org/file/local;1"]
                            .createInstance(this.interfaceSpecifier.nsILocalFile);
                        outputFileHandle.initWithPath(destinationDirectoryPath);
                    } catch (e) {
                        console.error("TabSnapshotManager: Invalid custom directory path specified:", destinationDirectoryPath, e);
                        outputFileHandle = null; // Invalidate handle if path is bad
                    }
                }
                break;
        }

        // Proceed only if a valid file handle could be obtained
        if (outputFileHandle && outputFileHandle.exists()) {
            const fileNameTimestamp = `${fullYear}${monthValue}${dayOfMonth}-${hoursValue}${minutesValue}`;
            const userName = this.#retrieveSystemIdentifier();
            const fullFileName = `browser_tabs_snapshot-${userName}-${fileNameTimestamp}.txt`; // New filename pattern

            outputFileHandle.append(fullFileName); // Append filename to directory path

            try {
                // Create a file output stream to write data
                const fileOutputStream = this.componentFactory["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(this.interfaceSpecifier.nsIFileOutputStream);

                // Initialize stream: write, create if not exists, truncate if exists
                // 0x02: PR_WRONLY (write only)
                // 0x08: PR_CREATE_FILE (create if not exist)
                // 0x20: PR_TRUNCATE (truncate if exists)
                const fileMode = 0x02 | 0x08 | 0x20;
                fileOutputStream.init(outputFileHandle, fileMode, 0o644, 0); // Changed permissions to 0o644

                // Use a converter stream to handle UTF-8 encoding
                const textEncoderStream = this.componentFactory["@mozilla.org/intl/converter-output-stream;1"]
                    .createInstance(this.interfaceSpecifier.nsIConverterOutputStream);
                textEncoderStream.init(fileOutputStream, "UTF-8", 0, 0);

                // Write all collected tab information, joined by platform-specific newlines
                textEncoderStream.writeString(collectedTabInfo.join(Components.utils.getAppInfo().OS === "WINNT" ? "\r\n" : "\n"));
                textEncoderStream.close(); // Close the converter stream, which also closes the file stream
                console.log(`TabSnapshotManager: Successfully saved tab state to: ${outputFileHandle.path}`);
            } catch (error) {
                console.error("TabSnapshotManager: Error writing tab data to file:", error);
            }
        } else if (outputFileHandle) {
             console.warn(`TabSnapshotManager: Specified directory does not exist or is not a directory: ${outputFileHandle.path}`);
        } else {
             console.error("TabSnapshotManager: Could not determine valid output file path.");
        }


        // Schedule the next capture operation
        this.scheduleNextCapture();
    },

    // Holds the ID of the currently active timeout for the next capture
    #currentTimeoutId: null,

    /**
     * Schedules the next tab state capture.
     * Clears any previously scheduled capture to prevent multiple timers.
     */
    scheduleNextCapture: function() {
        if (this.#currentTimeoutId) {
            clearTimeout(this.#currentTimeoutId); // Clear any existing timer
        }

        const selfReference = this;
        // Get the delay period from preferences, defaulting to 15 minutes if not found or invalid.
        const capturePeriodMinutes = Math.max(1, this.prefServiceBranch.getIntPref("captureIntervalMinutes") || 15); // Changed pref name, added default/min value
        const delayMilliseconds = capturePeriodMinutes * 60 * 1000;

        this.#currentTimeoutId = setTimeout(function() {
            selfReference.captureBrowserState();
        }, delayMilliseconds);

        console.debug(`TabSnapshotManager: Next capture scheduled in ${capturePeriodMinutes} minutes.`);
    },
};

// Attach the initialization method to the browser's load event
window.addEventListener("load", function() {
    tabSnapshotManager.initializeModule();
}, false);