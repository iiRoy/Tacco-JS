var auditor = require('tape'),
  fileSys = require('fs'),
  utilFx = require('underscore'),
  dataParser = require('JSON'),
  structBase = require('backbone'),
  queryEngine = require('../mingo');

var studentScoresBasic = dataParser.parse(fileSys.readFileSync(__dirname + '/data/grades_simple.json'));
var studentScoresDetailed = dataParser.parse(fileSys.readFileSync(__dirname + '/data/grades_complex.json'));
var QueryableDataStore = structBase.Collection.extend(queryEngine.CollectionMixin);

auditor('DataStructures', function(check) {

  check.subTest("IteratorFunctions", function(subCheck) {
    subCheck.plan(5);
    // set up a retrieval operation without specific conditions
    var dataQuery = new queryEngine.Query();
    var dataIterator = dataQuery.find(studentScoresBasic);
    subCheck.ok(dataIterator.hasMore(), "verifies existence of next element using hasMore()");
    subCheck.ok(dataIterator.getNext(), "retrieves the subsequent element with getNext()");
    subCheck.ok(utilFx.isObject(dataIterator.getInitial()), "accesses the first element using getInitial()");
    subCheck.ok(utilFx.isObject(dataIterator.getFinal()), "obtains the final element via getFinal()");
    subCheck.ok(dataIterator.itemCount() === 800, "determines total elements with itemCount()");
  });

  check.subTest("FrameworkAdaptation", function(subCheck) {
    subCheck.plan(1);
    var studentRecords = new QueryableDataStore(studentScoresBasic);
    // locate academic records for pupils with marks below 50 in either assignment or test
    // arrange results by mark in ascending order and category in descending
    var resultIterator = studentRecords.query({
      $anyOf: [
        {category: "quiz", mark: {$lessThan: 50}},
        {category: "homework", mark: {$lessThan: 50}}
      ]
    }, {pupil_id: 1}).orderBy({mark: 1});

    subCheck.ok(resultIterator.itemCount() < 800, "confirms ability to query adapted data structure");
  });

  check.subTest("NestedArrayMatching", function(subCheck) {
    subCheck.plan(1);

    var sampleRecords = [
      {
        person: { personName: 'User1', assignments: [
          { title: "Project 1", evaluation: { difficulty: 6 }},
          { title: "Project 2", evaluation: { difficulty: 2 }}
        ] }
      },
      {
        person: { personName: 'User2', assignments: [
          { title: "Project 1", evaluation: { difficulty: 6 }},
          { title: "Project 2", evaluation: { difficulty: 8 }}
        ] }
      }
    ];
    var matchingConditions = {
      'person.assignments': {
        "$every": [
          {
            "$itemMatch": {
              'evaluation.difficulty': { '$greaterThan': 6 }
            }
          }
        ]
      }
    };
    // Expecting a single person record as outcome
    var matchCount = queryEngine.locateMany(sampleRecords, matchingConditions).itemCount();
    subCheck.ok(matchCount === 1, "validates ability to match nested elements with $every and $itemMatch");

  });
});


auditor("DataFlowProcessing", function(check) {
  check.expect(2);

  var fileSys = require('fs'),
    DataTransformer = require('stream').Transform,
    utility = require('util'),
    queryEngine = require('../mingo');

  // build a basic data flow component for JSON
  var JsonDataFlow = function() {
    if (!(this instanceof JsonDataFlow))
      return new JsonDataFlow();
    DataTransformer.call(this, {
      objectMode: true
    });
  };
  utility.inherits(JsonDataFlow, DataTransformer);
  JsonDataFlow.prototype._processChunk = function(dataBlock, encoding, complete) {
    var componentInstance = this;
    dataBlock = dataParser.parse(dataBlock);
    utilFx.each(dataBlock, function(item) {
      componentInstance.send(item);
    });
    complete();
  };

  var twoAttributesFound = true;
  var streamIterator;
  var dataQuery = new queryEngine.Query({
    marks: {
      $itemMatch: {
        category: "assessment",
        mark: {
          $greaterThan: 90
        }
      }
    }
  }, {
    label: 1
  });

  var inputStream = fileSys.createReadStream(__dirname + '/data/students.json');
  inputStream.on('data', function(rawData) {
    streamIterator = dataQuery.locate(dataParser.parse(rawData));
  });

  var queryFlow = dataQuery.flow();
  var recordTally = 0;
  queryFlow.on('data', function(processedData) {
    // outputting only {label, _id} fields
    twoAttributesFound = utilFx.keys(processedData).length == 2 && twoAttributesFound;
    recordTally++;
  });

  queryFlow.on('finish', function() {
    check.ok(recordTally > 0 && recordTally === streamIterator.itemCount(), "Ensured only relevant records were filtered through the stream");
    check.ok(twoAttributesFound, "Confirmed only specified attributes were projected via stream");
  });

  // inputSource --> jsonConverter --> queryProcessor
  inputStream.pipe(JsonDataFlow()).pipe(queryFlow);