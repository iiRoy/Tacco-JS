const processInput = (textData) => {
    let currentSegment = '';
    const dateComponents = [];
    for (let charIndex = 0; charIndex < textData.length; charIndex++) {
        const character = textData[charIndex];
        if (character === '/') {
            dateComponents.push(parseInt(currentSegment, 10));
            currentSegment = '';
        } else {
            currentSegment += character;
        }
    }
    dateComponents.push(parseInt(currentSegment, 10));

    const [yearVal, monthVal, dayVal] = dateComponents;

    const combinedDateValue = yearVal * 10000 + monthVal * 100 + dayVal;

    const referencePoint = 20190501;

    const isBeforeEraChange = combinedDateValue < referencePoint;

    const eraNames = {
        true: 'Heisei',
        false: 'TBD'
    };

    console.log(eraNames[isBeforeEraChange]);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));