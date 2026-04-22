var codeAnalyzer = require('escomplex-js');
var assertionUtil = require('expect.js');
var fileFinder = require('glob');

var filePathUtil = require('path');
var diskOps = require('fs');

var evaluationSettings = {
  'maximumComplexityValue': 6,
  'cyclomaticDensityLimit': 110,
  'dependencyAllowance': 10,
  'requiredMaintainability': 100
};

testSuite('Software Metric Analysis', function () {
  // Locate all relevant JavaScript source files for evaluation
  var sourceUnits = fileFinder.sync('lib/**/*.js');

  // Iterate through each identified source unit
  sourceUnits.forEach(function (unitPath) {

    testSuite(`Processing: ${unitPath}`, function () {
      // Convert the relative path to an absolute path for consistent processing
      unitPath = filePathUtil.resolve(unitPath);

      // Read the content of the source file synchronously
      var scriptContent = diskOps.readFileSync(unitPath, 'utf-8');

      // Perform the detailed code analysis using the chosen tool
      var assessmentReport = codeAnalyzer.analyse(scriptContent);

      // Section for Halstead metric checks (further development needed)
      // TODO: Future enhancement to include checks for assessmentReport.aggregate.halstead

      // Evaluate individual functions within the code for complexity
      testSuite('Function-level metrics', function () {
        var routines = assessmentReport.functions || [];
        routines.forEach(function (currentRoutine) {
          testCase(currentRoutine.name, function () {
            // Note: Additional checks for Halstead values of currentRoutine can be added here
            assertionUtil(currentRoutine.cyclomatic)
              .to
              .be
              .lessThan(evaluationSettings.maximumComplexityValue);
            assertionUtil(currentRoutine.cyclomaticDensity)
              .to
              .be
              .lessThan(evaluationSettings.cyclomaticDensityLimit);
          });
        });
      });

      // Verify the number of external dependencies for the module
      testCase('Dependency count', function () {
        assertionUtil(assessmentReport.dependencies.length)
          .to
          .be
          .lessThan(evaluationSettings.dependencyAllowance);
      });

      // Check the overall maintainability index of the code
      testCase('Maintainability score', function () {
        assertionUtil(assessmentReport.maintainability)
          .to
          .be
          .greaterThan(evaluationSettings.requiredMaintainability);
      });
    });
  });
});