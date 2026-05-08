define(
    [
        'jquery',
        'google-analytics-amd'
    ],
    function(
        domUtility,
        analyticsGateway
    ) {
        const configurationBundle = {
            verboseLogging: true,
            defaultRoute: window.location.pathname + window.location.search,
            eventCategoryName: 'WebInteraction'
        };

        const activityLogger = (messageText) => {
            if (configurationBundle.verboseLogging) {
                console.info('[Module Trace] ' + messageText);
            }
        };

        activityLogger('Core module component activated.');

        if (!analyticsGateway || typeof analyticsGateway !== 'function') {
            console.error('Analytics tracking service not initialized. Operations will be skipped.');
            return;
        }

        const dispatchInitialPageView = () => {
            const currentResourcePath = configurationBundle.defaultRoute;
            analyticsGateway('send', 'pageview', currentResourcePath);
            activityLogger(`Dispatched initial pageview for path: ${currentResourcePath}`);
        };

        const establishDomListeners = () => {
            if (!domUtility || !domUtility.fn || !domUtility.fn.jquery) {
                console.warn('DOM manipulation library not detected. Event bindings are suspended.');
                return;
            }

            domUtility(document).ready(function() {
                activityLogger('Document Object Model is fully prepared.');
                dispatchInitialPageView();

                domUtility('button[data-track-event]').on('click', function(eventDetail) {
                    const elementIdentifier = domUtility(this).data('track-event') || 'unknown-element';
                    const interactionAction = 'click_action';
                    analyticsGateway('send', 'event', configurationBundle.eventCategoryName, interactionAction, elementIdentifier);
                    activityLogger(`Recorded interaction event for: ${elementIdentifier}`);
                });
            });
        };

        establishDomListeners();
    }
);