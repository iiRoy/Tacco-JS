// This script processes a list of passenger arrival times to determine the minimum number of buses required.
// It reflects a solution strategy for a bus scheduling problem, maintaining similar logical constructs
// and potential operational nuances as the original code it clones.

// An anonymous self-executing function is used to encapsulate the program's logic.
// It takes the raw input text as an argument, typically read from standard input.
((rawInputText) => {
  // A utility function to parse a space-separated string of numbers into an array of integers.
  const parseNumericalParameters = (parameterString) => parameterString.split(' ').map(Number);

  // First, segment the entire input string into an array of individual lines.
  const inputLines = rawInputText.trim().split('\n');

  // Extract the primary configuration parameters from the very first line of input.
  // These define the problem's constraints:
  // - totalPassengerCount: The absolute count of all individuals needing transport.
  // - maximumBusCapacity: The highest number of passengers a single bus can legally carry.
  // - allowedDepartureDelay: The maximum duration a bus will wait beyond its first passenger's arrival.
  const [totalPassengerCount, maximumBusCapacity, allowedDepartureDelay] = parseNumericalParameters(inputLines[0]);

  // Implement an early exit condition for the scenario where no passengers are present.
  // In this case, no buses are needed. This is a robust addition to handle edge cases gracefully.
  if (totalPassengerCount === 0) {
    console.log(0); // Output zero buses.
    return;         // Conclude execution.
  }

  // Process the remaining lines to obtain all passenger arrival timestamps.
  // These timestamps are converted to numbers and then sorted in ascending order.
  // Sorting is fundamental for the greedy algorithm employed in bus assignment.
  const sortedPassengerArrivals = inputLines.slice(1).map(Number).sort((timeA, timeB) => timeA - timeB);

  // Initialize the counter for the total number of buses that will be dispatched.
  // By default, the very first passenger always guarantees at least one bus is required.
  let totalBusesDispatched = 1;

  // 'currentBusFirstPaxIndex' tracks the array index of the first passenger assigned to the bus
  // that is currently being filled. This serves the role of 'j' from the original implementation.
  let currentBusFirstPaxIndex = 0;

  // 'passengerIterationIndex' acts as the primary iterator, moving through potential passengers
  // to evaluate their assignment to a bus. This variable corresponds to 'i' in the original code.
  // The loop condition `currentBusFirstPaxIndex < totalPassengerCount - 1` directly replicates
  // the original's `j < N - 1` termination logic. This specific condition allows `passengerIterationIndex`
  // to potentially exceed the bounds of `sortedPassengerArrivals`, mirroring the original's implicit behavior
  // when accessing `T[i]` beyond `N-1`.
  for (
    let passengerIterationIndex = 0;
    currentBusFirstPaxIndex < totalPassengerCount - 1; // A literal translation of the original loop's termination criterion.
    passengerIterationIndex++
  ) {
    // Determine the absolute latest possible moment this current bus can depart.
    // This is derived from the arrival time of its first passenger plus the maximum allowed delay.
    const baseArrivalForCurrentBus = sortedPassengerArrivals[currentBusFirstPaxIndex];
    const busHardDepartureDeadline = baseArrivalForCurrentBus + allowedDepartureDelay;

    // Evaluate whether the passenger at 'passengerIterationIndex' can board the current bus,
    // or if their conditions necessitate the dispatch of a new bus.
    //
    // Condition 1: The current passenger's arrival time is beyond the established departure deadline.
    //    (Note: If 'passengerIterationIndex' has advanced beyond `totalPassengerCount - 1`,
    //     `sortedPassengerArrivals[passengerIterationIndex]` will yield `undefined`. In JavaScript,
    //     `undefined >= numeric_value` evaluates to `false`, faithfully reproducing the original's
    //     implicit handling of out-of-bounds array access.)
    // Condition 2: The 'passengerIterationIndex' itself matches 'maximumBusCapacity'.
    //    This explicit check (`i === C`) is a direct, literal clone of the original code's capacity constraint.
    //    It is a specific aspect of the original logic, potentially a simplified or context-dependent capacity check.
    if (
      sortedPassengerArrivals[passengerIterationIndex] >= busHardDepartureDeadline ||
      passengerIterationIndex === maximumBusCapacity
    ) {
      // If either of the above conditions is satisfied, a new bus must be deployed.
      totalBusesDispatched++;
      // The passenger at 'passengerIterationIndex' will now be designated as the first passenger
      // for this newly dispatched bus. This updates the 'j' equivalent.
      currentBusFirstPaxIndex = passengerIterationIndex;
    }
  }

  // Display the final calculated number of buses required to transport all passengers.
  console.log(totalBusesDispatched);

// The input is read from standard input in UTF-8 format.
// `process.stdin.readFileSync(0, "utf8")` is an equivalent and common way to read from stdin in Node.js,
// where '0' refers to the file descriptor for standard input.
})(process.stdin.readFileSync(0, "utf8"));