"use strict";

const { promises: fileOperations } = require("node:fs");
const { resolve: resolvePath, dirname: getDirectoryName, basename: getBaseName, join: joinPaths } = require("node:path");
const { spawn: initiateProcess } = require("node:child_process");

const mapExitCodeToDescription = (numericCode) => {
    const codeDescriptions = new Map([
        [2, "Configuration problem in the daemon's setup"],
        [3, "Daemon's internal initialization failed"],
    ]);
    return codeDescriptions.get(numericCode) || `Unidentified termination reason (code: ${numericCode})`;
};

class InternalEventRelay {
    constructor() {
        this._subscribers = new Map();
    }

    register(eventTag, handlerFunction) {
        if (!this._subscribers.has(eventTag)) {
            this._subscribers.set(eventTag, new Set());
        }
        this._subscribers.get(eventTag).add(handlerFunction);
        return () => this.deregister(eventTag, handlerFunction);
    }

    deregister(eventTag, handlerFunction) {
        if (this._subscribers.has(eventTag)) {
            const handlers = this._subscribers.get(eventTag);
            handlers.delete(handlerFunction);
            if (handlers.size === 0) {
                this._subscribers.delete(eventTag);
            }
        }
    }

    notify(eventTag, ...dataPayload) {
        if (this._subscribers.has(eventTag)) {
            this._subscribers.get(eventTag).forEach(handler => {
                try {
                    handler(...dataPayload);
                } catch (e) {
                    console.error(`Event handler for '${eventTag}' encountered an error:`, e);
                }
            });
        }
    }

    waitForOne(eventTag) {
        return new Promise(resolve => {
            const handler = (...dataPayload) => {
                this.deregister(eventTag, handler);
                resolve(...dataPayload);
            };
            this.register(eventTag, handler);
        });
    }
}

class ProcessOverseer {
    constructor(configuration) {
        this.eventRelay = new InternalEventRelay();

        if (!configuration.main) {
            throw new Error("Expected 'main' setting for background service");
        }

        const currentModuleDirectory = getDirectoryName(module.parent.filename);
        const resolvedPrimaryModule = resolvePath(currentModuleDirectory, configuration.main);
        const serviceDesignation = configuration.name || getBaseName(resolvedPrimaryModule, ".js");

        if (!this._isPathAnActualFile(resolvedPrimaryModule)) {
            throw new Error(`Cannot locate primary module for service: '${resolvedPrimaryModule}'`);
        }

        this.internalConfiguration = { ...configuration };
        this.internalConfiguration.primaryModulePath = resolvedPrimaryModule;
        this.internalConfiguration.serviceDesignation = this.serviceDesignation = serviceDesignation;

        this.internalConfiguration.identityFileLocation = configuration.pidfile
            ? resolvePath(currentModuleDirectory, configuration.pidfile)
            : joinPaths("/var/run", serviceDesignation + ".pid");

        this.internalConfiguration.systemUser = configuration.user || "";
        this.internalConfiguration.systemGroup = configuration.group || "";

        if (typeof configuration.umask === "undefined") {
            this.internalConfiguration.fileCreationMask = 0;
        } else if (typeof configuration.umask === "string") {
            this.internalConfiguration.fileCreationMask = parseInt(configuration.umask, 10);
        } else {
            this.internalConfiguration.fileCreationMask = configuration.umask;
        }

        this.internalConfiguration.supplementaryArguments = this._adaptToArgumentArray(configuration.args);
        this.internalConfiguration.executionArguments = this._adaptToArgumentArray(configuration.argv || process.argv.slice(2));

        this.gracefulShutdownInterval = configuration.stopTimeout || 2000;

        this.childProcessTerminationObserver = null;
        this.childProcessDisconnectionObserver = null;
        this.disconnectionVerificationTimer = null;

        if (!configuration.silent) {
            this._establishLoggingHooks();
        }
    }

