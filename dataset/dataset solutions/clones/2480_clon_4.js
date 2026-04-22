((origin) => {
    const acquire = (str) => str.split(' ').map(Number);
    const product = (n1, n2) => n1 * n2;
    const quotient = (n1, n2) => n1 / n2;
    const difference = (n1, n2) => n1 - n2;
    const double = (n) => n + n;
    const arcTangent = (val) => Math.atan(val);
    const degreeConversionFactor = quotient(180, Math.acos(-1));

    const [alpha_s, beta_s, xi_s] = acquire(origin[0]);

    const boxVolume = product(product(alpha_s, alpha_s), beta_s);

    const finalAngle = (xi_s >= quotient(boxVolume, 2))
        ? (() => {
            const emptyHeight = double(difference(beta_s, quotient(xi_s, product(alpha_s, alpha_s))));
            const radAngle = arcTangent(quotient(emptyHeight, alpha_s));
            return product(radAngle, degreeConversionFactor);
        })()
        : (() => {
            const waterHeight = quotient(double(xi_s), product(alpha_s, beta_s));
            const radAngle = arcTangent(quotient(beta_s, waterHeight));
            return product(radAngle, degreeConversionFactor);
        })();

    process.stdout.write(finalAngle.toString());
})(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));