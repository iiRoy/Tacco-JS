const displayToolkit = require('blessed');
const cliProgram = displayToolkit.program();

const interfaceBuilder = (clientSettings) => {

    const actionRegistry = new Map();
    actionRegistry.set('onSubmission', () => {}); // Default no-op handler

    const constructVisualElement = (elementType, configuration) => {
        return displayToolkit[elementType](configuration);
    };

    // Display surface
    const terminalCanvas = constructVisualElement('screen', {});

    // Log area for messages
    const chatDisplay = constructVisualElement('box', {
        top: 0,
        left: 0,
        right: 0,
        bottom: 3,
        content: 'Initiating communication sequence...',
        tags: true,
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
            bg: 0x666666
        },
        style: {
            fg: 'white'
        }
    });

    // User input field
    const textEntry = constructVisualElement('textarea', {
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        input: true,
        inputOnFocus: true,
        mouse: true,
        clickable: true,
        focused: true,
        content: '',
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
        }
    });

    chatDisplay.on('wheelup', () => {
        chatDisplay.scroll(-1);
        terminalCanvas.render();
    });
    chatDisplay.on('wheeldown', () => {
        chatDisplay.scroll(1);
        terminalCanvas.render();
    });

    terminalCanvas.append(chatDisplay);
    terminalCanvas.append(textEntry);

    terminalCanvas.focusPush(textEntry);

    const activateExitProcedure = () => {
        cliProgram.key('C-c', () => {
            chatDisplay.setContent('');
            chatDisplay.hide();
            textEntry.hide();
            terminalCanvas.render();
            cliProgram.clear();
            cliProgram.disableMouse();
            cliProgram.showCursor();
            cliProgram.normalBuffer();
            process.exit(0);
        });
    };
    activateExitProcedure();

    cliProgram.alternateBuffer();
    cliProgram.enableMouse();
    cliProgram.clear();
    terminalCanvas.render();

    const publishEntry = (entryContent, authorName, colorCode) => {
        chatDisplay.setScrollPerc(100);
        chatDisplay.insertBottom(`{#${colorCode}-fg}{bold}${authorName}:{/} ${entryContent}`);
        chatDisplay.setScrollPerc(100);
        terminalCanvas.render();
    };

    textEntry.key('enter', () => {
        const submittedText = textEntry.content.trim();
        if (submittedText.length > 0) {
            const submissionCallback = actionRegistry.get('onSubmission');
            if (submissionCallback) {
                submissionCallback(submittedText);
            }
        }
        textEntry.clearValue();
    });

    return {
        publishEntry: publishEntry,
        interactionHandlers: {
            assignSubmissionHandler: (handlerFunction) => actionRegistry.set('onSubmission', handlerFunction)
        }
    };
};

module.exports = interfaceBuilder;