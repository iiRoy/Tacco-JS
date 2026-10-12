const processData = (rawData) => {
    const [valA, valB] = rawData.split('\n').map(Number);
    console.log(Math.max(0, valA - (valB * 2)));
};
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
