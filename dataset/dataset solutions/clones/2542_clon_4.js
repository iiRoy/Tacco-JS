const acquireInputData = (sourceContent) => {
    const rawLines = sourceContent.match(/[^\r\n]+/g);
    const initialLine = rawLines[0];
    const numericalComponents = initialLine.split(/\s+/).filter(Boolean).map(val => parseInt(val, 10));

    return {
        extentY: numericalComponents[0],
        extentX: numericalComponents[1],
        boundaryX: numericalComponents[2],
        boundaryY: numericalComponents[3]
    };
};

const constructGrid = (configuration) => {
    const { extentY, extentX, boundaryX, boundaryY } = configuration;

    const generatedRows = Array.from({ length: extentY }, (_, currentY) => {
        const isAboveBoundaryY = (currentY < boundaryY);
        return Array.from({ length: extentX }, (_, currentX) => {
            const isLeftOfBoundaryX = (currentX < boundaryX);
            return (isAboveBoundaryY ^ isLeftOfBoundaryX) ? '1' : '0';
        });
    });

    return generatedRows.map(rowSegment => rowSegment.join('')).join('\n');
};

const executeProgram = () => {
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    const parsedConfiguration = acquireInputData(fileContents);
    return constructGrid(parsedConfiguration);
};

console.log(executeProgram());