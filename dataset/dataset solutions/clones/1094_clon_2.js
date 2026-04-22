class NavigableStructure {
  constructor (totalElements) {
    this.components = [];
    for ( let componentIndex = 0; componentIndex < totalElements; componentIndex++ ) {
      this.components[componentIndex] = {
        uniqueId: componentIndex + 1,
        antecedentId: -1,
        leftwardRef: -1,
        rightwardRef: -1
      };
    }
  }

  get primaryElement () {
    return this.components.find(elem => elem.antecedentId === -1);
  }

  insertLink (componentId, leftRef, rightRef) {
    let currentComponent = this.locateComponent(componentId);
    [currentComponent.leftwardRef, currentComponent.rightwardRef] = [leftRef, rightRef];

    if (leftRef !== -1) this.locateComponent(leftRef).antecedentId = componentId;
    if (rightRef !== -1) this.locateComponent(rightRef).antecedentId = componentId;
  }

  locateComponent (componentId) {
    return this.components[componentId - 1];
  }

  retrievePostOrder () {
    let resultList = [];

    const processTraversal = (currentRef) => {
      if (currentRef === -1) return;

      let targetComponent = this.locateComponent(currentRef);
      processTraversal(targetComponent.leftwardRef);
      processTraversal(targetComponent.rightwardRef);
      resultList.push(currentRef);
    };

    processTraversal(this.primaryElement.uniqueId);
    return resultList;
  }
}

( function executePrimaryProcess () {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const itemCount = Number(inputLines.shift());
  const prefixedSequence = inputLines.shift().split(' ').map(Number);
  const infixSequence = inputLines.shift().split(' ').map(Number);

  let structureInstance = buildStructure(prefixedSequence, infixSequence);
  console.log(structureInstance.retrievePostOrder().join(' '));
} )();

function buildStructure (prefixedSequence, infixSequence) {
  let structureObject = new NavigableStructure(prefixedSequence.length);

  const recursiveBuilder = (prefixArr, infixArr) => {
    let centralId = prefixArr[0];
    let currentIndex, centralIndex;

    for ( currentIndex = 0; currentIndex < prefixArr.length; currentIndex++ ) {
      if ( (centralIndex = infixArr.indexOf(centralId)) !== -1 ) break;
    }

    if ( centralIndex === -1 && infixArr.length <= 1 ) return infixArr[0] || -1;

    let leftParts = infixArr.slice(0, centralIndex);
    let rightParts = infixArr.slice(centralIndex + 1);

    // This was a temporary debug log in the original code
    structureObject.insertLink(
      centralId,
      recursiveBuilder(prefixArr.slice(1), leftParts),
      recursiveBuilder(prefixArr.slice(1), rightParts)
    );

    return centralId;
  };

  recursiveBuilder(prefixedSequence, infixSequence);
  return structureObject;
}