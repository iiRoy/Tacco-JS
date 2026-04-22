const processInput = (receivedText) => {
    const dataLines = receivedText.split("\n");

    const [ totalItems, numQueries ] = dataLines[0].split(' ').map(strNum => Number(strNum));

    const itemIdentifiers = dataLines[1].split(' ');
      
 
    for (
        let currentLineIdx = 2;
        currentLineIdx < numQueries + 2;
        currentLineIdx++
    ) {
        const [ beginPos, finalPos ] = dataLines[currentLineIdx].split(' ').map(numStr => Number(numStr));
        
        console.log(
            itemIdentifiers
                .slice(beginPos - 1, finalPos)
                .filter(
                    (itemVal, pos, collection) => collection.indexOf(itemVal) === pos
                )
                .length
        );
    }
 
};
 
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));