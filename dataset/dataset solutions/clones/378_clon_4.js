const fileSystem = require('node:fs');
const sourceContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const contentLines = sourceContent.split('\n').filter(entry => entry.trim().length > 0);

const totalCount = Number(contentLines[0]);
const timeConfigurations = contentLines.slice(1, totalCount + 1);

const evaluatedOutcomes = timeConfigurations.map(timeSpecifier => {
    const timeSegments = timeSpecifier.match(/^(\d{1,2}):(\d{2})$/);

    const clockHours = Number(timeSegments[1]);
    const clockMinutes = Number(timeSegments[2]);

    const hourHandPosition = ((clockHours % 12) * 30) + (clockMinutes * 0.5);
    const minuteHandPosition = clockMinutes * 6;

    let angularDisparity = hourHandPosition - minuteHandPosition;
    const absoluteAngularDisparity = (angularDisparity < 0) ? -angularDisparity : angularDisparity;

    return (absoluteAngularDisparity < 30) ? "alert" :
           (absoluteAngularDisparity >= 90 && absoluteAngularDisparity <= 180) ? "safe" :
           "warning";
});

console.log(evaluatedOutcomes.join('\n'));