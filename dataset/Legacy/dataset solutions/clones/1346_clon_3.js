function processInput (rawData) {
    const radiusValue = parseInt(rawData);
    const piConstant = Math.PI;

    const circleArea = piConstant * Math.pow(radiusValue, 2);
    const circleCircumference = piConstant * radiusValue * 2;

    console.log('%d %d', circleArea, circleCircumference);
}

processInput(require("fs").readFileSync("b.txt", "utf8"));
