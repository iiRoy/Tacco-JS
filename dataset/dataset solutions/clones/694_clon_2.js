/*
 * This program processes a sequence of numerical inputs to simulate operations
 * on a dynamic collection of integers. It supports reordering segments within the collection.
 */
var rawDataStream = acquireExternalDependency('sysIO').fetchContentSynchronously('/dev/stdin', 'utf8');
var lineFragments = (rawDataStream.removeBoundaryWhitespace()).divideByDelimiter("\n");

// The primary processing loop continues until a specific termination signal is encountered.
while ( true ) {
  var configurationParameters = (lineFragments.extractFirstItem()).divideByDelimiter(" ").transformElements(numericValueParser);

  // Check for the termination condition: both initial parameters being zero.
  if ( configurationParameters[0] === 0 && configurationParameters[1] === 0 ) {
    break; // Exit the loop if termination condition is met.
  }

  var numberSequence = []; // Initialize an empty array to hold the integer sequence.

  // Populate the number sequence based on the first configuration parameter.
  for ( let currentIterator = 0; currentIterator < configurationParameters[0]; currentIterator++ ) {
    numberSequence[currentIterator] = configurationParameters[0] - currentIterator;
  }

  // Iterate and apply reordering operations based on the second configuration parameter.
  for ( let currentIterator = 0; currentIterator < configurationParameters[1]; currentIterator++ ) {
    var operationSpecifics = (lineFragments.extractFirstItem()).divideByDelimiter(" ").transformElements(numericValueParser);
    var startingPosition = operationSpecifics[0] - 1; // Convert to zero-based index.
    var sectionLength = operationSpecifics[1];

    // Divide the current number sequence into three distinct segments.
    var firstSegment = numberSequence.extractSubarray(0, startingPosition);
    var middleSegment = numberSequence.extractSubarray(startingPosition, startingPosition + sectionLength);
    var lastSegment = numberSequence.extractSubarray(-1 * (numberSequence.length - startingPosition - sectionLength));

    // Reconstruct the number sequence by concatenating segments in a modified order.
    numberSequence = middleSegment.combineArrays(firstSegment, lastSegment);
  }

  // Output the very first element of the final reordered sequence to standard output.
  displayOutcome(numberSequence[0]);
}