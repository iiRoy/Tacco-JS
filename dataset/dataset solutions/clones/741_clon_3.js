const fileSystemModule = require('fs'); // Renamed 'fs' to 'fileSystemModule' for clarity

/**
 * Parses a single line of input representing activation rules or initial activators.
 * Expected formats:
 * - "label:item1,item2,item3;" (for rules)
 * - "item1,item2,item3;" (for initial activators, where label is effectively empty)
 * @param {string | undefined} inputLine The raw input string line.
 * @returns {{label: string, items: string[]}} Parsed rule object. Returns empty for invalid input.
 */
function parseRuleEntry(inputLine) {
    if (typeof inputLine !== 'string' || inputLine.trim().length === 0) {
        // Guard clause for empty or invalid lines, preventing errors on malformed input.
        return { ruleIdentifier: '', activatedItems: [] };
    }

    // Split into label and items string using the first colon only.
    // Use `split(':', 2)` to handle cases where item names might contain colons.
    const parts = inputLine.split(':', 2);
    let ruleIdentifier = '';
    let itemString = inputLine;

    if (parts.length === 2) {
        ruleIdentifier = parts[0].trim();
        itemString = parts[1].trim();
    } else {
        // If no colon, the entire line is considered the item string,
        // typically for the initial activator list without a label.
        itemString = parts[0].trim();
    }

    // Remove any trailing semicolon, then split by comma.
    // Filter out empty strings that might result from extra commas (e.g., "a,,b").
    const activatedItems = itemString
        .replace(/;$/, '') // Remove trailing semicolon
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== ''); // Ensure no empty item strings

    return { ruleIdentifier: ruleIdentifier, activatedItems: activatedItems };
}

// Read the entire standard input content synchronously.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines, removing any leading/trailing whitespace
// from the whole input string before splitting.
const inputLinesBuffer = rawInputContent.trim().split('\n');

// The main processing loop continues until a termination signal is received.
while (true) {
    // Extract the numerical count for the current test case or rule set.
    // Using `parseInt` with radix 10 for explicit and safe number conversion.
    const currentCaseLineCount = parseInt(inputLinesBuffer.shift(), 10);

    // If the extracted count is zero, it signifies the end of input.
    if (currentCaseLineCount === 0) {
        break; // Terminate the main processing loop.
    }

    // --- Data Structures Initialization for Current Case ---

    // `activeEntityStates` maps entity names to a boolean state:
    // `true`: The entity is active and its dependencies need to be processed.
    // `false`: The entity is active, but its dependencies have already been processed in a previous pass.
    // This allows re-processing if an entity marked `false` is re-activated by another rule.
    const activeEntityStates = new Map();

    // `dependencyRuleMap` stores the propagation rules:
    // `key` (string): The entity that, when active, triggers others.
    // `value` (string[]): An array of entities activated by the key entity.
    const dependencyRuleMap = new Map();

    // --- Phase 1: Parse Initial Activators ---

    // The first line for each test case defines the initial set of active entities.
    const initialActivatorSpecLine = inputLinesBuffer.shift();
    const initialActivatorData = parseRuleEntry(initialActivatorSpecLine);

    // Populate the initial active entities, marking them all as needing processing (`true`).
    for (const entityName of initialActivatorData.activatedItems) {
        activeEntityStates.set(entityName, true);
    }

    // --- Phase 2: Parse Dependency Rules ---

    // Loop to read and store the remaining `currentCaseLineCount - 1` dependency rules.
    for (let ruleIdx = 0; ruleIdx < currentCaseLineCount - 1; ruleIdx++) {
        const ruleDeclarationLine = inputLinesBuffer.shift();
        const parsedRule = parseRuleEntry(ruleDeclarationLine);

        // Store the rule: `ruleIdentifier` activates `activatedItems`.
        if (parsedRule.ruleIdentifier) { // Ensure a valid identifier exists
            dependencyRuleMap.set(parsedRule.ruleIdentifier, parsedRule.activatedItems);
        }
    }

    // --- Phase 3: Iterative Propagation of Activations ---

    let totalUniqueEntitiesBeforePass = 0; // Tracks the count of unique active entities to detect stability.

    // This loop continues until no new unique entities are activated in a full pass,
    // indicating that the propagation has reached a stable state (fixed point).
    while (true) {
        totalUniqueEntitiesBeforePass = activeEntityStates.size; // Record the total count before this pass.

        // Collect all entities that are currently marked as needing processing (`true`).
        // This temporary array prevents issues from modifying the map during iteration.
        const entitiesToPropagateInThisIteration = [];
        for (const [entityKey, needsProcessing] of activeEntityStates.entries()) {
            if (needsProcessing) {
                entitiesToPropagateInThisIteration.push(entityKey);
            }
        }

        // Process each entity that needs propagation in this iteration.
        for (const currentActivatorKey of entitiesToPropagateInThisIteration) {
            // Mark the current activator as having had its dependencies processed for this round.
            activeEntityStates.set(currentActivatorKey, false);

            // Check if this activator has any defined propagation rules.
            if (dependencyRuleMap.has(currentActivatorKey)) {
                const dependentEntities = dependencyRuleMap.get(currentActivatorKey);

                // For each entity that this activator activates:
                for (const dependentItem of dependentEntities) {
                    // Activate the dependent item. Setting its state to `true` ensures
                    // it will be processed in a future pass if it's new or was previously processed (`false`).
                    activeEntityStates.set(dependentItem, true);
                }
            }
        }

        // If the total number of unique active entities hasn't increased after this pass,
        // it means no new distinct entities were added to the `activeEntityStates` map.
        if (activeEntityStates.size === totalUniqueEntitiesBeforePass) {
            break; // Propagation has stabilized, exit the loop.
        }
    }

    // --- Phase 4: Output Final Count ---

    // The final count is the total number of unique entities that became active throughout the process.
    const finalActiveEntityCount = activeEntityStates.size;
    console.log(finalActiveEntityCount);
}

// The script finishes execution when the main loop breaks (encountering a '0' rule count).