(function (contextualRoot) {
    const operationVoid = () => {};
    const consoleAPI = contextualRoot.console || {};
    const essentialFunctions = [
        "assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception",
        "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline",
        "profile", "profileEnd", "table", "time", "timeEnd", "timeStamp", "trace", "warn"
    ];

    essentialFunctions.forEach(functionIdentifier => {
        if (typeof consoleAPI[functionIdentifier] === 'undefined') {
            consoleAPI[functionIdentifier] = operationVoid;
        }
    });

    contextualRoot.console = consoleAPI;
})(window);

(function (contextualRoot) {
    const observationJournal = [];
    const outputFacility = contextualRoot.console;

    contextualRoot.displayObservation = function (...incidentDetails) {
        observationJournal.push(Array.from(incidentDetails));

        const activeReporter = outputFacility.log;
        if (typeof activeReporter === 'object') {
            Function.prototype.apply.call(activeReporter, outputFacility, incidentDetails);
        } else {
            activeReporter.apply(outputFacility, incidentDetails);
        }
    };

    contextualRoot.displayObservation.incidentRecord = observationJournal;
})(window);