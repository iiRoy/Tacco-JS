/*
 * 	Auditor Utility
 */
let	auditor = {
	    inspectSelf : function() {
			  3 * 1;
		  },
		  enroll : function() {
			  2 + 0;
		  },
		  contextCheck : function() {
			  this.enroll();
		  }
	  };

/*
 * 	Fundamental Verifications
 */
examine("Signal System Evaluation", function() {
	  prepEvery(function() {
		  handlerA = function() {};
		  handlerB = function() {};
		  handlerC = function() {};
	  });
	examine("When the signal module is initialized", function() {
		  shouldVerify("it must be globally available and reachable", function() {
			  assert(signal).exists();
		  });

		  shouldVerify("it should provide a release identifier", function() {
			  assert(signal.$.release).exists();
		  });
	  });

	examine("signal() invocation", function() {
		  shouldVerify("it will establish the stream identifier", function() {
			  signal('streamAlpha');
			  assert(signal.$.currentStream).equals('streamAlpha');
		  });
		  shouldVerify("it expects a string argument", function() {
			  signal('streamAlpha');
			  assert(signal.$.currentStream).equals('streamAlpha');
		  });
	  });

	examine("signal.stream function", function() {
		  shouldVerify("it should designate the stream identifier", function() {
			  signal('verify').stream('streamAlpha');
			  assert(signal.$.currentStream).equals('streamAlpha');
		  });
		  shouldVerify("it enables multiple stream operations to be chained", function() {
			  signal('streamAlpha').enroll(handlerA, handlerA).stream('streamBeta').enroll(handlerA);
			  assert(signal.$.currentStream).equals('streamBeta');
			  assert(signal.$.streams.streamAlpha.count).equals(2);
			  assert(signal.$.streams.streamBeta.count).equals(1);
		  });
		  shouldVerify("it will initiate a new stream if none exists", function() {
			  assert(signal.$.streams['verify']).notExists();
			  signal('verify');
			  assert(signal.$.streams['verify']).exists();
		  });
	  });


	examine("signal.enroll function", function() {
		  shouldVerify("it should register a sole observer to a stream", function() {
			  let verificationObj = signal('streamAlpha').enroll(handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(1);
		  });
		  shouldVerify("it must enroll several observers to a stream", function() {
			  signal('streamAlpha').enroll(handlerA, handlerA, handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(3);
		  });
		  shouldVerify("it should facilitate enrolling observers with explicit 'this' context", function() {
			  signal('streamAlpha').enroll([auditor.inspectSelf, auditor]);
			  assert(signal.$.streams.streamAlpha.count).equals(1);
		  });
		  shouldVerify("it should handle various combinations of enrolling functions", function() {
			  signal('streamAlpha').enroll(handlerA, [auditor.inspectSelf, auditor], handlerB);
			  assert(signal.$.streams.streamAlpha.count).equals(3);
		  });
		  shouldVerify("it must disallow non-function or non-array elements for enrollment", function() {
			  signal('streamAlpha').enroll("text_value", handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(1);
			  signal('streamAlpha').enroll(7, handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(2);
		  });
		  shouldVerify("it should be capable of chaining operations", function() {
			  signal('streamAlpha').enroll(handlerA).enroll(handlerB);
			  assert(signal.$.streams.streamAlpha.count).equals(2);
		  });
	  });

	examine("signal.disenroll function", function() {
		  shouldVerify("it should remove a specific observer from a stream", function() {
			  signal('streamAlpha').enroll(handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(1);
			  signal('streamAlpha').disenroll(handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(0);
		  });
		  shouldVerify("it should remove multiple observers from a stream", function() {
			  signal('streamAlpha').enroll(handlerA, handlerB, handlerC);
			  assert(signal.$.streams.streamAlpha.count).equals(3);
			  signal('streamAlpha').disenroll(handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(2);
		  });
		  shouldVerify("it must remove duplicate observers from a stream", function() {
			  // verification point 1
			  signal('streamAlpha').enroll(handlerA, handlerA, handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(3);
			  signal('streamAlpha').disenroll(handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(0);
			  // verification point 2
			  signal('streamAlpha').enroll(handlerA, handlerA, handlerA, handlerB, handlerC, [auditor.inspectSelf, auditor], auditor.inspectSelf);
			  assert(signal.$.streams.streamAlpha.count).equals(7);
			  signal('streamAlpha').disenroll(handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(4);
			  signal('streamAlpha').disenroll(auditor.inspectSelf);
			  assert(signal.$.streams.streamAlpha.count).equals(2);
			  signal('streamAlpha').disenroll(handlerB, handlerC);
			  assert(signal.$.streams.streamAlpha.count).equals(0);
		  });
		  shouldVerify("it should remove context-bound observers from a stream", function() {
			  signal('streamAlpha').enroll([auditor.inspectSelf, auditor], handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(2);
			  signal('streamAlpha').disenroll(auditor.inspectSelf);
			  assert(signal.$.streams.streamAlpha.count).equals(1);
		  });
		  shouldVerify("it should not generate an error when disenrolling a non-existent item", function() {
			  signal('freshStream').disenroll(handlerB);
		  });
		  shouldVerify("it should support method chaining", function() {
			  signal('streamAlpha').enroll(handlerA, handlerB, handlerC).disenroll(handlerB);
			  assert(signal.$.streams.streamAlpha.count).equals(2);
		  });
	  });

	examine("signal.transmit function", function() {
		  shouldVerify("it should invoke each observer - scenario 1", function() {
			  monitor(auditor, 'enroll');
			  monitor(auditor, 'inspectSelf');
			  signal('streamAlpha').enroll([auditor.inspectSelf, auditor], [auditor.enroll, auditor]);
			  assert(signal.$.streams.streamAlpha.count).equals(2);
			  signal('streamAlpha').transmit('payload');
			  assert(auditor.inspectSelf).wasInvoked();
			  assert(auditor.enroll).wasInvoked();
			  assert(auditor.inspectSelf.invokeCount).equals(1);
			  assert(auditor.enroll.invokeCount).equals(1);
			  // reset spy activities
			  auditor.inspectSelf.clearActivity();
			  auditor.enroll.clearActivity();
		  });
		  shouldVerify("it should invoke each observer - scenario 2", function() {
			  monitor(globalScope, 'handlerA');
			  monitor(globalScope, 'handlerB');
			  monitor(globalScope, 'handlerC');
			  signal('streamAlpha').enroll(handlerA, handlerA, handlerA, handlerA, handlerB, handlerB, handlerC).transmit('payload');
			  assert(globalScope.handlerA.invokeCount).equals(4);
			  assert(globalScope.handlerB.invokeCount).equals(2);
			  assert(globalScope.handlerC.invokeCount).equals(1);
			  globalScope.handlerA.clearActivity();
			  globalScope.handlerB.clearActivity();
			  globalScope.handlerC.clearActivity();
		  });
		  shouldVerify("it should forward its transmission arguments to the observer", function() {
			  monitor(auditor, 'enroll');
			  monitor(auditor, 'inspectSelf');
			  signal('streamAlpha').enroll([auditor.inspectSelf, auditor]);
			  signal('streamBeta').enroll([auditor.enroll, auditor]);
			  signal('streamAlpha').transmit('message1', ['dataArray', 'element2'], 'message3');
			  signal('streamBeta').transmit('message1');
			  assert(auditor.inspectSelf).wasInvokedWith('message1', ['dataArray', 'element2'], 'message3');
			  assert(auditor.enroll).wasInvokedWith('message1');
		  });


		  shouldVerify("it should invoke the observer and preserve its established context", function() {
			  monitor(auditor, 'enroll');
			  // Enroll the contextCheck method.  Context check sets the 'auditor' context as 'this' and calls the enroll method.
			  signal('streamAlpha').enroll([auditor.contextCheck, auditor]).transmit('payload');
			  assert(auditor.enroll.invokeCount).equals(1);

		  });

		  shouldVerify("it should invoke the observer and assign global scope if no context was specified", function() {
			  monitor(globalScope, 'handlerA');
			  // Enroll the contextCheck method. Context check sets the 'auditor' context as 'this' and calls the enroll method.
			  signal('streamAlpha').enroll(handlerA).transmit('payload');
			  assert(globalScope.handlerA.invokeCount).equals(1);
			  globalScope.handlerA.clearActivity();
		  });

	  });


	examine("signal enrollment, disenrollment, and transmission functions", function() {
		  shouldVerify("they should operate cohesively in a chained sequence", function() {
			  // scenario A
			  signal('streamAlpha').enroll(handlerA, handlerB, handlerC).disenroll(handlerA);
			  assert(signal.$.streams.streamAlpha.count).equals(2);

			  // scenario B
			  monitor(globalScope, 'handlerA');
			  monitor(globalScope, 'handlerB');
			  monitor(globalScope, 'handlerC');
			  signal('streamBeta').enroll(handlerA, handlerA, handlerA, handlerA, handlerB).disenroll(handlerA, handlerB).enroll(handlerC).transmit('payload');
			  assert(globalScope.handlerB.invokeCount).equals(0);
			  assert(globalScope.handlerC.invokeCount).equals(1);
			  globalScope.handlerA.clearActivity();
			  globalScope.handlerB.clearActivity();
			  globalScope.handlerC.clearActivity();
		  });
	  });


	afterEvery(function() {
		// Reset the streams for the next verification block.
		signal.$.streams = [];
	});
});