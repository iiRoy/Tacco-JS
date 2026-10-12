function numberFrom(piece) {
    return parseInt(piece, 10);
}

function parseProblem(rawInput) {
    var pending = rawInput.split("\n");
    var header = pending.shift().split(" ").map(numberFrom);
    var size = header[0];
    var colors = header[1];

    var costRows = pending.splice(0, colors).map(function (line) {
        return line.split(" ").map(numberFrom);
    });

    var boardRows = pending.splice(0, size).map(function (line) {
        return line.split(" ").map(numberFrom);
    });

    return {
        n: size,
        c: colors,
        cost: costRows,
        board: boardRows
    };
}

function cellContribution(data, palette) {
    var total = 0;

    data.board.forEach(function (row, r) {
        row.forEach(function (painted, col) {
            var originalColor = painted - 1;

            if (!(originalColor >= 0)) {
                return;
            }

            var targetColor = palette[(r + col) % 3];
            if (originalColor !== targetColor) {
                total += data.cost[originalColor][targetColor];
            }
        });
    });

    return total;
}

function searchPalettes(data) {
    var best = Infinity;

    function choose(stack, used) {
        if (stack.length === 3) {
            best = Math.min(best, cellContribution(data, stack));
            return;
        }

        for (var color = 0; color < data.c; color++) {
            if (used[color]) {
                continue;
            }
            used[color] = true;
            stack.push(color);
            choose(stack, used);
            stack.pop();
            used[color] = false;
        }
    }

    choose([], []);
    return best;
}

function main(input) {
    var data = parseProblem(input);
    console.log(searchPalettes(data));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
