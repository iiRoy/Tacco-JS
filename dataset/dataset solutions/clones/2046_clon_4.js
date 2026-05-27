function computeCubicVolume(inputString) {
    console.log((+inputString / 3) ** 3);
}

computeCubicVolume(require("fs").readFileSync("/dev/stdin", "utf8"));
