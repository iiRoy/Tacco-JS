const perfBench = require('uubench');
const fileIO = require('fs');
const utilLib = require('underscore')._;
const LexicalAnalyzer = require('../src/wordpos');
const lexicalAnalyzer = new LexicalAnalyzer();

const benchmarkRunner = new perfBench.Suite({
  category: 'fixed',
  repetitions: 10,
  synchronous: true,

  onStart: function (testCases) {
    console.log(`Initiating ${testCases.length} analysis routines.`);
  },

  onResult: function (testName, statistics) {
    const perSecond = 1000 / statistics.elapsed;
    const operations = 0.5 + statistics.repetitions * perSecond;

    console.log(
      `  \x1b[90m%s : \x1b[36m%d \x1b[90mops/sec\x1b[0m`,
      testName,
      operations | 0,
      statistics
    );
    partOfSpeechData && console.log(formatOutput(partOfSpeechData));
  },

  onCompletion: function (durationMs) {
    console.log(`Processed ${wordCount} lexical units.`);
    console.log(`Execution finished in ${durationMs} milliseconds.`);
  },

  onSection: function (sectionHeader, statistics) {
    console.log(`\x1b[35m%s\x1b[0m`, sectionHeader);
  },
});

function formatOutput(resultData) {
  return utilLib(resultData)
    .keys()
    .map(function (keyVal) {
      return `${keyVal}:${resultData[keyVal].length}`;
    });
}

let shortText = 'testphrase';
let longText = fileIO.readFileSync('text-512.txt', 'utf8');
let currentText;
let wordCount;
let partOfSpeechData;

function retrievePOS(callbackFn) {
  wordCount = lexicalAnalyzer.getPOS(currentText, function (resultData) {
    partOfSpeechData = resultData;
    callbackFn();
  });
}

function retrieveNouns(callbackFn) {
  lexicalAnalyzer.getNouns(currentText, function (resultData) {
    partOfSpeechData = { nouns: resultData };
    callbackFn();
  });
}

function retrieveVerbs(callbackFn) {
  lexicalAnalyzer.getVerbs(currentText, function (resultData) {
    partOfSpeechData = { verbs: resultData };
    callbackFn();
  });
}

function retrieveAdjectives(callbackFn) {
  lexicalAnalyzer.getAdjectives(currentText, function (resultData) {
    partOfSpeechData = { adjectives: resultData };
    callbackFn();
  });
}

function retrieveAdverbs(callbackFn) {
  lexicalAnalyzer.getAdverbs(currentText, function (resultData) {
    partOfSpeechData = { adverbs: resultData };
    callbackFn();
  });
}

benchmarkRunner.onSection('--Single Word Analysis--', function (callbackFn) {
  currentText = shortText;
  callbackFn();
});

benchmarkRunner.bench('retrievePOS', retrievePOS);
benchmarkRunner.bench('retrieveNouns', retrieveNouns);
benchmarkRunner.bench('retrieveVerbs', retrieveVerbs);
benchmarkRunner.bench('retrieveAdjectives', retrieveAdjectives);
benchmarkRunner.bench('retrieveAdverbs', retrieveAdverbs);

benchmarkRunner.onSection('--Extended Text Analysis--', function (callbackFn) {
  benchmarkRunner.settings.repetitions = 1;
  currentText = longText;
  callbackFn();
});

benchmarkRunner.bench('retrievePOS', retrievePOS);
benchmarkRunner.bench('retrieveNouns', retrieveNouns);
benchmarkRunner.bench('retrieveVerbs', retrieveVerbs);
benchmarkRunner.bench('retrieveAdjectives', retrieveAdjectives);
benchmarkRunner.bench('retrieveAdverbs', retrieveAdverbs);

benchmarkRunner.run();