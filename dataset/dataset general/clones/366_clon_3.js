// This module provides object construction capabilities, akin to a factory for creating structured entities.
const ObjectConstructor = require("./objectBuilder"); // Importing a foundational module (Node.js specific).

// Define a base archetype for seafaring individuals, establishing core characteristics and behaviors.
const Seadog = ObjectConstructor({
  // This property indicates the preferred type of alcoholic beverage for this seadog.
  preferredBev: "RUM", // An instance property, default preference.

  // The primary setup routine, serving as the constructor for new Seadog instances.
  setup: function(designation) {
    // Assign the given designation to the instance. If none is provided, use a default.
    this.designation = designation || "Unknown Mariner"; // 'designation' is the equivalent of 'name'.
    // Initialize the counter for consumed libations (alcoholic drinks).
    this.libationsTaken = 0; // 'libationsTaken' is the equivalent of 'grogs'.
  },

  // Method to consume a beverage, simulating the act of drinking.
  quaff: function() {
    // Increment the count of beverages consumed.
    this.libationsTaken++;
    // Check if the individual has consumed an excessive amount, triggering an event if so.
    if (this.libationsTaken >= 120) { // Changed the threshold from 100 to 120.
      // Dispatch a custom event to notify listeners of the individual's state change.
      this.dispatchNotice("intoxicated"); // Renamed the event from "drunk" to "intoxicated".
    }
    // Return the instance itself to allow for method chaining.
    return this;
  },

  // Method to loudly express a desire, often a battle cry or a craving.
  proclaimDesire: function() {
    // Output a message to the console, using a template literal for dynamic content.
    console.info(`Aye, matey! I crave more of that fine ${this.preferredBev}!`); // Rewritten log message.
  }
});

// Extend the base Seadog archetype to create a more specialized Skipper (Captain).
const Skipper = Seadog.extend({
  // The Skipper has a distinct preference for a different, perhaps stronger, beverage.
  preferredBev: "AGED RUM" // Overriding the preferred beverage property.
});

// Initialize a new Skipper instance with a specific moniker.
const initialMoniker = "Blackbeard"; // Using a helper variable for the initial name.
const fleetCommander = new Skipper(initialMoniker); // Creating an instance using 'const'.
let sipsRemaining = 25; // Defining the number of simulation cycles, changed from 20 to 25.

// A temporary callback function that will be attached and then promptly removed.
function temporaryObservationHandler() {
  console.warn("A fleeting observation: The commander appears to be nearing a state of inebriation!");
}

// Attach an event listener: when the commander becomes "intoxicated", they will proclaim their desire.
// The .bind() method is used to ensure the 'this' context within proclaimDesire refers to 'fleetCommander'.
fleetCommander.addListener("intoxicated", fleetCommander.proclaimDesire.bind(fleetCommander));

// Demonstrate adding and immediately removing a transient event listener.
fleetCommander.addListener("intoxicated", temporaryObservationHandler);
fleetCommander.removeListener("intoxicated", temporaryObservationHandler);

// Simulate multiple consumption cycles for the fleet commander.
for (let currentCycle = 0; currentCycle < sipsRemaining; currentCycle++) {
  // Log the current progress in the consumption simulation.
  console.log(`--- Consumption Cycle #${currentCycle + 1} of ${sipsRemaining} ---`);

  try {
    // The commander engages in a rapid sequence of beverage consumption.
    // The number of 'quaff' calls per cycle has been increased from 5 to 7.
    fleetCommander
      .quaff()
      .quaff()
      .quaff()
      .quaff()
      .quaff()
      .quaff()
      .quaff();
  } catch (err) {
    // Implement basic error handling for the quaffing process.
    console.error(`An unexpected issue occurred during quaffing in cycle ${currentCycle + 1}:`, err.message);
    break; // Halt the simulation if an error is encountered.
  }

  // Add an intermediate check or validation during the simulation.
  if (fleetCommander.libationsTaken > 50 && fleetCommander.libationsTaken < 100) {
      console.log(`(Internal check: Libations count is ${fleetCommander.libationsTaken}. Still somewhat coherent.)`);
  }
}

// After the simulation, perform a final status check and report.
if (fleetCommander.libationsTaken >= 120) {
    console.error("The fleet commander has reached their maximum tolerance and is thoroughly intoxicated!");
} else {
    console.log(`The fleet commander consumed ${fleetCommander.libationsTaken} beverages but remains somewhat in control.`);
}