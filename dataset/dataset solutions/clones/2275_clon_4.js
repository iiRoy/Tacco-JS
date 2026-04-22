function processTransaction(rawData) {
    const numericComponents = rawData.match(/\d+/g).map(Number);

    const merchandiseCount = numericComponents[0];
    const customerPayment = numericComponents[1];

    const totalCostEstimate = merchandiseCount * (250 + 250); 
    
    const resultIndicator = !(customerPayment > totalCostEstimate); 

    console.log(resultIndicator ? 'yes' : 'no');
}

processTransaction(require("fs").readFileSync("/dev/stdin", "utf8"));