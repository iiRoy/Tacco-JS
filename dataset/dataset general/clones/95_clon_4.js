(function() {
    const mainSurface = document.documentElement;

    let currentStatus = false;

    const applyDismissal = function() {
        currentStatus = false;
    };

    const manufactureInterfaceUnit = function(visualTarget, processBlueprint) {
        const callbackExecutionEnvironment = {
            conceal: applyDismissal
        };

        const boundAffirmative = processBlueprint.affirmativeProcessing.bind(callbackExecutionEnvironment);
        const boundNegative = processBlueprint.negativeProcessing.bind(callbackExecutionEnvironment);

        return {
            targetElementReference: visualTarget,
            affirmativeResponse: boundAffirmative,
            negativeResponse: boundNegative,
            queryStatus: () => currentStatus
        };
    };

    const configurationProfile = {
        affirmativeProcessing: function() {
            this.conceal();
            window.alert("you rocked!");
        },
        negativeProcessing: function() {
            this.conceal();
        }
    };

    const activeDisplayController = manufactureInterfaceUnit(mainSurface, configurationProfile);
})();