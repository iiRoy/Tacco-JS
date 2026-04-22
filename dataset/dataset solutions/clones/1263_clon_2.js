'use strict';
( function ( inputSource ) {
    // Define the core drawing routine
    function renderBox ( dimensions ) {
        var widthVal = dimensions[0];
        var heightVal = dimensions[1];
        var topBottomBorder = [];
        for ( var colIdx = 0; colIdx < widthVal; colIdx++ ) {
            topBottomBorder.push('#');
        }
        topBottomBorder = topBottomBorder.join('');

        var middleRowContent = [];
        for ( var rowFillIdx = 0; rowFillIdx < widthVal - 2; rowFillIdx++ ) {
            middleRowContent.push('.');
        }
        middleRowContent.push('#');
        middleRowContent.unshift('#');
        middleRowContent = middleRowContent.join('');

        var drawnShape = [];
        for ( var lineBuilderIdx = 0; lineBuilderIdx < heightVal - 2; lineBuilderIdx++ ) {
            drawnShape.push(middleRowContent);
        }
        drawnShape.push(topBottomBorder);
        drawnShape.unshift(topBottomBorder);

        return drawnShape.join('\n');
    }

    // Obtain and preprocess raw data
    var sourceDataBlocks = inputSource.toString().trim().split('\n');
    var geometrySpecs = sourceDataBlocks.slice(0, sourceDataBlocks.indexOf('0 0'));
    geometrySpecs = geometrySpecs.map(function ( itemString ) {
        return itemString.split(' ').map(Number);
    });

    // Process input sets and generate visual representations
    var entireFigureCollection = geometrySpecs.map(renderBox).join('\n\n');

    // Output the complete result
    console.log(entireFigureCollection);
} )( require('fs').readFileSync('/dev/stdin', 'utf8') );