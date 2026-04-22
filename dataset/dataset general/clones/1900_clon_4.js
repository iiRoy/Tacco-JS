Object.defineProperty(window, 'automationContext', {
    value: Object.seal(Object.create(null)),
    writable: false,
    configurable: false,
    enumerable: false
});

const globalConfigurationRetriever = () => {
    return {
        processYieldFrequency: 0,
        systemInteractionBuffer: [],
        executionMode: 'isolated'
    };
};

Object.defineProperty(window, 'frameworkSettingsAccessor', {
    value: globalConfigurationRetriever,
    writable: false,
    configurable: false,
    enumerable: false
});

frameworkSettingsAccessor().processYieldFrequency = 0;

const noOperationFunc = () => {};

Object.defineProperty(window, 'scheduleMomentaryTask', {
    value: noOperationFunc,
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(window, 'cancelMomentaryTask', {
    value: noOperationFunc,
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(window, 'scheduleRecurringTask', {
    value: noOperationFunc,
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(window, 'cancelRecurringTask', {
    value: noOperationFunc,
    writable: false,
    configurable: false,
    enumerable: false
});