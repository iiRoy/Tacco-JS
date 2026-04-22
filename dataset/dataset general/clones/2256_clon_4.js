(() => {
    "use strict";
    const sourceDisplay = globalThis.document.querySelector('body').innerHTML;
    let initialBracketIndex = -1;
    let finalBracketIndex = -1;

    for (let c = 0; c < sourceDisplay.length; ++c) {
        if (sourceDisplay[c] === '{') {
            initialBracketIndex = c;
            break;
        }
    }

    if (initialBracketIndex === -1) {
        return;
    }

    for (let c = sourceDisplay.length - 1; c >= 0; --c) {
        if (sourceDisplay[c] === '}') {
            finalBracketIndex = c;
            break;
        }
    }

    if (finalBracketIndex === -1 || finalBracketIndex < initialBracketIndex) {
        return;
    }

    const contentToTransmit = sourceDisplay.slice(initialBracketIndex + 1, finalBracketIndex);

    globalThis.parent.postMessage(contentToTransmit, '*');
})();