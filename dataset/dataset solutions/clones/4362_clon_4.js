const processInput = (textData) => {
    const pattern = /^(9|.?9)/;
    const matchResult = textData.match(pattern);
    const truthValue = !!matchResult;
    const responseProvider = new Map([
        [true, "Yes\n"],
        [false, "No\n"]
    ]);
    return responseProvider.get(truthValue);
};

const fileSystem = require('node:fs');
const standardInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

process.stdout.write(processInput(standardInput));