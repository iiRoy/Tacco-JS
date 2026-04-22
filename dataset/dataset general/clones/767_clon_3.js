const testFramework = require('chai');
testFramework.use(require('chai-fuzzy'));
const check = testFramework.assert;
const fileSystemOps = require('fs');
const DataStoreManager = require('./index.js'); // The core data management module

let repositoryInstance; // Global instance of the data store for test suites

// --- Test Suite for Initial Setup and Basic State ---
describe('DataStoreInitialization', () => {

  // Test to confirm that a new instance of the data store can be created without exceptions.
  it('should successfully instantiate a new data store', () => {
    check.doesNotThrow(() => {
      repositoryInstance = new DataStoreManager();
    }, 'Failed to create a new DataStoreManager instance. Check constructor.');
  });

  // Test to verify that a newly created data store starts in an empty state.
  it('a freshly created data store must be empty', () => {
    // Ensure repositoryInstance is valid, re-initializing if necessary (guard clause).
    if (!repositoryInstance || typeof repositoryInstance.currentSize !== 'function') {
      repositoryInstance = new DataStoreManager();
    }
    check.equal(0, repositoryInstance.currentSize(), 'New data store reported non-zero size.');
  });
});

// --- Test Suite for Data Addition Operations ---
describe('DataInsertionOperations', () => {
  // Before each test in this suite, ensure the data store is completely empty.
  beforeEach(() => {
    repositoryInstance.purgeData(); // Renamed 'clear' to 'purgeData'
  });

  // Sub-suite for basic triple recording methods.
  describe('simpleTripleEntry', () => {
    // Test for recording a single triple.
    it('should allow recording a single triple entry', () => {
      const singleEntry = ['first_subject_item', 'first_predicate_item', 'first_object_item'];
      repositoryInstance.record(singleEntry); // Renamed 'put' to 'record'
      check.equal(1, repositoryInstance.currentSize(), 'Size mismatch after adding one triple.');
    });

    // Test for recording multiple triples in a batch.
    it('should allow recording multiple triples in a batch operation', () => {
      const batchEntries = [
        ['groupA', 'hasMember', 'item1'],
        ['groupA', 'hasMember', 'item2'],
        ['groupB', 'hasMember', 'item3'],
        ['groupC', 'relatedTo', 'groupA']
      ];
      repositoryInstance.recordBatch(batchEntries); // Renamed 'putAll' to 'recordBatch'
      check.equal(batchEntries.length, repositoryInstance.currentSize(), 'Size mismatch after batch triple entry.');
    });
  });

  // Sub-suite for structured object additions, using various index permutations.
  describe('structuredObjectAdditions', () => {
    // Test for adding data in Subject-Predicate-Object (SPO) order.
    it('should correctly insert SPO structured data', () => {
      const spoData = {
        'entity_alpha': {
          'attribute_beta': {
            'value_gamma': true
          }
        }
      };
      repositoryInstance.insertSPO(spoData); // Renamed addSPO to insertSPO
      check.equal(1, repositoryInstance.currentSize(), 'SPO insertion size incorrect.');
      check.deepEqual(repositoryInstance.retrieveSPO(), spoData, 'Retrieved SPO data does not match inserted.');
    });

    // Test for adding data in Subject-Object-Predicate (SOP) order.
    it('should correctly insert SOP structured data', () => {
      const sopData = {
        'entity_a_a': {
          'object_b_b': {
            'predicate_c_c': false // Changed value from true to false
          }
        }
      };
      repositoryInstance.insertSOP(sopData); // Renamed addSOP to insertSOP
      check.equal(1, repositoryInstance.currentSize(), 'SOP insertion size incorrect.');
      check.deepEqual(repositoryInstance.retrieveSOP(), sopData, 'Retrieved SOP data does not match inserted.');
    });

    // Test for adding data in Object-Subject-Predicate (OSP) order.
    it('should correctly insert OSP structured data', () => {
      const ospData = {
        'value_a_a_a': {
          'entity_b_b_b': {
            'property_c_c_c': 'a_string_value' // Changed value from true to string
          }
        }
      };
      repositoryInstance.insertOSP(ospData); // Renamed addOSP to insertOSP
      check.equal(1, repositoryInstance.currentSize(), 'OSP insertion size incorrect.');
      check.deepEqual(repositoryInstance.retrieveOSP(), ospData, 'Retrieved OSP data does not match inserted.');
    });

    // Test for adding data in Object-Predicate-Subject (OPS) order.
    it('should correctly insert OPS structured data', () => {
      const opsData = {
        'value_a_a_a_a': {
          'property_b_b_b_b': {
            'entity_c_c_c_c': 42 // Changed value from true to number
          }
        }
      };
      repositoryInstance.insertOPS(opsData); // Renamed addOPS to insertOPS
      check.equal(1, repositoryInstance.currentSize(), 'OPS insertion size incorrect.');
      check.deepEqual(repositoryInstance.retrieveOPS(), opsData, 'Retrieved OPS data does not match inserted.');
    });

    // Test for adding data in Predicate-Subject-Object (PSO) order.
    it('should correctly insert PSO structured data', () => {
      const psoData = {
        'property_a_a_a_a_a': {
          'entity_b_b_b_b_b': {
            'value_c_c_c_c_c': {
              nestedKey: 'nestedValue'
            } // Changed value from true to nested object
          }
        }
      };
      repositoryInstance.insertPSO(psoData); // Renamed addPSO to insertPSO
      check.equal(1, repositoryInstance.currentSize(), 'PSO insertion size incorrect.');
      check.deepEqual(repositoryInstance.retrievePSO(), psoData, 'Retrieved PSO data does not match inserted.');
    });

    // Test for adding data in Predicate-Object-Subject (POS) order.
    it('should correctly insert POS structured data', () => {
      const posData = {
        'property_a_a_a_a_a_a': {
          'value_b_b_b_b_b_b': {
            'entity_c_c_c_c_c_c': ['arrayItem1', 'arrayItem2']
          } // Changed value from true to array
        }
      };
      repositoryInstance.insertPOS(posData); // Renamed addPOS to insertPOS
      check.equal(1, repositoryInstance.currentSize(), 'POS insertion size incorrect.');
      check.deepEqual(repositoryInstance.retrievePOS(), posData, 'Retrieved POS data does not match inserted.');
    });
  });

  // Sub-suite for adding JavaScript objects, converting them to triples.
  describe('jsObjectIntegration', () => {
    // Helper function to verify presence of specific triples in the store.
    const verifyTriplesExist = (store, expectedTriples) => {
      const allCurrentTriples = store.getAllTriples(); // Renamed 'all' to 'getAllTriples'
      expectedTriples.forEach(expected => {
        check.containOneLike(allCurrentTriples, expected, `Missing expected triple: ${JSON.stringify(expected)}`);
      });
    };

    // Test for adding a JS object by converting its structure into paths.
    it('should add a JS object by converting its structure to paths', () => {
      const sourceObject = {
        userId: "user123",
        preferences: {
          theme: "dark",
          notifications: true
        },
        isActive: false
      };
      const rootPath = "user_root";
      const pathDelimiter = "->"; // Changed path separator from "/" or ">" to "->"

      repositoryInstance.addJsObjectAsPath(sourceObject, rootPath, pathDelimiter); // Renamed addJSObjectAsPath

      check.equal(4, repositoryInstance.currentSize(), 'Path object conversion size mismatch.');
      const expectedPathTriples = [
        [rootPath, 'userId', 'user123', true],
        [rootPath, 'isActive', 'false', true], // Boolean converted to string
        [rootPath, 'preferences', `${rootPath}${pathDelimiter}preferences`, true],
        [`${rootPath}${pathDelimiter}preferences`, 'theme', 'dark', true]
      ];
      verifyTriplesExist(repositoryInstance, expectedPathTriples);
    });

    // Test for adding a JS object by serializing sub-objects to JSON strings.
    it('should add a JS object by converting sub-objects to JSON strings', () => {
      let generatedSubjectId;
      const jsonObject = {
        orderId: "ORD789",
        customer: {
          name: "John Doe",
          email: "john@example.com"
        },
        totalAmount: 150.75
      };

      generatedSubjectId = repositoryInstance.addJsObjectAsJson(jsonObject); // Renamed addJSObjectAsJSON

      check.equal(4, repositoryInstance.currentSize(), 'JSON object conversion size mismatch.');
      const expectedJsonTriples = [
        [generatedSubjectId, 'orderId', 'ORD789', true],
        [generatedSubjectId, 'totalAmount', '150.75', true],
        [generatedSubjectId, 'customer', '{"name":"John Doe","email":"john@example.com"}', true],
        ['{"name":"John Doe","email":"john@example.com"}', 'name', 'John Doe', true] // Nested property
      ];
      verifyTriplesExist(repositoryInstance, expectedJsonTriples);
    });

    // Test for adding a JS object, assigning a UUID as the primary subject.
    it('should add a JS object by assigning a UUID as its subject', () => {
      let assignedUniqueId;
      const uuidObject = {
        event: "Conference",
        location: {
          city: "Metropolis",
          country: "Imaginary"
        },
        date: "2024-01-01"
      };

      assignedUniqueId = repositoryInstance.addJsObjectAsUuid(uuidObject); // Renamed addJSObjectAsUUID

      check.equal(4, repositoryInstance.currentSize(), 'UUID object conversion size mismatch.');
      const expectedUuidTriples = [
        [assignedUniqueId, 'event', 'Conference', true],
        [assignedUniqueId, 'date', '2024-01-01', true],
      ];
      verifyTriplesExist(repositoryInstance, expectedUuidTriples);

      // Verify nested object properties indirectly, as their subject might be a new UUID or derived.
      const allTriples = repositoryInstance.getAllTriples();
      const locationTriple = allTriples.find(t => t[0] === assignedUniqueId && t[1] === 'location');
      check.isDefined(locationTriple, 'Location triple not found for UUID object.');
      check.containOneLike(allTriples, [locationTriple[2], 'city', 'Metropolis', true], 'City triple not found for location.');
    });
  });

  // Sub-suite for data replication functionalities.
  describe('dataReplicationFeatures', () => {
    // Before each test, populate the store with a specific set of triples.
    beforeEach(() => {
      repositoryInstance.purgeData();
      repositoryInstance.recordBatch([
        ['item_X', 'has_prop_A', 'val1'],
        ['item_X', 'has_prop_B', 'val2'],
        ['item_Y', 'has_prop_A', 'val3'],
        ['item_Z', 'has_prop_C', 'val4']
      ]);
      check.equal(4, repositoryInstance.currentSize(), 'Initial data for replication tests not as expected.');
    });

    // Test for duplicating all triples associated with a specific subject.
    it('should duplicate all triples for a given subject identifier', () => {
      const originalSub = "item_X";
      const newSub = "item_X_copy";
      repositoryInstance.duplicateEntity(originalSub, newSub); // Renamed copySubject

      check.equal(6, repositoryInstance.currentSize(), 'Size mismatch after subject duplication.'); // 4 original + 2 copied
      check.containOneLike(repositoryInstance.getAllTriples(), [newSub, 'has_prop_A', 'val1', true], 'Duplicated subject triple A missing.');
      check.containOneLike(repositoryInstance.getAllTriples(), [newSub, 'has_prop_B', 'val2', true], 'Duplicated subject triple B missing.');
    });

    // Test for replicating all triples that share a specific predicate.
    it('should replicate all triples for a specific predicate identifier', () => {
      const originalPred = "has_prop_A";
      const newPred = "replicated_prop_A";
      repositoryInstance.replicateAttribute(originalPred, newPred); // Renamed copyPredicate

      check.equal(6, repositoryInstance.currentSize(), 'Size mismatch after predicate replication.'); // 4 original + 2 copied
      check.containOneLike(repositoryInstance.getAllTriples(), ['item_X', newPred, 'val1', true], 'Replicated predicate triple for item_X missing.');
      check.containOneLike(repositoryInstance.getAllTriples(), ['item_Y', newPred, 'val3', true], 'Replicated predicate triple for item_Y missing.');
    });

    // Test for cloning all triples that contain a specific object.
    it('should clone all triples for a specific object identifier', () => {
      const originalObj = "val1";
      const newObj = "val1_clone";
      repositoryInstance.cloneValue(originalObj, newObj); // Renamed copyObject

      check.equal(5, repositoryInstance.currentSize(), 'Size mismatch after object cloning.'); // 4 original + 1 copied
      check.containOneLike(repositoryInstance.getAllTriples(), ['item_X', 'has_prop_A', newObj, true], 'Cloned object triple missing.');
    });
  });
});

