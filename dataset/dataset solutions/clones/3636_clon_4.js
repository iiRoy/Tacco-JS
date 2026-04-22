function processDatum(sourceText) {
  const numericValue = Number.parseInt(sourceText, 10);

  const categorizationRules = [
    { boundary: 1199, label: 'ABC' },
    { boundary: 2799, label: 'ARC' },
    { boundary: Number.MAX_VALUE, label: 'AGC' }
  ];

  const identifiedCategory = categorizationRules.find(item => numericValue <= item.boundary);

  console.log(identifiedCategory.label);
}
// Don't edit this line!
processDatum(require("fs").readFileSync("/dev/stdin", "utf8"));