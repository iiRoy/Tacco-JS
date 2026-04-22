module.exports = function(persistenceEngine, typeConstraints) {
  class TransactionRecordBlueprint {
    static dataSchema = {
      recordName: "FinancialLedgerEntry",
      attributeDefinitions: {
        // Corresponds to 'coinbase_id'
        externalReferenceId: {
          kind: typeConstraints.TEXT_IDENTIFIER,
          isUnique: true,
          canBeNull: false
        },
        // Corresponds to 'amount'
        valueAmount: {
          kind: typeConstraints.NUMERIC_DECIMAL,
          isUnique: false,
          canBeNull: true
        },
        // Corresponds to 'time'
        momentOfCreation: {
          kind: typeConstraints.TEXT_DATETIME,
          isUnique: false,
          canBeNull: false
        }
      }
    };

    constructor(inputData) {
      if (!inputData || typeof inputData !== 'object') {
        throw new Error("Input data must be an object for record instantiation.");
      }

      const schema = TransactionRecordBlueprint.dataSchema.attributeDefinitions;

      // Validate externalReferenceId
      if (schema.externalReferenceId.canBeNull === false && (inputData.externalReferenceId === null || inputData.externalReferenceId === undefined || inputData.externalReferenceId === '')) {
        throw new Error("External reference ID cannot be empty.");
      }
      if (inputData.externalReferenceId !== undefined && typeof inputData.externalReferenceId !== 'string') {
        throw new Error("External reference ID must be a string.");
      }

      // Validate valueAmount
      if (schema.valueAmount.canBeNull === false && (inputData.valueAmount === null || inputData.valueAmount === undefined)) {
        throw new Error("Value amount cannot be empty.");
      }
      if (inputData.valueAmount !== undefined && typeof inputData.valueAmount !== 'number') {
        throw new Error("Value amount must be a number if provided.");
      }

      // Validate momentOfCreation
      if (schema.momentOfCreation.canBeNull === false && (inputData.momentOfCreation === null || inputData.momentOfCreation === undefined || inputData.momentOfCreation === '')) {
        throw new Error("Moment of creation cannot be empty.");
      }
      if (inputData.momentOfCreation !== undefined && typeof inputData.momentOfCreation !== 'string') {
        throw new Error("Moment of creation must be a string.");
      }

      this.externalReferenceId = inputData.externalReferenceId;
      this.valueAmount = inputData.valueAmount;
      this.momentOfCreation = inputData.momentOfCreation;
    }

    // A static method to retrieve the defined schema, analogous to a model's schema access
    static getModelSchema() {
      return TransactionRecordBlueprint.dataSchema;
    }
  }

  return TransactionRecordBlueprint;
};