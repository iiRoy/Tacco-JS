const discoverRoot = parentArrayReference => {
  return elementIdentifier => {
    if ( elementIdentifier !== parentArrayReference[elementIdentifier] ) {
      parentArrayReference[elementIdentifier] = discoverRoot( parentArrayReference )( parentArrayReference[elementIdentifier] );
    }
    return parentArrayReference[elementIdentifier];
  };
};
const uniteComponents = ( parentRef, rankRef ) => {
  return ( componentA, componentB ) => {
    if ( rankRef[componentA] > rankRef[componentB] ) {
      parentRef[componentB] = componentA;
    } else {
      parentRef[componentA] = componentB;
      if ( rankRef[componentA] === rankRef[componentB] ) {
        rankRef[componentB]++;
      }
    }
  };
};
const disjointSetConstructor = ( totalElementsCount ) => {
  this.parentNodes = [];
  this.nodeRanks = [];
  for ( let currentIdx = 0; currentIdx < totalElementsCount; currentIdx++ ) {
    this.parentNodes[currentIdx] = currentIdx;
    this.nodeRanks[currentIdx] = 0;
  }
  this.findRepresentative = discoverRoot( this.parentNodes );
  this.mergeSets = uniteComponents( this.parentNodes, this.nodeRanks );
  return {
    areConnected: ( firstNode, secondNode ) => this.findRepresentative( firstNode ) === this.findRepresentative( secondNode ),
    combineSets: ( nodeOne, nodeTwo ) => this.mergeSets( this.findRepresentative( nodeOne ), this.findRepresentative( nodeTwo ) )
  };
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputDataLines = rawInputData.split("\n");
const [ totalElements, totalQueries ] = inputDataLines.shift().split(" ").map(Number);

const disjointStructure = disjointSetConstructor( totalElements );

inputDataLines.forEach( currentInputLine => {
  const [ operationType, argOne, argTwo ] = currentInputLine.split(" ").map(Number);
  switch ( operationType ) {
    case 0:
      disjointStructure.combineSets( argOne, argTwo );
      break;
    case 1:
      const queryResult = disjointStructure.areConnected( argOne, argTwo ) ? 1 : 0;
      console.log( queryResult );
      break;
  }
});