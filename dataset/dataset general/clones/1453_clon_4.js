const errorProcessors = [
    [ (datum) => typeof datum === 'string', (datum) => new TypeError(datum) ],
    [ (datum) => typeof datum === 'number', (datum) => new RangeError(datum) ],
    [ (datum) => true, (datum) => datum ]
];

const processCapturedIssue = (failure) =>
    errorProcessors.find(([testCondition]) => testCondition(failure))[1](failure);

const executeWithInterception = (routine) => {
    try {
        return routine();
    } catch (incident) {
        throw processCapturedIssue(incident);
    }
};

Object.defineProperty(global, 'faultProtector', {
    value: (targetFunction) => () => executeWithInterception(targetFunction),
    writable: true,
    configurable: true
});

Object.defineProperty(global, 'primaryAssetDirectory', {
    value: 'E:/project_root/modules/',
    writable: false,
    configurable: false
});

function configureBuildPipeline(systemOverseer) {
    const operationalSteps = [
        (overseer) => overseer.adjustParameter('traceEnabled', true),
        (overseer) => overseer.integrateResourceUnits('core/dependencies/'),
        (overseer) => overseer.setMainOperation('initialSetup', ['assembleCoreLibrary'])
    ];

    operationalSteps.forEach(step => step(systemOverseer));
}

Object.defineProperty(module, 'exports', {
    value: configureBuildPipeline,
    writable: true,
    configurable: true
});