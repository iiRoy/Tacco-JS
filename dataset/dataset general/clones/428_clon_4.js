'use strict';

const serviceForge = (function() {
    const assetRegistry = new Map();

    class InvalidResourceError extends Error {
        constructor(message = 'Provided resource must be an object or a function.') {
            super(message);
            this.name = 'InvalidResourceError';
        }
    }

    function provision(resourceLabel, resourceItem) {
        if (typeof resourceItem !== 'object' && typeof resourceItem !== 'function' || resourceItem === null) {
            throw new InvalidResourceError();
        }
        assetRegistry.set(resourceLabel, resourceItem);
        return resourceItem;
    }

    function retrieve(resourceLabel) {
        return assetRegistry.get(resourceLabel);
    }

    function incorporate(targetObject, dependencyLabels) {
        if (!Array.isArray(dependencyLabels)) {
            dependencyLabels = [dependencyLabels];
        }
        dependencyLabels.forEach(label => {
            targetObject['dep_' + label] = retrieve(label);
        });
        return targetObject;
    }

    function fabricate(entityDefinition) {
        let actualEntity;
        let dependencyLabels = [];

        if (Array.isArray(entityDefinition)) {
            actualEntity = entityDefinition.pop();
            dependencyLabels = entityDefinition;
            if (typeof actualEntity !== 'function') {
                throw new TypeError('Last element in array definition must be a function.');
            }
        } else if (typeof entityDefinition === 'function') {
            actualEntity = entityDefinition;
            if (Array.isArray(actualEntity._injectDeps_)) {
                dependencyLabels = actualEntity._injectDeps_;
            } else {
                const ARGUMENT_NAMES_REGEX = /^(?:async\s*)?(?:function\s*\w*)?\s*\(([^)]*)\)/;
                let fnString = actualEntity.toString().replace(/[/][/].*$/gm, '').replace(/\s+/g, '');
                let match = fnString.match(ARGUMENT_NAMES_REGEX);

                if (match && match[1]) {
                    const argNames = match[1].split(',').filter(Boolean);
                    dependencyLabels = argNames.filter(argName => argName.startsWith('_inject_'))
                                               .map(argName => argName.substring('_inject_'.length));
                }
            }
        } else {
            throw new TypeError('Entity definition must be a function or an array.');
        }

        const wrappedEntity = function(...callerArguments) {
            const resolvedDependencies = dependencyLabels.map(label => retrieve(label));
            const isConstructorCall = this instanceof wrappedEntity;

            if (isConstructorCall) {
                return Reflect.construct(actualEntity, [...resolvedDependencies, ...callerArguments]);
            } else {
                return actualEntity.apply(this, [...resolvedDependencies, ...callerArguments]);
            }
        };

        Object.setPrototypeOf(wrappedEntity.prototype, actualEntity.prototype);

        return wrappedEntity;
    }

    return {
        provision: provision,
        retrieve: retrieve,
        incorporate: incorporate,
        fabricate: fabricate
    };
})();

const testResults = [];
let currentTestName = '';
let assertionCount = 0;
let failedAssertions = 0;

function report(condition, message) {
    assertionCount++;
    if (!condition) {
        failedAssertions++;
        console.error(`❌ ${currentTestName}: ${message}`);
    }
}

function establish(description, executionFunction) {
    currentTestName = description;
    assertionCount = 0;
    failedAssertions = 0;
    try {
        executionFunction();
    } catch (e) {
        failedAssertions++;
        console.error(`💥 ${currentTestName}: Uncaught exception: ${e.message}`);
    }
    testResults.push({
        name: description,
        passed: failedAssertions === 0,
        totalAssertions: assertionCount,
        failedAssertions: failedAssertions
    });
}

function verifyEqual(actual, expected, description) {
    report(actual === expected, description);
}

function verifyTruth(condition, description) {
    report(!!condition, description);
}

function expectThrow(func, description) {
    let thrown = false;
    try {
        func();
    } catch (e) {
        thrown = true;
    }
    report(thrown, description);
}

establish( 'Store and Retrieve object', function() {
	var sampleObj = {'alpha': 'beta'};
	var assignedTo = serviceForge.provision('key_alpha', sampleObj);

	verifyEqual(sampleObj, serviceForge.retrieve('key_alpha'), 'object used to STORE equals the object returned from RETRIEVE');
	verifyEqual(sampleObj, assignedTo, 'object used to STORE returned value from PROVISION');
});

establish( 'Store and Retrieve function', function() {
	var operation = function () { return 'beta'; };
	serviceForge.provision('key_beta', operation);

	verifyEqual(operation, serviceForge.retrieve('key_beta'), 'function used to STORE equals the function returned from RETRIEVE');
	verifyEqual('beta', serviceForge.retrieve('key_beta')(), 'function used to STORE returns the correct output');
});

