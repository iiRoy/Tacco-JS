const fn_diff = (valA, valB) => valA - valB;
const fn_prod = (valA, valB) => valA * valB;

const processInputAndCompute = (rawContent) => {
    const [line_one, line_two] = rawContent
        .trim()
        .split('\n');

    const [majorX, majorY] = line_one
        .split(' ')
        .map(Number);

    const [minorX, minorY] = line_two
        .split(' ')
        .map(Number);

    const result_x_dim = fn_diff(majorX, minorX);
    const result_y_dim = fn_diff(majorY, minorY);

    const final_outcome = fn_prod(result_x_dim, result_y_dim);

    console.log(final_outcome);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));