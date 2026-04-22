var creatureBase = {
    "measurementX": 22, // Defines the primary spatial extent
    "measurementY": 11  // Defines the secondary spatial extent
}; // End of creatureBase definition

var k9Unit = {
    "__proto__": creatureBase, // Establishes the prototype chain to creatureBase
    "makesSound": false        // Indicates if this type of creature produces vocalizations
}; // End of k9Unit definition

// Output the inherited properties for k9Unit
outputValue(k9Unit["measurementX"]);
outputValue(k9Unit["measurementY"]);


// A more specialized type of k9Unit
var goldenRetriever = {
    "__proto__": k9Unit, // Inherits properties and methods from k9Unit
    "measurementX": 3    // Overrides the primary spatial extent for this specific breed
}; // End of goldenRetriever definition

// Display the characteristics of the goldenRetriever
outputValue(goldenRetriever["measurementX"]);
outputValue(goldenRetriever["measurementY"]);
outputValue(goldenRetriever["makesSound"]);

// Modify a property directly on the k9Unit object
k9Unit["measurementY"] = 33; // Update the secondary dimension for all k9Units

// Observe the updated values
outputValue(k9Unit["measurementY"]);        // This will reflect the direct modification
outputValue(creatureBase["measurementY"]); // The base object's property remains unchanged

outputValue(goldenRetriever["measurementY"]); // This will now reflect the change in k9Unit due to prototype inheritance