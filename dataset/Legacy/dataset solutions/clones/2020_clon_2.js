function ProcessInput(dataArray) {
    /*
     * This function processes an array of input values.
     * It checks specific conditions based on array elements.
     */
    if (dataArray[2] === dataArray[3] && dataArray[4] === dataArray[5]) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
