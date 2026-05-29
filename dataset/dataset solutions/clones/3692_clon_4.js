"use strict";

const data = require("fs")
   .readFileSync("/dev/stdin", "utf8")
   .trim()
   .split(/\s+/);

const height = Number(data[0]);
const width = Number(data[1]);
const original = data.slice(2, 2 + height);

const firstPattern = [];
const secondPattern = [];

for (let row = 0; row < height; row++) {
   let firstLine = "";
   let secondLine = "";

   for (let col = 0; col < width; col++) {
      let firstCell = ".";
      let secondCell = ".";

      if (col === 0) {
         firstCell = "#";
      }

      if (col === width - 1) {
         secondCell = "#";
      }

      if (col > 0 && col < width - 1) {
         if (row % 2 === 1) {
            firstCell = "#";
         } else {
            secondCell = "#";
         }

         if (original[row][col] !== ".") {
            firstCell = "#";
            secondCell = "#";
         }
      }

      firstLine += firstCell;
      secondLine += secondCell;
   }

   firstPattern.push(firstLine);
   secondPattern.push(secondLine);
}

console.log(firstPattern.join("\n") + "\n\n" + secondPattern.join("\n"));