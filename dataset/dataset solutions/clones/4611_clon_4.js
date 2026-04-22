const convertNumericString = (inputString) => Number(inputString);

((inputDataSegments) => {
    const initialConfiguration = inputDataSegments[0].split(' ').map(convertNumericString);
    const totalObjectCount = initialConfiguration[0];
    const maximumLoadCapacity = initialConfiguration[1];

    const availableObjectDefinitions = inputDataSegments.slice(1, totalObjectCount + 1).map(objectSpecLine => {
        const components = objectSpecLine.split(' ').map(convertNumericString);
        return { objectMass: components[0], objectValue: components[1] };
    });

    const finalAttainableWorthByMass = availableObjectDefinitions.reduce((previousStatesWorthMap, currentObject) => {
        const nextStatesWorthMap = new Map(previousStatesWorthMap);

        const currentObjectMass = currentObject.objectMass;
        const currentObjectValue = currentObject.objectValue;

        for (const [existingMass, existingWorth] of previousStatesWorthMap.entries()) {
            nextStatesWorthMap.set(
                existingMass,
                Math.max(nextStatesWorthMap.get(existingMass) || 0, existingWorth)
            );

            const potentialNewMass = existingMass + currentObjectMass;
            const potentialNewWorth = existingWorth + currentObjectValue;

            if (potentialNewMass <= maximumLoadCapacity) {
                nextStatesWorthMap.set(
                    potentialNewMass,
                    Math.max(nextStatesWorthMap.get(potentialNewMass) || 0, potentialNewWorth)
                );
            }
        }
        return nextStatesWorthMap;
    }, new Map([[0, 0]]));

    let ultimateObtainedValue = 0;
    for (const worthEntry of finalAttainableWorthByMass.values()) {
        ultimateObtainedValue = Math.max(ultimateObtainedValue, worthEntry);
    }

    console.log(ultimateObtainedValue);

})(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));