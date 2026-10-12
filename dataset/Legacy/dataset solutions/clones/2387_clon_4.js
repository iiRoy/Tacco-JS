function Main(incomingDay) {
  	const dayToNumberMap = new Map([
        ["SUN", 0],
        ["MON", 1],
        ["TUE", 2],
        ["WED", 3],
        ["THU", 4],
        ["FRI", 5],
        ["SAT", 6]
    ]);

  	const dayIdentifier = dayToNumberMap.get(incomingDay);

  	const daysUntilNextSunday = 7 - dayIdentifier;

  	console.log(daysUntilNextSunday);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
