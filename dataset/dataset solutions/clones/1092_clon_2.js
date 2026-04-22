class NavigableHierarchy {
 constructor( totalElements )
  {
  this.elements = [ ];
  for ( let idx = 0; idx < totalElements; idx++ )
  {
  this.elements[idx] = { key: -1, parentKey: -1, leftChildKey: -1, rightChildKey: -1 };
  }
  }

  get mainComponent() { return this.elements.find(elem => elem.parentKey === -1); }

  insertComponent(componentKey, leftCompKey, rightCompKey) {
   let currentElement = this.elements[componentKey];
   [currentElement.key, currentElement.leftChildKey, currentElement.rightChildKey] = [componentKey, leftCompKey, rightCompKey];
   if (leftCompKey !== -1) { this.locateComponent(leftCompKey).parentKey = componentKey; }
   if (rightCompKey !== -1) { this.locateComponent(rightCompKey).parentKey = componentKey; }
  }

  locateComponent(componentKey) { return this.elements[componentKey] || { }; }

  traversePreOrder( componentKey = this.mainComponent.key ) {
   if (componentKey === -1) { return; }
   let currentElement = this.locateComponent(componentKey);
   process.stdout.write(` ${componentKey}`);
   this.traversePreOrder(currentElement.leftChildKey);
   this.traversePreOrder(currentElement.rightChildKey);
  }

  traverseInOrder( componentKey = this.mainComponent.key )
  {
   if (componentKey === -1) return;
   let currentElement = this.locateComponent(componentKey);
   this.traverseInOrder(currentElement.leftChildKey);
   process.stdout.write(` ${componentKey}`);
   this.traverseInOrder(currentElement.rightChildKey);
  }

  traversePostOrder( componentKey = this.mainComponent.key )
  {
    if ( componentKey === -1 ) return;
    let currentElement = this.locateComponent(componentKey);
    this.traversePostOrder(currentElement.leftChildKey);
    this.traversePostOrder(currentElement.rightChildKey);
    process.stdout.write(` ${componentKey}`);
  }
}

(function executeProgram() {
  const inputLines = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalElements = Number(inputLines.shift());
  let structure = new NavigableHierarchy(totalElements);
  inputLines.map(entryText => entryText.split(' ').map(Number)).forEach(entryData => structure.insertComponent(...entryData));
  console.log('Pre-order traversal:');
  structure.traversePreOrder();
  console.log('\nIn-order traversal:');
  structure.traverseInOrder();
  console.log('\nPost-order traversal:');
  structure.traversePostOrder();
  console.log('');
})();