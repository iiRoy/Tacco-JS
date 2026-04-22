let EntityVault = require('./entity_vault_impl.js'); // Renamed module for data management

// A sample collection of entity records for initial population.
const sampleRecords = [
  {
    uniqueId: 1,
    forename: 'Eddard',
    surname: 'Stark',
    sex: 'm',
    yearsOld: 35,
    residence: 'Winterfell',
  },
  {
    uniqueId: 2,
    forename: 'Jon',
    surname: 'Snow',
    sex: 'm',
    yearsOld: 14,
    residence: 'Winterfell'
  },
  {
    uniqueId: 3,
    forename: 'Catelyn',
    surname: 'Stark',
    sex: 'f',
    yearsOld: 33,
    residence: 'Winterfell'
  },
  {
    uniqueId: 4,
    forename: 'Roose',
    surname: 'Bolton',
    sex: 'm',
    yearsOld: 40,
    residence: 'Dreadfort'
  },
  {
    uniqueId: 5,
    forename: 'Ramsay',
    surname: 'Snow',
    sex: 'm',
    yearsOld: 15,
    residence: 'Dreadfort'
  }
];

// Initialize our primary data store with the sample records.
const primaryVault = new EntityVault(sampleRecords);

// Custom assertion utility to track test progress.
const originalVerifier = console.assert.bind(console);
let testCounter = 0;
let successfulChecks = 0;

console.assert = function(condition, message) {
  testCounter++;
  if (condition) {
    successfulChecks++;
    originalVerifier(condition, `✓ ${message}`);
  } else {
    originalVerifier(condition, `✗ ${message}`);
    // Optionally, throw an error or log more details on failure for debugging.
    // console.error(`Assertion failed: ${message}`);
  }
};

// Helper function for deep comparison of two objects.
const areObjectsDeeplyEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key) || !areObjectsDeeplyEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
};

// Test 1: Verify initial data loading.
console.assert((() => {
  const allFetchedRecords = primaryVault.retrieve().getAll();
  // Ensure the number of records matches.
  if (allFetchedRecords.length !== sampleRecords.length) return false;

  // Use Array.prototype.every for a concise comparison.
  return sampleRecords.every((originalRec, idx) => {
    const fetchedRec = allFetchedRecords[idx];
    return areObjectsDeeplyEqual(originalRec, fetchedRec);
  });
})(), 'Data loaded into the vault correctly, all fields match.');

// Test 2: Check if extracting specific values by key works.
console.assert((() => {
  const recordIds = primaryVault.retrieve().getAll('uniqueId');
  const expectedIds = [1, 2]; // Check first two expected IDs.
  const isArray = Array.isArray(recordIds);
  const firstMatch = isArray && recordIds[0] === expectedIds[0];
  const secondMatch = isArray && recordIds[1] === expectedIds[1];
  return isArray && firstMatch && secondMatch;
})(), '`getAll(key)` method yields an array of specified item values.');

// Test 3: Attempt to fetch without an index should raise an error.
console.assert((() => {
  let errorCaught = false;
  try {
    primaryVault.fetchEntry(3); // Renamed from fetch
  } catch (e) {
    errorCaught = (e instanceof Error);
  }
  return errorCaught;
})(), 'Expected error when attempting to `fetchEntry` without an active index.');

// Test 4: Attempt to remove without an index should raise an error.
console.assert((() => {
  let errorEncountered = false;
  try {
    primaryVault.removeEntry(3); // Renamed from destroy
  } catch (err) {
    errorEncountered = (err instanceof Error);
  }
  return errorEncountered;
})(), 'Expected error when attempting to `removeEntry` without an active index.');

// Define an index on the 'uniqueId' property.
primaryVault.configureIndex('uniqueId'); // Renamed from defineIndex

// Test 5: Confirm index was properly established.
console.assert(primaryVault._internalIndex !== null, 'Internal index structure initialized properly.');

