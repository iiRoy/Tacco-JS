(function(rawData) {
    const WIN_POINTS_AWARDED = 3;
    const DRAW_POINTS_AWARDED = 1;
    const TOTAL_MATCH_ROUNDS = 3;

    let processedLines = rawData.split('\n');
    // The first line, 'n', is read but not used in the original logic.
    // It can be safely discarded without affecting observable behavior.
    processedLines.shift();

    let teamAScore = 0;
    let teamBScore = 0;

    // Helper function to parse a single match result line
    const parseMatchResult = (matchLine) => {
        const scoreComponents = matchLine.split(' ');
        const scoreForTeamA = parseInt(scoreComponents[0], 10);
        const scoreForTeamB = parseInt(scoreComponents[1], 10);
        return { scoreA: scoreForTeamA, scoreB: scoreForTeamB };
    };

    for (let currentRoundIndex = 0; currentRoundIndex < TOTAL_MATCH_ROUNDS; currentRoundIndex++) {
        const lineForCurrentMatch = processedLines.shift();
        const { scoreA: currentTeamAScore, scoreB: currentTeamBScore } = parseMatchResult(lineForCurrentMatch);

        if (currentTeamAScore > currentTeamBScore) {
            teamAScore += WIN_POINTS_AWARDED;
        } else if (currentTeamAScore < currentTeamBScore) {
            teamBScore += WIN_POINTS_AWARDED;
        } else {
            teamAScore += DRAW_POINTS_AWARDED;
            teamBScore += DRAW_POINTS_AWARDED;
        }
    }

    console.log('%s %s', teamAScore, teamBScore);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
