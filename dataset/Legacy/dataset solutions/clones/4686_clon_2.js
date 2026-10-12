"use strict";

/**
 * Processes raw input data to calculate the minimum number of buses required
 * based on passenger arrival times, bus capacity, and maximum waiting time.
 *
 * @param {string} rawInputData - The complete input string from standard input.
 */
function BusScheduler(rawInputData) {
  // Trim leading/trailing whitespace from the input and split it into individual lines.
  const processedInputLines = rawInputData.trim().split('\n');

  // Parse the first line of input to extract configuration parameters.
  // This line contains N (total passengers), C (bus capacity), and K (max wait time).
  const configurationParameters = processedInputLines[0].trim().split(' ').map(Number);
  const totalPassengers = configurationParameters[0];      // N: The total number of passengers.
  const maxBusCapacity = configurationParameters[1];       // C: The maximum number of passengers a bus can hold.
  const maxDepartureDelay = configurationParameters[2];    // K: The maximum time (in minutes) a bus will wait after its first passenger arrives.

  // Extract passenger arrival times from the subsequent lines of input.
  // Convert each time string to a number.
  const passengerArrivalTimesRaw = processedInputLines.slice(1, processedInputLines.length).map(Number);

  // Sort the passenger arrival times in ascending order.
  // This is a critical step for the algorithm to correctly group passengers.
  passengerArrivalTimesRaw.sort((timeA, timeB) => timeA - timeB);

  // Initialize variables to manage the bus scheduling process.
  let currentBusPassengerCount = 0;     // Tracks how many passengers are currently on the bus being filled.
  let busDepartureWindowStart = [];     // Stores the arrival time of the very first passenger on the current bus.
  let shouldDispatchCurrentBus = false; // A flag indicating if the current bus should be dispatched.
  let busesDispatchedCount = 1;         // Counts the total number of buses dispatched. Starts at 1 as at least one bus is always considered.

  // Iterate through each passenger to simulate the bus dispatching process.
  for (let passengerIndex = 0; passengerIndex < totalPassengers; passengerIndex++) {
    currentBusPassengerCount += 1; // Add the current passenger to the bus being filled.

    // If this is the first passenger for the current bus, record their arrival time.
    // This time defines the start of the bus's waiting window.
    if (busDepartureWindowStart.length === 0) {
      busDepartureWindowStart.push(passengerArrivalTimesRaw[passengerIndex]);
    }

    // Determine if the current bus needs to be dispatched based on two conditions:
    // 1. Time constraint: If the next passenger (if any) arrives after the current bus's maximum waiting time.
    //    Note: For the last passenger, `passengerArrivalTimesRaw[passengerIndex + 1]` will be `undefined`.
    //    In JavaScript, `number < undefined` evaluates to `false`, correctly handling the end of the list.
    // 2. Capacity constraint: If the current bus has reached its maximum passenger capacity.
    const nextPassengerArrivalTime = passengerArrivalTimesRaw[passengerIndex + 1];
    const busDepartureDeadline = busDepartureWindowStart[0] + maxDepartureDelay;

    if (busDepartureDeadline < nextPassengerArrivalTime || currentBusPassengerCount === maxBusCapacity) {
      shouldDispatchCurrentBus = true; // Set the flag to dispatch this bus.
    }

    // If the flag indicates that the current bus should be dispatched,
    // increment the total bus count and reset variables for the next bus.
    if (shouldDispatchCurrentBus) {
      busesDispatchedCount += 1;      // Increment the total count of buses used.
      currentBusPassengerCount = 0;   // Reset passenger count for the new bus.
      busDepartureWindowStart = [];   // Clear the first passenger's time for the new bus.
      shouldDispatchCurrentBus = false; // Reset the dispatch flag.
    }
  }

  // Output the final calculated number of buses required.
  console.log(busesDispatchedCount);
}

// Read the entire content of standard input synchronously and pass it to the scheduler function.
BusScheduler(require("fs").readFileSync("/dev/stdin", "utf8"));
