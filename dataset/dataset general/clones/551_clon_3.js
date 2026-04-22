const messageBusFactory = require("../lib/factory"); // Renamed factory import

/**
 * Establishes a safety net for test execution to prevent indefinite hangs.
 * If the test's done() method isn't called within a specified duration,
 * this safeguard will fail the test and mark it as complete.
 * @param {object} testRunner The test harness object (e.g., nodeunit's test object).
 * @param {number} [durationMillis=1200] The maximum time in milliseconds to wait before failing.
 */
function setupTestGuard(testRunner, durationMillis) {
    // If no duration is provided, or it's explicitly null/undefined, use a default.
    const effectiveDuration = (durationMillis === undefined || durationMillis === null) ? 1200 : durationMillis;

    console.log(`[Guard] Setting up test safeguard for ${effectiveDuration}ms.`);

    const guardTimerHandle = setTimeout(() => {
        // This block executes if the test.done() was not called in time.
        console.error(`[Guard] Test timed out after ${effectiveDuration}ms. Forcing test failure.`);
        testRunner.ok(false, "Test execution exceeded allowed time limit.");
        testRunner.done(); // Ensure the test runner finishes.
    }, effectiveDuration);

    // Capture the original test.done() method.
    const originalDoneFn = testRunner.done;

    // Override test.done() to clear the timeout when the test completes normally.
    testRunner.done = function(...args) {
        console.log("[Guard] Test completed normally. Clearing timeout.");
        clearTimeout(guardTimerHandle); // Prevent the timeout from firing.
        originalDoneFn.apply(testRunner, args); // Call the original done method.
    };
}


exports.messageQueueStateCheck = function(testHarness) {
    testHarness.expect(3); // Expecting 3 assertions now.
    const taskExecutor = messageBusFactory.actor({
        deferExecution: function(pauseTimeMs, asyncControl) {
            // Enable asynchronous reply for this task.
            asyncControl.enable();
            console.log(`TaskExecutor: Deferring execution for ${pauseTimeMs}ms.`);
            setTimeout(() => {
                asyncControl.reply(); // Signal completion after the delay.
            }, pauseTimeMs);
        }
    });

    taskExecutor.init(); // Initialize the actor.
    taskExecutor.deferExecution(250, () => { // Call the deferred task.
        console.log("TaskExecutor: Deferred execution callback received.");
        testHarness.done(); // This done() will be overridden by setupTestGuard.
    });

    // Check the processing status immediately after dispatching an async task.
    const initialStatus = taskExecutor.processing();
    testHarness.equal(initialStatus, undefined, "Actor should not be processing right after init if nothing is pending.");

    // After a short delay, the actor should be processing the 'deferExecution' task.
    setTimeout(() => {
        const currentStatus = taskExecutor.processing();
        testHarness.ok(currentStatus !== undefined, "Actor should be processing a message after a short delay.");
        testHarness.ok(typeof currentStatus === 'object' && currentStatus.name() === 'deferExecution', "Processing status should indicate the 'deferExecution' task.");
    }, 120);

    setupTestGuard(testHarness, 500); // Set a timeout for this test.
};

exports.basicGreetingTest = function(testRunner) {
    testRunner.expect(2); // One more assertion added.
    const greetingService = messageBusFactory.actor({
        retrieveGreeting: function() {
            return "world"; // Simple greeting return.
        }
    });

    greetingService.init(); // Initialize the actor.

    // Request the greeting and handle the response.
    greetingService.ask("retrieveGreeting", (responseMessage) => {
        console.log(`Received greeting: ${responseMessage}`);
        testRunner.ok(responseMessage === "world", "The actor should return 'world' as a greeting.");
        testRunner.equal(typeof responseMessage, 'string', "The returned message should be a string.");
        testRunner.done(); // Complete the test.
    });

    setupTestGuard(testRunner, 300); // Apply test safeguard.
};

