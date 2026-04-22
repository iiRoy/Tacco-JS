// This section simulates the functionality of a base "model" creator and its extension mechanism.
// It uses factory functions to generate "blueprint" functions which then create instances.

// A central registry for managing event listeners across instances created by a blueprint.
// This is a simplified, instance-level event system rather than a global one.
const eventSystem = (function() {
  const allListeners = new WeakMap(); // Stores listeners for each object instance

  return {
    // Attaches a handler function to a specific event for a given object.
    attachHandler(subject, eventLabel, handlerCallback) {
      if (!allListeners.has(subject)) {
        allListeners.set(subject, {});
      }
      const subjectListeners = allListeners.get(subject);
      if (!subjectListeners[eventLabel]) {
        subjectListeners[eventLabel] = [];
      }
      subjectListeners[eventLabel].push(handlerCallback);
      return subject; // For method chaining
    },

    // Detaches a specific handler function from an event for a given object.
    detachHandler(subject, eventLabel, handlerCallback) {
      if (allListeners.has(subject)) {
        const subjectListeners = allListeners.get(subject);
        if (subjectListeners[eventLabel]) {
          subjectListeners[eventLabel] = subjectListeners[eventLabel].filter(
            (cb) => cb !== handlerCallback
          );
        }
      }
      return subject; // For method chaining
    },

    // Notifies all registered handlers for a specific event on a given object.
    broadcastEvent(subject, eventLabel, ...eventArguments) {
      if (allListeners.has(subject)) {
        const subjectListeners = allListeners.get(subject);
        if (subjectListeners[eventLabel]) {
          // Call handlers with the subject as 'this' context
          subjectListeners[eventLabel].forEach((cb) =>
            cb.apply(subject, eventArguments)
          );
        }
      }
      return subject; // For method chaining
    },
  };
})();

// Creates a base factory function (blueprint) for entities.
function establishEntityBlueprint(baseDefinitions) {
  // This function acts as the "constructor" for instances of this blueprint.
  return function(initializationData) {
    const instance = { ...baseDefinitions
    }; // Start with base properties

    // Mix in event system methods, bound to the instance
    instance.registerForSignal = eventSystem.attachHandler.bind(null, instance);
    instance.deregisterFromSignal = eventSystem.detachHandler.bind(
      null,
      instance
    );
    instance.emitSignal = eventSystem.broadcastEvent.bind(null, instance);

    // If an 'boot' method exists in the definitions, call it for initialization.
    if (typeof instance.boot === "function") {
      instance.boot(initializationData);
    }

    // Ensure all methods are bound to the instance for consistent 'this' context.
    for (const key in instance) {
      if (
        typeof instance[key] === "function" &&
        key !== "boot" && // boot is called once, not rebound
        !["registerForSignal", "deregisterFromSignal", "emitSignal"].includes(
          key
        ) // Event methods are already bound
      ) {
        instance[key] = instance[key].bind(instance);
      }
    }

    return instance;
  };
}

// Creates a new blueprint by inheriting from an existing one, overriding properties.
function createDerivedBlueprint(parentBlueprint, childDefinitions) {
  // Create a temporary instance of the parent to get its default properties.
  // We pass an empty object to parentBlueprint as we don't want to run its 'boot' method here.
  const parentDefaults = parentBlueprint({});

  // Merge parent properties with child definitions, child definitions take precedence.
  const combinedDefinitions = { ...parentDefaults,
    ...childDefinitions
  };

  // Return a new blueprint factory based on these combined definitions.
  return establishEntityBlueprint(combinedDefinitions);
}

// Define the "Ocean Explorer" (Pirate equivalent) blueprint.
const oceanExplorerBlueprint = establishEntityBlueprint({
  favoriteDrink: "GROG",
  drinkCounter: 0,

  boot: function(personalIdentifier) {
    this.personalIdentifier = personalIdentifier;
  },

  consumeBeverage: function() {
    this.drinkCounter++;
    if (this.drinkCounter >= 100) {
      this.emitSignal("overIndulged");
    }
    return this; // For method chaining
  },

  proclaimDesire: function() {
    console.log("DEMAND MORE: " + this.favoriteDrink);
  },
});

// Define the "Fleet Commander" (Captain equivalent) blueprint, inheriting from Ocean Explorer.
const fleetCommanderBlueprint = createDerivedBlueprint(
  oceanExplorerBlueprint, {
    favoriteDrink: "STRONG GROG" // Override the favorite drink
  }
);

// Create an instance of the Fleet Commander.
const commandingOfficer = fleetCommanderBlueprint("Blackbeard");
let operationCycles = 20;

// Register the proclaimDesire method as an event handler for 'overIndulged'.
commandingOfficer.registerForSignal(
  "overIndulged",
  commandingOfficer.proclaimDesire
);

// Define a dummy callback function.
function temporaryObserver() {
  console.error("BELAY THAT!");
}

// Register and then immediately deregister the dummy callback.
commandingOfficer.registerForSignal("overIndulged", temporaryObserver);
commandingOfficer.deregisterFromSignal("overIndulged", temporaryObserver);

// Execute the operation cycles, consuming beverages.
while (operationCycles--) {
  commandingOfficer
    .consumeBeverage()
    .consumeBeverage()
    .consumeBeverage()
    .consumeBeverage()
    .consumeBeverage();
}