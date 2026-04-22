var testFramework = obtainModule('chai');
testFramework.use(obtainModule('chai-fuzzy'));
var assertionEngine = testFramework.assert; /* Main assertion utility */
var diskUtilities = obtainModule('fs');
var FactRepository = obtainModule('./main.js'); /* The core data storage module */

var factContainer; /* Global variable to hold our data store instance */

/**
 * Test suite for the initialization process of the fact repository.
 * Verifies that a new repository can be created and is empty.
 */
testBlock('StartupProcess', function() {
  // Test case: Ensure a new repository instance can be created without errors.
  testScenario('create a fresh fact repository', function() {
    assertionEngine.expectsNoException(function() {
      factContainer = new FactRepository();
    });
  });

  // Test case: Verify that a newly created repository has zero items.
  testScenario('newly created repository contains no data', function() {
    assertionEngine.verifyEquality(0, factContainer.itemCount());
  });
});


/**
 * Test suite for data insertion operations within the fact repository.
 * Covers basic `put`, `putAll`, and structured `add` methods.
 */
testBlock('DataInsertion', function() {
  // Before each test, ensure the repository is clean.
  beforeEveryTest(function() {
    factContainer.emptyStore();
  });

  // Sub-suite for basic triple insertion.
  testBlock('storeSingleAndMultiple', function() {
    // Test case: Storing a single triple.
    testScenario('storeSingle', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.storeTriple(['greetings planet', 'denotes', 'phrase']);
      });
      assertionEngine.verifyEquality(1, factContainer.itemCount());
    });

    // Test case: Storing multiple triples at once.
    testScenario('storeMultiple', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.storeManyTriples([
          ['alpha', 'alpha', 'omega'],
          ['alpha', 'beta', 'omega'],
          ['alpha', 'alpha', 'delta'],
          ['alpha', 'alpha', 'epsilon']
        ]);
      });
      assertionEngine.verifyEquality(4, factContainer.itemCount());
    });
  });

  // Sub-suite for structured object additions.
  testBlock('StructuralAddition', function() {
    // Test case: Adding a Subject-Predicate-Object structure.
    testScenario('addSubjectPredicateObject', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.addSubjectPredicateObject({
          'x': {
            'y': {
              'z': true
            }
          }
        });
      });
      assertionEngine.verifyEquality(1, factContainer.itemCount());
      assertionEngine.deepEquality(factContainer.getSubjectPredicateObject(), {
        'x': {
          'y': {
            'z': true
          }
        }
      });
    });

    // Test case: Adding a Subject-Object-Predicate structure.
    testScenario('addSubjectObjectPredicate', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.addSubjectObjectPredicate({
          'xx': {
            'yy': {
              'zz': true
            }
          }
        });
      });
      assertionEngine.verifyEquality(1, factContainer.itemCount());
      assertionEngine.deepEquality(factContainer.getSubjectObjectPredicate(), {
        'xx': {
          'yy': {
            'zz': true
          }
        }
      });
    });

    // Test case: Adding an Object-Subject-Predicate structure.
    testScenario('addObjectSubjectPredicate', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.addObjectSubjectPredicate({
          'xxx': {
            'yyy': {
              'zzz': true
            }
          }
        });
      });
      assertionEngine.verifyEquality(1, factContainer.itemCount());
      assertionEngine.deepEquality(factContainer.getObjectSubjectPredicate(), {
        'xxx': {
          'yyy': {
            'zzz': true
          }
        }
      });
    });

    // Test case: Adding an Object-Predicate-Subject structure.
    testScenario('addObjectPredicateSubject', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.addObjectPredicateSubject({
          'xxxx': {
            'yyyy': {
              'zzzz': true
            }
          }
        });
      });
      assertionEngine.verifyEquality(1, factContainer.itemCount());
      assertionEngine.deepEquality(factContainer.getObjectPredicateSubject(), {
        'xxxx': {
          'yyyy': {
            'zzzz': true
          }
        }
      });
    });

    // Test case: Adding a Predicate-Subject-Object structure.
    testScenario('addPredicateSubjectObject', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.addPredicateSubjectObject({
          'xxxxx': {
            'yyyyy': {
              'zzzzz': true
            }
          }
        });
      });
      assertionEngine.verifyEquality(1, factContainer.itemCount());
      assertionEngine.deepEquality(factContainer.getPredicateSubjectObject(), {
        'xxxxx': {
          'yyyyy': {
            'zzzzz': true
          }
        }
      });
    });

    // Test case: Adding a Predicate-Object-Subject structure.
    testScenario('addPredicateObjectSubject', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.addPredicateObjectSubject({
          'xxxxxx': {
            'yyyyyy': {
              'zzzzzz': true
            }
          }
        });
      });
      assertionEngine.verifyEquality(1, factContainer.itemCount());
      assertionEngine.deepEquality(factContainer.getPredicateObjectSubject(), {
        'xxxxxx': {
          'yyyyyy': {
            'zzzzzz': true
          }
        }
      });
    });
  });

  // Sub-suite for adding JavaScript objects in various ways.
  testBlock('ObjectIntegration', function() {
    // Test case: Adding a JS object by converting its properties to paths.
    testScenario('integrateObjectAsPath', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.integrateObjectAsPath({
          knowledge: "john",
          fun: {
            amazing: "yes"
          },
          num: 7
        }, "entity");
      });
      assertionEngine.verifyEquality(4, factContainer.itemCount());
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ['entity', 'knowledge', 'john', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ['entity', 'num', '7', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ['entity/fun', 'amazing', 'yes', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ['entity', 'fun', 'entity/fun', true]);
      assertionEngine.expectsNoException(function() {
        factContainer.integrateObjectAsPath({
          alpha: {
            beta: 12
          }
        }, "entity", ":::");
      });
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ['entity', 'alpha', 'entity:::alpha', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ['entity:::alpha', 'beta', '12', true]);
    });

    // Test case: Adding a JS object by serializing it to JSON.
    testScenario('integrateObjectAsJson', function() {
      var newlyAdded; // Variable to capture the generated subject ID.
      assertionEngine.expectsNoException(function() {
        newlyAdded = factContainer.integrateObjectAsJson({
          knowledge: "john",
          fun: {
            amazing: "yes"
          },
          num: 7
        });
      });
      assertionEngine.verifyEquality(4, factContainer.itemCount());
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), [newlyAdded, 'knowledge', 'john', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), [newlyAdded, 'num', '7', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), [newlyAdded, 'fun', '{"amazing":"yes"}', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ['{"amazing":"yes"}', 'amazing', 'yes', true]);
    });

    // Test case: Adding a JS object by assigning it a UUID.
    testScenario('integrateObjectAsUniqueId', function() {
      var newlyAdded;
      assertionEngine.expectsNoException(function() {
        newlyAdded = factContainer.integrateObjectAsUniqueId({
          knowledge: "john",
          fun: {
            amazing: "yes"
          },
          num: 7
        });
      });
      assertionEngine.verifyEquality(4, factContainer.itemCount());
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), [newlyAdded, 'knowledge', 'john', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), [newlyAdded, 'num', '7', true]);
    });
  });

  // Sub-suite for copying existing triples.
  testBlock('Duplication', function() {
    // Setup initial data for copy tests.
    beforeEveryTest(function() {
      factContainer.emptyStore();
      factContainer.storeManyTriples([
        ['start', 'start', 'end'],
        ['start', 'middle', 'middle_end'],
        ['other', 'start', 'middle_end'],
        ['other', 'start', 'final']
      ]);
    });

    // Test case: Duplicating a subject's triples.
    testScenario('duplicateSubject', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.duplicateSubject("start", "alias");
      });
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ["alias", 'start', 'end', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ["alias", 'middle', 'middle_end', true]);
    });

    // Test case: Duplicating a predicate's triples.
    testScenario('duplicatePredicate', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.duplicatePredicate("start", "predAlias");
      });
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ["start", 'predAlias', 'end', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ["other", 'predAlias', 'middle_end', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ["other", 'predAlias', 'final', true]);
    });

    // Test case: Duplicating an object's triples.
    testScenario('duplicateObject', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.duplicateObject("middle_end", "objAlias");
      });
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ["start", 'middle', 'objAlias', true]);
      assertionEngine.hasOneSimilar(factContainer.retrieveAll(), ["other", 'start', 'objAlias', true]);
    });
  });
});