// --- Test Suite for Data Query Operations ---
describe('DataRetrievalOperations', () => {
  // Before all tests in this suite, populate the store with a base triple.
  before(() => {
    repositoryInstance.purgeData();
    repositoryInstance.insertSPO({
      'primary_subject': {
        'primary_predicate': {
          'primary_object': true
        }
      }
    });
  });

  // Helper function to simplify and standardize query result assertions.
  const assertQueryMatch = (queryFunction, expectedTriple) => {
    const actualResults = queryFunction();
    check.deepEqual(actualResults, [expectedTriple], `Query results from ${queryFunction.name} did not match expected.`);
  };

  const baseTriple = ['primary_subject', 'primary_predicate', 'primary_object', true];

  // Test cases for various query patterns (method names changed from queryXXX to fetchXXX).
  it('should retrieve XXX pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchXXX(baseTriple), baseTriple);
  });
  it('should retrieve SXX pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchSXX(baseTriple), baseTriple);
  });
  it('should retrieve XPX pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchXPX(baseTriple), baseTriple);
  });
  it('should retrieve XXO pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchXXO(baseTriple), baseTriple);
  });
  it('should retrieve SPX pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchSPX(baseTriple), baseTriple);
  });
  it('should retrieve SXO pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchSXO(baseTriple), baseTriple);
  });
  it('should retrieve XPO pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchXPO(baseTriple), baseTriple);
  });
  it('should retrieve SPO pattern correctly', () => {
    assertQueryMatch(() => repositoryInstance.fetchSPO(baseTriple), baseTriple);
  });

  // Test case for dynamic query dispatch with various input formats.
  it('should correctly handle diverse dynamic query dispatch scenarios', () => {
    const dispatchMethod = repositoryInstance.dynamicQueryFind.bind(repositoryInstance); // Renamed queryDispatch

    // Array of different query patterns to test the dispatch mechanism.
    const queryParameterVariations = [
      ['primary_subject', 'primary_predicate', 'primary_object'],
      [['primary_subject'], 'primary_predicate', 'primary_object'],
      ['primary_subject', ['primary_predicate'], 'primary_object'],
      [['primary_subject'], ['primary_predicate'], 'primary_object'],
      ['primary_subject', 'primary_predicate', ['primary_object']],
      [['primary_subject'], 'primary_predicate', ['primary_object']],
      ['primary_subject', ['primary_predicate'],
        ['primary_object']
      ],
      [['primary_subject'],
        ['primary_predicate'],
        ['primary_object']
      ]
    ];

    // Iterate through variations to ensure consistent results.
    queryParameterVariations.forEach((pattern, index) => {
      check.deepEqual([baseTriple], dispatchMethod(pattern), `Dynamic dispatch pattern ${index} failed.`);
    });
  });

  // Sub-suite for advanced search capabilities, typically involving larger datasets.
  describe('advancedSearchFunctionality', () => {
    // Before all tests, load a larger NTriples dataset.
    before(function(testCompletionCallback) {
      repositoryInstance.purgeData(); // Ensure a clean state before importing.
      repositoryInstance.loadNtData("largeTestDataset", testCompletionCallback); // Renamed importNt to loadNtData
    });

    // Test for executing a complex search query with a custom filter.
    it('should perform complex searches combined with custom filtering logic', () => {
      // Modified search pattern and added an extra filter condition.
      const filteredResults = repositoryInstance.performComplexSearch([ // Renamed search
          ["<bizer/bsbm/v01/instances/ProductType1>", ["relation_type"],
            ["target_entity"]
          ],
          [
            ["similar_concept"],
            ["relation_type"],
            ["target_entity"]
          ]
        ])
        .filter(matchedRecord => {
          // Both objects must be different, and the relation type must not be 'excluded_type'.
          return matchedRecord.target_entity2 !== matchedRecord.target_entity &&
            matchedRecord.relation_type !== 'excluded_type';
        });
      check.equal(72, filteredResults.length, 'Complex search with filter yielded incorrect count.');
    });

    // Test for a precise search that extracts a specific property.
    it('should execute a precise search to extract specific property values', () => {
      const preciseOutcome = repositoryInstance.performComplexSearch([
        ["<bizer/bsbm/v01/instances/ProductType1>", "<dc/elements/1.1/publisher>", ["publisher_name_result"]]
      ]);
      check.isTrue(preciseOutcome.length > 0, 'No results found for precise publisher search.');
      check.equal('<bizer/bsbm/v01/instances/StandardizationInstitution1>',
        preciseOutcome[0].publisher_name_result, 'Precise search publisher name mismatch.');
    });
  });
});

