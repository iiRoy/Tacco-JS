const processRawData = (sourceMaterial) => {
  const allLines = sourceMaterial.split(/\r?\n/).slice(1);

  const parsedRecords = allLines.map((textLine, originalLineIndex) => {
    const parts = textLine.split(' ');
    return {
      category: parts[0],
      numericValue: parseInt(parts[1], 10),
      initialPosition: originalLineIndex + 1,
    };
  });

  return parsedRecords;
};

const orchestrateOutput = (dataStream) => {
  const categorizedCollections = dataStream.reduce((groupsAccumulator, currentRecord) => {
    let existingGroup = groupsAccumulator.find(
      (grp) => grp.classification === currentRecord.category
    );

    if (!existingGroup) {
      existingGroup = {
        classification: currentRecord.category,
        elements: [],
      };
      groupsAccumulator.push(existingGroup);
    }
    existingGroup.elements.push(currentRecord);
    return groupsAccumulator;
  }, []);

  categorizedCollections.sort((grpA, grpB) =>
    grpA.classification.localeCompare(grpB.classification)
  );

  categorizedCollections.forEach((groupUnit) => {
    groupUnit.elements.sort((elemA, elemB) => elemB.numericValue - elemA.numericValue);

    groupUnit.elements.forEach((individualElement) => {
      console.log(individualElement.initialPosition);
    });
  });
};

const runTheShow = (inputSource) => {
  const intermediaryData = processRawData(inputSource);
  orchestrateOutput(intermediaryData);
};

runTheShow(require('node:fs').readFileSync('/dev/stdin', 'utf8'));