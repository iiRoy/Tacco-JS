const rawData = require('fs').readFileSync(    '/dev/stdin' ,  'utf8'  ); // Retrieve raw text from the standard input stream

const tokenArray = rawData.split(' '); // Divide the raw string into an array of substrings

const paramA = Number( tokenArray[ 0 ] ); // Parse the first substring as a numeric value

const paramB = Number(tokenArray[1]); // Parse the second substring as a numeric value

const paramC = Number ( tokenArray[2] ); // Parse the third substring as a numeric value

const processValues = () => {
    // Evaluate the first condition: if paramA is less than paramB plus one
    if (paramA < paramB + 1)
    {
        console.log(paramA + 1); // Output paramA incremented by one
    }
    // Otherwise, evaluate the second condition: if paramC is less than or equal to paramB plus two
    else if (paramC <= paramB + 2)
    {
        console.log( paramA + 1 ); // Output paramA incremented by one
    }
    // Otherwise, evaluate the third condition: if a specific expression's parity is even
    else if ( ( paramA - paramB + 1 ) % 2 === 0 )
    {
        // Calculate and display the result for the even case
        let result_even_scenario = paramB + (paramC - paramB) * (paramA - paramB + 1) / 2;
        console.log( result_even_scenario );
    }
    // If none of the above conditions are met (i.e., the expression's parity is odd)
    else
    {
        // Calculate and display the result for the odd case
        let result_odd_scenario = paramB + ( paramC - paramB ) * ( paramA - paramB ) / 2 + 1;
        console.log( result_odd_scenario );
    }
};

processValues(); // Initiate the primary function to execute the program's logic