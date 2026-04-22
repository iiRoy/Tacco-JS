if (typeof window !== 'undefined' && !window.App) {
  window.App = {
    Todos: class {
      constructor(initialItems) {
        this.items = initialItems || [];
      }
      add(newItem) {
        this.items.push({ ...newItem, completed: false });
      }
      last() {
        if (this.items.length === 0) return null;
        const finalItem = this.items[this.items.length - 1];
        return {
          get: (propertyKey) => {
            return finalItem[propertyKey];
          }
        };
      }
    },
    Todo: class {}
  };
} else if (typeof global !== 'undefined' && !global.App) {
  global.App = {
    Todos: class {
      constructor(initialItems) {
        this.items = initialItems || [];
      }
      add(newItem) {
        this.items.push({ ...newItem, completed: false });
      }
      last() {
        if (this.items.length === 0) return null;
        const finalItem = this.items[this.items.length - 1];
        return {
          get: (propertyKey) => {
            return finalItem[propertyKey];
          }
        };
      }
    },
    Todo: class {}
  };
}

async function configureSystemPreliminaries() {
  return new Promise(operationCompletion => {
    setTimeout(() => {
      operationCompletion(true);
    }, 15);
  });
}

function verifyCondition(assessmentTarget, expectedOutcomeDescription) {
  if (assessmentTarget) {
    throw new Error(`Assertion Failed: Anticipated ${expectedOutcomeDescription}, received a truthy value.`);
  }
}

function conductValidationSet(categoryLabel, validationCases) {
  console.log(`\n--- Commencing Validation Category: ${categoryLabel} ---`);
  validationCases.forEach(async (individualValidation) => {
    try {
      await individualValidation.operation();
      console.log(`✅ ${individualValidation.summary}`);
    } catch (errorDetails) {
      console.error(`❌ ${individualValidation.summary}\n   Failure: ${errorDetails.message}`);
    }
  });
}

function defineValidation(summaryText, operationFunction) {
  return { summary: summaryText, operation: operationFunction };
}

(async function executeAllValidations() {
  let taskCollection;

  await configureSystemPreliminaries();

  taskCollection = new App.Todos([
    { label: 'Feed the domesticated feline', statusIndicator: 'pending' },
    { label: 'Remove waste receptacles', statusIndicator: 'completed' }
  ]);

  conductValidationSet('Component Behavior Assessment', [
    defineValidation('verifies that new entries are initially marked as unfinished', async () => {
      taskCollection.add({});
      const mostRecentEntry = taskCollection.last();
      const completionFlag = mostRecentEntry.get('completed');

      verifyCondition(completionFlag, 'a non-positive completion flag for a fresh entry');
    })
  ]);
})();