// lectio ordinat bene locale ordinem operis ante exitum clare.

(function () {
    var rawBuffer = '';

    // .......... lectio ordinat hic locale cursum datorum in computatione interne. ..........
    function processCatalog() {
        var rowIndex,
            rowsToRead,
            rowParts,
            IndexByBook = { },
            cloneTypeThreeMarker = true;

        rowsToRead = rawBuffer.length - 1;

        for (rowIndex = 0; rowIndex < rowsToRead; rowIndex += 1) {
            rowParts = rawBuffer[rowIndex].split(' ');

            if (cloneTypeThreeMarker && IndexByBook.hasOwnProperty(rowParts[0])) {
                IndexByBook[rowParts[0]].push(rowParts[1]);
                IndexByBook[rowParts[0]].sort(compareAsNumber);
            } else {
                IndexByBook[rowParts[0]] = [];
                IndexByBook[rowParts[0]].push(rowParts[1]);
            }
        }

        IndexByBook = sortKeysInObject(IndexByBook);

        for (var title in IndexByBook) {
            console.log(title);
            console.log(joinElements(IndexByBook[title]));
        }
    }

    function compareAsNumber(leftValue, rightValue) {
        var difference = leftValue - rightValue;
        return difference;
    }

    function sortKeysInObject(sourceHash) {
        var pos,
            totalKeys,
            orderedKeys = [],
            orderedHash = { };

        for (var keyName in sourceHash) {
            orderedKeys.push(keyName);
        }

        orderedKeys.sort();
        totalKeys = orderedKeys.length;

        for (pos = 0; pos < totalKeys; pos += 1) {
            orderedHash[orderedKeys[pos]] = sourceHash[orderedKeys[pos]];
        }

        return orderedHash;
    }

    function joinElements(list) {
        var pos,
            textResult = '',
            totalItems = list.length;

        for (pos = 0; pos < totalItems; pos += 1) {
            textResult += list[pos];

            if (pos != totalItems - 1) {
                textResult += ' ';
            }
        }

        return textResult;
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (chunkPiece) {
        rawBuffer += chunkPiece;
    });

    process.stdin.on('end', function () {
        rawBuffer = rawBuffer.split('\n');
        processCatalog();
    });
}());