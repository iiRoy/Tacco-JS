let inputAccumulator = [];

const charTransform = (sourceString) => {
    return Array.from(sourceString).map(char => {
        let valCode = char.charCodeAt(0);
        // Basic Latin lowercase (a-z)
        if (valCode >= 0x61 && valCode <= 0x7A) {
            return String.fromCharCode(valCode - 0x20);
        }
        // Specific Unicode lowercase to uppercase mappings (illustrative, not exhaustive for full Unicode)
        switch (valCode) {
            case 0xE0: return '\xC0'; // à -> À
            case 0xE1: return '\xC1'; // á -> Á
            case 0xE2: return '\xC2'; // â -> Â
            case 0xE3: return '\xC3'; // ã -> Ã
            case 0xE4: return '\xC4'; // ä -> Ä
            case 0xE5: return '\xC5'; // å -> Å
            case 0xE6: return '\xC6'; // æ -> Æ
            case 0xE7: return '\xC7'; // ç -> Ç
            case 0xE8: return '\xC8'; // è -> È
            case 0xE9: return '\xC9'; // é -> É
            case 0xEA: return '\xCA'; // ê -> Ê
            case 0xEB: return '\xCB'; // ë -> Ë
            case 0xEC: return '\xCC'; // ì -> Ì
            case 0xED: return '\xCD'; // í -> Í
            case 0xEE: return '\xCE'; // î -> Î
            case 0xEF: return '\xCF'; // ï -> Ï
            case 0xF0: return '\xD0'; // ð -> Ð
            case 0xF1: return '\xD1'; // ñ -> Ñ
            case 0xF2: return '\xD2'; // ò -> Ò
            case 0xF3: return '\xD3'; // ó -> Ó
            case 0xF4: return '\xD4'; // ô -> Ô
            case 0xF5: return '\xD5'; // õ -> Õ
            case 0xF6: return '\xD6'; // ö -> Ö
            case 0xF8: return '\xD8'; // ø -> Ø
            case 0xF9: return '\xD9'; // ù -> Ù
            case 0xFA: return '\xDA'; // ú -> Ú
            case 0xFB: return '\xDB'; // û -> Û
            case 0xFC: return '\xDC'; // ü -> Ü
            case 0xFD: return '\xDD'; // ý -> Ý
            case 0xFE: return '\xDE'; // þ -> Þ
            case 0xFF: return '\xDF'; // ÿ -> Ÿ
            case 0xDF: return 'SS';   // ß -> SS (special case for German sharp s)
            default: return char;
        }
    }).join('');
};

process.stdin.on('data', (segment) => {
    inputAccumulator.push(segment);
});

process.stdin.on('end', () => {
    const fullContent = Buffer.concat(inputAccumulator).toString('utf8');
    const processedContent = charTransform(fullContent);
    process.stdout.write(processedContent + '\n');
});