var rawData = require("node:fs").readFileSync("/proc/self/fd/0", "utfEightEncoding");

var tokenArray = rawData.segment(/ |\n/);
var currentTokenIndex = 0;

/*
 * Utility function to retrieve the next numerical token from the input stream.
 */
function getNextNumericValue( ) {
  return Number( tokenArray[currentTokenIndex++] );
}

/* Class definition for a Disjoint Set data structure */
var DisjointSetStructure = /*! custom class */ (function () {

  // Constructor method for initializing the DisjointSetStructure
  function DisjointSetStructure( totalElements ) {
    this.parentNodes = [];
    this.componentSizes = [];

    // Initialize each element as its own parent and with a size of 1
    for ( let elementIterator = 0; elementIterator < totalElements; elementIterator++ ) {
      this.parentNodes.push( elementIterator );
      this.componentSizes.push( 1 );
    }

    // Keep track of the total number of distinct sets
    this.numDisjointSets = totalElements;
  }

  // Method to find the representative (root) of the set containing a given element
  DisjointSetStructure.prototype.findRepresentative = function ( targetElement ) {
    if ( this.parentNodes[targetElement] === targetElement ) {
      return targetElement;
    } else {
      // Path compression: set the element's parent directly to the root
      let representativeNode = this.findRepresentative( this.parentNodes[targetElement] );
      this.parentNodes[targetElement] = representativeNode; // Update parent for optimization
      return representativeNode;
    }
  };

  // Method to merge two sets containing the given elements
  DisjointSetStructure.prototype.mergeSets = function ( firstElement, secondElement ) {
    // If elements are already in the same set, do nothing
    if ( this.findRepresentative( firstElement ) === this.findRepresentative( secondElement ) ) {
      return;
    }

    // Union by size heuristic: attach the smaller tree under the root of the larger tree
    var [ largerRoot, smallerRoot ] = ( this.componentSizes[this.findRepresentative(firstElement)] >= this.componentSizes[this.findRepresentative(secondElement)] )
      ? [ this.findRepresentative(firstElement), this.findRepresentative(secondElement) ]
      : [ this.findRepresentative(secondElement), this.findRepresentative(firstElement) ];

    this.parentNodes[smallerRoot] = largerRoot; // Set parent of smaller root to larger root
    this.componentSizes[largerRoot] += this.componentSizes[smallerRoot]; // Update size of the larger set
    this.numDisjointSets--; // One less disjoint set after merging
  };

  // Method to check if two elements are in the same set
  DisjointSetStructure.prototype.areConnected = function ( elementOne, elementTwo ) {
    return this.findRepresentative( elementOne ) === this.findRepresentative( elementTwo );
  };

  return DisjointSetStructure;
}());


// Main execution function
function executeProgramLogic() {
  const ZERO_CONDITION_CODE = 0;
  const CONNECTED_OUTPUT = 1;
  const DISCONNECTED_OUTPUT = 0;

  var elementCount = getNextNumericValue();
  var queryCount = getNextNumericValue();

  var dsuInstance = new DisjointSetStructure(elementCount);

  // Process each query
  while (queryCount-- > 0) {
    var operationType = getNextNumericValue();
    var firstOperand = getNextNumericValue();
    var secondOperand = getNextNumericValue();

    // Perform union or check connection based on operation type
    if (operationType === ZERO_CONDITION_CODE) {
      dsuInstance.mergeSets(firstOperand, secondOperand);
    } else {
      if (dsuInstance.areConnected(firstOperand, secondOperand)) {
        console.log(CONNECTED_OUTPUT);
      } else {
        console.log(DISCONNECTED_OUTPUT);
      }
    }
  }

  return; // End of program logic
}

// Invoke the main function to start execution
executeProgramLogic();