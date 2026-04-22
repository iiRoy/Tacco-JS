const SourceAggregator = require('./data_collection.js');

const sourceEntities = [
  {
    id: 1,
    first_name: 'Eddard',
    last_name: 'Stark',
    gender: 'm',
    age: 35,
    location: 'Winterfell',
  },
  {
    id: 2,
    first_name: 'Jon',
    last_name: 'Snow',
    gender: 'm',
    age: 14,
    location: 'Winterfell'
  },
  {
    id: 3,
    first_name: 'Catelyn',
    last_name: 'Stark',
    gender: 'f',
    age: 33,
    location: 'Winterfell'
  },
  {
    id: 4,
    first_name: 'Roose',
    last_name: 'Bolton',
    gender: 'm',
    age: 40,
    location: 'Dreadfort'
  },
  {
    id: 5,
    first_name: 'Ramsay',
    last_name: 'Snow',
    gender: 'm',
    age: 15,
    location: 'Dreadfort'
  }
];

const verificationLog = [];
let passTally = 0;
let totalTally = 0;

const logVerification = (description, assertionFn) => {
  verificationLog.push({ description, assertionFn });
};

const executeVerifications = () => {
  console.log('--- Initiating Data Verifications ---');
  verificationLog.forEach(({ description, assertionFn }) => {
    totalTally++;
    try {
      if (assertionFn()) {
        passTally++;
        console.log(`[PASS] ${description}`);
      } else {
        console.error(`[FAIL] ${description}`);
      }
    } catch (err) {
      console.error(`[ERROR] ${description}: ${err.message}`);
    }
  });
  console.log(`--- Verification Summary: ${passTally}/${totalTally} successful ---`);
};


const storeInstance = new SourceAggregator(sourceEntities);

logVerification('Record ingestion verified', () => {
  const allRecords = storeInstance.query().values();
  return sourceEntities.every((srcItem, index) => {
    const retrievedItem = allRecords[index];
    return retrievedItem && Object.keys(srcItem).every(keyName => srcItem[keyName] === retrievedItem[keyName]);
  });
});

logVerification('Identifier value extraction confirmed', () => {
  const identifierList = storeInstance.query().values('id');
  return Array.isArray(identifierList) && identifierList[0] === 1 && identifierList[1] === 2;
});

