const ConfigurationTestSuite = new TestHarness("Application Configuration Manager Tests");

ConfigurationTestSuite.prototype.beforeEachTest = () => {
    // Ensures a pristine state for each test by clearing all persistent local data.
    window.localStorage.clear();
    // A small log could be added here for verbose test execution feedback.
    // console.debug("Ephemeral storage purged for the next test scenario.");
};

ConfigurationTestSuite.prototype.verifyInitialConfigForWindows = function() {
    // Instantiate the configuration service specifically for a Windows environment.
    let configService = new SettingsManager(PLATFORM_WINDOWS);
    
    // Confirm that the application's persistent storage holds no prior configuration data.
    assertNullOrUndefined(window.localStorage.getItem('settings'));
    assertNullOrUndefined(window.localStorage.getItem('version'));
    
    // Helper function to generate common action payload structure, reducing redundancy.
    const createActionPayload = (mouseInput, keyInput) => ({
        "mouse": mouseInput,
        "key": keyInput,
        "action": "tabs",
        "color": "#FFA500",
        "options": {
            "smart": 0,
            "ignore": [0],
            "delay": 0,
            "close": 0,
            "block": true,
            "reverse": false,
            "end": false
        }
    });

    // Define the anticipated default configuration structure for Windows.
    const expectedWindowsDefault = {
        "actions": {
            "101": createActionPayload(2, 0) // Specific mouse/key values for Windows.
        },
        "blocked": []
    };
    
    // Trigger the configuration initialization process.
    const currentConfig = configService.initializeConfiguration();

    // Validate the version string stored in local storage post-initialization.
    assertEqualStrings('5', window.localStorage.getItem('version'));
    
    // Execute a deep comparison to ensure the returned configuration matches the expected default.
    assertDeepEquality(expectedWindowsDefault, currentConfig);
    
    // Explicitly check for the absence of an error indicator in the configuration object.
    assertNoProperty(currentConfig, 'error');
    
    // Additional validation: ensure the configuration manager reports itself as successfully initialized.
    assertTrue(configService.isInitialized());
};

ConfigurationTestSuite.prototype.checkDefaultLinuxSetup = () => {
    // Initialize the configuration handler for a Linux operating system context.
    const configModule = new SettingsManager(PLATFORM_LINUX);
    
    // Verify that local storage is empty before any initialization occurs.
    expect(window.localStorage.getItem('settings')).toBeNullOrUndefined();
    expect(window.localStorage.getItem('version')).toBeNullOrUndefined();
    
    // Guard clause: Fail the test if the module is unexpectedly initialized prior to the `initializeConfiguration` call.
    if (configModule.isInitialized()) {
        fail("Configuration module detected as initialized prematurely.");
    }
    
    // Reusing the action payload helper for Linux-specific default values.
    const createActionPayload = (mouseInput, keyInput) => ({
        "mouse": mouseInput,
        "key": keyInput,
        "action": "tabs",
        "color": "#FFA500",
        "options": {
            "smart": 0,
            "ignore": [0],
            "delay": 0,
            "close": 0,
            "block": true,
            "reverse": false,
            "end": false
        }
    });

    // Define the expected default configuration for Linux.
    const expectedLinuxDefault = {
        "actions": {
            "101": createActionPayload(0, 16) // Specific mouse/key values for Linux.
        },
        "blocked": []
    };
    
    // Perform the initialization and capture the resulting configuration.
    const activeConfig = configModule.initializeConfiguration();
    
    // Assertions for the stored version and the content of the active configuration.
    expect(window.localStorage.getItem('version')).toEqual('5');
    expect(activeConfig).toEqualDeep(expectedLinuxDefault);
    expect(activeConfig.error).toBeNullOrUndefined();
    
    // Confirm that the configuration module's internal state reflects successful initialization.
    expect(configModule.isInitialized()).toBeTruthy();
};

