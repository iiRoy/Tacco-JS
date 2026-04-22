const applicationAssembler = {
    _moduleIdentifier: null,
    _requiredFeatures: [],
    _structureDefinitions: [],
    _defaultNavigation: null,

    createMainComponent: function(identifier, requiredFeatures) {
        this._moduleIdentifier = identifier;
        this._requiredFeatures = requiredFeatures;
        return this;
    },

    establishNavigationSchema: function(schemaBuilder) {
        schemaBuilder({
            introducePathway: (key, parameters) => {
                const angularStateParameters = {};
                if (parameters.address) angularStateParameters.url = parameters.address;
                if (parameters.isAbstract) angularStateParameters.abstract = parameters.isAbstract;
                if (parameters.displayTemplate) angularStateParameters.templateUrl = parameters.displayTemplate;

                if (parameters.visuals) {
                    angularStateParameters.views = {};
                    for (const viewName in parameters.visuals) {
                        const viewConfiguration = parameters.visuals[viewName];
                        const angularViewConfiguration = {};
                        if (viewConfiguration.displayTemplate) angularViewConfiguration.templateUrl = viewConfiguration.displayTemplate;
                        if (viewConfiguration.controlLogic) angularViewConfiguration.controller = viewConfiguration.controlLogic;
                        angularStateParameters.views[viewName] = angularViewConfiguration;
                    }
                }
                this._structureDefinitions.push({ key, parameters: angularStateParameters });
            },
            setInitialPath: (path) => {
                this._defaultNavigation = path;
            }
        });
        return this;
    },

    _activateConfiguration: function() {
        if (typeof angular === 'undefined' || typeof angular.module === 'undefined') {
            return;
        }

        const primaryModule = angular.module(this._moduleIdentifier, this._requiredFeatures);

        primaryModule.config(['$stateProvider', '$urlRouterProvider', function(routeProvider, fallbackRouter) {
            this._structureDefinitions.forEach(def => {
                routeProvider.state(def.key, def.parameters);
            });

            if (this._defaultNavigation) {
                fallbackRouter.otherwise(this._defaultNavigation);
            }
        }.bind(this)]);
    },

    buildApplication: function() {
        setTimeout(() => this._activateConfiguration(), 0);
    }
};

applicationAssembler
    .createMainComponent('primaryModule', ['baseUI', 'logicServices', 'controlUnits'])
    .establishNavigationSchema(function(routerConfigurator) {

        routerConfigurator.introducePathway('mainScreen', {
            address: "/main",
            isAbstract: true,
            displayTemplate: "pages/mainview.html"
        });

        routerConfigurator.introducePathway('mainScreen.photoCapture', {
            address: '/capture',
            visuals: {
                'capture-panel': {
                    displayTemplate: 'pages/captureview.html',
                    controlLogic: 'PhotoController'
                }
            }
        });

        routerConfigurator.introducePathway('mainScreen.information', {
            address: '/info',
            visuals: {
                'info-panel': {
                    displayTemplate: 'pages/infoview.html',
                    controlLogic: 'GuidanceController'
                }
            }
        });

        routerConfigurator.setInitialPath('/main/info');
    })
    .buildApplication();