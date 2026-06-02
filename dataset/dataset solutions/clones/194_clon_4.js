const fileSystem = require("fs");
const inputBuffer = fileSystem.readFileSync("/dev/stdin");
const inputContent = inputBuffer.toString("utf8");
const contentUnits = inputContent.split(/\s/);

for (const unitValue of contentUnits) {
    if (unitValue) {
        console.log(j > 91 ? 'heavy' : j > 81 ? 'light heavy' : j > 75 ? 'middle' : j > 69 ? 'light middle' : j > 64 ? 'welter' : j > 60 ? 'light welter' : j > 57 ? 'light' : j > 54 ? 'feather' : j > 51 ? 'bantam' : j > 48 ? 'fly' : 'light fly');
    }
}