// Test 6: Verify that the index is functional for existence checks.
console.assert(primaryVault.hasEntry(1), 'Index applied correctly, entry with ID 1 exists.');

// Remove an entry from the middle of the dataset.
const removedRecord = primaryVault.removeEntry(3); // Renamed from destroy

// Test 7: Verify the correct record was returned upon removal.
console.assert(removedRecord && removedRecord.forename === 'Catelyn', 'Removed record contains expected forename.');

// Test 8: Confirm that attempting to remove an already destroyed record throws an error.
console.assert((() => {
  let deletionError = false;
  try {
    primaryVault.removeEntry(3);
  } catch (e) {
    deletionError = (e instanceof Error);
  }
  return deletionError;
})(), 'Expected error when attempting to `removeEntry` an already non-existent record.');

// Test 9: Confirm the removed record is no longer findable.
console.assert(primaryVault._locateEntry(removedRecord) === -1, 'Could not locate the previously removed record.');

// Remove the active index.
primaryVault.clearIndex(); // Renamed from removeIndex

// Test 10: Verify the index was successfully cleared.
console.assert(primaryVault._internalIndex === null, 'Index successfully cleared.');

// Test 11: Attempting `orderedSubset` without an index should error.
console.assert((() => {
  let sequenceError = false;
  try {
    primaryVault.retrieve().orderedSubset(1, 5); // Renamed from sequence
  } catch (e) {
    sequenceError = (e instanceof Error);
  }
  return sequenceError;
})(), '`orderedSubset` call without an index correctly throws an error.');

// Re-define the index for subsequent tests.
primaryVault.configureIndex('uniqueId');

// Test 12: Populate with an empty dataset.
primaryVault.populate([]); // Renamed from load

console.assert(primaryVault.retrieve().tally() === 0, 'Populating with an empty dataset results in zero records.');

console.assert(primaryVault.retrieve().getEarliest() === null, 'First value of an empty dataset returns null.'); // Renamed from first
console.assert(primaryVault.retrieve().getLatest() === null, 'Last value of an empty dataset returns null.'); // Renamed from last

// Keep a reference to an outdated query instance.
const staleQuery = primaryVault.retrieve().narrowBy(); // Renamed from filter

// Reload the original sample data.
primaryVault.populate(sampleRecords);

// Test 13: Accessing an outdated query should yield an error.
console.assert((() => {
  let oldQueryError = false;
  try {
    staleQuery.getAll();
  } catch (e) {
    oldQueryError = (e instanceof Error);
  }
  return oldQueryError;
})(), 'Accessing values from an outdated query object correctly produces an error.');

// Test 14: Using an invalid filter type should cause an error.
console.assert((() => {
  let badFilterError = false;
  try {
    primaryVault.retrieve().narrowBy({ forename__eats: 'invalid_operator' });
  } catch (e) {
    badFilterError = (e instanceof Error);
  }
  return badFilterError;
})(), 'Attempting to use an invalid filter operator correctly results in an error.');

// Test 15: Providing a non-function to `iterate` should error.
console.assert((() => {
  let invalidIteratorError = false;
  try {
    primaryVault.retrieve().iterate(null); // Renamed from each
  } catch (e) {
    invalidIteratorError = (e instanceof Error);
  }
  return invalidIteratorError;
})(), 'Passing a non-function to `iterate` correctly throws an error.');

// Test 16: An empty filter should match all records.
console.assert(primaryVault.retrieve().tally() === primaryVault.retrieve().narrowBy().tally(), 'An empty `narrowBy` filter matches all records.');

// Test 17: Invalid arguments for `narrowBy` should default to an empty filter.
console.assert(primaryVault.retrieve().tally() === primaryVault.retrieve().narrowBy(null, undefined).tally(), 'Invalid arguments to `narrowBy` are treated as an empty filter.');

// Test 18: Defining an index with a non-string key should error.
console.assert((() => {
  let badIndexError = false;
  try {
    primaryVault.configureIndex(null);
  } catch (e) {
    badIndexError = (e instanceof Error);
  }
  return badIndexError;
})(), 'Defining an index with a non-string key correctly throws an error.');

