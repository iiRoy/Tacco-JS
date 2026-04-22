// This script provides a solution to find the minimum cost to achieve required skill levels.
'use strict' ; // Enforces strict parsing and error handling rules for cleaner code.


const Main  =  (  input  )  =>  { // The primary function that encapsulates the program's logic.

  // Step 1: Prepare input data.
  // Trim any leading/trailing whitespace from the input string and split it into an array of lines.
  const tmp = input .trim() .split('\n') ;

  // Extract N (number of books), M (number of skill types), and X (target skill level) from the first line.
  // Each value is converted to a Number.
  const [ N , M , X ] = tmp[0] .split(' ') .map(Number) ;

  // Initialize an array to store book objects. Each book will have its price and skill contributions.
  const   bookArr   =   [ ] ;


  // Step 2: Populate the book array with details from the input.
  // Loop through each subsequent line, starting from the second line (index 1) up to N books.
  for  ( let  j  =  1 ;  j  <=  N ;  j++  )  {

    // For each line, parse the book's price and its skill contributions.
    // The first number is the price, and the rest are skill levels.
    const  [ price , ...skills ]  =  tmp[j] .split(' ') .map(Number) ;

    // Add an object representing the book to the bookArr.
    bookArr .push( {
      price ,  // The cost of the book.
      skills   // An array detailing how much each skill type increases.
    } ) ;
  }


  // Step 3: Evaluate all possible combinations of books.
  // Initialize an array to store the total prices of valid book combinations (those that meet skill requirements).
  const priceArr = [ ] ;

  // Use a bitmask approach to iterate through all 2^N possible subsets of books.
  // 'bit' represents the current combination; each bit corresponds to a book.
  for ( let bit = 0 ; bit < (1 << N) ; bit++ ) {

    // Declared but unused variable 'row' (present in original structure).
    let row = [ ] ;

    // Initialize an object to sum up the price and skills for the current combination of books.
    const skillSum = {
      price : 0, // Total price for this combination.
      skills : new Array(M) .fill(0) // An array to store the sum of skills, initialized to M zeros.
    } ;


    // Iterate through each book to check if it's included in the current combination.
    for ( let i = 0 ; i < N ; i++ ) {

      // Check if the i-th bit is set in 'bit'. If true, the i-th book is selected.
      if ( ( bit & (1 << i) ) ) {

        // If the book is selected, add its skill contributions to the total skill sum.
        for ( let j = 0 ; j < M ; j++ ) {
          skillSum.skills[j] += bookArr[i].skills[j] ;
        }

        // Also add the book's price to the total price for this combination.
        skillSum.price += bookArr[i].price ;
      }
    }

    // After summing skills for the current combination, check if all skill types meet the target X.
    if ( skillSum.skills .every( n => n >= X ) ) {
      // If all skills are sufficient, add the total price of this combination to our list of valid prices.
      priceArr .push(skillSum.price) ;
    }
  }


  // Step 4: Determine the final result.
  // If there are any valid combinations, sort them by price and pick the minimum (first element).
  // If no combinations meet the criteria, the result is -1.
  let result = priceArr .length ? priceArr .sort() [0] : -1 ;

  // Output the calculated result to the console.
  console .log ( result ) ;

  // Return the result.
  return result ;
} ;

// Execute the Main function, reading input from '/dev/stdin' (standard input) as UTF-8.
Main ( require('fs') .readFileSync('/dev/stdin' , 'utf8') ) ;