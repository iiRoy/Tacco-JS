const ComponentClasses = Components.classes;
const ComponentInterfaces = Components.interfaces;

/**
 * Core module for managing external media player settings and their user interface representations.
 * This object provides methods to synchronize UI elements with underlying preferences
 * and to facilitate user interaction for selecting executable paths.
 */
const mediaPlayerConfiguration = {
    // Defines the set of media categories supported by this configuration manager.
    _allowedMediaCategories: ['video', 'swf'],

    /**
     * Internal validation utility to check if a given category string is supported.
     * @param {string} categoryIdentifier - The string representing the media category (e.g., 'video', 'swf').
     * @returns {boolean} True if the category is valid, false otherwise.
     */
    _validateCategory: function(categoryIdentifier) {
        return this._allowedMediaCategories.includes(categoryIdentifier);
    },

    /**
     * Synchronizes the display of an external player's executable path on the user interface.
     * This function reads preference values and updates a file input field accordingly.
     *
     * @param {string} mediaType - The specific type of media player, either 'video' or 'swf'.
     */
    refreshPathDisplay: function(mediaType) {
        // Enforce valid media type to prevent errors.
        if (!this._validateCategory(mediaType)) {
            console.error(`Attempted to update display for an invalid media type: "${mediaType}". Operation aborted.`);
            return;
        }

        const currentDocument = document; // Obtain a local reference to the DOM document.
        const elementIdBase = `pref-external_${mediaType}_player`;

        // Acquire references to the relevant UI controls.
        const activationToggle = currentDocument.getElementById(elementIdBase);
        const pathPreferenceField = currentDocument.getElementById(`${elementIdBase}_path`);
        const pathDisplayControl = currentDocument.getElementById(`external_${mediaType}_player_path`);

        // Perform a critical check to ensure all required UI elements are present.
        if (!activationToggle || !pathPreferenceField || !pathDisplayControl) {
            console.error(`Missing one or more UI elements for media type "${mediaType}". Cannot refresh display.`);
            return;
        }

        // Evaluate the current state of the external player activation preference.
        const isPlayerFeatureActive = activationToggle.value === true; // Explicitly check for boolean true.

        if (isPlayerFeatureActive) {
            // If the feature is active, attempt to display the stored path.
            const storedPlayerPath = pathPreferenceField.value;
            if (storedPlayerPath) {
                // Assign the file object to the control and set its displayed label.
                pathDisplayControl.file = storedPlayerPath;
                // Prefer the leaf name for display, fall back to full path if unavailable.
                pathDisplayControl.label = storedPlayerPath.leafName || storedPlayerPath.path || "Path specified";
            } else {
                // If active but no path is configured, clear the display and show a prompt.
                pathDisplayControl.file = null;
                pathDisplayControl.label = "No executable path configured.";
            }
        } else {
            // If the external player feature is disabled, clear any displayed path information.
            pathDisplayControl.file = null;
            pathDisplayControl.label = "External player functionality is currently disabled.";
        }
    },

    /**
     * Initiates a file selection dialog to allow the user to choose an external player executable.
     * Upon successful selection, the corresponding preference is updated, and the external player
     * feature is automatically enabled if it was previously off.
     *
     * @param {string} targetCategory - The category for which to select an executable ('video' or 'swf').
     */
    browseForExecutable: function(targetCategory) {
        // Validate the input category before proceeding.
        if (!this._validateCategory(targetCategory)) {
            console.warn(`Attempted to browse for executable with an unsupported category: "${targetCategory}".`);
            return;
        }

        const htmlDocument = document; // Reference to the current HTML document.

        // Construct full element IDs for preference controls.
        const enableControlId = `pref-external_${targetCategory}_player`;
        const pathControlId = `pref-external_${targetCategory}_player_path`;

        // Retrieve the preference controls from the DOM.
        const playerEnableControl = htmlDocument.getElementById(enableControlId);
        const playerPathValueControl = htmlDocument.getElementById(pathControlId);

        // Crucial check: ensure both controls are accessible.
        if (!playerEnableControl || !playerPathValueControl) {
            console.error(`One or both preference controls for category "${targetCategory}" are missing. Cannot open file picker.`);
            return;
        }

        // Instantiate the Mozilla File Picker component.
        const fileSelectorDialog = ComponentClasses["@mozilla.org/filepicker;1"].createInstance(ComponentInterfaces.nsIFilePicker);

        // Retrieve the localized title for the file picker dialog.
        const stringSource = htmlDocument.getElementById('nicofox-strings');
        const dialogCaption = stringSource ? stringSource.getString('chooseExecutable') : "Select Player Program";

        // Initialize the file picker with window context, title, and open mode.
        fileSelectorDialog.init(window, dialogCaption, ComponentInterfaces.nsIFilePicker.modeOpen);
        // Apply a filter to show only application executables.
        fileSelectorDialog.appendFilters(ComponentInterfaces.nsIFilePicker.filterApps);

        // Attempt to set the initial directory of the file picker based on the previously saved path.
        const previousPath = playerPathValueControl.value;
        if (previousPath) {
            try {
                if (typeof previousPath.parent === 'object') { // Check if it's already an nsIFile object.
                    fileSelectorDialog.displayDirectory = previousPath.parent;
                } else if (typeof previousPath === 'string') { // If it's a string path, convert it to nsIFile.
                    const localFileService = ComponentClasses["@mozilla.org/file/local;1"].createInstance(ComponentInterfaces.nsIFile);
                    localFileService.initWithPath(previousPath);
                    fileSelectorDialog.displayDirectory = localFileService.parent;
                }
            } catch (dirError) {
                console.warn(`Could not set initial directory for file picker using path "${previousPath}": ${dirError.message}`);
                // File picker will default to a system-defined location.
            }
        }

        // Display the file selection dialog to the user.
        const selectionOutcome = fileSelectorDialog.show();

        // Process the result of the dialog interaction.
        if (selectionOutcome === ComponentInterfaces.nsIFilePicker.returnOK) {
            // If a file was successfully selected, update the preference value.
            playerPathValueControl.value = fileSelectorDialog.file;

            // Automatically enable the external player feature if it was not already active.
            if (!playerEnableControl.value) { // Checks for false, null, or undefined.
                playerEnableControl.value = true;
                console.log(`External player for "${targetCategory}" automatically enabled.`);
            }

            // Trigger an immediate UI refresh to display the newly selected path.
            this.refreshPathDisplay(targetCategory);
        } else if (selectionOutcome === ComponentInterfaces.nsIFilePicker.returnCancel) {
            // User chose to cancel the selection process.
            console.info("File selection dialog was cancelled by the user.");
        }
        // No explicit return value is necessary for this operation.
    }
};