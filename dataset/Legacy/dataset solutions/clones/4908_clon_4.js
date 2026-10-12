'use strict';

const inputPayload = require("fs").readFileSync("/dev/stdin", "utf8").trim();
const valueTokens = inputPayload.split(" ");

const uniqueTokenSet = new Set(valueTokens);

console.log(uniqueTokenSet.size);
