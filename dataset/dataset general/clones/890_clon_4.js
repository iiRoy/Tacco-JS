const applicationModule = (function() {

    const visualComponentRegistry = {};

    const operationalSequenceManager = {};

    const commonUtilityToolkit = {};

    commonUtilityToolkit.urlParameterProcessor = {
        checkInclusionCriterion: function(specificKey) {
            return window.location.href.includes(specificKey);
        }
    };

    commonUtilityToolkit.authenticationHandler = {
        initiateSession: function() {
            console.log("User session initiation routine.");
            return true;
        },
        terminateSession: function() {
            console.log("User session termination routine.");
        }
    };

    operationalSequenceManager.issueDisplayMechanism = {
        invokeDefaultView: function() {
            console.log("Default issue list display activated.");
        }
    };

    operationalSequenceManager.oAuthFlowCoordinator = {
        commenceAuthenticationProcedure: function() {
            console.log("OAuth authentication sequence started.");
        }
    };

    const systemInitializationRoutine = function() {
        if (typeof Backbone !== 'undefined' && Backbone.history) {
            Backbone.history.start();
        }

        if (!window.location.hash) {
            operationalSequenceManager.issueDisplayMechanism.invokeDefaultView();
        }

        if (commonUtilityToolkit.urlParameterProcessor.checkInclusionCriterion("auth_token")) {
            operationalSequenceManager.oAuthFlowCoordinator.commenceAuthenticationProcedure();
        }

        return commonUtilityToolkit.authenticationHandler.initiateSession();
    };

    return {
        startApplication: systemInitializationRoutine,
        _internalModules: {
            views: visualComponentRegistry,
            controllers: operationalSequenceManager,
            utilities: commonUtilityToolkit
        }
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    if (typeof jQuery !== 'undefined' && jQuery.support) {
        jQuery.support.cors = true;
    }

    applicationModule.startApplication();

    const navigationLinksElements = document.querySelectorAll('.nav a');
    navigationLinksElements.forEach(linkElem => {
        linkElem.addEventListener('click', function(event) {
            event.preventDefault();

            document.querySelectorAll('.nav li').forEach(listItem => {
                listItem.classList.remove('active');
            });

            const parentListItem = this.closest('li');
            if (parentListItem) {
                parentListItem.classList.add('active');
            }
        });
    });

    const logoutButtonElement = document.getElementById('logout');
    if (logoutButtonElement) {
        logoutButtonElement.addEventListener('click', function() {
            applicationModule._internalModules.utilities.authenticationHandler.terminateSession();
        });
    }
});