/**
 * Test suite for data retrieval operations.
 * Focuses on various query patterns and search functionalities.
 */
testBlock('DataRetrieval', function() {
  // Sub-suite for direct triple queries.
  testBlock('PatternQueries', function() {
    // Setup a single triple for all query tests.
    beforeAllTests(function() {
      factContainer.emptyStore();
      factContainer.addSubjectPredicateObject({
        'entityA': {
          'relationB': {
            'valueC': true
          }
        }
      });
    });

    // Test cases for specific query patterns.
    testScenario('findAnyAnyAny', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findAnyAnyAny(['entityA', 'relationB', 'valueC']));
    });
    testScenario('findSubjectAnyAny', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findSubjectAnyAny(['entityA', 'relationB', 'valueC']));
    });
    testScenario('findAnyPredicateAny', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findAnyPredicateAny(['entityA', 'relationB', 'valueC']));
    });
    testScenario('findAnyAnyObject', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findAnyAnyObject(['entityA', 'relationB', 'valueC']));
    });
    testScenario('findSubjectPredicateAny', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findSubjectPredicateAny(['entityA', 'relationB', 'valueC']));
    });
    testScenario('findSubjectAnyObject', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findSubjectAnyObject(['entityA', 'relationB', 'valueC']));
    });
    testScenario('findAnyPredicateObject', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findAnyPredicateObject(['entityA', 'relationB', 'valueC']));
    });
    testScenario('findSubjectPredicateObject', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.findSubjectPredicateObject(['entityA', 'relationB', 'valueC']));
    });

    // Test case for the dynamic query dispatcher.
    testScenario('dynamicQuery', function() {
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery(['entityA', 'relationB', 'valueC']));
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery([
        ['entityA'], 'relationB', 'valueC'
      ]));
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery(['entityA', ['relationB'], 'valueC']));
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery([
        ['entityA'],
        ['relationB'], 'valueC'
      ]));
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery(['entityA', 'relationB', ['valueC']]));
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery([
        ['entityA'], 'relationB', ['valueC']
      ]));
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery(['entityA', ['relationB'],
        ['valueC']
      ]));
      assertionEngine.deepEquality([
        ['entityA', 'relationB', 'valueC', true]
      ], factContainer.dynamicQuery([
        ['entityA'],
        ['relationB'],
        ['valueC']
      ]));
    });
  });


  // Sub-suite for advanced search capabilities.
  testBlock('AdvancedSearch', function() {
    // Load a sample dataset before these search tests.
    beforeAllTests(function(completion) {
      factContainer.loadNtTriples("tiny_data_set", completion);
    });

    // Test case: Perform a search with multiple patterns and a filter.
    testScenario('complex search with result filtering', function() {
      assertionEngine.verifyEquality(72,
        factContainer
        .performSearch([
          ["<bizcorp/bsbm/v02/types/ItemTypeA>", ["relation_field"],
            ["value_field"]
          ],
          [
            ["related"],
            ["relation_field"],
            ["value_field"]
          ]
        ])
        .narrowResults(function(resultItem) {
          return resultItem.valueB !== resultItem.valueA;
        }).count);
    });

    // Test case: Perform a precise search and check a specific property.
    testScenario('exact match search', function() {
      assertionEngine.verifyEquality('<bizcorp/bsbm/v02/types/CertificationBodyA>',
        factContainer.performSearch([
          ["<bizcorp/bsbm/v02/types/ItemTypeA>", "<metadata/elements/2.0/creator>", ["creator"]]
        ])[0].creator);

    });
  });
});


