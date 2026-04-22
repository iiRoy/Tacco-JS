const ADAPTIVE_LAYOUT_ATTRIBUTE_NAME = 'data-adaptive-layout';
const RESIZE_THROTTLE_DELAY_MS = 5;
const DEFAULT_CONFIGURATION_SETTING = {
    initial: 100,
    final: 900,
    step: 50
};

const createRateLimiter = (operationFunction, timeThreshold) => {
    let timeoutIdentifier = null;
    let lastOperationResult;

    return function(...operationArguments) {
        const executionContext = this;
        const delayedExecution = () => {
            timeoutIdentifier = null;
            lastOperationResult = operationFunction.apply(executionContext, operationArguments);
        };

        clearTimeout(timeoutIdentifier);
        timeoutIdentifier = setTimeout(delayedExecution, timeThreshold);
        return lastOperationResult;
    };
};

const LayoutAdjuster = (() => {
    const activeElements = new Set();
    const configParsingCache = new Map();

    const interpretConfigString = (configInput) => {
        if (!configInput) return null;

        if (configParsingCache.has(configInput)) {
            return configParsingCache.get(configInput);
        }

        const parsedOptions = configInput.split(';').reduce((accumulator, segment) => {
            const trimmedSegment = segment.trim();
            if (!trimmedSegment) return accumulator;

            const parts = trimmedSegment.split(':').map(p => p.trim());
            if (parts.length !== 2) return accumulator;

            let settingKey = parts[0];
            let settingValue = parts[1];

            if (settingValue.endsWith('px')) {
                settingValue = settingValue.slice(0, -2);
            }
            if (!isNaN(settingValue) && settingValue !== '') {
                settingValue = parseInt(settingValue, 10);
            }
            accumulator[settingKey] = settingValue;
            return accumulator;
        }, {});

        configParsingCache.set(configInput, parsedOptions);
        return parsedOptions;
    };

    const removeSizeDesignations = (targetDomElement) => {
        const currentClasses = targetDomElement.className || '';
        const regexFilter = /^(gt|lt)\d+$/;
        const classesToRemove = currentClasses.split(/\s+/).filter(cls => regexFilter.test(cls));
        targetDomElement.classList.remove(...classesToRemove);
    };

    const generateResponsiveClasses = (currentDimension, configSettings) => {
        const rangeStart = configSettings.initial;
        const rangeEnd = configSettings.final;
        const stepIncrement = configSettings.step;

        const generatedClasses = [];

        let currentPoint = stepIncrement > rangeStart ? stepIncrement : Math.floor(rangeStart / stepIncrement) * stepIncrement;

        const allPoints = Array.from({
            length: Math.floor((rangeEnd - currentPoint) / stepIncrement) + 1
        }, (_, index) => currentPoint + index * stepIncrement);

        allPoints.forEach(pointValue => {
            if (pointValue < currentDimension) {
                generatedClasses.push('gt' + pointValue);
            }
            if (pointValue > currentDimension) {
                generatedClasses.push('lt' + pointValue);
            }
            if (pointValue === currentDimension) {
                generatedClasses.push('lt' + pointValue);
            }
        });

        return generatedClasses;
    };

    const processSingleElement = (elementToUpdate) => {
        const elementConfigString = elementToUpdate.getAttribute(ADAPTIVE_LAYOUT_ATTRIBUTE_NAME);
        const elementSpecificConfig = interpretConfigString(elementConfigString) || DEFAULT_CONFIGURATION_SETTING;

        const elementCurrentWidth = elementToUpdate.offsetWidth;
        const newDesignations = generateResponsiveClasses(elementCurrentWidth, elementSpecificConfig);

        removeSizeDesignations(elementToUpdate);
        elementToUpdate.classList.add(...newDesignations);
    };

    const processAllManagedElements = () => {
        activeElements.forEach(processSingleElement);
    };

    const throttledProcessAll = createRateLimiter(processAllManagedElements, RESIZE_THROTTLE_DELAY_MS);

    const setupModule = () => {
        document.querySelectorAll(`[${ADAPTIVE_LAYOUT_ATTRIBUTE_NAME}]`).forEach(element => {
            activeElements.add(element);
        });
        processAllManagedElements();
        window.addEventListener('resize', throttledProcessAll);
    };

    return {
        start: function() {
            document.addEventListener('DOMContentLoaded', setupModule);
        },
        registerElement: function(newElement) {
            if (newElement instanceof HTMLElement) {
                activeElements.add(newElement);
                processSingleElement(newElement);
            }
        },
        deregisterElement: function(existingElement) {
            if (activeElements.has(existingElement)) {
                activeElements.delete(existingElement);
                removeSizeDesignations(existingElement);
            }
        }
    };
})();

LayoutAdjuster.start();