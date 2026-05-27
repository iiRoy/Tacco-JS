function processInput(rawData) {
    const firstLineOfInput = rawData[0];
    
    const stringComponents = firstLineOfInput.split(' ');
    
    const numericValues = stringComponents.map(strVal => parseInt(strVal, 10));

    const firstHour = numericValues[0];
    const firstMinute = numericValues[1];
    const secondHour = numericValues[2];
    const secondMinute = numericValues[3];
    const adjustmentFactor = numericValues[4];

    const minutesPerHour = 60;
    
    const hourDifferenceInMinutes = (firstHour - secondHour) * minutesPerHour;
    const minuteDifference = secondMinute - firstMinute;
    
    const combinedTimeDifference = hourDifferenceInMinutes + minuteDifference;
    
    const finalCalculatedValue = combinedTimeDifference - adjustmentFactor;
    
    console.log(finalCalculatedValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'));