exports.dynamicInterfaceAssignment = function(testFramework) {
    testFramework.expect(3); // Increased expected assertions.
    const boundActorInstance = messageBusFactory.actor({
        getBoundMessage: function() {
            // Check if the context name is correctly set during initialization.
            console.log(`Actor context name: ${this.name}`);
            testFramework.ok(this.name === "BoundEntity", "The 'name' property in actor context should be set by init()");
            return "dynamic_world";
        }
    });

    boundActorInstance.init({
        name: "BoundEntity" // Pass configuration options during initialization.
    });

    // Directly call the method (auto-bound interface) instead of using 'ask'.
    boundActorInstance.getBoundMessage((responseValue) => {
        console.log(`Received bound message: ${responseValue}`);
        testFramework.ok(responseValue === "dynamic_world", "The actor should return 'dynamic_world' via direct method call.");
        const expectedType = 'string';
        testFramework.equal(typeof responseValue, expectedType, `The response type should be ${expectedType}.`);
        testFramework.done(); // Signal test completion.
    });

    setupTestGuard(testFramework, 400); // Configure timeout.
};

exports.functionalConfigurationTest = function(testObj) {
    testObj.expect(6); // Adjusted expected assertions.

    const configuredProcessor = messageBusFactory.actor((configParams) => {
        // The 'this' context refers to the actor instance's internal state.
        // This state is shared across all defined interfaces.
        let sequenceCounter = 0; // Use let for mutable state within the closure.
        console.log(`Actor initialized with config: ${JSON.stringify(configParams)}`);

        if (!configParams || typeof configParams.name !== 'string') {
            throw new Error("Configuration parameter 'name' is missing or invalid.");
        }
        testObj.ok(configParams.name === "ActorConfigured", "Actor should receive correct configuration name.");

        return {
            processData: function(inputPayload) {
                console.log(`Processing payload: ${JSON.stringify(inputPayload)}`);
                testObj.ok(inputPayload !== undefined && inputPayload !== null, "Input payload must not be undefined or null.");
                sequenceCounter++; // Increment the shared sequence counter.
                return {
                    destinationIdentifier: inputPayload.target,
                    seqValue: sequenceCounter
                };
            }
        };
    });

    configuredProcessor.init({
        name: "ActorConfigured" // Initialize with specific parameters.
    });

    configuredProcessor.processData({
        target: "alpha"
    }, (processingResult) => {
        console.log(`First processing result: ${JSON.stringify(processingResult)}`);
        testObj.ok(processingResult.destinationIdentifier === "alpha", "First reply target should be 'alpha'.");
        testObj.ok(processingResult.seqValue === 1, "First reply sequence value should be 1.");
    });

    configuredProcessor.processData({
        target: "beta"
    }, (processingResult) => {
        console.log(`Second processing result: ${JSON.stringify(processingResult)}`);
        testObj.ok(processingResult.destinationIdentifier === "beta", "Second reply target should be 'beta'.");
        testObj.ok(processingResult.seqValue === 2, "Second reply sequence value should be 2.");
        testObj.done(); // Mark test as finished.
    });

    setupTestGuard(testObj, 600); // Set a timeout for the test.
};

exports.asynchronousOperationTest = function(testContext_async) {
    testContext_async.expect(7); // Increased expected assertions.

    const asyncTaskAgent = messageBusFactory.actor({
        getSequenceValue: function() {
            // Returns the current sequence value.
            return {
                currentSeq: ++this.seq
            };
        },
        delayedResponse: function(requestData, asyncOps) {
            asyncOps.enable(); // Enable asynchronous response for this method.
            this.seq++; // Increment sequence counter.
            const agentInstanceRef = this; // Capture 'this' for use in the setTimeout callback.

            if (!requestData || typeof requestData.messageIdentifier === 'undefined') {
                console.warn("DelayedResponse received invalid requestData.");
                // Optionally reply with an error or default. For this test, assume valid.
            }

            setTimeout(() => {
                console.log(`Delayed response for msgId: ${requestData.messageIdentifier}, seq: ${agentInstanceRef.seq}`);
                asyncOps.reply({
                    messageIdentifier: requestData.messageIdentifier,
                    seq: agentInstanceRef.seq
                });
            }, 210); // Slightly modified delay.
        }
    });

    asyncTaskAgent.init({
        seq: 0
    }); // Initialize actor with a starting sequence.

    asyncTaskAgent.delayedResponse({
        messageIdentifier: 1
    }, (asyncReply) => {
        testContext_async.ok(asyncReply.messageIdentifier === 1, "First async reply msgId should be 1.");
        testContext_async.ok(asyncReply.seq === 1, "First async reply sequence should be 1.");
    });

    // Call a synchronous method while an async one is pending.
    asyncTaskAgent.getSequenceValue((asyncReply) => {
        testContext_async.ok(asyncReply.messageIdentifier === undefined, "Synchronous reply should not have a messageIdentifier.");
        testContext_async.ok(asyncReply.currentSeq === 2, "Synchronous reply sequence should be 2.");
        testContext_async.ok(asyncTaskAgent.processing() !== undefined, "Actor should still be processing after sync call.");
    });

    asyncTaskAgent.delayedResponse({
        messageIdentifier: 2
    }, (asyncReply) => {
        testContext_async.ok(asyncReply.messageIdentifier === 2, "Second async reply msgId should be 2.");
        testContext_async.ok(asyncReply.seq === 3, "Second async reply sequence should be 3.");
        testContext_async.done(); // Finish the test.
    });

    setupTestGuard(testContext_async, 700); // Set a timeout for the test.
};

