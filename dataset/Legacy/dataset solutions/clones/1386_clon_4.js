const fileSystemModule = require('fs');
const sourceData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputRecords = sourceData.split('\n');

inputRecords
    .map((recordEntry, idx) => {
        const sequenceNumber = idx + 1;
        return `Case ${sequenceNumber}: ${recordEntry}`;
    })
    .forEach(formattedOutput => console.log(formattedOutput));
