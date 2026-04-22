var RecordVault = require('./data_collection.js'); // Include the data management module.

var persons = [ // Define a collection of person records.
  {
    uniqueId: 1,
    givenName: 'Eddard',
    familyName: 'Stark',
    sex: 'm',
    yearsOld: 35,
    residence: 'Winterfell',
  },
  {
    uniqueId: 2,
    givenName: 'Jon',
    familyName: 'Snow',
    sex: 'm',
    yearsOld: 14,
    residence: 'Winterfell'
  },
  {
    uniqueId: 3,
    givenName: 'Catelyn',
    familyName: 'Stark',
    sex: 'f',
    yearsOld: 33,
    residence: 'Winterfell'
  },
  {
    uniqueId: 4,
    givenName: 'Roose',
    familyName: 'Bolton',
    sex: 'm',
    yearsOld: 40,
    residence: 'Dreadfort'
  },
  {
    uniqueId: 5,
    givenName: 'Ramsay',
    familyName: 'Snow',
    sex: 'm',
    yearsOld: 15,
    residence: 'Dreadfort'
  }
];

var rv = new RecordVault(persons); // Instantiate a new RecordVault with the initial data.

var originalCheck = console.assert.bind(console); // Save the default console.assert.
var testCounter = 0; // Initialize a counter for total assertions.
var successfulTests = 0; // Initialize a counter for passed assertions.

// Override console.assert to track test results.
console.assert = function(condition, message) {
  testCounter++;
  if(condition) {
    successfulTests++;
  }
  originalCheck(condition, message); // Execute the original assertion.
};


console.assert((function() { // Verify initial data loading integrity.
  var currentItem, propertyNames, propertyName;
  var outcome = rv.query().values();
  for(var idx = 0, arrayLength = persons.length; idx < arrayLength; idx++) {
    currentItem = persons[idx];
    propertyNames = Object.keys(currentItem);
    for(var innerIdx = 0, innerLength = propertyNames.length; innerIdx < innerLength; innerIdx++) {
      propertyName = propertyNames[innerIdx];
      if(currentItem[propertyName] !== outcome[idx][propertyName]) { return false; }
    }
  }
  return true;
})(), 'Data loaded without corruption');

console.assert((function() { // Test .values(key) functionality.
  var valuesArray = rv.query().values('uniqueId');
  return (valuesArray instanceof Array) && valuesArray[0] === 1 && valuesArray[1] === 2;
})(), '.values(key) returns array of specific field values');

console.assert((function() { // Expect error when fetching without index.
  try {
    rv.fetch(3);
  } catch(err) {
    return true;
  }
  return false;
})(), 'Failed to fetch without an index (as expected)');

console.assert((function() { // Expect error when destroying without index.
  try {
    rv.destroy(3);
  } catch(err) {
    return true;
  }
  return false;
})(), 'Failed to destroy without an index (as expected)');

rv.defineIndex('uniqueId'); // Define an index on the 'uniqueId' field.

console.assert(rv._primaryKey !== null, 'Index was successfully set');

console.assert(rv.exists(1), 'Existence check with index worked');

var removedEntry = rv.destroy(3); // Destroy a record.

console.assert(removedEntry.givenName === 'Catelyn', 'Correct record was destroyed from the set');

console.assert((function() { // Expect error when destroying an already removed record.
  try {
    rv.destroy(3);
  } catch(err) {
    return true;
  }
  return false;
})(), 'Failed to destroy already removed record (as expected)');

console.assert(rv.__find__(removedEntry) === -1, 'Destroyed record cannot be found');

rv.removeIndex(); // Remove the defined index.

console.assert(rv._primaryKey === null, 'Index was properly removed');

console.assert((function() { // Expect error when using .sequence without an index.
  try {
    rv.query().sequence(1, 5);
  } catch(err) {
    return true;
  }
  return false;
})(), '.sequence throws error when no index is present');

rv.defineIndex('uniqueId'); // Re-define index for further tests.

rv.load(); // Load an empty dataset.

console.assert(rv.query().count() === 0, 'Loaded an empty dataset correctly (count is zero)');

console.assert(rv.query().first() === null, 'First value of empty dataset is null');

console.assert(rv.query().last() === null, 'Last value of empty dataset is null');

var staleQuery = rv.query().filter(); // Store a query object before data changes.

rv.load(persons); // Load the original data again.

console.assert((function() { // Expect error when using an outdated query object.
  try {
    staleQuery.values();
  } catch(err) {
    return true;
  }
  return false;
})(), 'Outdated DataCollectionQuery failed as expected');

console.assert((function() { // Expect error for invalid filter operator.
  try {
    rv.query().filter({givenName__eats: 'invalid op'});
  } catch(err) {
    return true;
  }
  return false;
})(), 'Invalid filter type caused expected error');

