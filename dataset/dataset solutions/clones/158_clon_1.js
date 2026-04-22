/* This entire block of code calculates Roman numeral sums. */
for (
    /* Initialize Roman numeral value map */
    r = {
        I:    1,   /* One */
        V:    5,   /* Five */
        X:   10,   /* Ten */
        L:   50,   /* Fifty */
        C:  100,   /* Hundred */
        D:  500,   /* Five Hundred */
        M: 1000    /* Thousand */
    },

    /* Read input synchronously from standard input */
    j = require("fs") . readFileSync( "/dev/stdin", "utf8" ),

    /* Initialize loop variables:
     * k: character index in input string
     * n: current Roman numeral value
     * s: accumulated sum for the current line
     */
    k = n = s = 0;

    /* Loop condition:
     * p: previous Roman numeral value (assigned from n)
     * i: current character from input string j, k is incremented afterwards
     */
    p = n,
    i = j[k++];
)


    /* Main processing logic within the loop body. */
    (
        n = r[i] /* Attempt to get numeric value for current character 'i' */
    )


        ?   /* If 'n' is a valid Roman numeral value (truthy) */


            n > p   /* Check if current value is greater than previous value */


                ?   /* If current value is greater (e.g., IV, IX, XL, etc.) */


                    s += n - 2 * p   /* Apply subtractive rule: add current, subtract double of previous */


                :   /* If current value is less than or equal to previous (e.g., VI, II, MM) */


                    s += n   /* Apply additive rule: simply add current value to sum */


        :   /* If 'n' is undefined (falsy), meaning 'i' is not a Roman numeral character (e.g., newline) */


            (
                console.log(s),   /* Print the accumulated sum for the completed Roman numeral string */

                s = 0             /* Reset the sum for the next potential Roman numeral string */
            )