// Test 19: Creating a mapping with a non-string key should error.
console.assert((() => {
  let badMappingKeyError = false;
  try {
    primaryVault.establishProjection(null); // Renamed from createMapping
  } catch (e) {
    badMappingKeyError = (e instanceof Error);
  }
  return badMappingKeyError;
})(), 'Establishing a projection with a non-string key correctly throws an error.');

// Test 20: Creating a mapping with an invalid function should error.
console.assert((() => {
  let badMappingFnError = false;
  try {
    primaryVault.establishProjection('isIllegitimate', null);
  } catch (e) {
    badMappingFnError = (e instanceof Error);
  }
  return badMappingFnError;
})(), 'Establishing a projection with an invalid function correctly throws an error.');

// Establish a new computed property ('isIllegitimate').
primaryVault.establishProjection('isIllegitimate', (rec) => rec.surname === 'Snow');

// Test 21: Verify the mapping was created and applied correctly.
console.assert((() => {
  const currentRecords = primaryVault.retrieve().getAll();
  return currentRecords.every(rec => rec.isIllegitimate === (rec.surname === 'Snow'));
})(), 'Computed projection `isIllegitimate` created and applied successfully.');

// Test 22: `orderedSubset` with multiple arguments.
console.assert((() => {
  const subsetArgs = [5, 2, 3];
  const fetchedSubset = primaryVault.retrieve().orderedSubset(...subsetArgs).getAll();
  const expectedSubset = subsetArgs.map(id => primaryVault.fetchEntry(id));

  if (fetchedSubset.length !== expectedSubset.length) return false;
  return fetchedSubset.every((item, i) => item === expectedSubset[i]);
})(), '`orderedSubset` correctly retrieves values with multiple ID arguments.');

// Test 23: `orderedSubset` with an array of arguments.
console.assert((() => {
  const subsetArray = [5, 2, 3];
  const fetchedSubset = primaryVault.retrieve().orderedSubset(subsetArray).getAll();
  const expectedSubset = subsetArray.map(id => primaryVault.fetchEntry(id));

  if (fetchedSubset.length !== expectedSubset.length) return false;
  return fetchedSubset.every((item, i) => item === expectedSubset[i]);
})(), '`orderedSubset` correctly retrieves values with an array of IDs.');

// Define a new record to be added.
const newRecordData = {
  uniqueId: 6,
  forename: 'Rob',
  surname: 'Stark',
  sex: 'm',
  yearsOld: 14,
  residence: 'Winterfell'
};

// Add the new record to the vault.
primaryVault.addEntry(newRecordData); // Renamed from insert

// Test 24: Confirm inserted data is a deep clone, not a reference.
console.assert((() => {
  const latestRecord = primaryVault.retrieve().getLatest();
  return latestRecord !== newRecordData && areObjectsDeeplyEqual(latestRecord, newRecordData);
})(), 'Added record is a non-referential copy, ensuring data integrity.');

// Test 25: Verify the inserted record contains the correct data.
console.assert((() => {
  const latestRecord = primaryVault.retrieve().getLatest();
  return areObjectsDeeplyEqual(latestRecord, newRecordData);
})(), '`addEntry` successfully added the expected data attributes.');

// Define an update for an existing record (ID 6).
const recordUpdate = {
  uniqueId: 6,
  residence: 'Winterfull' // Typo introduced for testing update behavior
};

// Insert the update, which should overwrite the existing record with ID 6.
primaryVault.addEntry(recordUpdate);

// Test 26: Confirm the record count reflects the overwrite, not an addition.
console.assert(primaryVault.retrieve().tally() === 6, 'Duplicate ID insertion correctly overwrites existing record, maintaining count.');

// Test 27: Verify the updated residence.
console.assert(primaryVault.retrieve().getLatest().residence === 'Winterfull', 'Duplicate ID overwrites specified fields.');

