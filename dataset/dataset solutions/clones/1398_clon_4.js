const interpretSourceMaterial = (materialText) => {
    const sections = materialText.split('\n');
    const hasQueryMark = sections.includes('?');

    if (!hasQueryMark) {
        return;
    }

    const evaluateAndOutput = (currentPosition) => {
        if (currentPosition > sections.length) {
            // This case should ideally not be reached if eval(undefined) always throws.
            // It's a safeguard, but the error from eval(undefined) is what we expect.
            return;
        }

        const currentSegment = sections[currentPosition];
        try {
            console.log(eval(currentSegment));
        } catch (e) {
            // Re-throw to mimic the original program's behavior of crashing on an eval error
            throw e;
        }

        evaluateAndOutput(currentPosition + 1);
    };

    evaluateAndOutput(0);
};

const acquireExternalContent = (pathReference) => require("fs").readFileSync(pathReference, "utf8");

interpretSourceMaterial(acquireExternalContent("/dev/stdin"));