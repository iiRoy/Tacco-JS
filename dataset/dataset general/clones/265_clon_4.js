new Promise(function(executeTask, abandonTask) {
    // This promise's executor runs immediately.
    // Since 'executeTask' and 'abandonTask' are never called,
    // and no .then() or .catch() handlers are attached,
    // this construct has no observable side effects.
    // It creates an object that is eventually garbage-collected.
});