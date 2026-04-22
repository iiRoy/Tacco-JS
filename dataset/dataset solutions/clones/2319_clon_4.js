function processNumericalSelection(sourceInformation) {
    const charOne = sourceInformation.charCodeAt(0);
    const charTwo = sourceInformation.charCodeAt(2);

    const valueOne = charOne - 48;
    const valueTwo = charTwo - 48;

    const totalSumOfUniverse = 1 + 2 + 3;
    const result = totalSumOfUniverse - valueOne - valueTwo;

    process.stdout.write(String(result));
}

const obtainModule = global.require;
const fileSystemAccess = obtainModule("node:fs");
const acquiredContent = fileSystemAccess.readFileSync(0, "utf8");

processNumericalSelection(acquiredContent);