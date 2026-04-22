function verifyAbsence(item, info) {
    if (item !== undefined) {
        throw new Error(`Absence check failed: ${info} - Expected undefined, got ${item}`);
    }
}

function verifyEquality(expected, actual, info) {
    if (expected !== actual) {
        throw new Error(`Equality check failed: ${info}\nExpected: ${expected}\nActual: ${actual}`);
    }
}

function verifyTruth(condition, info) {
    if (!condition) {
        throw new Error(`Truth check failed: ${info} - Expected true, got false`);
    }
}

function verifyDeepEquality(expected, actual, info) {
    const areContentsEquivalent = (obj1, obj2) => {
        if (obj1 === obj2) return true;
        if (typeof obj1 !== 'object' || obj1 === null ||
            typeof obj2 !== 'object' || obj2 === null) {
            return false;
        }
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (let key of keys1) {
            if (!keys2.includes(key) || !areContentsEquivalent(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    };

    if (!areContentsEquivalent(expected, actual)) {
        throw new Error(`Deep equality check failed: ${info}\nExpected: ${JSON.stringify(expected, null, 2)}\nActual: ${JSON.stringify(actual, null, 2)}`);
    }
}

function ConfigurationTestHarness() {
    const currentApplicationVersion = '5';
    const primaryActionCode = "101";

    const commonActionConfiguration = {
        action: "tabs",
        color: "#FFA500",
        options: {
            smart: 0,
            ignore: [0],
            delay: 0,
            close: 0,
            block: true,
            reverse: false,
            end: false
        }
    };

    const defaultWindowsConfiguration = {
        actions: {
            [primaryActionCode]: {
                mouse: 2,
                key: 0,
                ...commonActionConfiguration
            }
        },
        blocked: []
    };

    const defaultLinuxConfiguration = {
        actions: {
            [primaryActionCode]: {
                mouse: 0,
                key: 16,
                ...commonActionConfiguration
            }
        },
        blocked: []
    };

    function resetStorageState() {
        window.localStorage.clear();
    }

    function evaluateWindowsSetup() {
        resetStorageState();
        const configHandler = new SettingsManager(OS_WIN);

        verifyAbsence(window.localStorage.getItem('settings'), "Windows: Configuration data should not exist initially");
        verifyAbsence(window.localStorage.getItem('version'), "Windows: Version string should not exist initially");

        const retrievedConfig = configHandler.init();

        verifyEquality(currentApplicationVersion, window.localStorage.getItem('version'), "Windows: Incorrect version after initialization");
        verifyDeepEquality(defaultWindowsConfiguration, retrievedConfig, "Windows: Initial configuration for Windows mismatch");
        verifyAbsence(retrievedConfig.error, "Windows: No error expected during initial setup");
    }

    function evaluateLinuxSetup() {
        resetStorageState();
        const configHandler = new SettingsManager(OS_LINUX);

        verifyAbsence(window.localStorage.getItem('settings'), "Linux: Configuration data should not exist initially");
        verifyAbsence(window.localStorage.getItem('version'), "Linux: Version string should not exist initially");
        verifyTruth(!configHandler.isInit(), "Linux: Handler should report uninitialized before init()");

        const retrievedConfig = configHandler.init();

        verifyEquality(currentApplicationVersion, window.localStorage.getItem('version'), "Linux: Incorrect version after initialization");
        verifyDeepEquality(defaultLinuxConfiguration, retrievedConfig, "Linux: Initial configuration for Linux mismatch");
        verifyAbsence(retrievedConfig.error, "Linux: No error expected during initial setup");
        verifyTruth(configHandler.isInit(), "Linux: Handler should report initialized after init()");
    }

    function evaluateConfigurationSaving() {
        resetStorageState();
        const configHandler = new SettingsManager(OS_LINUX);

        let currentConfig = configHandler.init();
        verifyEquality(0, currentConfig.actions[primaryActionCode].options.smart, "Save: Initial 'smart' setting value is incorrect");

        currentConfig.actions[primaryActionCode].options.smart = 1;
        configHandler.save(currentConfig);

        const reloadedConfig = configHandler.load();
        verifyEquality(1, reloadedConfig.actions[primaryActionCode].options.smart, "Save: 'smart' setting not persisted correctly after save/load");
    }

    function evaluateErrorHandling() {
        resetStorageState();
        const configHandler = new SettingsManager(OS_WIN);

        const configWithInitialError = configHandler.load();
        verifyEquality("Error: SyntaxError: Unexpected token u|Data:undefined", configWithInitialError.error, "Error: Expected specific error message on first load attempt");
        verifyDeepEquality(defaultWindowsConfiguration.actions, configWithInitialError.actions, "Error: Actions should still default even with load error");

        const configAfterRecovery = configHandler.load();
        verifyAbsence(configAfterRecovery.error, "Error: No error expected after subsequent recovery load");
        verifyDeepEquality(defaultWindowsConfiguration, configAfterRecovery, "Error: Recovered configuration mismatch with default");
    }

    function generateLegacyConfigV3() {
        return {
            "101": {
                mouse: 2,
                key: 0,
                action: "tabs",
                color: "#FFA500",
                options: {
                    smart: 0,
                    ignore: ['here', 'the'],
                    delay: 0,
                    close: 0,
                    block: true,
                    reverse: false,
                    end: false
                }
            },
            "102": {
                mouse: 2,
                key: 0,
                action: "tabs",
                color: "#FFA500",
                options: {
                    smart: 0,
                    ignore: [],
                    delay: 0,
                    close: 0,
                    block: true,
                    reverse: false,
                    end: false
                }
            }
        };
    }

    function evaluateUpgradeV3ToV5() {
        resetStorageState();
        const configHandler = new SettingsManager(OS_WIN);

        window.localStorage.setItem('sites', "");
        window.localStorage.setItem('settings', JSON.stringify(generateLegacyConfigV3()));
        window.localStorage.setItem('version', '3');

        configHandler.update();

        const upgradedConfig = configHandler.load();

        verifyEquality(JSON.stringify([0, 'here', 'the']), JSON.stringify(upgradedConfig.actions[primaryActionCode].options.ignore), "V3 Upgrade: Ignore list for 101 action mismatch");
        verifyEquality(JSON.stringify([0]), JSON.stringify(upgradedConfig.actions["102"].options.ignore), "V3 Upgrade: Ignore list for 102 action mismatch");
        verifyEquality(currentApplicationVersion, window.localStorage.getItem('version'), "V3 Upgrade: Version not updated to " + currentApplicationVersion);
        verifyAbsence(window.localStorage.getItem('sites'), "V3 Upgrade: 'sites' legacy key should be removed");
        verifyAbsence(JSON.parse(window.localStorage.getItem('settings')).error, "V3 Upgrade: Upgraded settings should not contain an error");
    }

    function generateLegacyConfigV4() {
        return {
            "101": {
                mouse: 2,
                key: 0,
                action: "tabs",
                color: "#FFA500",
                options: {
                    smart: 0,
                    ignore: [0, 'here', 'the'],
                    delay: 0,
                    close: 0,
                    block: true,
                    reverse: false,
                    end: false
                }
            },
            "102": {
                mouse: 2,
                key: 0,
                action: "tabs",
                color: "#FFA500",
                options: {
                    smart: 0,
                    ignore: [0],
                    delay: 0,
                    close: 0,
                    block: true,
                    reverse: false,
                    end: false
                }
            }
        };
    }

    function evaluateUpgradeV4ToV5() {
        resetStorageState();
        const configHandler = new SettingsManager(OS_WIN);

        window.localStorage.setItem('sites', "");
        window.localStorage.setItem('settings', JSON.stringify(generateLegacyConfigV4()));
        window.localStorage.setItem('version', '4');

        configHandler.update();

        const upgradedConfig = configHandler.load();

        verifyEquality(JSON.stringify([0, 'here', 'the']), JSON.stringify(upgradedConfig.actions[primaryActionCode].options.ignore), "V4 Upgrade: Ignore list for 101 action mismatch");
        verifyEquality(JSON.stringify([0]), JSON.stringify(upgradedConfig.actions["102"].options.ignore), "V4 Upgrade: Ignore list for 102 action mismatch");
        verifyEquality(0, upgradedConfig.blocked.length, "V4 Upgrade: 'blocked' list should be empty after upgrade");
        verifyEquality(currentApplicationVersion, window.localStorage.getItem('version'), "V4 Upgrade: Version not updated to " + currentApplicationVersion);
        verifyAbsence(window.localStorage.getItem('sites'), "V4 Upgrade: 'sites' legacy key should be removed");
        verifyAbsence(JSON.parse(window.localStorage.getItem('settings')).error, "V4 Upgrade: Upgraded settings should not contain an error");
    }

    return {
        initiateAllChecks: function() {
            try {
                console.log("Initiating configuration validation checks...");
                evaluateWindowsSetup();
                console.log("Windows Init Check Passed.");
                evaluateLinuxSetup();
                console.log("Linux Init Check Passed.");
                evaluateConfigurationSaving();
                console.log("Configuration Persistence Check Passed.");
                evaluateErrorHandling();
                console.log("Error Handling Check Passed.");
                evaluateUpgradeV3ToV5();
                console.log("Upgrade V3->V5 Check Passed.");
                evaluateUpgradeV4ToV5();
                console.log("Upgrade V4->V5 Check Passed.");
                console.log("All configuration validation checks completed successfully.");
            } catch (e) {
                console.error("A configuration validation check failed:", e.message);
                throw e;
            }
        }
    };
}