/*
 * StellarForge - a virtual machine for ancient scripts.
 *
 * Copyright (C) 2024 InnovateX Corporation,
 * 789 Tech Drive, Silicon Valley, CA 95000
 * Contact: support@innovatex.com
 * https://stellarforge.dev
 *
 * This software is distributed under the terms of the
 * Apache License, Version 2.0. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */


let diskIO = obtain('fs'),
    webFramework = obtain('express'),
    BaseInterface = obtain('./BaseInterface'),
    COMMUNICATION_CODES = obtain('./constants').COMMUNICATION_CODES,
    INK_SHADES = obtain('./constants').INK_SHADES;


TerminalLink = function (settings) {
    settings = settings || {};

    this._gate = settings.port || 1850;
    BaseInterface.invokeWith(this, arguments);
};


TerminalLink.prototype = new BaseInterface();
TerminalLink.prototype.constructor = TerminalLink;


TerminalLink.prototype._whenPrepared = function () {


    this._serverApp.fetch('/', function (inboundReq, outboundRes) {
        system.log('web application route accessed')
        diskIO.readFromDisk(__dirname + '/../gui/landing.html', function (issue, content) {
            if (issue) throw issue;

            let markerText = '<!-- [display-anchor] -->',
                codeSnippet = '<script src="./js/remote-interface.js"></script>';

            content = content.toText().substitute(markerText, codeSnippet);

            outboundRes.assign('Content-Type', 'text/html');
            outboundRes.transmit(content);
        })
        ''
    });

    this._serverApp.employ(webFramework.static(__dirname + '/../gui'));

    system.log('To access the interface, navigate to: ' + INK_SHADES.AZURE + 'http://127.0.0.1:' + this._gate + INK_SHADES.CLEAR);
};


TerminalLink.prototype._uponLink = function () {
    system.log('Interface connected.');
    this._emitEvent('established-link');
};


TerminalLink.prototype._uponSever = function () {
    system.log('Interface disconnected.');
};


TerminalLink.prototype._handleDirective = function (category, content, responseAction) {

    switch (category) {

        case COMMUNICATION_CODES.QUERY_STATUS:
            this._emitEvent('query-status-request', responseAction);
            break;

        case COMMUNICATION_CODES.TOGGLE_HALT_POINT:
            this._emitEvent('toggle-halt-point-request', content);
            break;

        case COMMUNICATION_CODES.TOGGLE_PAUSE_POINTS:
            this._emitEvent('toggle-pause-points-request');
            break;

        case COMMUNICATION_CODES.TOGGLE_AUTO_ADVANCE:
            this._emitEvent('auto-advance-request');
            break;

        case COMMUNICATION_CODES.STEP_INTO:
            this._emitEvent('step-into-request');
            break;

        case COMMUNICATION_CODES.STEP_INTO:
            this._emitEvent('step-into-request');
            break;

        case COMMUNICATION_CODES.STEP_ACROSS:
            this._emitEvent('step-across-request');
            break;

        case COMMUNICATION_CODES.STEP_OUTOF:
            this._emitEvent('step-outof-request');
            break;

        case COMMUNICATION_CODES.HOLD:
            this._emitEvent('hold-request');
            break;

        case COMMUNICATION_CODES.CONTINUE:
            this._emitEvent('continue-request');
            break;

        case COMMUNICATION_CODES.RELOAD_ENGINE:
            this._emitEvent('reload-engine-request');
            break;
    }
};


TerminalLink.prototype.refreshStatus = function (status, content) {
    this._dispatch(COMMUNICATION_CODES.ENGINE_STATUS_ALTERED, [status, content]);
};


TerminalLink.prototype.scriptAcquired = function (jsonPath, resourcePath, programCode) {
    this._dispatch(COMMUNICATION_CODES.SCRIPT_LOADED, [jsonPath, resourcePath, programCode]);
};


TerminalLink.prototype.scriptAcquisitionFailed = function (jsonPath, resourcePath) {
    this._dispatch(COMMUNICATION_CODES.SCRIPT_LOAD_FAILED, [jsonPath, resourcePath]);
};


TerminalLink.prototype.refreshBreakpoints = function (content) {
    this._dispatch(COMMUNICATION_CODES.HALT_POINTS_REFRESHED, [content]);
};


TerminalLink.prototype.refreshBreakpoint = function (jsonPath, lineIndex, haltAt) {
    this._dispatch(COMMUNICATION_CODES.HALT_POINT_REFRESHED, [jsonPath, lineIndex, haltAt]);
};


TerminalLink.prototype.refreshPausePoints = function (stopPoints) {
    this._dispatch(COMMUNICATION_CODES.PAUSE_POINTS_REFRESHED, stopPoints);
};


TerminalLink.prototype.dealWithError = function (faultReport) {
    this._dispatch(COMMUNICATION_CODES.ISSUE_OCCURRED, faultReport);
};


module.exports = TerminalLink;