"use strict"; // Enforce stricter parsing and error handling for better code quality

/**
 * Helper function to parse a string containing space-separated numbers into an array of numbers.
 * This abstracts away the common parsing pattern, making the main logic cleaner.
 *
 * @param {string} inputLine - The string line to parse (e.g., "10 2 5").
 * @returns {number[]} An array of numerical values.
 */
const extractNumericalValues = (inputLine) => {
    // Trim whitespace, split by space, and convert each part to a number.
    return inputLine.trim().split(' ').map(Number);
};

/**
 * Simulates the dispatch of buses to transport passengers,
 * adhering to specific capacity and waiting time constraints.
 * This is the primary function encapsulating the problem's core logic.
 *
 * @param {string} fullInputPayload - The complete input as a single string,
 *                                    typically originating from standard input.
 */
function manageTransportationLogistics(fullInputPayload) {
    // --- Step 1: Deconstruct and Prepare Raw Input Data ---
    // First, normalize the input string by removing leading/trailing whitespace,
    // then split it into an array of individual lines.
    const inputLinesArray = fullInputPayload.trim().split('\n');

    // Parse the first line to obtain the key problem parameters:
    //  - `totalClientCount`: The total number of clients needing transport.
    //  - `vehicleCapacityLimit`: The maximum number of clients a single vehicle can carry.
    //  - `maximumWaitDuration`: The longest time (in units) a client will wait on a vehicle
    //                           before it must depart, relative to the first client's arrival.
    const [totalClientCount, vehicleCapacityLimit, maximumWaitDuration] = extractNumericalValues(inputLinesArray[0]);

    // Extract all client arrival times from the remaining lines.
    // Each line after the first is expected to be a single client's arrival time.
    const clientArrivalTimestamps = inputLinesArray.slice(1).map(Number);

    // --- Step 2: Implement Input Data Validation (Type III Addition) ---
    // Robust applications often include checks for valid input ranges or formats.
    // These guards prevent unexpected behavior or errors with malformed data.
    if (totalClientCount <= 0 || vehicleCapacityLimit <= 0 || maximumWaitDuration < 0) {
        console.error("Input Error: Client count (N) and vehicle capacity (C) must be positive. Maximum wait duration (K) cannot be negative.");
        return; // Halt execution if critical parameters are invalid.
    }
    if (clientArrivalTimestamps.length !== totalClientCount) {
        console.error(`Input Error: Mismatch between declared client count (${totalClientCount}) and actual client arrival times provided (${clientArrivalTimestamps.length}).`);
        return; // Halt if client data doesn't match declared count.
    }

    // The problem requires processing clients in chronological order of their arrival.
    // Sorting ensures this prerequisite is met.
    clientArrivalTimestamps.sort((timeA, timeB) => timeA - timeB);

    // --- Step 3: Execute the Core Simulation Algorithm ---
    let dispatchedVehicleCount = 0; // Initialize the counter for successfully dispatched vehicles.
    let currentClientPointer = 0;   // An index to track the client currently being processed.

    // Continue dispatching vehicles as long as there are clients awaiting transportation.
    while (currentClientPointer < totalClientCount) {
        // A new vehicle is always initiated for the current group of clients.
        dispatchedVehicleCount++;

        // The first client to board this new vehicle determines its base departure constraint.
        const vehicleBaseDepartureTime = clientArrivalTimestamps[currentClientPointer];

        // Calculate the absolute latest time this vehicle can depart.
        // This is the base departure time plus the maximum allowed waiting period.
        const absoluteDepartureDeadline = vehicleBaseDepartureTime + maximumWaitDuration;

        let clientsCurrentlyOnboard = 0; // Counter for clients loaded onto the current vehicle.

        // Load clients onto the current vehicle until one of the following conditions is met:
        // 1. All clients have been processed (`currentClientPointer` reaches `totalClientCount`).
        // 2. The vehicle reaches its `vehicleCapacityLimit`.
        // 3. The next client's arrival time exceeds the `absoluteDepartureDeadline` for this vehicle.
        while (currentClientPointer < totalClientCount &&
               clientsCurrentlyOnboard < vehicleCapacityLimit &&
               clientArrivalTimestamps[currentClientPointer] <= absoluteDepartureDeadline) {
            clientsCurrentlyOnboard++; // Increment count of clients on this vehicle.
            currentClientPointer++;    // Advance to consider the next client in the queue.
        }
        // Once the inner loop concludes, the current vehicle is considered full or dispatched.
    }

    // --- Step 4: Present the Final Outcome ---
    // Output the total number of vehicles that were dispatched.
    console.log(dispatchedVehicleCount);
}

// --- Program Entry Point and Execution Context (Type III Structural Change) ---
// This immediately-invoked function expression (IIFE) serves as the main entry point
// for the application, handling file I/O and potential errors gracefully.
(function initializeAndExecute() {
    try {
        // Read the entire content of the standard input file.
        const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
        // Pass the read content to our main logic function for processing.
        manageTransportationLogistics(fileData);
    } catch (operationError) {
        // Catch and report any errors that occur during file reading or subsequent processing.
        console.error("An unexpected issue occurred during program execution:", operationError.message);
        // Optionally, provide a more detailed stack trace for debugging.
        // console.error(operationError.stack);
    }
})();