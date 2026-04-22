const sequenceOfEmissions = [
  { content: '\n', destination: 'err', applyDebugPrefix: false },
  { content: 'Yes', destination: 'out', applyDebugPrefix: false },
  { content: 4, destination: 'out', applyDebugPrefix: false },
  { content: '3 1 2 3', destination: 'out', applyDebugPrefix: false },
  { content: '3 1 4 5', destination: 'out', applyDebugPrefix: false },
  { content: '3 2 5 6', destination: 'out', applyDebugPrefix: false },
  { content: '3 3 4 6', destination: 'out', applyDebugPrefix: false }
];

const dispatchMessage = (data, channel, usePrefix) => {
  let formattedData = data;
  if (channel === 'err' && usePrefix) {
    formattedData = "debug:" + data;
  }

  if (channel === 'out') {
    console.log(formattedData);
  } else if (channel === 'err') {
    console.error(formattedData);
  }
};

(function executeProgramCore() {
  const initialDirective = sequenceOfEmissions[0];
  dispatchMessage(initialDirective.content, initialDirective.destination, initialDirective.applyDebugPrefix);

  const startMoment = Date.now();
  
  sequenceOfEmissions.slice(1).forEach(instruction => {
    dispatchMessage(instruction.content, instruction.destination, instruction.applyDebugPrefix);
  });

  const endMoment = Date.now();
  const elapsedMillis = endMoment - startMoment;

  const currentMemoryStats = process.memoryUsage();
  const heapTotalKB = Math.round(currentMemoryStats.heapTotal / 1024);

  dispatchMessage("time : " + elapsedMillis + "ms", 'err', true);
  dispatchMessage("memory : " + heapTotalKB + "KB", 'err', true);
})();