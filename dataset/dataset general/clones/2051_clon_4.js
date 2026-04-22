'use strict';

const ApplicationConfigurationDescriptor = {
    applicationTag: 'primaryApplicationUnit',
    requiredComponents: [
        'utilityFilters',
        'systemServices',
        'interfaceElements',
        'remoteFileTransferModule',
        'interactiveWidgets'
    ],
    navigationSchema: [
        {
            routePath: '/entryPoint',
            viewTemplate: 'displayContent/mainView.html',
            associatedController: 'MainDisplayHandler'
        }
    ],
    defaultNavigationTarget: '/entryPoint',
    transferUtilitySettings: {
        flashResourcePath: '/assets/transfer_flash.swf',
        silverlightResourcePath: '/assets/transfer_silverlight.xap',
        requestHeadersMap: { 'Authorization-Key': 'abc-123' }
    },
    startupRoutine: function(transferManager) {
        // This function body is empty, mirroring the original's empty run block.
        // It demonstrates the ability to receive and use injected services.
    }
};

(function() {
    const establishProgramEnvironment = function(descriptorObject) {
        const mainApplication = angular.module(descriptorObject.applicationTag, descriptorObject.requiredComponents);

        mainApplication.config(['$routeHandler', 'remoteTransferConfigurer', function($routeHandler, remoteTransferConfigurer) {
            descriptorObject.navigationSchema.forEach(pathDefinition => {
                $routeHandler.when(pathDefinition.routePath, {
                    templateUrl: pathDefinition.viewTemplate,
                    controller: pathDefinition.associatedController
                });
            });
            $routeHandler.otherwise({ redirectTo: descriptorObject.defaultNavigationTarget });

            const currentSettings = descriptorObject.transferUtilitySettings;
            remoteTransferConfigurer.setOption('flashBridge', currentSettings.flashResourcePath);
            remoteTransferConfigurer.setOption('silverlightBridge', currentSettings.silverlightResourcePath);
            remoteTransferConfigurer.setOption('httpHeaders', currentSettings.requestHeadersMap);
        }]);

        mainApplication.run(['remoteTransferService', function(transferManager) {
            descriptorObject.startupRoutine(transferManager);
        }]);
    };

    establishProgramEnvironment(ApplicationConfigurationDescriptor);
})();