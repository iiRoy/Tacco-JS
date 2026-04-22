const acquireModule = global.require;
const fileSystemInterface = acquireModule('fs');

const rawStreamContent = fileSystemInterface.readFileSync(0, 'utf8');
const processedDataParts = rawStreamContent.trim().split(/\s+/);

const numericIdentifier = parseInt(processedDataParts[0], 10);

const classificationRules = [
  { thresholdExcl: 1200, designation: 'ABC' },
  { thresholdExcl: 2800, designation: 'ARC' }
];

let assignedCategory = 'AGC'; // Default outcome

for (let i = 0; i < classificationRules.length; i++) {
  const currentRule = classificationRules[i];
  if (numericIdentifier < currentRule.thresholdExcl) {
    assignedCategory = currentRule.designation;
    break;
  }
}

global.process.stdout.write(assignedCategory + '\n');