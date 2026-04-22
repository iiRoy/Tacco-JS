/*
 * Copyright 2012 The Obvious Corporation.
 * This file is part of the Obvious Corporation's proprietary software.
 * Unauthorized copying or distribution of this file, via any medium, is strictly prohibited.
 */

/*
 * @fileoverview Unit tests for the composers library.
 * These tests ensure the core functionality of the composers library works as expected.
 * To run these tests, execute `nodeunit tests/composers_test.js` from the command line.
 */

  var composers = require('../lib/composers') // Core composers library
    , Node = composers.Node                   // Node constructor from composers
    , nodeunit = require('nodeunit')          // Nodeunit test framework
    , Q = require('q')                        // Q library for promises
    , Registry = composers.Registry           // Registry constructor for managing nodes
    , Scope = composers.Scope                 // Scope constructor for managing graph execution context
    , testCase = nodeunit.testCase            // Nodeunit's testCase utility
    , trace = require('../lib/trace')         // Tracing utility for graph visualization

// Flag to enable/disable graph output for visualization. Set to true for debugging graph flow.
  var OUTPUT_GRAPHS = false


  var registry // Global registry instance for defining nodes
    , scope    // Global scope instance for executing graphs


/**
 * Helper function to create a new node builder using the global registry.
 * @returns {NodeBuilder} A builder object for defining a new node.
 */
function node() {
    return registry.defineNode()
}


/**
 * Composes and starts a graph for a given key, handling visualization and error propagation.
 * @param {string} key The key of the node to compose.
 * @returns {Promise<*>} A promise that resolves with the composed value or rejects with an error.
 */
function compose(key) {
  // Create a new graph instance for the specified key within the current scope.
  var graph = scope.createGraph(key)
  // Start the graph execution, optionally enabling output for visualization.
  return graph.start(OUTPUT_GRAPHS)
              .then(function (value) {
                  // On success, visualize the graph and return the value.
                  vizualize(graph)
                  return value
              }, function (err) {
                  // On failure, visualize the graph and re-throw the error.
                  vizualize(graph)
                  throw err
              })
}


/**
 * Composes multiple nodes concurrently.
 * @param {Array<string>} keys An array of node keys to compose.
 * @returns {Array<Promise<*>>} An array of promises, one for each composed node.
 */
function composeMany(keys) {
  var promises = [] // Array to hold promises for each composition operation
  for (var i in keys) {
    // For each key, initiate composition and add the resulting promise to the array.
    promises.push(compose(keys[i]))
  }
  return promises
}


/**
 * Creates a deferred promise that resolves after a specified delay with the result of a function.
 * @param {number} millis The delay in milliseconds.
 * @param {function(): *} fn The function to execute after the delay.
 * @returns {Q.Promise} A promise that resolves after `millis` with the result of `fn`.
 */
function delayed(millis, fn) {
  var d = Q.defer() // Create a new deferred object.
  setTimeout(function () {
    // Resolve the deferred after the specified time.
    d.resolve(fn())
  }, millis)
  return d.promise // Return the promise part of the deferred.
}


/**
 * Visualizes the execution trace of a graph if tracing is enabled.
 * @param {Graph} graph The graph instance to visualize.
 */
function vizualize(graph) {
  var g = trace.vizualize(graph.getTraceId()) // Get the visualization object for the graph's trace ID.
  if (!g) {
    // If no visualization object is returned (e.g., tracing is off), simply return.
    return
  }
  // Set the path to GraphViz executable (assuming it's in the current directory for simplicity).
  g.setGraphVizPath('./')
  // Output the graph visualization as a PNG file.
  g.output('png', 'graph-' + graph.getOutputKey() + '.png')
}


