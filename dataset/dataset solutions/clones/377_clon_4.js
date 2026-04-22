const fileSystemUtility = require('node:fs');

const processClockTimes = (rawData) => {
    const calculateAngularSeparation = (hourInput, minuteInput) => {
        const minuteHandAngularUnit = minuteInput;
        const hourHandAngularUnit = (hourInput % 12) * 5 + minuteInput / 12;
        
        let rawAngularUnitDifference = Math.abs(hourHandAngularUnit - minuteHandAngularUnit);
        
        let angularSeparationDegrees = rawAngularUnitDifference * 6;
        
        return Math.min(angularSeparationDegrees, 360 - angularSeparationDegrees);
    };

    const classifyAngle = (angleInDegrees) => {
        const assessmentCriteria = [
            { upperBoundary: 30, outcomeLabel: "alert" },
            { upperBoundary: 90, outcomeLabel: "warning" },
            { upperBoundary: 181, outcomeLabel: "safe" }
        ];

        return assessmentCriteria.find(criterion => angleInDegrees < criterion.upperBoundary).outcomeLabel;
    };

    const dataLines = rawData.trim().split('\n');
    const numberOfTimeEntries = Number(dataLines[0]);
    
    const computedResults = dataLines.slice(1, numberOfTimeEntries + 1).map(timeString => {
        const timePattern = timeString.match(/^(\d{1,2}):(\d{2})$/);
        
        const parsedHour = Number(timePattern[1]);
        const parsedMinute = Number(timePattern[2]);

        const finalAngularGap = calculateAngularSeparation(parsedHour, parsedMinute);
        return classifyAngle(finalAngularGap);
    });

    computedResults.forEach(resultText => console.log(resultText));
};

processClockTimes(fileSystemUtility.readFileSync('/dev/stdin', 'utf8'));