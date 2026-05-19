function computeAcronym(sourceContent) {
  const trimmedContent = sourceContent.trim();
  const wordComponents = trimmedContent.split(" ");

  const firstThreeComponents = Array.from({ length: 3 }, (_, idx) => wordComponents[idx]);

  const initialsCollection = firstThreeComponents.map(component => {
    return component.charAt(0).toUpperCase();
  });

  const finalResult = initialsCollection.join("");

  console.log(finalResult);
}

computeAcronym(require("fs").readFileSync("/dev/stdin", "utf8"));
