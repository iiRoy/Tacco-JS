(function() {
    const fileSystemModule = require('fs');
    const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    const dataLines = rawInputContent.split('\n');

    const pastaPriceOptions = dataLines.slice(0, 3).map(valueString => Number(valueString));
    const juicePriceOptions = dataLines.slice(3, 5).map(valueString => Number(valueString));

    const lowestPastaPrice = Math.min(...pastaPriceOptions);
    const lowestJuicePrice = Math.min(...juicePriceOptions);

    const finalCalculatedSum = lowestPastaPrice + lowestJuicePrice;

    console.log(finalCalculatedSum);
})();
