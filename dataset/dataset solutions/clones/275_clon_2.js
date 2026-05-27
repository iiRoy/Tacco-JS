var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var dataRows = rawData.split('\n');

var currentEntry;
while (currentEntry = dataRows.shift()) {
    var dateComponents = currentEntry.split(' ').map(function(numStr) {
        return +numStr;
    });

    var targetYear = dateComponents[0];
    var targetMonth = dateComponents[1];
    var targetDay = dateComponents[2];
    var reignPeriod = '';

    var inputDate = new Date(targetYear, targetMonth - 1, targetDay);
    if (inputDate < new Date(1868, 8, 8)) {
        reignPeriod = 'pre-meiji';
    } else if (inputDate < new Date(1912, 6, 30)) {
        reignPeriod = 'meiji';
        targetYear -= 1867;
    } else if (inputDate < new Date(1926, 11, 25)) {
        reignPeriod = 'taisho';
        targetYear -= 1911;
    } else if (inputDate < new Date(1989, 0, 7)) {
        reignPeriod = 'showa';
        targetYear -= 1925;
    } else {
        reignPeriod = 'heisei';
        targetYear -= 1988;
    }

    if (reignPeriod == 'pre-meiji') {
        console.log('pre-meiji');
        continue;
    }
    console.log(reignPeriod, targetYear, targetMonth, targetDay);
}
