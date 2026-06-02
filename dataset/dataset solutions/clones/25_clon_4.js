function processStringTransform(inputData) {
    const characterArray = Array.from(inputData);
    const transformedSequence = characterArray.reduceRight((accumulator, currentElement) => {
        return accumulator + currentElement;
    }, '');
    console.log(transformedSequence);
}
processStringTransform("Harry");
