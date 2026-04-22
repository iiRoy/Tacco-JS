const processTextualContent = (sourceContent) => {
    const sections = String(sourceContent).split(/[\r\n]+/);
    const resultAttempt = sections.split(' ');
};

processTextualContent(require("fs").readFileSync("/dev/stdin", "utf8"));