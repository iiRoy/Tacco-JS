"use strict";

const processInput = (rawInput) => {
  // Normalize and split the raw input string into individual lines
  let parsedLines = rawInput.trim().split("\n");

  // Extract the total number of entities from the first line
  const totalEntities = Number(parsedLines[0]);

  // Remove the first line as it's already processed
  parsedLines.shift();

  // The remaining lines represent the statements about entities
  const entityStatements = parsedLines;

  // Initialize a data store for each entity to track claims
  const entityDataStore = [];

  // Store parsed assertion sets for each entity
  const entityClaimSets = [];

  // Counter for the first type of contradiction
  let firstContradictionTally = 0;

  // Initialize each entity's data structure
  for (let entityIndex = 0; entityIndex < totalEntities; entityIndex++) {
    entityDataStore[entityIndex] = {
      0: 0,
      1: 0,
      disagreeingWith: [], // List of entities this entity claims are dishonest (0)
      disagreedBy: [], // List of entities that claim this entity is dishonest (0)
    };
  }

  // Parse all statements and populate entityClaimSets
  for (
    let currentStatementIdx = 0;
    currentStatementIdx < entityStatements.length;
    currentStatementIdx++
  ) {
    // Get the number of assertions made by the current entity
    let numAssertions = Number(entityStatements[currentStatementIdx]);

    // Extract the assertions related to the current entity
    entityClaimSets.push(
      entityStatements.slice(
        currentStatementIdx + 1,
        currentStatementIdx + numAssertions + 1
      )
    );

    // Advance the index past the assertions for the current entity
    currentStatementIdx = currentStatementIdx + numAssertions;
  }

  // Process each entity's claims to update the data store
  for (let claimSetIdx in entityClaimSets) {
    for (let assertionIdx in entityClaimSets[claimSetIdx]) {
      const claimParts = entityClaimSets[claimSetIdx][assertionIdx].split(" ");
      const targetPersonId = Number(claimParts[0]);
      const assertionTruthValue = Number(claimParts[1]);

      // Increment the count for the specific assertion type (0 or 1) for the target entity
      entityDataStore[targetPersonId - 1][assertionTruthValue]++;

      // If the assertion is that the target entity is dishonest (0)
      if (assertionTruthValue === 0) {
        // Record that the current entity (claimSetIdx) claims the target entity (targetPersonId-1) is dishonest
        entityDataStore[targetPersonId - 1].disagreeingWith.push(
          Number(claimSetIdx)
        );
        // Record that the target entity (targetPersonId-1) is claimed to be dishonest by the current entity (claimSetIdx)
        entityDataStore[Number(claimSetIdx)].disagreedBy.push(
          targetPersonId - 1
        );
      }
    }
  }

  // Counter for the second type of contradiction
  let secondContradictionTally = 0;

  // Analyze the collected data for contradictions
  for (let personKey in entityDataStore) {
    // If an entity is claimed to be both honest (1) and dishonest (0)
    if (
      entityDataStore[personKey][0] >= 1 &&
      entityDataStore[personKey][1] >= 1
    ) {
      firstContradictionTally += entityDataStore[personKey][0];
    }

    // Check for mutual contradictions (A says B is dishonest, B says A is dishonest)
    for (let disagreementKey in entityDataStore[personKey].disagreeingWith) {
      const claimedDishonestByThis =
        entityDataStore[personKey].disagreeingWith[disagreementKey];
      // If this entity (personKey) claims another (claimedDishonestByThis) is dishonest,
      // and that other entity (claimedDishonestByThis) claims this entity (personKey) is dishonest,
      // then it's a mutual contradiction.
      if (
        entityDataStore[personKey].disagreedBy.filter(
          (disagreedByIdx) => disagreedByIdx === claimedDishonestByThis
        ).length
      ) {
        secondContradictionTally++;
      }
    }
  }

  // Output the final calculated value
  console.log(
    totalEntities - (firstContradictionTally + secondContradictionTally / 2)
  );
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));