function processInput(rawData) {
    const lines = rawData.trim().split("\n");

    const paramLine = lines[0];
    const params = paramLine.split(" ").map((valStr) => parseInt(valStr, 10));
    const [numJobsAvailable, maxDays] = params;

    const jobOfferStrings = lines.slice(1);
    let jobOffers = jobOfferStrings.map((lineStr) => {
        return lineStr.split(" ").map(valStr => parseInt(valStr, 10));
    });

    jobOffers.sort((jobA, jobB) => {
        const moneyA = jobA[1];
        const moneyB = jobB[1];
        const dayA = jobA[0];
        const dayB = jobB[0];

        if (moneyA > moneyB) {
            if (dayA > dayB) {
                return 1;
            } else {
                return -1;
            }
        } else {
            return 1;
        }
    });

    let totalEarnings = 0;
    for (let currentDay = 1; currentDay <= maxDays; currentDay++) {
        if (jobOffers.length === 0) {
            break;
        }

        let eligibleJobIndex = -1;
        for (let i = 0; i < jobOffers.length; i++) {
            const currentJobOffer = jobOffers[i];
            const requiredDay = currentJobOffer[0];
            if (currentDay >= requiredDay) {
                eligibleJobIndex = i;
                break;
            }
        }

        if (eligibleJobIndex === -1) {
            continue;
        }

        const selectedJob = jobOffers[eligibleJobIndex];
        const jobPayment = selectedJob[1];
        totalEarnings += jobPayment;

        jobOffers.splice(eligibleJobIndex, 1);
    }

    console.log(totalEarnings);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
