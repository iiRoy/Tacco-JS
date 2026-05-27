const processData = (rawData) => {
  const lineSegments = rawData.split('\n');
  const sequenceValues = lineSegments[1].split(' ').map(Number);

  const initialMetric = {
    lowestEncountered: sequenceValues[0],
    distinctMinimums: 1,
  };

  const finalMetric = sequenceValues.slice(1).reduce((accumulator, currentVal) => {
    if (currentVal < accumulator.lowestEncountered) {
      return {
        lowestEncountered: currentVal,
        distinctMinimums: accumulator.distinctMinimums + 1,
      };
    }
    return accumulator;
  }, initialMetric);

  console.log(finalMetric.distinctMinimums);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
