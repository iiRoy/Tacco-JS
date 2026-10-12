function evaluateNumericRelation(inputValues) {
    const [valOne, valTwo, valThree] = inputValues;

    const smallestElement = Math.min(valOne, valTwo, valThree);
    const largestElement = Math.max(valOne, valTwo, valThree);
    const middleElement = valOne + valTwo + valThree - smallestElement - largestElement;

    const meetsCriteria = (smallestElement + middleElement === largestElement) || (smallestElement === middleElement + largestElement);

    console.log(meetsCriteria ? 'Yes' : 'No');
}
