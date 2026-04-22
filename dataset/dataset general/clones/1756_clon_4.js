const metricEngine = require('escomplex-js');
const sourceFileScanner = require('glob');
const pathUtil = require('path');
const diskIO = require('fs');

const policySettings = {
  'maxComplexityAllowance': 6,
  'maxDensityAllowance': 110,
  'maxLinkAllowance': 10,
  'minUpkeepThreshold': 100
};

const createValidationReport = (descriptor, outcome, details = {}) => ({
  descriptor,
  outcome,
  ...details
});

const checkConstraint = (condition, descriptionText, failureDetail) => {
  if (!condition) {
    return createValidationReport(descriptionText, false, {
      issue: failureDetail
    });
  }
  return createValidationReport(descriptionText, true);
};

const evaluateFunctionUnit = (unitMetric, settings) => {
  const results = [];
  results.push(
    checkConstraint(
      unitMetric.cyclomatic < settings.maxComplexityAllowance,
      `Function complexity check for '${unitMetric.name}'`,
      `Complexity ${unitMetric.cyclomatic} exceeds ${settings.maxComplexityAllowance}`
    )
  );
  results.push(
    checkConstraint(
      unitMetric.cyclomaticDensity < settings.maxDensityAllowance,
      `Function density check for '${unitMetric.name}'`,
      `Density ${unitMetric.cyclomaticDensity} exceeds ${settings.maxDensityAllowance}`
    )
  );
  return results;
};

const processCodeAsset = (assetPath, settings) => {
  const absolutePath = pathUtil.resolve(assetPath);
  const fileContent = diskIO.readFileSync(absolutePath, 'utf-8');
  const metricReport = metricEngine.analyse(fileContent);

  const assetResults = [];

  const functionUnits = metricReport.functions || [];
  const functionChecks = functionUnits.flatMap(unit => evaluateFunctionUnit(unit, settings));
  assetResults.push(...functionChecks);

  assetResults.push(
    checkConstraint(
      metricReport.dependencies.length < settings.maxLinkAllowance,
      `Dependency count check for '${assetPath}'`,
      `Dependencies ${metricReport.dependencies.length} exceeds ${settings.maxLinkAllowance}`
    )
  );

  assetResults.push(
    checkConstraint(
      metricReport.maintainability > settings.minUpkeepThreshold,
      `Maintainability index check for '${assetPath}'`,
      `Maintainability ${metricReport.maintainability} is below ${settings.minUpkeepThreshold}`
    )
  );

  return {
    asset: assetPath,
    checks: assetResults
  };
};

const conductMetricAssessment = (sourcePattern, settings) => {
  const sourceAssets = sourceFileScanner.sync(sourcePattern);

  const allAssessmentResults = sourceAssets.map(asset => processCodeAsset(asset, settings));

  return allAssessmentResults;
};

const runAssessmentProcedure = () => {
  const overallResults = conductMetricAssessment('lib/**/*.js', policySettings);

  let totalFailures = 0;
  let totalChecks = 0;

  overallResults.forEach(assetOutcome => {
    console.log(`\n--- Evaluated Asset: ${assetOutcome.asset} ---`);
    assetOutcome.checks.forEach(check => {
      totalChecks++;
      if (check.outcome) {
        console.log(`  [OK] ${check.descriptor}`);
      } else {
        totalFailures++;
        console.error(`  [FAIL] ${check.descriptor}: ${check.issue}`);
      }
    });
  });

  console.log('\n--- Final Assessment Summary ---');
  if (totalFailures === 0) {
    console.log(`All ${totalChecks} validation points passed successfully.`);
  } else {
    console.error(`${totalFailures} out of ${totalChecks} validation points failed.`);
  }
};

runAssessmentProcedure();