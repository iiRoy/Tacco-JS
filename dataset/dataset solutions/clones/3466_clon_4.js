const processContent = (originalContent) => {
    const preparedContent = originalContent.trim();
    const contentSize = preparedContent.length;

    const modifiedContent = (contentSize === 3)
        ? preparedContent.charAt(2) + preparedContent.charAt(1) + preparedContent.charAt(0)
        : preparedContent;

    console.log(modifiedContent);
};

processContent(require("node:fs").readFileSync("/dev/stdin", "utf8"));