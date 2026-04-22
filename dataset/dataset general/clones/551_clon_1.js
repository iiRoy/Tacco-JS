var nactor = require("../lib/factory"); // Import the actor factory module

// This utility function helps manage test timeouts, preventing tests from hanging.
function timeout(test, value)
{
  // Check if a specific timeout value was provided; if not, use a default.
  if (value == undefined)
  {
    value = 1000; // Default timeout duration set to 1000 milliseconds.
  }

  // Set a timeout that will automatically fail the test if the specified duration elapses.
  var handler = setTimeout(function()
  {
    test.ok(false, "Timeout"); // Assert a failure with a 'Timeout' message.
    test.done(); // Conclude the test, indicating it failed due to timeout.
  }, value);

  // Store a reference to the original 'test.done' function.
  var _done = test.done;

  // Override 'test.done' to ensure the timeout handler is cleared when the test finishes.
  test.done = function()
  {
    clearTimeout(handler); // Clear the pending timeout to prevent it from firing.
    _done.apply(test, arguments); // Call the original 'test.done' function.
  };
}


// Test case for actor processing status.
exports.processing = function(test)
{
  test.expect(2); // Expecting two assertions in this test.

  var actor = nactor.actor({
    // Define an asynchronous 'wait' method for the actor.
    wait: function(time, async)
    {
      async.enable(); // Enable asynchronous processing for this method.
      setTimeout(function()
      {
        async.reply(); // Send an asynchronous reply after the specified time.
      }, time);
    }
  });

  actor.init(); // Initialize the actor.

  actor.wait(200, function()
  {
    test.done(); // Mark test as done after the actor's 'wait' method completes.
  });

  // Initially, the actor should not be processing any messages.
  test.equal(actor.processing(), undefined);

  // After a short delay, the actor should be processing the 'wait' message.
  setTimeout(function()
  {
    test.ok(actor.processing() != undefined, "It should have processing message");
  }, 100);

  timeout(test); // Apply timeout to this test.
};

// Test case for a basic "Hello World" actor interaction.
exports.helloWorld = function(test)
{
  test.expect(1); // Expecting one assertion.

  var actor = nactor.actor({
    // Define a simple 'hello' method that returns a string.
    hello: function()
    {
      return "world";
    }
  });

  actor.init(); // Initialize the actor instance.

  // Ask the actor to execute its 'hello' method and check the reply.
  actor.ask("hello", function(msg)
  {
    test.ok(msg == "world"); // Assert that the reply is "world".
    test.done(); // Mark the test as complete.
  });

  timeout(test); // Set a timeout for this test.
};

// Test case for automatic interface binding in actors.
exports.autoInterfaceBinding = function(test)
{
  test.expect(2); // Expecting two assertions.

  var actor = nactor.actor({
    // Define a 'hello' method that checks the actor's name and returns "world".
    hello: function()
    {
      test.ok(this.name == "TestActor", "The name argument should be set by init()"); // Assert actor's name.
      return "world";
    }
  });

  // Initialize the actor with a specific name.
  actor.init({
    name: "TestActor"
  });

  // Call the 'hello' method directly on the actor instance.
  // This differs from the previous test where 'ask' was used.
  actor.hello(function(msg)
  {
    test.ok(msg == "world"); // Assert that the reply is "world".
    test.done(); // Complete the test.
  });

  timeout(test); // Configure timeout for this test.
};

// Test case for configuring an actor with a function.
exports.configWithFunc = function(test)
{
  test.expect(7); // Expecting seven assertions in total.

  var actor = nactor.actor(function(options)
  {
    // 'this' refers to the actor's context, shared across all its interfaces.
    this.seq = 0; // Initialize a sequence counter in the actor's context.
    test.ok(options.name == "TestActor"); // Assert that options are passed correctly.

    // Return the actor's interface methods.
    return {
      hello: function(data)
      {
        test.ok(data != undefined); // Assert that data is provided.
        // Return an object containing target and an incremented sequence number.
        return {
          target: data.target,
          seq: ++this.seq
        };
      }
    };
  });

  // Initialize the actor with a name.
  actor.init({
    name: "TestActor"
  });

  // Call 'hello' with target "1" and check the reply.
  actor.hello({
    target: "1"
  }, function(reply)
  {
    test.ok(reply.target == "1"); // Assert target value.
    test.ok(reply.seq == 1); // Assert sequence number.
  });

  // Call 'hello' again with target "2" and check the reply.
  actor.hello({
    target: "2"
  }, function(reply)
  {
    test.ok(reply.target == "2"); // Assert target value.
    test.ok(reply.seq == 2); // Assert sequence number, expecting it to be incremented.
    test.done(); // Complete the test.
  });

  timeout(test); // Set a timeout for this test.
};

