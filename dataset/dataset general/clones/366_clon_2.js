var Blueprint = acquire("./skeleton"); // Bring in the core framework for objects

var Buccaneer = Blueprint({ // Define a new archetype for sea-faring adventurers
    favors: "RUM", // Default preferred beverage for this type
    initialize: function (label) { // Constructor for creating a new Buccaneer
        this.label = label; // Assign a unique identifier to this individual
        this.rations = 0; // Initialize the count of consumed beverages
    },
    imbibe: function () { // Method to consume a beverage
        if (++this.rations >= 50) { // Check if the consumption limit has been reached
            this.dispatch("inebriated"); // Signal that the limit is exceeded
        }
    },
    shout: function () { // Method for an audible declaration
        console.info("CRAVE MORE: " + this.favors); // Announce the current craving
    }
});

var Skipper = Buccaneer.inherit({ // Create a specialized version of the Buccaneer
    favors: "AGED RUM" // Override the default preference for this specialized type
});

var skipperInstance = new Skipper("Blackbeard"), // Instantiate a specific Skipper
    iterations = 30; // Set the total number of action cycles

skipperInstance.attach("inebriated", skipperInstance.shout); // Link a specific event to a reaction

function uninvokedCallback() { // A placeholder routine, not expected to run
    console.warn("BLIMEY!"); // Output a warning if this unexpected routine is ever called
}

skipperInstance.attach("inebriated", uninvokedCallback); // Temporarily add a secondary reaction
skipperInstance.detach("inebriated", uninvokedCallback); // Remove the secondary reaction immediately

while (iterations--) { // Loop through the defined number of action cycles
    skipperInstance
        .imbibe() // Perform the primary action
        .imbibe() // Repeat the primary action
        .imbibe() // Continue the primary action
        .imbibe() // Yet another primary action
        .imbibe(); // Final primary action in this cycle
}