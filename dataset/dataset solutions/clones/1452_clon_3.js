(function(rawData) {
    const NEWLINE_DELIMITER = '\n';
    const SPACE_DELIMITER = ' ';

    let lines = rawData.split(NEWLINE_DELIMITER);

    const sizeS = Number(lines.shift());
    const sLineContent = lines.shift();
    const arrayS = sLineContent.split(SPACE_DELIMITER).slice(0, sizeS).map(Number);

    const sizeT = Number(lines.shift());
    const tLineContent = lines.shift();
    const arrayT = tLineContent.split(SPACE_DELIMITER).slice(0, sizeT).map(Number);

    const uniqueElementsS = new Set(arrayS);

    let matchCount = 0;

    for (const targetElement of arrayT) {
        if (uniqueElementsS.has(targetElement)) {
            matchCount++;
        }
    }

    console.log(matchCount);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
