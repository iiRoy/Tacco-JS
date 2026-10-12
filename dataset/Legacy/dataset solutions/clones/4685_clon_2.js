// This JavaScript program processes passenger arrival data to determine the minimum number of buses required.
// It adheres to specific rules for bus departure based on passenger count and waiting time.

( ( rawDataInput ) => {
  // Split the entire input string by newline characters to get an array of individual lines.
  const inputLines = rawDataInput.split( '\n' );

  // The first line contains three space-separated integers:
  //   - totalTravelers: The total number of passengers.
  //   - maxBusOccupancy: The maximum number of passengers a single bus can carry.
  //   - maxWaitDuration: The maximum time (in minutes) a passenger can wait on a bus after the first passenger boarded.
  const [ totalTravelers, maxBusOccupancy, maxWaitDuration ] = inputLines[ 0 ].split( ' ' ).map( Number );

  // Extract the arrival times for all passengers from the remaining lines.
  // Convert them to numbers and then sort them in ascending order.
  let passengerArrivalTimes = inputLines.slice( 1 ).map( Number ).sort( ( valA, valB ) => valA - valB );

  // Initialize the counter for the number of buses needed.
  // At least one bus is always required for any number of passengers (N >= 1).
  let requiredBusCount = 1;

  // Iterate through the sorted passenger arrival times to assign them to buses.
  //   - currentPassengerIndex: Represents the index of the passenger currently being considered.
  //   - firstPassengerOnBusIndex: Represents the index of the first passenger who boarded the current bus.
  // The loop continues as long as the first passenger of the current bus is not the very last passenger.
  for ( let currentPassengerIndex = 0, firstPassengerOnBusIndex = 0; firstPassengerOnBusIndex < totalTravelers - 1; currentPassengerIndex++ ) {
    // Calculate the latest possible departure time for the current bus.
    // This is determined by the arrival time of the first passenger on this bus plus the maximum allowed waiting duration.
    const busDepartureDeadline = passengerArrivalTimes[ firstPassengerOnBusIndex ] + maxWaitDuration;

    // Check if a new bus is needed for the current passenger.
    // A new bus is required if:
    // 1. The current passenger's arrival time is beyond the current bus's departure deadline.
    // 2. The absolute index of the current passenger being considered matches the maximum bus occupancy value.
    //    (This is a specific condition from the original problem's logic, not a standard capacity check like `currentPassengerIndex - firstPassengerOnBusIndex === maxBusOccupancy`).
    if ( passengerArrivalTimes[ currentPassengerIndex ] >= busDepartureDeadline || currentPassengerIndex === maxBusOccupancy ) {
      requiredBusCount += 1; // Increment the bus count as a new bus is starting.
      firstPassengerOnBusIndex = currentPassengerIndex; // The current passenger becomes the first passenger on the new bus.
    }
  }

  // Print the final calculated number of buses to the console.
  console.log( requiredBusCount );

} )( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
