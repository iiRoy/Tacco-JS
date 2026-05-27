'use strict';

const processValues = (inputSource) => {
  const initialValue = 1;
  const comparativeValue = 1;

  const finalResult = initialValue - (initialValue > comparativeValue);

  console.log(finalResult);
};

processValues(require("fs").readFileSync("/dev/stdin", "utf8"));