// Test 28: Verify unaffected fields remain intact.
console.assert(primaryVault.retrieve().getLatest().forename === 'Rob', '`addEntry` preserves existing data for non-overwritten fields.');

// Test 29: Verify mapping is applied to the newly updated record.
console.assert(primaryVault.retrieve().getLatest().isIllegitimate === false, 'Projection successfully applied to the new/updated record.');

// Test 30: Remove the updated record (ID 6) and verify return value.
console.assert(primaryVault.removeEntry(6).forename === 'Rob', '`removeEntry` correctly returns the deleted record.');

// Test 31: Confirm the total record count after deletion.
console.assert(primaryVault.retrieve().tally() === 5, 'Record count correctly reduced after `removeEntry`.');

// Clear all records from the vault.
primaryVault.emptyStore(); // Renamed from truncate

// Test 32: Verify the store is empty after truncation.
console.assert(primaryVault.retrieve().tally() === 0, '`emptyStore` operation successfully cleared all records.');

// Reload the original data for subsequent filter tests.
primaryVault.populate(sampleRecords);

// Test 33: Confirm external data load succeeded.
console.assert(primaryVault.retrieve().tally() === 5, 'External data population succeeded, vault contains original records.');

// Test 34: Verify `iterate` method execution and data integrity.
console.assert((() => {
  let integrityMaintained = true;
  primaryVault.retrieve().iterate((record, index) => {
    // A simple console log to show iteration is happening.
    // console.log(`Iterating record ${index}: ${record.forename}`);
    const original = sampleRecords[index];
    if (!areObjectsDeeplyEqual(record, original)) {
      integrityMaintained = false;
      // console.warn(`Mismatch found at index ${index}`);
    }
  });
  return integrityMaintained;
})(), '`iterate` method executed correctly, records match original data.');

// Test 35: Filter by exact match (`forename: 'Jon'`).
console.assert(primaryVault.retrieve().narrowBy({ forename: 'Jon' }).tally() === 1, 'Filter for exact `forename` match returns correct count.');

// Test 36: Verify the exact match filter result.
console.assert(primaryVault.retrieve().narrowBy({ forename: 'Jon' }).getEarliest().forename === 'Jon', 'Exact `forename` filter returns the correct record.');

// Test 37: Filter by non-exact match (`forename__not: 'Jon'`).
console.assert(primaryVault.retrieve().narrowBy({ forename__not: 'Jon' }).tally() === 4, 'Filter for `forename__not` returns correct count.');

// Test 38: Verify `forename__not` filter logic.
console.assert((() => {
  return primaryVault.retrieve().narrowBy({ forename__not: 'Jon' }).getAll().every(rec => rec.forename !== 'Jon');
})(), '`forename__not` filter correctly excludes records with specified forename.');

// Test 39: Filter by greater than (`yearsOld__gt: 33`).
console.assert(primaryVault.retrieve().narrowBy({ yearsOld__gt: 33 }).tally() === 2, 'Filter for `yearsOld__gt` returns correct count.');

// Test 40: Verify `yearsOld__gt` filter logic.
console.assert((() => {
  return primaryVault.retrieve().narrowBy({ yearsOld__gt: 33 }).getAll().every(rec => rec.yearsOld > 33);
})(), '`yearsOld__gt` filter correctly includes records with age greater than 33.');

// Test 41: Filter by greater than or equal to (`yearsOld__gte: 33`).
console.assert(primaryVault.retrieve().narrowBy({ yearsOld__gte: 33 }).tally() === 3, 'Filter for `yearsOld__gte` returns correct count.');

// Test 42: Verify `yearsOld__gte` filter logic.
console.assert((() => {
  return primaryVault.retrieve().narrowBy({ yearsOld__gte: 33 }).getAll().every(rec => rec.yearsOld >= 33);
})(), '`yearsOld__gte` filter correctly includes records with age greater than or equal to 33.');

