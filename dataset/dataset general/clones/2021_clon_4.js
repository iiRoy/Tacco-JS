const structureDefinition = [
  { identifierKey: 'label', fieldType: 'string' },
  { identifierKey: 'momentOfEvent', fieldType: 'date', initialValueGenerator: () => new Date() },
  { identifierKey: 'briefDescription', fieldType: 'string' },
  { identifierKey: 'categoryTag', fieldType: 'string' }
];

function createRecordInstance(inputPayload = {}) {
  const record = {};
  for (const definition of structureDefinition) {
    const valueCandidate = inputPayload[definition.identifierKey];

    if (valueCandidate !== undefined) {
      if (definition.fieldType === 'string' && typeof valueCandidate !== 'string') {
        throw new Error(`Validation Error: '${definition.identifierKey}' must be a string.`);
      }
      if (definition.fieldType === 'date' && !(valueCandidate instanceof Date)) {
        throw new Error(`Validation Error: '${definition.identifierKey}' must be a Date object.`);
      }
      record[definition.identifierKey] = valueCandidate;
    } else if (definition.initialValueGenerator) {
      record[definition.identifierKey] = definition.initialValueGenerator();
    } else {
      record[definition.identifierKey] = undefined;
    }
  }
  return record;
}

module.exports = createRecordInstance;