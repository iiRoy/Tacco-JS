// This file serves as a comprehensive suite for validating the functionality
// of the Mingo query engine, particularly its integration with Backbone.js
// and its stream processing capabilities. It utilizes Tape for assertion management.

// Core external dependencies required for the test suite execution.
const unitTestRunner = require('tape'); // The primary test assertion library.
const fileSystemManager = require('fs'); // Node.js module for file system operations.
const utilityBelt = require('underscore'); // A utility library providing helper functions for collections and objects.
// Note: 'JSON' is a global object in Node.js environments, so explicitly requiring it
// is typically unnecessary and can lead to confusion. We will rely on the global JSON object for parsing.
const dataStructureCore = require('backbone'); // The Backbone.js framework for model/collection management.
const queryLogicEngine = require('../mingo'); // The Mingo query engine itself, imported via a relative path.


// Pre-loading datasets from local JSON files for various test scenarios.
// These datasets represent simplified and detailed academic records, read synchronously.
const entryLevelGrades = JSON.parse(fileSystemManager.readFileSync(__dirname + '/data/grades_simple.json', 'utf8'));
// The 'grades_complex.json' dataset was loaded in the original but never utilized.
// For a Type III clone, unused code fragments are candidates for removal.

// Creating a specialized Backbone Collection that integrates Mingo's querying capabilities.
// This allows Backbone collections to directly execute Mingo queries against their models.
const QueryableModelCollection = dataStructureCore.Collection.extend(queryLogicEngine.CollectionMixin);

