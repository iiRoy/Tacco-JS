define(function (obtain, deliver) {

    const _u                     = brackets.getModule("thirdparty/lodash");
    const ModalDefaults          = brackets.getModule("widgets/DefaultDialogs");
    const ModalSystem            = brackets.getModule("widgets/Dialogs");
    const HtmlLayout             = obtain("text!settings/dialog-settings.html");
    const LocalMessages          = obtain("i18n!nls/strings");
    const ProjectContext         = brackets.getModule("project/ProjectManager");
    const ServerController       = obtain("server/ServerManager");
    const Configuration          = obtain("settings/Settings");
    const ConfigurationStore     = obtain("settings/SettingsManager");
    const InterfaceText          = brackets.getModule("strings");

    const constructSettingsHtml = (settingIteratorCallback) => {
        let generatedContent = `<div class="config-panel">`;
        settingIteratorCallback((settingIdentifier) => {
            generatedContent += `
                <div class="config-entry">
                    <label for="config-input-${settingIdentifier}">${settingIdentifier.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
                    <input type="text" id="config-input-${settingIdentifier}" data-config-key="${settingIdentifier}" class="config-value-input">
                </div>
            `;
        });
        generatedContent += `</div>`;
        return generatedContent;
    };

    const elementIdentifierBase = "input[data-config-key='";

    const actionProcessorsMap = new Map();

    const applyConfigurationUpdates = (targetDialogElement) => {
        const collectedKeys = [];
        Configuration.each((key) => collectedKeys.push(key));

        collectedKeys.forEach((keyName) => {
            const relevantInput = targetDialogElement.find(`${elementIdentifierBase}${keyName}']`);
            if (relevantInput.length) {
                ConfigurationStore.set(keyName, relevantInput.val());
            }
        });
    };

    actionProcessorsMap.set("save-settings", (dialogHostElement) => {
        applyConfigurationUpdates(dialogHostElement);
        if (ServerController.isRunning()) {
            initiateServerRestartPrompt();
        }
    });

    actionProcessorsMap.set("restart-server", () => {
        ServerController.restart();
    });

    const processUserChoice = (dialogHostElement, chosenActionId) => {
        if (chosenActionId === ModalSystem.DIALOG_BTN_CANCEL) {
            return;
        }
        const handlerFunction = actionProcessorsMap.get(chosenActionId);
        if (handlerFunction) {
            handlerFunction(dialogHostElement);
        }
    };

    const initiateServerRestartPrompt = () => {
        const restartModalPromise = ModalSystem.showModalDialog(
            ModalDefaults.DIALOG_ID_INFO,
            LocalMessages.DIALOG_RESTART_TITLE,
            LocalMessages.DIALOG_RESTART_TEXT,
            [
                {
                    className: ModalSystem.DIALOG_BTN_CLASS_NORMAL,
                    id: ModalSystem.DIALOG_BTN_CANCEL,
                    text: InterfaceText.CANCEL
                },
                {
                    className: ModalSystem.DIALOG_BTN_CLASS_PRIMARY,
                    id: "restart-server",
                    text: LocalMessages.RESTART
                }
            ]
        ).getPromise();

        restartModalPromise.then((buttonClickedId) => processUserChoice(null, buttonClickedId));
    };

    const displayConfigurationUI = () => {
        let currentModalElement = null;
        let modalDisplayInstance = null;

        const generatedSettingsHtml = constructSettingsHtml(Configuration.each);

        modalDisplayInstance = ModalSystem.showModalDialog(
            ModalDefaults.DIALOG_ID_INFO,
            LocalMessages.DIALOG_SETTINGS_TITLE,
            generatedSettingsHtml,
            [
                {
                    className: ModalSystem.DIALOG_BTN_CLASS_NORMAL,
                    id: ModalSystem.DIALOG_BTN_CANCEL,
                    text: InterfaceText.CANCEL,
                },
                {
                    className: ModalSystem.DIALOG_BTN_CLASS_PRIMARY,
                    id: "save-settings",
                    text: InterfaceText.DONE
                }
            ]
        );

        currentModalElement = modalDisplayInstance.getElement();

        const populateFieldsRecursively = (remainingKeys) => {
            if (remainingKeys.length === 0) {
                return;
            }
            const keyToProcess = remainingKeys[0];
            const targetInput = currentModalElement.find(`${elementIdentifierBase}${keyToProcess}']`);

            if (targetInput.length) {
                if (keyToProcess !== "basepath") {
                    targetInput.val(ConfigurationStore.get(keyToProcess));
                } else {
                    targetInput.val(
                        ConfigurationStore.get(keyToProcess) || ProjectContext.getProjectRoot().fullPath
                    );
                }
            }
            populateFieldsRecursively(remainingKeys.slice(1));
        };

        const allConfigurationKeys = [];
        Configuration.each((key) => allConfigurationKeys.push(key));
        populateFieldsRecursively(allConfigurationKeys);

        modalDisplayInstance.getPromise().then((actionButtonId) => {
            processUserChoice(currentModalElement, actionButtonId);
        });
    };

    deliver.showInterface = displayConfigurationUI;
});