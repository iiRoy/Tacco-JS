/*
 * This file contains various unit tests for the Mingo database query library,
 * specifically focusing on collection operations and stream processing.
 * It uses 'tape' for testing, 'fs' for file system access,
 * 'underscore' for utility functions, and 'backbone' for collection integration.
 */

var test = require('tape'), /* Main testing framework */
    fs = require('fs'), /* File system module */
    _ = require('underscore'), /* Utility library */
    JSON = require('JSON'), /* JSON parsing utility */
    Backbone = require('backbone'), /* Model-view-controller framework */
    Mingo = require('../mingo'); /* The Mingo library itself */


// Load sample data from JSON files.
var gradesSimple = JSON.parse(fs.readFileSync(__dirname + '/data/grades_simple.json'));
var gradesComplex = JSON.parse(fs.readFileSync(__dirname + '/data/grades_complex.json'));

// Define a Mingo-enhanced Backbone Collection.
var MingoCollection =  Backbone.Collection.extend(Mingo.CollectionMixin);

test ( 'Collections' , function  ( t ) { /*  Start of the main 'Collections' test suite.  */

  t.test ( "Cursor operations" , function ( t ) {
    t.plan(5); // Expecting 5 assertions in this test.

    // create a query with no criteria, this will match all documents
    var query = new Mingo.Query();
    var cursor = query.find(gradesSimple); // Apply the query to simple grades data.
    t.ok(cursor.hasNext(), "can peek for an item with hasNext()"); /* Checks if there's a next item */
    t.ok(cursor.next(), "can select next item with next()"); // Retrieves the next item.
    t.ok(_.isObject(cursor.first()), "can retrieve first item with first()"); /* Gets the first item from the cursor's result set */
    t.ok(_.isObject(cursor.last()), "can retrieve last item with last()"); // Fetches the last item.
    t.ok(cursor.count() === 800, "can count items with count()"); // Verifies the total count.
  } );

  t.test("Backbone integration" , function (t) {
    t.plan ( 1 ); /* Only one assertion expected here. */
    var grades = new MingoCollection(gradesSimple);
    // This query finds students with grades less than 50 in either homework or quiz categories.
    // The results are then sorted by score in ascending order.
    var cursor = grades.query({
      $or: [
        {type: "quiz", score: {$lt: 50}}, /* Quiz scores less than 50 */
        {type: "homework", score: {$lt: 50}} /* Homework scores less than 50 */
      ]
    }, {student_id: 1}).sort({score: 1}); // Projection for student_id and sorting by score.

    t.ok(cursor.count() < 800, "can query Backbone collection"); // Assert that the filtered count is less than the total.
  } );

  t.test ( "Match $all with $elemMatch on nested elements" , function ( t ) {
    t.plan(1); /* Planning for a single assertion. */

    var data = [ // Sample data for nested document matching.
      {
        user: { username: 'User1', projects: [
          { name: "Project 1", rating: { complexity: 6 }},
          { name: "Project 2", rating: { complexity: 2 }}
        ] }
      },
      {
        user: { username: 'User2', projects: [
          { name: "Project 1", rating: { complexity: 6 }},
          { name: "Project 2", rating: { complexity: 8 }}
        ] }
      }
    ];
    var criteria = { // Defines the matching criteria.
      'user.projects': {
        "$all": [ // Matches if all specified elements are present.
          {
            "$elemMatch": { // Matches elements within an array based on conditions.
              'rating.complexity': { '$gt': 6 } // Complexity greater than 6.
            }
          }
        ]
      }
    };
    /* It should return exactly one user object that satisfies the criteria. */
    var result = Mingo.find(data, criteria).count(); // Execute the query and get the count.
    t.ok(result === 1, "can match using $all with $elemMatch on nested elements"); // Assert the count is 1.

  } );
} );


test ( "JSON Stream filtering" , function ( t ) {
  t.plan(2); // Expecting two assertions.

  var fs = require('fs'), // Re-import fs, though already declared globally.
    Transform = require('stream').Transform, // Node.js stream transform class.
    util = require('util'), // Node.js utility module.
    Mingo = require('../mingo'); // Re-import Mingo, also already declared.

  /*
   * Custom Transform stream to parse JSON chunks and push individual objects.
   * This effectively converts a stream of JSON arrays/objects into a stream of individual JS objects.
   */
  var JSONStream = function () {
    if (!(this instanceof JSONStream)) /* Ensure 'new' keyword is used */
      return new JSONStream();
    Transform.call(this, {objectMode: true}); // Call parent constructor.
  };
  util.inherits(JSONStream, Transform); // Inherit from Transform stream.
  JSONStream.prototype._transform = function (chunk, enc, done) {
    var self = this; // Capture 'this' context.
    chunk = JSON.parse(chunk); // Parse the incoming JSON chunk.
    _.each(chunk, function (obj) {
      self.push(obj); // Push each object from the parsed chunk.
    });
    done(); // Signal that processing of the chunk is complete.
  };

  var found2Keys = true; // Flag to check projection.
  var cursor; // Cursor variable, will be assigned later.
  var query = new Mingo.Query({ // Define the query criteria.
    scores: { $elemMatch: {type: "exam", score: {$gt: 90}} } // Find exams with score > 90.
  }, {name: 1}); // Project only the 'name' field.

  var file = fs.createReadStream(__dirname + '/data/students.json'); // Create a readable stream from the students JSON file.
  file.on('data', function (data) {
    cursor = query.find(JSON.parse(data)); // Process data chunks, updating the cursor.
  });

  var qs = query.stream(); // Create a Mingo query stream.
  var count = 0; // Initialize a counter for stream data.
  qs.on('data', function (data) {
    // Check if the projected data only contains the expected 2 keys (name and _id).
    found2Keys = _.keys(data).length == 2 && found2Keys;
    count++; // Increment the counter for each item processed by the stream.
  });

  qs.on('end', function () {
    t.ok(count > 0 && count === cursor.count(), "Filtered only matching documents via stream"); // Verify stream count matches cursor count.
    t.ok(found2Keys, "Projected only requested keys via stream"); // Verify projection.
  });

  // Pipe the file stream through the custom JSONStream, then into the Mingo query stream.
  file.pipe(JSONStream()).pipe(qs);

} );