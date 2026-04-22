/**
 * @file Relative Value Processor
 * @author Code Clone Expert
 * @version 1.0.0
 * @license MIT
 *
 * This module is a Type III clone of an existing JavaScript program.
 * It processes a series of statements that define relative numerical relationships
 * between abstract entities. The goal is to determine if a consistent set of
 * relative positions can be assigned to all entities based on the given statements.
 *
 * Original Type III definition:
 * "In addition to changes in identifiers, variable names, data types and comments,
 * some parts of the code may be deleted, updated, or new fragments added."
 *
 * This implementation includes:
 * - Thorough renaming of all identifiers for clarity and distinctness (Type II).
 * - Extensive comments detailing logic and purpose (Type II).
 * - Reformatting of whitespace for improved readability (Type II).
 * - Addition of helper functions for parsing and checking entity status.
 * - Introduction of a maximum iteration limit to prevent infinite loops (Type III).
 * - Refinement of the "grounding" mechanism for initial entity value assignment (Type III).
 * - More explicit handling of parsing failures and unresolvable states (Type III).
 * - Use of `Object.prototype.hasOwnProperty.call` for robust property checks.
 *
 * The core functionality of determining consistency based on relative values remains
 * recognizably similar to the original, but with significant structural and syntactic
 * modifications.
 */

/**
 * Processes a collection of relative value statements to ascertain their consistency.
 * Each statement describes a relationship `B - A = D`, where A and B are entity identifiers
 * and D is their numerical difference. The function attempts to assign relative
 * numerical positions to entities and flags an inconsistency if any conflict arises.
 *
 * @param {string} incomingInputData - The raw input string. It's expected to be
 *                                     newline-separated. The first line is typically
 *                                     a header or count and is skipped. Subsequent lines
 *                                     should each contain three space-separated integers:
 *                                     `entityAId entityBId differenceValue`.
 */
