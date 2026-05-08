// This script is designed to generate a standard multiplication table.

for (let firstFactor = 1; firstFactor < 10; firstFactor++)
{
  // The outer loop controls the first operand for multiplication.
  // It iterates from one up to, but not including, ten.
  for (let secondFactor = 1; secondFactor < 10; secondFactor++)
  {
    // The inner loop controls the second operand.
    // For each 'firstFactor', it also iterates from one to nine.
    console.log(firstFactor + " * " + secondFactor + " = " + (firstFactor * secondFactor));
  }
}