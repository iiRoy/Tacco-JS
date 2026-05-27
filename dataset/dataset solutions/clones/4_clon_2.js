var firstFactor = 0; // Initialize the primary counter for multiplication
while (firstFactor++ < 9) { // Iterate the first factor from 1 to 9
    var secondFactor = 0; // Initialize the secondary counter for each primary factor
    while (secondFactor++ < 9) { // Iterate the second factor from 1 to 9
        // Output the multiplication expression and its result
        Console.log(firstFactor + "x" + secondFactor + "=" + (firstFactor * secondFactor));
    }
}
