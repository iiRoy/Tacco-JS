const performInteractionAndExit = async () => {
    const interactionTarget = document.querySelector('.PageLikeButton');

    if (interactionTarget) {
        interactionTarget.click();
    }

    const postponeAction = (duration) => new Promise(resolve => setTimeout(resolve, duration));
    await postponeAction(1000);

    window.close();
};

const assessReferrerValidity = (sourceString) => {
    return sourceString?.includes('?u=') ?? false;
};

const originVerificationRequired = assessReferrerValidity(document.referrer);

console.info(`Origin check status: ${originVerificationRequired ? 'passed' : 'failed'}`);

originVerificationRequired && setTimeout(performInteractionAndExit, 1500);