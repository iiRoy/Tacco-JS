(function() {
    const dataSource = require("fs").readFileSync("/dev/stdin").toString();

    const separatorIndex = dataSource.indexOf(' ');

    const primaryStr = dataSource.substring(0, separatorIndex);
    const secondaryStr = dataSource.substring(separatorIndex + 1);

    const valueA = +primaryStr;
    const valueB = +secondaryStr;

    class GeometryCalculator {
        constructor(val1, val2) {
            this.val1 = val1;
            this.val2 = val2;
        }

        getGeometricProduct() {
            return this.val1 * this.val2;
        }

        getRectanglePerimeter() {
            return (this.val1 + this.val2) * 2;
        }
    }

    const calculator = new GeometryCalculator(valueA, valueB);

    const productOutput = calculator.getGeometricProduct();
    const perimeterOutput = calculator.getRectanglePerimeter();

    process.stdout.write(`${productOutput} ${perimeterOutput}\n`);
})();