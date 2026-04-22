'use strict';

const _char = (n) => String.fromCharCode(n);
const _glue = (arr) => arr.map(_char).join('');
const _bool = (n) => (n === 1); 

const _taskA = _glue([99, 111, 112, 121]); 
const _taskB = _glue([117, 103, 108, 105, 102, 121]); 
const _taskC = _glue([99, 111, 110, 99, 97, 116]); 
const _taskD = _glue([99, 115, 115, 109, 105, 110]); 
const _taskE = _glue([99, 108, 101, 97, 110]); 

const _propA = _glue([102, 105, 108, 101, 115]); 
const _propB = _glue([115, 114, 99]); 
const _propC = _glue([100, 101, 115, 116]); 
const _propD = _glue([111, 112, 116, 105, 111, 110, 115]); 
const _propE = _glue([101, 120, 112, 97, 110, 100]); 
const _propF = _glue([102, 108, 97, 116, 116, 101, 110]); 
const _propG = _glue([99, 119, 100]); 
const _propH = _glue([109, 97, 110, 103, 108, 101]); 
const _propI = _glue([101, 120, 99, 101, 112, 116]); 

const _targetX = _glue([100, 105, 115, 116]); 
const _empty = _glue([]); 

const _pathJqMin = _glue([98,111,119,101,114,95,99,111,109,112,111,110,101,110,116,115,47,106,113,117,101,114,121,47,106,113,117,101,114,121,46,109,105,110,46,106,115]);
const _pathJqUiMin = _glue([98,111,119,101,114,95,99,111,109,112,111,110,101,110,116,115,47,106,113,117,101,114,121,45,117,105,47,106,113,117,101,114,121,45,117,105,46,109,105,110,46,106,115]);
const _pathImgAccept = _glue([105,109,97,103,101,115,47,97,99,99,101,112,116,46,112,110,103]);
const _pathImgAsterisk = _glue([105,109,97,103,101,115,47,97,115,116,101,114,105,115,107,95,121,101,108,108,111,119,46,112,110,103]);
const _pathImgCross = _glue([105,109,97,103,101,115,47,99,114,111,115,115,46,112,110,103]);
const _pathImgDelete = _glue([105,109,97,103,101,115,47,100,101,108,101,116,101,46,112,110,103]);

const _destJs = _glue([100, 105, 115, 116, 47, 106, 115]);
const _destImgs = _glue([100, 105, 115, 116, 47, 105, 109, 97, 103, 101, 115]);
const _destCss = _glue([100, 105, 115, 116, 47, 99, 115, 115]);

const _fileJqAnnotateMin = _glue([100,105,115,116,47,106,115,47,106,113,117,101,114,121,46,97,110,110,111,116,97,116,101,46,109,105,110,46,106,115]);
const _fileSrcJqAnnotate = _glue([106,115,47,106,113,117,101,114,121,46,97,110,110,111,116,97,116,101,46,106,115]);
const _fileJqAnnotateConcatMin = _glue([100,105,115,116,47,106,115,47,106,113,117,101,114,121,46,97,110,110,111,116,97,116,101,46,99,111,110,99,97,116,46,109,105,110,46,106,115]);
const _fileAnnotateCssMin = _glue([100,105,115,116,47,99,115,115,47,97,110,110,111,116,97,116,101,46,109,105,110,46,99,115,115]);
const _fileSrcAnnotateCss = _glue([99,115,115,47,97,110,110,111,116,97,116,105,111,110,46,99,115,115]);

const _idJquery = _glue([74, 113, 117, 101, 114, 121]); 
const _idDollar = _glue([36]); 

const _createFileMap = (srcSet, destTarget) => ({
    [_propE]: _bool(1),
    [_propF]: _bool(1),
    [_propG]: _empty,
    [_propC]: destTarget,
    [_propB]: srcSet
});

const _buildConfiguration = () => {
    let _cfg = {};

    _cfg[_taskA] = {
        [_targetX]: {
            [_propA]: [
                _createFileMap([_pathJqMin, _pathJqUiMin], _destJs),
                _createFileMap([_pathImgAccept, _pathImgAsterisk, _pathImgCross, _pathImgDelete], _destImgs)
            ]
        }
    };

    _cfg[_taskB] = {
        [_propD]: {
            [_propH]: {
                [_propI]: [_idJquery, _idDollar]
            }
        },
        [_targetX]: {
            [_propA]: {
                [_fileJqAnnotateMin]: [_fileSrcJqAnnotate]
            }
        }
    };

    _cfg[_taskC] = {
        [_propD]: {},
        [_targetX]: {
            [_propB]: [
                _glue([..._destJs.split('').map(c => c.charCodeAt(0)), 47, ..._glue([106,113,117,101,114,121,46,109,105,110,46,106,115]).split('').map(c => c.charCodeAt(0))]), 
                _glue([..._destJs.split('').map(c => c.charCodeAt(0)), 47, ..._glue([106,113,117,101,114,121,45,117,105,46,109,105,110,46,106,115]).split('').map(c => c.charCodeAt(0))]), 
                _fileJqAnnotateMin
            ],
            [_propC]: _fileJqAnnotateConcatMin
        }
    };

    _cfg[_taskD] = {
        [_targetX]: {
            [_propA]: {
                [_fileAnnotateCssMin]: [_fileSrcAnnotateCss]
            }
        }
    };

    _cfg[_taskE] = [_targetX.slice(0, 4)]; 

    return _cfg;
};

module.exports = (_G) => {
    const _req = require;
    _req('load-grunt-tasks')(_G);

    const _confObj = _buildConfiguration();
    _G.initConfig(_confObj);

    const _defTaskName = _glue([100, 101, 102, 97, 117, 108, 116]); 
    const _tasksToRun = [_taskA, _taskB, _taskC, _taskD];

    _G.registerTask(_defTaskName, _tasksToRun);
};