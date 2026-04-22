'use strict';

const appComponentDefinitions = {};

function assembleControlUnit(dependencyLabels) {
    const generatedControlLogic = function(input0, input1, input2, input3, input4) {
        const viewDataContainer = input0;
        const navigationRouter = input1;
        const navigationParametersStore = input2;
        const currentAddressTracker = input3;
        const applicationVersionProvider = input4;

        this.activeRouterState = navigationRouter;
        this.currentLocationReference = currentAddressTracker;
        this.urlParametersCollection = navigationParametersStore;

        viewDataContainer.systemSoftwareVersion = applicationVersionProvider.query();
    };

    generatedControlLogic.$inject = dependencyLabels;
    return generatedControlLogic;
}

appComponentDefinitions.primaryAppControl = {
    moniker: 'ApplicationMasterControl',
    requiredServices: ['$scope', '$route', '$routeParams', '$location', 'AppVersion'],
    builder: null
};

appComponentDefinitions.primaryAppControl.builder = assembleControlUnit(appComponentDefinitions.primaryAppControl.requiredServices);

(function() {
    const angularGlobalReference = window.angular;

    const coreApplicationModule = angularGlobalReference.module('core-application-hub', []);

    coreApplicationModule.controller(
        appComponentDefinitions.primaryAppControl.moniker,
        appComponentDefinitions.primaryAppControl.builder
    );
})();

delete appComponentDefinitions.primaryAppControl;
delete appComponentDefinitions;