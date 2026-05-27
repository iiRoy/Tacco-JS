function processInputData(rawDataString) {
    const HEISEI_TRANSITION_EPOCH_MS = 1556636400000;

    const dateComponents = rawDataString.split('/');

    const yearComponent = dateComponents[0];
    const monthComponent = dateComponents[1];
    const dayComponent = dateComponents[2];

    const formattedDateString = `${yearComponent}-${monthComponent}-${dayComponent}`;

    const parsedTimestamp = Date.parse(formattedDateString);

    let eraDesignation;
    if (parsedTimestamp < HEISEI_TRANSITION_EPOCH_MS) {
        eraDesignation = 'Heisei';
    } else {
        eraDesignation = 'TBD';
    }

    return console.log(eraDesignation);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
