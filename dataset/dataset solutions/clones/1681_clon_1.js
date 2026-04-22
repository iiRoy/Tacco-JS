/*
 * This is a Type I clone of the original JavaScript code.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the source.
 *
 * Only whitespace (spaces, tabs, newlines) and comments have been modified
 * to create a visually distinct but functionally identical version.
 *
 * The original code's logic and structure are maintained without alteration.
 *
 * The initial comment is replaced with this multi-line explanation.
 * The original code might have had some specific context or optimizations
 * mentioned in its comments, which are now replaced by this general cloning notice.
 */
function         Main(  input)
{
    // Process input string: trim, split by newlines, then split each line by spaces.
    input = input.trim()  .split(  "\n") .map(    function(x) {
        return x.split(" ");
    });

    var l = 1; // 'l' serves as an index for processing different test cases or blocks of input.

    /*
     * This helper function performs a lower bound search on a sorted array.
     * It finds the index of the first element that is not less than 'n'.
     * If all elements are less than 'n', it returns arr.length.
     */
    const lowerBound = (arr, n) => {
        let first = 0,
            last = arr.length - 1,
            middle;

        while (first <= last) {
            middle = 0 | ((first + last) / 2); // Integer division using bitwise OR
            if (arr[middle] < n)
            {
                first = middle + 1;
            }
            else
            {
                last = middle - 1;
            }
        }
        return first;
    };


    // Main loop to process multiple test cases, or blocks of data.
    // It continues until a null input line is encountered, indicating end of data.
    while (true)
    {
        if (input[l] == null)
        {
            break; // Exit loop if no more input lines.
        }

        // Parse N, the number of lines for the current test case.
        var N = parseInt(input[l][0], 10);

        var arr_KLR1 = []; // Stores lines where line[1] > line[2]
        var arr_KLR2 = []; // Stores lines where line[1] < line[2], with transformed values

        var KList1 = []; // List of K-1 values for arr_KLR1
        var KList2 = []; // List of K-1 values for arr_KLR2

        var line; // Temporary variable to hold parsed line data.

        var lowLimit = 0; // Accumulates the minimum possible sum.
        var Nafter = N; // Counter for N, decremented for certain line types.

        // Loop through N lines of data for the current test case.
        for (var i = 0; i < N; i++)
        {
            // Parse the current line into an array of integers.
            line = input[l + i + 1] .map(e => parseInt(e, 10));

            // This console.log appears incomplete in the original code,
            // it is preserved exactly as is to maintain Type I clone definition.
            console.log

            // Conditional logic to categorize and process each line.
            if (line[0] === N)
            {
                lowLimit += line[1];
                Nafter--;
            }
            else if (line[1] > line[2])
            {
                arr_KLR1.push(line);
                lowLimit += line[2];
                KList1.push(line[0] - 1);
            }
            else if (line[1] < line[2])
            {
                // Transform the line for arr_KLR2 storage.
                line = [N - line[0], line[2], line[1]];
                arr_KLR2.push(line);
                lowLimit += line[2];
                KList2.push(line[0] - 1);
            }
            else
            {
                // Case where line[1] === line[2]
                lowLimit += line[1];
                Nafter--;
            }
        }

        // Sort arr_KLR1 and arr_KLR2 based on their first element.
        arr_KLR1.sort((a, b) => a[0] - b[0]);
        arr_KLR2.sort((a, b) => a[0] - b[0]);

        // Sort KList1 and KList2, then filter out duplicate values.
        KList1 = KList1.sort((a, b) => a - b).filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });

        KList2 = KList2.sort((a, b) => a - b).filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });


        var spaceList1 = [[], []]; // Stores intervals and their counts for KList1 related calculations.
        var spaceList2 = [[], []]; // Stores intervals and their counts for KList2 related calculations.

        // Initialize mapping arrays for quick index lookup.
        var getSpaceListIndex1 = Array.from({ length: KList1[KList1.length - 1] + 1 }, () => 0);
        var getSpaceListIndex2 = Array.from({ length: KList1[KList2.length - 1] + 1 }, () => 0);

        var old = -1; // Helper variable for calculating interval lengths.

        // Populate spaceList1 and getSpaceListIndex1 based on KList1.
        for (var i = 0; i < KList1.length; i++)
        {
            spaceList1[0].push(KList1[i] - old);
            spaceList1[1].push(0); // Initialize count for this interval to 0.
            getSpaceListIndex1[KList1[i]] = i;
            old = KList1[i];
        }

        old = -1; // Reset 'old' for the next list.

        // Populate spaceList2 and getSpaceListIndex2 based on KList2.
        for (var i = 0; i < KList2.length; i++)
        {
            spaceList2[0].push(KList2[i] - old);
            spaceList2[1].push(0); // Initialize count for this interval to 0.
            getSpaceListIndex2[KList2[i]] = i;
            old = KList2[i];
        }


        var ans = lowLimit; // Initialize final answer with the calculated lowLimit.
        var bestPlace, tmpSpaceListIndex; // Variables for loop operations.

        // Process arr_KLR1 to maximize the answer.
        for (var i = 0; i < arr_KLR1.length; i++)
        {
            increase = arr_KLR1[i][1] - arr_KLR1[i][2]; // Potential increase in answer.
            tmpSpaceListIndex = getSpaceListIndex1[arr_KLR1[i][0] - 1]; // Get the relevant index.

            // Find an available "space" in spaceList1.
            while (spaceList1[1][tmpSpaceListIndex] === spaceList1[0][tmpSpaceListIndex] && tmpSpaceListIndex >= 0)
            {
                tmpSpaceListIndex--;
            }

            // If a space is found, utilize it and update the answer.
            if (tmpSpaceListIndex >= 0)
            {
                spaceList1[1][tmpSpaceListIndex]++;
                ans += increase;
            }
        }

        // Process arr_KLR2 to maximize the answer, similar to arr_KLR1.
        for (var i = 0; i < arr_KLR2.length; i++)
        {
            increase = arr_KLR2[i][1] - arr_KLR2[i][2]; // Potential increase.
            tmpSpaceListIndex = getSpaceListIndex2[arr_KLR2[i][0] - 1]; // Get relevant index.

            // Find an available "space" in spaceList2.
            while (spaceList2[1][tmpSpaceListIndex] === spaceList2[0][tmpSpaceListIndex] && tmpSpaceListIndex >= 0)
            {
                tmpSpaceListIndex--;
            }

            // If a space is found, utilize it and update the answer.
            if (tmpSpaceListIndex >= 0)
            {
                spaceList2[1][tmpSpaceListIndex]++;
                ans += increase;
            }
        }


        // Output the final calculated answer for the current test case.
        console.log(ans);


        // Increment 'l' to point to the start of the next test case.
        l += N + 1;
    }
}


// Read input from stdin, then call the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));