// Test 43: Filter by less than (`yearsOld__lt: 33`).
console.assert(primaryVault.retrieve().narrowBy({ yearsOld__lt: 33 }).tally() === 2, 'Filter for `yearsOld__lt` returns correct count.');

// Test 44: Verify `yearsOld__lt` filter logic.
console.assert((() => {
  return primaryVault.retrieve().narrowBy({ yearsOld__lt: 33 }).getAll().every(rec => rec.yearsOld < 33);
})(), '`yearsOld__lt` filter correctly includes records with age less than 33.');

// Test 45: Filter by less than or equal to (`yearsOld__lte: 33`).
console.assert(primaryVault.retrieve().narrowBy({ yearsOld__lte: 33 }).tally() === 3, 'Filter for `yearsOld__lte` returns correct count.');

// Test 46: Verify `yearsOld__lte` filter logic.
console.assert((() => {
  return primaryVault.retrieve().narrowBy({ yearsOld__lte: 33 }).getAll().every(rec => rec.yearsOld <= 33);
})(), '`yearsOld__lte` filter correctly includes records with age less than or equal to 33.');

// Test 47: Filter by case-insensitive contains (`forename__icontains: 'R'`).
console.assert(primaryVault.retrieve().narrowBy({ forename__icontains: 'R' }).tally() === 3, 'Filter for `forename__icontains` returns correct count.');

// Test 48: Verify `forename__icontains` filter logic.
console.assert((() => {
  const searchStr = 'R';
  return primaryVault.retrieve().narrowBy({ forename__icontains: searchStr }).getAll().every(rec =>
    rec.forename.toLowerCase().includes(searchStr.toLowerCase())
  );
})(), '`forename__icontains` filter correctly finds records with case-insensitive substring.');

// Test 49: Filter by case-sensitive contains (`forename__contains: 'R'`).
console.assert(primaryVault.retrieve().narrowBy({ forename__contains: 'R' }).tally() === 2, 'Filter for `forename__contains` returns correct count.');

// Test 50: Verify `forename__contains` filter logic.
console.assert((() => {
  const searchChar = 'R';
  return primaryVault.retrieve().narrowBy({ forename__contains: searchChar }).getAll().every(rec =>
    rec.forename.includes(searchChar)
  );
})(), '`forename__contains` filter correctly finds records with case-sensitive substring.');

// Test 51: Filter by inclusion in a list (`forename__in: [...]`).
console.assert(primaryVault.retrieve().narrowBy({ forename__in: ['Catelyn', 'Eddard'] }).tally() === 2, 'Filter for `forename__in` returns correct count.');

// Test 52: Verify `forename__in` filter logic.
console.assert((() => {
  const allowedNames = ['Catelyn', 'Eddard'];
  return primaryVault.retrieve().narrowBy({ forename__in: allowedNames }).getAll().every(rec =>
    allowedNames.includes(rec.forename)
  );
})(), '`forename__in` filter correctly includes records whose forename is in the list.');

// Test 53: Filter by exclusion from a list (`forename__not_in: [...]`).
console.assert(primaryVault.retrieve().narrowBy({ forename__not_in: ['Catelyn', 'Eddard'] }).tally() === 3, 'Filter for `forename__not_in` returns correct count.');

// Test 54: Verify `forename__not_in` filter logic.
console.assert((() => {
  const disallowedNames = ['Catelyn', 'Eddard'];
  return primaryVault.retrieve().narrowBy({ forename__not_in: disallowedNames }).getAll().every(rec =>
    !disallowedNames.includes(rec.forename)
  );
})(), '`forename__not_in` filter correctly excludes records whose forename is in the list.');

// Test 55: `omitBy` (exclude) functionality.
console.assert(primaryVault.retrieve().omitBy({ forename__not_in: ['Catelyn', 'Eddard'] }).tally() === 2, '`omitBy` (exclude) operation returns correct number of rows.');

