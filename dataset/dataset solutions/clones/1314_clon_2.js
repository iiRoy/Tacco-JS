(function(sourceText) {
    // This array will store character frequencies.
    // It's initialized as an array but used as a hash map.
    var charCounts = [];

    // Populate the character frequency map with all lowercase English letters,
    // initializing their counts to zero.
    for (var charCode = 'a'.charCodeAt(0); charCode <= 'z'.charCodeAt(0); charCode++) {
        charCounts[String.fromCharCode(charCode)] = 0;
    }

    // Process each character from the input text.
    sourceText.split('').forEach(function(currentSymbol) {
        // Convert the character to lowercase for case-insensitive counting.
        currentSymbol = currentSymbol.toLowerCase();
        // If the character is one of the tracked lowercase letters, increment its count.
        if (currentSymbol in charCounts) {
            charCounts[currentSymbol]++;
        }
    });

    // Format and display the character counts.
    // Object.keys(charCounts) gets all the keys (characters) from our map.
    // .map() transforms each key into a "key : value" string.
    // The second argument to map (charCounts) sets 'this' context for the callback.
    // .join('\n') concatenates these strings with newline separators.
    console.log(Object.keys(charCounts).map(function(keyChar) {
        return keyChar + ' : ' + this[keyChar];
    }, charCounts).join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
