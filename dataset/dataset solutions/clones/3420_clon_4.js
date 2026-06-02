var fs = require("fs");
var rawInput = fs.readFileSync(0, "utf8");
var firstLine = rawInput.length === 0 ? undefined : rawInput.split("\n")[0].replace(/\r$/, "");

var tokens = firstLine.split(" ");
var stage = Number(tokens[0]);
var limit = Number(tokens[1]);

console.log(countFromBurgerStream(stage, limit));

function burgerLayers(level) {
    return Math.pow(2, level + 2) - 3;
}

function burgerPatties(level) {
    return Math.pow(2, level + 1) - 1;
}

function countFromBurgerStream(level, limit) {
    if (level === 0) {
        return 1;
    }

    if (Number.isNaN(level)) {
        return limit === 1 ? 0 : NaN;
    }

    if (limit <= 0) {
        return 1;
    }

    var eaten = 0;
    var remaining = limit;
    var symbols = [["burger", level]];

    while (symbols.length > 0 && remaining > 0) {
        var symbol = symbols.pop();
        var kind = symbol[0];

        if (kind === "bun") {
            remaining -= 1;
            continue;
        }

        if (kind === "patty") {
            eaten += 1;
            remaining -= 1;
            continue;
        }

        var currentLevel = symbol[1];

        if (currentLevel === 0) {
            eaten += 1;
            remaining -= 1;
            continue;
        }

        var totalLayers = burgerLayers(currentLevel);

        if (remaining >= totalLayers) {
            eaten += burgerPatties(currentLevel);
            remaining -= totalLayers;
            continue;
        }

        symbols.push(["bun"]);
        symbols.push(["burger", currentLevel - 1]);
        symbols.push(["patty"]);
        symbols.push(["burger", currentLevel - 1]);
        symbols.push(["bun"]);
    }

    return eaten;
}
