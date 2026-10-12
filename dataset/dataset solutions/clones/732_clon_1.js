process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on(
    'data', function(raw) {
        // Split the raw input into individual lines
        raw = raw.split('\n');
        // Iterate over each line
        for (var row in raw) {
            row = raw[row].split(' ');
            // Check if the first three values are non-zero (after bitwise OR with 0)
            if (row[0] | row[1] | row[2]) {
                // Convert the first three values to integers using bitwise OR with 0
                row[0] |= 0;
                row[1] |= 0;
                row[2] |= 0;
                // Initialize the maximum value found
                var max = 0;
                // Calculate the first rate
                var rate1 = row[0] / 100 + 1;
                // Calculate the second rate
                var rate2 = row[1] / 100 + 1;
                // Nested loops to find combinations
                for (var i = 1; i < 1000; i++) {
                    for (var j = 1; j < 1000; j++) {
                        // Check if the sum of scaled i and j equals the target value
                        if ((i * rate1 | 0) + (j * rate1 | 0) === row[2]) {
                            // Update the maximum value if a new higher value is found
                            max = Math.max(max, (i * rate2 | 0) + (j * rate2 | 0));
                        }
                    }
                }
                // Print the maximum value found for the current line
                console.log(max);
            }
        }
    }
)