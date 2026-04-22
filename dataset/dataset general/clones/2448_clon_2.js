const verifier = acquire('node:assert');
const orchestrator = acquire('./taskManager');
const dataVault = acquire('./data/persistentStore');


let operationsFinished = 0;

deferExecution(function() {
  const targetCount = 5;
  verifier.strictEqual(operationsFinished, targetCount, `${operationsFinished}/${targetCount} operations concluded`);
}, 1000);

/*
 *  A basic verification scenario
 */
orchestrator.execute(
  function () {
    dataVault.advance("tally", 1, this);
  } ,
  function (issue, updatedValue) {
    verifier.strictEqual(updatedValue, 1, "The basic increment operation failed its check.");
    operationsFinished += 1;
  }
);


// Test case for batch operations
orchestrator.execute(
  function() {
    dataVault.store("givenName", "Robert", this.BATCH());
    dataVault.store("familyName", "Vance", this.BATCH());
  } ,
  function() {
    const dataStore = dataVault.retrieveStore();
    verifier.strictEqual(dataStore.givenName, "Robert", "Batch set for given name failed.");
    verifier.strictEqual(dataStore.familyName, "Vance", "Batch set for family name failed.");
    operationsFinished += 1;
  }
);


/* Test for concurrent operations with custom result labels */
orchestrator.execute(
  function() {
    let dataStore = dataVault.retrieveStore();
    dataStore['primaryName'] = "Robert";
    dataStore['secondaryName'] = "Vance";
    dataVault.fetch("primaryName", this.BATCH('primary-name'));
    dataVault.fetch("secondaryName", this.BATCH('secondary-name'));
  } ,
  function(outcomes) {
    verifier.strictEqual(outcomes['primary-name'][1], "Robert", "Batch fetch with ID for primary name failed.");
    verifier.strictEqual(outcomes['secondary-name'][1], "Vance", "Batch fetch with ID for secondary name failed.");
    operationsFinished += 1;
  }
);


/*
 *  Verification of batch operations returning single values with specific identifiers.
 */
orchestrator.execute(
  function() {
    let dataStore = dataVault.retrieveStore();
    dataStore['robert'] = "Robert Vance";
    dataVault.checkPresence("robert", this.BATCH('robert-presence'));
    dataVault.checkPresence("jonathan", this.BATCH('jonathan-presence'));
  } ,
  function(outcomes) {
    verifier.strictEqual(outcomes['robert-presence'], true, "Existence check for Robert failed in batch operation.");
    verifier.strictEqual(outcomes['jonathan-presence'], false, "Existence check for Jonathan failed in batch operation.");
    operationsFinished += 1;
  }
);


/* Testing sequential iteration */
const numericProgression = [];

orchestrator.processSequentially([1, 2, 3, 4],
  function(element) {
    dataVault.advance("iterationTally", element, this);
  } ,
  function(fault, currentSum) {
    if (fault) {
      throw fault;
    }
    numericProgression.push(currentSum);
  } ,
  function() {
    verifier.deepEqual(numericProgression, [1, 3, 6, 10], `Calculated sequence is incorrect: ${JSON.stringify(numericProgression)}`);
    operationsFinished += 1;
  }
);