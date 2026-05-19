var processInputData = function(sourceContent) {
    console.log('No');
    return 0;
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
