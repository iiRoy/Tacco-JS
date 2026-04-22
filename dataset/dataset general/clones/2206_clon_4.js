const baseConfigs = {
    dimensionCriterion: 'minimum-width',
    numericThreshold: '0px',
    styleClass: '',
    actionHandler: null
};

function monitorElementDimensions(elementsToObserve, customParameters) {

    if (typeof customParameters.dimensionCriterion === 'undefined') {
        throw new Error('DimensionObserver: Missing rule type, e.g., \'minimum-width\'.');
    }
    if (typeof customParameters.numericThreshold === 'undefined') {
        throw new Error('DimensionObserver: Missing threshold quantity, e.g., \'700px\'.');
    }
    if (typeof customParameters.styleClass === 'undefined' && typeof customParameters.actionHandler === 'undefined') {
        throw new Error('DimensionObserver: Neither \'styleClass\' nor \'actionHandler\' provided; no utility.');
    }

    const finalConfiguration = { ...baseConfigs, ...customParameters };

    return Array.from(elementsToObserve).map(targetNode => {

        const evaluateDimensions = (entries) => {
            const currentExtent = entries[0].contentRect.width;
            const thresholdValue = parseFloat(finalConfiguration.numericThreshold);
            let criterionMet = false;

            if (finalConfiguration.styleClass !== '') {
                targetNode.classList.remove(finalConfiguration.styleClass);
            }

            switch (finalConfiguration.dimensionCriterion) {
                case 'minimum-width':
                    if (thresholdValue < currentExtent) {
                        criterionMet = true;
                    }
                    break;
                case 'maximum-width':
                    if (thresholdValue > currentExtent) {
                        criterionMet = true;
                    }
                    break;
            }

            if (criterionMet) {
                if (finalConfiguration.styleClass !== '') {
                    targetNode.classList.add(finalConfiguration.styleClass);
                }
                if (finalConfiguration.actionHandler !== null) {
                    finalConfiguration.actionHandler({
                        width: currentExtent
                    });
                }
            }
        };

        const sizeObserver = new ResizeObserver(evaluateDimensions);
        sizeObserver.observe(targetNode);

        const initialWidthStyle = getComputedStyle(targetNode).width;
        const initialWidth = parseFloat(initialWidthStyle);
        evaluateDimensions([{ contentRect: { width: initialWidth } }]);

        return sizeObserver;
    });
}