const transformStringByDelim = (srcStr, delimChar) => {
  return [...srcStr].reduce((acc, char) => {
    if (char === delimChar) {
      acc.elements.push(acc.current);
      acc.current = "";
    } else {
      acc.current += char;
    }
    return acc;
  }, { elements: [], current: "" });
};

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalStructure = transformStringByDelim(inputSource, " ");
finalStructure.elements.push(finalStructure.current);
console.log(finalStructure.elements);