function parseDimensionString(rawInput) {
    const stringParts = rawInput.split(' ');
    const dimensionOne = Number(stringParts[0]);
    const dimensionTwo = Number(stringParts[1]);
    return [dimensionOne, dimensionTwo];
}

(function(rawInputString) {
    const [rectangleLength, rectangleWidth] = parseDimensionString(rawInputString);

    const PERIMETER_MULTIPLIER = 2;

    const sumOfSides = rectangleLength + rectangleWidth;

    const computedArea = rectangleLength * rectangleWidth;

    const computedPerimeter = PERIMETER_MULTIPLIER * sumOfSides;

    console.log('%s %s', computedArea, computedPerimeter);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
