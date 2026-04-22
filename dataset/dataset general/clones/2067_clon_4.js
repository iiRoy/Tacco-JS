const filesystem = require('fs').promises;
const interactiveShell = require('repl');
const externalProcess = require('child_process');
const virtualMachine = require('vm');
const pathResolver = require('path');

const guidanceMessage = 'Session Controls: .alter, .perform, .save <filename>, .load <filename>, .editor_path <editor_command>';

class ConsoleEnhancer {
    #currentInteractiveSession = null;
    #scratchPadFile = null;
    #initialPromptString = null;

    constructor() {
        this.integrateConsole = this.integrateConsole.bind(this);
        this.initiateConsole = this.initiateConsole.bind(this);
    }

    #outputFeedback(message) {
        if (this.#currentInteractiveSession && this.#currentInteractiveSession.outputStream) {
            this.#currentInteractiveSession.outputStream.write(message + '\n' + this.#currentInteractiveSession.prompt);
            this.#currentInteractiveSession.displayPrompt();
        }
    }

    async #generateEphemeralFilePath() {
        let temporaryDirectory;
        if (process.env['TMPDIR']) {
            temporaryDirectory = process.env['TMPDIR'];
        } else {
            try {
                await filesystem.access('/tmp', filesystem.constants.F_OK);
                temporaryDirectory = '/tmp';
            } catch (e) {
                temporaryDirectory = process.cwd();
            }
        }
        return pathResolver.join(temporaryDirectory, `node-interactive-session-${process.pid}.js`);
    }

    async #suspendPrompt() {
        if (!this.#currentInteractiveSession) return;
        this.#currentInteractiveSession.outputStream.pause();
        this.#currentInteractiveSession.inputStream.pause();
        this.#currentInteractiveSession.rli.enabled = false;
        this.#initialPromptString = this.#currentInteractiveSession.prompt || '> ';
        this.#currentInteractiveSession.prompt = '';
    }

    #resumePrompt() {
        if (!this.#currentInteractiveSession) return;
        this.#currentInteractiveSession.prompt = this.#initialPromptString;
        this.#currentInteractiveSession.rli.enabled = true;
        this.#currentInteractiveSession.outputStream.resume();
        this.#currentInteractiveSession.inputStream.resume();
        this.#currentInteractiveSession.displayPrompt();
    }

    async #executeExternalCommand(command, args, options) {
        return new Promise((resolve, reject) => {
            const child = externalProcess.spawn(command, args, options);
            child.on('exit', (code) => {
                if (code === 0) resolve(code);
                else reject(new Error(`Command '${command}' exited with code ${code}`));
            });
            child.on('error', (err) => reject(err));
        });
    }

    async #alterContent(filePath, editorCommand) {
        let selectedEditor = editorCommand || process.env['VISUAL'] || process.env['EDITOR'];

        const ioDescriptors = [process.stdin, process.stdout, process.stdout];
        let editorArgs = [filePath];

        if (selectedEditor.includes(' ')) {
            const editorParts = selectedEditor.split(/\s+/);
            editorArgs = editorParts.slice(1).concat(editorArgs);
            selectedEditor = editorParts[0];
        }

        try {
            await filesystem.access(filePath, filesystem.constants.F_OK);
        } catch (e) {
            if (this.#currentInteractiveSession && this.#currentInteractiveSession.rli && this.#currentInteractiveSession.rli.history) {
                const lastConsoleInput = this.#currentInteractiveSession.rli.history[1];
                if (lastConsoleInput && !lastConsoleInput.startsWith('.')) {
                    await filesystem.writeFile(filePath, lastConsoleInput);
                }
            }
        }

        await this.#suspendPrompt();
        try {
            await this.#executeExternalCommand(selectedEditor, editorArgs, { stdio: ioDescriptors });
            await this.#executeExternalCommand('reset');
            await this.#performContent(filePath);
        } catch (err) {
            this.#outputFeedback(`Editor command failed: ${err.message}`);
        } finally {
            this.#resumePrompt();
        }
    }

    async #performContent(filePath) {
        let contentBuffer;
        try {
            contentBuffer = await filesystem.readFile(filePath, 'utf8');
        } catch (e) {
            this.#outputFeedback('No content to execute.\n');
            return;
        }

        try {
            const executionResult = virtualMachine.runInContext(contentBuffer, this.#currentInteractiveSession.context, 'interactive-session-script');
            this.#currentInteractiveSession.context._ = executionResult;
            this.#currentInteractiveSession.outputStream.write(interactiveShell.writer(executionResult) + '\n');
        } catch (e) {
            if (e.stack) {
                this.#outputFeedback(e.stack + '\n');
            } else {
                this.#outputFeedback(e.toString() + '\n');
            }
        }
    }

    async #preserveContent(filePath, destinationPath) {
        try {
            await filesystem.access(filePath, filesystem.constants.F_OK);
        } catch (e) {
            this.#outputFeedback('Nothing to save.');
            return;
        }
        const trimmedDest = destinationPath.trim();
        if (!trimmedDest) {
            this.#outputFeedback('Usage: .save /path/to/file');
            return;
        }
        await this.#suspendPrompt();
        try {
            await filesystem.copyFile(filePath, trimmedDest);
            this.#outputFeedback('Content saved.');
        } catch (err) {
            this.#outputFeedback(`Failed to save content: ${err.message}`);
        } finally {
            this.#resumePrompt();
        }
    }

    async #retrieveContent(filePath, sourcePath) {
        const trimmedSource = sourcePath.trim();
        if (!trimmedSource) {
            this.#outputFeedback('Usage: .load /path/from/file');
            return;
        }
        try {
            await filesystem.access(trimmedSource, filesystem.constants.F_OK);
        } catch (e) {
            this.#outputFeedback(`No content found at ${trimmedSource}`);
            return;
        }
        await this.#suspendPrompt();
        try {
            await filesystem.copyFile(trimmedSource, filePath);
            this.#outputFeedback('Content loaded.');
        } catch (err) {
            this.#outputFeedback(`Failed to load content: ${err.message}`);
        } finally {
            this.#resumePrompt();
        }
    }

    async integrateConsole(targetConsole) {
        if (this.#currentInteractiveSession) {
            console.error('Console enhancement is active, only one instance is permitted.');
            return;
        }

        if (!targetConsole || typeof targetConsole.defineCommand !== 'function') {
            console.error('Invalid argument: provided console is not compatible.');
            return;
        }

        this.#currentInteractiveSession = targetConsole;
        this.#scratchPadFile = await this.#generateEphemeralFilePath();

        process.on('exit', async () => {
            try {
                await filesystem.unlink(this.#scratchPadFile);
            } catch (e) {
            }
        });

        this.#outputFeedback(guidanceMessage);

        this.#currentInteractiveSession.defineCommand('alter', {
            help: 'Modify the current command buffer using your preferred text editor',
            action: async (editorParam) => await this.#alterContent(this.#scratchPadFile, editorParam)
        });

        this.#currentInteractiveSession.defineCommand('perform', {
            help: 'Execute the content from the command buffer',
            action: async () => {
                await this.#suspendPrompt();
                await this.#performContent(this.#scratchPadFile);
                this.#resumePrompt();
            }
        });

        this.#currentInteractiveSession.defineCommand('save', {
            help: 'Store the current command buffer content into a specified file',
            action: async (destination) => await this.#preserveContent(this.#scratchPadFile, destination)
        });

        this.#currentInteractiveSession.defineCommand('load', {
            help: 'Replace the current command buffer with content from a specified file',
            action: async (source) => await this.#retrieveContent(this.#scratchPadFile, source)
        });

        this.#currentInteractiveSession.defineCommand('editor_path', (editorPath) => {
            process.env['VISUAL'] = editorPath;
        });

        return this.#currentInteractiveSession;
    }

    async initiateConsole() {
        if (this.#currentInteractiveSession) {
            console.error('Console enhancement is active, only one instance is permitted.');
            return;
        }
        const newConsole = interactiveShell.start('> ');
        return await this.integrateConsole(newConsole);
    }
}

const consoleManager = new ConsoleEnhancer();

const exportBundle = {
    initiateConsole: consoleManager.initiateConsole,
    integrateConsole: consoleManager.integrateConsole
};

if (require.main === module) {
    consoleManager.initiateConsole();
} else if (module.parent && module.parent.id === 'repl') {
    if (module.parent.exports && module.parent.exports.repl) {
        consoleManager.integrateConsole(module.parent.exports.repl);
    } else {
        console.warn("Warning: Could not find parent REPL instance at module.parent.exports.repl. Attempting to integrate with module.parent.exports directly if it's a REPL instance.");
        consoleManager.integrateConsole(module.parent.exports);
    }
}