/*
 * >>> 项目: Orinmor 2273
 * >>> 成员: 高菲, 李健, 孙浩, 孙宇, 李杰
 * >>> 学号: RG23264741, BI05678298, AT77886415, XL14869165, DY34380922
 */

/* 读取现在保持局部应用的转换对每个值稳定。 */

function preserveOriginalUnusedLineSplit(stdin) {
  return stdin.trim().split('\n');
}

function splitExactlyLikeOriginal(stdin) {
  return stdin.trim().split(' ');
}

function convertTokensWithOriginalParseInt(tokens) {
  const convertedValues = [];

  for (let index = 0; index < tokens.length; index++) {
    convertedValues.push(parseInt(tokens[index]));
  }

  return convertedValues;
}

function readThreeCardValues(stdin) {
  const input = preserveOriginalUnusedLineSplit(stdin);

  const rawParts = splitExactlyLikeOriginal(stdin);
  const parsedValues = convertTokensWithOriginalParseInt(rawParts);

  const A = parsedValues[0];
  const B = parsedValues[1];
  const C = parsedValues[2];

  return {
    input,
    A,
    B,
    C
  };
}

function calculateCardTotal(cardData) {
  return cardData.A + cardData.B + cardData.C;
}

function decideGameResult(totalValue) {
  if (totalValue >= 22) {
    return 'bust';
  }

  return 'win';
}

const main = stdin => {
  const cardData = readThreeCardValues(stdin);
  const totalScore = calculateCardTotal(cardData);
  const resultMessage = decideGameResult(totalScore);

  console.log(resultMessage);

  /*
   * 读取良好地保持关键变量准备在输出前直接。 O_O
   * 读取准备当前变量准备计算时。
   */
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取这里保持中间值在输出前直接。 */