// Exporting the test cases using nodeunit's testCase utility.
module.exports = testCase({

  /**
   * Sets up the environment before each test.
   * Initializes a new Registry and Scope for isolated testing.
   * @param {function()} done Callback to signal completion of setup.
   */
  setUp: function (done) {
    registry = new Registry() // New registry for node definitions.
    scope = new Scope(registry) // New scope tied to the registry.
    scope.enter()             // Enter the scope.
    done()                    // Signal setup completion.
  },

  /**
   * Tears down the environment after each test.
   * Exits the current scope.
   * @param {function()} done Callback to signal completion of teardown.
   */
  tearDown: function (done) {
    scope.exit() // Exit the current scope.
    done()       // Signal teardown completion.
  },

  /**
   * Tests that graph dependencies are correctly resolved and executed in the right order.
   * This test defines several nodes with dependencies and verifies the final composed values.
   */
  testDependencies: function (test) {
    // Define node 'A'
    node().outputs('A').with(function () {
      return 'A'
    }).build()

    // Define node 'B' (returns a promise)
    node().outputs('B').with(function () {
      return Q.resolve('B')
    }).build()

    // Define node 'A+B' which depends on 'A' and 'B'
    node().given('A', 'B').outputs('A+B').with(function (a, b) {
      return a.get() + b.get()
    }).build()

    // Define node 'C' which is not cacheable
    node().outputs('C').with(function () {
      return 'C'
    }).notCacheable().build()

    // Define node 'A+B+C' which depends on 'A+B' and 'C'
    node().given('A+B', 'C').outputs('A+B+C').with(function (ab, c) {
      return ab.get() + c.get()
    }).build()

    var graph = scope.createGraph('A+B+C') // Create a graph for 'A+B+C'
    graph.start().then(function () {
      // Once the main graph starts, visualize it.
      vizualize(graph)
      // Compose multiple individual nodes and assert their values.
      Q.all(composeMany(['A', 'B', 'C', 'A+B', 'A+B+C'])).spread(function (a, b, c, ab, abc) {
        test.equal(a, 'A', 'Node A should resolve to "A"')
        test.equal(b, 'B', 'Node B should resolve to "B"')
        test.equal(c, 'C', 'Node C should resolve to "C"')
        test.equal(ab, 'AB', 'Node A+B should resolve to "AB"')
        test.equal(abc, 'ABC', 'Node A+B+C should resolve to "ABC"')
        test.done() // Signal test completion.
      })
    }).fail(function (err) {
      // If any error occurs during graph execution, log it.
      console.log(err)
      test.ok(false, 'Graph failed with error: ' + err.message)
      test.done()
    })
  },

  /**
   * Tests that explicit input binding (overriding dependencies) works correctly.
   * This scenario demonstrates providing a direct value for a dependency.
   */
  testExplicits: function (test) {
    // Node 'A' definition
    node().outputs('A').with(function () {
      return 'A'
    }).build()

    // Node 'A+B' definition, depends on 'A' and 'B'
    node().given('A', 'B').outputs('A+B').with(function (a, b) {
      return a.get() + b.get()
    }).build()

    // Create graph for 'A+B' but explicitly provide 'B' with 'FOO'.
    var promise = scope.createGraph('A+B')
                     .give('B', 'FOO') // Explicitly bind 'B' to 'FOO'.
                     .start()

    promise.then(function (ab) {
      test.equal(ab, 'AFOO', 'Explicit binding for B should result in "AFOO"')
      test.done()
    })
  },

  /**
   * Tests child scopes and verifies that nodes are executed within the correct context (`this`).
   * Ensures that `this` inside a node function refers to the context provided to `scope.enter()`.
   */
  testScopeContext: function (test) {
    var childScope = new Scope(registry, scope) // Create a child scope.
    var context = {
      value: 42 // Define a context object.
    }

    // Define a node that accesses `this.value`.
    registry.defineNode().outputs('value').with(function () {
      return this.value
    }).build()

    childScope.enter(context) // Enter the child scope with the specified context.
    childScope.createGraph('value').start().then(function (value) {
      childScope.exit() // Exit the child scope.
      test.equal(value, 42, 'Node should return value from its execution context')
      test.done()
    })
  },

  /**
   * Tests the default caching mechanism for nodes.
   * Two compositions of the same node should yield the same result if cached.
   */
  testCaching: function (test) {
    // Define a node that returns a random number.
    node().outputs('random').with(function () {
      return Math.random()
    }).build()

    // Compose 'random' twice and expect the same result.
    Q.all(composeMany(['random', 'random'])).spread(function (r1, r2) {
      test.equal(r1, r2, 'Cached node should return the same value on subsequent calls')
      test.done()
    })
  },

  /**
   * Tests that caching can be explicitly disabled for a node.
   * Two compositions of a 'notCacheable' node should yield different results.
   */
  testNotCacheable: function (test) {
    // Define a node that returns a random number and is explicitly not cacheable.
    node().outputs('random').with(function () {
      return Math.random()
    }).notCacheable().build()

    // Compose 'random' twice and expect different results.
    Q.all(composeMany(['random', 'random'])).spread(function (r1, r2) {
      test.notEqual(r1, r2, 'Non-cacheable node should return different values')
      test.done()
    })
  },

  /**
   * Tests that explicit input bindings can accept promises.
   * This allows for dynamic dependency resolution through promises.
   */
  testPromiseBindings: function (test) {
    // Define a node that resolves after a delay.
    node().outputs('delayed').with(function () {
      return delayed(200, function () {
        return 'foo'
      })
    }).build()

    // Define a node 'foobar' that depends on 'foo'.
    node().given('foo').outputs('foobar').with(function (foo) {
      return foo.get() + 'bar'
    }).build()

    // Bind 'foo' to the promise of another graph's execution.
    scope.createGraph('foobar')
         .give('foo', scope.createGraph('delayed').start()) // Provide a promise as input.
         .start()
         .then(function (foobar) {
           test.equals(foobar, 'foobar', 'Promise binding should resolve correctly')
           test.done()
         })
  },

  /**
   * Tests the scope seeding mechanism, which allows injecting values into a scope.
   * Also verifies support for array-based `given` declarations.
   */
  testSeeding: function (test) {
    // Define a node that depends on 'name' and 'number'.
    // `given` accepts an array of keys.
    node().given(['name', 'number']).outputs('upper-name').with(function (name, number) {
      return name.get().toUpperCase() + number.get()
    }).build()

    var number = 42 // A variable to be seeded.
    var childScope = new Scope(registry, scope) // Create a child scope.
    childScope.seed('name', 'David') // Seed 'name' with a string.
    childScope.seed('number', function () { return number; }) // Seed 'number' with a function.
    childScope.enter() // Enter the child scope.
    childScope.createGraph('upper-name').start().then(function (name) {
      childScope.exit() // Exit the child scope.
      test.equal(name, 'DAVID42', 'Seeded values should be correctly used by the node')
      test.done()
    }).end() // `.end()` is part of the promise chain (Q.js specific).
  },

  /**
   * Tests the graph callback mechanism for both success and error scenarios.
   * The `callback` method provides a Node.js-style callback interface.
   */
  testGraphCallback: function (test) {
    // Node that resolves successfully after a delay.
    node().outputs('ok').with(function () {
      return delayed(200, function () {
        return 'ok'
      })
    }).build()

    // Node that throws an error.
    node().outputs('not-ok').with(function () {
      throw new Error('not-ok')
    }).build()

    // Test successful callback.
    scope.createGraph('ok').callback(function (err, ok) {
      test.ok(!err, 'Successful graph should not return an error')
      test.equal(ok, 'ok', 'Successful graph should return the correct value')

      // Test error callback.
      scope.createGraph('not-ok').callback(function (err) {
        test.equal('not-ok', err.message, 'Error graph should return the correct error message')
        test.done()
      })
    })
  },

  /**
   * Tests that subsequent calls to `Input.get()` within a node's execution are cached.
   * This ensures that a dependency's value is fetched only once per node execution.
   */
  testInputCaching: function (test) {
    // Define a node 'value' that depends on 'counter' and calls `counter.get()` multiple times.
    node().outputs('value').given('counter').with(function (counter) {
      return counter.get() + '' + counter.get() + '' + counter.get()
    }).build()

    var counter = 0; // Initialize a counter.
    var childScope = new Scope(registry, scope) // Create a child scope.
    // Seed 'counter' with a function that increments and returns the counter.
    childScope.seed('counter', function () { return ++counter; })
    childScope.enter() // Enter the child scope.
    childScope.createGraph('value').start().then(function (value) {
      childScope.exit() // Exit the child scope.
      // If Input.get() is cached, counter should be incremented once, resulting in '111'.
      test.equal(value, '111', 'Input.get() calls within a node should be cached')
      test.done()
    }).end()
  },

  /**
   * Tests that attempting to bind to an unknown node (a dependency not defined) fails gracefully.
   * An error should be thrown when an undefined dependency is encountered.
   */
  testUnknownNodeError: function (test) {
    // Define a node that depends on 'unknown'.
    node().given('unknown').outputs('nothing').with(function () {})
    try {
      compose('unknown') // Attempt to compose a graph with an unknown dependency.
      test.ok(false, 'Expected an error when composing an unknown node')
    } catch (expected) {
      // If an error is caught, the test passes.
      test.done()
    }
  },

  /**
   * Tests that errors propagate correctly through the graph execution chain.
   * If a node throws an error, subsequent dependent nodes should also fail.
   */
  testError: function (test) {
    // Node 'ok' resolves successfully.
    node().outputs('ok').with(function () {
      return 'ok'
    }).build()

    // Node 'not-ok' depends on 'ok' but throws an error.
    node().given('ok').outputs('not-ok').with(function () {
      throw new Error('wtf man')
    }).build()

    // Node 'error' depends on 'not-ok' and also throws an error (should not be reached if 'not-ok' fails).
    node().given('not-ok').outputs('error').with(function () {
      throw new Error('wtf man') // This specific error message should not be the one caught.
    }).build()

    // Compose 'error' and expect the error from 'not-ok' to propagate.
    compose('error').then(undefined, function (err) {
      test.equal(err.message, 'wtf man', 'Error should propagate from the failing dependency')
      test.done()
    })
  },

  /**
   * Tests that errors can be ignored if a node explicitly chooses not to call `get()` on a failing input.
   * This demonstrates optional dependencies or error handling within a node.
   */
  testErrorIgnored: function (test) {
    // Node 'ok' resolves successfully.
    node().outputs('ok').with(function () {
      return 'ok'
    }).build()

    // Node 'not-ok' throws an error.
    node().given('ok').outputs('not-ok').with(function () {
      throw new Error('wtf man')
    }).build()

    // Node 'ignored' depends on 'ok' and 'not-ok'.
    // It explicitly *does not* call `notOk.get()`, effectively ignoring its failure.
    node().given('ok', 'not-ok').outputs('ignored').with(function (ok, notOk) {
      // Do nothing with notOk. Its error is not accessed, so it does not propagate.
      return ok.get() // Only use 'ok'.
    }).build()

    // Compose 'ignored'. It should succeed because the error from 'not-ok' is not accessed.
    compose('ignored').then(function (value) {
      test.ok(value, 'Graph should succeed if failing dependency is ignored')
      test.equal(value, 'ok', 'Value should come from the successful dependency')
      test.done()
    })
  },

  /**
   * Tests a more complex simulation with multiple interdependent nodes, delays, and caching behaviors.
   * This scenario verifies the correct ordering and combination of asynchronous results.
   */
  testSimulation: function (test) {
    // Node 'first-name' resolves after a short delay.
    node().outputs('first-name').with(function () {
      return delayed(20, function () {
        return 'David'
      })
    }).build()

    // Node 'last-name' resolves after a longer delay.
    node().outputs('last-name').with(function () {
      return delayed(200, function () {
        return 'Byttow'
      })
    }).build()

    // Node 'full-name' depends on 'first-name' and 'last-name'.
    node().given('first-name', 'last-name').outputs('full-name')
        .with(function (firstName, lastName) {
          return firstName.get() + ' ' + lastName.get()
        }).build()

    // Node 'lowercased' depends on 'full-name'.
    node().given('full-name').outputs('lowercased').with(function (fullName) {
      return fullName.get().toLowerCase()
    }).build()

    // Node 'underscored' depends on 'lowercased', has a delay, and is not cacheable.
    node().given('lowercased').outputs('underscored').with(function (name) {
      return delayed(100, function () {
        return name.get().replace(' ', '_')
      })
    }).notCacheable().build()

    // Node 'uppercased' depends on 'lowercased', has a delay, and is not cacheable.
    node().given('lowercased').outputs('uppercased').with(function (name) {
      return delayed(200, function () {
        return name.get().toUpperCase()
      })
    }).notCacheable().build()

    // Node 'names' depends on 'lowercased', 'uppercased', and 'underscored', combining their results.
    node().given('lowercased', 'uppercased', 'underscored').outputs('names').with(
        function (lowercased, uppercased, underscored) {
          return {
              lowercased: lowercased.get()
            , uppercased: uppercased.get()
            , underscored: underscored.get()
          }
        }).build()

    // Compose 'names' and verify all final values.
    compose('names').then(function (names) {
      test.equals(names.lowercased, 'david byttow', 'Lowercased name should be correct')
      test.equals(names.uppercased, 'DAVID BYTTOW', 'Uppercased name should be correct')
      test.equals(names.underscored, 'david_byttow', 'Underscored name should be correct')
      test.done()
    })
  }
})