// --- Main Test Suite for Collection-related Operations ---
unitTestRunner('Mingo Collection Functionality Verification', function (suiteContext) {

  // Nested test block: Validating basic cursor functionalities provided by Mingo.
  suiteContext.test("Fundamental Cursor Operations Assessment", function (cursorTestHarness) {
    // We anticipate making 5 distinct assertions within this specific test block.
    cursorTestHarness.plan(5);

    // Constructing a Mingo query object without any specific filtering criteria.
    // This query will effectively select all documents from the input collection.
    const universalQuery = new queryLogicEngine.Query();
    // Executing the query against the simple grades dataset to obtain a result iterator (cursor).
    const resultIterator = universalQuery.find(entryLevelGrades);

    // Assertion 1: Verify that the cursor correctly indicates the presence of subsequent items.
    cursorTestHarness.ok(resultIterator.hasNext(), "The cursor correctly indicates availability of subsequent items.");
    // Assertion 2: Confirm that the cursor can successfully advance to and retrieve the next item.
    // Calling next() also consumes an item from the cursor's internal state.
    cursorTestHarness.ok(resultIterator.next(), "The cursor successfully retrieves the next item in the sequence.");
    // Assertion 3: Ensure the first item retrieved directly via the cursor's 'first()' method is a valid object.
    const firstItem = resultIterator.first();
    cursorTestHarness.ok(utilityBelt.isObject(firstItem), "The 'first()' method returns a valid object from the collection.");
    // Assertion 4: Validate that the last item retrieved directly via the cursor's 'last()' method is also a valid object.
    const lastItem = resultIterator.last();
    cursorTestHarness.ok(utilityBelt.isObject(lastItem), "The 'last()' method properly yields an object from the collection.");
    // Assertion 5: Check if the total count of items reported by the cursor matches the expected number for this dataset.
    const expectedTotalItems = 800; // This value is hardcoded based on the 'grades_simple.json' content.
    const actualItemCount = resultIterator.count(); // Retrieve the total count of documents in the cursor.
    cursorTestHarness.ok(actualItemCount === expectedTotalItems, `The cursor's count() method correctly reports ${expectedTotalItems} items.`);
  });

  // Nested test block: Evaluating Mingo's seamless integration with Backbone.js collections.
  suiteContext.test("Backbone.js Collection Integration Validation", function (backboneTestContext) {
    // This test is designed to perform a single, critical assertion.
    backboneTestContext.plan(1);

    // Initialize a new QueryableModelCollection, populating it with our simple academic records.
    const academicDataSet = new QueryableModelCollection(entryLevelGrades);

    // Define complex query criteria: find students whose homework or quiz scores are below 50.
    // Renamed fields for Type III diversity: 'type' to 'itemType', 'score' to 'scoreValue'.
    const lowScoreCriteria = {
      $or: [
        { itemType: "quiz", scoreValue: { $lt: 50 } },
        { itemType: "homework", scoreValue: { $lt: 50 } }
      ]
    };
    // Define projection to include only the student ID.
    const projectionFields = { student_id: 1 };
    // Define sorting order: score ascending, then itemType descending.
    // Changed sort order slightly from original for Type III variation.
    const sortOrder = { scoreValue: 1, itemType: -1 };

    // Capture the initial size of the collection for comparison.
    const initialCollectionSize = academicDataSet.length;
    // Type III Addition: A guard clause/validation for an empty dataset.
    if (initialCollectionSize === 0) {
      console.warn("Academic dataset is empty, query results might be unexpectedly zero.");
      // In a real scenario, this might trigger a 'skip' or 'fail' for the test.
    }

    // Execute the Mingo query on the Backbone collection, applying the defined
    // criteria, projection, and sorting instructions.
    const filteredResultsHandle = academicDataSet.query(lowScoreCriteria, projectionFields).sort(sortOrder);

    // Assertion: Verify that the filtered results contain fewer items than the original collection,
    // which confirms that the query filters were successfully applied and reduced the dataset.
    backboneTestContext.ok(filteredResultsHandle.count() < initialCollectionSize, "Mingo query successfully filters a Backbone.js collection, reducing its size.");
  });

  // Nested test block: Verifying complex matching with $all and $elemMatch on deeply nested structures.
  suiteContext.test("Advanced Nested Element Matching with $all and $elemMatch", function (matchTestContext) {
    // This test expects one assertion to pass.
    matchTestContext.plan(1);

    // Sample data representing user profiles with nested project information.
    // Renamed fields extensively for Type III transformation.
    const projectUserProfiles = [
      {
        userProfile: {
          username: 'UserAlpha',
          projectList: [
            { projectName: "Project A", projectRating: { complexityLevel: 6 } },
            { projectName: "Project B", projectRating: { complexityLevel: 2 } }
          ]
        }
      },
      {
        userProfile: {
          username: 'UserBeta',
          projectList: [
            { projectName: "Project C", projectRating: { complexityLevel: 6 } },
            { projectName: "Project D", projectRating: { complexityLevel: 8 } }
          ]
        }
      }
    ];

    // Define the complex filtering rules: find users where ALL projects satisfy a condition.
    // Specifically, find users where ALL projects have a 'complexityLevel' greater than 6.
    const complexFilterConditions = {
      'userProfile.projectList': { // Updated path to reflect renamed fields.
        "$all": [
          {
            "$elemMatch": {
              'projectRating.complexityLevel': { '$gt': 6 } // Updated path to reflect renamed fields.
            }
          }
        ]
      }
    };

    // Execute the find operation using the Mingo engine directly on the sample data.
    const matchedProfileCount = queryLogicEngine.find(projectUserProfiles, complexFilterConditions).count();
    const expectedMatchCount = 1; // Based on the data, only 'UserBeta' has a project with complexity > 6.

    // Assertion: Confirm that the number of matched profiles is precisely as expected by the criteria.
    matchTestContext.ok(matchedProfileCount === expectedMatchCount, "Successfully matched complex nested elements using $all with $elemMatch.");
  });
});