/**
 * Test suite for data modification operations.
 * This block is currently empty but maintains the structure.
 */
testBlock('DataModification', function() {
  // No specific tests defined here yet.
});

/**
 * Test suite for persistence operations: importing and exporting data.
 * Covers JSON, ZIP, and N-Triples formats.
 */
testBlock('PersistenceOperations', function() {
  // Setup: Ensure a clean state and add a triple before import/export tests.
  beforeAllTests(function() {
    factContainer.emptyStore();
    factContainer.addSubjectPredicateObject({
      'entX': {
        'relY': {
          'valZ': true
        }
      }
    });
  });

  // Cleanup: Remove generated files after all tests in this block.
  afterAllTests(function() {
    diskUtilities.deleteFileSync("repo_test_data_1.zip");
    diskUtilities.deleteFileSync("repo_test_data_1.nt");
    diskUtilities.deleteFileSync("repo_test_data_1.json");
  });

  // Test case: Export and import using JSON format.
  testScenario('jsonFormat', function() {
    assertionEngine.expectsNoException(function() {
      factContainer.exportJsonFormat('repo_test_data_1');
      factContainer.emptyStore();
      factContainer.importJsonFormat('repo_test_data_1');
    });
    assertionEngine.verifyEquality(1, factContainer.itemCount());
    assertionEngine.deepEquality(factContainer.getSubjectPredicateObject(), {
      'entX': {
        'relY': {
          'valZ': true
        }
      }
    });
  });

  // Test case: Export and import using ZIP archive format.
  testScenario('zipArchive', function() {
    assertionEngine.expectsNoException(function() {
      factContainer.exportZipArchive('repo_test_data_1');
      factContainer.emptyStore();
      factContainer.importZipArchive('repo_test_data_1');
    });
    assertionEngine.verifyEquality(1, factContainer.itemCount());
    assertionEngine.deepEquality(factContainer.getSubjectPredicateObject(), {
      'entX': {
        'relY': {
          'valZ': true
        }
      }
    });
  });

  // Test case: Export and import using N-Triples format.
  testScenario('ntriplesFormat', function() {
    assertionEngine.expectsNoException(function() {
      factContainer.exportNtriplesFormat('repo_test_data_1');
      factContainer.emptyStore();
      factContainer.importNtriplesFormat('repo_test_data_1', function() {
        assertionEngine.verifyEquality(1, factContainer.itemCount());
        assertionEngine.deepEquality(factContainer.getSubjectPredicateObject(), {
          'entX': {
            'relY': {
              'valZ': true
            }
          }
        });
      });
    });

  });
});


