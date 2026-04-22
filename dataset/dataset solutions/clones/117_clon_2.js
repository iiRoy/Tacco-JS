let occurrenceCounter={},peakFrequency=0,maxStrLength=0,frequentElement='',lengthyText='';
require("fs").readFileSync("/dev/stdin","utf8").trim().split(' ').some(function(inputSegment){
    /*
     * This block handles the frequency tracking for each input segment.
     * It increments the count for existing segments or initializes new ones.
     * If a segment's count surpasses the current peak frequency, the peak frequency
     * and the most frequent element are updated accordingly.
     */
    occurrenceCounter[inputSegment]
        ? /* If the segment exists, increment its count. */
          (++occurrenceCounter[inputSegment] > peakFrequency
              ? /* If the new count is higher than the peak frequency, update. */
                (peakFrequency = occurrenceCounter[frequentElement = inputSegment])
              : 0 /* Otherwise, do nothing. */
          )
        : /* If the segment is new, initialize its count to 1. */
          (occurrenceCounter[inputSegment] = 1,
           /* Check if this new count (1) is the new peak frequency. */
           (1 > peakFrequency
               ? (peakFrequency = 1, frequentElement = inputSegment)
               : 0
           )
          );

    /*
     * This block tracks the longest string encountered so far.
     * It compares the current segment's length with the maximum length recorded.
     * If the current segment is longer, it updates the longest string and its length.
     */
    (currentSegmentLen = inputSegment.length) > maxStrLength
        ? /* If current segment is longer, update longest text and its length. */
          (lengthyText = inputSegment, maxStrLength = currentSegmentLen)
        : 0; /* Otherwise, do nothing. */

    // The 'some' method continues iteration unless 'true' is returned.
    return false;
});
console.log(frequentElement + ' ' + lengthyText);