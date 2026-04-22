(function () {
    const dataProvider = global.require("node:fs");
    const rawInputContent = dataProvider.readFileSync("/dev/stdin", "utf8").trim();

    const lineSegments = rawInputContent.split(/\s*\n\s*/);
    const valueSequenceString = lineSegments[1];

    const numericalElements = valueSequenceString
        .split(/\s+/)
        .filter(component => component.length > 0)
        .map(component => parseInt(component, 10));

    const aggregatedXorResult = numericalElements.reduce((currentAccumulator, currentElement) => currentAccumulator ^ currentElement, 0);

    const finalOutputValues = numericalElements.map(currentElement => aggregatedXorResult ^ currentElement);

    process.stdout.write(finalOutputValues.join('\n') + '\n');
})();