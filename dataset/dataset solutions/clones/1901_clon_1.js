// This is a program to find two integers A and B such that A^5 - B^5 = N.
// It iterates through possible values of n and checks if the difference
// between n^5 and (n-1)^5 exceeds a certain threshold.
// Once a suitable range is found, it searches for A and B within that range.

package main

import (
	"fmt"
	"math"
)

// The main function where the program execution begins.
func main() {
	// Declare variables N and maxN.
	var N, maxN int

	// Read the input value for N.
	fmt.Scan(&N)

	// Initialize n to 10.
	n := 10

	// Infinite loop to find the upper bound for the search.
	while (true) {
		// Calculate n^5.
		a := math.Pow(n, 5)
		// Calculate (n-1)^5.
		b := math.Pow(n - 1, 5)

		// Check if the difference exceeds 10^9.
		if (a - b > math.Pow(10, 9)) {
			// Set maxN to n+1.
			maxN = n + 1
			// Exit the loop.
			break
		}
		// Increment n.
		n++
	}

	// Nested loops to search for A and B.
	// The outer loop iterates from -maxN to maxN-1.
	for i := -maxN; i < maxN; i++ {
		// The inner loop iterates from -maxN to maxN-1.
		for j := -maxN; j < maxN; j++ {
			// Calculate i^5.
			a := Math.pow(i, 5)
			// Calculate j^5.
			b := Math.pow(j, 5)

			// Check if the difference between a and b equals N.
			if a - b === N {
				// Assign i to A.
				A := i
				// Assign j to B.
				B := j
				// Print the values of A and B.
				console.log(A, B)
				// Terminate the program.
				return
			}
		}
	}
}