'use strict';
(function(fileSystemModule) {
    const standardInputPath = '/dev/stdin';
    const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

    const inputLines = rawInputContent.toString().split('\n');
    const firstParameterLine = inputLines[0];

    const stringParameters = firstParameterLine.split(' ');
    const numericValuesArray = stringParameters.map(Number);

    function evaluateGeometricConstraint(widthBoundary, heightBoundary, circleX, circleY, circleRadius) {
        // The original condition used the comma operator:
        // if(x - r < 0 ,y - r < 0 ,x + r > W ,y + x > H)
        // This evaluates all expressions from left to right and returns the value of the last one.
        // Therefore, the effective condition is `y + x > H`.
        // We preserve this exact behavior by evaluating each part and then using the comma operator
        // to assign the final, effective condition to a variable.

        const checkLeftEdge = circleX - circleRadius < 0;
        const checkBottomEdge = circleY - circleRadius < 0;
        const checkRightEdge = circleX + circleRadius > widthBoundary;
        const checkTopEdge = circleY + circleX > heightBoundary; // This is the condition that ultimately determines the 'if' branch

        // The comma operator ensures all preceding expressions are evaluated,
        // but only the value of the last expression is returned.
        let finalDecisionFlag = (checkLeftEdge, checkBottomEdge, checkRightEdge, checkTopEdge);

        if (finalDecisionFlag) {
            console.log('No');
        } else {
            console.log('yes');
        }
    }

    const [W_val, H_val, X_val, Y_val, R_val] = numericValuesArray;
    evaluateGeometricConstraint(W_val, H_val, X_val, Y_val, R_val);

}(require('fs')));
