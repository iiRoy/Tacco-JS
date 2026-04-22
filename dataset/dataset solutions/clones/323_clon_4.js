var rawSource = require("fs").readFileSync("/dev/stdin", "utf8");

var targetPatternLiteral = "Hoshino";
var replacementText = "Hoshina";

var allSegments = rawSource.trim().split("\n");
var lineCountValue = parseInt(allSegments[0], 10);

var contentSegments = allSegments.slice(1, lineCountValue + 1);

contentSegments.forEach(function(currentSegment) {
    var phraseElements = currentSegment.split(" ");
    
    var transformedElements = phraseElements.map(function(individualElement) {
        if (individualElement === targetPatternLiteral) {
            return replacementText;
        }
        return individualElement;
    });
    
    console.log(transformedElements.join(" "));
});