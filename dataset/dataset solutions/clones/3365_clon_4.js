async function processExternalData() {
  const acquiredText = await new Promise(resolve => {
    let gatheredContent = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', fragment => {
      gatheredContent += fragment;
    });
    process.stdin.on('end', () => {
      resolve(gatheredContent);
    });
  });

  const textualUnits = acquiredText.split('\n');
  const primaryUnit = textualUnits[0];

  const occurrences = (primaryUnit.match(/2/g) || []).length;

  console.log(occurrences);
}

processExternalData();