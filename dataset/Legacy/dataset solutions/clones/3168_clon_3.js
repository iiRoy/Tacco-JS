const fileSystemModule = require("fs");
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const stringSegments = rawInputContent.split('/');
const numericDateParts = stringSegments.map(Number);

const currentYear = numericDateParts[0];
const currentMonth = numericDateParts[1];

const targetYearThreshold = 2019;
const targetMonthThreshold = 5;

let eraDesignation;

if (currentYear >= targetYearThreshold && currentMonth >= targetMonthThreshold) {
    eraDesignation = 'TBD';
} else {
    eraDesignation = 'Heisei';
}

console.log(eraDesignation);
