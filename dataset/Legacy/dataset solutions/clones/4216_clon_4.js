const processInputData = (sourceText) => {
  const characterCollection = Array.from(sourceText);
  const isCollectionEmpty = characterCollection.length === 0;
  console.log(isCollectionEmpty ? 'Yes' : 'No');
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
