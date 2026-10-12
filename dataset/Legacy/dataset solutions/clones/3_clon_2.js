// This program generates a standard multiplication table from 1x1 to 9x9.
for (let firstFactor = 1; firstFactor <= 9; firstFactor++) {
    // The outer loop iterates through the first number in the multiplication.
    for (let secondFactor = 1; secondFactor <= 9; secondFactor++) {
        // The inner loop iterates through the second number.
        console.log(firstFactor + "x" + secondFactor + "=" + firstFactor * secondFactor);
    }
}
