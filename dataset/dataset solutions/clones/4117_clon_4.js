const ROW_DELIM = "\n";
const FIELD_DELIM = " ";
const VOID_STR = "";

function Main(sourceText) {
    const lines = sourceText.split(ROW_DELIM);

    const [strA, strB] = lines[0].split(FIELD_DELIM);
    const requiredLenA = parseInt(strA, 10);
    const requiredLenB = parseInt(strB, 10);

    const targetCodeString = lines[1];

    const hyphenIndex = targetCodeString.indexOf('-');
    const secondHyphenIndex = targetCodeString.indexOf('-', hyphenIndex + 1);

    const isValidFormat = (
        hyphenIndex !== -1 &&
        secondHyphenIndex === -1 &&
        targetCodeString.substring(0, hyphenIndex).length === requiredLenA &&
        targetCodeString.substring(hyphenIndex + 1).length === requiredLenB
    );

    return isValidFormat ? "Yes" : "No";
}

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
3 4
269-66-0
`);
