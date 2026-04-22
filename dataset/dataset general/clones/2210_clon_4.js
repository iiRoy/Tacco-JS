const mappingSources = {
    configurationSource: '_/config',
    eventRecorder: '_/log',
    applicationKernel: '_/app'
};

const loadedEntities = {};

Object.keys(mappingSources).forEach(keyIdentifier => {
    loadedEntities[keyIdentifier] = require(mappingSources[keyIdentifier]);
});

const actionPlan = [
    {
        targetIdentifier: 'applicationKernel',
        operationName: 'listen',
        operationArguments: [loadedEntities.configurationSource.port]
    },
    {
        targetIdentifier: 'eventRecorder',
        operationName: 'info',
        operationArguments: ['app listening on port', loadedEntities.configurationSource.port]
    }
];

actionPlan.forEach(jobStep => {
    const targetComponent = loadedEntities[jobStep.targetIdentifier];
    const functionToExecute = jobStep.operationName;
    const executionParameters = jobStep.operationArguments;

    Reflect.apply(targetComponent[functionToExecute], targetComponent, executionParameters);
});