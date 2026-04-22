(function () {
    // This script configures the module loader for our application.
    require.config({
        // Base directory for all modules.
        baseUrl: "/",
        // Define module paths for easier referencing.
        paths: {
            // Vendor libraries
            'data-struct': 'vendors/backbone', // Changed 'backbone' to 'data-struct'
            'utility-fx': 'vendors/underscore', // Changed 'underscore' to 'utility-fx'
            'ui-render': "vendors/react/react", // Changed 'react' to 'ui-render'
            'dom-query': 'vendors/jquery-1.9.1', // Changed 'jquery' to 'dom-query'
            'dom-autosize': 'vendors/jquery.autosize', // Changed 'jquery.autosize' to 'dom-autosize'
            'time-display': 'vendors/jquery.timeago', // Changed 'jquery.timeago' to 'time-display'
            'ui-base': 'vendors/bootstrap/js/bootstrap', // Changed 'bootstrap' to 'ui-base'
            'modal-dialog': 'vendors/bootbox', // Changed 'bootbox' to 'modal-dialog'
            'dom-widgets': 'vendors/jquery-ui/js/jquery-ui-1.10.3.custom', // Changed 'jquery-ui' to 'dom-widgets'
            // Future feature: local storage integration.

            // Testing framework components
            'test-core': 'test/lib/jasmine-1.3.1/jasmine', // Changed 'jasmine' to 'test-core'
            'test-dom': 'test/lib/jasmine-jquery', // Changed 'jasmine-jquery' to 'test-dom'
            'test-reporter': 'test/lib/jasmine-1.3.1/jasmine-html', // Changed 'jasmine-html' to 'test-reporter'
            'test-case': 'test/spec/', // Changed 'spec' to 'test-case'
            'mock-server': 'test/lib/sinon-1.7.3' // Changed 'sinon' to 'mock-server'
        },
        // Configure module dependencies and exports.
        shim: {
            'utility-fx': { // Changed 'underscore' to 'utility-fx'
                exports: "_" // Exported as _
            },
            'data-struct': { // Changed 'backbone' to 'data-struct'
                deps: ['utility-fx', 'dom-query'], // Dependencies: utility-fx, dom-query
                exports: 'Backbone' // Exported as Backbone
            },
            'test-core': { // Changed 'jasmine' to 'test-core'
                exports: 'jasmine' // Exported as jasmine
            },
            'mock-server': { // Changed 'sinon' to 'mock-server'
                exports: 'sinon' // Exported as sinon
            },
            'test-reporter': { // Changed 'jasmine-html' to 'test-reporter'
                deps: ['test-core'], // Dependency: test-core
                exports: 'jasmine' // Exported as jasmine
            },
            'test-dom': ['test-core'] // Dependency: test-core
        }
    });

    // Load necessary modules for test execution.
    require([
        'utility-fx', 'data-struct', 'dom-query', 'test-reporter', 'models/current-user', 'models/shared-models', 'mock-server'
    ], function(utilFx, DataStruct, DomQuery, TestReporter, CurrentUserInstance, SharedDataStore) { // Changed parameters
        // Initialize the test environment.
        var testFramework = TestReporter.getEnv(); // Changed 'jasmineEnv' to 'testFramework'
        testFramework.updateInterval = 1000; // Update frequency for test results.

        // Create an HTML reporter instance.
        var htmlTestReport = new TestReporter.HtmlReporter(); // Changed 'htmlReporter' to 'htmlTestReport'

        // Add the reporter to the test environment.
        testFramework.addReporter(htmlTestReport);

        // Set up the spec filter using the reporter's filter function.
        testFramework.specFilter = function(testSpecification) { // Changed 'spec' to 'testSpecification'
            return htmlTestReport.specFilter(testSpecification);
        };

        // Array to hold paths of individual test specifications.
        var allTestCases = []; // Changed 'specs' to 'allTestCases'

        // Populate the test cases array.
        allTestCases.push(
            'test-case/markdown',
            'test-case/textarea',
            'test-case/navbar', 'test-case/current-user', 'test-case/settings',
            'test-case/register',
            'test-case/quest-small', 'test-case/quest-big', 'test-case/quest-add',
            'test-case/comment', 'test-case/like',
            'test-case/event',
            'test-case/realm', 'test-case/realm-controls',
            'test-case/dashboard', 'test-case/user-big',
            'test-case/model/quest', 'test-case/model/event', 'test-case/model/current-user', 'test-case/model/realm', 'test-case/model/user'
        );

        // Mock external services to isolate tests.
        // Mocking user behavior tracking service.
        window.userTracker = { // Changed 'mixpanel' to 'window.userTracker'
            init: function () {}, // Initialize tracking
            recordEvent: function () {}, // Record an event
            identifyUser: function () {}, // Identify a user
            userProperties: { update: function () {} }, // Update user properties
            createAlias: function () {}, // Create an alias
            labelUser: function () {}, // Label a user
        };
        // Mocking analytics service.
        window.analyticsService = function () {}; // Changed 'ga' to 'window.analyticsService'

        // Mocking identity service.
        window.identityProvider = { // Changed 'navigator.id' to 'window.identityProvider'
            monitorStatus: function () {}, // Watch for status changes
            requestLogin: function () {}, // Request login
            endSession: function () {}, // Log out
        };

        // Start the application's history management.
        DataStruct.history.start(); // Changed 'Backbone.history' to 'DataStruct.history'

        // Set initial data for the current user.
        CurrentUserInstance.set({ // Changed 'currentUser' to 'CurrentUserInstance'
            registered: 1, // User is registered
            accountName: 'test_user', // Changed 'login' to 'accountName'
            uniqueId: '0987654321fedcba0987', // Changed '_id' to 'uniqueId'
            preferences: {}, // Changed 'settings' to 'preferences'
            messages: [], // Changed 'notifications' to 'messages'
            avatarPath: "/default-user.png" // Changed 'pic' to 'avatarPath'
        });

        // Set initial data for shared models (e.g., game realms).
        SharedDataStore.realms.set([ // Changed 'sharedModels' to 'SharedDataStore'
            { identification: 'europe', designation: 'Europe', info: 'europe-region', image: 'europe.jpg', statistics: { totalUsers: 0, totalQuests: 0, totalStencils: 0 } }, // Changed 'id', 'name', 'description', 'pic', 'stat', 'users', 'quests', 'stencils'
            { identification: 'asia', designation: 'Asia', info: 'asia-region', image: 'asia.jpg', statistics: { totalUsers: 0, totalQuests: 0, totalStencils: 0 } }
        ]);

        // Execute tests after the DOM is ready.
        DomQuery(function() { // Changed '$' to 'DomQuery'
            require(allTestCases, function() { // Changed 'specs' to 'allTestCases'
                testFramework.execute(); // Run all defined tests.
            });
        });

    });
})();