// --- Test Suite for Data Persistence (Import/Export) Operations ---
describe('DataPersistenceOperations', () => {
  const baseExportName = 'data_store_snapshot'; // Renamed base file name
  const jsonFilePath = `${baseExportName}.json`;
  const zipFilePath = `${baseExportName}.zip`;
  const ntFilePath = `${baseExportName}.nt`;

  // Before all tests in this suite, prepare the data store with some content.
  before(() => {
    repositoryInstance.purgeData();
    repositoryInstance.insertSPO({
      'exported_entity': {
        'exported_property': {
          'exported_value': true
        }
      }
    });
    // Add an additional simple triple for more robust export/import verification.
    repositoryInstance.record(['secondary_sub', 'secondary_pred', 'secondary_obj']);
    check.equal(2, repositoryInstance.currentSize(), 'Initial data count for persistence tests is incorrect.');
  });

  // After all persistence tests, clean up any generated files.
  after(() => {
    const filesToClean = [jsonFilePath, zipFilePath, ntFilePath];
    filesToClean.forEach(path => {
      try {
        // Guard clause: Only attempt to delete if the file actually exists.
        if (fileSystemOps.existsSync(path)) {
          fileSystemOps.unlinkSync(path);
        }
      } catch (cleanupError) {
        // Log a warning instead of failing the test suite if cleanup fails.
        console.warn(`Warning: Failed to delete test artifact "${path}". Error: ${cleanupError.message}`);
      }
    });
  });

  // Test for exporting and importing data in JSON format.
  it('should successfully export and import data using JSON format', () => {
    repositoryInstance.exportDataJson(baseExportName); // Renamed exportJSON
    repositoryInstance.purgeData(); // Clear the store to simulate a fresh load.
    check.equal(0, repositoryInstance.currentSize(), 'Store was not empty before JSON import.');
    repositoryInstance.importDataJson(baseExportName); // Renamed importJSON

    check.equal(2, repositoryInstance.currentSize(), 'Size mismatch after JSON import.');
    check.deepEqual(repositoryInstance.retrieveSPO(), {
      'exported_entity': {
        'exported_property': {
          'exported_value': true
        }
      }
    }, 'Retrieved SPO data after JSON import does not match original.');
    check.containOneLike(repositoryInstance.getAllTriples(), ['secondary_sub', 'secondary_pred', 'secondary_obj', true], 'Secondary triple missing after JSON import.');
  });

  // Test for exporting and importing data in ZIP format.
  it('should successfully export and import data using ZIP format', () => {
    repositoryInstance.exportDataZip(baseExportName); // Renamed exportZip
    repositoryInstance.purgeData();
    check.equal(0, repositoryInstance.currentSize(), 'Store was not empty before ZIP import.');
    repositoryInstance.importDataZip(baseExportName); // Renamed importZip

    check.equal(2, repositoryInstance.currentSize(), 'Size mismatch after ZIP import.');
    check.deepEqual(repositoryInstance.retrieveSPO(), {
      'exported_entity': {
        'exported_property': {
          'exported_value': true
        }
      }
    }, 'Retrieved SPO data after ZIP import does not match original.');
  });

  // Test for exporting and importing data in NTriples format (asynchronous).
  it('should successfully export and import data using NTriples format', (testCompletionCallback) => {
    repositoryInstance.exportDataNt(baseExportName); // Renamed exportNt
    repositoryInstance.purgeData();
    check.equal(0, repositoryInstance.currentSize(), 'Store was not empty before NT import.');

    // NT import is asynchronous, requiring a callback.
    repositoryInstance.importDataNt(baseExportName, () => { // Renamed importNt
      check.equal(2, repositoryInstance.currentSize(), 'Size mismatch after NT import.');
      check.deepEqual(repositoryInstance.retrieveSPO(), {
        'exported_entity': {
          'exported_property': {
            'exported_value': true
          }
        }
      }, 'Retrieved SPO data after NT import does not match original.');
      testCompletionCallback(); // Mark asynchronous test as complete.
    });
  });
});

