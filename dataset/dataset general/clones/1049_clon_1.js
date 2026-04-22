/*
 * This file contains benchmarking code for path-parsing libraries.
 * It compares 'path-to-regexp' and 'pathing' for various patterns.
 * Generated as a Type I code clone with extensive whitespace and comment changes.
 */

var Benchmark = require('benchmark') .Benchmark; // Load the Benchmark.js library

var pathing = require('../'); // Custom pathing utility, relative import

var pathToRegexp = require('path-to-regexp'); // Third-party path-to-regexp library


// Initialize a new benchmark suite instance.
var suite = new Benchmark.Suite;


// Declare variables to store results from benchmark runs.
var res0, res1;


// Begin adding test cases to the benchmark suite.

suite
    .add(
        'path-to-regexp',
        function() { // Test case for simple path-to-regexp usage.
            res0 = []; // Ensure results array is clear for each run.
            pathToRegexp(
                '/foo/:bar',
                res0
            );
        }
    )

    .add(
        'path-to-regexp#mutil-parameters',
        function() { // Test with multiple parameterized segments.
            res0 = [];
            pathToRegexp(
                ':year(\\d+)-:month(\\d+)-:day(\\d+)',
                res0
            );
        }
    )

    .add(
        'path-to-regexp#longest',
        function() { // A longer, more complex path pattern.
            res0 = [];
            pathToRegexp(
                '/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format',
                res0
            );
        }
    )

    .add(
        'path-to-regexp#longest...',
        function() { // An even longer, highly complex, and repetitive path pattern.
            res0 = [];
            pathToRegexp(
                '/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format',
                res0
            );
        }
    )

    .add(
        'path-to-regexp#special-characters',
        function() { // Test with a string containing special characters.
            res0 = [];
            pathToRegexp(
                '.=&;?#',
                res0
            );
        }
    )

    .add(
        'pathing',
        function() { // Simple pathing utility test.
            res1 = pathing(
                '/foo/{bar}'
            );
        }
    )

    .add(
        'pathing#mutil-parameters',
        function() { // Pathing with multiple parameters and regex constraints.
            res1 = pathing(
                '{year:\\d+}-{month:\\d+}-{day:\\d+}'
            );
        }
    )

    .add(
        'pathing#longest',
        function() { // Longer pathing pattern.
            res1 = pathing(
                '/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}'
            );
        }
    )

    .add(
        'pathing#longest...',
        function() { // Extremely long and complex pathing pattern.
            res1 = pathing(
                '/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}'
            );
        }
    )

    .add(
        'pathing#special-characters',
        function() { // Pathing with special characters.
            res1 = pathing(
                '.=&;?#'
            );
        }
    )

    // Attach event listeners for the benchmark suite.

    .on('cycle',
        function(event) { // Event listener for each completed benchmark cycle.
            console.log(
                String(event.target)
            );
        }
    )

    .on('complete',
        function() { // Event listener fired when all benchmarks have completed.
            console.log(
                'Fastest is ' + this.filter('fastest').pluck('name') + '.'
            );

            // Output the final results for inspection.
            console.dir(res0);
            console.dir(res1);
        }
    )

    // Run the benchmark suite.
    .run();