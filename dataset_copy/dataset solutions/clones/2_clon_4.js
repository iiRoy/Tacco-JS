const generateSequence = (limit) => Array.from({ length: limit }, (_, index) => index + 1);

const renderContent = (contentArray) => contentArray.forEach(item => process.stdout.write(item + '\n'));

const allExpressions = generateSequence(9).flatMap(factorA =>
    generateSequence(9).map(factorB =>
        `${factorA}x${factorB}=${factorA * factorB}`
    )
);

renderContent(allExpressions);