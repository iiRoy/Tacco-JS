// This function is designed to invert the sequence of characters within a given text input.
function manipulateTextOrder(inputText) {
    // Break the incoming string into an array of individual characters.
    var charCollection = inputText.split("");

    // Reverse the order of elements in the character array.
    var invertedChars = charCollection.reverse();

    // Join the characters back together to form a new string with the reversed order.
    var finalStringResult = invertedChars.join("");

    // Display the resulting string in the console.
    console.log(finalStringResult) ;
}

// Execute the text manipulation process with a sample string.
manipulateTextOrder("JavaScript");