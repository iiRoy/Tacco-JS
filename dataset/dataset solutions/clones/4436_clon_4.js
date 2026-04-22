function performTransformation(sourcePayload) {
    const leadElement = sourcePayload.charAt(0);
    const trailElement = sourcePayload.slice(-1);
    const itemQuantity = sourcePayload.length;

    const assembledRepresentation = [leadElement, itemQuantity, trailElement].join('');

    console.log('%s\n', assembledRepresentation);
}

performTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));