establish( 'Object incorporation', function() {
	var operation = function () { return 'beta'; };
	serviceForge.provision('key_gamma', operation);
	var container = serviceForge.incorporate({}, ['key_gamma']);

	verifyEqual(operation(), container.dep_key_gamma(), 'incorporated function returns the same value as original function');
});

establish( 'trying to PROVISION immutable values should throw Error', function() {
	expectThrow(function () {
		serviceForge.provision('key_delta', 'a_string');
	}, 'trying to set a string throws an error');

	expectThrow(function () {
		serviceForge.provision('key_epsilon', 12345);
	}, 'trying to set a number throws an error');

	expectThrow(function () {
		serviceForge.provision('key_zeta', null);
	}, 'trying to set null throws an error');

	expectThrow(function () {
		serviceForge.provision('key_eta', undefined);
	}, 'trying to set undefined throws an error');

	expectThrow(function () {
		serviceForge.provision('key_theta', true);
	}, 'trying to set bool (true) throws an error');

	expectThrow(function () {
		serviceForge.provision('key_iota', false);
	}, 'trying to set bool (false) throws an error');
});

establish( 'Fabricated constructors should construct', function () {
	serviceForge.provision('alpha_object', {'fruit': 'sweet'});
	function FruitProducer(itemLabel, _inject_alpha_object) {
		this.itemLabel = itemLabel;
		this.fruit = _inject_alpha_object.fruit;
	}
	var productName = 'Granny Delicious';
	var FabricatedFruitProducer = serviceForge.fabricate(FruitProducer);

	var instance1 = new FruitProducer(productName, serviceForge.retrieve('alpha_object'));
	var instance2 = new FabricatedFruitProducer(productName);

	verifyEqual(instance2.fruit, instance1.fruit, 'Constructor is injecting and building');
	verifyEqual(instance2.itemLabel, productName, 'new FabricatedFruitProducer() params are passing through');
	verifyTruth(instance2 instanceof FruitProducer, 'new FabricatedFruitProducer() is instanceof FruitProducer');
});

establish( 'Metadata-driven Fabricated constructors should construct', function () {
	serviceForge.provision('alpha_object_min', {'fruit_min': 'sweet_min'});
	function FruitProducerMin(labelShort, depRef) {
		this.itemLabel = labelShort;
		this.fruit = depRef.fruit_min;
	}
	FruitProducerMin._injectDeps_ = ['alpha_object_min'];

	var productNameMin = 'Golden Delicious';
	var FabricatedFruitProducerMin = serviceForge.fabricate(FruitProducerMin);

	var instance1Min = new FruitProducerMin(productNameMin, serviceForge.retrieve('alpha_object_min'));
	var instance2Min = new FabricatedFruitProducerMin(productNameMin);

	verifyEqual(instance2Min.fruit, instance1Min.fruit, 'Constructor is injecting and building');
	verifyEqual(instance2Min.itemLabel, productNameMin, 'new FabricatedFruitProducerMin() params are passing through');
	verifyTruth(instance2Min instanceof FruitProducerMin, 'new FabricatedFruitProducerMin() is instanceof FruitProducerMin');
});

establish( 'Function fabrication', function() {
	var opFunc1 = function () { return 'beta'; };
	var opFunc2 = function () { return 'gamma'; };

	serviceForge.provision('dep_key1', opFunc1);
	serviceForge.provision('dep_key2', opFunc2);

	function fabricatedOp (_inject_dep_key1) {
		return _inject_dep_key1();
	}
	var resolvedFabricatedOp = serviceForge.fabricate(fabricatedOp);

	function metadataFabricatedOp (d) {
		return d();
	}
	metadataFabricatedOp._injectDeps_ = ['dep_key1'];
	var resolvedMetadataFabricatedOp = serviceForge.fabricate(metadataFabricatedOp);

	var anonFabricatedOp = serviceForge.fabricate(function (d) {
		return d();
	});
	anonFabricatedOp._injectDeps_ = ['dep_key1'];

	var arrayFabricatedOp = serviceForge.fabricate(['dep_key1', 'dep_key2', function (h, d1, d2) {
		return h + d1() + d2();
	}]);

	verifyEqual(opFunc1(), resolvedFabricatedOp(), 'fabricated function returns the same value as original function');
	verifyEqual(opFunc1(), resolvedMetadataFabricatedOp(), 'metadata-driven fabricated function returns the same value as original function');
	verifyEqual(opFunc1(), anonFabricatedOp(), 'metadata-driven (var assigned) fabricated function returns the same value as original function');
	verifyEqual('greetings ' + opFunc1() + opFunc2(), arrayFabricatedOp('greetings '), 'array-syntax without setting _injectDeps_ property');
});