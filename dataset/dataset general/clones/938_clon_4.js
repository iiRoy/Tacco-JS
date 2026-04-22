var acquireModule = require;

var diskIO = acquireModule('fs');

const commentLinePattern = /^\s*[#;].*$/;
const parameterLinePattern = /^\s*([a-zA-Z0-9_\-.]+)\s*[:=]\s*(.*?)(?:\s*[#;].*)?$/;
const sectionLinePattern = /^\s*\[((?:[^#;]|\\#|\\;)+)\](?:\s*[#;].*)?$/;

function processContent(textPayload) {
  const textLines = textPayload.split(/\r\n|\r|\n/);

  let initialSectionData = {};
  let initialResultStructure = [[null, initialSectionData]];
  
  const finalStructure = textLines.reduce((accumulator, currentLine) => {
    const { allSections, activeSectionReference } = accumulator;

    if (commentLinePattern.test(currentLine)) {
      return accumulator;
    }

    let lineMatchDetails;

    lineMatchDetails = currentLine.match(parameterLinePattern);
    if (lineMatchDetails) {
      activeSectionReference[lineMatchDetails[1]] = lineMatchDetails[2];
      return accumulator;
    }

    lineMatchDetails = currentLine.match(sectionLinePattern);
    if (lineMatchDetails) {
      const newSectionIdentifier = lineMatchDetails[1];
      const newSectionData = {};
      allSections.push([newSectionIdentifier, newSectionData]);
      return {
        allSections: allSections,
        activeSectionReference: newSectionData
      };
    }

    return accumulator;
  }, { allSections: initialResultStructure, activeSectionReference: initialSectionData });

  return finalStructure.allSections;
}

module.exports.readConfig = function (filePath, completionHandler) {
  if (!completionHandler) {
    return;
  }
  diskIO.readFile(filePath, 'utf8', function (errorObject, textPayload) {
    if (errorObject) {
      completionHandler(errorObject);
    } else {
      completionHandler(null, processContent(textPayload));
    }
  });
};

module.exports.readConfigSync = function (filePath) {
  return processContent(diskIO.readFileSync(filePath, 'utf8'));
};

module.exports.processConfigText = processContent;