logVerification('Expected failure on unindexed lookup (fetch)', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.fetch(3);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

logVerification('Expected failure on unindexed deletion', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.destroy(3);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

storeInstance.defineIndex('id');

logVerification('Index establishment verified', () => storeInstance.__index !== null);

logVerification('Index utilization confirmed', () => storeInstance.exists(1));

const removedEntry = storeInstance.destroy(3);

logVerification('Correct record removed via deletion', () => removedEntry.first_name === 'Catelyn');

logVerification('Expected failure on deleting non-existent record', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.destroy(3);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

logVerification('Verification of destroyed record absence', () => storeInstance.__find__(removedEntry) === -1);

storeInstance.removeIndex();

logVerification('Index deactivation confirmed', () => storeInstance.__index === null);

logVerification('Sequence operation error without active index', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.query().sequence(1, 5);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

storeInstance.defineIndex('id');

storeInstance.load();

logVerification('Empty dataset load validation', () => storeInstance.query().count() === 0);

logVerification('First element of empty dataset is null', () => storeInstance.query().first() === null);

logVerification('Last element of empty dataset is null', () => storeInstance.query().last() === null);

const staleQueryHandle = storeInstance.query().filter();

storeInstance.load(sourceEntities);

logVerification('Stale query object invalidation check', () => {
  let exceptionEncountered = false;
  try {
    staleQueryHandle.values();
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

logVerification('Invalid filter type rejection verification', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.query().filter({first_name__eats: 'names can\'t eat'});
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

logVerification('Non-function argument for iteration method rejection', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.query().each(null);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

logVerification('Default empty filter behavior confirmation', () =>
  storeInstance.query().count() === storeInstance.query().filter().count()
);

logVerification('Invalid filter arguments default to empty filter', () =>
  storeInstance.query().count() === storeInstance.query().filter(null, null).count()
);

logVerification('Non-string index definition rejection', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.defineIndex(null);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

logVerification('Mapping creation with non-string key rejection', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.createMapping(null);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

logVerification('Mapping creation with invalid function rejection', () => {
  let exceptionEncountered = false;
  try {
    storeInstance.createMapping('is_bastard', null);
  } catch (err) {
    exceptionEncountered = true;
  }
  return exceptionEncountered;
});

storeInstance.createMapping('is_bastard', entry => entry.last_name === 'Snow');

logVerification('Mapping functionality verification', () => {
  const allRecords = storeInstance.query().values();
  return allRecords.every(record => record.is_bastard === (record.last_name === 'Snow'));
});

logVerification('Sequence operation with multiple arguments confirmed', () => {
  const sequenceResult = storeInstance.query().sequence(5, 2, 3).values();
  const expectedSequence = [storeInstance.fetch(5), storeInstance.fetch(2), storeInstance.fetch(3)];
  return sequenceResult.length === expectedSequence.length &&
         sequenceResult.every((item, idx) => item === expectedSequence[idx]);
});

logVerification('Sequence operation with array argument confirmed', () => {
  const sequenceResult = storeInstance.query().sequence([5, 2, 3]).values();
  const expectedSequence = [storeInstance.fetch(5), storeInstance.fetch(2), storeInstance.fetch(3)];
  return sequenceResult.length === expectedSequence.length &&
         sequenceResult.every((item, idx) => item === expectedSequence[idx]);
});

const freshEntry = {
  id: 6,
  first_name: 'Rob',
  last_name: 'Stark',
  gender: 'm',
  age: 14,
  location: 'Winterfell'
};
storeInstance.insert(freshEntry);

logVerification('Inserted record non-referentiality check', () => {
  const retrievedEntry = storeInstance.query().last();
  return retrievedEntry !== freshEntry;
});

logVerification('Inserted record data integrity', () => {
  const retrievedEntry = storeInstance.query().last();
  return Object.keys(freshEntry).every(keyName => retrievedEntry[keyName] === freshEntry[keyName]);
});

const modifiedEntry = {
  id: 6,
  location: 'Winterfull'
};
storeInstance.insert(modifiedEntry);

logVerification('Duplicate ID insertion replaces existing record', () =>
  storeInstance.query().count() === 6
);

logVerification('Duplicate ID insertion overwrites specific fields', () =>
  storeInstance.query().last().location === 'Winterfull'
);

logVerification('Duplicate ID insertion preserves unmentioned fields', () =>
  storeInstance.query().last().first_name === 'Rob'
);

logVerification('Mapping applied to newly inserted record', () =>
  storeInstance.query().last().is_bastard === false
);

logVerification('Deletion returns the correct removed record', () =>
  storeInstance.destroy(6).first_name === 'Rob'
);

logVerification('Deletion reduces total record count', () =>
  storeInstance.query().count() === 5
);

storeInstance.truncate();

logVerification('Store truncation confirmed', () =>
  storeInstance.query().count() === 0
);

storeInstance.load(sourceEntities);

logVerification('External data load verification', () =>
  storeInstance.query().count() === 5
);

logVerification('Iteration method (.each) functionality', () => {
  let integrityFlag = true;
  storeInstance.query().each((recordItem, idx) => {
    if (!integrityFlag) return;
    const originalItem = sourceEntities[idx];
    if (!originalItem || !Object.keys(originalItem).every(keyName => originalItem[keyName] === recordItem[keyName])) {
      integrityFlag = false;
    }
  });
  return integrityFlag;
});

logVerification('Filter (exact match) count verification', () =>
  storeInstance.query().filter({first_name: 'Jon'}).count() === 1
);

logVerification('Filter (exact match) content verification', () =>
  storeInstance.query().filter({first_name: 'Jon'}).first().first_name === 'Jon'
);

logVerification('Filter (not equal) count verification', () =>
  storeInstance.query().filter({first_name__not: 'Jon'}).count() === 4
);

logVerification('Filter (not equal) content verification', () => {
  let integrityFlag = true;
  storeInstance.query().filter({first_name__not: 'Jon'}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = (recordItem.first_name !== 'Jon');
  });
  return integrityFlag;
});

logVerification('Filter (greater than) count verification', () =>
  storeInstance.query().filter({age__gt: 33}).count() === 2
);

logVerification('Filter (greater than) content verification', () => {
  let integrityFlag = true;
  storeInstance.query().filter({age__gt: 33}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = (recordItem.age > 33);
  });
  return integrityFlag;
});

logVerification('Filter (greater than or equal) count verification', () =>
  storeInstance.query().filter({age__gte: 33}).count() === 3
);

logVerification('Filter (greater than or equal) content verification', () => {
  let integrityFlag = true;
  storeInstance.query().filter({age__gte: 33}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = (recordItem.age >= 33);
  });
  return integrityFlag;
});

logVerification('Filter (less than) count verification', () =>
  storeInstance.query().filter({age__lt: 33}).count() === 2
);

logVerification('Filter (less than) content verification', () => {
  let integrityFlag = true;
  storeInstance.query().filter({age__lt: 33}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = (recordItem.age < 33);
  });
  return integrityFlag;
});

logVerification('Filter (less than or equal) count verification', () =>
  storeInstance.query().filter({age__lte: 33}).count() === 3
);

logVerification('Filter (less than or equal) content verification', () => {
  let integrityFlag = true;
  storeInstance.query().filter({age__lte: 33}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = (recordItem.age <= 33);
  });
  return integrityFlag;
});

logVerification('Filter (case-insensitive contains) count verification', () =>
  storeInstance.query().filter({first_name__icontains: 'R'}).count() === 3
);

logVerification('Filter (case-insensitive contains) content verification', () => {
  let integrityFlag = true;
  storeInstance.query().filter({first_name__icontains: 'R'}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = (recordItem.first_name.toLowerCase().includes('R'.toLowerCase()));
  });
  return integrityFlag;
});

logVerification('Filter (case-sensitive contains) count verification', () =>
  storeInstance.query().filter({first_name__contains: 'R'}).count() === 2
);

logVerification('Filter (case-sensitive contains) content verification', () => {
  let integrityFlag = true;
  storeInstance.query().filter({first_name__contains: 'R'}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = (recordItem.first_name.includes('R'));
  });
  return integrityFlag;
});

logVerification('Filter (in list) count verification', () =>
  storeInstance.query().filter({first_name__in: ['Catelyn', 'Eddard']}).count() === 2
);

logVerification('Filter (in list) content verification', () => {
  const allowedNames = ['Catelyn', 'Eddard'];
  let integrityFlag = true;
  storeInstance.query().filter({first_name__in: allowedNames}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = allowedNames.includes(recordItem.first_name);
  });
  return integrityFlag;
});

logVerification('Filter (not in list) count verification', () =>
  storeInstance.query().filter({first_name__not_in: ['Catelyn', 'Eddard']}).count() === 3
);

logVerification('Filter (not in list) content verification', () => {
  const disallowedNames = ['Catelyn', 'Eddard'];
  let integrityFlag = true;
  storeInstance.query().filter({first_name__not_in: disallowedNames}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = !disallowedNames.includes(recordItem.first_name);
  });
  return integrityFlag;
});

logVerification('Exclude operation count verification', () =>
  storeInstance.query().exclude({first_name__not_in: ['Catelyn', 'Eddard']}).count() === 2
);

logVerification('Exclude operation content verification', () => {
  const expectedNames = ['Catelyn', 'Eddard'];
  let integrityFlag = true;
  storeInstance.query().exclude({first_name__not_in: expectedNames}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = expectedNames.includes(recordItem.first_name);
  });
  return integrityFlag;
});

logVerification('Filter with OR conditions (separated objects) content verification', () => {
  const namesForOr = ['Catelyn', 'Eddard'];
  const agesForOr = [15, 40];
  let integrityFlag = true;
  storeInstance.query().filter({first_name__in: namesForOr}, {age__in: agesForOr}).each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = namesForOr.includes(recordItem.first_name) || agesForOr.includes(recordItem.age);
  });
  return integrityFlag;
});

