function ProcessInput(incomingContent) {
  incomingContent = incomingContent.split("\n");

  let depthLevel = parseInt(incomingContent[0].split(" ")[0]);
  let targetPosition = parseInt(incomingContent[0].split(" ")[1]);

  const pattyCounts = new Array(50);
  const totalLengths = new Array(50);

  pattyCounts[0] = 1;
  totalLengths[0] = 1;

  let foundPatties = 0;

  for (let currentLayer = 1; currentLayer <= 50; ++currentLayer) {
    pattyCounts[currentLayer] = pattyCounts[currentLayer - 1] * 2 + 1;
    totalLengths[currentLayer] = totalLengths[currentLayer - 1] * 2 + 3;
  }

  let currentLength = totalLengths[depthLevel];
  let currentPatties = pattyCounts[depthLevel];

  while (targetPosition > 0) {
    if (targetPosition > (currentLength - 1) / 2) {
      targetPosition = targetPosition - (currentLength - 1) / 2 - 1;
      foundPatties = foundPatties + (currentPatties - 1) / 2 + 1;
      currentLength = (currentLength - 1) / 2 - 1;
      currentPatties = (currentPatties - 1) / 2;
    } else {
      targetPosition = targetPosition - 1;
      currentLength = (currentLength - 1) / 2 - 1;
      currentPatties = (currentPatties - 1) / 2;
    }
  }

  console.log('%s', foundPatties);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));