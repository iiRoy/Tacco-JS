/*
 * This JavaScript file implements a solution for a programming problem.
 * It calculates the optimal mixture of water and sugar based on given parameters.
 * The 'use strict' directive ensures that the code runs in strict mode.
 */
'use strict';

/**
 * The main function that processes the input and produces the output.
 * @param {string} input - The raw input string from stdin.
 */
function main( input )
{
    // Split the input string into an array of lines.
    const lines = input . split ( '\n' ) ;

    // Parse the first line to get the six integer parameters: A, B, C, D, E, F.
    // The line is split by space, and each part is converted to an integer.
    const ABCDEF = lines . shift ( ) . split ( ' ' ) . map ( x => parseInt ( x ) ) ;

    // Destructure the parameters for clarity.
    // A and B are coefficients for water calculation.
    const A = ABCDEF [ 0 ] ;
    const B = ABCDEF [ 1 ] ;

    // C and D are coefficients for sugar calculation.
    const C = ABCDEF [ 2 ] ;
    const D = ABCDEF [ 3 ] ;

    // E is the maximum sugar concentration percentage.
    // F is the maximum total weight allowed.
    const E = ABCDEF [ 4 ] ;
    const F = ABCDEF [ 5 ] ;

    // Initialize arrays to store possible amounts of water and sugar.
    let water = [ ] ;
    let sugers = [ ] ; // Note: 'sugers' is a typo from the original, preserved as per Type I clone rules.

    // Iterate to generate all possible quantities of water and sugar.
    // i and j represent the number of 'units' of A/B and C/D respectively.
    for ( let i = 0 ; i <= F ; i ++ )
    {
        for ( let j = 0 ; j <= F ; j ++ )
        {
            // Calculate the current amount of water (100*A*i + 100*B*j).
            // Water is always added in 100g units.
            let current_water = 100 * A * i + 100 * B * j ;

            // If the current water amount does not exceed the total capacity F, add it to the list.
            if ( current_water <= F )
            {
                water . push ( current_water ) ;
            }

            // Calculate the current amount of sugar (C*i + D*j).
            let current_suger = C * i + D * j ;

            // If the current sugar amount does not exceed the total capacity F, add it to the list.
            if ( current_suger <= F )
            {
                sugers . push ( current_suger ) ;
            }
        }
    }

    // Initialize an array to store valid combinations of water and sugar.
    let results = [ ] ;

    // Calculate the maximum allowed sugar density.
    // Density = (sugar / (water + sugar)) * 100.
    // The limit is E gram of sugar per 100 gram of water, meaning (E / (100 + E)) * 100 percent.
    let limit_density = 100 * E / ( 100 + E ) ;

    // Iterate through all generated water amounts.
    for ( let i = 0 ; i < water . length ; i ++ )
    {
        // Iterate through all generated sugar amounts.
        for ( let j = 0 ; j < sugers . length ; j ++ )
        {
            // Calculate the total weight of the mixture.
            let total_gram = water [ i ] + sugers [ j ] ;

            // If total_gram is 0, skip to avoid division by zero for density calculation.
            // This case should ideally not happen if water[i] is always >= 100.
            if ( total_gram === 0 ) {
                continue;
            }

            // Calculate the current sugar density.
            let current_density = 100 * sugers [ j ] / total_gram ;

            // Check if the mixture is valid:
            // 1. Total weight must not exceed F.
            // 2. Sugar density must not exceed the limit_density.
            // 3. Water amount must be greater than 0 (no pure sugar solutions).
            //    The original code implies water[i] can be 0 if A=0 and B=0,
            //    but current_water is calculated as 100*A*i + 100*B*j, so it's always >= 100 if A or B > 0.
            //    If A=B=0, then water will contain 0. Let's strictly follow the original logic and not add new conditions.
            if ( ( total_gram <= F ) && ( current_density <= limit_density ) && (water[i] > 0) )
            {
                // If valid, add the water and sugar amounts as a pair to the results.
                results . push ( [ water [ i ] , sugers [ j ] ] ) ;
            }
        }
    }

    // Initialize the best result found so far.
    // Start with the maximum total weight F and 0 sugar, which has 0 density.
    let result = [ F , 0 ] ;

    // Iterate through all valid combinations in the 'results' array.
    for ( let i = 0 ; i < results . length ; i ++ )
    {
        // Calculate the density of the current best result.
        // Avoid division by zero if (result[0] + result[1]) is 0.
        // This initial result [F,0] ensures (result[0]+result[1]) is F, which is >= 0.
        // If F=0, then it's 0, so handle that if necessary.
        let result_total_gram = result[0] + result[1];
        let result_density = (result_total_gram === 0) ? 0 : 100 * result [ 1 ] / result_total_gram ;

        // Calculate the density of the current combination from 'results'.
        let current_total_gram = results[i][0] + results[i][1];
        let current_density = (current_total_gram === 0) ? 0 : 100 * results [ i ] [ 1 ] / current_total_gram ;

        // If the current combination has a higher density than the best result found so far,
        // update the best result.
        if ( current_density > result_density )
        {
            result = [ results [ i ] [ 0 ] , results [ i ] [ 1 ] ] ;
        }
    }

    // The original code had a commented-out console.log(result);
    // console.log(result);

    // Output the total weight (water + sugar) and the sugar amount of the optimal mixture.
    console . log ( ( result [ 0 ] + result [ 1 ] ) + ' ' + result [ 1 ] ) ;
}

// Read the input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;