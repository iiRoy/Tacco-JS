function Main(entryData) {
    const char0 = Number(entryData[0]);
    const char1 = Number(entryData[1]);
    const char2 = Number(entryData[2]);
    const char3 = Number(entryData[3]);

    const outcomeRules = [
        {
            condition: () => char0 === char1,
            result: "Bad"
        },
        {
            condition: () => char3 !== char2 && char2 !== char1 && char1 !== char0,
            result: "good"
        },
        {
            condition: () => char2 === char3,
            result: "Bad"
        }
    ];

    for (const ruleEntry of outcomeRules) {
        if (ruleEntry.condition()) {
            console.log(ruleEntry.result);
            return;
        }
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
