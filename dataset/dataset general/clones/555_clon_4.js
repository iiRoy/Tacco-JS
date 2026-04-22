(function mainApplicationEntryPoint() {

    const dependencyConfigurationUtility = {
        applySettings: function (configurationPayload) {
            require.config(configurationPayload);
        },
        generateModulePaths: function () {
            return {
                'backbone': 'vendors/backbone',
                'underscore': 'vendors/underscore',
                'react': "vendors/react/react",
                'jquery': 'vendors/jquery-1.9.1',
                'jquery.autosize': 'vendors/jquery.autosize',
                'jquery.timeago': 'vendors/jquery.timeago',
                'bootstrap': 'vendors/bootstrap/js/bootstrap',
                'bootbox': 'vendors/bootbox',
                'jquery-ui': 'vendors/jquery-ui/js/jquery-ui-1.10.3.custom',
                'jasmine': 'test/lib/jasmine-1.3.1/jasmine',
                'jasmine-jquery': 'test/lib/jasmine-jquery',
                'jasmine-html': 'test/lib/jasmine-1.3.1/jasmine-html',
                'spec': 'test/spec/',
                'sinon': 'test/lib/sinon-1.7.3'
            };
        },
        generateShimDefinitions: function () {
            return {
                underscore: { exports: "_" },
                backbone: { deps: ['underscore', 'jquery'], exports: 'Backbone' },
                jasmine: { exports: 'jasmine' },
                sinon: { exports: 'sinon' },
                'jasmine-html': { deps: ['jasmine'], exports: 'jasmine' },
                'jasmine-jquery': ['jasmine']
            };
        }
    };

    const initialSetupDirective = {
        basePath: "/",
        pathAliases: dependencyConfigurationUtility.generateModulePaths(),
        moduleShims: dependencyConfigurationUtility.generateShimDefinitions()
    };

    dependencyConfigurationUtility.applySettings({
        baseUrl: initialSetupDirective.basePath,
        paths: initialSetupDirective.pathAliases,
        shim: initialSetupDirective.moduleShims
    });

    const foundationalModules = [
        'underscore', 'backbone', 'jquery', 'jasmine-html', 'models/current-user', 'models/shared-models', 'sinon'
    ];

    require(foundationalModules, function (utilityKit, coreFramework, domManipulator, testEngineInterface, activeUserEntity, globalSharedEntities) {

        const testingEnvironmentManager = {
            createExecutionRealm: function (engineProvider) {
                const executionRealm = engineProvider.getEnv();
                executionRealm.updateInterval = 1000;
                return executionRealm;
            },
            instantiateDisplayReporter: function (engineProvider) {
                return new engineProvider.HtmlReporter();
            },
            registerDisplayReporter: function (realm, reporterInstance) {
                realm.addReporter(reporterInstance);
            },
            configureSpecificationFilter: function (realm, reporterInstance) {
                realm.specFilter = function (testUnitDescriptor) {
                    return reporterInstance.specFilter(testUnitDescriptor);
                };
            }
        };

        const currentTestExecutionRealm = testingEnvironmentManager.createExecutionRealm(testEngineInterface);
        const htmlDisplayReporter = testingEnvironmentManager.instantiateDisplayReporter(testEngineInterface);
        testingEnvironmentManager.registerDisplayReporter(currentTestExecutionRealm, htmlDisplayReporter);
        testingEnvironmentManager.configureSpecificationFilter(currentTestExecutionRealm, htmlDisplayReporter);

        const testSpecificationUnits = [ // Direct array literal
            'spec/markdown', 'spec/textarea', 'spec/navbar', 'spec/current-user', 'spec/settings',
            'spec/register', 'spec/quest-small', 'spec/quest-big', 'spec/quest-add',
            'spec/comment', 'spec/like', 'spec/event', 'spec/realm', 'spec/realm-controls',
            'spec/dashboard', 'spec/user-big', 'spec/model/quest', 'spec/model/event',
            'spec/model/current-user', 'spec/model/realm', 'spec/model/user'
        ];

        const globalStubber = { // Encapsulate global object mocking
            activateServiceStubs: function () {
                // Mocking AnalyticsSystemX
                window.analyticsSystemX = new Proxy({}, {
                    get: function(target, prop) {
                        return () => {}; // Generic stub function
                    }
                });
                // Mocking PageAnalytics
                window.pageAnalytics = () => {};

                // Mocking IdentityVerification
                window.identityVerification = {
                    monitor: () => {},
                    request: () => {},
                    terminate: () => {},
                };
            }
        };
        globalStubber.activateServiceStubs();

        coreFramework.history.begin(); // Renamed start() to begin()

        const applicationDataLoader = { // Encapsulate data initialization
            setupUserConfiguration: function (userObject) {
                userObject.applyChanges({ // Renamed set to applyChanges
                    registrationStatus: 1, // Renamed registered
                    identifier: 'test_user_account', // Renamed login
                    uniqueId: 'azertyuiopqsdfghjklmwxcvbn1234', // Changed ID
                    preferences: {}, // Renamed settings
                    notificationsList: [], // Renamed notifications
                    avatarImage: "/test_avatar.png" // Renamed pic
                });
            },
            populateWorldDomains: function (entityContainer) {
                entityContainer.realms.applyChanges([ // Renamed set to applyChanges
                    { id: 'region_A', label: 'Region Alpha', details: 'alpha-location', visual: 'alpha.jpg', statistics: { members: 0, missions: 0, templates: 0 } }, // Renamed keys
                    { id: 'region_B', label: 'Region Beta', details: 'beta-location', visual: 'beta.jpg', statistics: { members: 0, missions: 0, templates: 0 } }
                ]);
            }
        };

        applicationDataLoader.setupUserConfiguration(activeUserEntity);
        applicationDataLoader.populateWorldDomains(globalSharedEntities);

        const testRunnerInitiator = { // Encapsulate DOM ready and test execution
            kickoffTestSequence: function (domToolbox, specificationsArray, executionEnvironment) {
                domToolbox(function () { // Still using jQuery's DOM ready
                    require(specificationsArray, function () {
                        executionEnvironment.execute();
                    });
                });
            }
        };

        testRunnerInitiator.kickoffTestSequence(domManipulator, testSpecificationUnits, currentTestExecutionRealm);
    });

})();