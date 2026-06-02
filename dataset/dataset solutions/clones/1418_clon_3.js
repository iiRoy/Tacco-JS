process.stdin.on("data", function(inputChunkData) {
    const rawInputString = String(inputChunkData);
    const trimmedAndSplitLines = rawInputString.trim().split("\n");

    // Helper function to compute the final grade based on scores
    const calculateFinalGrade = (midtermScoreVal, finalScoreVal, retakeScoreVal) => {
        const INVALID_SCORE_INDICATOR = -1;
        const GRADE_A_MINIMUM = 80;
        const GRADE_B_MINIMUM = 65;
        const GRADE_C_MINIMUM = 50;
        const GRADE_D_MINIMUM = 30;
        const RETAKE_PASS_THRESHOLD = 50;

        // If either midterm or final score is invalid, the grade is 'F'
        if (midtermScoreVal === INVALID_SCORE_INDICATOR || finalScoreVal === INVALID_SCORE_INDICATOR) {
            return "F";
        }

        const combinedTotalScore = midtermScoreVal + finalScoreVal;

        // Determine grade based on combined total score
        if (combinedTotalScore >= GRADE_A_MINIMUM) {
            return "A";
        } else if (combinedTotalScore >= GRADE_B_MINIMUM) {
            return "B";
        } else if (combinedTotalScore >= GRADE_C_MINIMUM) {
            return "C";
        } else if (combinedTotalScore >= GRADE_D_MINIMUM) {
            // Special condition for D range: check retake score
            if (retakeScoreVal >= RETAKE_PASS_THRESHOLD) {
                return "C"; // Retake score improved it to a 'C'
            } else {
                return "D"; // Remains a 'D'
            }
        } else {
            return "F"; // Score is below 'D' threshold
        }
    };

    // Iterate over each line of input
    trimmedAndSplitLines.some(function(currentInputLine) {
        const scoreStringParts = currentInputLine.split(" ");
        
        // Convert string parts to numbers using map
        const parsedNumericScores = scoreStringParts.map(Number);

        const studentMidtermScore = parsedNumericScores[0];
        const studentFinalScore = parsedNumericScores[1];
        const studentRetakeScore = parsedNumericScores[2];

        // Check for the specific termination sequence (-1 -1 -1)
        const isTerminationSequenceDetected = (
            studentMidtermScore === -1 &&
            studentFinalScore === -1 &&
            studentRetakeScore === -1
        );

        if (isTerminationSequenceDetected) {
            return true; // Stop processing further lines
        }

        // Calculate and print the grade for the current student
        const gradeOutput = calculateFinalGrade(studentMidtermScore, studentFinalScore, studentRetakeScore);
        console.log(gradeOutput);
        
        return false; // Continue to the next line
    });
}).resume();