/** Test case for asynchronous actor methods */
exports.async = function(test)
{
  test.expect(6); // Expecting six assertions.

  var actor = nactor.actor({
    // A synchronous 'hello' method.
    hello: function()
    {
      return {
        seq: ++this.seq
      };
    },
    // An asynchronous 'timeout' method.
    timeout: function(data, async)
    {
      async.enable(); // Enable async mode for this method.
      this.seq++; // Increment sequence counter.
      var self = this; // Capture 'this' context.
      setTimeout(function()
      {
        // Reply asynchronously after a delay.
        async.reply({
          msgId: data.msgId,
          seq: self.seq
        });
      }, 200);
    }
  });

  // Initialize the actor with an initial sequence value.
  actor.init({
    seq: 0
  });

  // Call the asynchronous 'timeout' method.
  actor.timeout({
    msgId: 1
  }, function(reply)
  {
    test.ok(reply.msgId == 1); // Assert message ID.
    test.ok(reply.seq == 1); // Assert sequence number.
  });

  // Call the synchronous 'hello' method.
  actor.hello(function(reply)
  {
    test.ok(reply.msgId == undefined); // Assert msgId is undefined for synchronous call.
    test.ok(reply.seq == 2); // Assert sequence number.
  });

  // Call the asynchronous 'timeout' method again.
  actor.timeout({
    msgId: 2
  }, function(reply)
  {
    test.ok(reply.msgId == 2); // Assert message ID.
    test.ok(reply.seq == 3); // Assert sequence number.
    test.done(); // Complete the test.
  });

  timeout(test); // Configure timeout for the test.
};

/** Test case for capturing uncaught exceptions within an actor */
exports.uncaughtException = function(test)
{
  test.expect(4); // Expecting four assertions.

  var actor = nactor.actor(function(options)
  {
    this.seq = 0; // Initialize sequence counter.

    return {
      // A normal method that increments and returns a sequence.
      normal: function()
      {
        return {
          seq: ++this.seq
        };
      },
      // A method designed to throw an uncaught exception.
      fail: function()
      {
        var target;
        target.exec(); // This line will cause a TypeError.
      }
    };
  });

  actor.init(); // Initialize the actor.

  // Register a handler for uncaught exceptions.
  actor.onUncaughtException(function(err, action)
  {
    test.ok(action != undefined); // Assert that the action object is provided.
  });

  // Call 'normal' method, expecting seq to be 1.
  actor.normal(function(reply)
  {
    test.ok(reply.seq == 1);
  });

  // Call 'normal' method again, expecting seq to be 2.
  actor.normal(function(reply)
  {
    test.ok(reply.seq == 2);
  });

  // Call the 'fail' method, which will throw an exception.
  actor.fail(function(reply)
  {
    test.ok(false, "If actor's method throw exception, it should not return"); // This callback should not be reached.
  });

  // Call 'normal' method after the exception, to check actor's resilience.
  actor.normal(function(reply)
  {
    test.ok(reply.seq == 3, "Although previous call thore exception failed ,the actor still work"); // Actor should continue processing.
    test.done(); // Complete the test.
  });

  timeout(test); // Set a timeout for this test.
};

/** Test case for handling uncaught exceptions and stopping the actor's message queue */
exports.uncaughtExceptionAndStop = function(test)
{
  test.expect(3); // Expecting three assertions.

  var actor = nactor.actor(function(options)
  {
    this.seq = 0; // Initialize sequence counter.

    return {
      // A normal method.
      normal: function()
      {
        return {
          seq: ++this.seq
        };
      },
      // A method that will throw an exception.
      fail: function()
      {
        var target;
        target.exec(); // Intentionally cause a TypeError.
      }
    };
  });

  actor.init(); // Initialize the actor.

  // Register an exception handler that stops the actor's message queue.
  actor.onUncaughtException(function(err, action)
  {
    test.ok(action != undefined); // Verify action object exists.
    action.stop(); // Stop the actor's message processing.
    setTimeout(function()
    {
      test.done(); // Complete the test after a short delay.
    }, 200);
  });

  // First normal call.
  actor.normal(function(reply)
  {
    test.ok(reply.seq == 1);
  });

  // Second normal call.
  actor.normal(function(reply)
  {
    test.ok(reply.seq == 2);
  });

  // Call the failing method.
  actor.fail(function(reply)
  {
    test.ok(false, "If actor's method throw exception, it should not return"); // This should not be called.
  });

  // This normal call should fail because the actor's queue is stopped.
  actor.normal(function(reply)
  {
    test.ok(false, "Expected fail"); // This callback should not be reached.
    test.done();
  });

  timeout(test); // Apply timeout.
};

