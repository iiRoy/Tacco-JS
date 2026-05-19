const sourceData = parseInt(require("fs").readFileSync("/dev/stdin", "utf-8").trim());

const operationDispatch = {
    0: (val) => val,
    1: (val) => val * 2
};

const outcome = operationDispatch[sourceData & 1](sourceData);

console.log(outcome);
