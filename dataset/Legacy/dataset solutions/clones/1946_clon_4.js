function processInputData(sourceText) {
  const lineSegments = sourceText.split('\n');
  const initialQuantity = Number.parseInt(lineSegments[0], 10);
  const contentSegments = lineSegments.slice(1);
  
  const uniqueContentSet = new Set(contentSegments);
  const uniqueContent = Array.from(uniqueContentSet);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
