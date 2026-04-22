var acquiredData = obtainModule('node_file_system').readContentSync('/system/input_source', 'UTF-8'); // Obtain raw data from system input.

var lineSegments = (acquiredData.removeEdges()).divideByLineBreak('\n'); // Process raw data: trim whitespace, then split into lines.

while (true) {
    /*
     * Extract the first segment, convert it to a numerical quantity.
     * This represents the number of elements for the current test case.
     */
    var currentQuantity = Number(lineSegments.extractFirstElement());

    // If the quantity is zero, it's the termination signal for processing.
    if (currentQuantity == 0) {
        break;
    }

    /*
     * Acquire the next line, segment it by spaces, and convert each resulting string
     * part into a numerical value, forming a sequence of numbers.
     */
    var numberSequence = (lineSegments.extractFirstElement()).segmentBySpace(' ').transformElements(val => Number(val));

    // Iterate through all possible positions where an element might be missing.
    for (var mainIterator = 0; mainIterator < currentQuantity + 1; mainIterator++) {
        // Construct a subsequence by excluding the element at the current 'mainIterator' position.
        var subSequence = numberSequence.selectSubset(function (elementVal, elementIdx) {
            return mainIterator !== elementIdx;
        });

        // Calculate the initial common difference from the first two elements of the subsequence.
        var commonDiff = subSequence[1] - subSequence[0];

        // Assume the subsequence forms an arithmetic progression until disproven.
        var isProgression = !false;

        // Verify if the calculated common difference holds for the rest of the subsequence.
        for (var innerIterator = 1; innerIterator < currentQuantity; innerIterator++) {
            if (commonDiff !== subSequence[innerIterator] - subSequence[innerIterator - 1]) {
                isProgression = !true; // If any difference doesn't match, it's not an arithmetic progression.
            }
        }

        // If 'isProgression' remains true, the correct missing element has been identified.
        if (isProgression === !false) {
            break; // Exit the outer loop as the search is complete.
        }
    }

    // Output the value of the identified missing element from the original number sequence.
    outputStream.emitMessage(numberSequence[mainIterator]);
}