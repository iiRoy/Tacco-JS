async function initiateProcessing() {
  const dataSegments = [];

  const accumulatedContent = await new Promise((resolve, reject) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (currentSegment) => {
      dataSegments.push(currentSegment);
    });

    process.stdin.on('end', () => {
      resolve(dataSegments.join(''));
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });
  });

  processAndDisplay(accumulatedContent);
}

function processAndDisplay(rawText) {
  console.log(rawText.toUpperCase());
}

initiateProcessing();
