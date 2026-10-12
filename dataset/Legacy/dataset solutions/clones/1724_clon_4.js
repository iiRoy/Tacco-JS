'use strict';
function Main(inputSource){
  const processedLines = inputSource.trim().split(/\r?\n/g);
  const firstLine = processedLines[0];
  const secondLine = processedLines[1];

  const mismatchCount = Array.from(firstLine).filter((charA, index) => charA !== secondLine[index]).length;

  console.log(mismatchCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
