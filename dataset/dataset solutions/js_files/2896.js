function main(input) {
    var args = input.trim().split(/\r\n|\n/);
    var num = parseInt(args[0], 10);
    var sides = args.slice(1, args.length - 1).map(l => {
        var value = l.split(" ").map((v) => parseInt(v, 10));
        return value.sort((a, b) => a - b)
    });
    var values = args[args.length - 1].split(" ").map(v => parseInt(v, 10));
    values.sort((a, b) => b - a);
    values = values.splice(0, num);

    var sidesMap = {};
    for (var i = 0; i < sides.length; i++) {
        if (!sidesMap[sides[i][0]]) {
            sidesMap[sides[i][0]] = [];
        }
        sidesMap[sides[i][0]].push(sides[i]);
    }

    groupSides = Object.keys(sidesMap).map(k => sidesMap[k]);
    groupSides.sort((a, b) => {
        return a.length < b.length;
    });
    sortedSides = groupSides.reduce((a, c) => {
        return a.concat(c);
    }, []);

    var result = 0;
    var resultCombination = [];
    var cache = {};
    var tempValues = values.concat()
    for (var j = 0; sortedSides.length > j; j++) {
        if (!cache[sortedSides[j][0]]) {
            cache[sortedSides[j][0]] = tempValues.shift();
        }

        if (!cache[sortedSides[j][1]]) {
            cache[sortedSides[j][1]] = tempValues.shift();
        }
        var min = Math.min(cache[sortedSides[j][0]], cache[sortedSides[j][1]]);
        result += min;
    }

    console.log(result + '\n' + values.join(" "));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