exports.errorHandlingCapability = function(testSuite) {
    testSuite.expect(5); // Increased expected assertions.
    const faultTolerantActor = messageBusFactory.actor((initialOptions) => {
        let operationCount = 0; // Internal sequence counter.
        console.log(`Actor initialized for error handling test. Options: ${JSON.stringify(initialOptions)}`);

        return {
            performNormalOperation: function() {
                console.log("Performing normal operation.");
                return {
                    seq: ++operationCount
                };
            },
            triggerFailure: function() {
                console.log("Attempting to trigger a failure...");
                const faultyObject = undefined; // Intentionally undefined.
                // This line will throw an exception when 'exec()' is called on undefined.
                faultyObject.exec();
            }
        };
    });

    faultTolerantActor.init(); // Initialize the actor.

    faultTolerantActor.onUncaughtException((errorObject, errorActionContext) => {
        console.error(`Caught an actor exception: ${errorObject.message}, Action: ${errorActionContext.name()}`);
        testSuite.ok(errorActionContext !== undefined, "The error action context should be provided on exception.");
        testSuite.ok(errorObject instanceof Error, "The caught object should be an Error instance."); // Added assertion.
    });

    faultTolerantActor.performNormalOperation((operationResult) => {
        testSuite.ok(operationResult.seq === 1, "First normal operation sequence should be 1.");
    });

    faultTolerantActor.performNormalOperation((operationResult) => {
        testSuite.ok(operationResult.seq === 2, "Second normal operation sequence should be 2.");
    });

    faultTolerantActor.triggerFailure((operationResult) => {
        // This callback should NOT be invoked if an exception occurs within the actor method.
        testSuite.ok(false, "If actor's method throws an exception, its direct reply callback should not be executed.");
    });

    // Even after a failure, the actor's message queue should continue processing.
    faultTolerantActor.performNormalOperation((operationResult) => {
        testSuite.ok(operationResult.seq === 3, "Despite a previous failure, the actor should continue processing subsequent messages with seq 3.");
        testSuite.done(); // Complete the test.
    });

    setupTestGuard(testSuite, 800); // Set a timeout.
};

exports.errorAndStopExecution = function(testEnv) {
    testEnv.expect(4); // Adjusted expected assertions.
    const stoppableActor = messageBusFactory.actor((configOpts) => {
        let executionSequence = 0; // Internal sequence counter.
        console.log(`Stoppable actor initialized with options: ${JSON.stringify(configOpts)}`);

        return {
            regularTask: function() {
                console.log("Executing regular task.");
                return {
                    seq: ++executionSequence
                };
            },
            induceCrash: function() {
                console.log("Intentionally inducing a crash...");
                const problematicVariable = null; // Another way to cause an error.
                // This will throw a TypeError.
                problematicVariable.methodThatDoesNotExist();
            }
        };
    });

    stoppableActor.init(); // Initialize the actor.

    stoppableActor.onUncaughtException((caughtError, controlAction) => {
        console.error(`[StoppableActor] Caught an error: ${caughtError.message}. Action name: ${controlAction.name()}`);
        testEnv.ok(controlAction !== undefined, "Error control action context must be provided.");
        controlAction.stop(); // Crucially, stop the actor's message queue.
        console.log("[StoppableActor] Actor message queue explicitly stopped after error.");
        setTimeout(() => {
            // Give a moment for the stop to propagate and other messages to *not* process.
            testEnv.done(); // Finish the test after stopping.
        }, 220); // Slightly adjusted delay.
    });

    stoppableActor.regularTask((taskOutcome) => {
        testEnv.ok(taskOutcome.seq === 1, "First regular task should complete with seq 1.");
    });

    stoppableActor.regularTask((taskOutcome) => {
        testEnv.ok(taskOutcome.seq === 2, "Second regular task should complete with seq 2.");
    });

    stoppableActor.induceCrash((taskOutcome) => {
        // This callback should never be reached as the method will throw an exception.
        testEnv.ok(false, "Callback for crashing method should not be invoked.");
    });

    // This task should NOT be executed because the actor's queue was stopped.
    stoppableActor.regularTask((taskOutcome) => {
        testEnv.ok(false, "This task should not be processed after the actor queue was stopped.");
        testEnv.done(); // This done() should ideally not be reached.
    });

    setupTestGuard(testEnv, 900); // Set a timeout for this test.
};

