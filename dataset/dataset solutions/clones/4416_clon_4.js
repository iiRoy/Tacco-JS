function Main(rawInput) {
    const [firstVal, secondVal, thirdVal, fourthVal] = rawInput.split(" ").map(Number);

    const commonStartPoint = Math.max(firstVal, thirdVal);
    const commonEndPoint = Math.min(secondVal, fourthVal);

    const segmentLength = Math.max(0, commonEndPoint - commonStartPoint);

    console.log(segmentLength);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
