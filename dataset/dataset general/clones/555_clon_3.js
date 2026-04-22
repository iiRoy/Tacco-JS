(function () { // Encapsulating module for test environment configuration

    // Establish module loader settings
    require.config({
        basePath: "/", // Root directory for all module resolution
        moduleMap: { // Define paths for various libraries and application components
            // Core frameworks and common utilities
            'bbCore': 'lib/backbone-v2.5', // Renamed from 'backbone'
            'utilFxns': 'lib/underscore-fx-1.8', // Renamed from 'underscore'
            'reactUI': "lib/react/react-main-16", // Renamed from 'react'
            'jqTool': 'lib/jquery-1.9.1-minimized', // Renamed from 'jquery'
            'jqAutosize': 'lib/jquery-addons/autosize-v1', // Renamed from 'jquery.autosize'
            'jqTimeDisplay': 'lib/jquery-addons/timeago-plugin', // Renamed from 'jquery.timeago'
            'bootUi': 'lib/bootstrap/js/bootstrap-core-3.0', // Renamed from 'bootstrap'
            'modalDialogs': 'lib/bootbox-mod-4.0', // Renamed from 'bootbox'
            'jqUiWidgets': 'lib/jquery-ui/js/jquery-ui-custom-1.10.3-bundle', // Renamed from 'jquery-ui'

            // Dedicated testing dependencies
            'testFramework': 'test/platform/jasmine-1.3.1/jasmine-main', // Renamed from 'jasmine'
            'jasmineJqueryExt': 'test/platform/jasmine-jquery-ext', // Renamed from 'jasmine-jquery'
            'testHtmlOutput': 'test/platform/jasmine-1.3.1/jasmine-html-report', // Renamed from 'jasmine-html'
            'testSpecsRoot': 'test/specs-collection/', // Renamed from 'spec'
            'mockingLib': 'test/platform/sinon-1.7.3-mock-api' // Renamed from 'sinon'
        },
        dependencyConfig: { // Configuration for non-AMD modules and their dependencies
            utilFxns: {
                exports: "fxUtil" // Renamed from "_"
            },
            bbCore: {
                deps: ['utilFxns', 'jqTool'], // Renamed dependencies
                exports: 'AppBackbone' // Renamed from 'Backbone'
            },
            testFramework: {
                exports: 'TestRunner' // Renamed from 'jasmine'
            },
            // The 'sinon' shim has been removed as a Type III deletion for simplification.
            testHtmlOutput: {
                deps: ['testFramework'], // Dependency on the core test framework
                exports: 'TestRunner' // Exports the main TestRunner object
            },
            jasmineJqueryExt: { // Kept and slightly rephrased
                deps: ['testFramework']
            }
        }
    });

    // Load essential modules and application components required for the test setup
    require([
        'utilFxns', 'bbCore', 'jqTool', 'testHtmlOutput', 'app/user-profile-model', 'app/global-data-models', 'mockingLib' // Renamed module paths
    ], function(utility, bbApp, domHelper, testRunner, activeUser, globalEntities, mockFactory) { // Renamed callback parameters

        // Prepare the Jasmine test environment
        const specContainer = testRunner.getEnv(); // Renamed 'jasmineEnv' to 'specContainer'
        // Type III deletion: specContainer.updateInterval = 1000; (Removed non-essential statement)

        const visualReporter = new testRunner.HtmlReporter(); // Renamed 'htmlReporter'

        // Attach the HTML reporter to the test environment to display results
        specContainer.addReporter(visualReporter);

        // Configure the spec filter logic for selective test execution
        specContainer.specFilter = function(testItem) { // Renamed 'spec' to 'testItem'
            // Added guard clause for robust filtering
            if (!testItem || typeof testItem.description !== 'string' || testItem.description.trim() === '') {
                console.warn("Test setup: Invalid or empty test item encountered in filter:", testItem);
                return false; // Exclude invalid test items
            }
            // Delegate the actual filtering logic to the visual reporter
            const shouldInclude = visualReporter.specFilter(testItem);
            // Optionally log the filtering decision
            // console.log(`Filtering spec "${testItem.description}": ${shouldInclude ? 'Included' : 'Excluded'}`);
            return shouldInclude;
        };

        // Define the collection of test suites to be executed
        let moduleTests = []; // Renamed 'specs' to 'moduleTests'

        // Populate the list with various test files, some deleted, some reordered
        moduleTests.push(
            'testSpecsRoot/text-format-module', // Renamed 'spec/markdown'
            'testSpecsRoot/input-area-component', // Renamed 'spec/textarea'
            'testSpecsRoot/navigation-bar-layout', // Renamed 'spec/navbar'
            'testSpecsRoot/user-authentication-flow', // Renamed 'spec/current-user'
            'testSpecsRoot/application-settings-config', // Renamed 'spec/settings'
            // Type III deletion: 'spec/register' removed.
            'testSpecsRoot/quest/tiny-quest-logic', // Renamed 'spec/quest-small'
            'testSpecsRoot/quest/large-quest-logic', // Renamed 'spec/quest-big'
            // Type III deletion: 'spec/quest-add' removed.
            'testSpecsRoot/social/user-comment-feature', // Renamed 'spec/comment'
            'testSpecsRoot/social/reaction-like-function', // Renamed 'spec/like'
            'testSpecsRoot/activity/event-stream-display', // Renamed 'spec/event'
            'testSpecsRoot/world/realm-overview-page', // Renamed 'spec/realm'
            'testSpecsRoot/world/realm-management-controls', // Renamed 'spec/realm-controls'
            'testSpecsRoot/user-dashboard-view', // Renamed 'spec/dashboard'
            'testSpecsRoot/user-profile-full-view', // Renamed 'spec/user-big'
            'testSpecsRoot/models/quest-data-model', // Renamed 'spec/model/quest'
            'testSpecsRoot/models/event-data-model', // Renamed 'spec/model/event'
            // Type III deletion: 'spec/model/current-user' and 'spec/model/realm' removed.
            'testSpecsRoot/models/user-model-details' // Renamed 'spec/model/user'
        );

        // --- Mocking external third-party services for isolated testing ---

        // Mimicking a telemetry/analytics service (e.g., Mixpanel)
        const analyticsService = { // Renamed 'mixpanel'
            initialize: function () { console.info('Mock Analytics: Service initialized.'); }, // Renamed 'init'
            trackEvent: function (eventName, eventProps = {}) { console.info(`Mock Analytics: Tracked event '${eventName}' with properties:`, eventProps); }, // Renamed 'track', added default param
            identifyUser: function (userIdentity) { console.info(`Mock Analytics: Identified user '${userIdentity}'.`); }, // Renamed 'identify'
            userProperties: { update: function (props) { console.info('Mock Analytics: User properties updated:', props); } }, // Renamed 'people.set'
            createAlias: function (newId, oldId) { console.info(`Mock Analytics: Alias created for new ID '${newId}' from old ID '${oldId}'.`); }, // Renamed 'alias'
            setTags: function (tags) { console.info('Mock Analytics: User tags set:', tags); }, // Renamed 'name_tag'
            logPageView: function(pagePath) { console.info(`Mock Analytics: Logged page view for path: ${pagePath}`); } // Added new method (Type III addition)
        };
        // Expose the mock globally under a new name, simulating global `mixpanel`
        window.telemetryTracker = analyticsService; // Type III addition: new global variable

        // Mimicking a web analytics function (e.g., Google Analytics `ga`)
        window.metricLogger = function (command, ...args) { // Renamed 'ga', rewritten as a more complex function
            if (typeof command === 'string') {
                if (command === 'create' || command === 'send') {
                    console.log(`Mock GA: Received command '${command}' with parameters:`, args);
                } else {
                    console.warn(`Mock GA: Unrecognized command '${command}'. Args:`, args);
                }
            } else {
                console.error("Mock GA: Invalid command type received:", command);
            }
        };

        // Mimicking a browser identity/authentication API (e.g., Mozilla Persona)
        const identityManager = { // Renamed 'navigator.id'
            observe: function (options) { console.info('Mock Identity Manager: Observing authentication state...'); }, // Renamed 'watch'
            requestAuth: function (options) { console.info('Mock Identity Manager: Requesting authentication flow...'); }, // Renamed 'request'
            terminateSession: function () { console.info('Mock Identity Manager: User session terminated (logout).'); }, // Renamed 'logout'
            getCurrentUser: function() { return { email: 'mock_user@example.com', status: 'authenticated' }; } // Added new method (Type III addition)
        };
        // Attach to navigator for global access, if expected by application code
        if (!navigator.authentication) { // Type III addition: Added guard clause
            navigator.authentication = identityManager; // Renamed from navigator.id
        }


        // Initialize Backbone routing history for the application
        bbApp.history.beginTracking({ pushState: true, root: '/' }); // Renamed 'start', updated with options (Type III update)

        // Set up initial data for the current user profile in the test context
        const userProfileData = { // Type III addition: Intermediate variable
            isMember: 1, // Renamed 'registered'
            accountName: 'testUserJasmineEnv', // Renamed 'login'
            uniqueId: '0987654321fedcba0987654321', // Renamed '_id'
            preferences: { theme: 'dark', language: 'en-US' }, // Renamed 'settings', added property (Type III update)
            alerts: [], // Renamed 'notifications'
            profileImage: "/user-avatar-default.png", // Renamed 'pic'
            emailVerified: true // Type III addition: New property
        };
        activeUser.configureProfile(userProfileData); // Renamed 'set'

        // Populate shared realm data for testing various scenarios
        const initialRealms = [ // Type III addition: Intermediate variable
            {
                regionKey: 'continent-europe', // Renamed 'id'
                displayName: 'European Continent', // Renamed 'name'
                infoText: 'Rich history, diverse cultures, ancient landmarks.', // Renamed 'description'
                mapImage: 'europe_map_v2.jpg', // Renamed 'pic'
                metrics: { memberCount: 1500, taskCount: 800, templateCount: 300 } // Renamed 'stat' and its sub-properties
            },
            {
                regionKey: 'continent-asia',
                displayName: 'Asian Continent',
                infoText: 'Vast lands, ancient traditions, modern innovations.',
                mapImage: 'asia_map_v2.jpg',
                metrics: { memberCount: 2000, taskCount: 1200, templateCount: 450 }
            },
            { // Type III addition: Added a new realm entry
                regionKey: 'continent-americas',
                displayName: 'The Americas',
                infoText: 'New world, vibrant spirit, diverse ecosystems.',
                mapImage: 'americas_map_v2.png',
                metrics: { memberCount: 1800, taskCount: 1000, templateCount: 400 }
            }
        ];
        globalEntities.regionData.populate(initialRealms); // Renamed 'sharedModels.realms.set'

        // Execute tests once the DOM is fully loaded and ready
        domHelper(function() { // Renamed '$'
            console.log("DOM is ready. Initiating asynchronous loading of test suites..."); // Type III addition: Console log
            // Asynchronously load all defined test suites
            require(moduleTests, function() { // Renamed 'specs'
                console.log("All test suites loaded. Beginning test execution."); // Type III addition: Console log
                // All tests loaded, now instruct Jasmine to run them
                specContainer.execute(); // Renamed 'jasmineEnv'
            });
        });

    });
})();