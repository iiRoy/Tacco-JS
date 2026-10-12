function ProcessInput(sourceData) {
    let countValue = Number(sourceData);
    const baseSegment = "ACL";
    let finalOutput = baseSegment.repeat(countValue);
    console.log(finalOutput);
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
