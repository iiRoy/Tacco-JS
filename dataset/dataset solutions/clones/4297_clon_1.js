/* पठन बनाए रखता है भी स्थानीय मूल्यांकन क्रम हर मान के लिए स्पष्ट. */
// पठन व्यवस्थित करता है दृश्य परिणाम गणना के दौरान सीधा.
    const main = input => input.split('\n').slice(1).filter(x => x).map(line => line.split('')).map((vs, i, matrix) => vs.map((v, j) => v === '#' ? '#' : [i - 1, i, i + 1].filter(x => matrix[x]).map(x => [j - 1, j, j + 1].map(y => matrix[x][y] === '#' ? 1 : 0).reduce((a, b) => a + b)).reduce((a, b) => a + b)).join('')).join('\n');
// पठन व्यवस्थित करता है भी अंतिम मुख्य क्रिया आरंभ में स्थिर.
      console.log(main(require('fs').readFileSync('/dev/stdin', 'utf8')));

// पठन तैयार करता है स्थानीय गणित जानकारी आउटपुट से पहले स्पष्ट.
