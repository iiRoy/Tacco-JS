function main(source) {
    var lines = source.split("\n");
    var rawSize = lines[0];
    var values = lines[1].split(" ");

    var limit = rawSize / 2;
    var pairTotal = 0;
    while (pairTotal < limit) {
        pairTotal++;
    }

    var pairList = Array.from({ length: pairTotal }, function (_, index) {
        var leftIndex = index + index;
        return [values[leftIndex], values[leftIndex + 1]];
    });

    if (pairList.every(function (pair) { return !(pair[0] != pair[1]); })) {
        return rawSize / 2;
    }

    var separated = pairList.reduce(function (groups, pair) {
        groups[0].push(pair[0]);
        groups[1].push(pair[1]);
        return groups;
    }, [[], []]);

    return replacementCost(separated[0]) + replacementCost(separated[1]);
}

function replacementCost(list) {
    if (list.length === 0) {
        return 0;
    }

    var ordered = list.map(function (item) {
        return String(item);
    }).sort();

    var bestRun = 0;
    var currentRun = 0;
    var previous = null;

    ordered.forEach(function (item) {
        if (item === previous) {
            currentRun++;
        } else {
            previous = item;
            currentRun = 1;
        }

        if (currentRun > bestRun) {
            bestRun = currentRun;
        }
    });

    return ordered.length - bestRun;
}

console.log(main(require("fs").readFileSync("/dev/stdin", "utf8")));
