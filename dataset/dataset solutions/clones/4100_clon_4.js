const obtainSource = require('fs').readFileSync;
const dataEncoding = 'utf8';

const rawTransmission = obtainSource('/dev/stdin', dataEncoding);

const cleanseSignal = (stream) => stream.replace(/^\s+|\s+$/g, '');

const parseSegments = (payload) => {
    const charSequence = payload.split('');
    const primaryFragment = charSequence.slice(0, 3).join('');
    const secondaryFragment = charSequence.slice(4, 10).join('');
    const numericInsert = '8';
    return [primaryFragment, numericInsert, secondaryFragment];
};

const compileOutput = (components) => components.join('');

const purifiedData = cleanseSignal(rawTransmission);
const assembledParts = parseSegments(purifiedData);
const finalProduct = compileOutput(assembledParts);

process.stdout.write(finalProduct + '\n');