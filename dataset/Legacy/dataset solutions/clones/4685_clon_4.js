((inputData) => {
  const lines = inputData.split('\n');
  const [totalPassengersCount, capacityPerBus, timeLimitMinutes] = lines[0].split(' ').map(Number);
  const sortedArrivalTimes = lines.slice(1).map(Number).sort((a, b) => a - b);

  // A generator function to encapsulate the core logic's state transitions.
  // This replaces the imperative 'for' loop with a functional, iterable pattern.
  function* busLogicProcessor() {
    let currentBusTally = 1; // Corresponds to 'count'
    let firstPassengerOnCurrentBusIndex = 0; // Corresponds to 'j'
    let passengerIterationIndex = 0; // Corresponds to 'i'

    // The loop continues as long as 'j' (firstPassengerOnCurrentBusIndex) is less than 'N - 1' (totalPassengersCount - 1).
    // This mirrors the original loop's termination condition.
    while (firstPassengerOnCurrentBusIndex < totalPassengersCount - 1) {
      // Calculate the departure deadline for the current bus. Corresponds to 'limit = T[j] + K'.
      const currentBusDepartureDeadline = sortedArrivalTimes[firstPassengerOnCurrentBusIndex] + timeLimitMinutes;

      // Check conditions for starting a new bus. Corresponds to 'T[i] >= limit || i === C'.
      // Note: If 'passengerIterationIndex' exceeds the bounds of 'sortedArrivalTimes',
      // 'sortedArrivalTimes[passengerIterationIndex]' will be 'undefined'.
      // The comparison 'undefined >= number' evaluates to 'false', replicating the original behavior.
      if (sortedArrivalTimes[passengerIterationIndex] >= currentBusDepartureDeadline || passengerIterationIndex === capacityPerBus) {
        currentBusTally++; // Increment bus count
        firstPassengerOnCurrentBusIndex = passengerIterationIndex; // Reset 'j' to 'i'
      }

      // Yield the current state after processing the passenger.
      // This allows external iteration over the state changes.
      yield { currentBusTally, firstPassengerOnCurrentBusIndex };

      passengerIterationIndex++; // Increment 'i' for the next iteration
    }
    // After the loop terminates, the final state is implicitly the last yielded state.
    // If the loop never runs (e.g., N=0 or N=1), the initial state is the final state.
  }

  let finalBusResult = 1; // Default for cases where the loop doesn't run (N=0 or N=1)

  // Only process if there are passengers to consider beyond the initial bus setup.
  if (totalPassengersCount > 0) {
    let latestState = { currentBusTally: 1, firstPassengerOnCurrentBusIndex: 0 }; // Initial state before any generator yields

    // Iterate through the states yielded by the generator.
    // This replaces the explicit 'for' loop iteration.
    for (const stateSnapshot of busLogicProcessor()) {
      latestState = stateSnapshot; // Keep track of the most recent state
    }
    finalBusResult = latestState.currentBusTally; // The final bus count is from the last state
  }

  console.log(finalBusResult);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
