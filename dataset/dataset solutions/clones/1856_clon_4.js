"use strict";

const parseNumericValues = (textLine) => textLine.match(/\d+/g).map(Number);

const calculateHourHandAngleInRadians = (currentHour, currentMinute) => {
    const normalizedHour = currentHour % 12;
    const totalHoursFraction = normalizedHour + (currentMinute / 60);
    return totalHoursFraction * (Math.PI / 6);
};

const calculateMinuteHandAngleInRadians = (currentMinute) => {
    return currentMinute * (Math.PI / 30);
};

((sourceTextContent) => {
    const [armLengthA, armLengthB, clockHour, clockMinute] = parseNumericValues(sourceTextContent.split('\n')[0]);

    const hourHandPositionRad = calculateHourHandAngleInRadians(clockHour, clockMinute);
    const minuteHandPositionRad = calculateMinuteHandAngleInRadians(clockMinute);

    let angleBetweenHands = Math.abs(hourHandPositionRad - minuteHandPositionRad);
    
    if (angleBetweenHands > Math.PI) {
        angleBetweenHands = 2 * Math.PI - angleBetweenHands;
    }

    const squaredResult = armLengthA * armLengthA + armLengthB * armLengthB - 2 * armLengthA * armLengthB * Math.cos(angleBetweenHands);

    console.log(Math.sqrt(squaredResult));
})(require("fs").readFileSync("/dev/stdin", "utf8"));
