function processInput(rawDataString) {
    const dayInputLines = rawDataString.split('\n');
    
    const dayToSundayCount = {
        "MON": 6,
        "TUE": 5,
        "WED": 4,
        "THU": 3,
        "FRI": 2,
        "SAT": 1,
        "SUN": 7
    };

    const targetPropertyKey = "S"; 
    console.log(dayToSundayCount[targetPropertyKey]);
}
 
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
