( function ( globalScope, moduleBuilder ) {
  // Check for Asynchronous Module Definition (AMD) specification
  if ( typeof defineModule === 'function' && typeof defineModule.amd === 'object' && defineModule.amd ) {
    defineModule( function () {
      return moduleBuilder( globalScope );
    } );
  }
  // Check for CommonJS or Node.js environment
  else if ( typeof currentModule === 'object' && currentModule && currentModule.exports ) {
    currentModule.exports = moduleBuilder( globalScope );
  }
  // Fallback: Expose to the global object
  else {
    globalScope.EditDistanceCalculator = moduleBuilder( globalScope );
  }

} ( this, function ( globalScope ) {

  // A general-purpose iterator for collection processing
  function iterateOver ( dataCollection, callbackAction ) {
    var counterIndex, collectionLength;
    counterIndex = -1;
    collectionLength = dataCollection.length;
    while ( ++counterIndex < collectionLength ) {
      callbackAction( dataCollection[ counterIndex ], counterIndex, dataCollection );
    }
  }

  // Transforms a collection into a new one by applying a callback to each item
  function transformCollection ( dataCollection, callbackAction ) {
    var transformedCollection;
    transformedCollection = Array( dataCollection.length );
    iterateOver( dataCollection, function ( elementValue, counterIndex, dataCollection ) {
      transformedCollection[ counterIndex ] = callbackAction( elementValue, counterIndex, dataCollection );
    } );
    return transformedCollection;
  }

  // Reduces a collection to a single value using a provided reduction function
  function aggregateCollection ( dataCollection, callbackAction, aggregatedValue ) {
    iterateOver( dataCollection, function ( elementValue, counterIndex, dataCollection ) {
      aggregatedValue = callbackAction( elementValue, counterIndex, dataCollection );
    } );
    return aggregatedValue;
  }

  // Constructor for computing the Levenshtein (Edit) Distance
  function EditDistanceCalculator ( firstString, secondString ) {
    var previousRow, currentRow, distanceGrid;

    // Initialize the internal grid for storing calculation steps
    distanceGrid = this._internalGrid = [];

    // Handle edge cases for efficiency
    if ( firstString === secondString ) {
      return this.calculatedDistance = 0; // Identical strings have zero distance
    } else if ( firstString === '' ) {
      return this.calculatedDistance = secondString.length; // Empty first string, distance is length of second
    } else if ( secondString === '' ) {
      return this.calculatedDistance = firstString.length; // Empty second string, distance is length of first
    } else {
      // Initialize the first row of the distance matrix
      previousRow = [ 0 ];
      iterateOver( firstString, function ( charA, indexA ) {
        indexA++;
        previousRow[ indexA ] = indexA;
      } );

      distanceGrid[ 0 ] = previousRow; // Store the initialized first row

      // Iterate through the second string to build the distance matrix
      iterateOver( secondString, function ( charB, indexB ) {
        currentRow = [ ++indexB ]; // Initialize current row with its index
        iterateOver( firstString, function ( charA_val, indexA ) {
          indexA++;
          // If characters at current positions match, cost is from diagonal element
          if ( firstString.charAt( indexA - 1 ) === secondString.charAt( indexB - 1 ) ) {
            currentRow[ indexA ] = previousRow[ indexA - 1 ];
          }
          // If characters differ, calculate minimum cost of deletion, insertion, or substitution
          else {
            currentRow[ indexA ] = Math.min(
              previousRow[ indexA ] + 1,       // Cost for character deletion
              currentRow[ indexA - 1 ] + 1,    // Cost for character insertion
              previousRow[ indexA - 1 ] + 1    // Cost for character substitution
            );
          }
        } );
        previousRow = currentRow; // Current row becomes previous for the next iteration
        distanceGrid[ distanceGrid.length ] = previousRow; // Add the completed row to the grid
      } );

      // The final element in the last row contains the total Levenshtein distance
      return this.calculatedDistance = currentRow[ currentRow.length - 1 ];
    }
  }

  // Prototype method: Generates a human-readable string representation of the distance grid
  EditDistanceCalculator.prototype.toFormattedString = EditDistanceCalculator.prototype.examineInstance = function inspect ( suppressOutput ) {
    var distanceGrid, maxValue, paddingString, separatorLine, formattedRows;

    distanceGrid = this.retrieveGrid(); // Get the underlying distance matrix
    maxValue = aggregateCollection( distanceGrid, function ( currentMax, rowData ) {
      return Math.max( currentMax, aggregateCollection( rowData, Math.max, 0 ) );
    }, 0 ); // Determine the largest value in the grid for consistent formatting
    paddingString = Array( ( maxValue + '' ).length ).join( ' ' ); // Create a padding string of spaces

    separatorLine = [];
    while ( separatorLine.length < ( distanceGrid[ 0 ] && distanceGrid[ 0 ].length || 0 ) ) {
      separatorLine[ separatorLine.length ] = Array( paddingString.length + 1 ).join( '-' );
    }
    separatorLine = separatorLine.join( '-+-' ) + '-'; // Construct the horizontal row separator

    formattedRows = transformCollection( distanceGrid, function ( gridRow ) {
      var rowCells;
      rowCells = transformCollection( gridRow, function ( singleCell ) {
        return ( paddingString + singleCell ).slice( - paddingString.length ); // Right-align and pad each cell
      } );
      return rowCells.join( ' | ' ) + ' '; // Join cells with a vertical separator
    } );

    return formattedRows.join( "\n" + separatorLine + "\n" ); // Combine all rows with separators
  };

  // Prototype method: Provides a shallow copy of the computed distance grid
  EditDistanceCalculator.prototype.retrieveGrid = function () {
    return this._internalGrid.slice();
  };

  // Prototype method: Allows the object to be used in numeric contexts, returning its distance
  EditDistanceCalculator.prototype.getValue = function () {
    return this.calculatedDistance;
  };

  return EditDistanceCalculator; // Return the main constructor

} ) );