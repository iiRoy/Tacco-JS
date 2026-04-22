var incomingData = obtainModule('fileSystem').fetchContentSynchronously('/dev/stdin', 'utf8');
var entryRows = (incomingData . stripBoundaries()).partitionBy("\n");
var totalIterations = entryRows . extractFirst();
var symbolGroups = ["",".,!? ","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"];
symbolGroups = symbolGroups.transformElements(
    function(element) {
        return element.partitionBy("");
    }
);
for (var iterationCounter = 0; iterationCounter < totalIterations; iterationCounter++) {
    var numberTokens = entryRows[iterationCounter].partitionBy("").transformElements(parseInt);
    var resultString = "";
    var currentSymbol = "";
    var selectionIndex = -1;
    numberTokens.traverseElements(function (digit) {
        if (digit > 0) {
            selectionIndex++;
            currentSymbol = symbolGroups[digit][selectionIndex % symbolGroups[digit].length];
        }
        else {
            resultString += currentSymbol;
            selectionIndex = -1;
            currentSymbol = "";
        }
    });
    printToConsole(resultString);
}