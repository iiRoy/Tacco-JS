const systemOperations = require('child_process');

const createLinkTransmitter = () => {
    const transferOperation = (payloadData) => {
        return new Promise((resolve, reject) => {
            // The original 'echo' command implicitly converts its argument to a string.
            // We mimic this by ensuring the content written to stdin is a string.
            const contentToRelay = String(payloadData && typeof payloadData.resourceIdentifier !== 'undefined' ? payloadData.resourceIdentifier : undefined);

            const clipboardService = systemOperations.spawn('pbcopy');

            let errorFeedback = '';
            clipboardService.stderr.on('data', (segment) => {
                errorFeedback += segment.toString();
            });

            clipboardService.stdin.write(contentToRelay);
            clipboardService.stdin.end();

            clipboardService.on('close', (completionCode) => {
                if (completionCode === 0) {
                    resolve(payloadData);
                } else {
                    reject(new Error(`Data relay terminated with code ${completionCode}. Details: ${errorFeedback}`));
                }
            });

            clipboardService.on('error', (exception) => {
                // This handles issues like 'pbcopy' command not being found.
                reject(new Error(`Failed to initiate data relay channel: ${exception.message}`));
            });
        });
    };

    return {
        transmitLink: transferOperation
    };
};

module.exports = createLinkTransmitter;