exports.directMessagePassingTest = function(testUtil) {
    testUtil.expect(1); // Keeping the same expectation.
    const simpleEchoActor = messageBusFactory.actor({
        echoMessage: function(inputMessage) {
            console.log(`Echoing message: ${inputMessage}`);
            return inputMessage;
        }
    });

    simpleEchoActor.init(); // Initialize the actor.

    // Send a non-object argument directly.
    simpleEchoActor.echoMessage("hello_direct", (returnedMessage) => {
        testUtil.ok(returnedMessage === "hello_direct", "Actor should echo the non-object message correctly.");
        testUtil.done(); // Complete the test.
    });

    setupTestGuard(testUtil, 300); // Set a timeout.
};

exports.actorEventEmission = function(testHelper) {
    testHelper.expect(2); // Increased expectation.
    const eventfulProcessor = messageBusFactory.actor({
        initiatePing: function(messageContent) {
            const thisRef = this; // Capture 'this' for use in the async callback.
            console.log(`Initiating ping with: ${messageContent}`);
            setTimeout(() => {
                thisRef.emit("response", messageContent); // Emit a custom event.
                console.log(`Event 'response' emitted with payload: ${messageContent}`);
            }, 310); // Slightly adjusted delay.
        }
    });

    eventfulProcessor.init(); // Initialize the actor.

    // The direct callback for 'initiatePing' should receive no reply.
    eventfulProcessor.initiatePing("Hello_Events!", (initialReply) => {
        testHelper.ok(initialReply === undefined || initialReply === null, "Direct reply for event-emitting method should be undefined.");
    });

    // Listen for the custom 'response' event.
    eventfulProcessor.on("response", (receivedPayload) => {
        testHelper.ok(receivedPayload === "Hello_Events!", "The 'response' event should carry the correct payload.");
        testHelper.done(); // Complete the test.
    });

    setupTestGuard(testHelper, 600); // Set a timeout.
};

exports.anonymousTaskSubmission = function(testManager) {
    testManager.expect(3); // Expecting 3 assertions.
    const anonTaskRunner = messageBusFactory.actor(function() {
        const runnerInstance = this; // Capture instance for closure.
        console.log("Anonymous task runner initialized.");

        setTimeout(() => {
            // Post an anonymous function as a task to the actor's queue.
            runnerInstance.post(() => {
                console.log("Anonymous task executed inside actor.");
                testManager.equal(runnerInstance.actor()._state, "PROCESSING", "Actor state should be 'PROCESSING' during anonymous task execution.");
                testManager.equal(runnerInstance.actor()._queue.length, 0, "Actor message queue should be empty after task picked up.");

                setTimeout(() => {
                    testManager.equal(runnerInstance.actor()._state, "IDLE", "Actor state should revert to 'IDLE' after task completion.");
                    testManager.done(); // Complete the test.
                }, 120); // Slightly adjusted delay.
            });
        }, 110); // Slightly adjusted delay.

        return {
            // An actor without any public methods.
        };
    });

    anonTaskRunner.init(); // Initialize the actor.

    setupTestGuard(testManager, 500); // Set a timeout.
};

