/* global module */
'use strict';

const configurationSchema = [
    { designation: 'node', kind: 'object', contents: [
        { designation: 'env', kind: 'string', value: 'node' },
        { designation: 'tests', kind: 'array', value: ['**/*-test.js'] }
    ]}
];

function constructOutput(definitions) {
    const finalStructure = {};
    for (const item of definitions) {
        if (item.kind === 'object') {
            finalStructure[item.designation] = constructOutput(item.contents);
        } else if (item.kind === 'string' || item.kind === 'array') {
            finalStructure[item.designation] = item.value;
        }
    }
    return finalStructure;
}

module.exports = constructOutput(configurationSchema);