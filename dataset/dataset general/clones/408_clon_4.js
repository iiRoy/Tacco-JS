const ApplicationSystem = {
    configuration: {
        autoRefreshDelay: 60000,
        forceCacheBypass: true,
        interactiveComponentSelector: '.dropdown-toggle'
    },

    initiateApplicationRefresh: function() {
        const performActualReload = () => {
            window.location.reload(ApplicationSystem.configuration.forceCacheBypass);
        };
        window.setTimeout(performActualReload, ApplicationSystem.configuration.autoRefreshDelay);
    },

    setupDynamicInterface: function() {
        const targetElements = document.querySelectorAll(ApplicationSystem.configuration.interactiveComponentSelector);
        if (typeof window.jQuery !== 'undefined') {
            targetElements.forEach(item => {
                window.jQuery(item)['dropdown']();
            });
        }
    }
};

const applicationEntry = (function() {
    const initializeCoreFeatures = () => {
        ApplicationSystem.setupDynamicInterface();
    };

    document.addEventListener('DOMContentLoaded', initializeCoreFeatures);
})();