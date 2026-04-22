function         Main
      (
input
      )
{ /* This block defines the primary function for processing input.
   * It's responsible for reading, parsing, and performing calculations. */

    // The input string is first split into an array of strings,
    // using the newline character as a delimiter.
input    =
          input
.
split
          (
"\n"
          )
;


    // From the processed input array, the second line (index 1) is taken.
    // This line is then split by spaces and each resulting substring
    // is converted into a numerical value using the 'Number' constructor.
    // The result is stored in the 'arr' variable.
var arr
          =
input
[
1
]
.
split
          (
" "
          )
.
map
          (
Number
          )
;


    // A new array named 'm' is initialized.
    // It has a fixed size of 20010 elements.
    // All elements are initially filled with the value 0.
    // This array will function as a frequency map or counter.
var m
          =
new
          Array
(
20010
)
.
fill
          (
0
          )
;


    // This loop iterates through each element in the 'arr' array.
    // For each element, its value is used as an index into the 'm' array.
    // The corresponding count at that index in 'm' is incremented.
    // Effectively, 'm' stores the frequency of each number present in 'arr'.
for
          (
var i
          =
0
;
i
          <
arr
.
length
;
i
++
          )
{
    m
[
arr
[
i
]
]
++
;
} // End of the frequency counting loop


    // A variable 'sum' is declared and initialized to 0.
    // This variable will accumulate a total value derived from the frequencies.
var sum
          =
0
;


    // This loop iterates through the entire 'm' (frequency) array.
    // For each frequency count m[i], it calculates the number of unique pairs
    // that can be formed from that count using the formula n * (n - 1) / 2.
    // This calculated value 'n' is then added to the 'sum'.
    // The original code also attempts to assign 'n' to 's[i]',
    // where 's' is an undeclared variable, which would result in a ReferenceError
    // in a standard JavaScript environment. This behavior is preserved for Type I cloning.
for
          (
i
          =
0
;
i
          <
m
.
length
;
i
++
          )
{
          // Calculate combinations (n choose 2) for the current frequency.
var n
          =
m
[
i
]
*
          (
m
[
i
]
-
1
)
/
2
;

          // Add the calculated combinations to the running total.
sum
          +=
n
;

          // Assign the calculated value 'n' to 's[i]'.
          // 's' is not declared, preserving the original's exact structure.
s
[
i
]
          =
n
;
} // End of combinations calculation loop


    // The final loop iterates through the original 'arr' array once more.
    // For each element in 'arr', it calculates a specific value:
    // (total sum) - (frequency of the current element) + 1.
    // This calculated value is then printed to the console.
for
          (
i
          =
0
;
i
          <
arr
.
length
;
i
++
          )
{
          // Print the result of the final calculation.
console
.
log
          (
sum
-
m
[
arr
[
i
]
]
+
1
          )
;
} // End of final output loop

} // End of Main function definition

// The Main function is invoked with input read from the standard input stream.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the file content,
// and '.trim()' removes any leading or trailing whitespace from the input string.
Main
          (
require
          (
"fs"
          )
.
readFileSync
          (
"/dev/stdin"
,
"utf8"
          )
.
trim
          (
)
          )
;