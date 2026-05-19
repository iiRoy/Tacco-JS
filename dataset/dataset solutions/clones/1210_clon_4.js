function Main(input) {
    const totalSeconds = parseInt(input);

    const unitDivisors = [3600, 60, 1];

    const timeComponents = unitDivisors.reduce((accumulator, currentDivisor) => {
        if (currentDivisor === 1) {
            accumulator.parts.push(accumulator.remaining);
        } else {
            const componentValue = Math.floor(accumulator.remaining / currentDivisor);
            accumulator.parts.push(componentValue);
            accumulator.remaining %= currentDivisor;
        }
        return accumulator;
    }, { remaining: totalSeconds, parts: [] }).parts;

    console.log(timeComponents.join(":"));
}

function debug() {
    var input = document.getElementById("input").value;
    Main(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