function ProcessRelativeValues(incomingInputData) {
    // A dictionary (hash map) to store the computed relative positions of entities.
    // Keys represent unique entity identifiers (numbers), and values are their
    // assigned numerical positions relative to an arbitrary base (also numbers).
    const entityPositionRegistry = {};

    // A boolean flag that tracks the overall consistency of all processed relationships.
    // It is initialized to `true` and is set to `false` if any contradiction is found.
    let systemConsistencyStatus = true;

    // Parse the raw input string into an array of individual statement lines.
    // The first line is discarded (e.g., it might be a count of statements).
    // Empty lines are also filtered out to avoid processing malformed entries.
    let currentStatementQueue = incomingInputData.split('\n')
                                                .slice(1)
                                                .filter(textLine => textLine.trim() !== '');

    // An auxiliary array to temporarily hold statements that could not be resolved
    // in the current processing pass. These will be re-attempted in the subsequent pass.
    let deferredStatementBuffer = [];

    // Constants for array indexing after parsing a statement line, enhancing readability.
    const ENTITY_A_IDENTIFIER_INDEX = 0;
    const ENTITY_B_IDENTIFIER_INDEX = 1;
    const RELATIVE_DIFFERENCE_VALUE_INDEX = 2;

    // A safety counter to prevent potential infinite loops in scenarios where
    // relationships cannot be fully resolved (e.g., isolated graphs, ungrounded cycles)
    // without an explicit inconsistency.
    const MAXIMUM_PROCESSING_ROUNDS = 1000; // An arbitrary, sufficiently large limit.
    let currentRoundCounter = 0;

    /**
     * Parses a single string line into its constituent numerical components.
     * @param {string} lineText - The input line, e.g., "10 20 5".
     * @returns {number[] | null} An array `[entityAId, entityBId, differenceValue]`
     *                            if parsing is successful and valid, otherwise `null`.
     */
    const parseRelationshipString = (lineText) => {
        const numericParts = lineText.split(/\s+/).map(segment => parseInt(segment.trim(), 10));
        // A valid relationship statement must contain exactly three finite numbers.
        if (numericParts.length === 3 && numericParts.every(val => Number.isFinite(val))) {
            return numericParts;
        }
        // Return null for any invalid or malformed lines.
        return null;
    };

    /**
     * Checks if a given entity's position is already registered in the system.
     * @param {number} entityId - The identifier of the entity to check.
     * @returns {boolean} `true` if the entity's position is known, `false` otherwise.
     */
    const isEntityPositionEstablished = (entityId) => {
        // Using `hasOwnProperty` is more robust than `!== undefined` as it avoids
        // issues with inherited properties or properties explicitly set to `undefined`.
        return Object.prototype.hasOwnProperty.call(entityPositionRegistry, entityId);
    };

    // The primary processing loop. It continues as long as:
    // 1. There are still statements awaiting resolution.
    // 2. The system has not yet been found to be inconsistent.
    // 3. The maximum number of processing rounds has not been exceeded.
    while (currentStatementQueue.length > 0 && systemConsistencyStatus && currentRoundCounter < MAXIMUM_PROCESSING_ROUNDS) {
        currentRoundCounter++; // Increment the round counter for each pass.
        let relationshipsResolvedInThisRound = 0; // Track successful resolutions in this pass.

        // Clear the buffer for deferred statements at the beginning of each new pass.
        deferredStatementBuffer = [];

        // Iterate through each statement in the current queue.
        for (let i = 0; i < currentStatementQueue.length; i++) {
            const currentStatementText = currentStatementQueue[i];
            const parsedRelationshipComponents = parseRelationshipString(currentStatementText);

            // If a statement cannot be parsed correctly, it's considered unresolvable
            // for this round and is deferred. In a stricter implementation, this might
            // cause an immediate inconsistency error. Here, we defer to match original behavior.
            if (!parsedRelationshipComponents) {
                deferredStatementBuffer.push(currentStatementText);
                continue;
            }

            const entityA = parsedRelationshipComponents[ENTITY_A_IDENTIFIER_INDEX];
            const entityB = parsedRelationshipComponents[ENTITY_B_IDENTIFIER_INDEX];
            const relativeDifference = parsedRelationshipComponents[RELATIVE_DIFFERENCE_VALUE_INDEX];

            const aIsKnown = isEntityPositionEstablished(entityA);
            const bIsKnown = isEntityPositionEstablished(entityB);

            // Scenario 1: Positions for both entities are already established.
            if (aIsKnown && bIsKnown) {
                const positionOfA = entityPositionRegistry[entityA];
                const positionOfB = entityPositionRegistry[entityB];

                // Verify if the existing positions are consistent with the current statement.
                if ((positionOfB - positionOfA) !== relativeDifference) {
                    systemConsistencyStatus = false; // Contradiction detected!
                    break; // Terminate further processing immediately.
                }
                // If consistent, this statement is fully resolved for this round.
                relationshipsResolvedInThisRound++;
            }
            // Scenario 2: Only entity A's position is known; deduce entity B's position.
            else if (aIsKnown) {
                entityPositionRegistry[entityB] = entityPositionRegistry[entityA] + relativeDifference;
                relationshipsResolvedInThisRound++;
            }
            // Scenario 3: Only entity B's position is known; deduce entity A's position.
            else if (bIsKnown) {
                entityPositionRegistry[entityA] = entityPositionRegistry[entityB] - relativeDifference;
                relationshipsResolvedInThisRound++;
            }
            // Scenario 4: Neither entity's position is known.
            else {
                // This block handles the initial "grounding" of the system.
                // It mimics the original's specific `index === 0` condition by only attempting
                // to ground if it's the very first statement encountered in the current queue
                // AND no entities have been assigned positions yet across the entire system.
                if (i === 0 && Object.keys(entityPositionRegistry).length === 0) {
                    // Arbitrarily assign entity A a base position of 0. This grounds the system.
                    entityPositionRegistry[entityA] = 0;
                    // Then, calculate entity B's position based on A's newly assigned position.
                    entityPositionRegistry[entityB] = entityPositionRegistry[entityA] + relativeDifference;
                    relationshipsResolvedInThisRound++;
                } else {
                    // If it's not the first statement in the queue, or if the system is already
                    // partially grounded, this statement cannot be resolved yet and is deferred.
                    deferredStatementBuffer.push(currentStatementText);
                }
            }
        } // End of inner loop (for currentStatementQueue)

        // If an inconsistency was found during this round, exit the outer loop.
        if (!systemConsistencyStatus) {
            break;
        }

        // Check if any progress was made in this round.
        // If no relationships were resolved, but there are still statements deferred,
        // it implies that the remaining statements form an unresolvable subgraph
        // (e.g., isolated components, ungrounded cycles) or are mutually dependent
        // without a known starting point. In such cases, the system cannot be fully
        // determined, and this is treated as an unsuccessful resolution.
        if (relationshipsResolvedInThisRound === 0 && currentStatementQueue.length > 0) {
            systemConsistencyStatus = false; // Mark as unresolvable.
            break;
        }

        // Prepare for the next iteration: the deferred statements become the new queue.
        currentStatementQueue = deferredStatementBuffer;
    } // End of outer loop (while currentStatementQueue)

    // Output the final determination based on the `systemConsistencyStatus`.
    // 'Yes' indicates all relationships are consistent and resolvable.
    // 'No' indicates either an explicit contradiction was found, or the system
    // could not be fully resolved within the given constraints/iterations.
    console.log(systemConsistencyStatus ? 'Yes' : 'No');
}

// The entry point for execution:
// Reads input from standard input (`/dev/stdin`) using Node.js's file system module,
// and then passes the raw string data to the main processing function.
ProcessRelativeValues(require('fs').readFileSync('/dev/stdin', 'utf8'));