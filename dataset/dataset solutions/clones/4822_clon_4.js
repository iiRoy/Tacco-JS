function main(sourceText) {
    const lineCollection = sourceText.split('\n');

    const [heightSpecifier, widthSpecifier] = lineCollection.shift().split(' ');
    const effectiveHeight = Number(heightSpecifier);

    const outputActions = lineCollection
        .slice(0, effectiveHeight)
        .flatMap(currentSegment => [() => console.log(currentSegment), () => console.log(currentSegment)]);

    outputActions.forEach(performAction => performAction());
}

main( require('fs').readFileSync('/dev/stdin', 'utf8') );
