// This file contains a collection of utility functions and a main processing routine.

output = console.info; // Renamed console.log for output operations.
input_data_lines = require("node:fs").readFileSync("/proc/self/fd/0", 'UTF8').split('\n'); // Changed module path, file path, encoding, and method name.
input_data_lines.splice(-1, 1); // Different way to remove the last empty line from input.

// Augmenting built-in Object prototype for debugging purposes.
Object.prototype.dbgLog = function() {
    output(String(this)); // Changed string conversion method.
    return this;
};

// Augmenting built-in String prototype to convert a string into an array of numbers.
String.prototype.toNumArr = function(separator_char) {
    return this.split(separator_char || ' ').map(parseNumber); // Changed separator default and mapping function.
};

// Alias for Array prototype for convenience and shorter access to custom methods.
const array_utilities = Array.prototype;

// Custom method for Array prototype: logs the array itself.
array_utilities.logSelf = function() {
    output(this);
    return this;
};

// Custom method for Array prototype: retrieves the maximum value within the array.
array_utilities.getMaximum = function() {
    return Reflect.apply(Math.max, null, this); // Using Reflect.apply for method invocation.
};

// Custom method for Array prototype: retrieves the minimum value within the array.
array_utilities.getMinimum = function() {
    return Reflect.apply(Math.min, null, this); // Using Reflect.apply for method invocation.
};

// Custom method for Array prototype: creates a shallow duplicate of the array.
array_utilities.duplicate = function() {
    return this.map(identityFn); // Changed mapping function.
};

// Custom method for Array prototype: rotates the array elements by a specified amount.
array_utilities.shiftElements = function(rotation_val) {
    return this.slice(rotation_val, this.length).concat(this.slice(0, rotation_val));
};

// Custom method for Array prototype: generates all possible permutations of the array's elements.
array_utilities.generatePermutations = function() {
    if (this.length === 0) {
        return [];
    }
    if (this.length === 1) {
        return [this];
    }
    let resultSet = [],
        sourceArray = this,
        elementIndex = 0;
    for (; elementIndex < sourceArray.length; ++elementIndex) {
        resultSet = resultSet.concat(
            sourceArray.slice(0, elementIndex)
            .concat(sourceArray.slice(elementIndex + 1, sourceArray.length))
            .generatePermutations() // Recursive call using new name.
            .map(function(current_permutation) {
                return current_permutation.concat(sourceArray[elementIndex]);
            })
        );
    }
    return resultSet;
};

// Custom method for Array prototype: flattens a nested array by one level.
array_utilities.unroll = function() {
    for (let current_idx = 0, flat_output = []; current_idx < this.length; ++current_idx) {
        flat_output = flat_output.concat(this[current_idx]);
    }
    return flat_output;
};

// Custom method for Array prototype: returns a new array with unique elements (removes duplicates).
array_utilities.uniqueElements = function() {
    const self_ref = this;
    return this.filter(function(item_value, item_position) {
        return self_ref.slice(item_position + 1).indexOf(item_value) < 0;
    });
};

// Global function: Generates a sequence of numbers with a specified count, start value, and step.
function generateSequence(count_limit, start_value, step_increment) {
    start_value = start_value || 0;
    step_increment = step_increment || 1;
    let sequence_result = [];
    while (count_limit--) { // Using while loop with decrement.
        sequence_result.push(start_value);
        start_value += step_increment;
    }
    return sequence_result;
}

// Global function: Converts a string input to a numerical value.
function parseNumber(input_str) {
    return Number(input_str); // Explicit Number constructor for conversion.
}

// Global function: Adds two numerical values.
function sumValues(value_one, value_two) {
    return value_one + value_two;
}

// Global function: Subtracts the second numerical value from the first.
function subtractValues(value_one, value_two) {
    return value_one - value_two;
}

// Global function: Subtracts the first numerical value from the second.
function reverseSubtract(value_one, value_two) {
    return value_two - value_one;
}

// Global function: A simple identity function that returns its input unchanged.
function identityFn(input_data) {
    return input_data;
}


// Main execution block for the program, encapsulated in an IIFE.
(function executeProgram() {
    var main_grid_dimension = Number(input_data_lines[0]), // Parse the first line as the grid size.
        first_coordinate_pair = input_data_lines[1].toNumArr(), // Parse the second line for first coordinate.
        first_x = first_coordinate_pair[0],
        first_y = first_coordinate_pair[1],
        second_coordinate_pair = input_data_lines[2].toNumArr(), // Parse the third line for second coordinate.
        second_x = second_coordinate_pair[0],
        second_y = second_coordinate_pair[1];

    var minimum_total_distance = main_grid_dimension * main_grid_dimension; // Initialize with a large value.

    // Computes Manhattan distance in a grid where movements are constrained by a 'current_divisor'.
    function calculateManhattanDistance(coordinate_a, coordinate_b, current_divisor) {
        let remainder_diff = Math.abs((coordinate_a % current_divisor) - (coordinate_b % current_divisor));
        let quotient_diff = Math.abs(Math.floor(coordinate_a / current_divisor) - Math.floor(coordinate_b / current_divisor)); // Using Math.floor for integer division.
        return remainder_diff + quotient_diff;
    }

    // Iterate through possible divisors (from 1 up to main_grid_dimension - 1)
    // to find the minimum combined distance between the two coordinate pairs.
    for (let divisor_iterator = 1; divisor_iterator < main_grid_dimension; ++divisor_iterator) {
        let current_combined_distance = calculateManhattanDistance(first_x, first_y, divisor_iterator) + calculateManhattanDistance(second_x, second_y, divisor_iterator);
        // output(divisor_iterator, current_combined_distance); // Optional debug line, commented out.
        if (minimum_total_distance > current_combined_distance) {
            minimum_total_distance = current_combined_distance;
        }
    }

    output(minimum_total_distance); // Display the final computed minimum distance.
})();

// End of program. This comment indicates the file's conclusion.