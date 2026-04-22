function createAbbreviation(inputSource) {
    const refinedContent = inputSource.replace(/^\s+|\s+$/g, '');

    let componentList = [];
    let currentSegment = '';
    for (const charElement of refinedContent) {
        if (charElement === ' ') {
            componentList.push(currentSegment);
            currentSegment = '';
        } else {
            currentSegment += charElement;
        }
    }
    componentList.push(currentSegment);

    const selectedComponents = [
        componentList[0],
        componentList[1],
        componentList[2]
    ];

    let constructedAcronym = '';

    for (let componentIndex = 0; componentIndex < 3; componentIndex++) {
        const currentComponent = selectedComponents[componentIndex];
        constructedAcronym += currentComponent.charAt(0).toUpperCase();
    }
    console.log(constructedAcronym);
}

createAbbreviation(require("fs").readFileSync("/dev/stdin", "utf8"));