const processInputString = (textualData) => {
    const firstLineEnd = textualData.indexOf('\n');
    const quantityText = textualData.slice(0, firstLineEnd);
    const quantity = Number.parseInt(quantityText, 10);
    const outputContent = '*'.repeat(quantity);
    process.stdout.write(outputContent + '\n');
};