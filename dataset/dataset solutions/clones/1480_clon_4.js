function stringRepeater(initialText){
    const numericFactor = Number(initialText);
    const unitString = "ACL";
    const resultantString = Array(numericFactor + 1).join(unitString);
    console.log(resultantString);
}
stringRepeater(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());