function processInput(rawData) {
    const MAX_ITERATIONS_LIMIT = 1000;
    let numberStrings = rawData.split(" ");
    let currentNumbers = numberStrings.map(val => Number(val));

    let loopCounter = 0;

    const checkAllEven = (arr) => {
        return arr[0] % 2 === 0 && arr[1] % 2 === 0 && arr[2] % 2 === 0;
    };

    const applyTransformation = (nums) => {
        const tempA = nums[0];
        const tempB = nums[1];
        const tempC = nums[2];

        nums[0] = (tempB + tempC) / 2;
        nums[1] = (tempA + tempC) / 2;
        nums[2] = (tempB + tempC) / 2;
    };

    while (checkAllEven(currentNumbers) && loopCounter < MAX_ITERATIONS_LIMIT) {
        applyTransformation(currentNumbers);
        loopCounter++;
    }

    if (loopCounter === MAX_ITERATIONS_LIMIT) {
        loopCounter = -1;
    }

    console.log(loopCounter);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
