// This JavaScript code is designed to solve a specific problem from Aizu Online Judge.
// The problem ID is 2570.
// Original author of this code: Shipura
// URL to the problem statement: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570
//
// Current status of the solution: Not explicitly mentioned in the original source.
// General comments regarding the implementation:
// This program processes a custom expression language involving operations like S<x> and x>>y.
// It reads input from standard input, parses it, and then computes results.
//
//
var log = console.log; // Assigns console.log to a shorter variable 'log' for convenience.


// Checks if the 'process' object is defined, indicating a Node.js environment.
if (typeof process != "undefined")
{
  var input = ""; // Initializes an empty string to accumulate input data.


  // Resumes the stdin stream to begin receiving data.
  process.stdin.resume();


  // Sets the character encoding for stdin to UTF-8.
  process.stdin.setEncoding('utf8');


  // Registers a callback function for the 'data' event on stdin.
  // This function appends each received chunk of data to the 'input' string.
  process.stdin.on('data', function(chunk)
  {
    input += chunk;
  });


  // Registers a callback function for the 'end' event on stdin.
  // This function is called when all input has been received.
  process.stdin.on('end', function()
  {
    // Splits the accumulated input string into an array of lines.
    var lines = input.split("\n");


    // Calls the main processing function with the array of input lines.
    main(lines);
  });
}


/**
 * The main function that orchestrates the processing of all input lines.
 * It iterates through each line and processes it, skipping lines marked as comments.
 * @param {Array<string>} lines - An array of strings, where each string is an input line.
 */
function main(lines)
{
  // Iterates over each line provided in the 'lines' array.
  // The 'this' context is explicitly passed, though not strictly necessary here.
  lines.forEach(function(line)
  {
    // Checks if the current line is not a comment marker ("#").
    if (line != "#")
    {
      // If it's not a comment, the line is passed to the processLine function for further handling.
      processLine(line);
    }
  }, this); // 'this' context for the callback.
}


// Function S(x) calculates x^2 modulo a large prime number.
// S<x> ???????? (Original Japanese comment for S<x> operation)
function S(x)
{
  var d = 1000000007; // Define the modulus, a large prime number used for calculations.


  // Checks for potential overflow before squaring.
  // overflow ?????? (Original Japanese comment: "overflow check")
  if (x > 500000000)
  {
    // If x is too large, it's reduced by 'd' to prevent overflow during x*x.
    // This implies an assumption that x should be within a certain range relative to d.
    x = x - d;
  }


  var p = x * x; // Computes the square of x.


  return p % d; // Returns the result modulo d.
}


// Function T(x, y) calculates x right-shifted by y bits, essentially x / 2^y.
// x>>y ???????? (Original Japanese comment for x>>y operation)
function T(x, y)
{
  // Math.pow(2, y) calculates 2 raised to the power of y.
  // x / Math.pow(2, y) performs the division.
  // Math.floor() rounds the result down to the nearest integer, simulating an integer right shift.
  return Math.floor(x / Math.pow(2, y));
}


// This function removes all whitespace characters and the literal character 'S' from a given line.
// remove s and spaces (Original English comment)
function eliminate(line)
{
  // The regular expression /\s|S/g matches any whitespace character (\s) or the literal character 'S'.
  // The 'g' flag ensures that all occurrences are replaced, not just the first one.
  return line.replace(/\s|S/g, '');
}


// This function checks if a given input 'x' can be successfully converted into a number.
// x is a string (Original Japanese comment translated to English)
function is_number(x)
{
  // Attempts to convert the input 'x' to a number.
  var n = Number(x);


  // Converts the resulting number back to a string.
  var s = n.toString();


  // Returns true if the string representation is not "NaN" (Not-a-Number).
  // This is a common way to check for valid number conversion in JavaScript.
  // Returns true if successfully converted. (Original Japanese comment: ?????£??????true)
  return Boolean(s !== "NaN");
}


