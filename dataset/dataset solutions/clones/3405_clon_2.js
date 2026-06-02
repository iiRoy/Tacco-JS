const fileSystemModule = require("fs");

const dayInput = fileSystemModule.readFileSync("/dev/stdin", "utf8");

let holidaySuffix = "";

if (dayInput == 24) {
    holidaySuffix = " Eve";
} else {
    holidaySuffix = "";
}

if (dayInput == 23) {
    holidaySuffix += " Eve";
}

if (dayInput == 22) {
    holidaySuffix += " Eve";
}

const isRelevantDay = dayInput.match(/25|24|23|22/);

if (isRelevantDay) {
    console.log("Christmas" + holidaySuffix);
}