exports.namedTaskPosting = function(testContext_post) {
    testContext_post.expect(4); // Increased expectation.
    const taskDispatcher = messageBusFactory.actor(function() {
        const dispatcherRef = this; // Capture instance.
        console.log("Task dispatcher actor initialized.");

        setTimeout(() => {
            // Post a named task ('echo') with arguments and a reply handler.
            dispatcherRef.post("echo", "Hello_Posted!", (taskData, asyncControl_post) => {
                asyncControl_post.enable(); // Enable asynchronous reply for this posted task.
                console.log(`Reply handler for posted task received: ${taskData}`);
                testContext_post.equal(taskData, "pong_response", "Reply from posted task should be 'pong_response'.");
                testContext_post.equal(dispatcherRef.actor()._state, "PROCESSING", "Actor state should be 'PROCESSING' during posted task reply handler.");

                setTimeout(() => {
                    asyncControl_post.reply(); // Complete the asynchronous reply without a receiver.
                    console.log("Async reply for posted task completed.");

                    setTimeout(() => {
                        // After the reply is processed, the actor should return to IDLE.
                        testContext_post.equal(dispatcherRef.actor()._state, "IDLE", "Actor state should be 'IDLE' after async reply processing.");
                        testContext_post.done(); // Complete the test.
                    }, 130); // Slightly adjusted delay.
                }, 120); // Slightly adjusted delay.
            });
        }, 110); // Slightly adjusted delay.

        return {
            echo: function(inputMsg) {
                console.log(`Echo method called with: ${inputMsg}`);
                testContext_post.equal(inputMsg, "Hello_Posted!", "Echo method should receive the correct message.");
                return "pong_response"; // Return a value.
            }
        };
    });

    taskDispatcher.init(); // Initialize the actor.

    setupTestGuard(testContext_post, 800); // Set a timeout.
};

exports.chainedExecutionOrder = function(testAgent) {
    testAgent.expect(7); // Increased expectation.
    const executionLog = []; // Array to log execution order.
    const sequencedActor = messageBusFactory.actor(function() {

        return {
            stepA: function(messageContent) {
                console.log(`Executing step A with message: ${messageContent}`);
                testAgent.equal(messageContent, "Greetings!!", "Step A should receive 'Greetings!!'.");
                executionLog.push('stepA');
                // Inject 'stepB' into the queue immediately after 'stepA'.
                this.next("stepB", "Message from A to B");
            },
            stepB: function(messageContent) {
                console.log(`Executing step B with message: ${messageContent}`);
                testAgent.equal(messageContent, "Message from A to B", "Step B should receive message from A.");
                testAgent.equal(executionLog.length, 1, "Execution log should have 1 entry before stepB.");
                testAgent.equal(executionLog[0], 'stepA', "First entry in log should be 'stepA'.");
                executionLog.push('stepB');
            },
            stepC: function(messageContent) { // Added messageContent parameter.
                console.log(`Executing step C with message: ${messageContent || 'no message'}`);
                testAgent.equal(executionLog.length, 2, "Execution log should have 2 entries before stepC.");
                testAgent.equal(executionLog[1], 'stepB', "Second entry in log should be 'stepB'.");
                testAgent.done(); // Complete the test.
            }
        };
    });

    sequencedActor.init(); // Initialize the actor.
    sequencedActor.stepA("Greetings!!"); // Start the chain.
    sequencedActor.stepC(); // Queue step C to run after A and B.
    setupTestGuard(testAgent, 500); // Set a timeout.
};

exports.messageLifecycleHooks = function(scenarioTester) {
    scenarioTester.expect(8); // Expected assertions remain the same.
    const lifecycleAwareActor = messageBusFactory.actor({
        longRunningTask: function(delayMs, asyncHandle) {
            asyncHandle.enable();
            console.log(`Long running task started, delaying for ${delayMs}ms.`);
            setTimeout(() => {
                asyncHandle.reply();
            }, delayMs);
        },
        quickTask: function() {
            console.log("Quick task executed.");
            return; // No explicit return value.
        }
    });

    lifecycleAwareActor.init(); // Initialize the actor.

    let currentActionName = "longRunningTask"; // Track the expected action name.

    // Hook for when a message is received by the actor system.
    lifecycleAwareActor.system.on("messageReceived", (incomingMessage) => {
        console.log(`[Event] Message received: ${incomingMessage.getActionName()}`);
        scenarioTester.ok(incomingMessage !== undefined && incomingMessage !== null, "Incoming message object should be defined.");
        scenarioTester.equal(incomingMessage.getActionName(), currentActionName, `Received message name should match '${currentActionName}'.`);
    });

    // Hook for when a message's processing is completed.
    lifecycleAwareActor.system.on("taskCompleted", (completedMessage) => {
        console.log(`[Event] Task completed: ${completedMessage.getActionName()}`);
        scenarioTester.ok(completedMessage !== undefined && completedMessage !== null, "Completed message object should be defined.");
        scenarioTester.equal(completedMessage.getActionName(), currentActionName, `Completed message name should match '${currentActionName}'.`);
    });

    lifecycleAwareActor.longRunningTask(210, () => { // Slightly adjusted delay.
        console.log("LongRunningTask callback fired.");
        setTimeout(() => {
            currentActionName = "quickTask"; // Update expected name for the next task.
            lifecycleAwareActor.quickTask(() => {
                console.log("QuickTask callback fired.");
                setTimeout(() => {
                    scenarioTester.done(); // Complete the test.
                }, 110); // Slightly adjusted delay.
            });

        }, 110); // Slightly adjusted delay.
    });

    setupTestGuard(scenarioTester, 800); // Set a timeout.
};