logVerification('Filter with OR conditions (separated objects) count verification', () =>
  storeInstance.query().filter({first_name__in: ['Catelyn', 'Eddard']}, {age__in: [15, 40]}).count() === 4
);

logVerification('Filter with OR matches IN for single field', () => {
  const orFiltered = storeInstance.query().filter({age: 15}, {age: 40}, {age: 33}).values();
  const inFiltered = storeInstance.query().filter({age__in: [15, 40, 33]}).values();
  return orFiltered.length === inFiltered.length &&
         orFiltered.every((item, idx) => item === inFiltered[idx]);
});

const clonedStore = storeInstance.query().spawn();

logVerification('Spawned instance type verification', () =>
  clonedStore instanceof SourceAggregator
);

logVerification('Spawned instance record count matching parent', () =>
  clonedStore.query().count() === storeInstance.query().count()
);

logVerification('Spawned instance records are not referential to parent records', () =>
  clonedStore.query().filter({id: 1}).first() !== storeInstance.query().filter({id: 1}).first()
);

logVerification('Spawned instance record values correspond to parent', () => {
  let integrityFlag = true;
  clonedStore.query().each(recordItem => {
    if (!integrityFlag) return;
    integrityFlag = storeInstance.query().filter(recordItem).count() === 1;
  });
  return integrityFlag;
});

