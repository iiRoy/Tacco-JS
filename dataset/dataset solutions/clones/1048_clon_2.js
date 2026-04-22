(  function  initiateProcessing (  )
{
  /*
   * This self-executing block manages the entire application lifecycle.
   * It handles input acquisition, data transformation, and computes a critical capacity value.
   */

  // Access the Node.js file system module to interact with the environment.
  // Read the entire content from the standard input stream, ensuring UTF-8 decoding.
  // Any leading or trailing whitespace is removed, and the content is then
  // divided into an array of individual text records based on newline characters.
  let  sourceTextRecords  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim (  ) . split ( "\n" ) ;

  // Extract the first record from the obtained list.
  // This record typically contains two numerical parameters separated by a space.
  // These parameters are then converted into their numeric representations.
  let  [  totalElementCount ,  maxAllocationUnits  ]  =  sourceTextRecords . shift (  ) . split ( ' ' ) . map ( Number ) ;

  // The remaining records in the list represent individual item measurements.
  // These are transformed into an array of numerical values.
  let  elementMeasurementArray  =  sourceTextRecords . map ( Number ) ;

  /**
   * Determines if all elements can be distributed among the available allocation units,
   * respecting a given maximum capacity for each unit.
   *
   * @param {number} currentUnitThreshold - The maximum collective measurement allowed per allocation unit.
   * @returns {number} The total count of elements successfully placed under the specified threshold.
   */
  const  assessDistributionPossibility  =  (  currentUnitThreshold  )  =>
  {
    let  elementsDistributedCounter  =  0 ; // Keeps track of how many elements have been assigned.

    // Iterate through each potential allocation unit.
    for  (  let  unitOrdinal  =  0 ;  unitOrdinal  <  maxAllocationUnits ;  unitOrdinal ++  )
    {
      // Initialize the current cumulative measurement for this particular unit.
      // The inner loop attempts to fill the unit up to `currentUnitThreshold`.
      // Note: The original implementation increments the element index (`++elementsDistributedCounter`)
      // *before* retrieving the element's measurement (`elementMeasurementArray[...]`).
      // This implies that `elementMeasurementArray[0]` will be bypassed if `elementsDistributedCounter`
      // starts from zero. This specific operational characteristic is preserved.
      for  (  let  cumulativeUnitLoad  =  0 ;
               cumulativeUnitLoad  <=  currentUnitThreshold ;
               cumulativeUnitLoad  +=  elementMeasurementArray [  ++ elementsDistributedCounter  ]  )
      {
        // If all elements have been successfully distributed across units,
        // we can return the total count immediately.
        if  (  elementsDistributedCounter  ===  totalElementCount  )  return  elementsDistributedCounter ;
      }
    }
    // After attempting to fill all available units, return the final tally of distributed elements.
    return  elementsDistributedCounter ;
  };

  // Compute an initial approximate minimum capacity.
  // This is derived by summing all element measurements and dividing by the number of allocation units.
  // The result is then rounded down to the nearest integer.
  let  provisionalCapacityEstimate  =  Math . floor (  elementMeasurementArray . reduce (  (  aggregatedValue ,  individualValue  )  =>  aggregatedValue  +  individualValue  )  /  maxAllocationUnits  ) ;

  // Conduct an iterative search to find the smallest possible capacity
  // that permits the distribution of all elements.
  // The process continues to increment the capacity estimate until
  // `assessDistributionPossibility` confirms all elements can be placed.
  while  (  assessDistributionPossibility (  ++ provisionalCapacityEstimate  )  !==  totalElementCount  ) ;

  // Display the final, optimized minimum capacity to the standard output.
  console . log (  provisionalCapacityEstimate  ) ;

} ) (  ) ;