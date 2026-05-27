"use strict";
var _importAll = (this && this.__importStar) || function (moduleRef) {
    if (moduleRef && moduleRef.__esModule) return moduleRef;
    var exportObj = {};
    if (moduleRef != null) {
        for (var propKey in moduleRef) {
            if (Object.prototype.hasOwnProperty.call(moduleRef, propKey)) {
                exportObj[propKey] = moduleRef[propKey];
            }
        }
    }
    exportObj["default"] = moduleRef;
    return exportObj;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fileSystem = _importAll(require("fs"));
function generateRepeatedCharOutput(sourceInputData) {
    const CHARACTER_TO_REPEAT = 'x';
    const repetitionCount = sourceInputData.length;
    let finalOutputString = CHARACTER_TO_REPEAT.repeat(repetitionCount);
    console.log(finalOutputString);
}
const stdinContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
generateRepeatedCharOutput(stdinContent);
