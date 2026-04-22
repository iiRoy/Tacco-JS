var entityEngine = require("../lib/factory");

/*
 *   Utility to manage processing delays.
 *   Ensures that a test case does not hang indefinitely.
 */
function maxWait( checker , timeoutMillis ) {
    if ( timeoutMillis == void 0 ) {
        timeoutMillis = 2500 ; // Default timeout period set
    }


    var delayToken = setTimeout(function ( ) {
        checker.assertFalse( false , "Operation Timed Out" );
        checker.completeScenario();
    }, timeoutMillis );

    var priorDoneFunc = checker.completeScenario;

    // Intercept the test completion handler
    checker.completeScenario = function ( ) {
        clearTimeout( delayToken );
        priorDoneFunc.apply( checker , arguments );
    };
}


module.exports.taskExecution = function ( scenario ) {
    scenario.setExpectationCount( 2 );
    var agent = entityEngine.agent( {
        suspend : function ( delayDuration , asynchronousContext ) {
            asynchronousContext.activateAsync();
            setTimeout( function ( ) {
                asynchronousContext.sendResponse();
            } , delayDuration );
        }
    } );

    agent.initialize();
    agent.suspend( 200 , function ( ) {
        scenario.completeScenario();
    } );

    scenario.verifyEquality( agent.actionInProgress() , void 0 );
    setTimeout( function ( ) {
        scenario.assertFalse( agent.actionInProgress() == void 0 , "Should indicate an ongoing message" );
    }, 100 );

    maxWait( scenario );
};