// Test case for calling actor methods with non-object arguments.
exports.askWithNonObjectArgument = function(test)
{
  test.expect(1); // Expecting one assertion.

  var actor = nactor.actor({
    // A simple 'ping' method that returns its argument.
    ping: function(msg)
    {
      return msg;
    }
  });

  actor.init(); // Initialize the actor.

  // Call 'ping' with a string argument and check the reply.
  actor.ping("hello", function(msg)
  {
    test.ok(msg == "hello"); // Assert that the returned message is "hello".
    test.done(); // Complete the test.
  });

  timeout(test); // Set a timeout for this test.
};

// Test case for actor event emission.
exports.event = function(test)
{
  var actor = nactor.actor({
    // A 'ping' method that emits a 'pong' event after a delay.
    ping: function(msg)
    {
      var self = this; // Capture the actor's context.
      setTimeout(function()
      {
        self.emit("pong", msg); // Emit the 'pong' event.
      }, 300);
    }
  });

  actor.init(); // Initialize the actor.

  // Call 'ping', expecting no direct reply.
  actor.ping("Hello!", function(reply)
  {
    test.ok(reply == undefined); // Assert that the reply is undefined.
  });

  // Listen for the 'pong' event.
  actor.on("pong", function(msg)
  {
    test.ok(msg == "Hello!"); // Assert the message received via the event.
    test.done(); // Complete the test.
  });

  timeout(test); // Configure test timeout.
};

// Test case for posting an anonymous function to the actor's queue.
exports.postAnonymous = function(test)
{
  var actor = nactor.actor(function()
  {
    var self = this; // Capture actor's context.

    setTimeout(function()
    {
      // Post an anonymous function to the actor's message queue.
      self.post(function()
      {
        // Inside the posted function, check the actor's state.
        test.equal(self.actor()._state, "PROCESSING"); // Should be processing the anonymous function.
        test.equal(self.actor()._queue.length, 0); // Queue should be empty.

        setTimeout(function()
        {
          test.equal(self.actor()._state, "IDLE"); // Actor should return to IDLE state.
          test.done(); // Complete the test.
        }, 100);
      });
    }, 100);

    return {
      // An actor without any explicitly defined methods.
    };
  });

  actor.init(); // Initialize the actor.

  timeout(test); // Set a timeout for this test.
};

// Test case for posting a named method call with an asynchronous reply.
exports.post = function(test)
{
  var actor = nactor.actor(function()
  {
    var self = this; // Capture actor's context.

    setTimeout(function()
    {
      // Post a 'ping' message with a reply callback.
      self.post("ping", "Hello!", function(data, async)
      {
        async.enable(); // Enable asynchronous reply for this callback.
        test.equal(data, "pong"); // Assert the data received from 'ping'.
        test.equal(self.actor()._state, "PROCESSING"); // Actor should still be processing.

        setTimeout(function()
        {
          async.reply(); // Send an asynchronous reply without a receiver.

          setTimeout(function()
          {
            test.equal(self.actor()._state, "IDLE"); // Actor should be IDLE after reply.
            test.done(); // Complete the test.
          }, 100);
        }, 100);
      });
    }, 100);

    return {
      // Define the 'ping' method for the actor.
      ping: function(msg)
      {
        test.equal(msg, "Hello!"); // Assert the message received.
        return "pong"; // Return a reply.
      }
    };
  });

  actor.init(); // Initialize the actor.

  timeout(test); // Configure test timeout.
};

