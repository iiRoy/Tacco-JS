Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function Main(inputString) {
    const lineSegments = inputString.split("\n");
    const max500Unit = Number(lineSegments[0]);
    const max100Unit = Number(lineSegments[1]);
    const max50Unit = Number(lineSegments[2]);
    const targetValue = Number(lineSegments[3]);

    const valuesFrom500 = Array.from({ length: max500Unit + 1 }, (_, index) => index * 500);
    const valuesFrom100 = Array.from({ length: max100Unit + 1 }, (_, index) => index * 100);
    const valuesFrom50 = Array.from({ length: max50Unit + 1 }, (_, index) => index * 50);

    const allPossibleSums = valuesFrom500.flatMap(sum500 =>
        valuesFrom100.flatMap(sum100 =>
            valuesFrom50.map(sum50 => sum500 + sum100 + sum50)
        )
    );

    const exactMatches = allPossibleSums.filter(currentSum => currentSum === targetValue);

    console.log(exactMatches.length);
}
