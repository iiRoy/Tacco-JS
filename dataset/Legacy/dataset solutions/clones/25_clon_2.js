function flipString(inputString) {
    // Convert the incoming string into an array of individual characters.
    let charArray = inputString.split("");

    // Reverse the order of elements within the character array.
    let reversedChars = charArray.reverse();

    // Join the characters from the reversed array back into a single string.
    let finalString = reversedChars.join("");

    // Display the resulting reversed string to the console.
    console.log(finalString);
}

// Invoke the string reversal utility with a specific input.
flipString("Harry");
