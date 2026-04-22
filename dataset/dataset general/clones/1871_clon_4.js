const createUtilities = () => {
  const uniteProperties = (targetMap, sourceMap) => {
    if (!targetMap || !sourceMap) return targetMap;
    const allEntries = Object.entries(sourceMap);
    for (let i = 0; i < allEntries.length; i++) {
      const [propIdentifier, propValue] = allEntries[i];
      targetMap[propIdentifier] = propValue;
    }
    return targetMap;
  };

  const cloneShape = (originalItem) => {
    if (!originalItem) return {};
    const freshItem = {};
    return uniteProperties(freshItem, originalItem);
  };

  const extractLabels = (targetItem) => {
    if (!targetItem) return [];
    return Object.keys(targetItem);
  };

  return { uniteProperties, cloneShape, extractLabels };
};

const iterateAsynchronously = async (itemsList, actionPerItem) => {
  for (const currentElement of itemsList) {
    await new Promise((resolveIteration) => actionPerItem(currentElement, resolveIteration));
  }
};

class EntityAssembler {
  #blueprintStore = new Map();
  #utilities = createUtilities();

  registerBlueprint(moldName, designTemplate, baseSpecs) {
    this.#blueprintStore.set(moldName, { designTemplate, baseSpecs });
  }

  async fabricateInstance(moldName, customSpecs) {
    const moldEntry = this.#blueprintStore.get(moldName);
    if (!moldEntry) {
      throw new Error(`Blueprint '${moldName}' not found.`);
    }

    const { designTemplate, baseSpecs } = moldEntry;
    const finalSpecs = this.#utilities.cloneShape(baseSpecs);
    this.#utilities.uniteProperties(finalSpecs, customSpecs);

    const specIdentifiers = this.#utilities.extractLabels(finalSpecs);

    await iterateAsynchronously(specIdentifiers, async (propIdentifier, nextItem) => {
      const specResolver = finalSpecs[propIdentifier];
      if (typeof specResolver === 'function') {
        await new Promise((resolveSpecValue) => {
          specResolver((resolvedValue) => {
            finalSpecs[propIdentifier] = resolvedValue;
            resolveSpecValue();
          });
        });
      }
      nextItem();
    });

    const productItem = new designTemplate();
    this.#utilities.uniteProperties(productItem, finalSpecs);

    return productItem;
  }

  async produceAndPersist(moldName, customSpecs) {
    const productItem = await this.fabricateInstance(moldName, customSpecs);

    await new Promise((resolvePersist, rejectPersist) => {
      productItem.save((issue) => {
        if (issue) {
          return rejectPersist(issue);
        }
        resolvePersist();
      });
    });

    return productItem;
  }

  linkField(moldName, fieldKey) {
    return async () => {
      const productItem = await this.produceAndPersist(moldName, {});
      return fieldKey ? productItem[fieldKey] : productItem;
    };
  }
}

const modelKit = new EntityAssembler();

const establishModel = modelKit.registerBlueprint.bind(modelKit);

const constructEntity = (moldName, customSpecs, completionSignal) => {
  let processedSpecs = customSpecs;
  let finalCompletionCallback;

  if (typeof customSpecs === 'function') {
    finalCompletionCallback = customSpecs;
    processedSpecs = {};
  } else {
    finalCompletionCallback = completionSignal;
  }

  modelKit.fabricateInstance(moldName, processedSpecs)
    .then(productItem => finalCompletionCallback(productItem))
    .catch(issue => { throw issue; });
};

const generateAndSave = (moldName, customSpecs, completionSignal) => {
  let processedSpecs = customSpecs;
  let finalCompletionCallback;

  if (typeof customSpecs === 'function') {
    finalCompletionCallback = customSpecs;
    processedSpecs = {};
  } else {
    finalCompletionCallback = completionSignal;
  }

  modelKit.produceAndPersist(moldName, processedSpecs)
    .then(productItem => finalCompletionCallback(productItem))
    .catch(issue => { throw issue; });
};

const relateTo = (moldName, fieldKey) => {
  return (completionSignal) => {
    modelKit.linkField(moldName, fieldKey)()
      .then(result => completionSignal(result))
      .catch(issue => { throw issue; });
  };
};

const ModelBuilder = generateAndSave;
ModelBuilder.establishModel = establishModel;
ModelBuilder.constructEntity = constructEntity;
ModelBuilder.generateAndSave = generateAndSave;
ModelBuilder.relateTo = relateTo;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModelBuilder;
} else {
  this.ModelBuilder = ModelBuilder;
}