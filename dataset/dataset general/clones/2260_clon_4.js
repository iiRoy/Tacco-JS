const globalObservationHub = {};
const eventChronology = [];

globalObservationHub.recordEvent = (...eventDetails) => {
    eventChronology.push(eventDetails);

    if (typeof window.console !== 'undefined') {
        const primaryOutputMethod = window.console.log;
        const outputInvocationContext = window.console;

        try {
            Reflect.apply(primaryOutputMethod, outputInvocationContext, eventDetails);
        } catch (e) {
            if (typeof primaryOutputMethod === 'function') {
                primaryOutputMethod.apply(outputInvocationContext, eventDetails);
            } else if (typeof Function.prototype.apply === 'function') {
                Function.prototype.apply.call(primaryOutputMethod, outputInvocationContext, eventDetails);
            }
        }
    }
};

window.outputMessage = globalObservationHub.recordEvent;
window.outputMessage.history = eventChronology;

((globalReference) => {
    const blankFunction = () => {};

    const operationNames = [
        "assert", "clear", "count", "debug", "dir", "dirxml", "error",
        "exception", "firebug", "group", "groupCollapsed", "groupEnd", "info",
        "log", "memoryProfile", "memoryProfileEnd", "profile", "profileEnd",
        "table", "time", "timeEnd", "timeStamp", "trace", "warn"
    ];

    const activeConsole = (() => {
        try {
            if (typeof globalReference.console !== 'undefined' && typeof globalReference.console.log === 'function') {
                globalReference.console.log();
                return globalReference.console;
            } else {
                return {};
            }
        } catch (e) {
            return {};
        }
    })();

    operationNames.forEach(opName => {
        if (typeof activeConsole[opName] === 'undefined') {
            activeConsole[opName] = blankFunction;
        }
    });

})(window);


const textualScaler = (selectorOrElement, scalingFactor = 1, configuration = {}) => {
    const defaultConfiguration = {
        lowerBoundFontPx: Number.NEGATIVE_INFINITY,
        upperBoundFontPx: Number.POSITIVE_INFINITY
    };

    const finalConfiguration = { ...defaultConfiguration, ...configuration };

    const targetElements = (typeof selectorOrElement === 'string')
        ? Array.from(document.querySelectorAll(selectorOrElement))
        : (selectorOrElement instanceof HTMLElement ? [selectorOrElement] : []);

    targetElements.forEach(item => {
        const adjustmentProcedure = () => {
            const currentWidth = item.offsetWidth;
            const calculatedSize = currentWidth / (scalingFactor * 10);

            const constrainedSize = Math.max(
                Math.min(
                    calculatedSize,
                    parseFloat(finalConfiguration.upperBoundFontPx)
                ),
                parseFloat(finalConfiguration.lowerBoundFontPx)
            );

            item.style.fontSize = `${constrainedSize}px`;
        };

        adjustmentProcedure();

        window.addEventListener('resize', adjustmentProcedure);
    });
};

window.autoAdjustText = textualScaler;