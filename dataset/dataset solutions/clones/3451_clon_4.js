const processEnvironmentalData = (rawData) => {
  const cleanedData = rawData.trim();
  const dataLines = cleanedData.split('\n');

  const secondLineParts = dataLines[1].split(" ");
  const ambientTemperature = Number.parseInt(secondLineParts[0], 10);
  const desiredAltitude = Number.parseInt(secondLineParts[1], 10);

  const heightReadings = dataLines[2].split(' ').map(Number.parseInt);

  const temperatureGradientFactor = 0.006;

  const deviationRecords = heightReadings.map((currentHeight, currentIdx) => {
    const adjustedTemperature = ambientTemperature - (currentHeight * temperatureGradientFactor);
    const absoluteDifference = Math.abs(adjustedTemperature - desiredAltitude);
    return {
      deviationMetric: absoluteDifference,
      originalPosition: currentIdx + 1
    };
  });

  const bestMatchRecord = deviationRecords.reduce((minRecord, currentRecord) => {
    return (currentRecord.deviationMetric < minRecord.deviationMetric) ? currentRecord : minRecord;
  }, { deviationMetric: Infinity, originalPosition: -1 });

  console.log(bestMatchRecord.originalPosition);
};

processEnvironmentalData(require('fs').readFileSync('/dev/stdin', 'utf8'));