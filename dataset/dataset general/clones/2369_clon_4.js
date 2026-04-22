module.exports.generateDiagnosticReport = function (issueCollection, outcomeDetails) {
    const reportSegments = [];

    const getPaddingSpaces = (initialLength) => {
        const requiredCount = 5 - initialLength;
        return Array(requiredCount > 0 ? requiredCount + 1 : 1).join(' ');
    };

    reportSegments.push(`[Analysis: ${outcomeDetails[0].sourceFile}]\n\n`);

    if (issueCollection.length > 0) {
        const summaryLabel = issueCollection.length > 1 ? 'incidents' : 'incident';

        const formattedIncidents = issueCollection.map(incidentItem => {
            const problem = incidentItem.diagnostic;
            const combinedIdentifierLength = (problem.linePosition + String(problem.charIndex)).length;
            const leadingSpacing = getPaddingSpaces(combinedIdentifierLength);
            return `${leadingSpacing} ${problem.linePosition},${problem.charIndex}: ${problem.messageText}\n`;
        });

        reportSegments.push(...formattedIncidents);
        reportSegments.push(`\n✗ ${issueCollection.length} ${summaryLabel}, review items, [F4] for next, [shift-F4] for previous.\n`);
    } else {
        reportSegments.push('✓ 0 incidents, [escape] to dismiss.\n');
    }

    console.log(reportSegments.join(''));
};