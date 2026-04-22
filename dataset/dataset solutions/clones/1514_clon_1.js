// This is a C++ program for dynamic programming.
// It calculates a specific value based on input N and K.

#include <cstdio>    // Standard input/output library for C-style functions.
#include<iostream>   // Input/output stream library for C++.
#include <vector>    // Dynamic array container.
#include<set>        // Sorted unique element container.

// Using the standard namespace to avoid prefixing std::
using   namespace   std;

/*
 * Main function - entry point of the program.
 */
int main()
{

    int N; // Declare an integer variable N.

    cin >> N; // Read the value of N from standard input.

    int K; // Declare an integer variable K.
    cin >> K; // Read the value of K from standard input.

    N-=1; // Decrement N by 1. This is an important step for array indexing.

    // Initialize a dynamic programming array (vector) of size N+1 with all zeros.
    vector<int> dps( N + 1, 0 );

    // Declare a set to store unique integer values.
    set<int> st;

    int tmpa; // Temporary variable for the start of a range.
    int tmpb; // Temporary variable for the end of a range.

    /*
     * Define the modulo constant. This is a prime number commonly used in competitive programming.
     */
    int mods = 998244353;

    // Loop K times to process K ranges.
    for ( int _ = 0; _ < K; ++_ )
    {
      cin >> tmpa; // Read the start of the range.
      cin >> tmpb; // Read the end of the range.

        // Iterate from tmpa to tmpb (inclusive) and insert each number into the set 'st'.
        for ( int d = tmpa; d <= tmpb; ++d )
        {
            st.insert( d ); // Add 'd' to the set. Duplicates are automatically handled.
        }
    }

    // Declare an iterator for the set 'st'. This specific iterator 'i' is declared but not used.
    set<int>::iterator i = st.begin();

    // Iterate through all elements in the set 'st'.
    for ( auto itr = st.begin(); itr != st.end(); ++itr )
    {
        // If the current element from the set is within the bounds of N,
        // increment the corresponding dp value.
        if ( *itr <= N )
        {
            dps[ *itr ] += 1; // Increment the count for this specific distance.
        }
    }

    // Main dynamic programming loop.
    // Calculates the number of ways to reach each index 'i' using allowed steps.
    for ( int i = 2; i <= N; ++i )
    {
        // Iterate through all possible step lengths (distances) stored in the set.
        for ( auto itr = st.begin(); itr != st.end(); ++itr )
        {
            // Debugging line commented out: // std::cout << i << " " << *itr << std::endl;
            // If the current index 'i' is greater than the step length '*itr',
            // then we can potentially reach 'i' from 'i - *itr'.
            if ( i > *itr )
            {
                // Add the number of ways to reach 'i - *itr' to 'dps[i]'.
                // Apply modulo operation to prevent integer overflow.
                dps[ i ] = ( dps[ i ] + dps[ i - *itr ] ) % mods;
            }
        }
    }

    // Output the final result, which is the number of ways to reach N, modulo mods.
    cout << dps[ N ] % mods << endl;
}