process.stdin.setEncoding("utf8");
process.stdin.on("data", (dataLine) => {
    const outcome = acquireInput(dataLine);
    console.log(outcome);
});

const acquireInput = (textLine) => {
    const numericTokens = textLine.split(" ");
    const lengthOne = parseFloat(numericTokens[0]);
    const lengthTwo = parseFloat(numericTokens[1]);
    const timeHour = parseFloat(numericTokens[2]);
    const timeMinute = parseFloat(numericTokens[3]);
    return measureTipSpan(lengthOne, lengthTwo, timeHour, timeMinute);
};

const measureTipSpan = (handOneLen, handTwoLen, currentHour, currentMinute) => {
    const PI_VAL = Math.PI;
    const DEGREES_TO_RADIANS_FACTOR = PI_VAL / 180.0;

    // Determine the angular position of the minute indicator from the 12-o'clock mark (clockwise in degrees)
    const minuteIndicatorAngleDegreesClockwise = currentMinute * 6; // 360 degrees / 60 minutes

    // Determine the angular position of the hour indicator from the 12-o'clock mark (clockwise in degrees)
    const hourIndicatorAngleDegreesClockwise = ((currentHour % 12) + (currentMinute / 60)) * 30; // 360 degrees / 12 hours

    // Convert these angles to standard Cartesian system (counter-clockwise from positive X-axis, where 3-o'clock is positive X)
    // 12-o'clock is at 90 degrees (positive Y-axis) in Cartesian system
    const minuteIndicatorAngleRadians = (90 - minuteIndicatorAngleDegreesClockwise) * DEGREES_TO_RADIANS_FACTOR;
    const hourIndicatorAngleRadians = (90 - hourIndicatorAngleDegreesClockwise) * DEGREES_TO_RADIANS_FACTOR;

    // Calculate the Cartesian coordinates for the tip of each hand
    // Hand One (length `handOneLen`) corresponds to the hour hand
    const xCoordTipOne = handOneLen * Math.cos(hourIndicatorAngleRadians);
    const yCoordTipOne = handOneLen * Math.sin(hourIndicatorAngleRadians);

    // Hand Two (length `handTwoLen`) corresponds to the minute hand
    const xCoordTipTwo = handTwoLen * Math.cos(minuteIndicatorAngleRadians);
    const yCoordTipTwo = handTwoLen * Math.sin(minuteIndicatorAngleRadians);

    // Compute the Euclidean distance between the two tips
    const deltaX = xCoordTipOne - xCoordTipTwo;
    const deltaY = yCoordTipOne - yCoordTipTwo;

    const finalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return finalDistance;
};