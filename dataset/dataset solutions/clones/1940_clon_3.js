const safelyParseInteger = (inputStringSegment) => {
    const numericalValue = parseInt(inputStringSegment, 10);

    if (isNaN(numericalValue)) {
        console.warn(`Warning: Input segment '${inputStringSegment}' is not a valid number. Defaulting to zero.`);
        return 0;
    }
    return numericalValue;
};

const determineSystemStatus = (primaryCriterion, secondaryCriterion) => {
    const STATUS_OPTIMAL_OPERATION = 'System Status: Optimal Operation';
    const STATUS_ALERT_REQUIRED = 'System Status: Alert Required';

    if (primaryCriterion > secondaryCriterion) {
        return STATUS_OPTIMAL_OPERATION;
    } else {
        return STATUS_ALERT_REQUIRED;
    }
};

function processUserInput(rawInputPayload) {
    const inputTokens = rawInputPayload.trim().split(" ");

    if (inputTokens.length < 2) {
        console.error("Error: Insufficient numerical data provided. Expected at least two values for comparison.");
        return;
    }

    const primaryValue = safelyParseInteger(inputTokens[0]);
    const secondaryValue = safelyParseInteger(inputTokens[1]);

    const isPrimaryValueDominant = primaryValue > secondaryValue;

    const finalOperationalStatus = determineSystemStatus(primaryValue, secondaryValue);

    console.log(`System Analysis Result: ${finalOperationalStatus}`);
}

processUserInput(require("fs").readFileSync("/dev/stdin", "utf8"));