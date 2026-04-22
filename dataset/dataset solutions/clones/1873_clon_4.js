function processInputData(rawData) {
    const dataLines = rawData.trim().split("\n");

    const [totalBooks, totalSkills, minimumScore] = dataLines[0].split(' ').map(Number);

    const bookPrices = [];
    const bookSkillContributions = [];

    for (let currentBookIndex = 1; currentBookIndex <= totalBooks; currentBookIndex++) {
        const bookDetails = dataLines[currentBookIndex].split(' ').map(Number);
        bookPrices.push(bookDetails[0]);
        bookSkillContributions.push(bookDetails.slice(1));
    }

    let overallLowestCost = Infinity;

    function explorePurchaseOptions(
        bookConsiderationIndex,
        accumulatedPayment,
        currentSkillProficiencies
    ) {
        // Base case: All books have been considered
        if (bookConsiderationIndex === totalBooks) {
            // Check if all skill proficiencies meet the required minimum
            const allProficienciesReached = currentSkillProficiencies.every(
                (proficiencyLevel) => proficiencyLevel >= minimumScore
            );

            if (allProficienciesReached) {
                overallLowestCost = Math.min(overallLowestCost, accumulatedPayment);
            }
            return;
        }

        // Option 1: Do not acquire the current book
        explorePurchaseOptions(
            bookConsiderationIndex + 1,
            accumulatedPayment,
            currentSkillProficiencies
        );

        // Option 2: Acquire the current book
        const nextPaymentTotal = accumulatedPayment + bookPrices[bookConsiderationIndex];
        const updatedSkillProficiencies = currentSkillProficiencies.map(
            (proficiencyLevel, skillIdentifier) => {
                return proficiencyLevel + bookSkillContributions[bookConsiderationIndex][skillIdentifier];
            }
        );

        explorePurchaseOptions(
            bookConsiderationIndex + 1,
            nextPaymentTotal,
            updatedSkillProficiencies
        );
    }

    // Initiate the recursive exploration
    explorePurchaseOptions(0, 0, new Array(totalSkills).fill(0));

    console.log(overallLowestCost === Infinity ? -1 : overallLowestCost);
}

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(inputSource);