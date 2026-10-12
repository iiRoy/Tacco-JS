'use strict';
function processInput(rawData) {
  const [widthStr1, widthStr2] = rawData.split(' ');
  const structureWidth = Number(widthStr1);
  const fabricPanelWidth = Number(widthStr2);
  const combinedPanelWidth = fabricPanelWidth * 2;
  const remainingSpace = structureWidth - combinedPanelWidth;
  const finalOutput = remainingSpace > 0 ? remainingSpace : 0;
  console.log(finalOutput);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
