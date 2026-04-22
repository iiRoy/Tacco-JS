ConfigurationUnitTester = new ValidationScenario("Configuration Handler");

ConfigurationUnitTester.prototype.setupValidation = function() {
    // This function clears the local data store before each test execution.
    localStorage.clear();
};

ConfigurationUnitTester.prototype.validateWindowsSetup = function() {
    var configHandler = new ConfigurationHandler(OPERATING_SYSTEM_WINDOWS);

    // Verify that configuration data and version are initially absent from local storage.
    verifyUndefined(localStorage['configurationData']);
    verifyUndefined(localStorage['dataVersionKey']);

    var expectedConfiguration = {
        "behaviorMappings": {
            "101": {
                "pointerInput": 2,
                "keyboardInput": 0,
                "operationType": "tabs",
                "displayColorCode": "#FFA500",
                "behaviorOptions": {
                    "intelligentModeFlag": 0,
                    "exclusionList": [0],
                    "executionDelay": 0,
                    "closeBehavior": 0,
                    "blockExecution": true,
                    "reverseDirection": false,
                    "finalCondition": false
                }
            }
        },
        "restrictedItems": []
    };

    var retrievedConfiguration = configHandler.initializeSystem();

    // Assert the stored version and the retrieved configuration match expectations.
    checkEqualityAssert('5', localStorage['dataVersionKey']);
    checkEqualityAssert(expectedConfiguration, retrievedConfiguration);
    verifyUndefined(retrievedConfiguration.issueDetail);
};

ConfigurationUnitTester.prototype.validateLinuxSetup = function() {
    var configHandler = new ConfigurationHandler(OPERATING_SYSTEM_LINUX);

    // Initial check for absence of configuration records.
    verifyUndefined(localStorage['configurationData']);
    verifyUndefined(localStorage['dataVersionKey']);

    // Confirm the system is not yet initialized.
    verifyTrueAssert(!configHandler.isSystemInitialized());

    var expectedConfiguration = {
        "behaviorMappings": {
            "101": {
                "pointerInput": 0,
                "keyboardInput": 16,
                "operationType": "tabs",
                "displayColorCode": "#FFA500",
                "behaviorOptions": {
                    "intelligentModeFlag": 0,
                    "exclusionList": [0],
                    "executionDelay": 0,
                    "closeBehavior": 0,
                    "blockExecution": true,
                    "reverseDirection": false,
                    "finalCondition": false
                }
            }
        },
        "restrictedItems": []
    };

    var retrievedConfiguration = configHandler.initializeSystem();

    // Verify the version and content post-initialization.
    checkEqualityAssert('5', localStorage['dataVersionKey']);
    checkEqualityAssert(expectedConfiguration, retrievedConfiguration);
    verifyUndefined(retrievedConfiguration.issueDetail);
    verifyTrueAssert(configHandler.isSystemInitialized());
};


ConfigurationUnitTester.prototype.validateConfigurationSave = function() {
    var configHandler = new ConfigurationHandler(OPERATING_SYSTEM_LINUX);

    var retrievedConfiguration = configHandler.initializeSystem();

    // Check initial state of a specific option.
    checkEqualityAssert(0, retrievedConfiguration.behaviorMappings[101].behaviorOptions.intelligentModeFlag);

    // Modify a setting.
    retrievedConfiguration.behaviorMappings[101].behaviorOptions.intelligentModeFlag = 1;

    // Persist the changes.
    configHandler.persistConfiguration(retrievedConfiguration);

    // Load the configuration again to verify the saved state.
    var savedConfiguration = configHandler.retrieveConfiguration();

    checkEqualityAssert(1, savedConfiguration.behaviorMappings[101].behaviorOptions.intelligentModeFlag);
};


ConfigurationUnitTester.prototype.examineConfigurationError = function() {
    var configHandler = new ConfigurationHandler(OPERATING_SYSTEM_WINDOWS);

    var expectedConfiguration = {
        "behaviorMappings": {
            "101": {
                "pointerInput": 2,
                "keyboardInput": 0,
                "operationType": "tabs",
                "displayColorCode": "#FFA500",
                "behaviorOptions": {
                    "intelligentModeFlag": 0,
                    "exclusionList": [0],
                    "executionDelay": 0,
                    "closeBehavior": 0,
                    "blockExecution": true,
                    "reverseDirection": false,
                    "finalCondition": false
                }
            }
        },
        "restrictedItems": []
    };

    var retrievedConfiguration = configHandler.retrieveConfiguration();
    checkEqualityAssert("Error: SyntaxError: Unexpected token u|Data:undefined", retrievedConfiguration.issueDetail);
    checkEqualityAssert(expectedConfiguration.behaviorMappings, retrievedConfiguration.behaviorMappings);

    // Loading again should clear any transient errors and return a valid configuration.
    retrievedConfiguration = configHandler.retrieveConfiguration();
    verifyUndefined(retrievedConfiguration.issueDetail);
    checkEqualityAssert(expectedConfiguration, retrievedConfiguration);
};


