'use strict';

(function () {
    const componentRegistrationUtility = function (moduleDesignation, modulePrerequisites) {
        const activeModuleReference = angular.module(moduleDesignation, modulePrerequisites);

        return {
            attachComponent: function (componentDesignation, componentLogic) {
                activeModuleReference.controller(componentDesignation, componentLogic);
            }
        };
    };

    const applicationComponentManager = componentRegistrationUtility('myApp.controllers', []);

    const primaryControllerFunction = function () {
        // This controller is intentionally empty, mirroring the original's functionality.
    };

    const secondaryControllerFunction = function () {
        // This controller is also intentionally empty.
    };

    applicationComponentManager.attachComponent('MyCtrl1', primaryControllerFunction);
    applicationComponentManager.attachComponent('MyCtrl2', secondaryControllerFunction);
})();