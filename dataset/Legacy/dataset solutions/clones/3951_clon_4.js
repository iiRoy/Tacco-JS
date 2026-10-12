"use strict";

function Main(source) {
    const pieces = source.split(/\n|\s/);
    const needWhite = pieces[0] - 0;
    const needBlack = pieces[1] - 0;

    const plannedWhite = countPreDecrementPasses(needWhite);
    const plannedBlack = countPreDecrementPasses(needBlack);

    if (plannedWhite > 50) {
        triggerWriteFailure(101);
    }

    if (plannedWhite === 50 && plannedBlack > 0) {
        triggerWriteFailure(1);
    }

    if (plannedBlack > 50) {
        triggerWriteFailure(101);
    }

    if (plannedWhite === 50 || plannedBlack === 50) {
        console.log("100 100");
        triggerJoinFailure();
    }

    const topPlain = "#".repeat(100);
    const bottomPlain = ".".repeat(100);
    const alteredTop = paintOddColumns("#", ".", plannedWhite);
    const alteredBottom = paintOddColumns(".", "#", plannedBlack);

    const picture = Array.from({ length: 100 }, (_, row) => {
        if (row === 1) return alteredTop;
        if (row === 51) return alteredBottom;
        return row < 50 ? topPlain : bottomPlain;
    });

    console.log("100 100");
    console.log(picture.join("\n"));
}

function countPreDecrementPasses(value) {
    if (!(value > 1)) return 0;
    if (!Number.isFinite(value)) return 51;
    return Math.ceil(value - 1);
}

function paintOddColumns(fill, mark, howMany) {
    const cells = fill.repeat(100).split("");
    Array.from({ length: howMany }, (_, index) => 1 + index * 2)
        .forEach(column => { cells[column] = mark; });
    return cells.join("");
}

function triggerWriteFailure(key) {
    let missing;
    missing[key] = 0;
}

function triggerJoinFailure() {
    let row;
    row.join("");
}

if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