// This function divides a line into tokens, separating numbers from operators like '<' and '>'.
// It handles multi-digit numbers correctly.
// <,>,????????? (Original Japanese comment: "split by <, >, numbers")
function divide_1st(line)
{
  // Convert the input string 'line' into an array of individual characters.
  line = line.split('');


  var len = line.length; // Get the length of the character array.
  var start = 0; // Index to mark the beginning of a number.
  var end = 0; // Index to mark the end of a number.
  var new_line = []; // An array to store the processed tokens (numbers or operators).
  var is_now_number = false; // A flag to track if the current sequence of characters forms a number.


  // Iterate through each character in the line.
  for (var i = 0; i < len; i++)
  {
    var e = line[i]; // Get the current character.


    // If not currently parsing a number and the current character is a number digit.
    if (!is_now_number && is_number(e))
    {
      // A number has just started. Record its starting index.
      // ?????????? ?????????????????? ?????????? (Original Japanese: "A number started, so record the start index.")
      start = i;
      is_now_number = true;
    }
    // If currently parsing a number and the current character is NOT a number digit.
    else if (is_now_number && !is_number(e))
    {
      // This path is taken when a number ends.
      // ??????????????????????? else if ????????? (Original Japanese: "This is an else if branch for when a number ends.")
      // The number has ended. Record its ending index.
      // ?????????? ?????????????????? (Original Japanese: "The number has ended, so record the end index.")
      end = i;
      is_now_number = false;


      // Extract the number, convert it, and push to new_line.
      // ?????????? ??????????????? push (Original Japanese: "Push the extracted number.")
      var a = line.slice(start, end); // Get the characters forming the number.
      var s = a.join(''); // Join them back into a string.
      var p = Number(s); // Convert the string to a number.
      new_line.push(p); // Add the numeric token to the result array.
    }


    // If the current character is not a number (it's an operator).
    if (!is_number(e))
    {
      // Push the operator character directly.
      // ?????????? ??????????????? push (Original Japanese: "Push the non-numeric character.")
      new_line.push(e);
    }
  }


  // After the loop, if a number was being parsed at the very end of the line.
  // for ????????????????????? is_now_number ?????????????????? (Original Japanese: "Handle case where is_now_number is true after loop.")
  if (is_now_number)
  {
    end = len; // The end of the number is the end of the line.
    var a = line.slice(start, end); // Extract the final number.
    var s = a.join('');
    var p = Number(s);
    new_line.push(p); // Add it to the result.
  }


  return new_line; // Return the array of tokens.
}


// This function determines if a '>' character is part of an 'S<x>' expression (tokenized as 'q')
// or if it's part of a 'x>>y' expression (tokenized as 't').
// > is S<x>'s > and >> is x>>y's >> (Original Japanese comment translated)
/*
 * Tokenization details for expressions:
 * p   ... corresponds to the '<' character in an S<x> operation.
 * q   ... corresponds to the '>' character in an S<x> operation.
 * L   ... represents a literal number (e.g., 19, 331).
 * t   ... corresponds to the '>>' operator in an x>>y operation.
 *
 * Logic for distinguishing '>' tokens:
 * If a 't' token is encountered, it explicitly means the '>>' operator.
 * If a 'p' token or a literal 'L' is followed by '>>', it forms a 't' operation.
 * If a '>' character is followed by a literal 'L' or a '<' character, then it is
 * considered the closing '>' of an S<x> operation, thus tokenized as 'q'.
 * The core challenge is to correctly parse '>>' as a single operator 't',
 * differentiating it from two separate '>' characters.
 */
function is_q(i, line)
{
  var ret = true; // Assume it's 'q' by default.


  // Check if the next character is also '>'. This indicates a potential '>>'.
  if (line[i + 1] == '>')
  {
    // If it's '>>', then it could be 't'.
    // Further check the character *after* '>>' to confirm if it's 't'.
    if (is_number(line[i + 2]) || line[i + 2] == '<')
    {
      // If '>>' is followed by a number or '<', then it's confirmed to be 't'.
      // t ???????? (Original Japanese: "It's t")
      ret = false; // It's not 'q', it's 't'.
    }
  }


  return ret; // Return the determination (true for 'q', false for 't').
}


