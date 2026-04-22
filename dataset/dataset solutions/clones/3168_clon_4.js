const dataAcquisitionModule = require('node:fs');

const sourceContent = dataAcquisitionModule.readFileSync(0, 'utf8');
const cleanedContent = sourceContent.trim();

const barrierPos = cleanedContent.indexOf('/');
const firstComponentString = cleanedContent.substring(0, barrierPos);
const secondComponentString = cleanedContent.substring(barrierPos + 1);

const yearComponent = parseInt(firstComponentString, 10);
const monthComponent = parseInt(secondComponentString, 10);

const pivotalYear = 2019;
const pivotalMonth = 5;

const currentChronologicalValue = (yearComponent * 100) + monthComponent;
const demarcationChronologicalValue = (pivotalYear * 100) + pivotalMonth;

let outcomePhrase;
if (currentChronologicalValue >= demarcationChronologicalValue) {
    outcomePhrase = 'TBD';
} else {
    outcomePhrase = 'Heisei';
}

process.stdout.write(outcomePhrase + '\n');