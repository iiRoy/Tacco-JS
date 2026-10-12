function duplicatedPlaces(lineValues) {
    var amountByNumber = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    lineValues.forEach(function (number) {
        amountByNumber[number - 0]++;
    });

    var repeatedNumbers = [];
    amountByNumber.forEach(function (amount, number) {
        if (amount >= 2) repeatedNumbers.push(number);
    });

    var repeatedPlaces = [];
    lineValues.forEach(function (number, place) {
        if (repeatedNumbers.indexOf(number) !== -1) repeatedPlaces.push(place);
    });

    return repeatedPlaces;
}

var fs = require("fs");
var data = fs.readFileSync("/dev/stdin", "utf8");
var lines = data.trim().split("\n");

var answer = "";
var cases = lines.shift() - 0;

for (var caseIndex = 0; caseIndex < cases; caseIndex++) {
    var board = [];
    var marks = [];

    for (var row = 0; row < 9; row++) {
        var currentRow = lines.shift().split(" ").map(Number);
        board.push(currentRow);
        marks.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    for (var row = 0; row < 9; row++) {
        var rowDuplicates = duplicatedPlaces(board[row]);
        rowDuplicates.forEach(function (col) {
            marks[row][col]++;
        });
    }

    for (var col = 0; col < 9; col++) {
        var columnValues = [];

        for (var row = 0; row < 9; row++) {
            columnValues.push(board[row][col]);
        }

        var columnDuplicates = duplicatedPlaces(columnValues);
        columnDuplicates.forEach(function (row) {
            marks[row][col]++;
        });
    }

    for (var boxRow = 0; boxRow < 3; boxRow++) {
        for (var boxCol = 0; boxCol < 3; boxCol++) {
            var boxCells = [
                [0 + boxRow * 3, 0 + boxCol * 3],
                [0 + boxRow * 3, 1 + boxCol * 3],
                [0 + boxRow * 3, 2 + boxCol * 3],
                [1 + boxRow * 3, 0 + boxCol * 3],
                [1 + boxRow * 3, 1 + boxCol * 3],
                [1 + boxRow * 3, 2 + boxCol * 3],
                [2 + boxRow * 3, 0 + boxCol * 3],
                [2 + boxRow * 3, 1 + boxCol * 3],
                [2 + boxRow * 3, 2 + boxCol * 3]
            ];

            var boxValues = [];
            boxCells.forEach(function (cell) {
                boxValues.push(board[cell[0]][cell[1]]);
            });

            var boxDuplicates = duplicatedPlaces(boxValues);
            boxDuplicates.forEach(function (place) {
                marks[boxCells[place][0]][boxCells[place][1]]++;
            });
        }
    }

    board.forEach(function (rowValues, row) {
        rowValues.forEach(function (value, col) {
            board[row][col] = marks[row][col] >= 1 ? "*" + value : " " + value;
        });
    });

    answer += board.join("\n").replace(/,/g, "") + "\n\n";
}

console.log(answer.trim());