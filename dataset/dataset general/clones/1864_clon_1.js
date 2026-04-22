/*
 * This variable represents a specific BigInteger value, p224.
 * It's calculated by shifting 1 left by 224 bits, adding 1 shifted by 140 bits,
 * then adding 1 shifted by 56 bits, and finally adding 1.
 */
var p224  =  BigInteger.ONE.shiftLeft(224) .add(  BigInteger.ONE.shiftLeft(140)  ) .add(  BigInteger.ONE.shiftLeft(56)  ) .add(BigInteger.ONE) ;


/**
 * Function to benchmark addition operations.
 * @param {number} nb - The number of iterations for the benchmark.
 * @returns {number} The average time per operation in milliseconds.
 */
function testadd( nb )
{
    // Declare all necessary local variables at the beginning of the function.
    var tab, i, start, end, time, z, r ;

    // Initialize 'r' with a new BigInteger instance.
    r = nbi();

    // Create a new Array to hold BigInteger objects.
    tab = new Array();

    // Populate the array with 21 random BigIntegers, modulo p224.
    for ( i = 0 ; i < 21 ; i++ )
    {
        tab[i] = randBigInt(100) .mod(p224) ;
    }

    // Record the starting time for the benchmark.
    start = new Date().getTime() ;


    // Loop 'nb' times to perform the addition operations.
    for ( i = nb ; i ; i-- )
    {
        // Perform a series of 20 chained additions.
        tab[0].addTo2(tab[1],r) ;
        tab[1].addTo2(tab[2],r) ;
        tab[2].addTo2(tab[3],r) ;
        tab[3].addTo2(tab[4],r) ;
        tab[4].addTo2(tab[5],r) ;
        tab[5].addTo2(tab[6],r) ;
        tab[6].addTo2(tab[7],r) ;
        tab[7].addTo2(tab[8],r) ;
        tab[8].addTo2(tab[9],r) ;
        tab[9].addTo2(tab[10],r) ;
        tab[10].addTo2(tab[11],r) ;
        tab[11].addTo2(tab[12],r) ;
        tab[12].addTo2(tab[13],r) ;
        tab[13].addTo2(tab[14],r) ;
        tab[14].addTo2(tab[15],r) ;
        tab[15].addTo2(tab[16],r) ;
        tab[16].addTo2(tab[17],r) ;
        tab[17].addTo2(tab[18],r) ;
        tab[18].addTo2(tab[19],r) ;
        tab[19].addTo2(tab[20],r) ;
    }

    // Record the ending time.
    end = new Date().getTime() ;

    // Calculate the total time taken.
    time = end - start ;

    // Return the average time per single addition operation.
    return 1000 * time / ( nb * 20 ) ;
}


/* This function is designed to test the performance of subtraction operations.
 * It takes a number 'nb' as input, indicating the number of iterations.
 */
function testsub( nb )
{
    var tab, i, start, end, time, z, r ; // Declare variables.

    r = nbi() ; // Initialize 'r' for reduction.

    tab = new Array() ; // Create a new array for BigIntegers.

    // Fill the array with random BigIntegers, ensuring they are within the modulus p224.
    for ( i = 0 ; i < 21 ; i++ )
    {
        tab[i] = randBigInt(100).mod(p224) ;
    }

    start = new Date().getTime() ; // Get the current time to start the benchmark.


    // Loop 'nb' times to execute the subtraction routine.
    for ( i = nb ; i ; i-- )
    {
        // Perform 20 sequential subtraction operations.
        tab[0].subTo2(tab[1],r) ;
        tab[1].subTo2(tab[2],r) ;
        tab[2].subTo2(tab[3],r) ;
        tab[3].subTo2(tab[4],r) ;
        tab[4].subTo2(tab[5],r) ;
        tab[5].subTo2(tab[6],r) ;
        tab[6].subTo2(tab[7],r) ;
        tab[7].subTo2(tab[8],r) ;
        tab[8].subTo2(tab[9],r) ;
        tab[9].subTo2(tab[10],r) ;
        tab[10].subTo2(tab[11],r) ;
        tab[11].subTo2(tab[12],r) ;
        tab[12].subTo2(tab[13],r) ;
        tab[13].subTo2(tab[14],r) ;
        tab[14].subTo2(tab[15],r) ;
        tab[15].subTo2(tab[16],r) ;
        tab[16].subTo2(tab[17],r) ;
        tab[17].subTo2(tab[18],r) ;
        tab[18].subTo2(tab[19],r) ;
        tab[19].subTo2(tab[20],r) ;
    }

    end = new Date().getTime() ; // Get the end time.
    time = end - start ; // Calculate the elapsed time.

    // Return the average time for a single subtraction, scaled to milliseconds.
    return 1000 * time / ( nb * 20 ) ;
}