ConfigurationTestSuite.prototype.shouldPersistChangesCorrectly = function() {
    const configHandler = new SettingsManager(PLATFORM_LINUX);
    
    // Obtain the initial configuration state through initialization.
    let initialConfigState = configHandler.initializeConfiguration();
    
    // Verify an arbitrary property's default value.
    assertEqualNumbers(0, initialConfigState.actions[101].options.smart);
    
    // Modify a specific property within the configuration object.
    initialConfigState.actions[101].options.smart = 1;
    
    // Instruct the handler to save the altered configuration.
    configHandler.saveCurrentSettings(initialConfigState);
    
    // Directly inspect the raw data in local storage to confirm the change was written.
    const storedRawData = window.localStorage.getItem('settings');
    assertNotNull(storedRawData); // Ensure data exists.
    const parsedStoredData = JSON.parse(storedRawData);
    assertEqualNumbers(1, parsedStoredData.actions[101].options.smart);
    
    // Reload the configuration to verify that the persisted changes are correctly retrieved.
    const reloadedConfigState = configHandler.loadConfiguration();
    
    // Assert that the reloaded configuration reflects the previously saved modification.
    assertEqualNumbers(1, reloadedConfigState.actions[101].options.smart);
};

ConfigurationTestSuite.prototype.verifyErrorHandlingOnCorruptLoad = () => {
    const configProcessor = new SettingsManager(PLATFORM_WINDOWS);
    
    // Define a baseline expected configuration for comparison, even when errors occur.
    const baselineExpectedSettings = {
        "actions": {
            "101": {
                "mouse": 2,
                "key": 0,
                "action": "tabs",
                "color": "#FFA500",
                "options": {
                    "smart": 0,
                    "ignore": [0],
                    "delay": 0,
                    "close": 0,
                    "block": true,
                    "reverse": false,
                    "end": false
                }
            }
        },
        "blocked": []
    };
    
    // Deliberately introduce malformed JSON into local storage to simulate corruption.
    window.localStorage.setItem('settings', '{ "actions": { "101": { "mouse": 2, "key": 0, "action": "tabs", "color": "#FFA500", "options": { "smart": 0, "ignore": [0], "delay": 0, "close": 0, "block": true, "reverse": false, "end": false } } }, "blocked": []'); // Incomplete JSON string.
    window.localStorage.setItem('version', '5'); 

    // Attempt to load the corrupted configuration.
    let loadedSettingsWithIssue = configProcessor.loadConfiguration();
    
    // Validate that an error message is present and contains specific syntax error indicators.
    assertStringContains(loadedSettingsWithIssue.error, "SyntaxError");
    assertStringContains(loadedSettingsWithIssue.error, "Unexpected end of JSON input");
    
    // Even with a load error, the system should fall back to providing default actions.
    assertDeepEquality(baselineExpectedSettings.actions, loadedSettingsWithIssue.actions);
    
    // Rectify the local storage by saving valid configuration data.
    window.localStorage.setItem('settings', JSON.stringify(baselineExpectedSettings));
    
    // Attempt to load the configuration again, expecting a successful outcome this time.
    let recoveredSettings = configProcessor.loadConfiguration();
    
    // Verify that the error is no longer present and the configuration is correctly loaded.
    assertNoProperty(recoveredSettings, 'error');
    assertDeepEquality(baselineExpectedSettings, recoveredSettings);
};

