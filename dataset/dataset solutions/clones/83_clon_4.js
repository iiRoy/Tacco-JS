const systemInput = globalThis.process.stdin;
const systemOutput = globalThis.console;

async function performOperation() {
  const accumulatedFragments = [];

  for await (const receivedUnit of systemInput) {
    accumulatedFragments.push(receivedUnit);
  }

  const completePayload = Buffer.concat(accumulatedFragments);
  const rawText = completePayload.toString('utf8');
  const transformedText = rawText.toLocaleUpperCase();

  systemOutput.log(transformedText);
}

performOperation();