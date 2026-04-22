const sysGlobals = require('system');

// Assuming 'fancyTextProcessor' and 'screenDispatcher' are globally available
// in the execution environment, equivalent to 'colorizer' and 'casper' respectively.
// This mirrors the original's implicit global dependencies while using new identifiers.

class InteractiveSession {
    constructor() {
        // Store references to the external input/output mechanisms and global utilities
        this.inputOutput = sysGlobals;
        this.formatter = fancyTextProcessor; // Corresponds to 'colorizer'
        this.channel = screenDispatcher;   // Corresponds to 'casper'
    }

    // A static factory method, replacing ConsoleIO.create()
    static manufacture() {
        return new InteractiveSession();
    }

    // Corresponds to ConsoleIO.prototype.print(text)
    dispatchRaw(inputContent) {
        this.inputOutput.stdout.write(inputContent);
    }

    // Corresponds to ConsoleIO.prototype.say(output)
    displayFormatted(visualSegments) {
        // Use a functional approach (map and join) instead of an imperative loop
        const assembledLine = visualSegments.map(segment => {
            return segment.style
                ? this.formatter.colorize(segment.text, segment.style)
                : segment.text;
        }).join('');

        this.channel.echo(assembledLine);
    }

    // Corresponds to ConsoleIO.prototype.ask(output)
    requestResponse(promptSegments) {
        this.displayFormatted(promptSegments);
        return this.inputOutput.stdin.readLine().trim();
    }
}

// Export the newly defined class, replacing module.exports = ConsoleIO;
module.exports = InteractiveSession;