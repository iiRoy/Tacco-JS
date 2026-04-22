const fileSystemAccess = require("node:fs");
const standardInputFilePath = "/dev/stdin";

/**
 * Utility function to parse a string line into an array of numbers.
 * Includes basic validation to handle malformed input gracefully.
 * @param {string} inputLine - The string line to be parsed.
 * @returns {number[]} An array of numbers extracted from the line.
 */
const extractNumericValues = (inputLine) => {
    if (typeof inputLine !== 'string' || inputLine.trim() === '') {
        return [];
    }
    // Split by space, convert to Number, and filter out any non-numeric results
    return inputLine.split(' ').map(str => Number(str)).filter(num => !isNaN(num));
};

// Read the entire content from the standard input synchronously.
const rawContentBuffer = fileSystemAccess.readFileSync(standardInputFilePath, { encoding: "utf8" });

// Split the content into an array of lines, trimming whitespace and handling various line endings.
const allInputDataRows = rawContentBuffer.trim().split(/\r?\n/);

// The first line contains the total number of elements (N) and the number of connections (M).
const [totalElementsQuantity, totalConnectionCount] = extractNumericValues(allInputDataRows[0]);

// Validate initial parameters; if invalid, the subsequent logic might produce unexpected results.
// For this problem, we assume valid non-negative integer inputs as per typical competitive programming.
if (isNaN(totalElementsQuantity) || isNaN(totalConnectionCount) || totalElementsQuantity < 0 || totalConnectionCount < 0) {
    // In a production scenario, one might throw an error or log a warning.
    // For competitive programming, usually inputs are guaranteed valid.
}

// This array will hold objects, where each object represents a distinct connected component.
// Each component object stores its 'memberCount' (number of unique elements)
// and uses numeric keys (element IDs) with a 'true' value to indicate element presence.
const componentSetCollection = [];

/**
 * Searches the `componentSetCollection` for a specific element ID.
 * @param {number} soughtElementId - The ID of the element to locate.
 * @param {Array<Object>} existingSets - The array of component objects to search within.
 * @returns {number|null} The index of the component containing the element, or null if not found.
 */
const findElementSetIndex = (soughtElementId, existingSets) => {
    for (let currentSetIdx = 0; currentSetIdx < existingSets.length; currentSetIdx++) {
        if (existingSets[currentSetIdx][soughtElementId]) {
            return currentSetIdx;
        }
    }
    return null; // Element is not part of any known component set
};

// Iterate through each connection entry starting from the second line of input.
for (let currentConnectionRow = 1; currentConnectionRow <= totalConnectionCount; currentConnectionRow++) {
    const connectionLineText = allInputDataRows[currentConnectionRow];

    // Robustly skip empty or malformed lines that might occur in input (Type III addition).
    if (!connectionLineText || connectionLineText.trim() === '') {
        continue;
    }

    // Parse the two element IDs involved in the current connection.
    const [nodeAlpha, nodeBeta] = extractNumericValues(connectionLineText);

    // If parsing failed for any node, skip this connection.
    if (nodeAlpha === undefined || nodeBeta === undefined) {
        continue;
    }

    // Determine which component set (if any) each node belongs to.
    let alphaSetIndex = findElementSetIndex(nodeAlpha, componentSetCollection);
    let betaSetIndex = findElementSetIndex(nodeBeta, componentSetCollection);

    // Case 1: Both nodes are new; neither belongs to an existing component set.
    if (alphaSetIndex === null && betaSetIndex === null) {
        // Create a brand new component set containing only these two nodes.
        const newComponentSet = { memberCount: 2 };
        newComponentSet[nodeAlpha] = true;
        newComponentSet[nodeBeta] = true;
        componentSetCollection.push(newComponentSet);
    }
    // Case 2: Node Alpha is new, but Node Beta is already in a component set.
    else if (alphaSetIndex === null && betaSetIndex !== null) {
        const targetComponent = componentSetCollection[betaSetIndex];
        // Add Node Alpha to Beta's component set if it's not already present.
        // This check is a safeguard, as `alphaSetIndex === null` implies it's not present.
        if (!targetComponent[nodeAlpha]) {
            targetComponent[nodeAlpha] = true;
            targetComponent.memberCount++; // Increment the count of members in the set.
        }
    }
    // Case 3: Node Beta is new, but Node Alpha is already in a component set.
    else if (alphaSetIndex !== null && betaSetIndex === null) {
        const targetComponent = componentSetCollection[alphaSetIndex];
        // Add Node Beta to Alpha's component set.
        if (!targetComponent[nodeBeta]) {
            targetComponent[nodeBeta] = true;
            targetComponent.memberCount++; // Increment the count of members.
        }
    }
    // Case 4: Both nodes are already part of existing component sets.
    else {
        // Sub-case 4a: Both nodes are already in the *same* component set.
        if (alphaSetIndex === betaSetIndex) {
            // No action needed; they are already connected.
        }
        // Sub-case 4b: Nodes are in *different* component sets, so these two sets must be merged.
        else {
            const primaryComponent = componentSetCollection[alphaSetIndex];
            const secondaryComponent = componentSetCollection[betaSetIndex];

            // Merge all members and the member count from the secondary component into the primary component.
            // Iterating through properties of the secondary component.
            for (const propertyKey in secondaryComponent) {
                // Ensure we are only dealing with own properties of the object, not inherited ones.
                if (Object.prototype.hasOwnProperty.call(secondaryComponent, propertyKey)) {
                    if (propertyKey === 'memberCount') {
                        // Sum the member counts from both components.
                        primaryComponent.memberCount += secondaryComponent.memberCount;
                    } else {
                        // Add elements from the secondary component to the primary component.
                        // Since they were in distinct components, there should be no key conflicts.
                        primaryComponent[propertyKey] = true;
                    }
                }
            }

            // Remove the secondary component from the collection as it has been absorbed into the primary.
            // This effectively "merges" them by keeping one and deleting the other.
            componentSetCollection.splice(betaSetIndex, 1);
        }
    }
}

// After processing all connections, calculate the total number of unique elements
// that are part of any identified component set.
let aggregatedMemberCount = 0;
for (const individualComponent of componentSetCollection) {
    aggregatedMemberCount += individualComponent.memberCount;
}

// The final calculation determines the minimum number of additional connections required
// to make all `totalElementsQuantity` elements form a single connected graph.
// This is derived from the formula: (Total number of components - 1).
// The total number of components includes explicitly identified components
// PLUS any elements that were never part of any connection (isolated elements).
// `componentSetCollection.length` = number of explicit components.
// `totalElementsQuantity - aggregatedMemberCount` = number of isolated elements.
// Summing these gives the total number of disconnected components.
// Subtracting 1 gives the edges needed to connect them all.
console.log(componentSetCollection.length + totalElementsQuantity - aggregatedMemberCount - 1);