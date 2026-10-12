function Main(dataPayload) {
    const [firstLineContent] = dataPayload.split('\n');
    const [factorA, factorB, limitT] = firstLineContent.split(' ').map(Number);

    const finalAccumulation = Math.floor(limitT / factorA) * factorB;

    console.log(finalAccumulation);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
