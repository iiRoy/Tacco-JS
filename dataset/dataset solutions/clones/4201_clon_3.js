const acquireInputData = () => {
  try {
    const fileContent = require("fs").readFileSync(0, "utf8");
    if (typeof fileContent !== 'string') {
        throw new Error("Input data retrieved was not a string.");
    }
    return fileContent.trim();
  } catch (readError) {
    logDiagnosticError(`Input acquisition failed: ${readError.message}`);
    return "";
  }
};

const displayResult = (messageContent) => {
  console.log(String(messageContent));
};

const logDiagnosticError = (issueMessage) => {
  console.error(`DIAGNOSTIC: ${issueMessage}`);
};

const inputConversionStrategies = {
  'identity': (inputString) => inputString,
  'integer': (inputString) => Number.parseInt(inputString, 10),
  'space_split': (inputString) => inputString.split(" "),
  'newline_split': (inputString) => inputString.split("\n"),
  'space_split_to_numbers': (inputString) => inputString.split(" ").map(val => Number(val)),
  'newline_split_to_numbers': (inputString) => inputString.split("\n").map(val => Number(val)),
  'character_array': (inputString) => inputString.split(""),
  'character_array_to_numbers': (inputString) => inputString.split("").map(val => Number(val))
};

const applyInputTransformation = (sourceText, conversionKey) => {
  const processor = inputConversionStrategies[conversionKey];
  if (processor) {
    return processor(sourceText);
  }
  logDiagnosticError(`Unknown transformation key: ${conversionKey}. Returning original text.`);
  return sourceText;
};

function processSequenceValidation(rawInputText) {
  const MAX_PERMITTED_LENGTH = 9;
  const TARGET_IDENTIFIERS = ['K', 'I', 'H', 'B', 'R'];
  const INVALID_OUTCOME = "NO";
  const VALID_OUTCOME = "YES";

  const characterArray = applyInputTransformation(rawInputText, 'character_array');

  if (!Array.isArray(characterArray) || characterArray.length === 0) {
    logDiagnosticError("Input character array is empty or malformed.");
    displayResult(INVALID_OUTCOME);
    return;
  }

  if (characterArray.length > MAX_PERMITTED_LENGTH) {
    displayResult(INVALID_OUTCOME);
    return;
  }

  const identifierPositions = {};
  for (const identifier of TARGET_IDENTIFIERS) {
    identifierPositions[identifier] = characterArray.indexOf(identifier);
  }

  const missingIdentifier = TARGET_IDENTIFIERS.some(
    (keyChar) => identifierPositions[keyChar] === -1
  );

  if (missingIdentifier) {
    displayResult(INVALID_OUTCOME);
    return;
  }

  const kPosition = identifierPositions['K'];
  const iPosition = identifierPositions['I'];
  const hPosition = identifierPositions['H'];
  const bPosition = identifierPositions['B'];
  const rPosition = identifierPositions['R'];

  if (kPosition !== iPosition - 1) { // K must precede I immediately.
    displayResult(INVALID_OUTCOME);
    return;
  }

  if (hPosition < iPosition) { // H must not appear before I.
    displayResult(INVALID_OUTCOME);
    return;
  }

  const hToBDifference = bPosition - hPosition;
  if (hToBDifference <= 0 || hToBDifference > 2) { // H must precede B, with at most one character in between.
    displayResult(INVALID_OUTCOME);
    return;
  }

  const bToRDifference = rPosition - bPosition;
  if (bToRDifference <= 0 || bToRDifference > 2) { // B must precede R, with at most one character in between.
    displayResult(INVALID_OUTCOME);
    return;
  }

  let headA_Count = 0;
  for (let index = 0; index < characterArray.length; index++) {
    if (characterArray[index] === 'A') {
      headA_Count++;
    } else {
      break;
    }
  }

  if (headA_Count > 1) {
    displayResult(INVALID_OUTCOME);
    return;
  }

  let tailA_Count = 0;
  for (let index = characterArray.length - 1; index >= 0; index--) {
    if (characterArray[index] === 'A') {
      tailA_Count++;
    } else {
      break;
    }
  }

  if (tailA_Count > 1) {
    displayResult(INVALID_OUTCOME);
    return;
  }

  displayResult(VALID_OUTCOME);
}

try {
  const initialData = acquireInputData();
  processSequenceValidation(initialData);
} catch (executionError) {
  logDiagnosticError(`An unexpected error occurred during execution: ${executionError.message}`);
  displayResult("RUNTIME_FAILURE");
}