// --- Test Suite for Data Deletion Operations ---
describe('DataRemovalOperations', () => {
  // Sub-suite specifically for the full store cleanup method.
  describe('fullStoreCleanup', () => {
    // Before each test, ensure the store contains some data to be cleared.
    beforeEach(() => {
      repositoryInstance.purgeData();
      repositoryInstance.recordBatch([
        ['temp_subject_1', 'temp_predicate_1', 'temp_object_1'],
        ['temp_subject_2', 'temp_predicate_2', 'temp_object_2']
      ]);
      check.equal(2, repositoryInstance.currentSize(), 'Initial data count for cleanup test is incorrect.');
    });

    // Test to verify that the 'purgeData' method executes without errors.
    it('should execute the full data purge operation without errors', () => {
      repositoryInstance.purgeData(); // Renamed 'clear' to 'purgeData'
    });

    // Test to confirm that after purging, the data store reports zero size.
    it('a completely purged data store should have zero size', () => {
      repositoryInstance.purgeData(); // Ensure it's purged right before checking.
      check.equal(0, repositoryInstance.currentSize(), 'Store size was not zero after purging.');
    });
  });
});

// --- External Plugin/Module Definitions (Structural Modification Example) ---
// These objects illustrate how the original code's structure can be altered
// by introducing hypothetical external modules or changing the role of existing ones.