console.assert((function() { // Expect error for non-function in .each.
  try {
    rv.query().each(null);
  } catch(err) {
    return true;
  }
  return false;
})(), 'Non-function argument for .each caused expected error');

console.assert(rv.query().count() === rv.query().filter().count(), 'Empty filter matches all records');

console.assert(rv.query().count() === rv.query().filter(null, null).count(), 'Filter with invalid arguments matches all records');

console.assert((function() { // Expect error for non-string index key.
  try {
    rv.defineIndex(null);
  } catch(err) {
    return true;
  }
  return false;
})(), 'Defining non-string index caused expected error');

console.assert((function() { // Expect error for non-string mapping key.
  try {
    rv.createMapping(null);
  } catch(err) {
    return true;
  }
  return false;
})(), 'Creating mapping with non-string key caused expected error');

console.assert((function() { // Expect error for invalid mapping function.
  try {
    rv.createMapping('is_bastard', null);
  } catch(err) {
    return true;
  }
  return false;
})(), 'Creating mapping with invalid function caused expected error');

rv.createMapping('is_bastard', function(record) { return record.familyName === 'Snow'; }); // Create a new mapping.

console.assert((function() { // Verify mapping functionality.
  var outcome = rv.query().values();
  for(var idx = 0, arrayLength = outcome.length; idx < arrayLength; idx++) {
    if(outcome[idx].is_bastard !== (outcome[idx].familyName === 'Snow')) {
      return false;
    }
  }
  return true;
})(), 'Mapping applied and works correctly');

console.assert((function() { // Test .sequence with multiple arguments.

  var seq = rv.query().sequence(5, 2, 3).values();
  var expect = [rv.fetch(5), rv.fetch(2), rv.fetch(3)];

  if(seq.length !== expect.length) { return false; }

  for(var idx = 0, arrayLength = seq.length; idx < arrayLength; idx++) {
    if(seq[idx] !== expect[idx]) {
      return false;
    }
  }

  return true;

})(), '.sequence handles multiple arguments correctly');

console.assert((function() { // Test .sequence with an array of arguments.

  var seq = rv.query().sequence([5, 2, 3]).values();
  var expect = [rv.fetch(5), rv.fetch(2), rv.fetch(3)];

  if(seq.length !== expect.length) { return false; }

  for(var idx = 0, arrayLength = seq.length; idx < arrayLength; idx++) {
    if(seq[idx] !== expect[idx]) {
      return false;
    }
  }

  return true;

})(), '.sequence handles an array of values correctly');

var freshEntry = { // Define a new record for insertion.
  uniqueId: 6,
  givenName: 'Rob',
  familyName: 'Stark',
  sex: 'm',
  yearsOld: 14,
  residence: 'Winterfell'
};

rv.insert(freshEntry); // Insert the new record.

console.assert((function () { // Verify inserted data is not referential.
  var freshOutcome = rv.query().last();
  return freshOutcome !== freshEntry;
})(), 'Inserted data is a copy, not a reference');

console.assert((function () { // Verify inserted data content.
  var freshOutcome = rv.query().last();
  var propertyNames, propertyName;
  propertyNames = Object.keys(freshEntry);
  for(var idx = 0, arrayLength = propertyNames.length; idx < arrayLength; idx++) {
    propertyName = propertyNames[idx];
    if(freshOutcome[propertyName] !== freshEntry[propertyName]) {
      return false;
    }
  }
  return true;
})(), 'Insert operation added correct data');

var modificationEntry = { // Define an entry to update an existing record.
  uniqueId: 6,
  residence: 'Winterfull'
};

rv.insert(modificationEntry); // Insert the modification (should update).

console.assert(rv.query().count() === 6, 'Duplicate ID insert replaces old one (count unchanged)');

console.assert(rv.query().last().residence === 'Winterfull', 'Duplicate ID overwrote specific data');

console.assert(rv.query().last().givenName === 'Rob', 'Insert preserved non-overwritten old data');

console.assert(rv.query().last().is_bastard === false, 'Mapping worked for the new/updated row');

console.assert(rv.destroy(6).givenName === 'Rob', 'Destroy method returned the correct record');

console.assert(rv.query().count() === 5, 'Destroy method removed the record');

rv.truncate(); // Clear all records.

console.assert(rv.query().count() === 0, 'Truncation emptied the vault');

rv.load(persons); // Load original data again.

console.assert(rv.query().count() === 5, 'External load operation succeeded');