exports.actorAsArgumentTest = function(testRunner_drama) {
    testRunner_drama.expect(1); // One assertion expected.
    // The argument of ask should be compatible with drama (nactor's internal mechanism).
    const delegatingActor = messageBusFactory.actor({
        waitForDuration: function(waitMillis, asyncCtrl) {
            asyncCtrl.enable();
            console.log(`DelegatingActor: Waiting for ${waitMillis}ms.`);
            setTimeout(() => {
                asyncCtrl.reply(); // Signal completion.
            }, waitMillis);
        }
    });

    delegatingActor.init(); // Initialize the actor.

    // Call 'ask' with the actor instance itself as the target, then the method name and args.
    delegatingActor.ask(delegatingActor, "waitForDuration", 210, () => { // Slightly adjusted delay.
        console.log("DelegatingActor: waitForDuration callback received.");
        testRunner_drama.ok(true, "Actor.ask with actor instance as target should work."); // Simple success assertion.
        testRunner_drama.done(); // Complete the test.
    });

    setupTestGuard(testRunner_drama, 400); // Set a timeout.
};

exports.messageDisposalTest = function(testContext_dispose) {
    testContext_dispose.expect(3); // Adjusted expected assertions.
    const disposableActor = messageBusFactory.actor({
        longRunningOperation: function(durationMs, asyncOpControl) {
            asyncOpControl.enable();
            console.log(`Long running operation started, scheduled for ${durationMs}ms.`);
            setTimeout(() => {
                // This reply should ideally not be reached if dispose is called.
                console.warn("Long running operation completed, but should have been disposed!");
                asyncOpControl.reply();
            }, durationMs);
        },
        fastOperation: function() {
            console.log("Fast operation executed.");
            return;
        }
    });

    disposableActor.init(); // Initialize the actor.

    let operationIdentifier = "longRunningOperation"; // Expected operation name.

    disposableActor.system.on("taskReceived", (taskMessage) => {
        console.log(`[Event] Task received: ${taskMessage.getTaskName()}`);
        testContext_dispose.ok(taskMessage !== undefined, "Task message object should be defined upon reception.");
        testContext_dispose.equal(taskMessage.getTaskName(), operationIdentifier, `Received task name should match '${operationIdentifier}'.`);

        // Dispose of the message shortly after it's received.
        setTimeout(() => {
            console.log(`Disposing task: ${taskMessage.getTaskName()}`);
            taskMessage.cancel(); // Renamed dispose() to cancel().
        }, 60); // Slightly adjusted delay.
    });

    disposableActor.system.on("taskFinished", (completedMessage) => {
        // This hook should NOT be triggered if the message was disposed.
        console.error(`[Event] Task finished: ${completedMessage.getTaskName()} - THIS SHOULD NOT HAPPEN!`);
        testContext_dispose.ok(false, "TaskFinished event should not be triggered for a disposed message.");
    });

    disposableActor.system.on("taskCancelled", (cancelledMessage) => {
        console.log(`[Event] Task cancelled: ${cancelledMessage.getTaskName()}`);
        testContext_dispose.ok(cancelledMessage !== undefined, "Cancelled message object should be defined.");
        testContext_dispose.equal(cancelledMessage.getTaskName(), operationIdentifier, `Cancelled task name should match '${operationIdentifier}'.`);
        testContext_dispose.done(); // Complete the test here, as disposal is confirmed.
    });

    disposableActor.longRunningOperation(200, () => {
        // This callback should NOT be invoked if the message is disposed.
        console.error("LongRunningOperation callback invoked, but message should have been disposed!");
        testContext_dispose.ok(false, "Long running operation callback should not fire after disposal.");
    });

    setupTestGuard(testContext_dispose, 500); // Set a timeout for the test.
};