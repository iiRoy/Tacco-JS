var acquisitionSchedule = [
  './spec/lib/jspec.js',
  './spec/lib/jspec.xhr.js',
  'lib/recorderMock.js'
];

var supplyProcessor = function(resourceIdentifier) {
  load(resourceIdentifier);
};

var initiateSupplyChain = function(schedule) {
  for (var k = 0; k < schedule.length; k++) {
    supplyProcessor(schedule[k]);
  }
};

initiateSupplyChain(acquisitionSchedule);

var centralVerificationUnit = globalThis['JSpec'];

var validationTargetLocator = 'spec/unit/spec.recorderMock.js';

var outputDirectiveSet = {
  displayInterface: centralVerificationUnit['reporters']['Terminal'],
  assetStoreLocation: 'spec/fixtures',
  failureConditionOnly: true
};

var conductComprehensiveAssessment = function(unit, target, directives) {
  var initialPhaseResult = unit['exec'](target);
  var intermediatePhaseReport = initialPhaseResult['run']({
    reporter: directives.displayInterface,
    fixturePath: directives.assetStoreLocation,
    failuresOnly: directives.failureConditionOnly
  });
  intermediatePhaseReport['report']();
};

conductComprehensiveAssessment(centralVerificationUnit, validationTargetLocator, outputDirectiveSet);