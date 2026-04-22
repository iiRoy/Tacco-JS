const PathUtility = require('path');
const FileSystem = require('fs');
const StringMinifier = require('jsonminify');
const ProcessHandler = require('child_process');
const MonitoringService = require('../watcher');

const getCurrentWorkingDir = () => process.cwd();
const getRuntimeArguments = () => process.argv;
const parseJsonContent = (str) => JSON.parse(str);
const scheduleAction = (fn, delay) => setTimeout(fn, delay);
const outputMessage = (msg) => console.log(msg);

const TEXT_ENCODING_OPTS = { encoding: 'utf8' };
const DEBOUNCE_INTERVAL_MS = 100;
const DEFAULT_MAIN_SCRIPT_NAME = 'index.js';
const LOG_PREFIX = '[hot-reloader]';

const resolveAbsolutePath = (base, relative) => PathUtility.resolve(base, relative);
const combinePathSegments = (...segments) => PathUtility.join(...segments);

const retrieveFileContent = (filePath) => FileSystem.readFileSync(filePath, TEXT_ENCODING_OPTS);
const storeFileContent = (filePath, content, callback) => FileSystem.writeFile(filePath, content, TEXT_ENCODING_OPTS, callback);

class ApplicationReloader {
    constructor() {
        this.activeProcess = null;
        this.relaunchTimeoutId = null;
        this.appEntryScript = null;
        this.appArguments = [];
        this.currentSettings = {};
        this.fileMonitor = null;
    }

    async loadConfiguration() {
        const primaryConfigPath = resolveAbsolutePath(getCurrentWorkingDir(), 'hot-reload.json');
        let rawConfigData;

        try {
            rawConfigData = StringMinifier(retrieveFileContent(primaryConfigPath));
        } catch (e) {
            const defaultConfigPath = combinePathSegments(__dirname, '../../default-config.json');
            rawConfigData = StringMinifier(retrieveFileContent(defaultConfigPath));
            storeFileContent(primaryConfigPath, rawConfigData, () => {});
            outputMessage(`${LOG_PREFIX} Default configuration loaded and saved to "${primaryConfigPath}".`);
        }

        this.currentSettings = rawConfigData ? parseJsonContent(StringMinifier(rawConfigData)) : {};
        outputMessage(`${LOG_PREFIX} Configuration loaded.`);
    }

    parseCommandline() {
        const args = getRuntimeArguments();
        const argCount = args.length;

        this.appEntryScript = (argCount > 2) ? args[2] : null;

        this.appArguments = (argCount > 3) ? args.slice(3) : [];
    }

    resolveEntryScript() {
        if (!this.appEntryScript) {
            const currentPackagePath = combinePathSegments(getCurrentWorkingDir(), 'package.json');
            const packageInfo = parseJsonContent(retrieveFileContent(currentPackagePath));
            this.appEntryScript = packageInfo.main || DEFAULT_MAIN_SCRIPT_NAME;
            outputMessage(`${LOG_PREFIX} No entry script specified, using "${this.appEntryScript}" from package.json.`);
        }
        this.appEntryScript = resolveAbsolutePath(getCurrentWorkingDir(), this.appEntryScript);
        outputMessage(`${LOG_PREFIX} Resolved entry script: ${this.appEntryScript}`);
    }

    setupFileMonitor() {
        this.fileMonitor = MonitoringService.makeInstance();

        const settingsMap = {
            loggingEnabled: (val) => this.fileMonitor.enableLogging(val),
            watch: (paths) => paths.forEach(p => this.fileMonitor.addWatchPath(resolveAbsolutePath(getCurrentWorkingDir(), p))),
            watchExclude: (paths) => paths.forEach(p => this.fileMonitor.addExcludePath(p))
        };

        Object.entries(this.currentSettings).forEach(([key, value]) => {
            if (settingsMap[key]) {
                settingsMap[key](value);
            }
        });

        outputMessage(`${LOG_PREFIX} File monitoring service initialized.`);
    }

    commenceProcess() {
        outputMessage(`${LOG_PREFIX} Application starting...`);
        this.activeProcess = ProcessHandler.fork(this.appEntryScript, this.appArguments, {
            cwd: getCurrentWorkingDir(),
            env: process.env
        });
    }

    initiateRelaunch() {
        this.relaunchTimeoutId = null;

        if (this.activeProcess) {
            outputMessage(`${LOG_PREFIX} Restarting application...`);
            if (this.activeProcess.connected) {
                this.activeProcess.once('exit', () => {
                    this.commenceProcess();
                });
                this.activeProcess.kill();
            } else {
                this.commenceProcess();
            }
        } else {
            this.commenceProcess();
        }
    }

    queueRelaunch() {
        if (!this.relaunchTimeoutId) {
            this.relaunchTimeoutId = scheduleAction(() => this.initiateRelaunch(), DEBOUNCE_INTERVAL_MS);
        }
    }

    async run() {
        await this.loadConfiguration();
        this.parseCommandline();
        this.resolveEntryScript();
        this.setupFileMonitor();

        this.fileMonitor.start();

        this.initiateRelaunch();

        this.fileMonitor.on('change', (changedPath) => {
            outputMessage(`${LOG_PREFIX} Change detected to ${changedPath}. Application will be relaunched in ${DEBOUNCE_INTERVAL_MS} ms.`);
            this.queueRelaunch();
        });
    }
}

const appReloader = new ApplicationReloader();
appReloader.run();