const fileSystemAccess = require("node:fs");
const inputData = fileSystemAccess.readFileSync(0, "utf8");

const processedValue = Number(inputData);

const eveConditions = new Set([22, 23, 24]);
const printConditions = new Set([22, 23, 24, 25]);

let holidaySuffix = "";
if (eveConditions.has(processedValue)) {
    holidaySuffix = " Eve";
}

if (printConditions.has(processedValue)) {
    process.stdout.write("Christmas" + holidaySuffix + "\n");
}