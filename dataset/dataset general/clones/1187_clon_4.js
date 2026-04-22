(function (global) {

    const scrollInstanceBag = new Map();
    const refreshObservers = new Map();

    const defaultConfigurationSet = {
        canSnap: true,
        hasMomentum: true,
        horizontalScrollbar: false
    };

    const formElementGuard = (interactionEvent) => {
        let currentFocus = interactionEvent.target;
        while (currentFocus && currentFocus.nodeType !== 1) {
            currentFocus = currentFocus.parentNode;
        }

        if (currentFocus && !['SELECT', 'INPUT', 'TEXTAREA'].includes(currentFocus.tagName)) {
            interactionEvent.preventDefault();
        }
    };

    function processScrollElement(targetDomNode) {
        let executionInterval = 5;

        let uniqueId = targetDomNode.getAttribute('data-scroll-region') || targetDomNode.id;
        if (!uniqueId) {
            console.warn("Scroll region element requires 'data-scroll-region' or 'id' for tracking.", targetDomNode);
            return;
        }

        const effectiveSettings = { ...defaultConfigurationSet };

        if (targetDomNode.hasAttribute('data-scroll-form-support')) {
            effectiveSettings.useTransform = false;
            effectiveSettings.onBeforeScrollStart = formElementGuard;
        }

        const delayValue = targetDomNode.getAttribute('data-scroll-initial-delay');
        if (delayValue) {
            executionInterval = parseInt(delayValue, 10) || executionInterval;
        }

        if (global.overallScrollOptions) {
            for (const optionKey in global.overallScrollOptions) {
                if (Object.prototype.hasOwnProperty.call(global.overallScrollOptions, optionKey)) {
                    if (optionKey === uniqueId) {
                        for (const subOptionKey in global.overallScrollOptions[optionKey]) {
                            if (Object.prototype.hasOwnProperty.call(global.overallScrollOptions[optionKey], subOptionKey)) {
                                effectiveSettings[subOptionKey] = global.overallScrollOptions[optionKey][subOptionKey];
                            }
                        }
                    } else {
                        effectiveSettings[optionKey] = global.overallScrollOptions[optionKey];
                    }
                }
            }
        }

        const activateScrollSystem = () => {
            if (typeof global.ScrollEngine === 'undefined') {
                console.error("ScrollEngine (iScroll) library is missing. Ensure it's globally available.");
                return;
            }

            if (scrollInstanceBag.has(uniqueId)) {
                const existingInstance = scrollInstanceBag.get(uniqueId);
                existingInstance.destroy();
            }

            const newScrollManager = new global.ScrollEngine(targetDomNode, effectiveSettings);
            scrollInstanceBag.set(uniqueId, newScrollManager);

            const refresherSignal = targetDomNode.getAttribute('data-scroll-refresh-signal');
            if (refresherSignal) {
                if (!refreshObservers.has(refresherSignal)) {
                    refreshObservers.set(refresherSignal, new Set());
                }
                refreshObservers.get(refresherSignal).add(uniqueId);
            }
        };

        setTimeout(activateScrollSystem, executionInterval);
    }

    function initializeAllScrollRegions() {
        const potentialScrollElements = document.querySelectorAll('[data-scroll-region]');
        potentialScrollElements.forEach(processScrollElement);
    }

    global.dispatchScrollRefresh = function (signalIdentifier) {
        if (refreshObservers.has(signalIdentifier)) {
            refreshObservers.get(signalIdentifier).forEach(regionId => {
                const manager = scrollInstanceBag.get(regionId);
                if (manager) {
                    manager.refresh();
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', initializeAllScrollRegions);

    global.reconfigureScrollRegions = initializeAllScrollRegions;

})(window);