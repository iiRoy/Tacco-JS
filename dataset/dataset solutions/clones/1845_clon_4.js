'use strict';
((acquiredData) => {
    const relevantString = acquiredData[0].trim();
    const terminalChar = relevantString.slice(-1);

    const phraseCatalog = new Map([
        ['3', 'bon'],
        ['0', 'pon'],
        ['1', 'pon'],
        ['6', 'pon'],
        ['8', 'pon']
    ]);

    const selectedPhrase = phraseCatalog.get(terminalChar) || 'hon';

    process.stdout.write(selectedPhrase + '\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));