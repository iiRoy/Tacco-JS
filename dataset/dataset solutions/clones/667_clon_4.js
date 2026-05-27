const rli = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

async function* inputLineStream() {
  for await (const line of rli) {
    yield line;
  }
}

const lineProvider = inputLineStream();

const aggregateNumbers = async (countRemaining, currentAccumulation) => {
  if (countRemaining === 0) {
    return currentAccumulation;
  }

  const nextEntry = await lineProvider.next();
  const numericValue = Number(nextEntry.value);

  return aggregateNumbers(countRemaining - 1, currentAccumulation + numericValue);
};

const orchestrateProcessing = async () => {
  const controlEntry = await lineProvider.next();

  if (controlEntry.done) {
    rli.close();
    return;
  }

  const controlValue = Number(controlEntry.value);

  if (controlValue === 0) {
    rli.close();
    return;
  }

  const segmentSize = Math.floor(controlValue / 4);

  const segmentTotal = await aggregateNumbers(segmentSize, 0);

  console.log(segmentTotal);

  await orchestrateProcessing();
};

orchestrateProcessing();
