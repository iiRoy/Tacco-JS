/*
 * This script calculates the minimum number of shuttle buses
 * required to transport passengers based on their arrival times,
 * bus capacity, and a time window.
 */

( ( rawInputString ) => {
  // Split the entire input string into individual lines.
  const lineSegments = rawInputString.split( '\n' ) ;

  // Parse the first line to get global constraints:
  // total_passengers, maximum_capacity_per_bus, and max_wait_duration.
  const [ totalParticipants , maxCapacity , maxWaitDuration ] = lineSegments[ 0 ].split( ' ' ).map( Number ) ;

  // Process subsequent lines to get passenger arrival times,
  // convert them to numbers, and sort them in ascending order.
  let participantArrivalTimings = lineSegments.slice( 1 ).map( Number ).sort( ( timeA , timeB ) => timeA - timeB ) ;

  // Initialize the count of necessary vehicles. At least one vehicle is always needed.
  let neededTransports = 1 ;

  // Iterate through the sorted arrival times to determine bus assignments.
  // current_person_idx tracks the passenger being considered.
  // first_on_bus_idx marks the first passenger assigned to the current bus.
  for ( let current_person_idx = 0 , first_on_bus_idx = 0 ; first_on_bus_idx < totalParticipants - 1 ; current_person_idx++ ) {
    // Calculate the latest possible departure time for the current bus.
    // This is based on the arrival time of the first passenger on the bus plus the allowed waiting duration.
    const vehicleDepartureCutoff = participantArrivalTimings[ first_on_bus_idx ] + maxWaitDuration ;

    // Check conditions for dispatching a new bus:
    // 1. The current passenger arrives after the bus's departure cutoff.
    // 2. The current bus has reached its maximum capacity.
    if ( participantArrivalTimings[ current_person_idx ] >= vehicleDepartureCutoff || current_person_idx === maxCapacity ) {
      neededTransports += 1 ; // Increment the count of required buses.
      first_on_bus_idx = current_person_idx ; // The current passenger becomes the first for the new bus.
    }
  }

  // Output the final calculated number of buses.
  console.log( neededTransports ) ;

} ) ( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;