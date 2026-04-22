function         main(     arg) { // This is the main function that processes the input argument.

    // Parse the first line of input to get n and k.
    let [n,k] = arg.split("\n")[0].split(" ").map(Number)

    // Parse the second line of input to get the array 'a'.
    let a        = arg.split("\n")[1].split(" ").map(Number)


    let sum = 1 // Initialize the 'sum' variable.
    let mod = 10**9 + 7 // Define the modulo constant.

    // This section initializes the sum for the first window of 'k' elements.
    // Initialization phase: calculate the product of the first 'k' elements.
    for (let i = 0; i < k; i++) {
        sum = sum * a[i] % mod // Multiply and apply modulo.

        sum %= mod // Ensure sum stays within modulo bounds after multiplication.
    }
    // The previous console.log was commented out.

    let nextSum // Declare a variable to hold the sum for the next window.

    // Iterate through the array to calculate sums for sliding windows.
    for (let i = 1; i < n - k + 1; i++) {
        // The debug console.log was commented out.


        // Calculate the next window sum using the previous sum.
        // This effectively removes a[i-1] and adds a[i+k-1].
        nextSum = sum * a[i+k-1] / a[i-1] // This division assumes a[i-1] is not zero.

        // The debug console.log for nextSum was commented out.
        if(nextSum > sum) console.log("Yes") // Compare the current window sum with the previous.
        else console.log("No") // Output "No" if nextSum is not greater than sum.
        nextSum %= mod // Apply modulo to nextSum.
        sum = nextSum // Update sum to the new window's sum.
        // The commented out modulo operation.
        // The commented out console.log for sum.
    }
}

// Call the main function with input read from stdin.
main( require("fs").readFileSync("/dev/stdin", "utf8") );