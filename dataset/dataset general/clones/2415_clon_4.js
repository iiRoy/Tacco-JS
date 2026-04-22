define(function (obtain, exportables, self) {
    "use strict";

    const EXT_VER = '1.0.4';
    const IDLE_THRESHOLD_MS = 120000;

    const VisualDisplay = obtain("view/MainViewManager");
    const FileRegistry = obtain("document/DocumentManager");
    const WorkspaceTree = obtain("project/ProjectManager");
    const SettingStore = obtain("preferences/PreferencesManager");
    const ActionOrchestrator = obtain("command/CommandManager");
    const MenuAssembler = obtain("command/Menus");

    class ConfigurationVault {
        constructor(namespace) {
            this.internalSettings = SettingStore.getExtensionPrefs(namespace);
            this.defaultMap = new Map();
        }

        establish(key, type, defaultValue) {
            this.defaultMap.set(key, defaultValue);
            this.internalSettings.definePreference(key, type, defaultValue);
            if (this.internalSettings.getPreferenceLocation(key).scope === 'default') {
                this.internalSettings.set(key, this.internalSettings.get(key));
                this.internalSettings.save();
            }
        }

        fetch(key) {
            return this.internalSettings.get(key);
        }

        store(key, value) {
            this.internalSettings.set(key, value);
            this.internalSettings.save();
        }
    }

    const appPreferences = new ConfigurationVault("TelemetryAgent");

    const operationalStatus = {
        previousTimestamp: 0,
        currentDocumentPath: undefined
    };

    const encodeBase64 = (text) => window.btoa(text);

    function commenceOperation() {
        initializeSettings();
        injectInterfaceOption();
        if (!appPreferences.fetch("credentialKey")) {
            requestCredential();
        }
        attachObservers();
    }

    function initializeSettings() {
        appPreferences.establish("credentialKey", "string", "");
        appPreferences.establish("exclusionPatterns", "array", ["^/var/", "^/tmp/", "^/private/"]);
    }

    function injectInterfaceOption() {
        const OPTION_IDENTIFIER = "telemetry.credential";
        ActionOrchestrator.register("Configure API Key", OPTION_IDENTIFIER, requestCredential);

        const mainMenuBar = MenuAssembler.getMenu(MenuAssembler.AppMenuBar.FILE_MENU);
        mainMenuBar.addMenuDivider();
        mainMenuBar.addMenuItem(OPTION_IDENTIFIER);
    }

    function attachObservers() {
        $(VisualDisplay).on('currentFileChange', () => processActivity());
        $(FileRegistry).on('documentSaved', () => processActivity(true));
        $(window).on('keypress', () => processActivity());
    }

    const isCooldownExpired = () => (operationalStatus.previousTimestamp + IDLE_THRESHOLD_MS < Date.now());

    const shouldBypassTracking = (filePath) => {
        const patterns = appPreferences.fetch("exclusionPatterns");
        return patterns.some(pattern => new RegExp(pattern, "gi").test(filePath));
    };

    const extractDocumentData = (currentDoc) => {
        if (!currentDoc) return null;
        const file = currentDoc.file;
        if (!file || !file.isFile) return null;

        const path = file.fullPath;
        const language = currentDoc.language ? currentDoc.language.getName() : undefined;
        const project = WorkspaceTree.getProjectRoot() ? WorkspaceTree.getProjectRoot().name : undefined;
        const editor = currentDoc._masterEditor;
        const lineCount = editor ? editor.lineCount() : undefined;

        return { path, language, project, lineCount };
    };

    function processActivity(isWriteOperation = false) {
        const currentDoc = FileRegistry.getCurrentDocument();
        const docData = extractDocumentData(currentDoc);

        if (!docData) return;

        const currentTime = Date.now();
        const needsTransmission = isWriteOperation || isCooldownExpired() || (operationalStatus.currentDocumentPath !== docData.path);

        if (needsTransmission && !shouldBypassTracking(docData.path)) {
            transmitTelemetry(docData.path, currentTime, docData.project, docData.language, isWriteOperation, docData.lineCount);
        }
    }

    function transmitTelemetry(fileIdentifier, moment, projectContext, codingLanguage, isModification, totalLines) {
        $.ajax({
            type: 'POST',
            url: 'https://wakatime.com/api/v1/actions',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                time: moment / 1000,
                file: fileIdentifier,
                project: projectContext,
                language: codingLanguage,
                is_write: isModification,
                lines: totalLines,
                plugin: 'brackets-wakatime/' + EXT_VER,
            }),
            headers: {
                'Authorization': 'Basic ' + encodeBase64(appPreferences.fetch("credentialKey")),
            },
        })
        .always(() => {
            operationalStatus.previousTimestamp = moment;
            operationalStatus.currentDocumentPath = fileIdentifier;
        });
    }

    function requestCredential() {
        const inputKey = window.prompt("[Telemetry Agent] Please provide your API key for data transmission:", appPreferences.fetch("credentialKey"));
        if (inputKey !== null) {
            appPreferences.store("credentialKey", inputKey);
        }
    }

    commenceOperation();

});