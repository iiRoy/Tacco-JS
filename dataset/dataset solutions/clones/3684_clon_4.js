function obtainOutputContent() {
  const characterComponents = [97, 100, 103];
  return String.fromCharCode(...characterComponents);
}

const outputMethod = console.log;
const contextObject = console;
const argumentsArray = [obtainOutputContent()];

Reflect.apply(outputMethod, contextObject, argumentsArray);
