function Main(inputData) {
    const dataLines = inputData.trim().split("\n");

    const [firstEntityPositionString, firstEntitySpeedString] = dataLines[0].split(" ");
    const [secondEntityPositionString, secondEntitySpeedString] = dataLines[1].split(" ");
    const maximumAllowedTimeString = dataLines[2];

    const firstEntityPosition = Number(firstEntityPositionString);
    const firstEntitySpeed = Number(firstEntitySpeedString);
    const secondEntityPosition = Number(secondEntityPositionString);
    const secondEntitySpeed = Number(secondEntitySpeedString);
    const maximumAllowedTime = Number(maximumAllowedTimeString);

    const currentSpatialSeparation = Math.abs(firstEntityPosition - secondEntityPosition);
    const effectiveApproachRate = firstEntitySpeed - secondEntitySpeed;

    if (currentSpatialSeparation === 0) {
        console.log("YES");
    } else if (effectiveApproachRate <= 0) {
        console.log("NO");
    } else {
        const timeToConverge = currentSpatialSeparation / effectiveApproachRate;
        if (timeToConverge <= maximumAllowedTime) {
            console.log("YES");
        } else {
            console.log("NO");
        }
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
