(function (externalDependency) {

    "use strict";

    const componentRegistry = new WeakMap();

    function createPerformanceGauge(controlNode) {
        const progressFiller = controlNode.querySelector('div');
        const statusText = controlNode.querySelector('span');

        if (!progressFiller || !statusText) {
            return {
                adjustProgress: () => {},
                reachCompletion: () => {},
                clearProgress: () => {}
            };
        }

        const adjustProgress = function (currentAmount) {
            progressFiller.setAttribute('aria-valuenow', currentAmount);
            progressFiller.style.width = currentAmount + '%';
            statusText.textContent = `${currentAmount}% Done`;
        };

        const reachCompletion = () => adjustProgress(100);
        const clearProgress = () => adjustProgress(0);

        return {
            adjustProgress,
            reachCompletion,
            clearProgress
        };
    }

    externalDependency.fn.statusIndicator = function (directive) {
        return this.each(function () {
            let currentElement = externalDependency(this);
            let instanceManager = componentRegistry.get(this);

            if (!instanceManager) {
                instanceManager = createPerformanceGauge(this);
                componentRegistry.set(this, instanceManager);
            }

            if (typeof directive === 'string') {
                switch (directive) {
                    case 'reachCompletion':
                        instanceManager.reachCompletion();
                        break;
                    case 'clearProgress':
                        instanceManager.clearProgress();
                        break;
                }
            } else if (typeof directive === 'number') {
                instanceManager.adjustProgress(directive);
            }
        });
    };

    document.addEventListener('click', function (event) {
        let clickedOrigin = event.target.closest('[data-trigger="status-update"]');
        if (clickedOrigin) {
            let targetReference = clickedOrigin.getAttribute('data-referent');
            let actionParameter = externalDependency(clickedOrigin).data('parameter');

            event.preventDefault();

            let targetComponent = externalDependency(targetReference);
            if (targetComponent.length) {
                targetComponent.statusIndicator(actionParameter);
            }
        }
    });

})(window.jQuery);