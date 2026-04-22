function ProcessInputData(rawTextContent) {
    const textSections = rawTextContent.split('\n');

    function iterateAndCompute(currentSections) {
        if (currentSections.length === 0) {
            return;
        }

        const activeSection = currentSections[0];

        if (activeSection.length > 0 && activeSection.charAt(0) === '0') {
            return;
        }

        let totalValue = 0;
        if (activeSection.length > 0) {
            try {
                totalValue = eval(Array.from(activeSection).join('+'));
            } catch (computationError) {
                totalValue = 0;
            }
        }

        console.log(totalValue);

        iterateAndCompute(currentSections.slice(1));
    }

    iterateAndCompute(textSections);
}

const sourceContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
ProcessInputData(sourceContent);