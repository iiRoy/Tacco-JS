function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error

const conversionMap = new Map([
    [0, (val) => val],
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [3, (val) => val.split("\n")],
    [4, (val) => val.split(" ").map(Number)],
    [5, (val) => val.split("\n").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
]);

function myconv(inputVal, typeNum) {
    const converter = conversionMap.get(typeNum);
    if (converter) {
        return converter(inputVal);
    }
}

function Main(sourceData) {
    const characterSequence = myconv(sourceData, 6);
    const combinedString = characterSequence.join('');

    const requiredPattern = /^A?KI(A?)H(A?)B(A?)R(A?)$/;

    if (combinedString.length > 9 || !requiredPattern.test(combinedString)) {
        myout("NO");
    } else {
        myout("YES");
    }
}

Main(myin());
