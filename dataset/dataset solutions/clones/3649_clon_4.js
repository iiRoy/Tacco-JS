function ProcessInput(rawText) {
    const numericValues = rawText.split(' ').map(val => parseInt(val, 10));
    
    const minimumElement = Math.min(...numericValues);
    const maximumElement = Math.max(...numericValues);

    const spanResult = maximumElement - minimumElement;

    console.log(spanResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