console.assert((function() { // Test .each method functionality.
  var allGood = true;
  var currentItem, propertyNames, propertyName;
  var outcome = rv.query().values();
  rv.query().each(function(record, recordIndex) {
    if(!allGood) { return; }
    currentItem = persons[recordIndex];
    propertyNames = Object.keys(currentItem);
    for(var innerIdx = 0, innerLength = propertyNames.length; innerIdx < innerLength; innerIdx++) {
      propertyName = propertyNames[innerIdx];
      if(currentItem[propertyName] !== outcome[recordIndex][propertyName]) { allGood = false; }
    }
  });
  return allGood;
})(), '.each method iterated correctly');

console.assert(rv.query().filter({givenName: 'Jon'}).count() === 1, 'Filter (exact match) count is correct');

console.assert(rv.query().filter({givenName: 'Jon'}).first().givenName === 'Jon', 'Filter (exact match) worked');

console.assert(rv.query().filter({givenName__not: 'Jon'}).count() === 4, 'Filter (__not) count is correct');

console.assert((function() { // Test filter (__not).
  var allGood = true;
  rv.query().filter({givenName__not: 'Jon'}).each(function(record) {
    if(!allGood) { return; }
    allGood = (record.givenName !== 'Jon');
  });
  return allGood;
})(), 'Filter (__not) worked as expected');

console.assert(rv.query().filter({yearsOld__gt: 33}).count() === 2, 'Filter (__gt) count is correct');

console.assert((function() { // Test filter (__gt).
  var allGood = true;
  rv.query().filter({yearsOld__gt: 33}).each(function(record) {
    if(!allGood) { return; }
    allGood = (record.yearsOld > 33);
  });
  return allGood;
})(), 'Filter (__gt) worked as expected');

console.assert(rv.query().filter({yearsOld__gte: 33}).count() === 3, 'Filter (__gte) count is correct');

console.assert((function() { // Test filter (__gte).
  var allGood = true;
  rv.query().filter({yearsOld__gte: 33}).each(function(record) {
    if(!allGood) { return; }
    allGood = (record.yearsOld >= 33);
  });
  return allGood;
})(), 'Filter (__gte) worked as expected');

console.assert(rv.query().filter({yearsOld__lt: 33}).count() === 2, 'Filter (__lt) count is correct');

console.assert((function() { // Test filter (__lt).
  var allGood = true;
  rv.query().filter({yearsOld__lt: 33}).each(function(record) {
    if(!allGood) { return; }
    allGood = (record.yearsOld < 33);
  });
  return allGood;
})(), 'Filter (__lt) worked as expected');

console.assert(rv.query().filter({yearsOld__lte: 33}).count() === 3, 'Filter (__lte) count is correct');

console.assert((function() { // Test filter (__lte).
  var allGood = true;
  rv.query().filter({yearsOld__lte: 33}).each(function(record) {
    if(!allGood) { return; }
    allGood = (record.yearsOld <= 33);
  });
  return allGood;
})(), 'Filter (__lte) worked as expected');

console.assert(rv.query().filter({givenName__icontains: 'R'}).count() === 3, 'Filter (__icontains) count is correct');

console.assert((function() { // Test filter (__icontains).
  var allGood = true;
  rv.query().filter({givenName__icontains: 'R'}).each(function(record) {
    if(!allGood) { return; }
    allGood = (record.givenName.toLowerCase().indexOf('R'.toLowerCase()) > -1);
  });
  return allGood;
})(), 'Filter (__icontains) worked as expected');

console.assert(rv.query().filter({givenName__contains: 'R'}).count() === 2, 'Filter (__contains) count is correct');

console.assert((function() { // Test filter (__contains).
  var allGood = true;
  rv.query().filter({givenName__contains: 'R'}).each(function(record) {
    if(!allGood) { return; }
    allGood = (record.givenName.indexOf('R') > -1);
  });
  return allGood;
})(), 'Filter (__contains) worked as expected');

console.assert(rv.query().filter({givenName__in: ['Catelyn', 'Eddard']}).count() === 2, 'Filter (__in) count is correct');

console.assert((function() { // Test filter (__in).
  var allGood = true;
  rv.query().filter({givenName__in: ['Catelyn', 'Eddard']}).each(function(record) {
    if(!allGood) { return; }
    allGood = ['Catelyn', 'Eddard'].indexOf(record.givenName) > -1;
  });
  return allGood;
})(), 'Filter (__in) worked as expected');

console.assert(rv.query().filter({givenName__not_in: ['Catelyn', 'Eddard']}).count() === 3, 'Filter (__not_in) count is correct');

console.assert((function() { // Test filter (__not_in).
  var allGood = true;
  rv.query().filter({givenName__not_in: ['Catelyn', 'Eddard']}).each(function(record) {
    if(!allGood) { return; }
    allGood = ['Catelyn', 'Eddard'].indexOf(record.givenName) === -1;
  });
  return allGood;
})(), 'Filter (__not_in) worked as expected');

