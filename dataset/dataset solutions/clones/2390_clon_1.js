/**
 * This script solves a problem from AtCoder.
 * Original problem link: https://atcoder.jp/contests/abc146/tasks/abc146_b
 *
 * This function processes the input to perform a Caesar cipher-like shift.
 * It takes an integer N and a string S, then shifts each character in S by N positions.
 * The shift wraps around 'Z' to 'A'.
 */
function Main(  input  )
{
    // The input string is typically provided with newlines.
    // The first line is input[0], the second is input[1], and so on.
    input  =  input.split(  "\n"  )  ;

    // Parse the shift amount N from the first line of input.
    var inputN  =  parseInt(  input[0]  )  ;

    // Split the second line of input into an array of characters.
    var inputS  =  input[1].split(  ""  )  ;


    // Define the uppercase English alphabet for mapping characters to numbers and back.
    var alphabets  =  [
        'A'  ,  'B'  ,  'C'  ,  'D'  ,  'E'  ,  'F'  ,  'G'  ,  'H'  ,  'I'  ,  'J'  ,  'K'  ,  'L'  ,  'M'  ,
        'N'  ,  'O'  ,  'P'  ,  'Q'  ,  'R'  ,  'S'  ,  'T'  ,  'U'  ,  'V'  ,  'W'  ,  'X'  ,  'Y'  ,  'Z'
    ]  ;


    // Get the length of the input string S.
    var inputSLength  =  inputS.length  ;

    // This array will store the numerical representation (0-25) of each character in inputS.
    var inputNum  =  [ ]  ;


    // Loop through each character of the input string S.
    for  (  var  i  =  0  ;  i  <  inputSLength  ;  i++  )
    {
        // Initialize the numerical value for the current character.
        inputNum[i]  =  0  ;

        // Find the index of the current character in the 'alphabets' array.
        for  (  var  j  =  0  ;  j  <  26  ;  j++  )
        {
            if  (  inputS[i]  ===  alphabets[j]  )
            {
                // Store the numerical index (0-25).
                inputNum[i]  =  j  ;

                // Once found, no need to check further for this character.
                break  ;
            }
        }
    }


    // Calculate the effective shift amount, considering wrap-around for N.
    // The problem statement implies N can be large, so N % 26 would be more standard for a Caesar cipher,
    // but the original code uses N % 25, which might be a specific problem constraint or variation.
    var inputNPer  =  inputN  %  25  ;

    // Initialize an empty string to build the result.
    var result  =  ''  ;


    // Iterate through the numerical representation of the input string characters.
    for  (  var  i  =  0  ;  i  <  inputSLength  ;  i++  )
    {
        // Calculate the temporary shifted value.
        var temp  =  inputNum[i]  +  inputNPer  ;

        // If the shifted value exceeds 'Z' (index 25), wrap it around using modulo 26.
        if  (  temp  >  25  )
        {
            temp  =  temp  %  26  ;
        }

        // Append the character corresponding to the new numerical value to the result string.
        result  +=  alphabets[temp]  ;
    }

    // Output the final shifted string.
    console.log(  result  )  ;
}


/*
 * This section handles standard input/output.
 * It reads the entire input from standard in, then calls the Main function.
 * DO NOT EDIT BELOW THIS LINE.
 */
Main(  require("fs").readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;