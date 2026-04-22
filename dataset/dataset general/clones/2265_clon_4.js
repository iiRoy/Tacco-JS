(function() {

    function processElementForGrid(targetNode, configurationSettings) {
        let resolvedAlignmentUnit;
        const currentDisplayWidth = window.innerWidth;

        if (typeof configurationSettings === 'number') {
            resolvedAlignmentUnit = configurationSettings;
        } else if (typeof configurationSettings === 'object' && configurationSettings !== null) {
            const dimensionThresholds = Object.keys(configurationSettings)
                .map(Number)
                .sort((x, y) => x - y);

            let suitableThreshold = null;
            for (let idx = dimensionThresholds.length - 1; idx >= 0; idx--) {
                const boundaryValue = dimensionThresholds[idx];
                if (currentDisplayWidth > boundaryValue) {
                    suitableThreshold = boundaryValue;
                    break;
                }
            }

            if (suitableThreshold !== null) {
                resolvedAlignmentUnit = configurationSettings[suitableThreshold.toString()];
            }
        }

        if (typeof resolvedAlignmentUnit === 'number' && resolvedAlignmentUnit > 0) {
            targetNode.style.maxHeight = '';
            const elementActualHeight = targetNode.offsetHeight;
            
            const adjustedFinalHeight = elementActualHeight - (elementActualHeight % resolvedAlignmentUnit);
            
            targetNode.style.maxHeight = adjustedFinalHeight + 'px';
        } else {
            targetNode.style.maxHeight = '';
        }
    }

    function initializeVisualBaseline(cssSelector, baselineDefinition) {
        const identifiedElements = document.querySelectorAll(cssSelector);

        const updateGridMetrics = () => {
            identifiedElements.forEach(itemNode => {
                processElementForGrid(itemNode, baselineDefinition);
            });
        };

        updateGridMetrics();

        window.addEventListener('resize', updateGridMetrics);
    }

    window.LayoutGridUtility = {
        applyBaseline: initializeVisualBaseline
    };

})();