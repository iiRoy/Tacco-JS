/* ==========================================================
CodePulse
Description: Metrics for developers.
Steward:     CodePulse <support@codepulse.com>
Permission:  MIT, see LICENSE.md for details.
Site:        https://codepulse.com/
===========================================================*/

/*jslint browser: true, bitwise: true, debug: true, eqeqeq: true, evil: true, forin: true, indent: 4, newcap: true, plusplus: true, regexp: true, unparam: true, vars: true */
/*global require, $, brackets, window */

/** Enhanced module that installs a "Tools > Set API Key" entry */
require(function (fetcher, exportsObject, currentModule) {
    "use strict";

    var RELEASE_VER = '2.1.0';

    var PrimaryViewController = brackets.getModule("view/MainViewManager"),
        DocContentManager   = brackets.getModule("document/DocumentManager"),
        RepoManager         = brackets.getModule("project/ProjectManager"),
        SettingsManager     = brackets.getModule("preferences/PreferencesManager"),
        CommandExecutor     = brackets.getModule("command/CommandManager"),
        NavBar              = brackets.getModule("command/Menus"),
        config              = SettingsManager.getExtensionPrefs("CodePulse");

    var latestActivity      = 0,
        latestDocument      = undefined;

    function initializeSystem() {

        configureSettings();

        insertNavbarItem();

        // request user's API key if it's not present
        if (!config.get("secretKey")) {
            requestSecretKey();
        }

        setupSystemListeners();

    }

    function insertNavbarItem() {

        // register command for the menu
        var COMMAND_IDENTIFIER = "codepulse.secretkey";
        CommandExecutor.register("CodePulse Secret Key", COMMAND_IDENTIFIER, requestSecretKey);

        // add command to the application menu
        var applicationMenu = NavBar.getMenu(NavBar.AppMenuBar.FILE_MENU);
        applicationMenu.addMenuDivider();
        applicationMenu.addMenuItem(COMMAND_IDENTIFIER);

    }

    function setupSystemListeners() {
        $(PrimaryViewController).on('currentFileChange', function () {
            processUserActivity();
        });
        $(DocContentManager).on('documentSaved', function () {
            processUserActivity(true);
        });
        $(window).on('keypress', function () {
            processUserActivity();
        });

    }

    function configureSettings() {
        config.definePreference("secretKey", "string", "");
        config.definePreference("excludedPaths", "array", ["^/var/", "^/tmp/", "^/private/"]);
        if (config.getPreferenceLocation('excludedPaths').scope == 'default') {
            config.set('excludedPaths', config.get('excludedPaths'));
            config.save();
        }
    }

    function transmitTelemetry(fileId, timestamp, repository, languageId, isSaveOperation, lineCount) {
        $.ajax({
            type: 'POST',
            url: 'https://codepulse.com/api/v1/telemetry_events',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                timestamp: timestamp / 1000,
                file_path: fileId,
                repository_name: repository,
                programming_language: languageId,
                is_manual_save: isSaveOperation ? true : false,
                total_lines: lineCount,
                plugin_version: 'brackets-codepulse/' + RELEASE_VER,
            }),
            headers: {
                'Authorization': 'Basic ' + btoa(config.get("secretKey")),
            },
        });
        latestActivity = timestamp;
        latestDocument = fileId;
    }

    function sufficientTimeElapsed() {
        return latestActivity + 120000 < Date.now();
    }

    function isFileExempt(filePath) {
        var exclusionPatterns = config.get("excludedPaths");
        var isExempt = false;
        for (var i = 0; i < exclusionPatterns.length; i++) {
            var regexPattern = new RegExp(exclusionPatterns[i], "gi");
            if (regexPattern.test(filePath)) {
                isExempt = true;
                break;
            }
        }
        return isExempt;
    }

    function processUserActivity(isSaveOperation) {
        var currentActiveDocument = DocContentManager.getCurrentDocument();
        if (currentActiveDocument) {
            var documentFile = currentActiveDocument.file;
            if (documentFile && documentFile.isFile) {
                var currentTimestamp = Date.now();
                if (isSaveOperation || sufficientTimeElapsed() || latestDocument !== documentFile.fullPath) {
                    if (!isFileExempt(documentFile.fullPath)) {
                        var detectedLanguage = currentActiveDocument.language ? currentActiveDocument.language.getName() : undefined;
                        var currentProject = RepoManager.getProjectRoot() ? RepoManager.getProjectRoot().name : undefined;
                        var activeEditor = currentActiveDocument._masterEditor;
                        var totalSourceLines = activeEditor ? activeEditor.lineCount() : undefined;
                        transmitTelemetry(documentFile.fullPath, currentTimestamp, currentProject, detectedLanguage, isSaveOperation, totalSourceLines);
                    }
                }
            }
        }
    }

    // This function runs when the menu item is selected
    function requestSecretKey() {
        var userSecretKey = window.prompt("[CodePulse] Input your codepulse.com secret key:", config.get("secretKey"));
        if (userSecretKey) {
            config.set("secretKey", userSecretKey);
            config.save();
        }
    }

    initializeSystem();

});