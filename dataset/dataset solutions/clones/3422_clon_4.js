const initialData = require('node:fs').readFileSync(0, 'utf8');

const decisionTable = new Map([
    ['3', 'YES'],
    ['5', 'YES'],
    ['7', 'YES']
]);

const determineVerdict = (queryValue) => {
    return decisionTable.has(queryValue) ? decisionTable.get(queryValue) : 'NO';
};

console.log(determineVerdict(initialData));