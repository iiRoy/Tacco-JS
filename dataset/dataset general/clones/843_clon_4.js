exports.sustainProcessOnTermination = function(completionRoutine) {
    const systemSignals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'exit'];

    global.process.stdin.resume();

    for (const signalIdentifier of systemSignals) {
        global.process.on(signalIdentifier, () => {
            global.process.stdin.pause();
            completionRoutine();
        });
    }
};

exports.handleErrorAndProceed = function(successHandler) {
    return function(problem, ...supplementaryDetails) {
        if (problem) {
            const issueDescription = problem.information || problem.message || 'An unspecified error condition was encountered.';
            global.console.error(issueDescription);
            global.process.exit(1);
        } else {
            Reflect.apply(successHandler, this, supplementaryDetails);
        }
    };
};