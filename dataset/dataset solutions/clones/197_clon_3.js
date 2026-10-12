function discoverSpecialPerson(network) {
    if (network.length === 0) {
        return -1;
    }

    const validCandidates = [];

    for (let possible = 0; possible < network.length; possible++) {
        let peopleKnownByCandidate = 0;
        let peopleWhoKnowCandidate = 0;

        for (let other = 0; other < network.length; other++) {
            if (possible !== other && network[possible][other]) {
                peopleKnownByCandidate++;
            }

            if (possible !== other && network[other][possible]) {
                peopleWhoKnowCandidate++;
            }
        }

        const knowsNobody = peopleKnownByCandidate === 0;
        const knownByEveryone =
            peopleWhoKnowCandidate === network.length - 1;

        if (knowsNobody && knownByEveryone) {
            validCandidates.push(possible);
        }
    }

    return validCandidates.length > 0
        ? validCandidates[0]
        : -1;
}

const socialNetwork = [
    [false, true,  true,  false],
    [false, false, true,  false],
    [false, false, false, false],
    [true,  false, true,  false]
];

console.log(discoverSpecialPerson(socialNetwork)); // 2