    async initiateDaemon(completionCallback) {
        let activeProcessId = await this.retrieveProcessIdentifier();

        if (this.dispatchSystemSignal(activeProcessId)) {
            this.eventRelay.notify("alreadyActive", activeProcessId);
            if (completionCallback) completionCallback(null, activeProcessId);
            return this;
        }

        if (completionCallback) {
            let errorCleanup, startedCleanup;
            const errorObserver = (errorOutcome) => {
                if (startedCleanup) startedCleanup();
                completionCallback(errorOutcome, 0);
            };
            const startedObserver = (pidVal) => {
                if (errorCleanup) errorCleanup();
                completionCallback(null, pidVal);
            };
            errorCleanup = this.eventRelay.register("failure", errorObserver);
            startedCleanup = this.eventRelay.register("activated", startedObserver);
        }

        this.eventRelay.notify("activating");

        const initialPidFileWriteError = await this.persistProcessIdentifier("");
        if (initialPidFileWriteError) {
            this.eventRelay.notify("failure", new Error(`Unable to prepare identity file (${initialPidFileWriteError})`));
            return this;
        }

        const wrapperScriptLocation = joinPaths(__dirname, "service_wrapper.js");
        const processArguments = (this.internalConfiguration.supplementaryArguments || [])
            .concat([wrapperScriptLocation])
            .concat(this.internalConfiguration.executionArguments);

        const controlledSubprocess = initiateProcess(process.execPath, processArguments, {
            env: process.env,
            stdio: ["ignore", "ignore", "ignore", "ipc"],
            detached: true
        });
        activeProcessId = controlledSubprocess.pid;

        await this.persistProcessIdentifier(activeProcessId);

        controlledSubprocess.on("message", (interProcessMessage) => {
            if (interProcessMessage.type === "error") {
                throw new Error(interProcessMessage.error);
            }
        });

        this.childProcessTerminationObserver = (terminationCode, terminationSignal) => {
            controlledSubprocess.removeListener("disconnect", this.childProcessDisconnectionObserver);
            clearTimeout(this.disconnectionVerificationTimer);

            if (terminationCode > 0) {
                this.eventRelay.notify("failure", new Error(
                    terminationCode > 1
                    ? mapExitCodeToDescription(terminationCode)
                    : `Module '${this.internalConfiguration.primaryModulePath}' ceased unexpectedly`
                ));
            } else {
                this.eventRelay.notify("deactivated");
            }
        };
        controlledSubprocess.once("exit", this.childProcessTerminationObserver);

        this.childProcessDisconnectionObserver = () => {
            this.disconnectionVerificationTimer = setTimeout(async () => {
                controlledSubprocess.removeListener("exit", this.childProcessTerminationObserver);

                if (this.dispatchSystemSignal(activeProcessId)) {
                    this.eventRelay.notify("activated", activeProcessId);
                } else {
                    this.eventRelay.notify("failure", new Error("Daemon failed to become active"));
                }
            }, 100);
        };
        controlledSubprocess.once("disconnect", this.childProcessDisconnectionObserver);

        controlledSubprocess.send({ type: "init", options: this.internalConfiguration });

        controlledSubprocess.unref();

        return this;
    }

    async ceaseDaemon(completionCallback, signalsToUse, timeoutDuration) {
        return this._manageProcessTermination(signalsToUse || ["SIGTERM"], timeoutDuration || 0, completionCallback);
    }

    async forciblyTerminateDaemon(completionCallback, signalsToUse, timeoutDuration) {
        return this._manageProcessTermination(signalsToUse || ["SIGTERM", "SIGKILL"], timeoutDuration || 0, completionCallback);
    }

    async queryDaemonState() {
        const processId = await this.retrieveProcessIdentifier();
        return this.dispatchSystemSignal(processId);
    }

    async transmitCommandSignal(specificSignal) {
        const processId = await this.retrieveProcessIdentifier();
        return this.dispatchSystemSignal(processId, specificSignal);
    }

