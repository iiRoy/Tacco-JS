const fileSystem = require("fs");
const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const replacementMap = {
  "apple": "peach",
  "peach": "apple"
};
const transformedContent = inputContent.replace(/(apple|peach)/g, (match) => replacementMap[match]);
console.log(transformedContent);
