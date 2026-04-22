function processString(sourceText) {
  const charTransformer = new Map([
    ['1', '9'],
    ['9', '1']
  ]);

  const performSubstitution = (source) => {
    const relevantSegment = source.substring(0, 3); 
    return Array.from(relevantSegment)
                .map(symbol => charTransformer.has(symbol) ? charTransformer.get(symbol) : symbol)
                .join('');
  };

  return performSubstitution(sourceText);
}

console.log(processString(require("fs").readFileSync("/dev/stdin", "utf8")));