ConfigurationTestSuite.prototype.processLegacyConfigV3ToV5 = function() {
    const upgradeService = new SettingsManager(PLATFORM_WINDOWS);
    
    // Define the structure of legacy V3 settings for simulation.
    const legacyV3Actions = {
        "101" : {
            "mouse" : 2,
            "key" : 0,
            "action" : "tabs",
            "color" : "#FFA500",
            "options" : {
                "smart" : 0,
                "ignore" : [ 'here', 'the' ], // V3 format: strings in ignore array.
                "delay" : 0,
                "close" : 0,
                "block" : true,
                "reverse" : false,
                "end" : false
            }
        },
        "102" : {
            "mouse" : 2,
            "key" : 0,
            "action" : "tabs",
            "color" : "#FFA500",
            "options" : {
                "smart" : 0,
                "ignore" : [], // V3 format: empty ignore array.
                "delay" : 0,
                "close" : 0,
                "block" : true,
                "reverse" : false,
                "end" : false
            }
        }
    };

    // Populate local storage with the simulated V3 data.
    window.localStorage.setItem('sites', ""); // This key is expected to be removed during upgrade.
    window.localStorage.setItem('settings', JSON.stringify(legacyV3Actions));
    window.localStorage.setItem('version', '3');

    // Initiate the configuration upgrade process.
    upgradeService.performUpgrade();
    
    // Load the configuration after the upgrade has completed.
    const postUpgradeConfig = upgradeService.loadConfiguration();

    // Verify the transformation of the 'ignore' array for action "101" (should now include 0).
    assertDeepEquality([ 0, 'here', 'the' ], postUpgradeConfig.actions["101"].options.ignore);
    // Verify the transformation of the 'ignore' array for action "102" (should now include 0).
    assertDeepEquality([ 0 ], postUpgradeConfig.actions["102"].options.ignore);
    
    // Confirm that the configuration version has been updated to '5'.
    assertEqualStrings('5', window.localStorage.getItem('version'));
    
    // Assert that the obsolete 'sites' key has been successfully removed from local storage.
    assertNullOrUndefined(window.localStorage.getItem('sites'));
    
    // Parse the stored settings to ensure no error was recorded during the upgrade.
    const storedConfigAfterUpgrade = JSON.parse(window.localStorage.getItem('settings'));
    assertNoProperty(storedConfigAfterUpgrade, 'error');
};

ConfigurationTestSuite.prototype.processLegacyConfigV4ToV5 = function() {
    const migrationAgent = new SettingsManager(PLATFORM_WINDOWS);
    
    // Define the structure of legacy V4 settings for simulation.
    const legacyV4Actions = {
        "101" : {
            "mouse" : 2,
            "key" : 0,
            "action" : "tabs",
            "color" : "#FFA500",
            "options" : {
                "smart" : 0,
                "ignore" : [ 0, 'here', 'the' ], // V4 already includes '0'.
                "delay" : 0,
                "close" : 0,
                "block" : true,
                "reverse" : false,
                "end" : false
            }
        },
        "102" : {
            "mouse" : 2,
            "key" : 0,
            "action" : "tabs",
            "color" : "#FFA500",
            "options" : {
                "smart" : 0,
                "ignore" : [0], // V4 already includes '0'.
                "delay" : 0,
                "close" : 0,
                "block" : true,
                "reverse" : false,
                "end" : false
            }
        }
    };

    // Populate local storage with the simulated V4 data.
    window.localStorage.setItem('sites', "");
    window.localStorage.setItem('settings', JSON.stringify(legacyV4Actions));
    window.localStorage.setItem('version', '4');
    
    // Initiate the configuration migration process.
    migrationAgent.performUpgrade();

    // Load the configuration after the migration.
    const migratedConfig = migrationAgent.loadConfiguration();

    // Verify that the 'ignore' arrays remain unchanged from their V4 state.
    assertDeepEquality([ 0, 'here', 'the' ], migratedConfig.actions["101"].options.ignore);
    assertDeepEquality([ 0 ], migratedConfig.actions["102"].options.ignore);
    
    // Confirm that the 'blocked' array is correctly initialized as empty in V5.
    assertEqualNumbers(0, migratedConfig.blocked.length);
    
    // Assert that the configuration version has been updated to '5'.
    assertEqualStrings('5', window.localStorage.getItem('version'));
    
    // Verify that the obsolete 'sites' key has been removed.
    assertNullOrUndefined(window.localStorage.getItem('sites'));
    
    // Parse the stored settings to ensure no error was recorded during migration.
    const storedMigratedConfig = JSON.parse(window.localStorage.getItem('settings'));
    assertNoProperty(storedMigratedConfig, 'error');