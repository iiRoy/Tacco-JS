// This script analyzes a series of arrival timestamps to determine the minimum
// number of vehicles required, adhering to capacity and time difference rules.
// It applies a greedy approach to group passengers efficiently.

( ( rawInputString ) => {

  // Divide the complete input into separate string lines for processing.
  const allLines = rawInputString .split ( '\n' ) ;

  // Extract and parse the first line which contains global parameters.
  // The parameters are: total_passengers, vehicle_capacity, max_time_difference.
  let settingsData = allLines [ 0 ] .split ( ' ' ) .map ( Number ) ;

  // Store the maximum number of passengers a single vehicle can transport.
  let vehicleCapacity = settingsData [ 1 ] ;

  // Store the maximum allowable time difference between the first and last
  // passenger's arrival time in a single vehicle.
  const allowedTimeGap = settingsData [ 2 ] ;

  // Process the remaining lines, converting them to numerical arrival times,
  // and then sort these times in ascending order.
  let arrivalSchedule = allLines .slice ( 1 ) .map ( Number ) .sort ( ( timeA , timeB ) => timeA - timeB ) ;

  // Initialize a counter for the total number of vehicles dispatched.
  let totalVehicles = 0 ;


  // Continue dispatching vehicles as long as there are passengers waiting.
  while ( arrivalSchedule .length > 0 )
  {
    // Calculate the latest possible departure time for the current vehicle.
    // This is based on the first passenger's arrival time plus the allowed time gap.
    const currentVehicleDepartureLimit = arrivalSchedule [ 0 ] + allowedTimeGap ;

    // This variable will hold the index of the last passenger who can board
    // the current vehicle, relative to the start of the current `arrivalSchedule`.
    // It's initialized to 1, implying at least the first passenger (index 0) will board.
    let lastPassengerIndexForCurrentVehicle = 1 ;

    // Iterate to find how many more passengers can board this vehicle,
    // up to the vehicle's capacity.
    // 'seatNumber' represents the 1-based index of a potential passenger
    // *after* the initial passenger (arrivalSchedule[0]).
    for ( let seatNumber = 1 ; seatNumber <= vehicleCapacity ; seatNumber ++ )
    {
      // Check if the passenger at 'seatNumber' arrives before or at
      // the current vehicle's departure limit.
      // If arrivalSchedule[seatNumber] is undefined, the comparison
      // `undefined >= currentVehicleDepartureLimit` evaluates to false,
      // matching the original code's implicit behavior.
      if ( arrivalSchedule [ seatNumber ] >= currentVehicleDepartureLimit )
      {
        break ; // This passenger (or subsequent ones) cannot board this vehicle.
      }
      // If the passenger can board, update the index of the last valid passenger.
      lastPassengerIndexForCurrentVehicle = seatNumber ;
    }

    // Remove the passengers who have just boarded the current vehicle from the schedule.
    // The `slice()` method here uses `lastPassengerIndexForCurrentVehicle` to determine
    // how many elements to remove from the beginning of the array.
    arrivalSchedule = arrivalSchedule .slice ( lastPassengerIndexForCurrentVehicle ) ;

    // Increment the count of dispatched vehicles.
    totalVehicles ++ ;
  }

  // Display the final count of vehicles used.
  console .log ( totalVehicles ) ;

} ) ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;