(function() {
  const SpecRunner = {};

  // Internal helper to recursively collect and apply functions up the ancestor chain
  const traverseAndExecute = (nodeUnit, propName, state) => {
    if (nodeUnit && nodeUnit.ancestor) {
      traverseAndExecute(nodeUnit.ancestor, propName, state);
    }
    if (nodeUnit && nodeUnit[propName]) {
      nodeUnit[propName].forEach(func => func.call(state));
    }
  };

  // Asserter for value comparisons (replaces CSSpec.Matchers)
  const createAsserter = (actualValue) => ({
    toVerifyEquality: function(expectedValue) {
      if (!(actualValue == expectedValue)) {
        throw new Error(`Assertion Failed: Anticipated '${expectedValue}', but observed '${actualValue}'`);
      }
    }
  });

  // Action Unit (replaces CSSpec.Example)
  const createActionUnit = (unitLabel, unitAncestor, unitAction) => {
    const actionUnit = {
      type: 'action',
      label: unitLabel,
      ancestor: unitAncestor,
      action: unitAction,
      retrieveFullPath: function() {
        const pathSegments = this.ancestor ? this.ancestor.retrieveFullPath() : [];
        pathSegments.push(this.label);
        return pathSegments;
      },
      execute: function() {
        const executionState = {
          currentAction: this
        };
        if (this.ancestor) {
          traverseAndExecute(this.ancestor, 'preExecutionHooks', executionState);
        }
        console.log(`Performing step: ${this.retrieveFullPath().join(" ")}`);
        this.action.call(executionState);
        if (this.ancestor) {
          traverseAndExecute(this.ancestor, 'postExecutionHooks', executionState);
        }
      }
    };
    if (unitAncestor) {
      unitAncestor.containedUnits.push(actionUnit);
    }
    return actionUnit;
  };

  // Collection Unit (replaces CSSpec.ExampleGroup)
  const createCollectionUnit = (unitLabel, unitAncestor) => {
    const collectionUnit = {
      type: 'collection',
      label: unitLabel,
      ancestor: unitAncestor,
      containedUnits: [],
      preExecutionHooks: [],
      postExecutionHooks: [],
      retrieveFullPath: function() {
        const pathSegments = this.ancestor ? this.ancestor.retrieveFullPath() : [];
        pathSegments.push(this.label);
        return pathSegments;
      },
      execute: function() {
        this.containedUnits.forEach(childUnit => {
          childUnit.execute();
        });
        if (!this.ancestor) {
          console.log("All execution paths completed without issues.");
        }
      }
    };
    if (unitAncestor) {
      unitAncestor.containedUnits.push(collectionUnit);
    }
    return collectionUnit;
  };

  // Definition Context (replaces CSSpec.Scope)
  const createDefinitionContext = (initialLabel) => {
    let activeCollection = createCollectionUnit(initialLabel, null);
    const collectionContextStack = [activeCollection];

    return {
      createNestedCollection: function(collectionLabel, definitionFunction) {
        const newCollection = createCollectionUnit(collectionLabel, activeCollection);
        activeCollection = newCollection;
        collectionContextStack.push(newCollection);

        if (definitionFunction) {
          definitionFunction.call(newCollection);
        }

        collectionContextStack.pop();
        activeCollection = collectionContextStack[collectionContextStack.length - 1];
        return newCollection;
      },

      createAction: function(actionLabel, actionFunction) {
        return createActionUnit(actionLabel, activeCollection, actionFunction);
      },

      verifyThat: function(valueToVerify) {
        return createAsserter(valueToVerify);
      },

      addPreHook: function(hookFunction) {
        activeCollection.preExecutionHooks.push(hookFunction);
      },

      addPostHook: function(hookFunction) {
        activeCollection.postExecutionHooks.push(hookFunction);
      },

      initiateExecution: function() {
        let rootCollection = collectionContextStack[0];
        while (rootCollection.ancestor) { // Ensure we execute from the absolute root
            rootCollection = rootCollection.ancestor;
        }
        rootCollection.execute();
      }
    };
  };

  // Global entry point (replaces CSSpec.describe)
  SpecRunner.establishRoot = function(rootLabel) {
    return createDefinitionContext(rootLabel);
  };

  window.SpecRunner = SpecRunner;
})();