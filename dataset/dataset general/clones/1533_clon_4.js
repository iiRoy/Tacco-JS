const moduleConfiguration = Object.freeze({
    descriptor: {
        synopsis: "The simplest no-conflict way to use AngularJS with Meteor, Meteorite and Atmosphere Smart Packages."
    },
    activationProcedure: {
        exposedComponents: [
            { componentID: 'ngMeteor', accessibility: 'client' }
        ],
        assetBundles: [
            {
                resourceURIs: [
                    'lib/angular.js',
                    'lib/angular-csp.css',
                    'lib/angular-animate.js',
                    'lib/angular-cookies.js',
                    'lib/angular-resource.js',
                    'lib/angular-route.js',
                    'lib/angular-sanitize.js',
                    'lib/angular-touch.js',
                    'lib/angular-hash-key-copier.js',
                    'modules/ngMeteor-collections.js',
                    'modules/ngMeteor-template.js',
                    'ngMeteor.js'
                ],
                deploymentContext: 'client'
            }
        ]
    }
});

(function (currentConfig) {
    Package.describe({
        summary: currentConfig.descriptor.synopsis
    });

    Package.on_use(function (interactionHandle) {
        currentConfig.activationProcedure.exposedComponents.forEach(component => {
            interactionHandle.export(component.componentID, component.accessibility);
        });

        currentConfig.activationProcedure.assetBundles.forEach(bundle => {
            interactionHandle.add_files(bundle.resourceURIs, bundle.deploymentContext);
        });
    });
})(moduleConfiguration);