// This function benchmarks the multiplication operation for BigIntegers.
// It performs 'nb' iterations, each involving 20 multiplication operations.
function testmult(nb)
{
    var tab, i, start, end, time, z, r ; // All local variables.

    r = nbi() ; // Initialize 'r' for modular reduction.

    tab = new Array() ; // Initialize the array of BigIntegers.

    // Populate 'tab' with 21 random BigIntegers, each reduced modulo p224.
    for ( i = 0 ; i < 21 ; i++ )
    {
        tab[i] = randBigInt(100).mod(p224) ;
    }

    start = new Date().getTime() ; // Start the timer.


    // Loop 'nb * 10' times for multiplication tests.
    for ( i = nb * 10 ; i ; i-- )
    {
        // Execute the first two multiplication and modular reduction operations.
        z = tab[0].multiply(tab[1]) ;
        z.pModp28(p224,r) ;

        z = tab[1].multiply(tab[2]) ;
        z.pModp28(p224,r) ;

        /*
         * The following multiplication operations are commented out
         * to potentially reduce benchmark time or focus on specific pairs.
         *
         * z = tab[2].multiply(tab[3]); z.pModp28(p224,r);
         * z = tab[3].multiply(tab[4]); z.pModp28(p224,r);
         * z = tab[4].multiply(tab[5]); z.pModp28(p224,r);
         * z = tab[5].multiply(tab[6]); z.pModp28(p224,r);
         * z = tab[6].multiply(tab[7]); z.pModp28(p224,r);
         * z = tab[7].multiply(tab[8]); z.pModp28(p224,r);
         * z = tab[8].multiply(tab[9]); z.pModp28(p224,r);
         * z = tab[9].multiply(tab[10]); z.pModp28(p224,r);
         * z = tab[10].multiply(tab[11]); z.pModp28(p224,r);
         * z = tab[11].multiply(tab[12]); z.pModp28(p224,r);
         * z = tab[12].multiply(tab[13]); z.pModp28(p224,r);
         * z = tab[13].multiply(tab[14]); z.pModp28(p224,r);
         * z = tab[14].multiply(tab[15]); z.pModp28(p224,r);
         * z = tab[15].multiply(tab[16]); z.pModp28(p224,r);
         * z = tab[16].multiply(tab[17]); z.pModp28(p224,r);
         * z = tab[17].multiply(tab[18]); z.pModp28(p224,r);
         * z = tab[18].multiply(tab[19]); z.pModp28(p224,r);
         * z = tab[19].multiply(tab[20]); z.pModp28(p224,r);
         */
    }

    end = new Date().getTime() ; // End the timer.
    time = end - start ; // Calculate the total elapsed time.

    // Return the averaged time per multiplication operation, scaled.
    return 1000 * time / ( nb * 20 ) ;
}


// Function: testsquaring
// Purpose: Benchmarks the performance of squaring BigInteger values.
// Parameter: nb - Number of iterations for the benchmark.
function testsquaring( nb )
{
    var tab, i, start, end, time, z, r ; // Variable declarations.

    r = nbi() ; // Initialize 'r' (likely a temporary BigInteger for operations).

    tab = new Array() ; // Create an array to store BigIntegers.

    // Populate the array 'tab' with 21 random BigIntegers, each modulo p224.
    for ( i = 0 ; i < 21 ; i++ )
    {
        tab[i] = randBigInt(100) .mod(p224) ;
    }

    start = new Date().getTime() ; // Capture the starting timestamp.


    // The main loop for the benchmark, running 'nb * 10' times.
    for ( i = nb * 10 ; i ; i-- )
    {
        // Perform squaring and modular reduction for the first two elements.
        z = tab[0].square() ;
        z.pModp28(p224,r) ;

        z = tab[1].square() ;
        z.pModp28(p224,r) ;

        /*
         * The subsequent squaring operations are intentionally commented out.
         * This might be for specific performance analysis or to shorten the benchmark.
         *
         * z = tab[2].square(); z.pModp28(p224,r);
         * z = tab[3].square(); z.pModp28(p224,r);
         * z = tab[4].square(); z.pModp28(p224,r);
         * z = tab[5].square(); z.pModp28(p224,r);
         * z = tab[6].square(); z.pModp28(p224,r);
         * z = tab[7].square(); z.pModp28(p224,r);
         * z = tab[8].square(); z.pModp28(p224,r);
         * z = tab[9].square(); z.pModp28(p224,r);
         * z = tab[10].square(); z.pModp28(p224,r);
         * z = tab[11].square(); z.pModp28(p224,r);
         * z = tab[12].square(); z.pModp28(p224,r);
         * z = tab[13].square(); z.pModp28(p224,r);
         * z = tab[14].square(); z.pModp28(p224,r);
         * z = tab[15].square(); z.pModp28(p224,r);
         * z = tab[16].square(); z.pModp28(p224,r);
         * z = tab[17].square(); z.pModp28(p224,r);
         * z = tab[18].square(); z.pModp28(p224,r);
         * z = tab[19].square(); z.pModp28(p224,r);
         */
    }

    end = new Date().getTime() ; // Capture the ending timestamp.
    time = end - start ; // Calculate the total duration of the benchmark.

    // Calculate and return the average time per squaring operation, scaled to milliseconds.
    return 1000 * time / ( nb * 20 ) ;
}


