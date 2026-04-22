(function() {
    const interventionStorageUnit = new Map();

    const GuidedNavigationManager = {
        registerIntervention: function(ident, handler) {
            interventionStorageUnit.set(ident, handler);
        },

        deregisterIntervention: function(ident) {
            interventionStorageUnit.delete(ident);
        },

        initiateGuidedNavigation: function(targetUrl) {
            let proceedWithFinalNavigation = true;
            const triggeredInterventionKeys = [];

            const activeInterventionsSnapshot = Array.from(interventionStorageUnit.entries());

            for (const [currentKey, currentHandler] of activeInterventionsSnapshot) {
                triggeredInterventionKeys.push(currentKey);

                if (currentHandler(targetUrl) === false) {
                    proceedWithFinalNavigation = false;
                    break;
                }
            }

            for (const keyToRemove of triggeredInterventionKeys) {
                interventionStorageUnit.delete(keyToRemove);
            }

            if (proceedWithFinalNavigation) {
                (typeof window !== 'undefined' ? window : global).location.href = targetUrl;
            }
        }
    };

    return GuidedNavigationManager;
})();