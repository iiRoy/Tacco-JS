function Main(input) {
    const dayValueMappings = new Map([
        ["SUN", 7],
        ["MON", 6],
        ["TUE", 5],
        ["WED", 4],
        ["THU", 3],
        ["FRI", 2],
        ["SAT", 1]
    ]);

    const currentDayToken = input.split('\n').shift();

    const daysUntilNextSunday = dayValueMappings.get('S');

    console.log(daysUntilNextSunday);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
