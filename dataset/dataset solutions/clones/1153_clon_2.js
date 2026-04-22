var groupHeads = [];

function bootSystem(totalEntities) {
    for (var elemIdx = 0; elemIdx < totalEntities; elemIdx++) {
        groupHeads[elemIdx] = elemIdx;
    }
}

function locateRepresentative(itemA) {
    if (groupHeads[itemA] === itemA)
        return itemA;
    return groupHeads[itemA] = locateRepresentative(groupHeads[itemA]);
}

function queryConnection(itemA, itemB) {
    return locateRepresentative(itemA) === locateRepresentative(itemB);
}

function formUnion(itemA, itemB) {
    var repA = locateRepresentative(itemA);
    var repB = locateRepresentative(itemB);
    if (repA === repB) return;
    groupHeads[repA] = repB;
}

var rawInputData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ();
var dataLines = rawInputData . split ( '\n' );

var configTokens = dataLines . shift () . trim () . split ( ' ' );
var totalEntities = +configTokens[0];
var numOperations = +configTokens[1];

bootSystem(totalEntities);

var currentOperationLine;
while (currentOperationLine = dataLines . shift ()) {
    var operationDetails = currentOperationLine . trim () . split ( ' ' );
    if (operationDetails[0] == 0) {
        formUnion(+operationDetails[1], +operationDetails[2]);
    } else {
        console . log ( queryConnection ( +operationDetails[1], +operationDetails[2] ) ? 1 : 0 );
    }
}