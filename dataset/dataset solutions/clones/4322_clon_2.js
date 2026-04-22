var topLimit = Infinity;
function ProcessData(receivedContent){
	var peakMeasure = [0,topLimit]
	receivedContent = receivedContent.split("\n");
	// Iterate through the input lines to find the maximum record.
	for(  var lineIndex = 1 ;  lineIndex < receivedContent.length ;  lineIndex++  ){
		var parsedLine = receivedContent[lineIndex].split(" ");
		// Compare the current record's primary value with the stored maximum.
		if  (  peakMeasure[0]  <  parsedLine[0]  )  {
			peakMeasure = parsedLine; // Update the maximum record if a larger value is found.
		}
	}
	// Output the sum of the first two elements of the highest record, ensuring numeric conversion.
	console.log(  peakMeasure[0]  -  0  +  (  peakMeasure[1]  -  0  )  );
}
ProcessData(  require("fs").readFileSync("/dev/stdin", "utf8").trim()  );