console.assert(rv.query().exclude({givenName__not_in: ['Catelyn', 'Eddard']}).count() === 2, 'Exclude method count is correct');

console.assert((function() { // Test exclude method.
  var allGood = true;
  rv.query().exclude({givenName__not_in: ['Catelyn', 'Eddard']}).each(function(record) {
    if(!allGood) { return; }
    allGood = ['Catelyn', 'Eddard'].indexOf(record.givenName) > -1;
  });
  return allGood;
})(), 'Exclude method worked as expected');

console.assert((function() { // Test filter with OR logic (separated objects).
  var allGood = true;
  rv.query().filter({givenName__in: ['Catelyn', 'Eddard']}, {yearsOld__in: [15, 40]}).each(function(record) {
    if(!allGood) { return; }
    allGood = (['Catelyn', 'Eddard'].indexOf(record.givenName) > -1 || [15, 40].indexOf(record.yearsOld) > -1);
  });
  return allGood;
})(), 'Filter with OR (separated objects) worked');

console.assert(rv.query().filter({givenName__in: ['Catelyn', 'Eddard']}, {yearsOld__in: [15, 40]}).count() === 4, 'Filter with OR (separated objects) count is correct');

console.assert((function() { // Compare OR filter with __in for same field.
  var firstSet = rv.query().filter({yearsOld: 15}, {yearsOld: 40}, {yearsOld: 33}).values();
  var secondSet = rv.query().filter({yearsOld__in: [15, 40, 33]}).values();
  if(firstSet.length !== secondSet.length) { return false; }
  for(var idx = 0, arrayLength = firstSet.length; idx < arrayLength; idx++) {
    if(firstSet[idx] !== secondSet[idx]) { return false; }
  }
  return true;
})(), 'Filter with OR gives same results as __in for same field');

var rvClone = rv.query().spawn(); // Create a spawned RecordVault.

console.assert(rvClone instanceof RecordVault, 'Spawned object is an instance of RecordVault');

console.assert(rvClone.query().count() === rv.query().count(), 'Spawned object has identical record count');

console.assert(rvClone.query().filter({uniqueId: 1}).first() !== rv.query().filter({uniqueId: 1}).first(), 'Spawned object is not referential to parent');

console.assert((function() { // Verify spawned object content matches parent.
  var allGood = true;
  rvClone.query().each(function(record, recordIndex) {
    if(!allGood) { return; }
    allGood = rv.query().filter(record).count() === 1;
  })
  return allGood;
})(), 'Spawned object corresponds with parent values');

console.assert(rvClone.query().filter({givenName: 'Ramsay'}).update({familyName: 'Bolton'}) &&
  (rvClone.query().filter({givenName: 'Ramsay'}).first().familyName === 'Bolton'), 'Update operation on spawned object succeeded');

console.assert(rvClone.query().filter({givenName__in: ['Eddard', 'Catelyn']}).remove() &&
  rvClone.query().filter({givenName__in: ['Eddard', 'Catelyn']}).count() === 0, 'Remove operation on spawned object removed expected records');

var rvCloneNoIndex = rv.query().spawn(true); // Spawn another, ignoring index.

console.assert(rvCloneNoIndex._primaryKey === null, 'Spawn with ignoreIndex successfully removed index');
console.assert(rvCloneNoIndex.query().filter({uniqueId__not: 1}).remove() && rvCloneNoIndex.query().count() === 1, 'Spawned object without index removed records successfully.');

console.assert(rv.query().sort('yearsOld').first().givenName === 'Jon', 'Sort ascending first value check');
console.assert(rv.query().sort('yearsOld').last().givenName === 'Roose', 'Sort ascending last value check');

console.assert(rv.query().sort('yearsOld', true).first().givenName === 'Roose', 'Sort descending first value check');
console.assert(rv.query().sort('yearsOld', true).last().givenName === 'Jon', 'Sort descending last value check');

console.assert(rv.query().max('yearsOld') === 40, 'Max value calculation is correct');

console.assert(rv.query().min('yearsOld') === 14, 'Min value calculation is correct');

console.assert(rv.query().sum('yearsOld') === (14 + 15 + 33 + 35 + 40), 'Sum calculation is correct');

console.assert(rv.query().avg('yearsOld') === ((14 + 15 + 33 + 35 + 40) / 5), 'Average calculation is correct');

console.assert(rv.query().reduce('yearsOld', function(accumulator, currentValue) { return accumulator + currentValue; }) === (14 + 15 + 33 + 35 + 40), 'Reduce method gives correct value');

console.assert(rv.query().distinct('residence').length === 2, 'Distinct values count is correct');

console.assert(rv.query().limit(2).count() === 2, 'Limit method returns correct set size');