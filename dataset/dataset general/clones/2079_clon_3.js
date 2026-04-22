define(function (reqMod, expMod) {

    // Core utilities and Brackets API modules are loaded here.
    const lodashUtil            = brackets.getModule("thirdparty/lodash");
    const standardDialogs       = brackets.getModule("widgets/DefaultDialogs");
    const dialogAPI             = brackets.getModule("widgets/Dialogs");
    const settingsHTMLTemplate  = reqMod("text!settings/dialog-settings.html");
    const extLocalStrings       = reqMod("i18n!nls/strings");
    const projManagement        = brackets.getModule("project/ProjectManager");
    const backendServiceManager = reqMod("server/ServerManager");
    const appSettings           = reqMod("settings/Settings");
    const settingsStore         = reqMod("settings/SettingsManager");
    const coreStrings           = brackets.getModule("strings");

    /**
     * Pre-compiled template function for rendering the settings dialog's content.
     * @type {Function}
     * @param {Object} dataForTemplate - Data context for template rendering.
     * @return {String} Rendered HTML string for the dialog body.
     */
    const compileSettingsDialogTemplate = lodashUtil.template(settingsHTMLTemplate);

    /**
     * Base prefix for identifying input elements related to settings within the dialog.
     * @type {string}
     */
    const settingInputPrefix = "#staticpreview-setting-";

    /**
     * Common CSS class for primary action buttons in dialogs.
     * @type {string}
     */
    const PRIMARY_BUTTON_CLASS = dialogAPI.DIALOG_BTN_CLASS_PRIMARY;

    /**
     * Generates a jQuery selector for a specific setting input field.
     * @param {string} settingId - The unique identifier of the setting.
     * @returns {string} The full jQuery selector string.
     */
    function getSettingElementSelector(settingId) {
        return `${settingInputPrefix}${settingId}`;
    }

    /**
     * Creates a standardized button configuration object for dialogs.
     * @param {string} id - The unique ID for the button (e.g., "saveConfiguration").
     * @param {string} text - The display text for the button.
     * @param {string} [className=dialogAPI.DIALOG_BTN_CLASS_NORMAL] - CSS class for the button.
     * @returns {Object} A button configuration object.
     */
    function createDialogButton(id, text, className = dialogAPI.DIALOG_BTN_CLASS_NORMAL) {
        return {
            className: className,
            id: id,
            text: text
        };
    }

    /**
     * Handles user interactions from modal dialogs, specifically for settings.
     * @param {JQuery|null} currentModalJQueryObj - The jQuery object representing the dialog's root element,
     *                                              or null if the action does not require direct dialog access.
     * @param {string} userActionId - Identifier for the action triggered by the dialog button.
     * @private
     */
    function handleModalInteraction(currentModalJQueryObj, userActionId) {
        console.debug(`[SettingsPanel] Modal interaction received: ${userActionId}`);

        if (!userActionId) {
            console.warn("[SettingsPanel] Received an undefined or null action ID from modal.");
            return;
        }

        switch (userActionId) {
            case "cancelAction":
                // No action needed for cancel, dialog is dismissed.
                break;

            case "persistChanges":
                if (!currentModalJQueryObj) {
                    console.error("[SettingsPanel] Attempted to save settings without a valid modal element.");
                    return;
                }
                // Iterate through all application settings to save their current values.
                appSettings.forEachSetting((settingKey) => {
                    const inputElement = currentModalJQueryObj.find(getSettingElementSelector(settingKey));
                    if (inputElement.length > 0) {
                        settingsStore.set(settingKey, inputElement.val());
                        console.debug(`[SettingsPanel] Saved setting '${settingKey}' with value: ${inputElement.val()}`);
                    } else {
                        console.warn(`[SettingsPanel] Input element not found for setting: ${settingKey}`);
                    }
                });

                // Check if the backend service is running and prompt for restart if settings changed.
                if (backendServiceManager.isServerRunning()) {
                    promptForServiceRestart();
                }
                break;

            case "initiateRestart":
                // User confirmed server restart.
                console.info("[SettingsPanel] Initiating backend service restart as requested.");
                backendServiceManager.triggerServerRestart();
                break;

            default:
                console.warn(`[SettingsPanel] Unrecognized modal action ID: ${userActionId}`);
                break;
        }
    }

    /**
     * Displays the application's configuration panel as a modal dialog.
     * This function allows users to view and modify various settings.
     */
    function displaySettingsPanel() {
        let modalRootElement = null; // Reference to the jQuery object of the modal's root.

        // Define the buttons for the settings dialog.
        const settingsDialogButtons = [
            createDialogButton(dialogAPI.DIALOG_BTN_CANCEL, coreStrings.CANCEL_LABEL, dialogAPI.DIALOG_BTN_CLASS_NORMAL),
            createDialogButton("persistChanges", coreStrings.SAVE_LABEL, PRIMARY_BUTTON_CLASS)
        ];

        // Show the modal dialog with the rendered settings template.
        const modalPromiseHandle = dialogAPI.showModalDialog(
            standardDialogs.INFO_DIALOG_IDENTIFIER,
            extLocalStrings.CONFIGURATION_PANEL_HEADER,
            compileSettingsDialogTemplate({ settingsIterator: appSettings.iterateAll }), // Pass an iterator for template.
            settingsDialogButtons
        );

        // Retrieve the actual DOM element of the dialog after it's shown.
        modalRootElement = modalPromiseHandle.getModalElement();

        if (!modalRootElement || modalRootElement.length === 0) {
            console.error("[SettingsPanel] Failed to retrieve dialog element after showing modal.");
            return; // Early exit if the dialog element isn't available.
        }

        // Populate the input fields within the dialog with current setting values.
        appSettings.forEachSetting((settingKey) => {
            const inputField = modalRootElement.find(getSettingElementSelector(settingKey));
            if (inputField.length > 0) {
                let settingValue = settingsStore.get(settingKey);

                // Special handling for the 'basepath' setting:
                // If it's not set, default to the current project's root path.
                if (settingKey === "basepath") {
                    settingValue = settingValue || projManagement.getProjectRootPath().fullPath;
                }

                inputField.val(settingValue);
                console.debug(`[SettingsPanel] Populated setting '${settingKey}' with value: ${settingValue}`);
            } else {
                console.warn(`[SettingsPanel] Input field for setting '${settingKey}' not found in dialog.`);
            }
        });

        // Attach a handler to the dialog's promise, which resolves when a button is clicked.
        modalPromiseHandle.getPromise().then(handleModalInteraction.bind(null, modalRootElement));
    }

    /**
     * Displays a confirmation dialog to the user, asking if they want to restart the server.
     * This is typically shown after settings that require a server restart have been modified.
     * @private
     */
    function promptForServiceRestart() {
        console.info("[SettingsPanel] Displaying server restart prompt.");

        // Define the buttons for the restart confirmation dialog.
        const restartDialogButtons = [
            createDialogButton(dialogAPI.DIALOG_BTN_CANCEL, coreStrings.CANCEL_LABEL, dialogAPI.DIALOG_BTN_CLASS_NORMAL),
            createDialogButton("initiateRestart", extLocalStrings.RESTART_BUTTON_LABEL, PRIMARY_BUTTON_CLASS)
        ];

        // Show the modal dialog.
        dialogAPI.showModalDialog(
            standardDialogs.INFO_DIALOG_IDENTIFIER,
            extLocalStrings.RESTART_DIALOG_TITLE,
            extLocalStrings.RESTART_DIALOG_MESSAGE,
            restartDialogButtons
        )
        // Bind the interaction handler to the dialog's promise.
        // Pass null for the modal element as this specific dialog doesn't require direct element access for its actions.
        .getPromise().then(handleModalInteraction.bind(null, null));
    }

    // Expose the public API for this module.
    expMod.displayConfiguration = displaySettingsPanel;
});