logVerification('Update operation on spawned instance confirmed', () =>
  clonedStore.query().filter({first_name: 'Ramsay'}).update({last_name: 'Bolton'}) &&
  (clonedStore.query().filter({first_name: 'Ramsay'}).first().last_name === 'Bolton')
);

logVerification('Remove operation on spawned instance confirmed', () =>
  clonedStore.query().filter({first_name__in: ['Eddard', 'Catelyn']}).remove() &&
  clonedStore.query().filter({first_name__in: ['Eddard', 'Catelyn']}).count() === 0
);

const isolatedClone = storeInstance.query().spawn(true);

logVerification('Spawn with index ignored verified', () =>
  isolatedClone.__index === null
);
logVerification('Spawned instance without index can remove records', () =>
  isolatedClone.query().filter({id__not: 1}).remove() && isolatedClone.query().count() === 1
);

logVerification('Ascending sort first value verification', () =>
  storeInstance.query().sort('age').first().first_name === 'Jon'
);
logVerification('Ascending sort last value verification', () =>
  storeInstance.query().sort('age').last().first_name === 'Roose'
);

logVerification('Descending sort first value verification', () =>
  storeInstance.query().sort('age', true).first().first_name === 'Roose'
);
logVerification('Descending sort last value verification', () =>
  storeInstance.query().sort('age', true).last().first_name === 'Jon'
);

logVerification('Maximum value calculation verification', () =>
  storeInstance.query().max('age') === 40
);

logVerification('Minimum value calculation verification', () =>
  storeInstance.query().min('age') === 14
);

logVerification('Summation calculation verification', () =>
  storeInstance.query().sum('age') === (14 + 15 + 33 + 35 + 40)
);

logVerification('Average calculation verification', () =>
  storeInstance.query().avg('age') === ((14 + 15 + 33 + 35 + 40) / 5)
);

logVerification('Reduce operation verification', () =>
  storeInstance.query().reduce('age', (previous, current) => previous + current) === (14 + 15 + 33 + 35 + 40)
);

logVerification('Distinct values count verification', () =>
  storeInstance.query().distinct('location').length === 2
);

logVerification('Limit operation set size verification', () =>
  storeInstance.query().limit(2).count() === 2
);

executeVerifications();