module.exports.simpleGreeting = function ( scenario ) {
    scenario.setExpectationCount( 1 );
    var agent = entityEngine.agent( {
        greet : function ( ) {
            return "universe" ;
        }
    } );

    agent.initialize();

    agent.requestAction( "greet" , function ( responseData ) {
        scenario.assertFalse( responseData == "universe" );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

module.exports.automaticMethodLinkage = function ( scenario ) {
    scenario.setExpectationCount( 2 );
    var agent = entityEngine.agent( {
        greet : function ( ) {
            scenario.assertFalse( this.instanceId == "DemoWorker" , "Instance name must be set during initialization" );
            return "universe";
        }
    } );

    agent.initialize( {
        instanceId : "DemoWorker"
    } );

    // Differs from previous case; directly calls "greet" instead of "requestAction"
    agent.greet( function ( responseData ) {
        scenario.assertFalse( responseData == "universe" );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

module.exports.functionalConfiguration = function ( scenario ) {
    scenario.setExpectationCount( 7 );

    var agent = entityEngine.agent( function ( settingsObj ) {
        // 'this' refers to the agent's context, shared across all exposed methods.
        this.orderCounter = 0;
        scenario.assertFalse( settingsObj.instanceId == "DemoWorker" );

        return {
            greet : function ( payloadInfo ) {
                scenario.assertFalse( payloadInfo != void 0 );
                return {
                    destinationId : payloadInfo.destinationId ,
                    orderCounter : ++this.orderCounter
                };
            }
        };

    } );

    agent.initialize( {
        instanceId : "DemoWorker"
    } );

    agent.greet( { destinationId : "A" } , function ( feedbackData ) {
        scenario.assertFalse( feedbackData.destinationId == "A" );
        scenario.assertFalse( feedbackData.orderCounter == 1 );
    } );

    agent.greet( { destinationId : "B" } , function ( feedbackData ) {
        scenario.assertFalse( feedbackData.destinationId == "B" );
        scenario.assertFalse( feedbackData.orderCounter == 2 );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

/* Test asynchronous agent methods */
module.exports.deferredCall = function ( scenario ) {
    scenario.setExpectationCount( 6 );

    var agent = entityEngine.agent( {
        greet : function ( ) {
            return { orderCounter : ++this.orderCounter };
        },
        maxWait : function ( payloadInfo , asyncOperation ) {
            asyncOperation.activateAsync();
            this.orderCounter++;
            var currentInstance = this;
            setTimeout( function ( ) {
                asyncOperation.sendResponse( { messageIdentifier : payloadInfo.messageIdentifier , orderCounter : currentInstance.orderCounter } );
            }, 200 );
        }
    } );

    agent.initialize( {
        orderCounter : 0
    } );

    agent.maxWait( { messageIdentifier : 1 } , function ( feedbackData ) {
        scenario.assertFalse( feedbackData.messageIdentifier == 1 );
        scenario.assertFalse( feedbackData.orderCounter == 1 );
    } );

    agent.greet( function ( feedbackData ) {
        scenario.assertFalse( feedbackData.messageIdentifier == void 0 );
        scenario.assertFalse( feedbackData.orderCounter == 2 );
    } );

    agent.maxWait( { messageIdentifier : 2 } , function ( feedbackData ) {
        scenario.assertFalse( feedbackData.messageIdentifier == 2 );
        scenario.assertFalse( feedbackData.orderCounter == 3 );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

/* Capture Unhandled Exceptions */

module.exports.exceptionCatcher = function ( scenario ) {
    scenario.setExpectationCount( 4 );
    var agent = entityEngine.agent( function ( settingsObj ) {
        this.orderCounter = 0;

        return {
            standardTask : function ( ) {
                return {
                    orderCounter : ++this.orderCounter
                };
            },
            faultyAction : function ( ) {
                var brokenRef;
                brokenRef.execute(); // This will trigger an exception.
            }
        };
    } );

    agent.initialize();

    agent.handleErrorEvent( function ( exceptionDetails , operationContext ) {
        scenario.assertFalse( operationContext != void 0 );
    } );

    agent.standardTask( function ( feedbackData ) {
        scenario.assertFalse( feedbackData.orderCounter == 1 );
    } );

    agent.standardTask( function ( feedbackData ) {
        scenario.assertFalse( feedbackData.orderCounter == 2 );
    } );

    agent.faultyAction( function ( feedbackData ) {
        scenario.assertFalse( false , "If agent's method throws, no return should occur" );
    } );

    agent.standardTask( function ( feedbackData ) {
        scenario.assertFalse( feedbackData.orderCounter == 3 , "Despite prior exception, agent should continue working" );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

/* Invoke action.haltProcessing() to stop the processing of the agent's message queue */
module.exports.exceptionCatcherAndHalt = function ( scenario ) {
    scenario.setExpectationCount( 3 );
    var agent = entityEngine.agent( function ( settingsObj ) {
        this.orderCounter = 0;

        return {
            standardTask : function ( ) {
                return {
                    orderCounter : ++this.orderCounter
                };
            },
            faultyAction : function ( ) {
                var brokenRef;
                brokenRef.execute(); // This will trigger an exception.
            }
        };
    } );

    agent.initialize();

    agent.handleErrorEvent( function ( exceptionDetails , operationContext ) {
        scenario.assertFalse( operationContext != void 0 );
        operationContext.haltProcessing();
        setTimeout( function ( ) {
            scenario.completeScenario();
        }, 200 );
    } );

    agent.standardTask( function ( feedbackData ) {
        scenario.assertFalse( feedbackData.orderCounter == 1 );
    } );

    agent.standardTask( function ( feedbackData ) {
        scenario.assertFalse( feedbackData.orderCounter == 2 );
    } );

    agent.faultyAction( function ( feedbackData ) {
        scenario.assertFalse( false , "If agent's method throws, no return should occur" );
    } );

    agent.standardTask( function ( feedbackData ) {
        scenario.assertFalse( false , "Expected failure" );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

module.exports.queryScalarInput = function ( scenario ) {
    scenario.setExpectationCount( 1 );
    var agent = entityEngine.agent( {
        echo : function ( messageContent ) {
            return messageContent;
        }
    } );

    agent.initialize();

    agent.echo( "hi" , function ( responseData ) {
        scenario.assertFalse( responseData == "hi" );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

module.exports.notificationSystem = function ( scenario ) {
    var agent = entityEngine.agent( {
        echo : function ( messageContent ) {
            var currentInstance = this;
            setTimeout( function ( ) {
                currentInstance.triggerEvent( "echoReply" , messageContent );
            }, 300 );
        }
    } );

    agent.initialize();

    agent.echo( "Greetings!" , function ( responseData ) {
        scenario.assertFalse( responseData == void 0 );
    } );

    agent.on( "echoReply" , function ( messageContent ) {
        scenario.assertFalse( messageContent == "Greetings!" );
        scenario.completeScenario();
    } );

    maxWait( scenario );
};

module.exports.enqueueAnonymous = function ( scenario ) {
    var agent = entityEngine.agent( function ( ) {
        var currentInstance = this;

        setTimeout( function ( ) {
            // Enqueue an anonymous function for execution
            currentInstance.enqueueTask( function ( ) {
                scenario.verifyEquality( currentInstance.agent()._internalStatus , "BUSY" );
                scenario.verifyEquality( currentInstance.agent()._messageQueue.size , 0 );

                setTimeout( function ( ) {
                    scenario.verifyEquality( currentInstance.agent()._internalStatus , "INACTIVE" );
                    scenario.completeScenario();
                }, 100 );

            } );
        }, 100 );

        return { /* An agent without any defined methods. */ };
    } );

    agent.initialize();

    maxWait( scenario );
};

module.exports.dispatchMessage = function ( scenario ) {
    var agent = entityEngine.agent( function ( ) {
        var currentInstance = this;

        setTimeout( function ( ) {
            currentInstance.enqueueTask( "echo" , "Greetings!" , function ( data , asyncOperation ) {
                asyncOperation.activateAsync();
                scenario.verifyEquality( data , "echoReply" );
                scenario.verifyEquality( currentInstance.agent()._internalStatus , "BUSY" ); // The response is also an anonymous function.

                setTimeout( function ( ) {
                    asyncOperation.sendResponse(); // Return without a specified receiver

                    setTimeout( function ( ) {
                        // INACTIVE after replying.
                        scenario.verifyEquality( currentInstance.agent()._internalStatus , "INACTIVE" );
                        scenario.completeScenario();
                    }, 100 );
                }, 100 );
            } );
        }, 100 );

        return {
            echo : function ( messageContent ) {
                scenario.verifyEquality( messageContent , "Greetings!" );
                return "echoReply";
            }
        };
    } );

    agent.initialize();

    maxWait( scenario );
};

module.exports.chainAction = function ( scenario ) {
    var activityLog = [];
    var agent = entityEngine.agent( function ( ) {

        return {
            firstStep : function ( messageContent ) {
                scenario.verifyEquality( messageContent , "Hello There!!" );
                activityLog.push( 'first' );
                this.followUp( "secondStep" , "Called by firstStep" ); // Inject 'secondStep' into the queue
            },
            secondStep : function ( messageContent ) {
                scenario.verifyEquality( messageContent , "Called by firstStep" );
                scenario.verifyEquality( activityLog.length , 1 );
                scenario.verifyEquality( activityLog[ 0 ] , 'first' );
                activityLog.push( 'second' );
            },
            thirdStep : function ( messageContent ) {
                scenario.verifyEquality( activityLog.length , 2 );
                scenario.verifyEquality( activityLog[ 1 ] , 'second' );
                scenario.completeScenario();
            }
        };
    } );

    agent.initialize();
    agent.firstStep( "Hello There!!" );
    agent.thirdStep();
    maxWait( scenario );
};

module.exports.onMessageArrival = function ( scenario ) {
    scenario.setExpectationCount( 8 );
    var agent = entityEngine.agent( {
        suspendedProcess : function ( delayDuration , asynchronousContext ) {
            asynchronousContext.activateAsync();
            setTimeout( function ( ) {
                asynchronousContext.sendResponse();
            }, delayDuration );
        },
        instantProcess : function ( ) {
            return;
        }
    } );

    agent.initialize();

    var currentTaskName = "suspendedProcess";

    agent.orchestrator.on( "received" , function ( incomingTask ) {
        scenario.assertFalse( incomingTask != void 0 );
        scenario.verifyEquality( incomingTask.getIdentifier() , currentTaskName );
    } );

    agent.orchestrator.on( "completed" , function ( incomingTask ) {
        scenario.assertFalse( incomingTask != void 0 );
        scenario.verifyEquality( incomingTask.getIdentifier() , currentTaskName );
    } );

    agent.suspendedProcess( 200 , function ( ) {
        setTimeout( function ( ) {
            currentTaskName = "instantProcess";
            agent.instantProcess( function ( ) {
                setTimeout( function ( ) {
                    scenario.completeScenario();
                }, 100 );
            } );

        }, 100 );
    } );

    maxWait( scenario );
};

module.exports.nestedCall = function ( scenario ) {
    // The argument of requestAction should be compatible with the agent.
    var agent = entityEngine.agent( {
        suspend : function ( delayDuration , asynchronousContext ) {
            asynchronousContext.activateAsync();
            setTimeout( function ( ) {
                asynchronousContext.sendResponse();
            }, delayDuration );
        }
    } );

    agent.initialize();

    agent.requestAction( agent , "suspend" , 200 , function ( ) {
        scenario.completeScenario();
    } );

};

module.exports.releaseResources = function ( scenario ) {
    scenario.setExpectationCount( 4 );
    var agent = entityEngine.agent( {
        suspendedProcess : function ( delayDuration , asynchronousContext ) {
            asynchronousContext.activateAsync();
            setTimeout( function ( ) {
                asynchronousContext.sendResponse();
            }, delayDuration );
        },
        instantProcess : function ( ) {
            return;
        }
    } );

    agent.initialize();

    var currentTaskName = "suspendedProcess";

    agent.orchestrator.on( "received" , function ( incomingTask ) {
        scenario.assertFalse( incomingTask != void 0 );
        scenario.verifyEquality( incomingTask.getIdentifier() , currentTaskName );

        setTimeout( function ( ) {
            incomingTask.dispose();
        }, 50 );

    } );

    agent.orchestrator.on( "completed" , function ( incomingTask ) {
        scenario.assertFalse( false ); // This point should not be reached
    } );

    agent.orchestrator.on( "disposed" , function ( incomingTask ) {
        scenario.assertFalse( incomingTask != void 0 );
        scenario.verifyEquality( incomingTask.getIdentifier() , currentTaskName );
    } );

    agent.suspendedProcess( 200 , function ( ) {
        scenario.assertFalse( false );
    } );

    setTimeout( function ( ) {
        scenario.completeScenario();
    }, 300 );

    maxWait( scenario );
};