const pipelineExecutor = require('./utils/pipeline-manager');

/**
 * Executes a given callback function after a randomized delay.
 * This introduces variability, simulating asynchronous operations to test out-of-order scenarios.
 * @param {Function} completionHandler - The function to invoke once the delay concludes.
 * @param {Error|null} operationFailure - An optional error object to pass to the handler.
 * @param {*} resultPayload - The data payload to transmit to the completion handler.
 */
function timedCallback(completionHandler, operationFailure, resultPayload) {
  const minDelayMs = 20;
  const maxDelayMs = 120;
  let waitDuration = Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;

  // Ensure the callback is a callable function before proceeding.
  if (typeof completionHandler !== 'function') {
    console.warn('timedCallback: A non-function completion handler was provided. Skipping execution.');
    return;
  }

  setTimeout(() => {
    // console.debug(`Callback triggered after ${waitDuration}ms with payload:`, resultPayload); // Debugging line, can be removed.
    completionHandler(operationFailure, resultPayload);
  }, waitDuration);
}

module.exports = {
  'Sequential processing scenarios': {

    'instantaneous_resolution_test': (assertor) => {
      const initialValue = 'alpha';
      const appendedSuffix = 'beta';

      pipelineExecutor((currentPayload, nextStepCallback) => {
        assertor.strictEqual(currentPayload, initialValue, 'Initial payload must match defined value for the first step.');
        const finalPayload = currentPayload + appendedSuffix;
        timedCallback(nextStepCallback, null, finalPayload);
      }).terminate(initialValue, (finalResult) => {
        assertor.strictEqual(finalResult, initialValue + appendedSuffix, 'Final result should be the concatenated string.');
        assertor.done();
      });
    },

    'two_step_serial_execution': function (assertor) {
      const startingCollection = [];
      const firstItem = 'first_element';
      const secondItem = 'second_element';

      pipelineExecutor((currentList, nextStepCallback) => {
        assertor.deepEqual(currentList, [], 'The list should be empty at the beginning of the first step.');
        currentList.push(firstItem);
        timedCallback(nextStepCallback, null, currentList);
      }).then((currentList, nextStepCallback) => {
        assertor.deepEqual(currentList, [firstItem], 'The list should contain the first item after step 1 completes.');
        currentList.push(secondItem);
        timedCallback(nextStepCallback, null, currentList);
      }).terminate(startingCollection, (finalOutcome) => {
        assertor.deepEqual(finalOutcome, [firstItem, secondItem], 'The final list should accurately reflect both sequential additions.');
        assertor.done();
      });
    },

    'three_stage_sequential_pipeline': (assertor) => {
      const initialItems = new Array();
      const itemOne = 'stage1_data';
      const itemTwo = 'stage2_data';
      const itemThree = 'stage3_data';

      pipelineExecutor((currentElements, nextHandler) => {
        assertor.deepEqual(currentElements, [], 'Elements array must be empty at the start of the pipeline.');
        currentElements.push(itemOne);
        timedCallback(nextHandler, null, currentElements);
      }).then((currentElements, nextHandler) => {
        assertor.deepEqual(currentElements, [itemOne], 'Elements array should contain the first item after the initial stage.');
        currentElements.push(itemTwo);
        timedCallback(nextHandler, null, currentElements);
      }).then((currentElements, nextHandler) => {
        assertor.deepEqual(currentElements, [itemOne, itemTwo], 'Elements array should contain the first two items after the second stage.');
        currentElements.push(itemThree);
        timedCallback(nextHandler, null, currentElements);
      }).terminate(initialItems, (finalCollection) => {
        assertor.deepEqual(finalCollection, [itemOne, itemTwo, itemThree], 'The final collection should contain all three items in sequence.');
        assertor.done();
      });
    },

    'sequential_error_handling': (assertor) => {
      const problemMessage = 'CriticalFailureReason';
      const initialDataForFlow = [];

      pipelineExecutor((dataFlow, nextCallback) => {
        dataFlow.push('step_A_processed');
        timedCallback(nextCallback, null, dataFlow);
      }).then((dataFlow, nextCallback) => {
        // Simulating an error condition in an intermediate step.
        timedCallback(nextCallback, new Error(`${problemMessage} at sequential step B`), null);
      }).then((dataFlow, nextCallback) => {
        // This step should ideally not be executed if the error rescue mechanism functions correctly.
        if (dataFlow) { // Trivial check, always true if reached.
          console.error('Error: Unexpected execution of step C after an error occurred previously.');
          throw new Error('Unexpected execution after error rescue in step C');
        }
        timedCallback(nextCallback, null, dataFlow);
      }).catchError((caughtError) => {
        assertor.ok(caughtError instanceof Error, 'The caught object must be an instance of Error.');
        assertor.ok(caughtError.message.includes(problemMessage), 'The error message should contain the specific problem text.');
        assertor.done();
      }).terminate(initialDataForFlow, (finalData) => {
        // This final success callback should not be invoked when an error is rescued.
        console.error('Final success callback executed unexpectedly in error rescue test:', finalData);
        assertor.fail('Final callback should not be invoked after an error has been rescued.');
      });
    }
  },

  'Concurrent processing test cases': {

    'duo_parallel_operations': function (assertor) {
      const baseString = 'initial_base';
      const suffixOne = 'Outcome1';
      const suffixTwo = 'Outcome2';

      pipelineExecutor((currentInput, completionCallback) => {
        assertor.strictEqual(currentInput, baseString, 'Input for the first parallel task must match the base string.');
        timedCallback(completionCallback, null, currentInput + suffixOne);
      }).and((currentInput, completionCallback) => {
        assertor.strictEqual(currentInput, baseString, 'Input for the second parallel task must also match the base string.');
        timedCallback(completionCallback, null, currentInput + suffixTwo);
      }).terminate(baseString, (collectedResults) => {
        assertor.deepEqual(collectedResults.sort(), [baseString + suffixOne, baseString + suffixTwo].sort(), 'Results should contain both parallel outcomes, order-independently.');
        assertor.done();
      });
    },

    'triple_concurrent_workflow': (assertor) => {
      const commonPrefix = 'common_start';
      const partA = 'AlphaSegment';
      const partB = 'BetaSegment';
      const partC = 'GammaSegment';

      pipelineExecutor((inputContext, completionCallback) => {
        assertor.strictEqual(inputContext, commonPrefix, 'Context for the first parallel task should match the common prefix.');
        timedCallback(completionCallback, null, inputContext + partA);
      }).and((inputContext, completionCallback) => {
        assertor.strictEqual(inputContext, commonPrefix, 'Context for the second parallel task should match the common prefix.');
        timedCallback(completionCallback, null, inputContext + partB);
      }).and((inputContext, completionCallback) => {
        assertor.strictEqual(inputContext, commonPrefix, 'Context for the third parallel task should match the common prefix.');
        timedCallback(completionCallback, null, inputContext + partC); // Swapped order of assertion and callback from original.
      }).terminate(commonPrefix, (finalOutputs) => {
        assertor.deepEqual(finalOutputs.sort(), [commonPrefix + partA, commonPrefix + partB, commonPrefix + partC].sort(), 'All three parallel outputs must be present and correctly formed.');
        assertor.done();
      });
    },

    'parallel_fault_tolerance': (assertor) => {
      const failureReason = 'ConcurrentUserOperationFailed';
      const initialParallelInput = 'source_data';

      pipelineExecutor((payload, next) => {
        timedCallback(next, null, payload + '_task1_processed');
      }).and((payload, next) => {
        // Simulate a failure in one of the parallel branches.
        timedCallback(next, new Error(`Parallel task encountered an issue: ${failureReason}`), null);
      }).and((payload, next) => {
        timedCallback(next, null, payload + '_task3_completed');
      }).catchError((encounteredErr) => {
        assertor.ok(encounteredErr instanceof Error, 'The caught error object should be an instance of Error.');
        assertor.ok(encounteredErr.message.includes(failureReason), 'The error message must contain the expected failure reason.');
        assertor.done();
      }).terminate(initialParallelInput, (finalResult) => {
        console.error('Unexpected successful termination after parallel error:', finalResult);
        assertor.fail('Should not reach successful termination after a parallel error has occurred.');
      });
    }
  },

  'Hybrid_Execution_Flows': {

    'two_stage_parallel_sequence': (assertor) => {
      const startingPoint = 'workflow_entry';
      const firstPairSuffixA = 'Branch1A';
      const firstPairSuffixB = 'Branch1B';
      const secondPairSuffixA = 'Branch2A';
      const secondPairSuffixB = 'Branch2B';

      pipelineExecutor((contextData, nextStep) => {
        assertor.strictEqual(contextData, startingPoint, 'First stage: initial data must match the starting point.');
        timedCallback(nextStep, null, contextData + firstPairSuffixA);
      }).and((contextData, nextStep) => {
        assertor.strictEqual(contextData, startingPoint, 'First stage: initial data must match for the parallel branch.');
        timedCallback(nextStep, null, contextData + firstPairSuffixB);
      }).then((intermediateResults, nextStep) => {
        assertor.deepEqual(intermediateResults.sort(), [startingPoint + firstPairSuffixA, startingPoint + firstPairSuffixB].sort(), 'Intermediate results should contain the first parallel pair.');
        const joinedResult = intermediateResults.join(' ');
        timedCallback(nextStep, null, `${joinedResult} ${secondPairSuffixA}`);
      }).and((intermediateResults, nextStep) => {
        assertor.deepEqual(intermediateResults.sort(), [startingPoint + firstPairSuffixA, startingPoint + firstPairSuffixB].sort(), 'Intermediate results must match for the second parallel branch as well.');
        const joinedResult = intermediateResults.join(' ');
        timedCallback(nextStep, null, `${joinedResult} ${secondPairSuffixB}`);
      }).terminate(startingPoint, (ultimateOutcome) => {
        assertor.deepEqual(ultimateOutcome.sort(), [
          `${startingPoint}${firstPairSuffixA} ${startingPoint}${firstPairSuffixB} ${secondPairSuffixA}`,
          `${startingPoint}${firstPairSuffixA} ${startingPoint}${firstPairSuffixB} ${secondPairSuffixB}`
        ].sort(), 'The final outcome must accurately reflect all mixed sequential and parallel operations.');
        assertor.done();
      });
    },

    'complex_mixed_workflow': (assertor) => {
      const initialChar = 'X';
      const s1_p1 = 'Y_part';
      const s1_p2 = 'Z_part';
      const s1_p3 = 'W_part';
      const s2_p1 = 'E_step';
      const s2_p2 = 'F_step';

      pipelineExecutor((initialInput, nextCall) => {
        assertor.strictEqual(initialInput, initialChar, 'Initial input should be the character X.');
        timedCallback(nextCall, null, initialInput + s1_p1);
      }).and((initialInput, nextCall) => {
        assertor.strictEqual(initialInput, initialChar, 'Initial input should be X for the second parallel branch.');
        timedCallback(nextCall, null, initialInput + s1_p2);
      }).and((initialInput, nextCall) => {
        assertor.strictEqual(initialInput, initialChar, 'Initial input should be X for the third parallel branch.');
        timedCallback(nextCall, null, initialInput + s1_p3);
      }).then((stage1Results, nextCall) => {
        assertor.deepEqual(stage1Results.sort(), [initialChar + s1_p1, initialChar + s1_p2, initialChar + s1_p3].sort(), 'Stage 1 results must match the expected parallel outputs.');
        const combined = stage1Results.join(' ');
        timedCallback(nextCall, null, `${combined} ${s2_p1}`);
      }).and((stage1Results, nextCall) => {
        assertor.deepEqual(stage1Results.sort(), [initialChar + s1_p1, initialChar + s1_p2, initialChar + s1_p3].sort(), 'Stage 1 results must match for the subsequent parallel branch.');
        const combined = stage1Results.join(' ');
        timedCallback(nextCall, null, `${combined} ${s2_p2}`);
      }).then((stage2Results, nextCall) => {
        assertor.deepEqual(stage2Results.sort(), [
          `${initialChar}${s1_p1} ${initialChar}${s1_p2} ${initialChar}${s1_p3} ${s2_p1}`,
          `${initialChar}${s1_p1} ${initialChar}${s1_p2} ${initialChar}${s1_p3} ${s2_p2}`
        ].sort(), 'Stage 2 results must match the expected combined outputs.');
        timedCallback(nextCall, null, stage2Results.join(' ~ '));
      }).terminate(initialChar, (finalOutput) => {
        assertor.strictEqual(finalOutput,
          `${initialChar}${s1_p1} ${initialChar}${s1_p2} ${initialChar}${s1_p3} ${s2_p1} ~ ${initialChar}${s1_p1} ${initialChar}${s1_p2} ${initialChar}${s1_p3} ${s2_p2}`,
          'The final output must be the correctly combined string from all stages.');
        assertor.done();
      });
    },

    'hybrid_error_propagation': (assertor) => {
      const specificErrorMsg = 'MixedFlowExecutionFault';
      const startingContext = 'initial_context_data';

      pipelineExecutor((currentVal, nextCB) => {
        assertor.strictEqual(currentVal, startingContext, 'Context for the first sequential step must be the initial value.');
        timedCallback(nextCB, null, currentVal + '_step1_processed');
      }).and((currentVal, nextCB) => {
        assertor.strictEqual(currentVal, startingContext, 'Context for the parallel error path must also be the initial value.');
        timedCallback(nextCB, new Error(`Error during parallel step: ${specificErrorMsg}`), null);
      }).then((results, nextCB) => {
        // These steps should not be reached if the error is correctly handled.
        if (results && results.length > 0) {
          console.error('Logic error: This sequential step should not be reached after an error.');
          throw new Error('Logic error: This sequential step should not be reached after an error');
        }
        timedCallback(nextCB, null, results);
      }).and((results, nextCB) => {
        if (results && results.length > 0) {
          console.error('Logic error: This parallel step should not be reached after an error.');
          throw new Error('Logic error: This parallel step should not be reached after an error');
        }
        timedCallback(nextCB, null, results);
      }).catchError((encounteredException) => {
        assertor.ok(encounteredException instanceof Error, 'The caught item must be an instance of Error.');
        assertor.ok(encounteredException.message.includes(specificErrorMsg), 'The error message should contain the expected specific text.');
        assertor.done();
      }).terminate(startingContext, (finalResult) => {
        console.error('Unexpected final callback in hybrid error test:', finalResult);
        assertor.fail('Final callback should not execute after an error has been caught and handled.');
      });
    }
  },

  'Concurrent_Error_Handling_Specifics': {

    'multiple_concurrent_faults': (assertor) => {

      let failureCounter = 0;
      const standardDelay = 70; // Slightly altered delay value.

      // Helper function to abstract error generation for parallel tasks.
      const generateErrorAfterDelay = (callback) => {
        setTimeout(() => {
          callback(new Error('Simulated concurrent fault in a parallel branch'));
        }, standardDelay);
      };

      pipelineExecutor((_data, nextCB) => { // _data parameter is intentionally unused.
        generateErrorAfterDelay(nextCB);
      }).and((_data, nextCB) => {
        generateErrorAfterDelay(nextCB);
      }).and((_data, nextCB) => {
        generateErrorAfterDelay(nextCB);
      }).catchError((caughtIssue) => {
        failureCounter++;
        // Using an IIFE to capture variables for the setTimeout closure, and altered delay multiplier.
        ((currentCounter, assertionObject, delayFactor) => {
          setTimeout(() => {
            assertionObject.strictEqual(currentCounter, 1, 'Only one error handler should be triggered for multiple parallel errors.');
            assertionObject.done();
          }, delayFactor * 4);
        })(failureCounter, assertor, standardDelay);
      }).terminate('initial_parallel_data_set', (finalOutcome) => {
        console.error('Unexpected success path in multiple errors test:', finalOutcome);
        throw new Error('Final success callback should not be reached when multiple errors occur in parallel.');
      });
    }
  }
};