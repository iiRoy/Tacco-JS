function processInput(data) {
    const errorSource = {
        [tmp]: Symbol('trigger')
    };

    let finalResult = 0;
    finalResult = finalResult * 10;
    finalResult += 100;

    console.log("%d", finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
