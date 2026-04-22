const operationalState = false;

const showOutcome = function (content) {
    console.log(content);
};

const obtainSimulationData = function () {
    return '431 321';
};

const obtainLiveData = function (messageForUser) {
    if (messageForUser) {
        showOutcome(messageForUser);
    }
    const processExecutor = require('node:child_process');
    return processExecutor.execSync('cat /dev/stdin', { encoding: 'utf8' });
};

const acquireSource = operationalState ? obtainSimulationData : obtainLiveData;

const rawDataString = acquireSource();

const stringNumbers = rawDataString.match(/\d+/g);

const numericalSequence = Array.from(stringNumbers, value => Number(value));

const firstElement = numericalSequence[0];
const secondElement = numericalSequence[1];

const remainderValue = firstElement - Math.floor(firstElement / secondElement) * secondElement;

const isZeroRemainder = !Boolean(remainderValue);

const finalResult = (Number(isZeroRemainder) * -1) + ((1 - Number(isZeroRemainder)) * firstElement);

showOutcome(finalResult);