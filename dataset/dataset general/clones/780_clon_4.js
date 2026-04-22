var responsiveMonitor = (function(globalWindow, globalDocument){

    let dimensionRules = new Map();
    let measurementElement = null;
    const sizeCheckInterval = 500;
    let sizeWatchHandle = null;
    let initialSizeReference = null;
    let activeDimensionLabel = null;
    let priorDimensionLabel = null;

    let styleLabels = ["alpha", "beta", "gamma", "delta"];

    const dispatchCustomEvent = (eventName, data = null) => {
        const event = new CustomEvent(eventName, { detail: data });
        globalWindow.dispatchEvent(event);
    };

    const createMeasurementElement = () => {
        measurementElement = globalDocument.createElement('div');
        Object.assign(measurementElement.style, {
            position: "absolute",
            visibility: "hidden",
            fontSize: "1em",
            height: "1em",
            width: "1em",
            padding: "0",
            margin: "0",
            top: "0",
            left: "-200px"
        });
        globalDocument.body.appendChild(measurementElement);
    };

    const resetMeasurementElement = () => {
        if (measurementElement) {
            measurementElement.style.width = "auto";
        }
    };

    const obtainMeasurementWidth = (value) => {
        if (!measurementElement) return 0;
        measurementElement.style.width = value;
        const currentWidth = measurementElement.offsetWidth;
        resetMeasurementElement();
        return currentWidth;
    };

    const obtainMeasurementHeight = () => {
        if (!measurementElement) return 0;
        return measurementElement.offsetHeight;
    };

    const retrieveStyleLabel = () => {
        try {
            const computedStyle = globalWindow.getComputedStyle(globalDocument.body, '::after');
            let content = computedStyle.getPropertyValue('content');
            content = content.replace(/"/g, '');
            return content;
        } catch (e) {
            return "gamma";
        }
    };

    const retrieveViewportWidth = () => {
        return globalWindow.innerWidth || globalDocument.documentElement.clientWidth || globalDocument.body.clientWidth;
    };

    const retrieveViewportHeight = () => {
        return globalWindow.innerHeight || globalDocument.documentElement.clientHeight || globalDocument.body.clientHeight;
    };

    const getBrowserDimensions = () => {
        return {
            horizontal: retrieveViewportWidth(),
            vertical: retrieveViewportHeight()
        };
    };

    const countDimensionRules = () => {
        return dimensionRules.size;
    };

    const testSpecificRule = (ruleName) => {
        const rule = dimensionRules.get(ruleName);
        if (rule) {
            const minPx = obtainMeasurementWidth(rule.lower);
            const maxPx = obtainMeasurementWidth(rule.upper);
            const currentWidth = retrieveViewportWidth();
            if ((currentWidth >= minPx) && (currentWidth <= maxPx)) {
                return true;
            }
        }
        return false;
    };

    const updateBodyStyling = () => {
        let classNamesToRemove = [];
        if (countDimensionRules() > 0) {
            dimensionRules.forEach((_, name) => classNamesToRemove.push(name));
        } else {
            classNamesToRemove = [...styleLabels];
        }

        classNamesToRemove.forEach(cls => globalDocument.body.classList.remove(cls));
        if (activeDimensionLabel) {
            globalDocument.body.classList.add(activeDimensionLabel);
        }
    };

    const checkScriptedDimensions = () => {
        let foundLabel = null;
        for (let name of dimensionRules.keys()) {
            if (testSpecificRule(name)) {
                foundLabel = name;
                break;
            }
        }

        if (activeDimensionLabel !== foundLabel) {
            priorDimensionLabel = activeDimensionLabel;
            activeDimensionLabel = foundLabel;
            updateBodyStyling();
            signalDimensionChange();
        }
    };

    const checkStyledDimensions = () => {
        const currentTag = retrieveStyleLabel();
        if (currentTag && (currentTag !== activeDimensionLabel)) {
            priorDimensionLabel = activeDimensionLabel;
            activeDimensionLabel = currentTag;
            updateBodyStyling();
            signalDimensionChange();
        }
    };

    const signalDimensionChange = () => {
        dispatchCustomEvent(activeDimensionLabel + "Active");
        if (priorDimensionLabel) {
            dispatchCustomEvent(priorDimensionLabel + "Inactive");
        }
        dispatchCustomEvent("labelActivated", { current: activeDimensionLabel, previous: priorDimensionLabel });
    };

    const evaluateDimensionRules = () => {
        if (countDimensionRules() > 0) {
            checkScriptedDimensions();
        } else {
            checkStyledDimensions();
        }
    };

    const beginSizeWatch = () => {
        sizeWatchHandle = globalWindow.setInterval(checkActualSize, sizeCheckInterval);
    };

    const haltSizeWatch = () => {
        globalWindow.clearInterval(sizeWatchHandle);
    };

    const checkActualSize = () => {
        const currentHeight = obtainMeasurementHeight();
        if (currentHeight !== initialSizeReference) {
            evaluateDimensionRules();
            initialSizeReference = currentHeight;
        }
    };

    const initializeMonitoring = () => {
        createMeasurementElement();

        globalWindow.addEventListener("resize", () => {
            evaluateDimensionRules();
            dispatchCustomEvent("refreshLayout");
        });

        initialSizeReference = obtainMeasurementHeight();
        beginSizeWatch();

        evaluateDimensionRules();
        dispatchCustomEvent("refreshLayout");
    };

    globalDocument.addEventListener('DOMContentLoaded', initializeMonitoring);

    const publicInterface = {
        triggerDimensionEvaluation: evaluateDimensionRules,
        setStylingLabels: (labels) => { styleLabels = labels; },
        addDimensionRule: (name, lowerBound, upperBound) => {
            if (lowerBound === undefined) lowerBound = "0";
            if (upperBound === undefined) upperBound = "99999999px";
            dimensionRules.set(name, { lower: lowerBound, upper: upperBound });
        },
        removeDimensionRule: (name) => { dimensionRules.delete(name); },
        getCurrentLabel: () => activeDimensionLabel,
        getWindowHeight: retrieveViewportHeight,
        getWindowWidth: retrieveViewportWidth,
        getBrowserDimensions: getBrowserDimensions,
        stopFontMonitoring: haltSizeWatch,
        startFontMonitoring: beginSizeWatch
    };

    return publicInterface;

})(window, document);