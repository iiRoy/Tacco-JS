class GeometricProcessor {
    static #circularConstant = 3.1415926535897932384626433832795;

    static computeMeasures(rawInput) {
        const numericalValue = Number(rawInput);
        const squaredResult = numericalValue * numericalValue;
        const doubledValue = numericalValue + numericalValue;

        const areaOutcome = GeometricProcessor.#circularConstant * squaredResult;
        const perimeterOutcome = GeometricProcessor.#circularConstant * doubledValue;

        return [areaOutcome, perimeterOutcome];
    }

    static presentOutput(resultsTuple) {
        console.log(resultsTuple[0].toString() + ' ' + resultsTuple[1].toString());
    }
}

GeometricProcessor.presentOutput(
    GeometricProcessor.computeMeasures(
        require("fs").readFileSync("b.txt", "utf8")
    )
);