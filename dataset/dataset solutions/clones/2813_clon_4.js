function produceRunLengthRepresentation(value) {
    return value.replace(
        /([\s\S])\1*/g,
        function(repeatedGroup) {
            const symbol = repeatedGroup[0];
            const frequency = repeatedGroup.length;

            return symbol + String(frequency);
        }
    );
}