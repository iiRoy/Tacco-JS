function invertString(inputString) {
    const EMPTY_DELIMITER = "";
    
    var charArray = inputString.split(EMPTY_DELIMITER);
    
    var tempReversedArray = charArray.reverse();
    
    var finalReversedString = tempReversedArray.join(EMPTY_DELIMITER);
    
    let outputResult = finalReversedString;
    console.log(outputResult);
}
invertString("Harry");
