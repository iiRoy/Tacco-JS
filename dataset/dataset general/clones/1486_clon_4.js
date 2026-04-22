function performImageAdaptation() {
    const currentDisplayWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const visualElements = document.querySelectorAll('img');

    if (visualElements.length === 0) {
        return;
    }

    const isHighDensityScreen = (window.devicePixelRatio && window.devicePixelRatio >= 1.2);

    const parseDefinition = (definitionString) => {
        const parts = definitionString.split(':');
        if (parts.length !== 2) return null;

        const thresholdSpec = parts[0];
        const segmentIdentifier = parts[1];

        let operator, value;
        if (thresholdSpec.startsWith('<')) {
            operator = 'lt';
            value = parseInt(thresholdSpec.substring(1), 10);
        } else if (thresholdSpec.startsWith('>')) {
            operator = 'gt';
            value = parseInt(thresholdSpec.substring(1), 10);
        } else {
            return null; // Malformed definition based on original's implicit parsing
        }
        
        if (isNaN(value)) return null;

        return {
            op: operator,
            val: value,
            src: segmentIdentifier
        };
    };

    Array.from(visualElements).forEach((visual) => {
        const activeSourceAttributeName = isHighDensityScreen && visual.hasAttribute('data-src2x') ? 'data-src2x' : 'data-src';
        const activeBaseAttributeName = isHighDensityScreen && visual.hasAttribute('data-src-base2x') ? 'data-src-base2x' : 'data-src-base';

        if (!visual.hasAttribute(activeSourceAttributeName)) {
            return;
        }

        const segmentPrefix = visual.hasAttribute(activeBaseAttributeName) ? visual.getAttribute(activeBaseAttributeName) : '';
        const sourceDefinitionsText = visual.getAttribute(activeSourceAttributeName);

        const definitionSegments = sourceDefinitionsText.split(',').map(parseDefinition).filter(Boolean);

        const foundDefinition = definitionSegments.find((currentDefinition, idx, arr) => {
            const priorDefinition = arr[idx - 1];
            const subsequentDefinition = arr[idx + 1];

            let isApplicable = false;

            if (currentDefinition.op === 'lt') {
                const upperBound = currentDefinition.val;
                const lowerBound = (priorDefinition && priorDefinition.op === 'lt') ? priorDefinition.val : -Infinity;
                isApplicable = (currentDisplayWidth <= upperBound && currentDisplayWidth > lowerBound);
            } else if (currentDefinition.op === 'gt') {
                const lowerBound = currentDefinition.val;
                const upperBound = (subsequentDefinition && subsequentDefinition.op === 'gt') ? subsequentDefinition.val : Infinity;
                isApplicable = (currentDisplayWidth >= lowerBound && currentDisplayWidth < upperBound);
            }
            return isApplicable;
        });

        if (foundDefinition) {
            const isExternalResource = foundDefinition.src.includes('//');
            const finalSource = isExternalResource ? foundDefinition.src : segmentPrefix + foundDefinition.src;

            if (visual.src !== finalSource) {
                visual.setAttribute('src', finalSource);
            }
        }
    });
}

if (window.addEventListener) {
    window.addEventListener('load', performImageAdaptation, false);
    window.addEventListener('resize', performImageAdaptation, false);
}