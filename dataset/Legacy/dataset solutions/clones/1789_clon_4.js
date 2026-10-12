const processInputData = (rawData) => {
    const [firstLineData, secondLineData, thirdLineData] = rawData.trim().split('\n');

    const [initialPosA, speedA] = firstLineData.split(' ').map(Number);
    const [initialPosB, speedB] = secondLineData.split(' ').map(Number);
    const maxTime = Number(thirdLineData);

    return { initialPosA, speedA, initialPosB, speedB, maxTime };
};

const calculateMeetingPossibility = (data) => {
    const { initialPosA, speedA, initialPosB, speedB, maxTime } = data;

    const currentDistance = Math.abs(initialPosB - initialPosA);
    const closingRate = speedA - speedB;

    const canTheyMeet = (closingRate <= 0)
        ? (currentDistance === 0)
        : (currentDistance > 0 && (closingRate * maxTime >= currentDistance));

    return canTheyMeet ? "YES" : "NO";
};

function Main(input) {
    const parsedData = processInputData(input);
    const finalResult = calculateMeetingPossibility(parsedData);
    console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
