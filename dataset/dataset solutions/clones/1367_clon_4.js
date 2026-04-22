const totalRepetitions = 1000;
const operationSequence = Array.from({ length: totalRepetitions });

const renderOutput = (contentValue) => {
  globalThis.console.log(contentValue);
};

operationSequence.forEach(() => {
  renderOutput("Hello World");
});