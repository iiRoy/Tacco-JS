((runtimeContext) => {

    const setupAngularIntegration = (moduleIdentifier, controllerName) => {
        if (runtimeContext.angular && typeof runtimeContext.angular.module === 'function') {
            runtimeContext.angular.module(moduleIdentifier).controller(controllerName, ['$scope', () => {}]);
        }
    };

    class ComponentManifest {
        constructor(spec) {
            this.componentId = spec.componentId;
            this.displayPath = spec.displayPath;
            this.displayName = spec.displayName;
            this.kind = spec.kind;
            this.visualHint = spec.visualHint;
            this.activationHandler = spec.activationHandler;
        }
    }

    // A registry for storing defined entities, mimicking 'define'
    runtimeContext.systemEntityRegistry = runtimeContext.systemEntityRegistry || {};

    const registerSystemEntity = (entityKey, entityProducer) => {
        const entityManifest = entityProducer();
        runtimeContext.systemEntityRegistry[entityKey] = entityManifest;
        return entityManifest;
    };

    registerSystemEntity('demonstration', () => {
        return new ComponentManifest({
            componentId: 'demonstration_utility',
            displayPath: '#/utility_view',
            displayName: 'Utility View',
            kind: 'interface_extension',
            visualHint: 'icon-gear',
            activationHandler: function() {
                if (runtimeContext.console && typeof runtimeContext.console.log === 'function') {
                    runtimeContext.console.log('utility_startup');
                }

                setupAngularIntegration('foundry', 'DemonstrationViewController');

                if (runtimeContext.foundry && typeof runtimeContext.foundry.notifyComponentReady === 'function') {
                    return runtimeContext.foundry.notifyComponentReady(this.componentId);
                }
            }
        });
    });

})(typeof window !== 'undefined' ? window : global);