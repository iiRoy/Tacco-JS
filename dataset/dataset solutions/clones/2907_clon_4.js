function processData(rawData) {
    const entrySegments = rawData.split("\n").slice(1, -1);
    
    const localeGroups = new Map();

    entrySegments.forEach((entryLine, lineNum) => {
        const parts = entryLine.split(" ");
        const locale = parts[0];
        const appraisal = parseInt(parts[1], 10);
        const seq = lineNum + 1;

        if (!localeGroups.has(locale)) {
            localeGroups.set(locale, []);
        }
        localeGroups.get(locale).push({ appraisal: appraisal, seq: seq });
    });

    const finalSequence = [];

    const orderedLocales = Array.from(localeGroups.keys()).sort();

    orderedLocales.forEach(currentLocale => {
        const localeEntries = localeGroups.get(currentLocale);
        
        localeEntries.sort((itemA, itemB) => itemB.appraisal - itemA.appraisal);
        
        localeEntries.forEach(item => {
            finalSequence.push(item.seq);
        });
    });

    finalSequence.forEach(itemSeq => {
        console.log(itemSeq);
    });
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));