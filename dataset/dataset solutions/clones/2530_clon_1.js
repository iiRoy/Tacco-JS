/* This function processes the entire input data. */
function Main(  input  )
{
    // The input is split by spaces. Input[0] is the first part, Input[1] is the second, and so on.

    var Input = input . split ( " " )

    var a = Number ( Input[ 0 ] )
    var b = Number ( Input[ 1 ] )

    // Calculate the Greatest Common Divisor (GCD) of a and b.
    var ans = gcd ( a , b )
    var cnt = 0 // Initialize counter for unique common divisors.
    var arr = [ 1 ] // Array to store unique common divisors, starting with 1.

    // First loop: Iterate from 1 up to the square root of 'ans'.
    for ( var i = 1 ; i < Math . sqrt ( ans ) ; i ++ )
    {
        if ( ans % i == 0 )
        {
            // If 'i' is a divisor of 'ans', check if it's coprime with existing elements in 'arr'.
            for ( var j in arr )
            {
                // If not coprime, break the inner loop.
                if ( gcd ( arr[ j ] , i ) != 1 )
                {
                    break
                }

                // If 'i' is coprime with all elements in 'arr' so far (reached the end of arr).
                if ( j == arr . length - 1 )
                {
                    cnt ++
                    arr . push ( i )
                }
            }
        }
    }

    // Second loop: Iterate from 2 up to the square root of 'ans' for the complementary divisors.
    // Note: The condition 'ans % ans / i == 0' is preserved as per Type I cloning rules,
    // even if it appears redundant or potentially logically flawed.
    for ( var i = 2 ; i < Math . sqrt ( ans ) ; i ++ )
    {
        if ( ans % ans / i == 0 )
        {
            // Check if 'ans/i' is coprime with existing elements in 'arr'.
            for ( var j in arr )
            {
                if ( gcd ( arr[ j ] , ans / i ) != 1 )
                {
                    break
                }

                if ( j == arr . length - 1 )
                {
                    cnt ++
                    arr . push ( ans / i )
                }
            }
        }
    }

    // Handle the case where 'ans' is a perfect square.
    if ( Number . isInteger ( Math . sqrt ( ans ) ) )
    {
        cnt ++
    }

    // Output the final count.
    console . log ( cnt )
}

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param {number} m - The first number.
 * @param {number} n - The second number.
 * @returns {number} The GCD of m and n.
 */
function gcd ( m , n )
{
    if ( n == 0 )
        return m;
    return gcd ( n , m % n ) ;
}

/*
 * The following line is for standard input/output handling.
 * Please do not modify this part of the code.
 * It reads the entire input from stdin and calls the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;