// This function converts the divided line into a sequence of specific tokens.
// Numbers are kept as numbers, '<' becomes 'p', '>' becomes 'q', and '>>' becomes 't'.
// Tokenize: < is p, > is q, >> is t. (Original Japanese comment translated)
// Example token sequence: [p, p, p, 10, q, t, 10, q, t, 10, q] (Original Japanese comment)
function tokenizer(line)
{
  // The following variables q_start and q_end appear to be unused in the final code.
  // q_* are variables related to the parsing of '>' as 'q'. (Original Japanese comment)
  var q_start = 0; // This variable is not utilized in the current logic.
  var q_end = 0; // This variable is also not utilized in the current logic.


  // Initialization of the token array.
  // Temporary storage. (Original Japanese: ??´???)
  // Resulting token array. (Original Japanese: ?????????)
  var new_line = [];


  var len = line.length; // Get the length of the input array.


  // Iterate through each element (character or number) in the pre-divided line.
  for (var i = 0; i < len; i++)
  {
    var e = line[i]; // Current element being processed.


    // If the element is a number, push it directly to the new_line array.
    if (is_number(e))
    {
      new_line.push(e);
    }
    // If the element is '<', push 'p' (representing the start of an S<x> operation).
    else if (e === '<')
    {
      new_line.push('p');
    }
    // If the element is '>'.
    else if (e === '>')
    {
      // Check if this '>' is part of a 'q' token (S<x> end) or a 't' token (x>>y operator).
      // Distinguish between q and t. (Original Japanese: ???????????????????)
      if (is_q(i, line))
      {
        // If it's determined to be 'q' (S<x> end).
        // It's q. (Original Japanese: q?????)
        new_line.push('q');
      }
      else
      {
        // If it's determined to be 't' (x>>y operator).
        new_line.push('t');
        i += 1; // Increment 'i' to skip the second '>' character of '>>'.
        // Skip next character because it's '>>'. (Original Japanese: t???????????????)
      }
    }
  }


  return new_line; // Return the tokenized array.
}


// This function evaluates the tokenized expression represented as a flat array,
// effectively performing a tree-like reduction without explicitly building a tree.
// Evaluate the expression. (Original Japanese: ?????????? ??????????????)
function treenize(line)
{
  var len = line.length; // Initial length of the token array. (Note: this 'len' is not actively used for loop control due to splice operations.)
  var i = 0; // Current index for iteration through the token array.


  // Continue processing until only one element (the final result) remains in the array.
  while (line.length > 1)
  {
    var e = line[i]; // Get the current token at index 'i'.


    // If the current token is a number, do nothing, just move to the next.
    if (is_number(e))
    {
      // Numbers are operands and do not trigger an immediate operation; they wait for operators.
    }
    // If the current token is 'p' (start of S<x>), do nothing for now.
    // 'p' tokens are essentially placeholders that are removed when 'q' is processed.
    else if (e == 'p')
    {
      // The 'p' token marks the beginning of an S<x> operation.
      // It will be replaced by the result when the corresponding 'q' is encountered.
    }
    // If the current token is 'q' (end of S<x>).
    else if (e == 'q')
    {
      // When 'q' is found, it signifies the end of an S<x> operation.
      // The structure expected in the array is typically [..., p, number, q, ...].
      // The result of S(number) replaces 'p'.
      line[i - 2] = S(line[i - 1]);


      // Then, the 'number' and 'q' tokens are removed from the array.
      line.splice(i - 1, 2); // Removes 2 elements starting from index (i-1).


      // Adjust the index 'i' because elements have been removed, and the array has shifted.
      // This ensures the next iteration correctly processes the modified array from the right position.
      i = i - 2;
    }
    // If the current token is 't' (x>>y operator).
    else if (e == 't')
    {
      // When 't' is found, it signifies an x>>y operation.
      // The structure expected is [..., number_X, t, number_Y, ...].
      // The result of T(number_X, number_Y) replaces 'number_X'.
      line[i - 1] = T(line[i - 1], line[i + 1]);


      // Then, the 't' and 'number_Y' tokens are removed from the array.
      line.splice(i, 2); // Removes 2 elements starting from index 'i'.


      // Adjust the index 'i' because elements have been removed, and the array has shifted.
      // This ensures the next iteration correctly processes the modified array from the right position.
      i = i - 1;
    }
    // Increment 'i' to move to the next token.
    // If 'i' was decremented due to a splice, this increment ensures the new element at the current
    // position (or the one after it) is correctly considered in the next iteration.
    i++;
  }


  return line; // The array now contains a single element, which is the final computed result.
}


/**
 * Processes a single input line through a series of transformations and calculations.
 * This function orchestrates the entire parsing and evaluation pipeline for one line.
 * @param {string} line - The input string representing an expression.
 */
function processLine(line)
{
  // Step 1: Eliminate specific characters (whitespace and 'S') from the line.
  line = eliminate(line);


  // Step 2: Divide the line into initial tokens (numbers and operators like '<', '>').
  line = divide_1st(line);


  // Step 3: Tokenize the divided line further, converting operators into symbolic tokens ('p', 'q', 't').
  line = tokenizer(line);


  // Step 4: Evaluate the tokenized expression using a reduction process, effectively solving it.
  line = treenize(line);


  // After treenization, the 'line' array should contain only one element, which is the final result.
  line = line[0];


  // Output the final computed result to the console.
  log(line);
}