    _adaptToArgumentArray(inputArgs) {
        if (typeof inputArgs === "undefined") return [];
        if (typeof inputArgs === "string") {
            return inputArgs.trim().split(/\s+/).filter(arg => !!arg);
        }
        return inputArgs;
    }

    async retrieveProcessIdentifier() {
        try {
            const content = await fileOperations.readFile(this.internalConfiguration.identityFileLocation, "utf8");
            return parseInt(content.trim(), 10);
        } catch (errorOutcome) {
            // File not found or unreadable usually means no PID
        }
        return 0;
    }

    async persistProcessIdentifier(processIdValue) {
        try {
            await fileOperations.writeFile(this.internalConfiguration.identityFileLocation, processIdValue + "\n");
        } catch (exception) {
            return exception.code;
        }
        return "";
    }

    dispatchSystemSignal(processId, signalType) {
        if (!processId) return 0;
        try {
            process.kill(processId, signalType || 0);
            return processId;
        } catch (errorOutcome) {
            // ESRCH means process not found, EPERM means no permission
        }
        return 0;
    }

    async _manageProcessTermination(signalSequence, terminationTimeout, completionCallback) {
        const processId = await this.retrieveProcessIdentifier();

        if (!processId) {
            this.eventRelay.notify("notActive");
            if (completionCallback) completionCallback(null, 0);
            return this;
        }

        if (completionCallback) {
            const stopCompleteObserver = (pidVal) => {
                completionCallback(null, pidVal);
            };
            this.eventRelay.waitForOne("deactivated").then(stopCompleteObserver);
        }

        this.eventRelay.notify("deactivating");

        await this._attemptGracefulTermination(processId, [...signalSequence], terminationTimeout);

        try {
            await fileOperations.unlink(this.internalConfiguration.identityFileLocation);
        } catch (exception) {
            // Ignore if file doesn't exist or can't be deleted
        }

        this.eventRelay.notify("deactivated", processId);

        return this;
    }

    async _attemptGracefulTermination(processId, remainingSignals, timeoutDuration) {
        if (!this.dispatchSystemSignal(processId, remainingSignals.length > 1 ? remainingSignals.shift() : remainingSignals[0])) {
            return;
        }

        return new Promise(resolve => {
            setTimeout(async () => {
                await this._attemptGracefulTermination(processId, remainingSignals, timeoutDuration);
                resolve();
            }, timeoutDuration || this.gracefulShutdownInterval);
        });
    }

    _isPathAnActualFile(targetPath) {
        try {
            const pathStats = require("node:fs").statSync(targetPath);
            return pathStats && !pathStats.isDirectory();
        } catch (errorOutcome) {
            // Path does not exist or inaccessible
        }
        return false;
    }

    _establishLoggingHooks() {
        this.eventRelay.register("activating", () => {
            console.log(`Initiating ${this.serviceDesignation} background service...`);
        });
        this.eventRelay.register("activated", (pidVal) => {
            console.log(`${this.serviceDesignation} background service commenced. PID: ${pidVal}`);
        });
        this.eventRelay.register("deactivating", () => {
            console.log(`Halting ${this.serviceDesignation} background service...`);
        });
        this.eventRelay.register("deactivated", () => {
            console.log(`${this.serviceDesignation} background service halted.`);
        });
        this.eventRelay.register("alreadyActive", (pidVal) => {
            console.log(`${this.serviceDesignation} background service already active. PID: ${pidVal}`);
        });
        this.eventRelay.register("notActive", () => {
            console.log(`${this.serviceDesignation} background service is not active`);
        });
        this.eventRelay.register("failure", (errorOutcome) => {
            console.log(`${this.serviceDesignation} background service failed to commence: ${errorOutcome.message}`);
        });
    }
}

exports.constructService = (initialSettings) => {
    return new ProcessOverseer(initialSettings);
};