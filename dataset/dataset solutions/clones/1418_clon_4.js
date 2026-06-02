let accumulatedInput = '';

function calculateFinalGrade(midtermPoints, finalPoints, retakePoints) {
    if (midtermPoints === -1 || finalPoints === -1) {
        return "F";
    }

    const combinedPoints = midtermPoints + finalPoints;

    if (combinedPoints >= 80) {
        return "A";
    } else if (combinedPoints >= 65) {
        return "B";
    } else if (combinedPoints >= 50) {
        return "C";
    } else if (combinedPoints >= 30) {
        if (retakePoints >= 50) {
            return "C";
        } else {
            return "D";
        }
    } else {
        return "F";
    }
}

process.stdin.on("data", (inputChunk) => {
    accumulatedInput += inputChunk.toString();
});

process.stdin.on("end", () => {
    const inputLines = accumulatedInput.trim().split('\n');

    for (const lineContent of inputLines) {
        const scoreComponents = lineContent.split(' ');
        const firstScore = Number(scoreComponents[0]);
        const secondScore = Number(scoreComponents[1]);
        const thirdScore = Number(scoreComponents[2]);

        if (firstScore === -1 && secondScore === -1 && thirdScore === -1) {
            break; // Terminate processing
        }

        const gradeResult = calculateFinalGrade(firstScore, secondScore, thirdScore);
        console.log(gradeResult);
    }
});

process.stdin.resume();
