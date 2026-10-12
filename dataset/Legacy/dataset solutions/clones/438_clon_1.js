function howMuch(items, item, s) {
    try {
        var recipe, price = items[item].price,
            sum, flag = false,
            j;
        s = s || [];
        // Debugging: log current item and visited items
        // console.log(item, s);
        if (recipe = items[item].recipe) {
            s.push(item);
            sum = 0;
            flag = true;
            for (j = 0; j < recipe.length; j++) {
                // Check for circular dependencies
                if (s.indexOf(recipe[j]) !== -1) {
                    flag = false;
                    break;
                }
                // Recursively calculate cost of sub-items
                sum += howMuch(items, recipe[j], s);
            }
            // If no circular dependency, update price with minimum
            if (flag) {
                price = min(price, sum);
            }
            s.pop(); // Backtrack
        }
    } catch () {
        // Handle potential errors, e.g., item not found
        throw item;
    }
    return price;
}

// Helper function to find the minimum of two numbers
function min(x, y) {
    return x < y ? x : y;
}

function main() {
    var i, n, m, line,
        len = input.length,
        items;
    // Process each test case
    for (i = 0; i < len;) {
        items = {};
        // Read number of items and their prices
        n = parseInt(input[i++], 10) + i;
        if (n === i) break; // Exit if no items
        for (; i < n; i++) {
            line = input[i].split(' ');
            items[line[0]] = {
                price: parseInt(line[1], 10)
            };
        }
        // Read recipes for items
        m = parseInt(input[i++], 10) + i;
        for (; i < m; i++) {
            line = input[i].split(' ');
            items[line[0]].recipe = line.slice(2);
        }
        // Debugging: log the parsed items
        // console.log(items);
        // Calculate and print the cost of the final item
        console.log(howMuch(items, input[i++]));
    }
}

// Global variable to store input
var input = '';

// Set up standard input stream
process.stdin.resume();
process.stdin.setEncoding('utf8');
// Accumulate input data
process.stdin.on('data', function(chunk) {
    input += chunk;
});
// Process input when stream ends
process.stdin.on('end', function() {
    input = input.split('\n');
    main();
});