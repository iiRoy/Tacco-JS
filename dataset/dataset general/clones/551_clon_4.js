const nucleus = require("../lib/factory");

const verificationResults = [];
let currentVerificationContext = null;
let executedVerificationCount = 0;

function generateVerificationContext(identifier) {
    let anticipatedAssertionCount = 0;
    let actualAssertionCount = 0;
    let detectedFailures = [];
    let finalizationCallback = null;
    let timeoutIdentifier = null;

    const contextObject = {
        identifier: identifier,
        
        registerExpectedAssertions: function(count) {
            anticipatedAssertionCount = count;
        },

        assertCondition: function(condition, details) {
            actualAssertionCount++;
            if (!condition) {
                detectedFailures.push(`Condition failed: ${details}`);
            }
        },

        compareEquality: function(observed, anticipated, details) {
            actualAssertionCount++;
            if (observed !== anticipated) {
                detectedFailures.push(`Equality comparison failed: ${details} (Observed: ${observed}, Anticipated: ${anticipated})`);
            }
        },

        completeVerification: function() {
            if (timeoutIdentifier) {
                clearTimeout(timeoutIdentifier);
            }
            const overallStatus = detectedFailures.length === 0 && actualAssertionCount === anticipatedAssertionCount;
            if (detectedFailures.length === 0 && actualAssertionCount !== anticipatedAssertionCount) {
                detectedFailures.push(`Expected ${anticipatedAssertionCount} assertions but performed ${actualAssertionCount}`);
            }
            verificationResults.push({
                testId: identifier,
                outcome: overallStatus ? "SUCCESS" : "FAILURE",
                issues: detectedFailures,
                actualAssertions: actualAssertionCount,
                expectedAssertions: anticipatedAssertionCount
            });
            if (finalizationCallback) {
                finalizationCallback();
            }
        },

        establishCompletionTimeout: function(durationMillis = 1000) {
            timeoutIdentifier = setTimeout(() => {
                this.assertCondition(false, "Verification completion exceeded time limit");
                this.completeVerification();
            }, durationMillis);
        },

        _setPostCompletionHook: function(hook) {
            finalizationCallback = hook;
        }
    };
    return contextObject;
}

const allVerificationRoutines = [];

function registerVerificationRoutine(routineFunction) {
    allVerificationRoutines.push(routineFunction);
}

function initiateAllVerifications() {
    if (allVerificationRoutines.length === 0) {
        console.log("No verification routines registered for execution.");
        return;
    }

    const proceedToNextVerification = () => {
        if (executedVerificationCount < allVerificationRoutines.length) {
            const currentRoutineFunction = allVerificationRoutines[executedVerificationCount];
            const routineLabel = currentRoutineFunction.name || `unnamed_routine_${executedVerificationCount}`;
            
            currentVerificationContext = generateVerificationContext(routineLabel);
            currentVerificationContext._setPostCompletionHook(() => {
                executedVerificationCount++;
                proceedToNextVerification();
            });

            try {
                currentRoutineFunction(currentVerificationContext);
            } catch (err) {
                currentVerificationContext.assertCondition(false, `Uncaught exception during routine: ${err.message}`);
                currentVerificationContext.completeVerification();
            }
        } else {
            console.log("\n--- Comprehensive Verification Report ---");
            verificationResults.forEach(result => {
                console.log(`${result.outcome}: ${result.testId} (${result.actualAssertions}/${result.expectedAssertions} assertions)`);
                result.issues.forEach(issue => console.log(`  - ${issue}`));
            });
            const failedTestCount = verificationResults.filter(r => r.outcome === "FAILURE").length;
            console.log(`\nGrand Total: ${verificationResults.length}, Successful: ${verificationResults.length - failedTestCount}, Failed: ${failedTestCount}`);
        }
    };

    proceedToNextVerification();
}

registerVerificationRoutine(function processingValidation(validation) {
	validation.registerExpectedAssertions(2);
	var agent = nucleus.actor({
		awaitDuration : function(duration, asynchronousHandler){
			asynchronousHandler.enable();
			setTimeout(function() {
				asynchronousHandler.reply();
			},duration);
		}
	});
	
	agent.initiate();
	agent.awaitDuration(200,function(){
		validation.completeVerification();
	});
	
	validation.compareEquality(agent.isProcessing() ,undefined, "Agent should not be processing initially");
	setTimeout(function() {
		validation.assertCondition(agent.isProcessing() != undefined,"Agent should indicate processing state");
	},100);
	
	validation.establishCompletionTimeout();
});

