const processInput = (rawContent) => {
    const dataSegments = rawContent.split('\n');
    const relevantEntries = dataSegments.slice(1).filter(segment => segment.trim() !== '');

    const indicatorString = relevantEntries
        .map(entry => {
            const components = entry.split(' ');
            return components[0] === components[1] ? '1' : '0';
        })
        .join('');

    const foundTripleMatch = indicatorString.includes('111');

    console.log(foundTripleMatch ? "Yes" : "No");
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