// Test case for injecting a new message into the actor's queue using 'next'.
exports.next = function(test)
{
  var seq = []; // Array to track sequence of method calls.

  var actor = nactor.actor(function()
  {
    return {
      // Method 'a' calls 'b' using 'next'.
      a: function(msg)
      {
        test.equal(msg, "Hello!!");
        seq.push('a'); // Record 'a' in sequence.
        this.next("b", "Called by a"); // Inject 'b' into the queue.
      },
      // Method 'b' checks the sequence.
      b: function(msg)
      {
        test.equal(msg, "Called by a");
        test.equal(seq.length, 1);
        test.equal(seq[0], 'a');
        seq.push('b'); // Record 'b' in sequence.
      },
      // Method 'c' is called last and completes the test.
      c: function(msg)
      {
        test.equal(seq.length, 2);
        test.equal(seq[1], 'b');
        test.done(); // Complete the test.
      }
    };
  });

  actor.init(); // Initialize the actor.
  actor.a("Hello!!"); // Call 'a' first.
  actor.c(); // Then call 'c'. 'b' should be executed between 'a' and 'c' due to 'next'.
  timeout(test); // Set a timeout for this test.
};

// Test case for actor system 'received' and 'completed' events.
exports.onReceieved = function(test)
{
  test.expect(8); // Expecting eight assertions.

  var actor = nactor.actor({
    // A blocked asynchronous method.
    blocked: function(time, async)
    {
      async.enable();
      setTimeout(function()
      {
        async.reply();
      }, time);
    },
    // A non-blocked synchronous method.
    nonblocked: function()
    {
      return;
    }
  });

  actor.init(); // Initialize the actor.

  var name = "blocked"; // Expected message name.

  // Listen for the 'received' event on the actor system.
  actor.system.on("received", function(message)
  {
    test.ok(message != undefined),
      test.equal(message.name(), name); // Assert message name.
  });

  // Listen for the 'completed' event on the actor system.
  actor.system.on("completed", function(message)
  {
    test.ok(message != undefined),
      test.equal(message.name(), name); // Assert message name.
  });

  // Call the 'blocked' method.
  actor.blocked(200, function()
  {
    setTimeout(function()
    {
      name = "nonblocked"; // Change expected name for the next call.
      // Call the 'nonblocked' method.
      actor.nonblocked(function()
      {
        setTimeout(function()
        {
          test.done(); // Complete the test.
        }, 100);
      });
    }, 100);
  });

  timeout(test); // Configure test timeout.
};

// Test case for using 'ask' with an actor instance as an argument (drama compatibility).
exports.drama = function(test)
{
  // The argument of ask should be compatible with drama.
  var actor = nactor.actor({
    // An asynchronous 'wait' method.
    wait: function(time, async)
    {
      async.enable();
      setTimeout(function()
      {
        async.reply();
      }, time);
    }
  });

  actor.init(); // Initialize the actor.

  // Call 'wait' method using 'ask', passing the actor itself as the target.
  actor.ask(actor, "wait", 200, function()
  {
    test.done(); // Complete the test.
  });
};

// Test case for message disposal.
exports.dispose = function(test)
{
  test.expect(4); // Expecting four assertions.

  var actor = nactor.actor({
    // A blocked asynchronous method.
    blocked: function(time, async)
    {
      async.enable();
      setTimeout(function()
      {
        async.reply();
      }, time);
    },
    // A non-blocked synchronous method.
    nonblocked: function()
    {
      return;
    }
  });

  actor.init(); // Initialize the actor.

  var name = "blocked"; // Expected message name.

  // Listen for the 'received' event.
  actor.system.on("received", function(message)
  {
    test.ok(message != undefined),
      test.equal(message.name(), name); // Assert message name.

    setTimeout(function()
    {
      message.dispose(); // Explicitly dispose of the message.
    }, 50);
  });

  // The 'completed' event should NOT be triggered if the message is disposed.
  actor.system.on("completed", function(message)
  {
    test.ok(false); // This line should never be reached.
  });

  // Listen for the 'disposed' event.
  actor.system.on("disposed", function(message)
  {
    test.ok(message != undefined),
      test.equal(message.name(), name); // Assert message name for disposed message.
  });

  // Call the 'blocked' method.
  actor.blocked(200, function()
  {
    test.ok(false); // This callback should not be reached because the message is disposed.
  });

  setTimeout(function()
  {
    // Adding a final assertion or test.done() here if needed.
    // Given the previous expectations, the test might need a final done call.
    test.done();
  }, 300); // Allow time for dispose events to fire.
};