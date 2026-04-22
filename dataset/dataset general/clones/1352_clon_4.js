var ApplicationBuilder = (function(ng) {
    var activeModuleContext;

    return {
        createApplicationContext: function(identityLabel, requiredDependencies) {
            activeModuleContext = ng.module(identityLabel, requiredDependencies);
            return this;
        },

        configureApplicationRoutes: function(pathDefinitionList, defaultLocation) {
            activeModuleContext.config(['$routeProvider', function(navigationAgent) {
                pathDefinitionList.forEach(function(routeSpec) {
                    navigationAgent.when(routeSpec.targetPath, {
                        controller: routeSpec.associatedController,
                        template: routeSpec.viewTemplate
                    });
                });
                navigationAgent.otherwise({ redirectTo: defaultLocation });
            });
            return this;
        },

        registerControllerComponent: function(componentIdentifier, componentImplementation) {
            activeModuleContext.controller(componentIdentifier, componentImplementation);
            return this;
        },

        registerServiceComponent: function(serviceIdentifier, serviceFactory) {
            activeModuleContext.factory(serviceIdentifier, serviceFactory);
            return this;
        }
    };
})(angular);

ApplicationBuilder
    .createApplicationContext('remoteDataQuery', ['networkInteractionsModule'])
    .configureApplicationRoutes(
        [
            { targetPath: '/dataInterface', associatedController: 'DataOperationController', viewTemplate: 'presentation/data_entry_form.html' }
        ],
        '/dataInterface'
    )
    .registerControllerComponent('DataOperationController', function(displayModel, communicationGateway) {

        displayModel.invocationDetails = {
            'targetHost': 'localhost',
            'targetPort': '9200',
            'requestPayload': '{ "query" : { "match_all" : {}}}',
            'actionKind': 'retrieve',
            'resourceEndpoint': '_search'
        };

        displayModel.isInputSectionDisabled = function() {
            return displayModel.invocationDetails.actionKind !== 'submit';
        };

        displayModel.isResponseOutputEmpty = function() {
            return !displayModel.lastOperationResponse;
        };

        displayModel.isErrorReportEmpty = function() {
            return !displayModel.lastOperationError;
        };

        displayModel.handleSuccessfulOutcome = function(incomingPayload) {
            displayModel.lastOperationResponse = incomingPayload;
        };

        displayModel.handleFailedOutcome = function(errorPayload) {
            displayModel.lastOperationError = errorPayload;
        };

        var operationStrategyMap = {
            'submit': function() {
                communicationGateway.postData(
                    displayModel.invocationDetails,
                    displayModel.invocationDetails.requestPayload,
                    displayModel.handleSuccessfulOutcome,
                    displayModel.handleFailedOutcome
                );
            },
            'remove': function() {
                communicationGateway.deleteData(
                    displayModel.invocationDetails,
                    displayModel.handleSuccessfulOutcome,
                    displayModel.handleFailedOutcome
                );
            },
            'retrieve': function() {
                communicationGateway.getData(
                    displayModel.invocationDetails,
                    displayModel.handleSuccessfulOutcome,
                    displayModel.handleFailedOutcome
                );
            }
        };

        displayModel.executeRemoteCall = function() {
            displayModel.lastOperationResponse = null;
            displayModel.lastOperationError = null;

            var currentAction = displayModel.invocationDetails.actionKind;
            var selectedStrategy = operationStrategyMap[currentAction] || operationStrategyMap['retrieve'];

            selectedStrategy();
        };
    });