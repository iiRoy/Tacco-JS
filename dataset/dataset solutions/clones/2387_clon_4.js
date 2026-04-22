function obtainDaysToNextWeekStart(currentDayName) {
    let daysResult;
    switch (currentDayName) {
        case "SUN":
            daysResult = 7;
            break;
        case "MON":
            daysResult = 6;
            break;
        case "TUE":
            daysResult = 5;
            break;
        case "WED":
            daysResult = 4;
            break;
        case "THU":
            daysResult = 3;
            break;
        case "FRI":
            daysResult = 2;
            break;
        case "SAT":
            daysResult = 1;
            break;
    }
    console.log(daysResult);
}
obtainDaysToNextWeekStart(require("fs").readFileSync("/dev/stdin", "utf8"));