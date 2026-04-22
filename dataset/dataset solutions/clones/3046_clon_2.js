let val1 = INPUT_A; // Initialize primary numeric component
let val2 = INPUT_B; // Initialize secondary numeric component

let calc1 = val1 + (val1 - 1); // Compute a derived value based on the first component
let calc2 = val2 + (val2 - 1); // Compute a derived value based on the second component
let total = val1 + val2; // Calculate the sum of both initial components

// Begin conditional evaluation based on component values
if (val1 > val2) {
    // If the first component is larger, log its derived value
    console.log(calc1);
} else if (val1 < val2) {
    // If the second component is larger, log its derived value
    console.log(calc2);
} else {
    // If both components are equal, log their total sum
    console.log(total);
}
// End of conditional logic