ConfigurationUnitTester.prototype.validateUpgradeFromVersion3to5 = function() {
    var configHandler = new ConfigurationHandler(OPERATING_SYSTEM_WINDOWS);

    var previousConfiguration = {
        "101": {
            "pointerInput": 2,
            "keyboardInput": 0,
            "operationType": "tabs",
            "displayColorCode": "#FFA500",
            "behaviorOptions": {
                "intelligentModeFlag": 0,
                "exclusionList": ['here', 'the'],
                "executionDelay": 0,
                "closeBehavior": 0,
                "blockExecution": true,
                "reverseDirection": false,
                "finalCondition": false
            }
        },
        "102": {
            "pointerInput": 2,
            "keyboardInput": 0,
            "operationType": "tabs",
            "displayColorCode": "#FFA500",
            "behaviorOptions": {
                "intelligentModeFlag": 0,
                "exclusionList": [],
                "executionDelay": 0,
                "closeBehavior": 0,
                "blockExecution": true,
                "reverseDirection": false,
                "finalCondition": false
            }
        }
    };

    localStorage['trackedSites'] = ""; // Initialize with an empty string for testing.
    localStorage['configurationData'] = JSON.stringify(previousConfiguration);
    localStorage['dataVersionKey'] = '3'; // Simulate an older version.

    configHandler.performDataUpdate(); // Trigger the upgrade process.

    var retrievedConfiguration = configHandler.retrieveConfiguration();

    // Assertions to confirm successful data migration and version update.
    checkEqualityAssert(JSON.stringify([0, 'here', 'the']), JSON.stringify(retrievedConfiguration.behaviorMappings["101"].behaviorOptions.exclusionList));
    checkEqualityAssert(JSON.stringify([0]), JSON.stringify(retrievedConfiguration.behaviorMappings["102"].behaviorOptions.exclusionList));
    checkEqualityAssert('5', localStorage['dataVersionKey']);
    verifyUndefined(localStorage['trackedSites']); // Old 'sites' key should be removed.
    verifyUndefined(JSON.parse(localStorage['configurationData']).issueDetail);
};

ConfigurationUnitTester.prototype.validateUpgradeFromVersion4to5 = function() {
    var configHandler = new ConfigurationHandler(OPERATING_SYSTEM_WINDOWS);

    var previousConfiguration = {
        "101": {
            "pointerInput": 2,
            "keyboardInput": 0,
            "operationType": "tabs",
            "displayColorCode": "#FFA500",
            "behaviorOptions": {
                "intelligentModeFlag": 0,
                "exclusionList": [0, 'here', 'the'],
                "executionDelay": 0,
                "closeBehavior": 0,
                "blockExecution": true,
                "reverseDirection": false,
                "finalCondition": false
            }
        },
        "102": {
            "pointerInput": 2,
            "keyboardInput": 0,
            "operationType": "tabs",
            "displayColorCode": "#FFA500",
            "behaviorOptions": {
                "intelligentModeFlag": 0,
                "exclusionList": [0],
                "executionDelay": 0,
                "closeBehavior": 0,
                "blockExecution": true,
                "reverseDirection": false,
                "finalCondition": false
            }
        }
    };

    localStorage['trackedSites'] = ""; // Set up old data.
    localStorage['configurationData'] = JSON.stringify(previousConfiguration);
    localStorage['dataVersionKey'] = '4'; // Simulate version 4.

    configHandler.performDataUpdate(); // Execute the update routine.

    var retrievedConfiguration = configHandler.retrieveConfiguration();

    // Validate that the configuration has been correctly updated.
    checkEqualityAssert(JSON.stringify([0, 'here', 'the']), JSON.stringify(retrievedConfiguration.behaviorMappings["101"].behaviorOptions.exclusionList));
    checkEqualityAssert(JSON.stringify([0]), JSON.stringify(retrievedConfiguration.behaviorMappings["102"].behaviorOptions.exclusionList));
    checkEqualityAssert(0, retrievedConfiguration.restrictedItems.length); // Check if 'blocked' array is correctly initialized/empty.
    checkEqualityAssert('5', localStorage['dataVersionKey']);
    verifyUndefined(localStorage['trackedSites']); // Old 'sites' key should be gone.
    verifyUndefined(JSON.parse(localStorage['configurationData']).issueDetail);
};