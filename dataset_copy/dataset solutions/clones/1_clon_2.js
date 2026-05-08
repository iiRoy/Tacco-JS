// Declaration of two numerical iterators for the multiplication process.
let primaryFactor, secondaryFactor;

// This helper function is responsible for displaying the result of a single multiplication.
const printCalculation = (numA, numB, productResult) => {
  // Construct a descriptive string using template literals for clarity.
  const displayString = `${numA} multiplied by ${numB} yields ${productResult}`;
  // Output the formatted string to the console's information stream.
  console.info( displayString );
};

// Initiate the primary iteration loop, representing the first operand.
// It counts upwards from the value of one to the value of nine, inclusively.
for
    (
        primaryFactor = 1;

        primaryFactor <= 9;

        primaryFactor++
    )
{
    // Begin the secondary, nested iteration loop, representing the second operand.
    // This loop also progresses from one up to and including nine.
    for
        (
            secondaryFactor = 1;

            secondaryFactor <= 9;

            secondaryFactor++
        )
    {
        // Compute the numerical product of the current primary and secondary factors.
        let currentProduct = secondaryFactor * primaryFactor;

        // Invoke the dedicated output function to present the factors and their product.
        printCalculation(
            primaryFactor,
            secondaryFactor,
            currentProduct
        );
    }
}