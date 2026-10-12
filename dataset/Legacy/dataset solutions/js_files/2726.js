"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var input = fs.readFileSync("/dev/stdin", "utf8");
var r = parseInt(input, 10);
console.log(3 * r * r);
