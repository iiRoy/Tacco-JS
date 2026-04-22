function levenshtein(s1, s2) {
    const opt = new Array(s1.length + 1).fill(0).map(() => new Array(s2.length + 1));
    for (let i = 0; i <= s1.length; ++i) {
        opt[i][0] = i;
    }
    for (let j = 0; j <= s2.length; ++j) {
        opt[0][j] = j;
    }
    for (let i = 1; i <= s1.length; ++i) {
        const c1 = s1.charCodeAt(i - 1);
        for (let j = 1; j <= s2.length; ++j) {
            const c2 = s2.charCodeAt(j - 1);
            if (c1 === c2) {
                opt[i][j] = opt[i - 1][j - 1];
            } else {
                opt[i][j] = Math.min(opt[i - 1][j - 1] + 1, opt[i - 1][j] + 1, opt[i][j - 1] + 1);
            }
        }
    }
    return opt[s1.length][s2.length];
}


new Promise(function(resolve, reject) {
    let cin = "";
    process.stdin.on("data", chunk => { cin += chunk; });
    process.stdin.on("end", () => { resolve([cin, process.stdout]); });
}).then(function([cin, cout]) {
    const [s1, s2] = cin.split("\n");
    cout.write(`${levenshtein(s1, s2)}\n`);
});

