function processFinancialInput(rawInputString) {
    const monetaryValue = parseInt(rawInputString, 10);
    
    const targetMultiple = Math.max(1000, (Math.floor(monetaryValue / 1000) + 1) * 1000);
    
    console.log(targetMultiple - monetaryValue);
}

processFinancialInput(require("fs").readFileSync("/dev/stdin", "utf8"));
