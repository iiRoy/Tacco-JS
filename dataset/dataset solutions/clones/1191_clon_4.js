const rawDataBuffer = require('fs').readFileSync('/dev/stdin');
const rawContent = rawDataBuffer.toString('utf8');
const processedLines = rawContent.trim().split('\n').filter(Boolean);

const initialValues = processedLines.shift().split(' ').map(Number);
processedLines.shift(); 

const targetCoordinates = processedLines.map(line => {
  const parts = line.split(' ');
  return { topValue: parseInt(parts[0]), bottomValue: parseInt(parts[1]) };
});

const rotationDefinitions = {
  'N': { top: 'bottom', bottom: 'right', front: 'front', back: 'back', left: 'top', right: 'left' },
  'S': { top: 'left', bottom: 'top', front: 'front', back: 'back', left: 'right', right: 'bottom' },
  'E': { top: 'back', bottom: 'bottom', front: 'top', back: 'right', left: 'left', right: 'front' },
  'W': { top: 'front', bottom: 'bottom', front: 'right', back: 'top', left: 'left', right: 'back' }
};

class PolyhedronSimulator {
  constructor(startingFacets) {
    this.activeFacets = {
      top: startingFacets[0],
      bottom: startingFacets[1],
      front: startingFacets[2],
      back: startingFacets[3],
      left: startingFacets[4],
      right: startingFacets[5]
    };
  }

  applyMotion(directionIdentifier) {
    const nextFacets = {};
    const motionMap = rotationDefinitions[directionIdentifier];
    for (const facetName in motionMap) {
      nextFacets[facetName] = this.activeFacets[motionMap[facetName]];
    }
    this.activeFacets = nextFacets;
  }

  fetchFacetValue(facetName) {
    return this.activeFacets[facetName];
  }
}

const currentPolyhedron = new PolyhedronSimulator(initialValues);
const motionLabels = ['N', 'S', 'E', 'W'];

for (const target of targetCoordinates) {
  while (currentPolyhedron.fetchFacetValue('top') !== target.topValue ||
         currentPolyhedron.fetchFacetValue('bottom') !== target.bottomValue) {
    const randomMotionIndex = Math.floor(Math.random() * motionLabels.length);
    const chosenMotion = motionLabels[randomMotionIndex];
    currentPolyhedron.applyMotion(chosenMotion);
  }
  console.log(currentPolyhedron.fetchFacetValue('front'));
}