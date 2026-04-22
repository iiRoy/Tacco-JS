/*
 * This JavaScript code implements the Sieve of Eratosthenes
 * to find all prime numbers up to a given maximum value.
 * It then processes input to find prime neighbors.
 */

function prime ( max )
{
    // Initialize an array to hold numbers up to 'max'.
    // Each index 'i' will initially store the value 'i'.
    var arr = [ ] ;

    // Populate the array with numbers from 0 to max.
    for ( var i = 0 ; i <= max ; i++ )
    {
        arr[i] = i ;
    }

    // Mark 0 and 1 as not prime.
    arr[0] = false ;
    arr[1] = false ;

    // Calculate the square root of max for optimization in the sieve.
    var sqrt = Math.floor ( Math.sqrt ( max ) ) ;

    // Main loop for the Sieve of Eratosthenes.
    // It iterates from 2 up to the square root of max.
    for ( var i = 2 ; i <= sqrt ; i++ )
    {
        // If arr[i] is already marked as false, it's not prime, so skip it.
        if ( arr[i] == false )
        {
            continue ;
        }

        // If arr[i] is prime, mark all its multiples as not prime.
        // Start from i*i (or i+i for the first multiple after i itself)
        // and go up to max, incrementing by i.
        for ( var j = i + i ; j <= max ; j += i )
        {
            arr[j] = false ; // Mark as not prime.
        }
    }

    // After the sieve, collect all the numbers that are still marked as prime.
    var result = [ ] ;

    // Iterate through the array from 0 to max.
    for ( var i = 0 ; i <= max ; i++ )
    {
        // If arr[i] is not false, it means it's a prime number.
        if ( arr[i] !== false )
        {
            result.push ( arr[i] ) ; // Add it to the result list.
        }
    }

    // Return the array of prime numbers.
    return result ;
}

// Generate a list of prime numbers up to 999,999 using the prime function.
var p = prime ( 999999 ) ;


// Read input from standard input.
// This part handles file system operations and input parsing.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace, split the input by newlines, and convert each line to a number.
var Arr = ( input.trim ( ) ) . split ( "\n" ) . map ( Number ) ;

// Process each number from the input array.
for ( var i = 0 ; i < Arr.length ; i++ )
{
    var a = Arr[i] ; // Get the current number from the input.

    // Iterate through the pre-calculated list of prime numbers.
    for ( var j = 0 ; j < p.length ; j++ )
    {
        // If the current prime p[j] matches the input number 'a'.
        if ( p[j] == a )
        {
            // Output the prime before 'a' and the prime after 'a'.
            // Note: This assumes 'a' is a prime in the list and not the first/last.
            console.log ( p[j-1] + " " + p[j+1] ) ;
            break ; // Exit the inner loop as the number is found.
        }

        // If the current prime p[j] is greater than the input number 'a'.
        if ( p[j] > a )
        {
            // Output the prime before p[j] (which is the largest prime less than 'a')
            // and p[j] itself (which is the smallest prime greater than 'a').
            console.log ( p[j-1] + " " + p[j] ) ;
            break ; // Exit the inner loop.
        }
    }
}