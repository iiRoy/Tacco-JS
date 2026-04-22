// This JavaScript module orchestrates the allocation of buses for passengers based on their arrival times.
// The primary goal is to compute the minimum number of bus trips necessary to transport all waiting individuals.

((sourceDataString) => {
  // Defensive programming: Verify that input data is available and not merely whitespace.
  if (!sourceDataString || sourceDataString.trim().length === 0) {
    console.error("Critical Error: No raw input data detected. Aborting process.");
    // In a real-world scenario, more robust error handling or default behavior might be implemented.
    return;
  }

  // Divide the incoming data string into an array of individual lines.
  const inputLinesArray = sourceDataString.trim().split('\n');

  // Parse the very first line which contains global configuration parameters.
  // These parameters dictate the overall conditions for bus scheduling.
  const configParametersRow = inputLinesArray[0].split(' ').map(strVal => parseInt(strVal, 10));

  // Extract and assign the key configuration values for clarity and direct use.
  // Note: 'totalAvailablePassengers' (N) is typically part of the input but often not directly used in the core logic.
  const totalAvailablePassengers = configParametersRow[0]; // N: Total count of passengers initially.
  const maxBusOccupancy = configParametersRow[1];         // C: Maximum number of passengers a single bus can carry.
  const maxTimeDifferenceAllowed = configParametersRow[2]; // K: Maximum permitted time variance between passengers on the same bus.

  // Implement validation checks for the critical operational parameters to prevent erroneous calculations.
  if (isNaN(maxBusOccupancy) || maxBusOccupancy <= 0 ||
      isNaN(maxTimeDifferenceAllowed) || maxTimeDifferenceAllowed < 0) {
    console.error("Configuration Error: Invalid values for bus occupancy or time tolerance. Please check inputs.");
    return; // Terminate execution due to invalid configuration.
  }

  // Process the subsequent lines to obtain passenger arrival times.
  // Convert each line into an integer and store them.
  const initialPassengerArrivals = inputLinesArray.slice(1).map(strVal => parseInt(strVal, 10));

  // It is absolutely vital that passenger arrival times are sorted in ascending order
  // for the greedy algorithm to function correctly.
  let passengerWaitingQueue = initialPassengerArrivals.sort((timeA, timeB) => timeA - timeB);

  // Initialize a counter to keep track of the total number of buses that have been dispatched.
  let totalBusesDispatched = 0;

  // The main operational loop continues as long as there are passengers remaining in the queue.
  // An infinite loop with an explicit break condition is used for flow control.
  for (;;) {
    // If the passenger queue is empty, all individuals have been transported.
    if (passengerWaitingQueue.length === 0) {
      break; // Exit the scheduling loop.
    }

    // A new bus trip is initiated. Increment the bus dispatch counter.
    totalBusesDispatched++;

    // The arrival time of the first passenger currently in the queue dictates the base time for this bus.
    const currentBusDepartureBaseTime = passengerWaitingQueue[0];

    // Calculate the latest possible arrival time for any passenger to be eligible for this bus.
    // This is determined by the first passenger's arrival time plus the maximum allowed time difference.
    const boardingEligibilityCutoffTime = currentBusDepartureBaseTime + maxTimeDifferenceAllowed;

    // Determine the number of passengers that will board this particular bus.
    // The first passenger (at index 0) is always guaranteed a spot, so we start the count at one.
    let passengersBoardingThisTrip = 1;

    // Iterate through the subsequent passengers in the queue to fill the bus,
    // respecting both the bus's capacity and the time difference constraint.
    // The loop starts from the second passenger (index 1) and goes up to the maximum capacity.
    for (let passengerScanIndex = 1; passengerScanIndex < maxBusOccupancy; ++passengerScanIndex) {
      // If there are no more passengers left to evaluate in the queue,
      // or we've reached the end of the available passengers, stop.
      if (passengerScanIndex >= passengerWaitingQueue.length) {
        break;
      }

      const candidatePassengerArrivalTime = passengerWaitingQueue[passengerScanIndex];

      // Check if the current candidate passenger arrives after the boarding cutoff time.
      // Since the queue is sorted, if this passenger is too late, all subsequent passengers will also be too late.
      if (candidatePassengerArrivalTime > boardingEligibilityCutoffTime) {
        break; // No more passengers can board this bus.
      }

      // This passenger is eligible and can board the current bus.
      passengersBoardingThisTrip++;
    }

    // Remove the passengers who have just boarded from the front of the waiting queue.
    // The `splice` method modifies the array in-place, removing the specified number of elements.
    passengerWaitingQueue.splice(0, passengersBoardingThisTrip);
  }

  // Display the final result: the total count of buses required for all passengers.
  console.info(totalBusesDispatched);

})(require("fs").readFileSync("/dev/stdin", "utf8"));