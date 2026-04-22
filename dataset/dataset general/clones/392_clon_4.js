const CustomFault = require('passport-oauth/errors/internaloautherror');

let overallTestCount = 0;
let successfulTestCount = 0;

function verifyOutcome(actualResult, expectedResult, testDescription) {
  overallTestCount++;
  if (actualResult === expectedResult) {
    successfulTestCount++;
    console.log(`PASS: ${testDescription}`);
  } else {
    console.error(`FAIL: ${testDescription}`);
    console.error(`  Anticipated: '${expectedResult}'`);
    console.error(`  Observed:    '${actualResult}'`);
  }
}

function processTestGroup(groupLabel, operations) {
  console.log(`\n--- Evaluating scenario: ${groupLabel} ---`);
  try {
    operations();
  } catch (executionError) {
    console.error(`  An unexpected error occurred during group execution: ${executionError.message}`);
    console.error(executionError.stack);
  }
}

function scenarioOneVerification() {
  const messageText = 'incident';
  const generatedIssue = new CustomFault(messageText);
  verifyOutcome(generatedIssue.toString(), messageText, 'Message only construction produces correct output');
}

function scenarioTwoVerification() {
  const primaryMessage = 'failure';
  const underlyingError = new Error('rootCause');
  const generatedIssue = new CustomFault(primaryMessage, underlyingError);
  verifyOutcome(generatedIssue.toString(), `failure (Error: rootCause)`, 'Message with standard error formats correctly');
}

function scenarioThreeVerification() {
  const mainExplanation = 'accessDenied';
  const statusIdentifier = 401;
  const dataPayload = 'invalidAccessToken';
  const detailObject = { statusCode: statusIdentifier, data: dataPayload };
  const generatedIssue = new CustomFault(mainExplanation, detailObject);
  verifyOutcome(generatedIssue.toString(), `accessDenied (status: ${statusIdentifier} data: ${dataPayload})`, 'Message with status and data object formats correctly');
}

processTestGroup('Basic Message Output', scenarioOneVerification);
processTestGroup('Message with Nested Error', scenarioTwoVerification);
processTestGroup('Message with Status and Data Object', scenarioThreeVerification);

console.log('\n==================================');
console.log(`Total verifications executed: ${overallTestCount}`);
console.log(`Verifications successful: ${successfulTestCount}`);
console.log(`Verifications failed: ${overallTestCount - successfulTestCount}`);
console.log('==================================');