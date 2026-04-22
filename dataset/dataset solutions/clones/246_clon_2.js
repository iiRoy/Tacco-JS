/* This program calculates and displays
   a multiplication table for numbers 1 through 9.
   It demonstrates nested iteration. */
for ( var  firstFactor = 1; firstFactor < 10; firstFactor++ )
{
    // This loop handles the second operand for multiplication
    for  ( var  secondFactor = 1;  secondFactor < 10; secondFactor++ )
    {
        // Display the current multiplication operation and its outcome
        console.log( firstFactor + " times " + secondFactor + " equals " + ( firstFactor * secondFactor ) ) ;
    }
}