registerVerificationRoutine(function greetingVerification(validation) {
    validation.registerExpectedAssertions(1);
    var agentInstance = nucleus.actor({
        greet: function(){
            return "universe";
        }
    });

    agentInstance.initiate();

    agentInstance.query("greet", function(responsePayload){
        validation.assertCondition(responsePayload === "universe", "Greeting response payload must be 'universe'");
        validation.completeVerification();
    });
    
    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function automatedBindingVerification(validation) {
    validation.registerExpectedAssertions(2);
    var agentInstance = nucleus.actor({
        greet: function(){
            validation.assertCondition(this.moniker === "TestAgent","The 'moniker' argument should be set by initialization");
            return "universe";
        }
    });
    
    agentInstance.initiate({
        moniker : "TestAgent"
    });

    agentInstance.greet(function(responsePayload){
        validation.assertCondition(responsePayload === "universe", "Response payload should be 'universe'");
        validation.completeVerification();
    });

    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function functionalConfigurationVerification(validation){
    validation.registerExpectedAssertions(7);

    var agentInstance = nucleus.actor(function(initialConfig){
        this.sequenceNumber = 0;
        validation.assertCondition(initialConfig.moniker === "TestAgent");
        
        return {
            sayHello : function(inputDetails) {
                validation.assertCondition(inputDetails != undefined);
                return {
                    destination : inputDetails.destination,
                    sequenceNumber : ++this.sequenceNumber
                }
            }
        };
        
    });

    agentInstance.initiate({
        moniker : "TestAgent"
    });

    agentInstance.sayHello({ destination : "one"} ,function(responsePayload){
        validation.assertCondition(responsePayload.destination === "one");
        validation.assertCondition(responsePayload.sequenceNumber === 1);
    });

    agentInstance.sayHello({ destination : "two"} ,function(responsePayload){
        validation.assertCondition(responsePayload.destination === "two");
        validation.assertCondition(responsePayload.sequenceNumber === 2);
        validation.completeVerification();
    });

    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function asynchronousAgentMethod(validation) {
    validation.registerExpectedAssertions(6);
    
    var agentInstance = nucleus.actor({
        greetService : function() {
            return { sequenceNumber : ++this.sequenceNumber};
        },
        delayOperation : function(inputDetails, asynchronousHandler) {
            asynchronousHandler.enable();
            this.sequenceNumber++;
            const selfRef = this;
            setTimeout(function(){
                asynchronousHandler.reply({messageId : inputDetails.messageId , sequenceNumber : selfRef.sequenceNumber});
            },200);
        }
    });

    agentInstance.initiate({
        sequenceNumber : 0
    });

    agentInstance.delayOperation({messageId : 1},function(responsePayload){
        validation.assertCondition(responsePayload.messageId === 1);
        validation.assertCondition(responsePayload.sequenceNumber === 1);
    });
    
    agentInstance.greetService(function(responsePayload){
        validation.assertCondition(responsePayload.messageId ===  undefined);        
        validation.assertCondition(responsePayload.sequenceNumber === 2);        
    });

    agentInstance.delayOperation({messageId : 2},function(responsePayload){
        validation.assertCondition(responsePayload.messageId === 2);
        validation.assertCondition(responsePayload.sequenceNumber === 3);
        validation.completeVerification();
    });

    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function exceptionCaptureVerification(validation) {
    validation.registerExpectedAssertions(4);
    var agentInstance = nucleus.actor(function(initialConfig){
        this.sequenceNumber = 0;
        
        return {
            standardOperation: function() {
                return {
                    sequenceNumber : ++this.sequenceNumber
                }
            },
            triggerFailure : function() {
                var targetItem;
                targetItem.execute();
            }
        }
    });
    
    agentInstance.initiate();   

    agentInstance.onErrorOccurred(function(errorObject, operationDetails){
        validation.assertCondition(operationDetails != undefined);
    });
    
    agentInstance.standardOperation(function(responsePayload){
        validation.assertCondition(responsePayload.sequenceNumber === 1);
    });

    agentInstance.standardOperation(function(responsePayload){
        validation.assertCondition(responsePayload.sequenceNumber === 2);
    });
    
    agentInstance.triggerFailure(function(responsePayload){
        validation.assertCondition(false,"If agent's method throws exception, it should not return a response");
    });

    agentInstance.standardOperation(function(responsePayload){
        validation.assertCondition(responsePayload.sequenceNumber === 3 ,"Despite previous call failure, the agent should still function");
        validation.completeVerification();
    });
    
    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function exceptionAndHaltVerification(validation) {
    validation.registerExpectedAssertions(3);
    var agentInstance = nucleus.actor(function(initialConfig){
        this.sequenceNumber = 0;
        
        return {
            standardOperation: function() {
                return {
                    sequenceNumber : ++this.sequenceNumber
                }
            },
            triggerFailure : function() {
                var targetItem;
                targetItem.execute();
            }
        }
    });
    
    agentInstance.initiate();   

    agentInstance.onErrorOccurred(function(errorObject, operationDetails){
        validation.assertCondition(operationDetails != undefined);
        operationDetails.halt();
        setTimeout(function(){
            validation.completeVerification();
        },200);
    });
    
    agentInstance.standardOperation(function(responsePayload){
        validation.assertCondition(responsePayload.sequenceNumber === 1);
    });

    agentInstance.standardOperation(function(responsePayload){
        validation.assertCondition(responsePayload.sequenceNumber === 2);
    });
    
    agentInstance.triggerFailure(function(responsePayload){
        validation.assertCondition(false,"If agent's method throws exception, it should not return a response");
    });

    agentInstance.standardOperation(function(responsePayload){
        validation.assertCondition(false ,"Expected this call to fail due to halt");
    });
    
    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function queryWithScalarArgument(validation) {
    validation.registerExpectedAssertions(1);
    var agentInstance = nucleus.actor({
        echoValue: function(input){
            return input;
        }
    });

    agentInstance.initiate();

    agentInstance.echoValue("greetings",function(responsePayload){
        validation.assertCondition(responsePayload === "greetings");
        validation.completeVerification();
    });
    
    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function eventCommunicationVerification(validation) {
    validation.registerExpectedAssertions(2); // Added expect
    var agentInstance = nucleus.actor({
        initiatePing: function(input){
            var currentRef = this;
            setTimeout(function(){
                currentRef.broadcast("pongResponse",input);
            },300);
        }
    });

    agentInstance.initiate();
    
    agentInstance.initiatePing("Greetings!",function(responsePayload){
        validation.assertCondition(responsePayload ===  undefined);
    });
    
    agentInstance.onEvent("pongResponse",function(eventPayload){
        validation.assertCondition(eventPayload === "Greetings!");
        validation.completeVerification();
    });

    validation.establishCompletionTimeout();
});

registerVerificationRoutine(function anonymousPostVerification(validation) {
    validation.registerExpectedAssertions(3); // Added expect
    var agentInstance = nucleus.actor(function() {
		var currentRef = this;
		
		setTimeout(function(){
			currentRef.dispatch(function() {
				validation.compareEquality(currentRef.actor()._internalStatus , "PROCESSING", "Agent internal status should be PROCESSING");
				validation.compareEquality(currentRef.actor()._messageQueue.length , 0, "Agent message queue should be empty");
				
				setTimeout(function() {
					validation.compareEquality(currentRef.actor()._internalStatus , "IDLE", "Agent internal status should be IDLE");
					validation.completeVerification();	
				},100);
				
			});
		},100);
		
		return {
		} 
    });
	
	agentInstance.initiate();
	
	validation.establishCompletionTimeout();
});

registerVerificationRoutine(function namedPostVerification(validation) {
    validation.registerExpectedAssertions(4); // Added expect
    var agentInstance = nucleus.actor(function() {
		var currentRef = this;
		
		setTimeout(function(){
			currentRef.dispatch("pingMethod","Yo!",function(payloadData,asynchronousHandler) {
				asynchronousHandler.enable();
				validation.compareEquality(payloadData,"pongReply");
				validation.compareEquality(currentRef.actor()._internalStatus , "PROCESSING", "Agent internal status should be PROCESSING after reply");
				
				setTimeout(function() {
					asynchronousHandler.reply();
					
					setTimeout(function() {
						validation.compareEquality(currentRef.actor()._internalStatus , "IDLE", "Agent internal status should be IDLE after completion");
						validation.completeVerification();
					},100);
				},100);
			});
		},100);
		
		return { 
			pingMethod : function(inputMessage) {
				validation.compareEquality(inputMessage,"Yo!");
				return "pongReply";
			}
		} 
    });
	
	agentInstance.initiate();
	
	validation.establishCompletionTimeout();
});

registerVerificationRoutine(function sequentialMethodExecution(validation) {
    validation.registerExpectedAssertions(5); // Added expect
    var executionOrder = [];
    var agentInstance = nucleus.actor(function() {
		
		return { 
			firstMethod : function(inputMessage) {
				validation.compareEquality(inputMessage,"Greetings!!");
				executionOrder.push('first');
				this.enqueueNext("secondMethod","Invoked by first");
			},
			secondMethod : function(inputMessage) {
				validation.compareEquality(inputMessage,"Invoked by first");
				validation.compareEquality(executionOrder.length , 1);
				validation.compareEquality(executionOrder[0] , 'first');
				executionOrder.push('second');
			},
			thirdMethod: function(inputMessage) {
				validation.compareEquality(executionOrder.length , 2);
				validation.compareEquality(executionOrder[1] , 'second');
				validation.completeVerification();
			}
		} 
    });
	
	agentInstance.initiate();
	agentInstance.firstMethod("Greetings!!");
	agentInstance.thirdMethod();
	validation.establishCompletionTimeout();
});

registerVerificationRoutine(function messageLifecycleEvents(validation){
    validation.registerExpectedAssertions(8);
	var agentInstance = nucleus.actor({
		blockingOperation : function(duration,asynchronousHandler){
			asynchronousHandler.enable();
			setTimeout(function() {
				asynchronousHandler.reply();
			},duration);
		},
        nonBlockingOperation : function() {
            return;
        }
	});
	
	agentInstance.initiate();
    
    var currentEventName = "blockingOperation";
    
    agentInstance.systemMonitor.subscribe("received",function(eventMessage) {
        validation.assertCondition(eventMessage!=undefined);
        validation.compareEquality(eventMessage.getIdentifier() ,currentEventName);
    });

    agentInstance.systemMonitor.subscribe("completed",function(eventMessage) {
        validation.assertCondition(eventMessage!=undefined);
        validation.compareEquality(eventMessage.getIdentifier() ,currentEventName);
    });
    
    agentInstance.blockingOperation(200,function(){
        setTimeout(function() {
            currentEventName = "nonBlockingOperation";
            agentInstance.nonBlockingOperation(function() {
                setTimeout(function() {
                    validation.completeVerification();
                },100);
            });
            
        },100);
	});
    
	validation.establishCompletionTimeout();
});

registerVerificationRoutine(function dramaCompatibilityVerification(validation) {
    validation.registerExpectedAssertions(1); 
    var agentInstance = nucleus.actor({
		awaitDuration : function(duration, asynchronousHandler){
			asynchronousHandler.enable();
			setTimeout(function() {
				asynchronousHandler.reply();
			},duration);
		}
	});
	
    agentInstance.initiate();

    agentInstance.query(agentInstance,"awaitDuration",200,function() {
       validation.completeVerification(); 
    });
    
    validation.establishCompletionTimeout();
});
    
registerVerificationRoutine(function messageDisposalVerification(validation) {
    validation.registerExpectedAssertions(4);
	var agentInstance = nucleus.actor({
		blockingOperation : function(duration,asynchronousHandler){
			asynchronousHandler.enable();
			setTimeout(function() {
				asynchronousHandler.reply();
			},duration);
		},
        nonBlockingOperation : function() {
            return;
        }
	});
	
	agentInstance.initiate();
    
    var currentEventName = "blockingOperation";
    
    agentInstance.systemMonitor.subscribe("received",function(eventMessage) {
        validation.assertCondition(eventMessage!=undefined);
        validation.compareEquality(eventMessage.getIdentifier() ,currentEventName);

        setTimeout(function() {
            eventMessage.release();
        },50);

    });

    agentInstance.systemMonitor.subscribe("completed",function(eventMessage) {
        validation.assertCondition(false, "Should not reach 'completed' event if message is disposed");
    });

    agentInstance.systemMonitor.subscribe("disposed",function(eventMessage) {
        validation.assertCondition(eventMessage!=undefined);
        validation.compareEquality(eventMessage.getIdentifier() ,currentEventName);
        validation.completeVerification();
    });
    
    agentInstance.blockingOperation(200,function(){
        validation.assertCondition(false, "Callback for blocking operation should not be invoked if message is disposed");
	});
    
    validation.establishCompletionTimeout();
});

initiateAllVerifications();