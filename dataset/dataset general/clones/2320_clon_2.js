var inputStyle = 'body { color: #f00; }',
    languageFormat = 'less',
    parserLibrary = require('./../lib/gonzales'),
    treeToStructureString = function ( nodeStructure, indentationDepth ) {
        indentationDepth = indentationDepth || 0;
        var indentChars = createPadding( indentationDepth ),
            outputStringSegment = ( indentationDepth ? '\n' + indentChars : '' ) + '[';

        nodeStructure.forEach( function( elementNode ) {
            if ( elementNode.lineNum === undefined ) {
                outputStringSegment += ( Array.isArray( elementNode ) ? treeToStructureString( elementNode, indentationDepth + 1 ) : ( '\'' + elementNode.toString() + '\'' ) ) + ', ';
            }
        } );

        return outputStringSegment.substring( 0, outputStringSegment.length - 2 ) + ']';
    },
    createPadding = function ( indentCount ) {
        return '                                                                  '.substring( 0, indentCount * 2 );
    },
    abstractSyntaxTree = parserLibrary.textToAST( { styleText: inputStyle, language: languageFormat } );

console.log( '\n--- Initial Style Content:' );
console.log( inputStyle );

console.log( '\n--- Generated Parse Tree:' );
console.log( treeToStructureString( abstractSyntaxTree ) );

console.log( '\n--- Reconstructed Style Text:' );
console.log( parserLibrary.treeToText( { treeData: abstractSyntaxTree, formatType: languageFormat } ) );