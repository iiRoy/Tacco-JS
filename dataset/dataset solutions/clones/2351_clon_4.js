((fileSystemAccess) => {
    const dataStream = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
    const inputChunks = dataStream.trim().split(/\s+/g);
    let readPointer = 0;

    const pullNextToken = () => inputChunks[readPointer++];
    const pullNextInteger = () => parseInt(pullNextToken(), 10);

    const totalSubjects = pullNextInteger();
    const subjectDeclarations = Array.from({ length: totalSubjects }, () => []);

    for (let currentSubject = 0; currentSubject < totalSubjects; currentSubject++) {
        const declarationCount = pullNextInteger();
        for (let declarationIdx = 0; declarationIdx < declarationCount; declarationIdx++) {
            const targetSubject = pullNextInteger() - 1;
            const declaredStatus = pullNextInteger();
            subjectDeclarations[currentSubject].push({ target: targetSubject, status: declaredStatus });
        }
    }

    let maximumValidCount = 0;

    const findOptimalConfiguration = (subjectIndex, currentBitmask) => {
        if (subjectIndex === totalSubjects) {
            let activeSubjectsInCurrent = 0;
            let isConfigurationSound = true;

            for (let i = 0; i < totalSubjects; i++) {
                const isSubjectActive = (currentBitmask >> i) & 1;
                if (isSubjectActive) {
                    activeSubjectsInCurrent++;

                    for (const declaration of subjectDeclarations[i]) {
                        const targetSubjectState = (currentBitmask >> declaration.target) & 1;
                        if (targetSubjectState !== declaration.status) {
                            isConfigurationSound = false;
                            break;
                        }
                    }
                }
                if (!isConfigurationSound) {
                    break;
                }
            }

            if (isConfigurationSound) {
                maximumValidCount = Math.max(maximumValidCount, activeSubjectsInCurrent);
            }
            return;
        }

        // Option 1: Current subject is inactive
        findOptimalConfiguration(subjectIndex + 1, currentBitmask);

        // Option 2: Current subject is active
        findOptimalConfiguration(subjectIndex + 1, currentBitmask | (1 << subjectIndex));
    };

    findOptimalConfiguration(0, 0);

    console.log(maximumValidCount);

})(require('fs'));