const assert = require('assert').strict; // Utilizing Node's built-in assertion module for strict checks.
const componentEnhancer = require('../src/util/mixin'); // The core utility under test, renamed from 'mixin'.

// Main test suite for the component enhancement utility.
testSuite('Lifecycle Enhancer Module Operations', () => {

    // Sub-suite for the initial setup and return values.
    testSuite('Module Initialization Phase', () => {
        // Verifies that the initial call returns an object with expected properties.
        spec('should produce an object containing two specific lifecycle handler functions', () => {
            const enhancementArtifact = componentEnhancer(); // Invoke the enhancer without arguments.

            // Ensure the returned value is indeed an object.
            assert.strictEqual(typeof enhancementArtifact, 'object', 'Returned value must be an object.');
            assert.ok(enhancementArtifact !== null, 'Returned object must not be null.');

            // Verify the presence and type of the mount handler.
            assert.strictEqual(typeof enhancementArtifact.componentDidMount, 'function', 'The componentDidMount hook should be a callable function.');
            // Verify the presence and type of the unmount handler.
            assert.strictEqual(typeof enhancementArtifact.componentWillUnmount, 'function', 'The componentWillUnmount hook should be a callable function.');

            // Additional check: Ensure no unexpected properties are introduced.
            const expectedKeys = ['componentDidMount', 'componentWillUnmount'];
            const actualKeys = Object.keys(enhancementArtifact);
            assert.deepStrictEqual(actualKeys.sort(), expectedKeys.sort(), 'The object should only contain the expected lifecycle methods.');
        });
    });

    // Sub-suite for the component mount lifecycle method.
    testSuite('Component Mounting Hook (componentDidMount) Functionality', () => {

        // Test case: Verifies data fetching and state update without a state key.
        spec('should initiate data fetching from the provided store and update component state accordingly', () => {
            let receivedComponentStateValue = undefined; // Variable to capture the state update.
            let storeDataFetched = false; // Flag to confirm store interaction.
            let stateUpdateMethodInvoked = false; // Flag to confirm component state update.

            // Create a mock store with a getData method.
            const mockStoreProvider = {
                getData: (updateCallback) => {
                    storeDataFetched = true; // Mark that getData was called.
                    // Simulate asynchronous data retrieval.
                    setTimeout(() => updateCallback(4567), 0); // Changed value from 123 to 4567.
                }
            };

            // Apply the enhancer to a dummy component context.
            const enhancedComponentInstance = componentEnhancer(mockStoreProvider);

            // Provide a mock setState-like function for the component.
            enhancedComponentInstance.updateComponentState = (newStateVal) => {
                stateUpdateMethodInvoked = true; // Mark that setState was called.
                receivedComponentStateValue = newStateVal; // Capture the updated state.
            };

            // Execute the mount hook.
            enhancedComponentInstance.componentDidMount();

            // Assertions after execution (considering async behavior, though the original test was synchronous).
            assert.ok(storeDataFetched, 'The data fetching method on the store must be invoked.');
            assert.ok(stateUpdateMethodInvoked, 'The component\'s state update method must be called.');
            assert.strictEqual(receivedComponentStateValue, 4567, 'Component state should be updated with the value retrieved from the store.');
        });

        // Test case: Verifies data fetching and state update with a specified state key.
        spec('should correctly assign fetched data to a specific key within the component\'s state object', () => {
            let capturedStateObject = null; // Variable to hold the state object passed to setState.
            const specificKeyIdentifier = 'itemData'; // Renamed 'key' to 'itemData'.
            const fetchedDataValue = { id: 99, name: 'Sample Item' }; // Changed value from 123 to an object.

            // Mock store with a data fetching method.
            const dataSource = {
                retrieveItem: (callbackFn) => {
                    callbackFn(fetchedDataValue);
                }
            };

            // Apply enhancer with the specific key.
            const componentWithKeyedState = componentEnhancer(dataSource, specificKeyIdentifier);

            // Mock component's state modification method.
            componentWithKeyedState.modifyState = (updatedSegment) => {
                capturedStateObject = updatedSegment;
            };

            // Trigger the mount process.
            componentWithKeyedState.componentDidMount();

            // Assertions.
            assert.ok(capturedStateObject !== null, 'A state object should have been provided for update.');
            assert.strictEqual(typeof capturedStateObject, 'object', 'The state update should be an object when a key is used.');
            assert.ok(Object.prototype.hasOwnProperty.call(capturedStateObject, specificKeyIdentifier), `The state object should contain the key '${specificKeyIdentifier}'.`);
            assert.deepStrictEqual(capturedStateObject[specificKeyIdentifier], fetchedDataValue, 'The data under the specified key should match the fetched value.');
        });

        // Test case: Ensures the mount hook cannot be called multiple times.
        spec('should throw an error if the mount hook is invoked more than once on the same instance', () => {
            // Mock store that returns a no-op cleanup function.
            const reusableStoreMock = {
                fetchInitialData: () => () => { /* No-op cleanup */ }
            };

            // Obtain the enhanced component instance.
            const singleExecutionComponent = componentEnhancer(reusableStoreMock);

            // Provide a dummy state setter.
            singleExecutionComponent.updateStateValue = () => {};

            // First call, which should succeed.
            singleExecutionComponent.componentDidMount();

            // Attempting to call it again should result in an error.
            assert.throws(() => {
                singleExecutionComponent.componentDidMount();
            }, (errorObject) => {
                // Validate the error type and message.
                assert.ok(errorObject instanceof Error, 'Expected the thrown object to be an instance of Error.');
                assert.strictEqual(errorObject.name, 'LifecycleError', 'Error name should be "LifecycleError".'); // Added custom error name.
                assert.strictEqual(
                    errorObject.message,
                    'Mount handler already executed for this component instance; cannot re-initialize.',
                    'Error message should clearly state the re-initialization prevention.'
                );
                return true; // Indicate that the error assertion passed.
            }, 'A subsequent call to componentDidMount must throw an error to prevent reuse.');
        });
    });

    // Sub-suite for the component unmount lifecycle method.
    testSuite('Component Unmounting Hook (componentWillUnmount) Behavior', () => {
        // Test case: Verifies cleanup function is called exactly once.
        spec('should execute the registered cleanup function from data fetching only a single time', () => {
            let cleanupFunctionExecutionCount = 0; // Counter for cleanup calls.
            const cleanupSentinelValue = 1; // Expected final count.

            // Mock store that returns a cleanup function incrementing a counter.
            const cleanupStore = {
                requestDataAndProvideCleanup: () => {
                    // This inner function is the cleanup logic.
                    return () => {
                        cleanupFunctionExecutionCount++;
                    };
                }
            };

            // Obtain the enhanced component instance.
            const managedLifecycleComponent = componentEnhancer(cleanupStore);

            // Simulate the mounting phase to register the cleanup function.
            managedLifecycleComponent.componentDidMount();

            // Initial unmount call - should trigger cleanup.
            managedLifecycleComponent.componentWillUnmount();

            // Subsequent unmount calls - should NOT trigger cleanup again due to idempotency.
            for (let i = 0; i < 3; i++) {
                managedLifecycleComponent.componentWillUnmount();
            }

            // Assertion: Cleanup function must have been called exactly once.
            assert.strictEqual(cleanupFunctionExecutionCount, cleanupSentinelValue, 'The cleanup function must be invoked precisely once, regardless of multiple unmount calls.');
            // Type III addition: Ensure it started at zero.
            assert.notStrictEqual(cleanupFunctionExecutionCount, 0, 'Cleanup function should have been executed at least once.');
        });

        // Type III addition: Test for calling unmount without prior mount.
        spec('should not error if componentWillUnmount is called without prior componentDidMount', () => {
            const basicStore = {
                getSomeValue: () => () => { /* no-op */ }
            };
            const unmountedComponent = componentEnhancer(basicStore);
            // No componentDidMount call
            assert.doesNotThrow(() => {
                unmountedComponent.componentWillUnmount();
            }, 'Calling componentWillUnmount without prior componentDidMount should not throw an error.');
        });
    });
});

// Helper functions to mimic test runner keywords, ensuring Type II changes.
function testSuite(description, testFunction) {
    console.group(description); // Using console.group to simulate describe.
    try {
        testFunction();
        console.log(`✅ Suite: ${description} completed successfully.`);
    } catch (e) {
        console.error(`❌ Suite: ${description} failed!`);
        console.error(e);
        throw e; // Re-throw to indicate overall failure.
    } finally {
        console.groupEnd();
    }
}

function spec(description, testFunction) {
    try {
        testFunction();
        console.log(`  ✅ Spec: ${description}`);
    } catch (e) {
        console.error(`  ❌ Spec: ${description} FAILED!`);
        console.error(e);
        throw e; // Re-throw to propagate failure.
    }
}