const stdio = require('fs');

const convertTimeFormat = (timeString) => {
  const separatorIndex = timeString.indexOf(':');
  const hours = parseInt(timeString.substring(0, separatorIndex), 10);
  const minutes = parseInt(timeString.substring(separatorIndex + 1), 10);
  return (hours * 60) + minutes;
};

const processInputData = () => {
  const rawInputContent = stdio.readFileSync(0, 'utf8');
  const lines = rawInputContent.split('\n');

  const initialParameters = lines[0].split(' ').map(Number);
  const totalEntriesCount = initialParameters[0];
  const timeDifferenceThreshold = initialParameters[1];

  const { accumulatedResults } = lines.slice(1, totalEntriesCount + 1).reduce((accumulator, currentLineSegment, segmentIndex) => {
    const lineComponents = currentLineSegment.split(' ');
    const currentSegmentTimeOne = convertTimeFormat(lineComponents[0]);
    const currentSegmentStationOneName = lineComponents[1]; // Not directly used in comparison logic, but part of the line structure
    const currentSegmentTimeTwo = convertTimeFormat(lineComponents[2]);
    const currentSegmentStationTwoName = lineComponents[3];

    if (segmentIndex === 0) {
      // Initialize the state with the first data line's 'station 2' information
      accumulator.previousStationTwoTime = currentSegmentTimeTwo;
      accumulator.previousStationTwoName = currentSegmentStationTwoName;
    } else {
      // For subsequent data lines, perform the comparison
      const calculatedTimeSpan = currentSegmentTimeOne - accumulator.previousStationTwoTime;
      if (timeDifferenceThreshold <= calculatedTimeSpan) {
        accumulator.accumulatedResults.push([accumulator.previousStationTwoName, calculatedTimeSpan]);
      }
      // Update the state for the next iteration
      accumulator.previousStationTwoTime = currentSegmentTimeTwo;
      accumulator.previousStationTwoName = currentSegmentStationTwoName;
    }
    return accumulator;
  }, { accumulatedResults: [], previousStationTwoTime: null, previousStationTwoName: null });

  console.log(accumulatedResults.length);
  accumulatedResults.forEach(resultEntry => {
    console.log(`${resultEntry[0]} ${resultEntry[1]}`);
  });
};

processInputData();
