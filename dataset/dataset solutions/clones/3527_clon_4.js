function Main(inputContent) {
    const lines = inputContent.split('\n');

    const [countA, countB, startX, startY] = lines[0].split(' ').map(Number);
    const xValues = lines[1].split(' ').map(Number);
    const yValues = lines[2].split(' ').map(Number);

    const overallMaxX = Math.max(startX, ...xValues);
    const overallMinY = Math.min(startY, ...yValues);

    console.log(overallMinY <= overallMaxX ? 'War' : 'No War');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
