async function processInputAndCompute() {
  let collectedInput = '';

  const inputPromise = new Promise((resolve, reject) => {
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (inputChunk) => {
      collectedInput += inputChunk;
    });

    process.stdin.on('end', () => {
      resolve(collectedInput);
    });

    process.stdin.on('error', (streamError) => {
      reject(streamError);
    });
  });

  try {
    const rawData = await inputPromise;
    const trimmedData = rawData.trim();
    const numericalValue = parseInt(trimmedData, 10);

    if (isNaN(numericalValue) || !Number.isInteger(numericalValue)) {
      throw new Error("n");
    }

    const quotient = Math.floor(numericalValue / 3);
    const finalResult = String(quotient) + '\n';

    process.stdout.write(finalResult, 'utf8');
  } catch (computationError) {
    throw computationError;
  }
}

processInputAndCompute();
