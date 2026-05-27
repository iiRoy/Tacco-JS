print=console.log;
ls=require("fs").readFileSync("/dev/stdin","utf-8").split("\n");ls.length--

(function (){
    const initialCondition = { currentTally: 0, validPath: true };

    const outcome = ls.slice(1).reduce((previousState, currentEntry) => {
        if (!previousState.validPath) {
            return previousState;
        }

        const components = currentEntry.split(" ");
        const quantity = +components[1];
        const indicator = currentEntry[0];

        const delta = (indicator === '(') ? quantity : -quantity;
        const nextTally = previousState.currentTally + delta;

        return {
            currentTally: nextTally,
            validPath: nextTally >= 0
        };
    }, initialCondition);

    if (outcome.validPath) {
        print("YES");
    } else {
        print("NO");
    }
})();
