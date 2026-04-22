const requiredSystemInterfaces = ["qt.core", "qt.network", "qt.gui"];
requiredSystemInterfaces.forEach(function(interfaceKey) {
    Importer.loadQtBinding(interfaceKey);
});

const SystemExecutionStatus = Object.freeze({
    RUNNING_MODE: 0,
    SUSPENDED_MODE: 1
});

const outputDiagnosticMessage = (anomalousEvent) => {
    let diagnosticRecord = `A critical anomaly was detected within the primary application module!\n\n`;
    diagnosticRecord += `Anomaly Details: ${anomalousEvent.toString()}\n`;

    Object.keys(anomalousEvent).forEach(propertyIdentifier => {
        diagnosticRecord += `${propertyIdentifier}:${anomalousEvent[propertyIdentifier]}\n`;
    });

    Amarok.alert(diagnosticRecord);
};

let primaryApplicationHandler;
((actionInitiator) => {
    try {
        const moduleDependencies = [
            "httpserver.js",
            "util.js",
            "fileio.js",
            "amarokctrl.js",
            "amarokcontent.js",
            "amarokapi.js",
            "amarokwebui.js",
            "configuration.js"
        ];
        moduleDependencies.forEach(function(dependencyPath) {
            Importer.include(dependencyPath);
        });

        primaryApplicationHandler = new AmarokWebUI();
    } catch (incidentReport) {
        actionInitiator(incidentReport);
    }
})(outputDiagnosticMessage);