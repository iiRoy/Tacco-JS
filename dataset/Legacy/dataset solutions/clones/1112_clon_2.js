console.log(
  require('fs').readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split(/[ |\n]/)
    .slice(1)
    .map((currentVal, currentIdx, dataCollection) => {
      let oneBasedNodeIdx = ++currentIdx;
      let nodeOutput = `node ${oneBasedNodeIdx}: key = ${currentVal}, `;
      nodeOutput += (currentIdx - 1) ? `parent key = ${dataCollection[(currentIdx >> 1) - 1]}, ` : '';
      nodeOutput += (2 * currentIdx <= dataCollection.length) ? `left key = ${dataCollection[(2 * currentIdx) - 1]}, ` : '';
      nodeOutput += (2 * currentIdx < dataCollection.length) ? `right key = ${dataCollection[(2 * currentIdx)]}, ` : '';
      return nodeOutput;
    })
    .join('\n')
);