const SpatialQueryModule = {
  // Renamed from Geometry2D. This module might handle geometric queries.
  // Properties are placeholders for complex functions.
  queryByArea: null,
  findOverlaps: null,
  // Rewritten 'SPO' function to demonstrate more complex logic and external dependencies.
  processSpatialElement: function(elementData) {
    const geoSubject = elementData[0];
    const geoPredicate = elementData[1];
    const geoObject = elementData[2];
    const resultsAccumulator = [];

    // Introducing an intermediate step with a hypothetical external helper.
    const parsedSubject = parseGeometricData(geoSubject);
    const parsedObject = parseGeometricData(geoObject);

    if (geoPredicate === "contains_region") {
      // Simulate a spatial operation check.
      if (checkSpatialRelation(parsedSubject, parsedObject, "contains")) {
        resultsAccumulator.push([geoSubject, geoPredicate, geoObject, true]);
      }
    } else if (geoPredicate === "touches_boundary") {
      // Another simulated operation.
      if (checkSpatialRelation(parsedSubject, parsedObject, "touches")) {
        resultsAccumulator.push([geoSubject, geoPredicate, geoObject, true]);
      }
    }
    return resultsAccumulator;
  }
};

// Dummy helper function for SpatialQueryModule, simulating complex spatial parsing.
function parseGeometricData(input) {
  // In a real application, this would parse WKT, GeoJSON, etc.
  console.log(`(Simulating parsing for: ${input})`);
  return `parsed(${input})`; // Return a dummy parsed representation.
}

