import * as fileSystemOperations from 'fs/promises';
import httpServerFramework from 'express';
import BaseTransportInterface from './BaseTransportInterface.js';
import { PROTOCOL_COMMANDS } from './protocol-constants.js';
import { TERMINAL_STYLES } from './terminal-styles.js';

class DebuggerLink extends BaseTransportInterface {
    constructor(configurationSettings = {}) {
        super(...arguments); // Pass all arguments to the base constructor
        this._networkPort = configurationSettings.port || 1969;
    }

    async establishReadiness() {
        this._webApplication.get('/', async (requestObject, responseObject) => {
            console.log('Web interface route accessed');
            try {
                const uiFilePath = `${__dirname}/../ui/index.html`;
                let htmlDocumentContent = await fileSystemOperations.readFile(uiFilePath, { encoding: 'utf8' });

                const insertionPointMarker = '<!-- [remote-placeholder] -->';
                const dynamicScriptTag = '<script src="./js/remote-debugger.js"></script>';

                htmlDocumentContent = htmlDocumentContent.replace(insertionPointMarker, dynamicScriptTag);

                responseObject.setHeader('Content-Type', 'text/html');
                responseObject.send(htmlDocumentContent);
            } catch (exception) {
                console.error('Failure serving UI content:', exception);
                throw exception;
            }
        });

        this._webApplication.use(httpServerFramework.static(`${__dirname}/../ui`));

        console.log(`Access the debugging interface at: ${TERMINAL_STYLES.CYAN}http://127.0.0.1:${this._networkPort}${TERMINAL_STYLES.RESET}`);
    }

    onPeerConnect() {
        console.log('Client connection established.');
        this._trigger('client-connected-event');
    }

    onPeerDisconnect() {
        console.log('Client connection terminated.');
    }

    handleIncomingDirective(incomingType, ancillaryData, completionCallback) {
        const directiveActionMap = new Map();

        directiveActionMap.set(PROTOCOL_COMMANDS.GET_STATE, (payload, cb) => this._trigger('query-debugger-state', cb));
        directiveActionMap.set(PROTOCOL_COMMANDS.TOGGLE_BREAKPOINT, (payload, cb) => this._trigger('toggle-breakpoint-status', payload));
        directiveActionMap.set(PROTOCOL_COMMANDS.TOGGLE_STOP_AT_BREAKPOINTS, (payload, cb) => this._trigger('toggle-global-breakpoint-pause'));
        directiveActionMap.set(PROTOCOL_COMMANDS.TOGGLE_AUTO_STEP, (payload, cb) => this._trigger('activate-auto-step'));
        directiveActionMap.set(PROTOCOL_COMMANDS.STEP_IN, (payload, cb) => this._trigger('perform-step-into'));
        directiveActionMap.set(PROTOCOL_COMMANDS.STEP_OVER, (payload, cb) => this._trigger('perform-step-over'));
        directiveActionMap.set(PROTOCOL_COMMANDS.STEP_OUT, (payload, cb) => this._trigger('perform-step-out'));
        directiveActionMap.set(PROTOCOL_COMMANDS.PAUSE, (payload, cb) => this._trigger('request-debugger-pause'));
        directiveActionMap.set(PROTOCOL_COMMANDS.RESUME, (payload, cb) => this._trigger('request-debugger-resume'));
        directiveActionMap.set(PROTOCOL_COMMANDS.RELOAD, (payload, cb) => this._trigger('request-module-reload'));
        
        const handlerFunction = directiveActionMap.get(incomingType);
        if (handlerFunction) {
            handlerFunction(ancillaryData, completionCallback);
        } else {
            console.warn(`Unrecognized protocol command received: ${incomingType}`);
        }
    }

    broadcastEngineStatus(currentStatus, relatedData) {
        this._send(PROTOCOL_COMMANDS.ENGINE_STATE_CHANGED, [currentStatus, relatedData]);
    }

    notifyLuaModuleLoaded(jsonResourceUrl, sourceUrl, scriptCode) {
        this._send(PROTOCOL_COMMANDS.LUA_LOADED_NOTIFICATION, [jsonResourceUrl, sourceUrl, scriptCode]);
    }

    notifyLuaModuleLoadFailure(jsonResourceUrl, sourceUrl) {
        this._send(PROTOCOL_COMMANDS.LUA_LOAD_FAILED_NOTIFICATION, [jsonResourceUrl, sourceUrl]);
    }

    refreshBreakpointCollection(collectionData) {
        this._send(PROTOCOL_COMMANDS.BREAKPOINTS_UPDATED_NOTIFICATION, [collectionData]);
    }

    modifySingleBreakpoint(jsonResourceUrl, lineIdentifier, enabledState) {
        this._send(PROTOCOL_COMMANDS.BREAKPOINT_UPDATED_NOTIFICATION, [jsonResourceUrl, lineIdentifier, enabledState]);
    }

    adjustBreakpointStoppingBehavior(shouldStop) {
        this._send(PROTOCOL_COMMANDS.STOP_AT_BREAKPOINTS_UPDATED_NOTIFICATION, shouldStop);
    }

    reportSystemError(errorObject) {
        this._send(PROTOCOL_COMMANDS.ERROR_NOTIFICATION, errorObject);
    }
}

export default DebuggerLink;