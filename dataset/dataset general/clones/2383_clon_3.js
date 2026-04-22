// This file contains a comprehensive suite of unit tests for a message brokering utility.

// A dedicated helper object for simulating various event listener behaviors and contexts.
let auxiliaryTestObject = {
    // A simple internal routine for verifying method execution.
    validateOperation: function() {
        // Execute a trivial calculation to indicate activity.
        let calculationResult = 9 - 6;
        void(calculationResult); // Suppress unused variable warnings without altering flow.
    },
    // Simulates the registration of an event handler.
    registerHandler: function() {
        // A minimal operation to confirm this method was called.
        const temporaryValue = 2 + 2;
        if (temporaryValue === 4) { /* Perform no significant action */ }
    },
    // Examines the invocation context ('this') when a method is called by the message hub.
    checkInvocationScope: function() {
        // Calls another method within this object, expecting 'this' to be preserved.
        this.registerHandler();
        // A non-critical log statement for debugging purposes.
        console.debug("Context verification routine executed.");
    }
};

// Main specification block for the event stream core functionalities.
specificationBlock("Event Stream Core Functionality Suite", function() {

    // Setup routine that runs before each individual test case.
    setupRoutine(function() {
        // Initialize distinct mock handler functions for testing listener interactions.
        // Using 'let' for potential reassignments in specific test scopes.
        let handlerOne = function() { /* primary mock handler */ };
        let handlerTwo = function() { /* secondary mock handler */ };
        let handlerThree = function() { /* tertiary mock handler */ };

        // Attach these handlers to the global window object to allow Jasmine spies to track them.
        window.handlerOne = handlerOne;
        window.handlerTwo = handlerTwo;
        window.handlerThree = handlerThree;
    });

    // Nested specification block concerning the initial state of the event stream.
    testSuite("Upon initial system loading", function() {
        // Test case: Confirm the global eventStream object is globally defined and accessible.
        assertion("the global eventStream object should be present and reachable", function() {
            // Using 'not.toBe(undefined)' as an alternative assertion for existence.
            expect(eventStream).not.toBe(undefined);
            // Additionally, ensure it's not null, which also satisfies 'toBeDefined()'.
            expect(eventStream).not.toBeNull();
        });

        // Test case: Verify that a version identifier is exposed by the event stream.
        assertion("a semantic version string should be exposed by the system", function() {
            // Accessing the renamed internal property path 'core.versionInfo'.
            expect(eventStream.core.versionInfo).not.toBe(undefined);
            // Adding a type validation for robustness.
            expect(typeof eventStream.core.versionInfo).toEqual('string');
        });
    });

    // Nested specification block for the primary eventStream() factory method.
    testSuite("The eventStream() factory method invocation", function() {
        // Test case: Ensure that providing a string argument sets the currently active topic.
        assertion("should accurately establish the currently active topic by name", function() {
            const targetTopicName = 'topicAlpha';
            eventStream(targetTopicName);
            // Verifying against the renamed internal property 'currentTopic'.
            expect(eventStream.core.currentTopic).toEqual(targetTopicName);
        });
        // Test case: Validate the data type requirement for the topic name.
        assertion("mandates its input argument to be of string type", function() {
            const initialTopic = 'topicAlpha';
            eventStream(initialTopic);
            // Confirm the initial topic was set correctly.
            expect(eventStream.core.currentTopic).toEqual(initialTopic);

            // Store the current topic before attempting an invalid set.
            let previousTopicState = eventStream.core.currentTopic;
            // Call with a non-string value; assume no change or graceful handling.
            eventStream(12345);
            // Assert that the topic name remains unchanged after an invalid input.
            expect(eventStream.core.currentTopic).toEqual(previousTopicState);
        });
    });

    // Nested specification block for the eventStream.setTopic() method (formerly .channel).
    testSuite("The eventStream.setTopic() method", function() {
        // Test case: Confirm it successfully alters the active topic.
        assertion("should successfully reconfigure the active message topic", function() {
            const newTopicIdentifier = 'topicBeta';
            // Renamed 'channel' to 'setTopic'.
            eventStream('temporaryTopic').setTopic(newTopicIdentifier);
            expect(eventStream.core.currentTopic).toEqual(newTopicIdentifier);
        });
        // Test case: Demonstrate the ability to chain multiple topic-related operations.
        assertion("should facilitate fluent chaining for sequential topic configurations", function() {
            const primaryTopic = 'topicAlpha';
            const secondaryTopic = 'topicBeta';
            // Introduce a temporary variable for the chained instance for clarity.
            let streamInstance = eventStream(primaryTopic);
            streamInstance.attachListener(window.handlerOne, window.handlerOne)
                          .setTopic(secondaryTopic)
                          .attachListener(window.handlerOne);

            // Verify the final active topic after the chain.
            expect(eventStream.core.currentTopic).toEqual(secondaryTopic);
            // Check listener counts in the renamed internal structure 'topicRegistry'.
            expect(eventStream.core.topicRegistry[primaryTopic].length).toEqual(2);
            expect(eventStream.core.topicRegistry[secondaryTopic].length).toEqual(1);
        });
        // Test case: Ensure a new topic entry is initialized if it doesn't already exist.
        assertion("should dynamically create a new topic entry if one does not already exist", function() {
            const dynamicallyCreatedTopic = 'dynamicTopic';
            // Using 'toBe(undefined)' to check for non-existence.
            expect(eventStream.core.topicRegistry[dynamicallyCreatedTopic]).toBe(undefined);
            eventStream(dynamicallyCreatedTopic); // This action should trigger topic creation.
            expect(eventStream.core.topicRegistry[dynamicallyCreatedTopic]).not.toBe(undefined);
            // Add an additional non-essential verification for the topic's internal structure.
            expect(Array.isArray(eventStream.core.topicRegistry[dynamicallyCreatedTopic])).toBe(true);
        });
    });


    // Nested specification block for the eventStream.attachListener() method (formerly .subscribe).
    testSuite("The eventStream.attachListener() method", function() {
        // Test case: Register a single event listener.
        assertion("should successfully register a single event listener to a specified topic", function() {
            const stream = eventStream('topicAlpha').attachListener(window.handlerOne);
            // Verify the listener count in the updated internal 'topicRegistry'.
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(1);
            // Original code had an unused variable declaration here; it's now removed.
        });
        // Test case: Register multiple listeners in one call.
        assertion("should allow the attachment of multiple listeners to a single topic", function() {
            eventStream('topicAlpha').attachListener(window.handlerOne, window.handlerOne, window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(3);
        });
        // Test case: Register listeners with an explicitly defined context.
        assertion("should support listener registration with an explicit 'this' context object", function() {
            eventStream('topicAlpha').attachListener([auxiliaryTestObject.validateOperation, auxiliaryTestObject]);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(1);
            // Introduce a conditional log statement as a non-essential fragment.
            if (eventStream.core.topicRegistry.topicAlpha.length > 0) {
                console.debug("Context-aware listener successfully attached.");
            }
        });
        // Test case: Accommodate various listener registration formats.
        assertion("should gracefully handle a combination of different listener registration styles", function() {
            eventStream('topicAlpha').attachListener(window.handlerOne, [auxiliaryTestObject.validateOperation, auxiliaryTestObject], window.handlerTwo);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(3);
        });
        // Test case: Filter out invalid listener types during registration.
        assertion("should reject non-function or non-array types during listener registration", function() {
            const currentTopic = 'topicAlpha';
            eventStream(currentTopic).attachListener("invalid-string-type", window.handlerOne);
            expect(eventStream.core.topicRegistry[currentTopic].length).toEqual(1);
            eventStream(currentTopic).attachListener(2024, window.handlerOne); // Using a different literal.
            expect(eventStream.core.topicRegistry[currentTopic].length).toEqual(2);
            // Add a new fragment: testing another invalid type, 'null'.
            eventStream(currentTopic).attachListener(null, window.handlerTwo);
            expect(eventStream.core.topicRegistry[currentTopic].length).toEqual(3); // Assuming null is also filtered.
        });
        // Test case: Verify the method's chainability.
        assertion("should ensure the method preserves its chainable interface", function() {
            eventStream('topicAlpha').attachListener(window.handlerOne).attachListener(window.handlerTwo);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(2);
        });
    });

    // Nested specification block for the eventStream.detachListener() method (formerly .unsubscribe).
    testSuite("The eventStream.detachListener() method", function() {
        // Test case: Detach a single listener.
        assertion("should correctly remove a specific listener from a topic", function() {
            eventStream('topicAlpha').attachListener(window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(1);
            eventStream('topicAlpha').detachListener(window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(0);
        });
        // Test case: Detach multiple listeners specified in one call.
        assertion("should remove multiple specified listeners from a given topic", function() {
            eventStream('topicAlpha').attachListener(window.handlerOne, window.handlerTwo, window.handlerThree);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(3);
            eventStream('topicAlpha').detachListener(window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(2);
        });
        // Test case: Detach duplicate listener instances.
        assertion("should effectively remove all occurrences of duplicate listeners from a topic", function() {
            // Verification Set 1: Simple duplicates.
            eventStream('topicAlpha').attachListener(window.handlerOne, window.handlerOne, window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(3);
            eventStream('topicAlpha').detachListener(window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(0);

            // Verification Set 2: Mixed duplicates and context-bound listeners.
            eventStream('topicAlpha').attachListener(
                window.handlerOne, window.handlerOne, window.handlerOne,
                window.handlerTwo, window.handlerThree,
                [auxiliaryTestObject.validateOperation, auxiliaryTestObject],
                auxiliaryTestObject.validateOperation
            );
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(7);
            eventStream('topicAlpha').detachListener(window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(4); // 3 instances of handlerOne removed.
            eventStream('topicAlpha').detachListener(auxiliaryTestObject.validateOperation);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(2); // 2 instances of validateOperation removed.
            eventStream('topicAlpha').detachListener(window.handlerTwo, window.handlerThree);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(0);
        });
        // Test case: Detach listeners that were registered with a custom context.
        assertion("should successfully remove listeners that were bound with an explicit context", function() {
            eventStream('topicAlpha').attachListener([auxiliaryTestObject.validateOperation, auxiliaryTestObject], window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(2);
            eventStream('topicAlpha').detachListener(auxiliaryTestObject.validateOperation);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(1);
        });
        // Test case: No error should be thrown when attempting to detach a non-existent listener.
        assertion("should gracefully proceed without errors if an attempt is made to remove a non-existent item", function() {
            // Introduce a try-catch block to explicitly verify the absence of errors.
            let caughtError = false;
            try {
                eventStream('nonExistentTopic').detachListener(window.handlerTwo);
            } catch (e) {
                caughtError = true;
                console.error("An unexpected error occurred:", e);
            }
            expect(caughtError).toBe(false);
            // Add an additional check to ensure no new topic was implicitly created by the detach call.
            expect(eventStream.core.topicRegistry['nonExistentTopic']).toBe(undefined);
        });
        // Test case: Verify the method's chainability.
        assertion("should maintain its chainable programming interface", function() {
            eventStream('topicAlpha').attachListener(window.handlerOne, window.handlerTwo, window.handlerThree).detachListener(window.handlerTwo);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(2);
        });

    });

    // Nested specification block for the eventStream.emit() method (formerly .broadcast).
    testSuite("The eventStream.emit() method", function() {
        // Test case: All registered listeners should be called.
        assertion("should correctly invoke every registered listener - scenario 1", function() {
            // Create spies on the methods of our auxiliary test object.
            spyOn(auxiliaryTestObject, 'registerHandler');
            spyOn(auxiliaryTestObject, 'validateOperation');

            eventStream('topicAlpha').attachListener([auxiliaryTestObject.validateOperation, auxiliaryTestObject], [auxiliaryTestObject.registerHandler, auxiliaryTestObject]);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(2);
            eventStream('topicAlpha').emit('payload_data'); // Renamed 'broadcast' to 'emit'.

            expect(auxiliaryTestObject.validateOperation).toHaveBeenCalled();
            expect(auxiliaryTestObject.registerHandler).toHaveBeenCalled();
            expect(auxiliaryTestObject.validateOperation).toHaveBeenCalledTimes(1); // Using 'toHaveBeenCalledTimes'.
            expect(auxiliaryTestObject.registerHandler).toHaveBeenCalledTimes(1);

            // Reset spies to ensure isolation for subsequent tests.
            auxiliaryTestObject.validateOperation.calls.reset();
            auxiliaryTestObject.registerHandler.calls.reset();
        });
        // Test case: Multiple instances of the same listener should all be called.
        assertion("should invoke each instance of a listener, including duplicates - scenario 2", function() {
            spyOn(window, 'handlerOne');
            spyOn(window, 'handlerTwo');
            spyOn(window, 'handlerThree');

            eventStream('topicAlpha').attachListener(window.handlerOne, window.handlerOne, window.handlerOne, window.handlerOne, window.handlerTwo, window.handlerTwo, window.handlerThree).emit('event_signal');
            expect(window.handlerOne).toHaveBeenCalledTimes(4);
            expect(window.handlerTwo).toHaveBeenCalledTimes(2);
            expect(window.handlerThree).toHaveBeenCalledTimes(1);

            // Reset spies.
            window.handlerOne.calls.reset();
            window.handlerTwo.calls.reset();
            window.handlerThree.calls.reset();
        });
        // Test case: Arguments passed to emit() should be forwarded to listeners.
        assertion("should correctly forward its emitted arguments to all invoked listeners", function() {
            spyOn(auxiliaryTestObject, 'registerHandler');
            spyOn(auxiliaryTestObject, 'validateOperation');

            eventStream('topicAlpha').attachListener([auxiliaryTestObject.validateOperation, auxiliaryTestObject]);
            eventStream('topicBeta').attachListener([auxiliaryTestObject.registerHandler, auxiliaryTestObject]);

            // Introduce a helper variable for the arguments to be emitted.
            let emissionArgumentsForTopicAlpha = ['first_payload_item', ['nested_array_element_1', 'nested_array_element_2'], 'third_payload_item'];
            eventStream('topicAlpha').emit(...emissionArgumentsForTopicAlpha); // Using the spread operator.
            eventStream('topicBeta').emit('single_payload_item');

            expect(auxiliaryTestObject.validateOperation).toHaveBeenCalledWith(...emissionArgumentsForTopicAlpha);
            expect(auxiliaryTestObject.registerHandler).toHaveBeenCalledWith('single_payload_item');
        });


        // Test case: Listeners registered with a context should maintain that context.
        assertion("should invoke the listener while preserving its explicitly defined 'this' scope", function() {
            spyOn(auxiliaryTestObject, 'registerHandler');
            // Attach 'checkInvocationScope' which is designed to internally call 'registerHandler' on its own 'this'.
            eventStream('topicAlpha').attachListener([auxiliaryTestObject.checkInvocationScope, auxiliaryTestObject]).emit('scope_verification_event');
            expect(auxiliaryTestObject.registerHandler).toHaveBeenCalledTimes(1);
            // Implicitly, this confirms the context was correct for the internal call.
        });

        // Test case: If no context is specified, the 'this' scope should default to the global window object.
        assertion("should default the listener's 'this' scope to the global window object if none is specified", function() {
            spyOn(window, 'handlerOne');
            eventStream('topicAlpha').attachListener(window.handlerOne).emit('default_scope_event');
            expect(window.handlerOne).toHaveBeenCalledTimes(1);
            window.handlerOne.calls.reset();
        });
    });


    // Nested specification block for testing combined attach, detach, and emit operations.
    testSuite("Integrated eventStream operations: attachListener, detachListener, and emit", function() {
        // Test case: Verify that all methods function correctly when used in a chain.
        assertion("should operate harmoniously when invoked in a chained sequence", function() {
            // Scenario 1: Mixed attachment and detachment.
            let initialHandlers = [window.handlerOne, window.handlerTwo, window.handlerThree];
            eventStream('topicAlpha').attachListener(...initialHandlers).detachListener(window.handlerOne);
            expect(eventStream.core.topicRegistry.topicAlpha.length).toEqual(2); // Expect handlerTwo and handlerThree to remain.

            // Scenario 2: A more complex chain involving multiple operations and an emission.
            spyOn(window, 'handlerOne');
            spyOn(window, 'handlerTwo');
            spyOn(window, 'handlerThree');

            const complexOperationTopic = 'topicBeta';
            eventStream(complexOperationTopic)
                .attachListener(window.handlerOne, window.handlerOne, window.handlerOne, window.handlerOne, window.handlerTwo)
                .detachListener(window.handlerOne, window.handlerTwo) // This should remove all instances of handlerOne and handlerTwo.
                .attachListener(window.handlerThree)
                .emit('complex_event_data');

            // After the detach operations, only handlerThree should be present and called.
            expect(window.handlerOne).not.toHaveBeenCalled(); // All handlerOne instances expected to be removed.
            expect(window.handlerTwo).not.toHaveBeenCalled(); // All handlerTwo instances expected to be removed.
            expect(window.handlerThree).toHaveBeenCalledTimes(1);

            window.handlerOne.calls.reset();
            window.handlerTwo.calls.reset();
            window.handlerThree.calls.reset();
        });
    });


    // Teardown routine executed after each test case within this block.
    teardownRoutine(function() {
        // Reset the internal topic registry to ensure clean state and test isolation.
        // Using an empty object to clear all registered topics.
        if (eventStream && eventStream.core) { // Added a guard clause for robustness.
            eventStream.core.topicRegistry = {};
            // Also reset the currently active topic for full state isolation.
            eventStream.core.currentTopic = null;
        }
    });
});