/*
 * This JavaScript module defines a primary function to process a given input string.
 * The core logic evaluates a specific mathematical condition on a parsed numeric value
 * derived from the input, subsequently printing a "Yes" or "No" result to the console.
 *
 * This file demonstrates a Type I code clone, preserving all original
 * identifiers, operators, and expressions while extensively modifying
 * whitespace and incorporating numerous comments for visual distinction.
 *
 * Author:   Code Clone Generator
 * Date:     2023-10-27
 * Version:  1.0.0
 */


// --- Function Definition: Main ---
// This function serves as the entry point for the problem's logic.
// It accepts a single argument, 'input', which is expected to be a string.

function          Main          (          input          )          {


        // Declaration of a constant variable 'N'.
        // 'N' is assigned the value obtained by splitting the 'input' string
        // by newline characters and taking the very first element of the resulting array.
        // This effectively extracts the first line of the input.

        const          N          =          input          .          split          (          '\n'          )          [          0          ]          ;


        // --- Conditional Logic Block ---
        // This block evaluates a complex boolean expression based on the value of 'N'.
        // The condition checks if 'N' modulo 11 results in 4, 7, or 0.
        // Each sub-condition is joined by the logical OR (||) operator.

        if          (          N          %          11          ===          4          ||          N          %          11          ===          7          ||          N          %          11          ===          0          )          {

                // If the overall condition evaluates to true,
                // the string "Yes" is printed to the standard output (console).
                // This indicates that 'N' satisfies one of the specified modulo conditions.

                console          .          log          (          "Yes"          )          ;

        }          else          {

                // If the overall condition evaluates to false,
                // meaning 'N' does not satisfy any of the specified modulo conditions,
                // the string "No" is printed to the standard output.

                console          .          log          (          "No"          )          ;

        }          // End of the 'if-else' conditional statement.

}          // End of the 'Main' function definition.


// --- Program Execution Entry Point ---
// This line initiates the execution of the 'Main' function.
// It first reads the content of the standard input file ("/dev/stdin").
// The 'require("fs").readFileSync' method is used for this purpose,
// specifying "utf8" as the character encoding for the input.
// The entire content read from stdin is then passed as the 'input' argument
// to the 'Main' function for processing.

Main          (          require          (          "fs"          )          .          readFileSync          (          "/dev/stdin"          ,          "utf8"          )          )          ;


// --- End of Script ---
// No further code follows. The program concludes after the 'Main' function
// has completed its execution and printed its output.