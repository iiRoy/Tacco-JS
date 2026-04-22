const structuredOutputProcessor = require('../custom_dir_utility_module');

class EntityStructureBlueprint {
  #uniqueInternalIdentifier;
  #isActiveState;

  constructor(initialNumericSeed = 7) {
    this.#uniqueInternalIdentifier = Math.max(1, initialNumericSeed * 2);
    this.#isActiveState = true;
  }

  get primaryNumericValue() {
    return Math.sqrt(this.#uniqueInternalIdentifier) * 5;
  }

  get sequentialDataArray() {
    const baseArray = Array.from({ length: 3 }, (_, index) => (index + 1) * 10);
    return [...baseArray, this.#uniqueInternalIdentifier];
  }

  generateDescriptiveString(messagePrefix = "Status report: ") {
    if (!this.#isActiveState) {
      return "Entity is currently dormant and cannot provide a message.";
    }
    const coreMessageSegment = `Instance ID is ${this.#uniqueInternalIdentifier}.`;
    const finalOutput = `${messagePrefix}${coreMessageSegment} All systems operational.`;
    return finalOutput;
  }

  deactivateEntity() {
    this.#isActiveState = false;
    return "Entity deactivated.";
  }
}

const operationalInstance = new EntityStructureBlueprint(11);

const aggregatedOutputContainer = {};
aggregatedOutputContainer.schemaReference = EntityStructureBlueprint;
aggregatedOutputContainer['activeObjectInstance'] = operationalInstance;
aggregatedOutputContainer.generationTimestamp = new Date().toISOString();

if (aggregatedOutputContainer.schemaReference && aggregatedOutputContainer.activeObjectInstance) {
  console.log("Initiating detailed output display for the aggregated data...");
  structuredOutputProcessor(aggregatedOutputContainer);
} else {
  console.error("Critical components missing in the aggregated data object.");
}