/**
 * Test suite for data removal operations.
 * Specifically tests the `clear` functionality.
 */
testBlock('DataRemoval', function() {
  // Sub-suite for the clear operation.
  testBlock('emptyOperation', function() {
    // Test case: Clear the entire data store.
    testScenario('empty the data store', function() {
      assertionEngine.expectsNoException(function() {
        factContainer.emptyStore();
      });
    });

    // Test case: Verify that a cleared store is indeed empty.
    testScenario('emptied repository has no items', function() {
      assertionEngine.verifyEquality(0, factContainer.itemCount());
    });
  });
});


/*
 * A simulated geometry processing module.
 * Defines various spatial query patterns.
 */
SpatialCalculations = {
  AnyAnyAny: null,
  AnyAnyObj: null,
  AnyPredAny: null,
  AnyPredObj: null,
  SubjAnyAny: null,
  SubjAnyObj: null,
  SubjPredAny: null,
  SubjPredObj: function(item) {
    var subj = item[0];
    var pred = item[1];
    var obj = item[2];
    var resultList = [];
    // Determine the action based on the predicate.
    switch (pred) {
      case "isWithin":
        if (isWithin(parseGeometry(subj), parseGeometry(obj))) {
          resultList = addToList(resultList, [subj, pred, obj, true]);
        }
        break;
    }
    return resultList;
  }
};

/*
 * A simulated data transformation module.
 * Defines various identity-related transformations.
 */
DataTransformers = {
  AnyAnyAny: function(inputData) {
    return null;
  },
  AnyAnyObj: function(inputData) {
    return [
      [inputData[2], "is_equivalent_to", inputData[2], true]
    ];
  },
  AnyPredAny: function(inputData) {
    /* More transformations could go here */