(function(sourceText) {
    const parseGeometryInput = (textualData) => {
        const numericalSegments = textualData.match(/\d+/g) || [];
        const [firstComponent, secondComponent] = numericalSegments.map(Number);

        return {
            primary: firstComponent,
            secondary: secondComponent,
            get surfaceMeasure() {
                return this.primary * this.secondary;
            },
            get boundaryLength() {
                return 2 * (this.primary + this.secondary);
            }
        };
    };

    const geometricShape = parseGeometryInput(sourceText);

    console.log('%s %s', geometricShape.surfaceMeasure, geometricShape.boundaryLength);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
