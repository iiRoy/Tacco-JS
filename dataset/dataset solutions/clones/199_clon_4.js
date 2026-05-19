const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const bloodTypeTallies = fileContent.trim().split('\n').reduce((tallyMap, currentEntry) => {
    if (!currentEntry) {
        return tallyMap;
    }
    const entryComponents = currentEntry.split(',');
    if (entryComponents.length < 2) {
        return tallyMap;
    }
    const bloodGroup = entryComponents[1];

    if (Object.prototype.hasOwnProperty.call(tallyMap, bloodGroup)) {
        tallyMap[bloodGroup]++;
    }
    return tallyMap;
}, { A: 0, B: 0, AB: 0, O: 0 });

console.log(bloodTypeTallies.A);
console.log(bloodTypeTallies.B);
console.log(bloodTypeTallies.AB);
console.log(bloodTypeTallies.O);
