const processGeometricConfiguration = (dataPayload) => {
    const inputComponents = dataPayload.split(" ");
    const containerDimensionX = Number(inputComponents[0]);
    const containerDimensionY = Number(inputComponents[1]);
    const pointCoordX = Number(inputComponents[2]);
    const pointCoordY = Number(inputComponents[3]);

    let maximumComponentArea = 0;
    let numberOfSplits = 0;

    const totalContainerArea = containerDimensionX * containerDimensionY;

    const transformationRules = [
        {
            test: () => pointCoordX === containerDimensionX / 2 && pointCoordY === containerDimensionY / 2,
            execute: () => {
                maximumComponentArea = totalContainerArea / 2;
                numberOfSplits = 1;
            }
        },
        {
            test: () => pointCoordX === containerDimensionX || pointCoordY === containerDimensionY ||
                        pointCoordX === containerDimensionX / 2 || pointCoordY === containerDimensionY / 2,
            execute: () => {
                maximumComponentArea = totalContainerArea / 2;
            }
        },
        {
            test: () => (pointCoordX / pointCoordY) === (containerDimensionX / containerDimensionY) ||
                        ((pointCoordX / pointCoordY) * pointCoordX + pointCoordY) === containerDimensionY,
            execute: () => {
                maximumComponentArea = totalContainerArea / 2;
                numberOfSplits = 1;
            }
        },
        {
            test: () => true,
            execute: () => {
                const intersectionPointXatTop = (pointCoordY / pointCoordX) * containerDimensionY;
                const intersectionPointYatRight = (pointCoordX / pointCoordY) * containerDimensionX;

                let areaCorrectionValue = 0;

                if (intersectionPointXatTop < containerDimensionX) {
                    areaCorrectionValue = (pointCoordX - intersectionPointXatTop) * (containerDimensionY - pointCoordY);
                } else if (intersectionPointYatRight < containerDimensionY) {
                    areaCorrectionValue = (containerDimensionX - pointCoordX) * (pointCoordY - intersectionPointYatRight);
                }

                const firstCalculatedPortion = (containerDimensionX - pointCoordX) * (containerDimensionY - pointCoordY) / 2 +
                                               (pointCoordX * pointCoordY) + areaCorrectionValue;

                const secondCalculatedPortion = totalContainerArea - firstCalculatedPortion;

                maximumComponentArea = Math.max(firstCalculatedPortion, secondCalculatedPortion);
            }
        }
    ];

    for (const rule of transformationRules) {
        if (rule.test()) {
            rule.execute();
            break;
        }
    }

    const finalDisplayedArea = totalContainerArea - maximumComponentArea;

    console.log(finalDisplayedArea + ' ' + numberOfSplits);
};

processGeometricConfiguration(require("fs").readFileSync("/dev/stdin", "utf8"));