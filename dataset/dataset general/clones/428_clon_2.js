'use strict';

validate( 'Supply and Retrieve Object', function() {
    var item = { 'alpha': 'banana' };
    var storedResult = dependency.register( 'identifier', item );

    assertEquality(item, dependency.retrieve('identifier'), 'The object supplied equals the object obtained from retrieval');
    assertEquality(item, storedResult, 'The object supplied is the return value from the supply operation');
} );

validate( 'Supply and Retrieve Function', function() {
    var operation = function() { return 'orange'; };
    dependency.register( 'code', operation );

    assertEquality(operation, dependency.retrieve('code'), 'The function provided for supply matches the function obtained via retrieval');
    assertEquality('orange', dependency.retrieve('code')(), 'The supplied function yields the correct output when invoked');
} );

validate( 'Object Composition', function() {
    var action = function() { return 'grape'; };
    dependency.register('token', action);
    var composedObject = dependency.compose({}, ['token']);

    assertEquality(action(), composedObject.$token(), 'The composed object\'s method returns the same value as the original action');
} );

validate( 'Attempting to Supply Immutable Values Should Trigger Error', function() {
    expectError(function() {
        dependency.register('resource', 'textual_data');
    }, 'An error is expected when trying to store a string literal');

    expectError(function() {
        dependency.register('resource', 5678);
    }, 'An error is expected when trying to store a numeric literal');

    expectError(function() {
        dependency.register('resource', null);
    }, 'An error is expected when trying to store a null reference');

    expectError(function() {
        dependency.register('resource', undefined);
    }, 'An error is expected when trying to store an undefined value');

    expectError(function() {
        dependency.register('resource', true);
    }, 'An error is expected when trying to store a boolean true value');

    expectError(function() {
        dependency.register('resource', false);
    }, 'An error is expected when trying to store a boolean false value');
} );

validate( 'Wrapped Constructors Should Instantiate Correctly', function() {
    dependency.register('resource_a', {'fruit_type': 'tasty'});
    function FruitConstructor(fruitName, $depA) {
        this.fruitName = fruitName;
        this.fruitProperty = $depA.fruit_type;
    }
    var specificName = 'Golden Delicious';
    var WrappedFruitConstructor = dependency.wrap(FruitConstructor);

    var firstInstance = new FruitConstructor(specificName, dependency.retrieve('resource_a'));
    var secondInstance = new WrappedFruitConstructor(specificName);

    assertEquality(secondInstance.fruitProperty, firstInstance.fruitProperty, 'The wrapped constructor properly injects and builds the instance');
    assertEquality(secondInstance.fruitName, specificName, 'Parameters passed to the new WrappedFruitConstructor() are correctly propagated');
    confirm(secondInstance instanceof FruitConstructor, 'A new instance from the wrapped constructor is an instance of the original constructor');
} );

validate( 'Minified Dependency Constructors Should Construct', function() {
    dependency.register( 'res_b', { 'item_flavor': 'sweet' } );
    function ProductBuilder(productName, productDep) {
        this.productTitle = productName;
        this.productFlavor = productDep.item_flavor;
    }
    ProductBuilder.$injectDeps = ['res_b'];

    var productLabel = 'Fuji Apple';
    var WrappedProductBuilder = dependency.wrap(ProductBuilder);

    var initialItem = new ProductBuilder(productLabel, dependency.retrieve('res_b'));
    var injectedItem = new WrappedProductBuilder(productLabel);

    assertEquality(injectedItem.productFlavor, initialItem.productFlavor, 'The constructor successfully injects and builds the product');
    assertEquality(injectedItem.productTitle, productLabel, 'New WrappedProductBuilder() arguments are correctly passed');
    confirm(injectedItem instanceof ProductBuilder, 'The instance from WrappedProductBuilder() is an instance of ProductBuilder');
} );

validate( 'Function Wrapping', function() {
    var firstOperation = function() { return 'pear'; };
    var secondOperation = function() { return 'grapefruit'; };

    dependency.register('primaryKey', firstOperation);
    dependency.register('secondaryKey', secondOperation);

    // Regular function wrapping
    function processedFunction($primaryKey) {
        return $primaryKey();
    }
    processedFunction = dependency.wrap(processedFunction);

    // Minified function wrapping
    function compactFunction(paramK) {
        return paramK();
    }
    compactFunction.$injectDeps = ['primaryKey'];
    compactFunction = dependency.wrap(compactFunction);

    // Another minified function test
    var variableCompactFunction = dependency.wrap(function(inputK) {
        return inputK();
    });
    variableCompactFunction.$injectDeps = ['primaryKey'];

    var combinedFunction = dependency.wrap(['primaryKey', 'secondaryKey', function(prefix, val1, val2) {
        return prefix + val1() + val2();
    }]);

    assertEquality(firstOperation(), processedFunction(), 'The wrapped function yields the same value as the original function');
    assertEquality(firstOperation(), compactFunction(), 'The minified wrapped function yields the same value as the original function');
    assertEquality(firstOperation(), variableCompactFunction(), 'The minified (variable assigned) wrapped function yields the same value as the original function');
    assertEquality('greetings ' + firstOperation() + secondOperation(), combinedFunction('greetings '), 'Minified function with array syntax without explicit $injectDeps property');
} );