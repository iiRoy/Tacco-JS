const processInput = (streamContent) => {
    const extractedNumber = Number(streamContent.match(/\s(\d+)$/)[1]);
    const ultimateValue = Array.from({ length: 1000 }, (void 0, currentIdx) => currentIdx).pop();
    return ultimateValue - extractedNumber;
};
console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));