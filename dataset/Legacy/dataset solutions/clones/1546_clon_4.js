function checkJourneyFeasibility(journeyData) {
    const dataSegments = journeyData.split(' ');
    const requiredDistance = Number(dataSegments[0]);
    const maxTime = Number(dataSegments[1]);
    const travelSpeed = Number(dataSegments[2]);

    let outcome;

    if (travelSpeed > 0) {
        outcome = (requiredDistance <= maxTime * travelSpeed) ? 'Yes' : 'No';
    } else if (travelSpeed < 0) {
        outcome = (requiredDistance >= maxTime * travelSpeed) ? 'Yes' : 'No';
    } else { // travelSpeed === 0
        if (requiredDistance > 0) {
            outcome = 'No';
        } else if (requiredDistance < 0) {
            outcome = 'Yes';
        } else { // requiredDistance === 0
            outcome = 'No';
        }
    }
    console.log(outcome);
}

checkJourneyFeasibility(require("fs").readFileSync("/dev/stdin", "utf8").trim());