// Dummy helper function for SpatialQueryModule, simulating complex spatial checks.
function checkSpatialRelation(geomA, geomB, relationType) {
  // This would involve GIS libraries in a real scenario.
  console.log(`(Simulating spatial check: ${geomA} ${relationType} ${geomB})`);
  return true; // Always true for the purpose of this clone.
}


const ValueTransformationModule = {
  // Renamed from Identity. This module focuses on transforming values or facts.
  // Rewritten methods to demonstrate actual data manipulation rather than simple identity.

  transformAllValues: function(inputFact) {
    // Example: Convert all parts of a fact to uppercase strings.
    return inputFact.map(item => String(item).toUpperCase());
  },

  transformObjectAndAddMetadata: function(inputRecord) {
    // Example: Add a new 'derived_id' field based on the object,
    // and potentially modify the original object value.
    const originalObject = inputRecord[2];
    const transformedObject = `transformed_${originalObject}`;
    const newRecord = [...inputRecord.slice(0, 2), transformedObject, true]; // Update object, keep flag.

    // Adding a new fragment: a metadata property.
    newRecord.push({
      derived_id: `id_${transformedObject.replace(/[^a-zA-Z0-9]/g, '_')}`
    });
    return newRecord;
  },

  filterAndMapPredicate: function(statement) {
    // Example: Only process statements where the predicate starts with 'map_'.
    // This demonstrates filtering/deletion of statements that don't meet a condition.
    if (String(statement[1]).startsWith('map_')) {
      // Transform the subject and object.
      return [`mod_${statement[0]}`, statement[1], `val_${statement[2]}`, true];
    }
    return []; // Return an empty array to effectively "delete" the statement if condition not met.
  }
};