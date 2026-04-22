/*
 * This script processes building occupancy data from standard input.
 * It simulates a multi-level building structure and updates
 * occupancy counts based on provided records.
 */
( function ( inputSource )
{
  // Function to create an array initialized with zeros.
  // This helps in setting up the building structure with empty counts.
  function createCollection( elementCount )
  {
    let collection = [ ]; // Using 'let' instead of 'var' for modern JS.
    // Loop 'elementCount' times to populate the array.
    for ( let currentIdx = 0; currentIdx < elementCount; currentIdx++ )
    {
      collection .push(0); // Each element starts at zero occupancy.
    }
    return collection; // Return the newly created array.
  }

  /*
   * Updates the building structure with occupancy changes.
   * The 'propertyGrid' represents the 3D building.
   * 'activityLogs' contains records of changes (building, floor, room, change_amount).
   */
  function adjustSpaceMetrics( propertyGrid, activityLogs )
  {
    activityLogs.map(function( logEntry ) {
      // Accessing and modifying specific cell in the 3D grid.
      // logEntry[0] is building index, logEntry[1] is floor index, logEntry[2] is room index.
      // logEntry[3] is the change in occupancy.
      propertyGrid[logEntry[0] - 1][logEntry[1] - 1][logEntry[2] - 1] += logEntry[3];
      return logEntry; // The map function expects a return value, though it's not used here.
    });
    return propertyGrid; // Return the modified grid.
  }

  // Read all input from the provided source, convert to string,
  // remove leading/trailing whitespace, and split into individual lines.
  var rawLines = inputSource.toString().trim().split('\n');

  // Process each raw line: split by space and convert parts to numbers.
  var occupantChanges = rawLines.map(function( lineString ) {
    return lineString.split(' ').map(Number);
  });

  // Initialize a 4x3x10 3D structure for the entire property.
  // This represents 4 buildings, each with 3 floors, and each floor with 10 rooms.
  var entireProperty = createCollection(4).map(function() {
    return createCollection(3).map(function() {
      return createCollection(10);
    });
  });

  // The first line of input often contains metadata (like total number of records),
  // which is not needed for the actual occupancy updates. So, remove it.
  occupantChanges.shift();

  // Apply the occupancy changes to the building structure and print the final state.
  console.log( adjustSpaceMetrics(entireProperty, occupantChanges) );

} )( require('fs').readFileSync('/dev/stdin', 'utf8') );