// --- Test Suite for JSON Stream Processing and Filtering ---
unitTestRunner("JSON Data Stream Filtering Capabilities", function (streamTestContext) {
  // This test anticipates two assertions to confirm both filtering and projection.
  streamTestContext.plan(2);

  // Importing necessary Node.js modules for stream operations.
  const fileSystemModule = require('fs'); // For reading files as streams.
  const StreamTransformerBase = require('stream').Transform; // The base class for custom transform streams.
  const nodeUtils = require('util'); // Node.js utility module, primarily for 'inherits'.
  const queryLogicEngineStream = require('../mingo'); // The Mingo engine, specifically its stream capabilities.

  // --- Custom Transform Stream for Parsing JSON Chunks ---
  // This custom stream is designed to take raw buffer chunks (e.g., from a file stream),
  // parse them as JSON, and then push individual objects from the parsed array into the stream pipeline.
  const JsonChunkProcessor = function () {
    // Ensure the constructor is always called with the 'new' keyword.
    if (!(this instanceof JsonChunkProcessor)) {
      return new JsonChunkProcessor();
    }
    // Call the parent Transform constructor, configuring the stream to operate in object mode.
    StreamTransformerBase.call(this, { objectMode: true });
    // Type III Addition: An optional debug log for stream instantiation.
    // console.log("JsonChunkProcessor instance created and ready.");
  };
  // Establish prototypal inheritance, making JsonChunkProcessor a Transform stream.
  nodeUtils.inherits(JsonChunkProcessor, StreamTransformerBase);

  // The core transformation logic for each incoming chunk of data.
  JsonChunkProcessor.prototype._transform = function (inputBuffer, encodingType, completionCallback) {
    const processorInstance = this; // Capture 'this' for consistent context within callbacks.
    try {
      // Parse the incoming buffer chunk as a JSON array. It's crucial to convert the buffer to a string first.
      const parsedDataArray = JSON.parse(inputBuffer.toString(encodingType || 'utf8'));

      // Iterate over each individual object within the parsed array and push it downstream.
      utilityBelt.each(parsedDataArray, function (parsedItem) {
        processorInstance.push(parsedItem);
      });
      // Signal that processing for this chunk is successfully completed.
      completionCallback();
    } catch (parseError) {
      // Type III Addition: Robust error handling for JSON parsing failures.
      processorInstance.emit('error', new Error(`Failed to parse JSON chunk: ${parseError.message}`));
      completionCallback(parseError); // Pass the error to the callback to propagate it.
    }
  };

  // --- Stream Query Setup ---
  let projectedKeysCorrect = true; // Flag to track if projection is correctly applied across all documents.
  let streamQueryCursor; // A reference to a Mingo cursor, used for comparison.

  // Define the Mingo query: find documents where the 'assessmentScores' array contains an exam score > 90.
  // Also, project only the 'studentName' field (renamed from 'name').
  const streamFilterQuery = new queryLogicEngineStream.Query({
    assessmentScores: { $elemMatch: { examType: "exam", achievedScore: { $gt: 90 } } } // Renamed fields for Type III.
  }, { studentName: 1 }); // Renamed 'name' to 'studentName' for Type III.

  // Open a readable stream to the 'students.json' file.
  const inputFileStream = fileSystemModule.createReadStream(__dirname + '/data/students.json', { encoding: 'utf8' });
  // Attach a 'data' event listener to the file stream. This part processes the *first* chunk.
  inputFileStream.on('data', function (bufferChunk) {
    // When a chunk arrives, parse it and create a Mingo cursor from it.
    // This 'streamQueryCursor' is based on the initial chunk, used later for comparison.
    streamQueryCursor = streamFilterQuery.find(JSON.parse(bufferChunk.toString('utf8')));
  });

  // Create a Mingo query stream from our defined Mingo query object.
  const queryResultStream = streamFilterQuery.stream();
  let documentCount = 0; // Counter for documents successfully processed by the query stream.
  const expectedKeyCount = 2; // Expected number of keys for projected documents (e.g., studentName and _id).

  // Attach a 'data' event listener to the Mingo query result stream.
  // This callback executes for each document that passes the filter and projection.
  queryResultStream.on('data', function (processedDocument) {
    // Type III Addition: Validate that the projection is working as expected by checking key count.
    const currentDocKeys = utilityBelt.keys(processedDocument);
    if (currentDocKeys.length !== expectedKeyCount) {
        projectedKeysCorrect = false; // Set flag to false if any document fails the key count check.
        // console.error(`Document with unexpected key count: ${currentDocKeys.length}. Expected ${expectedKeyCount}. Document: ${JSON.stringify(processedDocument)}`);
    }
    documentCount++; // Increment the counter for each document received.
  });

  // Attach an 'end' event listener to the Mingo query result stream.
  // This callback executes once the entire stream has been processed.
  queryResultStream.on('end', function () {
    // Determine the expected count for comparison. Handle cases where streamQueryCursor might not be set.
    const cursorCountForComparison = streamQueryCursor ? streamQueryCursor.count() : 0;

    // Assertion 1: Verify that documents were found and that the stream's count matches the cursor's count.
    streamTestContext.ok(documentCount > 0 && documentCount === cursorCountForComparison,
      `Stream filter processed ${documentCount} matching documents, verifying count against initial cursor.`);
    // Assertion 2: Verify that only the requested keys were projected onto the documents received via the stream.
    streamTestContext.ok(projectedKeysCorrect, "Document projection correctly limited to specified keys via stream.");
    // Type III Addition: A final log indicating stream processing completion.
    // console.log(`Stream processing finished. Total documents matched: ${documentCount}.`);
  });

  // --- Stream Pipelining ---
  // Connect the file stream to our custom JSON parsing transform stream,
  // then pipe the parsed objects from there directly into the Mingo query stream.
  inputFileStream.pipe(JsonChunkProcessor()).pipe(queryResultStream);

});