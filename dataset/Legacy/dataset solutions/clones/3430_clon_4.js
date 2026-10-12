function solveProblem(inputStr) {
    const limitVal = parseInt(inputStr.split("\n")[0], 10);
    let totalValidCount = 0;

    function generateCombinations(currentNumber, digitPresenceMask) {
        if (currentNumber > 0) {
            if (currentNumber > limitVal) {
                return;
            }
            if (digitPresenceMask === 7) {
                totalValidCount++;
            }
        }

        if (String(currentNumber).length >= 10) {
            return;
        }

        generateCombinations(currentNumber * 10 + 3, digitPresenceMask | 1);
        generateCombinations(currentNumber * 10 + 5, digitPresenceMask | 2);
        generateCombinations(currentNumber * 10 + 7, digitPresenceMask | 4);
    }

    generateCombinations(0, 0);

    return totalValidCount;
}

function Main(input) {
    return solveProblem(input);
}

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
999999999
`);
