(function(sourceContent){
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";
    const TARGET_LINE_INDEX = 1;

    const lineSegments = sourceContent.split(NEWLINE_DELIMITER);
    const targetLineString = lineSegments[TARGET_LINE_INDEX];

    let elementCollection = targetLineString.split(SPACE_DELIMITER);
    elementCollection.reverse();

    const finalOutputString = elementCollection.join(SPACE_DELIMITER);
    console.log(finalOutputString);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