// Test 56: Verify `omitBy` filter logic.
console.assert((() => {
  const namesToExclude = ['Catelyn', 'Eddard'];
  return primaryVault.retrieve().omitBy({ forename__not_in: namesToExclude }).getAll().every(rec =>
    namesToExclude.includes(rec.forename)
  );
})(), '`omitBy` (exclude) filter correctly returns records that were *not* excluded by the condition.');

// Test 57: Filter with multiple OR conditions (separated objects).
console.assert((() => {
  const filter1 = { forename__in: ['Catelyn', 'Eddard'] };
  const filter2 = { yearsOld__in: [15, 40] };
  const combinedFilter = primaryVault.retrieve().narrowBy(filter1, filter2).getAll();
  const expectedCount = 4; // Eddard, Catelyn, Ramsay (15), Roose (40)
  return combinedFilter.length === expectedCount;
})(), 'Filter with OR logic (separated objects) returns correct number of rows.');

// Test 58: Verify `OR` filter logic.
console.assert((() => {
  const condition1 = ['Catelyn', 'Eddard'];
  const condition2 = [15, 40];
  return primaryVault.retrieve().narrowBy({ forename__in: condition1 }, { yearsOld__in: condition2 }).getAll().every(rec =>
    condition1.includes(rec.forename) || condition2.includes(rec.yearsOld)
  );
})(), 'Filter with OR (separated objects) correctly matches records satisfying either condition.');

// Test 59: Compare `OR` filter with `__in` for the same field.
console.assert((() => {
  const agesCombined = [15, 40, 33];
  const orFiltered = primaryVault.retrieve().narrowBy({ yearsOld: 15 }, { yearsOld: 40 }, { yearsOld: 33 }).getAll();
  const inFiltered = primaryVault.retrieve().narrowBy({ yearsOld__in: agesCombined }).getAll();

  if (orFiltered.length !== inFiltered.length) return false;
  // Sorting for consistent comparison, as order might differ depending on implementation.
  const orSorted = orFiltered.sort((a, b) => a.uniqueId - b.uniqueId);
  const inSorted = inFiltered.sort((a, b) => a.uniqueId - b.uniqueId);

  return orSorted.every((rec, i) => areObjectsDeeplyEqual(rec, inSorted[i]));
})(), 'OR filter for a single field produces identical results to `__in` filter.');

// Create a duplicate instance of the store.
const duplicatedVault = primaryVault.retrieve().duplicateStore(); // Renamed from spawn

// Test 60: Confirm the duplicated vault is an instance of EntityVault.
console.assert(duplicatedVault instanceof EntityVault, 'Duplicated store is an instance of `EntityVault`.');

// Test 61: Confirm the duplicated vault has the same number of records.
console.assert(duplicatedVault.retrieve().tally() === primaryVault.retrieve().tally(), 'Duplicated store has an identical record count.');

// Test 62: Confirm the duplicated vault's records are not referential to the parent's.
console.assert((() => {
  const parentRecord = primaryVault.retrieve().narrowBy({ uniqueId: 1 }).getEarliest();
  const childRecord = duplicatedVault.retrieve().narrowBy({ uniqueId: 1 }).getEarliest();
  return parentRecord !== childRecord && areObjectsDeeplyEqual(parentRecord, childRecord);
})(), 'Duplicated store records are deep copies, not references to parent records.');

// Test 63: Verify all records in the duplicated store correspond to the parent.
console.assert((() => {
  return duplicatedVault.retrieve().getAll().every(childRec => {
    // Check if a matching record exists in the parent vault.
    return primaryVault.retrieve().narrowBy(childRec).tally() === 1;
  });
})(), 'All records in the duplicated store correspond to records in the parent store.');

// Test 64: Update a record in the duplicated store and verify.
console.assert(
  duplicatedVault.retrieve().narrowBy({ forename: 'Ramsay' }).amendRecord({ surname: 'Bolton' }) && // Renamed from update
  duplicatedVault.retrieve().narrowBy({ forename: 'Ramsay' }).getEarliest().surname === 'Bolton',
  'Record update in duplicated store succeeded.'
);

