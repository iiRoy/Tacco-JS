/*
 * This script demonstrates advanced JavaScript prototype inheritance mechanisms,
 * focusing on property lookup, modification, and the impact across a prototype chain.
 * This is a Type III clone of an original script, featuring extensive
 * identifier renaming, structural modifications, and additional logical fragments.
 */

// Define a custom output utility for consistent logging throughout the application.
// This replaces direct 'print' calls with a more structured approach,
// including a prefix for clarity in console output.
const outputLogger = (messageContent) => {
    // In typical browser or Node.js environments, 'console.log' is used.
    // If 'print' were a global function (e.g., in SpiderMonkey), this would adapt.
    console.log(`[APP_DEMO_OUTPUT]: ${messageContent}`);
};

// Encapsulate the entire demonstration within an Immediately Invoked Function Expression (IIFE)
// to prevent global scope pollution and create a distinct execution context.
(function executePrototypeChainShowcase() {

    // --- Section 1: Definition of the Base Prototype Object ---

    // Establish a foundational entity. Renamed 'animal' to 'baseEntitySchema'.
    // Property names 'length' and 'width' are generalized to 'primarySizeMetric' and 'secondarySizeMetric'.
    // Numerical values are slightly adjusted for Type III variation.
    const baseEntitySchema = {
        primarySizeMetric: 13.5, // Represents a core primary dimension.
        secondarySizeMetric: 7.2  // Represents a core secondary dimension.
    };

    // To ensure the integrity of the base schema, it is frozen, preventing direct modifications
    // that could inadvertently alter its fundamental properties. This is an added robustness feature.
    Object.freeze(baseEntitySchema);

    // --- Section 2: Creation of the First Derived Prototype Object ---

    // Generate a new object, 'creatureDescriptor', which inherits directly from 'baseEntitySchema'.
    // The legacy '__proto__' syntax is replaced by the modern 'Object.create()' method,
    // which is the standard way to set up prototype chains.
    // The original 'dog' variable is renamed to 'creatureDescriptor'.
    // The 'barks' property is renamed to 'hasVocalizationCapability'.
    let creatureDescriptor = Object.create(baseEntitySchema);
    creatureDescriptor.hasVocalizationCapability = true; // A specific trait for this descriptor.

    // Display the properties accessed through 'creatureDescriptor'.
    // These values are inherited from 'baseEntitySchema'. Property access is now via dot notation.
    const inheritedPrimaryMetric = creatureDescriptor.primarySizeMetric;
    const inheritedSecondaryMetric = creatureDescriptor.secondarySizeMetric;
    outputLogger(`Creature Descriptor's Initial Primary Metric (inherited): ${inheritedPrimaryMetric}`);
    outputLogger(`Creature Descriptor's Initial Secondary Metric (inherited): ${inheritedSecondaryMetric}`);

    // --- Section 3: Creation of a Second-Level Derived Object with Property Shadowing ---

    // Create an even more specialized object, 'specificVariantInstance', inheriting from 'creatureDescriptor'.
    // The original 'lab' variable is renamed to 'specificVariantInstance'.
    // It introduces its own 'primarySizeMetric', thereby shadowing the inherited one.
    const specificVariantInstance = Object.create(creatureDescriptor);
    specificVariantInstance.primarySizeMetric = 2.4; // This value overrides the inherited 'primarySizeMetric'.

    // Retrieve and log the properties of 'specificVariantInstance'.
    // This illustrates how property lookups traverse the prototype chain.
    const variantOwnPrimaryMetric = specificVariantInstance.primarySizeMetric; // Direct property on specificVariantInstance.
    const variantInheritedSecondaryMetric = specificVariantInstance.secondarySizeMetric; // Inherited from baseEntitySchema via creatureDescriptor.
    const variantInheritedVocalization = specificVariantInstance.hasVocalizationCapability; // Inherited from creatureDescriptor.

    outputLogger(`Specific Variant's Overridden Primary Metric: ${variantOwnPrimaryMetric}`);
    outputLogger(`Specific Variant's Inherited Secondary Metric: ${variantInheritedSecondaryMetric}`);

    // Add a conditional check (guard clause) before displaying the boolean capability,
    // ensuring the property exists and is of the expected type.
    if (typeof variantInheritedVocalization === 'boolean' && variantInheritedVocalization === true) {
        outputLogger(`Specific Variant possesses Vocalization Capability: ${variantInheritedVocalization}`);
    } else {
        outputLogger("Specific Variant does not have a confirmed vocalization capability.");
    }

    // --- Section 4: Demonstrating Property Modification and Its Prototypical Effects ---

    // Introduce a new helper variable for the updated dimension value.
    const updatedBreadthValue = 19.6;

    // Modify the 'secondarySizeMetric' directly on 'creatureDescriptor'.
    // This action adds a new property to 'creatureDescriptor' itself,
    // shadowing the 'secondarySizeMetric' property from 'baseEntitySchema' for all subsequent lookups
    // that pass through 'creatureDescriptor'.
    creatureDescriptor.secondarySizeMetric = updatedBreadthValue;

    // Display the effect of the modification on 'creatureDescriptor'.
    outputLogger(`Updated Creature Descriptor's Secondary Metric: ${creatureDescriptor.secondarySizeMetric}`);

    // Confirm that the 'baseEntitySchema' remains unaffected by the modification to 'creatureDescriptor'.
    // This highlights that direct assignment only affects the object it's performed on.
    outputLogger(`Base Entity Schema's Secondary Metric (remains unchanged): ${baseEntitySchema.secondarySizeMetric}`);

    // Observe how the modification to 'creatureDescriptor' impacts 'specificVariantInstance'.
    // Since 'specificVariantInstance' does not have its own 'secondarySizeMetric',
    // its lookup will now find the updated value on 'creatureDescriptor'.
    outputLogger(`Specific Variant's Secondary Metric (now reflects Creature Descriptor's update): ${specificVariantInstance.secondarySizeMetric}`);

    // --- Section 5: Additional Code Fragment - Derived Calculation ---

    // Introduce a new fragment: a calculation using the derived and inherited properties.
    // This demonstrates adding intermediate steps and further processing.
    const combinedDimensionsTotal = specificVariantInstance.primarySizeMetric + specificVariantInstance.secondarySizeMetric;
    outputLogger(`Calculated sum of primary and secondary metrics for specific variant: ${combinedDimensionsTotal.toFixed(2)}`);

})(); // End of IIFE.