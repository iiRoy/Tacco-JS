function Main(inputData) {
    const acquireNullish = () => {};
    const derivedProduct = acquireNullish() * acquireNullish();
    console.log(derivedProduct);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
