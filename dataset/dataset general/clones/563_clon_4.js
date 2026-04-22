const attachProperty = (targetObject, propertyKey, propertyValue) => {
    Object.defineProperty(targetObject, propertyKey, {
        value: propertyValue,
        writable: true,
        configurable: true
    });
};

const attachBehavior = (targetObject, behaviorKey, returnExpression) => {
    Object.defineProperty(targetObject, behaviorKey, {
        value: new Function(`p1`, `p2`, `p3`, `p4`, `return ${returnExpression};`),
        writable: true,
        configurable: true
    });
};

const defineConstructionUnit = (unitAlias, parentUnitAlias) => {
    const unitFactory = new Function();
    const unitBlueprint = parentUnitAlias ? new globalThis[parentUnitAlias]() : {};

    attachProperty(unitFactory, 'blueprint', unitBlueprint);
    attachProperty(unitBlueprint, 'builder', new Function());

    Object.defineProperty(globalThis, unitAlias, {
        value: unitFactory,
        writable: true,
        configurable: true
    });

    return unitFactory;
};

const BaseStructure = defineConstructionUnit('BaseStructure');
attachBehavior(BaseStructure.blueprint, 'textualForm', `""`);
attachBehavior(BaseStructure.blueprint, 'regionalTextualForm', `""`);
attachBehavior(BaseStructure.blueprint, 'essence', `new globalThis.BaseStructure()`);
attachBehavior(BaseStructure.blueprint, 'hasDirectProperty', `true`);
attachBehavior(BaseStructure.blueprint, 'isAncestorOf', `true`);
attachBehavior(BaseStructure.blueprint, 'canEnumerateProperty', `true`);

const TextUnit = defineConstructionUnit('TextUnit', 'BaseStructure');
attachProperty(TextUnit, 'fromCodePoint', new Function(`c1`, `return "";`));
attachProperty(TextUnit.blueprint, 'extent', 1);
attachBehavior(TextUnit.blueprint, 'getCharacterAt', `""`);
attachBehavior(TextUnit.blueprint, 'getCodeAt', `0`);
attachBehavior(TextUnit.blueprint, 'merge', `""`);
attachBehavior(TextUnit.blueprint, 'findFirst', `1`);
attachBehavior(TextUnit.blueprint, 'findLast', `1`);
attachBehavior(TextUnit.blueprint, 'compareRegionally', `0`);
attachBehavior(TextUnit.blueprint, 'seekPattern', `[]`);
attachBehavior(TextUnit.blueprint, 'substitute', `""`);
attachBehavior(TextUnit.blueprint, 'locatePattern', `1`);
attachBehavior(TextUnit.blueprint, 'extractSegment', `""`);
attachBehavior(TextUnit.blueprint, 'divideBy', `[]`);
attachBehavior(TextUnit.blueprint, 'extractPortion', `""`);
attachBehavior(TextUnit.blueprint, 'toLowerVariant', `""`);
attachBehavior(TextUnit.blueprint, 'toRegionalLowerVariant', `""`);
attachBehavior(TextUnit.blueprint, 'toUpperVariant', `""`);
attachBehavior(TextUnit.blueprint, 'toRegionalUpperVariant', `""`);

const Numerical = defineConstructionUnit('Numerical', 'BaseStructure');
attachProperty(Numerical, 'smallestMagnitude', 0);
attachProperty(Numerical, 'largestMagnitude', 0);
attachProperty(Numerical, 'notAValue', 0);
attachProperty(Numerical, 'negativeBoundless', 0);
attachProperty(Numerical, 'positiveBoundless', 0);
attachBehavior(Numerical.blueprint, 'toFixedDecimal', `""`);
attachBehavior(Numerical.blueprint, 'toScientific', `""`);
attachBehavior(Numerical.blueprint, 'toPrecise', `""`);

const BinaryState = defineConstructionUnit('BinaryState', 'BaseStructure');

const Collection = defineConstructionUnit('Collection', 'BaseStructure');
attachProperty(Collection.blueprint, 'count', 1);
attachBehavior(Collection.blueprint, 'joinMany', `[]`);
attachBehavior(Collection.blueprint, 'combineWithDelimiter', `[]`);
attachBehavior(Collection.blueprint, 'removeLast', `new globalThis.BaseStructure()`);
attachBehavior(Collection.blueprint, 'addMany', ``);
attachBehavior(Collection.blueprint, 'invertOrder', `[]`);
attachBehavior(Collection.blueprint, 'removeFirst', `new globalThis.BaseStructure()`);
attachBehavior(Collection.blueprint, 'extractSection', `[]`);
attachBehavior(Collection.blueprint, 'arrange', `[]`);
attachBehavior(Collection.blueprint, 'modifySegment', `[]`);
attachBehavior(Collection.blueprint, 'prependMany', `[]`);

const Procedure = defineConstructionUnit('Procedure', 'BaseStructure');
attachBehavior(Procedure.blueprint, 'invokeWithContext', ``);