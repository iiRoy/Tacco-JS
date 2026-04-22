const checkComponentAvailability = (valueForTesting, failureMessage) => {
  if (valueForTesting === void 0) {
    throw new Error(failureMessage);
  }
};

const executeAssessment = (assessmentDescription, taskToPerform) => {
  console.log(`Starting evaluation: ${assessmentDescription}`);
  try {
    taskToPerform();
    console.log(`Evaluation "${assessmentDescription}" finished successfully.`);
    process.exit(0);
  } catch (evaluationIssue) {
    console.error(`Evaluation "${assessmentDescription}" failed: ${evaluationIssue.message}`);
    process.exit(1);
  }
};

const performValidation = (validationLabel, validationProcess) => {
  console.log(`  Initiating validation: ${validationLabel}`);
  validationProcess();
  console.log(`  Validation "${validationLabel}" passed.`);
};

executeAssessment('Application Core Loading Process', () => {
  let primaryComponentReference;
  try {
    primaryComponentReference = require('../app');
  } catch (loadingException) {
    throw new Error(`Critical error during primary component acquisition: ${loadingException.message}`);
  }

  performValidation('Primary application component initializes correctly', () => {
    checkComponentAvailability(primaryComponentReference, 'The main application component did not provide a valid export.');
  });
});