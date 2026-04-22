const COMPLETION_TAG_IDENTIFIER = 'inspection.finished';

const processReportEntries = (incomingIssues) => {
    return incomingIssues.map(item => ({
        category: item.rule,
        description: item.message
    }));
};

const transmitNotification = (...detailsPayload) => {
    let currentPayload = [...detailsPayload];

    if (currentPayload[0] === COMPLETION_TAG_IDENTIFIER) {
        currentPayload[1] = processReportEntries(currentPayload[1]);
    }
    window.alert(JSON.stringify(currentPayload));
};

const handleInspectionCompletion = (inspectionFailures) => {
    transmitNotification(COMPLETION_TAG_IDENTIFIER, inspectionFailures);
};

window.HTMLInspector.inspect({
    onComplete: handleInspectionCompletion
});