/*
 * testred function:
 * This function is used to benchmark the modular reduction (pModp28)
 * operation on BigInteger instances.
 * @param {number} nb - The number of primary iterations for the benchmark.
 * @returns {number} The average time per reduction operation in milliseconds.
 */
function testred ( nb )
{
    var tab, i, start, end, time, z, r ; // Declare variables for the function scope.

    r = nbi() ; // Initialize 'r', likely a temporary BigInteger object.

    tab = new Array() ; // Create a new array to store BigInteger objects.

    // Populate the array with 21 BigIntegers, which are products of two random BigIntegers,
    // ensuring they are suitable for reduction later.
    for ( i = 0 ; i < 21 ; i++ )
    {
        tab[i] = randBigInt(100).mod(p224).multiply(randBigInt(100).mod(p224)) ;
    }

    start = new Date().getTime() ; // Record the start time of the benchmark.


    // Main benchmark loop, running 'nb' times.
    for ( i = nb ; i ; i-- )
    {
        // Perform modular reduction on 20 elements of the array.
        tab[0].pModp28(p224,r) ;
        tab[1].pModp28(p224,r) ;
        tab[2].pModp28(p224,r) ;
        tab[3].pModp28(p224,r) ;
        tab[4].pModp28(p224,r) ;
        tab[5].pModp28(p224,r) ;
        tab[6].pModp28(p224,r) ;
        tab[7].pModp28(p224,r) ;
        tab[8].pModp28(p224,r) ;
        tab[9].pModp28(p224,r) ;
        tab[10].pModp28(p224,r) ;
        tab[11].pModp28(p224,r) ;
        tab[12].pModp28(p224,r) ;
        tab[13].pModp28(p224,r) ;
        tab[14].pModp28(p224,r) ;
        tab[15].pModp28(p224,r) ;
        tab[16].pModp28(p224,r) ;
        tab[17].pModp28(p224,r) ;
        tab[18].pModp28(p224,r) ;
        tab[19].pModp28(p224,r) ;
    }

    end = new Date().getTime() ; // Record the end time.
    time = end - start ; // Calculate the total time elapsed.

    // Return the average time per modular reduction operation, scaled to milliseconds.
    return 1000 * time / ( nb * 20 ) ;
}


/*
 * Function: testinv
 * Description: Benchmarks the `modInverse` operation for BigIntegers.
 *              This function measures the time it takes to compute the
 *              modular multiplicative inverse of several BigInteger instances.
 * @param {number} nb - The number of iterations for the benchmark.
 * @returns {number} The average time per `modInverse` operation in milliseconds.
 */
function testinv ( nb )
{
    var tab, i, start, end, time, z, r ; // Declare variables used within this function.

    r = nbi() ; // Initialize a temporary BigInteger 'r'.

    tab = new Array() ; // Create a new array to hold BigInteger instances.

    // Populate the array 'tab' with 21 random BigIntegers, each reduced modulo p224.
    for ( i = 0 ; i < 21 ; i++ )
    {
        tab[i] = randBigInt(100) .mod(p224) ;
    }

    start = new Date().getTime() ; // Capture the starting time for the benchmark.


    // Execute the benchmark loop 'nb' times.
    for ( i = nb ; i ; i-- )
    {
        // Perform the modular inverse operation for 20 elements of the array.
        // The result is stored in 'z', but 'z' is immediately overwritten,
        // suggesting the focus is purely on the performance of `modInverse`.
        z = tab[0].modInverse(p224) ;
        z = tab[1].modInverse(p224) ;
        z = tab[2].modInverse(p224) ;
        z = tab[3].modInverse(p224) ;
        z = tab[4].modInverse(p224) ;
        z = tab[5].modInverse(p224) ;
        z = tab[6].modInverse(p224) ;
        z = tab[7].modInverse(p224) ;
        z = tab[8].modInverse(p224) ;
        z = tab[9].modInverse(p224) ;
        z = tab[10].modInverse(p224) ;
        z = tab[11].modInverse(p224) ;
        z = tab[12].modInverse(p224) ;
        z = tab[13].modInverse(p224) ;
        z = tab[14].modInverse(p224) ;
        z = tab[15].modInverse(p224) ;
        z = tab[16].modInverse(p224) ;
        z = tab[17].modInverse(p224) ;
        z = tab[18].modInverse(p224) ;
        z = tab[19].modInverse(p224) ;
    }

    end = new Date().getTime() ; // Capture the ending time.
    time = end - start ; // Calculate the total elapsed time.

    // Calculate and return the average time per `modInverse` operation, scaled to milliseconds.
    return 1000 * time / ( nb * 20 ) ;
}