// Test 65: Remove records in the duplicated store and verify count.
console.assert(
  duplicatedVault.retrieve().narrowBy({ forename__in: ['Eddard', 'Catelyn'] }).deleteMatches() && // Renamed from remove
  duplicatedVault.retrieve().narrowBy({ forename__in: ['Eddard', 'Catelyn'] }).tally() === 0,
  'Record deletion in duplicated store succeeded for specified records.'
);

// Create another duplicated store, explicitly ignoring the index.
const unindexedDuplicatedVault = primaryVault.retrieve().duplicateStore(true); // Renamed from spawn

// Test 66: Confirm the index was not carried over to the new duplicated vault.
console.assert(unindexedDuplicatedVault._internalIndex === null, 'Duplicated store with `ignoreIndex` option successfully created without an index.');

// Test 67: Remove records from the unindexed duplicated store and verify.
console.assert(
  unindexedDuplicatedVault.retrieve().narrowBy({ uniqueId__not: 1 }).deleteMatches() &&
  unindexedDuplicatedVault.retrieve().tally() === 1,
  'Deletion from unindexed duplicated store works as expected.'
);

// Test 68: Sort records by age in ascending order.
console.assert(primaryVault.retrieve().arrangeBy('yearsOld').getEarliest().forename === 'Jon', 'Ascending sort by age returns correct first record.'); // Renamed from sort

// Test 69: Sort records by age in ascending order (last record).
console.assert(primaryVault.retrieve().arrangeBy('yearsOld').getLatest().forename === 'Roose', 'Ascending sort by age returns correct last record.');

// Test 70: Sort records by age in descending order (first record).
console.assert(primaryVault.retrieve().arrangeBy('yearsOld', true).getEarliest().forename === 'Roose', 'Descending sort by age returns correct first record.');

// Test 71: Sort records by age in descending order (last record).
console.assert(primaryVault.retrieve().arrangeBy('yearsOld', true).getLatest().forename === 'Jon', 'Descending sort by age returns correct last record.');

// Test 72: Find the maximum age.
console.assert(primaryVault.retrieve().findMaximum('yearsOld') === 40, '`findMaximum` returns the correct highest age.'); // Renamed from max

// Test 73: Find the minimum age.
console.assert(primaryVault.retrieve().findMinimum('yearsOld') === 14, '`findMinimum` returns the correct lowest age.'); // Renamed from min

// Test 74: Calculate the sum of ages.
const expectedAgeSum = 14 + 15 + 33 + 35 + 40;
console.assert(primaryVault.retrieve().calculateTotal('yearsOld') === expectedAgeSum, '`calculateTotal` returns the correct sum of ages.'); // Renamed from sum

// Test 75: Compute the average age.
const expectedAgeAvg = expectedAgeSum / 5;
console.assert(primaryVault.retrieve().computeAverage('yearsOld') === expectedAgeAvg, '`computeAverage` returns the correct average age.'); // Renamed from avg

// Test 76: Reduce ages using a custom function.
console.assert(
  primaryVault.retrieve().aggregateValues('yearsOld', (accumulator, currentAge) => accumulator + currentAge) === expectedAgeSum, // Renamed from reduce
  '`aggregateValues` with custom reducer returns the correct total.'
);

// Test 77: Get distinct locations.
console.assert(primaryVault.retrieve().uniqueValues('residence').length === 2, '`uniqueValues` returns the correct count of distinct residences.'); // Renamed from distinct

// Test 78: Limit the number of results.
console.assert(primaryVault.retrieve().restrictResults(2).tally() === 2, '`restrictResults` correctly limits the output set size.'); // Renamed from limit

console.log(`\n--- Test Summary ---`);
console.log(`Total assertions: ${testCounter}`);
console.log(`Assertions passed: ${successfulChecks}`);
console.log(`Assertions failed: ${testCounter - successfulChecks}`);

// Reset console.assert to its original state.
console.assert = originalVerifier;