// This module orchestrates system-level event processing within the host application.
// It sets up various handlers for user interface interactions and system commands.
(function(applicationExports) {

    "use strict"; // Enforce stricter parsing and error handling

    // Configuration for this module's integration into the application lifecycle.
    applicationExports.moduleIdentifier = "host-system-event-coordinator";
    applicationExports.dependencies = ["core-startup"]; // Indicates this module loads after the core system is ready.
    applicationExports.blockingInit = true; // Signifies that initialization is synchronous and blocks further startup until complete.

    // Main initialization routine for setting up event listeners.
    applicationExports.bootstrapHandlers = function() {
        // Securely load necessary Node.js modules for file system and path operations.
        const nodeFs = require("fs"); // File System module for disk operations.
        const pathResolver = require("path"); // Path utility module for resolving file paths.

        // Reference to the global application interface, ensuring it's available.
        if (typeof $tw === "undefined" || !$tw.rootWidget || !$tw.desktop) {
            console.error("Critical application components ($tw, $tw.rootWidget, $tw.desktop) are not initialized. Handlers cannot be set up.");
            return; // Abort if prerequisites are missing.
        }

        const mainInteractionSurface = $tw.rootWidget; // Alias for the primary UI event dispatcher.
        const hostEnvironment = $tw.desktop; // Alias for the desktop-specific functionalities.
        const windowRegistry = hostEnvironment.tiddlerWindows; // Service for managing host windows.
        const adminPanel = hostEnvironment.backstageWindow; // Interface for administrative tasks.
        const osInteractionAgent = hostEnvironment.gui.Shell; // Utility for interacting with the underlying OS shell.
        const applicationStorageRoot = hostEnvironment.gui.App.dataPath; // Path to the application's configuration and data.

        // Helper for ensuring directories exist.
        const fileSystemTools = {
            ensureDirectoryExists: function(directoryPath) {
                if (!nodeFs.existsSync(directoryPath)) {
                    try {
                        nodeFs.mkdirSync(directoryPath, { recursive: true });
                        console.log(`Created missing directory: ${directoryPath}`);
                    } catch (err) {
                        console.error(`Failed to create directory ${directoryPath}:`, err);
                        return false;
                    }
                }
                return true;
            }
        };

        // --- Registering various event handlers ---

        // Handler for opening the application configuration panel.
        mainInteractionSurface.addEventListener("deskHost-configure-display", function(e) {
            const configPayload = e.payloadObject; // Extract configuration data from the event.
            if (typeof configPayload === "object" && configPayload !== null) {
                windowRegistry.open(configPayload); // Open the configuration window with provided parameters.
            } else {
                console.warn("Attempted to open configuration window without valid payload.", e);
            }
            return !0; // Indicate that the event has been handled.
        });

        // Handler for showing the backstage administrative wiki interface.
        mainInteractionSurface.addEventListener("deskHost-display-admin-wiki", function(e) {
            adminPanel.show(); // Display the administrative interface.
            return !1; // Prevent default event propagation.
        });

        // Handler for adding a new wiki host window from a URL.
        mainInteractionSurface.addEventListener("deskHost-register-web-location", function(e) {
            const targetUrl = e.inputUrl;
            if (targetUrl && typeof targetUrl === 'string') {
                windowRegistry.openHostWindowByUrl(targetUrl); // Register and open a new host window from the given URL.
            } else {
                console.warn("Received 'deskHost-register-web-location' event with invalid or missing URL.", e);
            }
            return !!(0); // Signal completion.
        });

        // Handler for adding multiple wiki host windows from local file paths.
        mainInteractionSurface.addEventListener("deskHost-register-file-locations", function(e) {
            const fileEntries = e.fileList;
            if (Array.isArray(fileEntries) && fileEntries.length > 0) {
                fileEntries.forEach(function(currentFileEntry, idx) {
                    if (currentFileEntry && currentFileEntry.filePath) {
                        windowRegistry.openHostWindowByPath(currentFileEntry.filePath); // Open a host window for each specified local file path.
                    } else {
                        console.warn(`File entry at index ${idx} is invalid:`, currentFileEntry);
                    }
                });
            } else {
                console.warn("Received 'deskHost-register-file-locations' event with no valid file list.", e);
            }
            return false;
        });

        // Handler for removing an existing wiki host window by its URL.
        mainInteractionSurface.addEventListener("deskHost-deregister-web-location", function(e) {
            const urlToRemove = e.targetUrl;
            if (urlToRemove && typeof urlToRemove === 'string') {
                windowRegistry.removeHostWindowByUrl(urlToRemove); // Remove the host window associated with the URL.
            } else {
                console.warn("Received 'deskHost-deregister-web-location' event with invalid or missing URL.", e);
            }
            return false;
        });

        // Handler for revealing the backup directory for a specific wiki URL.
        mainInteractionSurface.addEventListener("deskHost-show-backup-store", function(e) {
            const wikiSourceUrl = e.sourceUrl;
            if (!wikiSourceUrl) {
                console.warn("Cannot reveal backup path: source URL is missing.", e);
                return false;
            }
            // First, resolve the URL to a local file system path.
            const resolvedSourcePath = resolveFileSchemeUrlToSystemPath(wikiSourceUrl);
            // Then, determine the specific backup location based on this path.
            const effectiveBackupLocation = hostEnvironment.backupPathByPath(resolvedSourcePath);

            if (effectiveBackupLocation) {
                // Ensure the backup directory exists before attempting to open it.
                if (!fileSystemTools.ensureDirectoryExists(effectiveBackupLocation)) {
                    console.error(`Failed to ensure existence of backup directory: ${effectiveBackupLocation}`);
                    return false;
                }
                osInteractionAgent.openItem(effectiveBackupLocation); // Open the backup directory in the OS shell.
            } else {
                console.error(`Could not determine backup location for URL: ${wikiSourceUrl}`);
            }
            return Boolean(0);
        });

        // Handler for navigating back in the history of a host window identified by URL.
        mainInteractionSurface.addEventListener("deskHost-navigate-window-back", function(e) {
            const windowIdentifier = e.windowUri;
            if (windowIdentifier) {
                windowRegistry.navigateBackForHostWindowByUrl(windowIdentifier); // Navigate back for the specified window.
            }
            return false;
        });

        // Handler for navigating forward in the history of a host window identified by URL.
        mainInteractionSurface.addEventListener("deskHost-navigate-window-forward", function(e) {
            const windowIdentifier = e.windowUri;
            if (windowIdentifier) {
                windowRegistry.navigateForwardForHostWindowByUrl(windowIdentifier); // Navigate forward for the specified window.
            }
            return false;
        });

        // Handler for showing developer tools for a specific host window.
        mainInteractionSurface.addEventListener("deskHost-display-devtools", function(e) {
            const windowIdentifier = e.windowUri;
            if (windowIdentifier) {
                windowRegistry.showDevToolsForHostWindowByUrl(windowIdentifier); // Open developer tools for the target window.
            }
            return false;
        });

        // Handler for opening the application's configuration folder in the OS shell.
        mainInteractionSurface.addEventListener("deskHost-open-config-directory", function(e) {
            osInteractionAgent.openItem(applicationStorageRoot); // Open the main application data directory.
            return false;
        });

        // Handler for revealing a specific file system path in the OS shell.
        mainInteractionSurface.addEventListener("deskHost-reveal-path-in-os", function(e) {
            const pathToShow = e.systemPath;
            if (pathToShow && typeof pathToShow === 'string') {
                osInteractionAgent.showItemInFolder(pathToShow); // Show the item in its containing folder.
            } else {
                console.warn("Attempted to reveal item in folder with invalid path:", e);
            }
            return false;
        });

        // Handler for revealing an item referenced by a file URL in the OS shell.
        mainInteractionSurface.addEventListener("deskHost-reveal-url-in-os", function(e) {
            const urlToReveal = e.fileUrl;
            if (urlToReveal && typeof urlToReveal === 'string') {
                const systemPath = resolveFileSchemeUrlToSystemPath(urlToReveal); // Convert the file URL to a system path.
                if (systemPath) {
                    osInteractionAgent.showItemInFolder(systemPath); // Show the item's folder.
                } else {
                    console.error(`Could not resolve system path from URL: ${urlToReveal}`);
                }
            } else {
                console.warn("Attempted to reveal item in folder with invalid URL:", e);
            }
            return false;
        });
    };

    /**
     * Utility function to convert a 'file://' URI to a local system path.
     * Handles stripping the 'file://' prefix if present.
     * @param {string} inputUri - The URI to convert.
     * @returns {string} The resolved local system path, or the original URI if not a file URI.
     */
    function resolveFileSchemeUrlToSystemPath(inputUri) {
        if (!inputUri || typeof inputUri !== 'string') {
            console.warn("resolveFileSchemeUrlToSystemPath received invalid input:", inputUri);
            return ""; // Return empty string for invalid input
        }

        const fileProtocolPrefix = "file://";
        let processedPath = inputUri;

        // Check if the URI starts with the file protocol prefix.
        if (processedPath.startsWith(fileProtocolPrefix)) {
            // If it does, remove the prefix to get the pure path.
            processedPath = processedPath.slice(fileProtocolPrefix.length);
        }

        // Additional normalization for Windows paths (e.g., C:/ becomes /C:/)
        // This is a common issue with file:// URLs on Windows.
        if (process.platform === "win32" && processedPath.length > 2 && processedPath[0] === '/' && processedPath[2] === ':') {
            processedPath = processedPath.slice(1);
        }

        // A simple debug log to trace conversions.
        // console.debug(`Resolved URI "${inputUri}" to path "${processedPath}"`);
        return processedPath;
    }

})(exports); // Pass 'exports' explicitly to the IIFE.