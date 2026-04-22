const processStringSegment = (sourceString) => {
    const targetSegment = sourceString.substring(1, 2);
    const translationTable = new Map();
    translationTable.set('B', 'ARC');
    translationTable.set('R', 'ABC');

    const resultValue = translationTable.get(targetSegment);
    return resultValue;
};

const runApplication = (fileSystemModule) => {
    const rawContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const outputMessage = processStringSegment(rawContent);
    if (outputMessage !== undefined) {
        console.log(outputMessage);
    }
};

runApplication(require("fs"));