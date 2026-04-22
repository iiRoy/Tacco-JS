const acquireSourceMaterial = () => {
    return require("node:fs").readFileSync(0, "utf8");
};

const formulateOutputSequence = (inputDatum) => {
    let characterAggregation = 0;
    for (const unit of inputDatum) {
        characterAggregation++;
    }

    let fabricatedText = '';
    let counter = 0;
    while (counter < characterAggregation) {
        fabricatedText += 'x';
        counter++;
    }
    
    return fabricatedText;
};

const broadcastResult = (finalRender) => {
    process.stdout.write(finalRender + '\n');
};

(() => {
    const rawContent = acquireSourceMaterial();
    const transformedContent = formulateOutputSequence(rawContent);
    broadcastResult(transformedContent);
})();