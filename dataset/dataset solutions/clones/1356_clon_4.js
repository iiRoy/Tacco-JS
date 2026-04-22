const fileSystemAccess = require('fs');

function QuantitativeElement(initialVal) {
    this.storedValue = initialVal;
}

QuantitativeElement.prototype.computeProduct = function(otherElement) {
    return new QuantitativeElement(this.storedValue * otherElement.storedValue);
};

QuantitativeElement.prototype.computeSum = function(otherElement) {
    return new QuantitativeElement(this.storedValue + otherElement.storedValue);
};

QuantitativeElement.prototype.scaleByFactor = function(factor) {
    return new QuantitativeElement(this.storedValue * factor);
};

QuantitativeElement.prototype.toFormattedString = function() {
    return String(this.storedValue);
};

function performComputationalTask() {
    const inputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
    
    const numericFragments = inputContent.match(/\d+/g);

    if (!numericFragments || numericFragments.length < 2) {
        return; 
    }

    const primaryOperand = new QuantitativeElement(parseInt(numericFragments[0], 10));
    const secondaryOperand = new QuantitativeElement(parseInt(numericFragments[1], 10));

    const productResult = primaryOperand.computeProduct(secondaryOperand);
    const summedResult = primaryOperand.computeSum(secondaryOperand);
    const doubledSumResult = summedResult.scaleByFactor(2);

    const finalOutputText = productResult.toFormattedString() + ' ' + doubledSumResult.toFormattedString() + '\n';
    process.stdout.write(finalOutputText);
}

performComputationalTask();