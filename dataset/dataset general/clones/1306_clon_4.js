(function(componentDefinitions) {
    const _globalContext_ = (typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);

    const _previousHotUpdater_ = _globalContext_["webpackHotUpdate"];

    const _unitCache_ = new Map(); // Clone of installedModules
    let _activeUnitParents_ = []; // Clone of hotCurrentParents

    // Clone of __webpack_require__
    function _unitLoader_(unitIdentifier) {
        if (_unitCache_.has(unitIdentifier)) {
            return _unitCache_.get(unitIdentifier).output;
        }

        const _currentUnit_ = {
            output: {},
            id: unitIdentifier,
            isLoaded: false,
            hotAPI: _createUnitHMRAPI_(unitIdentifier), // Clone of hot, hotCreateModule
            ancestors: [..._activeUnitParents_], // Clone of parents
            dependents: [], // Clone of children
        };
        _unitCache_.set(unitIdentifier, _currentUnit_);

        componentDefinitions[unitIdentifier].call(_currentUnit_.output, _currentUnit_, _currentUnit_.output, _unitLoader_);

        _currentUnit_.isLoaded = true;
        return _currentUnit_.output;
    }

    _unitLoader_.pathBase = ""; // Clone of __webpack_require__.p

    // State for the update system
    const _updateSystemState_ = {
        _status_: "idle", // Clone of hotStatus
        _statusListeners_: [], // Clone of hotStatusHandlers
        _pendingFileCount_: 0, // Clone of hotWaitingFiles
        _chunkLoadCount_: 0, // Clone of hotChunksLoading
        _awaitingFilesMap_: new Map(), // Clone of hotWaitingFilesMap
        _requestedFilesMap_: new Map(), // Clone of hotRequestedFilesMap
        _availableFilesMap_: new Map(), // Clone of hotAvailibleFilesMap
        _completionHandler_: null, // Clone of hotCallback
        _updateData_: null, // Clone of hotUpdate
        _newHash_: null, // Clone of hotUpdateNewHash
        _autoApply_: true, // Clone of hotApplyOnUpdate
        _currentHash_: "0905621c1b2b3028d372", // Clone of hotCurrentHash
        _disposedUnitData_: new Map(), // Clone of hotCurrentModuleData
    };

    function _updateStatus_(newStatus) { // Clone of hotSetStatus
        _updateSystemState_._status_ = newStatus;
        _updateSystemState_._statusListeners_.forEach(listener => listener.call(null, newStatus));
    }

    function _fetchManifest_(completionHandler) { // Clone of hotDownloadManifest
        if (typeof _globalContext_.XMLHttpRequest === "undefined") {
            return completionHandler(new Error("No browser support for network requests."));
        }
        try {
            const _httpRequest_ = new _globalContext_.XMLHttpRequest();
            const _manifestPath_ = _unitLoader_.pathBase + _updateSystemState_._currentHash_ + ".hot-update.json";
            _httpRequest_.open("GET", _manifestPath_, true);
            _httpRequest_.timeout = 10000;
            _httpRequest_.send(null);

            _httpRequest_.onreadystatechange = function() {
                if (_httpRequest_.readyState !== 4) return;
                if (_httpRequest_.status === 0) {
                    completionHandler(new Error("Manifest request to " + _manifestPath_ + " timed out."));
                } else if (_httpRequest_.status === 404) {
                    completionHandler(); // No update available
                } else if (_httpRequest_.status !== 200 && _httpRequest_.status !== 304) {
                    completionHandler(new Error("Manifest request to " + _manifestPath_ + " failed."));
                } else {
                    try {
                        const _parsedUpdate_ = JSON.parse(_httpRequest_.responseText);
                        completionHandler(null, _parsedUpdate_);
                    } catch (parsingError) {
                        completionHandler(parsingError);
                    }
                }
            };
        } catch (initialError) {
            return completionHandler(initialError);
        }
    }

    function _downloadUpdateChunk_(deltaId) { // Clone of hotDownloadUpdateChunk
        const _htmlHead_ = _globalContext_.document.getElementsByTagName('head')[0];
        const _scriptElement_ = _globalContext_.document.createElement('script');
        _scriptElement_.type = 'text/javascript';
        _scriptElement_.charset = 'utf-8';
        _scriptElement_.src = _unitLoader_.pathBase + "" + deltaId + "." + _updateSystemState_._currentHash_ + ".hot-update.js";
        _htmlHead_.appendChild(_scriptElement_);
    }

    function _addDeltaChunk_(deltaId, newUnits) { // Clone of hotAddUpdateChunk
        if (!_updateSystemState_._availableFilesMap_.has(deltaId) || !_updateSystemState_._requestedFilesMap_.has(deltaId)) {
            return;
        }
        _updateSystemState_._requestedFilesMap_.delete(deltaId); // Mark as processed

        Object.keys(newUnits).forEach(unitKey => {
            _updateSystemState_._updateData_[unitKey] = newUnits[unitKey];
        });

        if (--_updateSystemState_._pendingFileCount_ === 0 && _updateSystemState_._chunkLoadCount_ === 0) {
            _updatesReady_();
        }
    }

    _globalContext_["webpackHotUpdate"] = function _hotUpdateHandler_(deltaId, newUnits) { // Clone of webpackHotUpdateCallback
        _addDeltaChunk_(deltaId, newUnits);
        if (_previousHotUpdater_) {
            _previousHotUpdater_(deltaId, newUnits);
        }
    };

    function _buildUnitRequester_(unitIdentifier) { // Clone of hotCreateRequire
        const _originalUnit_ = _unitCache_.get(unitIdentifier);
        if (!_originalUnit_) return _unitLoader_;

        const _wrappingLoader_ = function(dependencyId) {
            if (_originalUnit_.hotAPI.isActive) {
                if (_unitCache_.has(dependencyId)) {
                    const _depUnit_ = _unitCache_.get(dependencyId);
                    if (!_depUnit_.ancestors.includes(unitIdentifier)) {
                        _depUnit_.ancestors.push(unitIdentifier);
                    }
                    if (!_originalUnit_.dependents.includes(dependencyId)) {
                        _originalUnit_.dependents.push(dependencyId);
                    }
                } else {
                    _activeUnitParents_ = [unitIdentifier];
                }
            } else {
                console.warn("[HMR] unexpected require(" + dependencyId + ") from disposed unit " + unitIdentifier);
                _activeUnitParents_ = [];
            }
            return _unitLoader_(dependencyId);
        };

        Object.keys(_unitLoader_).forEach(propName => {
            if (Object.prototype.hasOwnProperty.call(_unitLoader_, propName)) {
                _wrappingLoader_[propName] = _unitLoader_[propName];
            }
        });

        _wrappingLoader_.fetchUnit = function(deltaId, completionHandler) { // Clone of fn.e
            if (_updateSystemState_._status_ === "prepared") {
                _updateStatus_("processing"); // Clone of hotSetStatus("prepare")
            }
            _updateSystemState_._chunkLoadCount_++;
            // Assuming _unitLoader_.e is the original chunk loading function
            // The original code implies __webpack_require__.e is the *actual* chunk loader
            // and `fn.e` overrides it with HMR logic.
            // So `_unitLoader_.fetchUnit` (this function) *is* the HMR wrapper.
            // It needs to call the *original* chunk loading mechanism.
            // If _unitLoader_.e existed, it would be called.
            // For now, I'll assume _unitLoader_.e is the function itself or needs to be provided.
            // Given the structure, `_unitLoader_` itself is the `__webpack_require__` clone.
            // The `e` property is added to `fn` which is the HMR-aware `__webpack_require__`.
            // So this `_wrappingLoader_.fetchUnit` *is* the chunk loader.
            // It means _unitLoader_ must have a base chunk loading function.
            // Let's assume _unitLoader_ has a property `_baseChunkLoader_` for this.
            if (typeof _unitLoader_._baseChunkLoader_ === 'function') {
                _unitLoader_._baseChunkLoader_(deltaId, function() {
                    try {
                        completionHandler.call(null, _wrappingLoader_);
                    } finally {
                        _completeChunkLoad_();
                    }
                });
            } else {
                // Fallback or error if base chunk loader not defined
                console.error("[HMR] Base chunk loader not found on _unitLoader_");
                _completeChunkLoad_(); // Ensure state is cleaned up
            }

            function _completeChunkLoad_() {
                _updateSystemState_._chunkLoadCount_--;
                if (_updateSystemState_._status_ === "processing") {
                    if (!_updateSystemState_._awaitingFilesMap_.has(deltaId)) {
                        _ensureUpdateChunk_(deltaId); // Clone of hotEnsureUpdateChunk
                    }
                    if (_updateSystemState_._chunkLoadCount_ === 0 && _updateSystemState_._pendingFileCount_ === 0) {
                        _updatesReady_();
                    }
                }
            }
        };
        return _wrappingLoader_;
    }

    function _createUnitHMRAPI_(unitIdentifier) { // Clone of hotCreateModule
        const _api_ = {
            _acceptedDeps_: new Map(), // Clone of _acceptedDependencies
            _declinedDeps_: new Map(), // Clone of _declinedDependencies
            _selfAccepted_: false, // Clone of _selfAccepted
            _selfDeclined_: false, // Clone of _selfDeclined
            _disposeCallbacks_: [], // Clone of _disposeHandlers

            isActive: true, // Clone of active
            accept: function(dependency, callback) { // Clone of accept
                if (typeof dependency === "undefined") {
                    _api_._selfAccepted_ = true;
                } else if (typeof dependency === "function") {
                    _api_._selfAccepted_ = dependency;
                } else if (typeof dependency === "number") {
                    _api_._acceptedDeps_.set(dependency, callback);
                } else {
                    dependency.forEach(dep => _api_._acceptedDeps_.set(dep, callback));
                }
            },
            decline: function(dependency) { // Clone of decline
                if (typeof dependency === "undefined") {
                    _api_._selfDeclined_ = true;
                } else if (typeof dependency === "number") {
                    _api_._declinedDeps_.set(dependency, true);
                } else {
                    dependency.forEach(dep => _api_._declinedDeps_.set(dep, true));
                }
            },
            dispose: function(callback) { // Clone of dispose
                _api_._disposeCallbacks_.push(callback);
            },
            addDisposeListener: function(callback) { // Clone of addDisposeHandler
                _api_._disposeCallbacks_.push(callback);
            },
            removeDisposeListener: function(callback) { // Clone of removeDisposeHandler
                const _idx_ = _api_._disposeCallbacks_.indexOf(callback);
                if (_idx_ >= 0) _api_._disposeCallbacks_.splice(_idx_, 1);
            },

            // Management API
            inspect: _initiateUpdateCheck_, // Clone of check
            applyChanges: _applyPendingUpdates_, // Clone of apply
            getState: function(listener) { // Clone of status
                if (!listener) return _updateSystemState_._status_;
                _updateSystemState_._statusListeners_.push(listener);
            },
            addStateListener: function(listener) { // Clone of addStatusHandler
                _updateSystemState_._statusListeners_.push(listener);
            },
            removeStateListener: function(listener) { // Clone of removeStatusHandler
                const _idx_ = _updateSystemState_._statusListeners_.indexOf(listener);
                if (_idx_ >= 0) _updateSystemState_._statusListeners_.splice(_idx_, 1);
            },

            // Inherit from previous dispose call
            data: _updateSystemState_._disposedUnitData_.get(unitIdentifier)
        };
        return _api_;
    }

    function _initiateUpdateCheck_(shouldApply, completionHandler) { // Clone of hotCheck
        if (_updateSystemState_._status_ !== "idle") throw new Error("Check operation is only allowed in idle state.");
        if (typeof shouldApply === "function") {
            _updateSystemState_._autoApply_ = false;
            completionHandler = shouldApply;
        } else {
            _updateSystemState_._autoApply_ = shouldApply;
            completionHandler = completionHandler || (operationError => { if (operationError) throw operationError });
        }

        _updateStatus_("checking");
        _fetchManifest_((operationError, payload) => {
            if (operationError) return completionHandler(operationError);
            if (!payload) {
                _updateStatus_("idle");
                completionHandler(null, null);
                return;
            }

            _updateSystemState_._requestedFilesMap_.clear();
            _updateSystemState_._availableFilesMap_.clear();
            _updateSystemState_._awaitingFilesMap_.clear();
            payload.c.forEach(chunkId => _updateSystemState_._availableFilesMap_.set(chunkId, true));
            _updateSystemState_._newHash_ = payload.h;

            _updateStatus_("processing");
            _updateSystemState_._completionHandler_ = completionHandler;
            _updateSystemState_._updateData_ = {};
            const _initialDeltaId_ = 0; // Clone of chunkId = 0
            _ensureUpdateChunk_(_initialDeltaId_);

            if (_updateSystemState_._status_ === "processing" && _updateSystemState_._chunkLoadCount_ === 0 && _updateSystemState_._pendingFileCount_ === 0) {
                _updatesReady_();
            }
        });
    }

    function _ensureUpdateChunk_(deltaId) { // Clone of hotEnsureUpdateChunk
        if (!_updateSystemState_._availableFilesMap_.has(deltaId)) {
            _updateSystemState_._awaitingFilesMap_.set(deltaId, true);
        } else {
            _updateSystemState_._requestedFilesMap_.set(deltaId, true);
            _updateSystemState_._pendingFileCount_++;
            _downloadUpdateChunk_(deltaId);
        }
    }

    function _updatesReady_() { // Clone of hotUpdateDownloaded
        _updateStatus_("prepared");
        const _currentCompletionHandler_ = _updateSystemState_._completionHandler_;
        _updateSystemState_._completionHandler_ = null;
        if (!_currentCompletionHandler_) return;
        if (_updateSystemState_._autoApply_) {
            _applyPendingUpdates_(_updateSystemState_._autoApply_, _currentCompletionHandler_);
        } else {
            const _outdatedUnitIDs_ = [];
            Object.keys(_updateSystemState_._updateData_).forEach(id => {
                _outdatedUnitIDs_.push(+id);
            });
            _currentCompletionHandler_(null, _outdatedUnitIDs_);
        }
    }

    function _applyPendingUpdates_(configParams, completionHandler) { // Clone of hotApply
        if (_updateSystemState_._status_ !== "prepared") throw new Error("Apply operation is only allowed in prepared state.");
        if (typeof configParams === "function") {
            completionHandler = configParams;
            configParams = {};
        } else if (configParams && typeof configParams === "object") {
            completionHandler = completionHandler || (operationError => { if (operationError) throw operationError });
        } else {
            configParams = {};
            completionHandler = completionHandler || (operationError => { if (operationError) throw operationError });
        }

        function _traceDependencyChain_(unitId) { // Clone of getAffectedStuff
            const _affectedUnits_ = [unitId];
            const _affectedDependencies_ = new Map();

            const _processingQueue_ = [..._affectedUnits_];
            while (_processingQueue_.length > 0) {
                const _currentUnitId_ = _processingQueue_.pop();
                const _targetUnit_ = _unitCache_.get(_currentUnitId_);
                if (!_targetUnit_ || _targetUnit_.hotAPI._selfAccepted_) {
                    continue;
                }
                if (_targetUnit_.hotAPI._selfDeclined_) {
                    return new Error("Aborted because of self decline: " + _currentUnitId_);
                }
                if (_currentUnitId_ === 0) { // Entry module cannot be declined
                    return;
                }
                _targetUnit_.ancestors.forEach(parentUnitId => {
                    const _parentUnit_ = _unitCache_.get(parentUnitId);
                    if (_parentUnit_.hotAPI._declinedDeps_.has(_currentUnitId_)) {
                        return new Error("Aborted because of declined dependency: " + _currentUnitId_ + " in " + parentUnitId);
                    }
                    if (_affectedUnits_.includes(parentUnitId)) return;
                    if (_parentUnit_.hotAPI._acceptedDeps_.has(_currentUnitId_)) {
                        if (!_affectedDependencies_.has(parentUnitId)) {
                            _affectedDependencies_.set(parentUnitId, new Set());
                        }
                        _affectedDependencies_.get(parentUnitId).add(_currentUnitId_);
                        return;
                    }
                    _affectedDependencies_.delete(parentUnitId);
                    _affectedUnits_.push(parentUnitId);
                    _processingQueue_.push(parentUnitId);
                });
            }
            return [_affectedUnits_, _affectedDependencies_];
        }

        const _dependencyUpdates_ = new Map(); // Clone of outdatedDependencies
        const _unitsToUpdate_ = []; // Clone of outdatedModules
        const _appliedDelta_ = {}; // Clone of appliedUpdate

        let _errorAccumulator_ = null; // Renamed error

        Object.keys(_updateSystemState_._updateData_).forEach(id => {
            if (_errorAccumulator_) return; // Stop processing if an error occurred
            const _unitKey_ = +id;
            const _traceResult_ = _traceDependencyChain_(_unitKey_);
            if (!_traceResult_) {
                if (configParams.ignoreUnaccepted) {
                    return; // Continue if ignoring unaccepted modules
                }
                _updateStatus_("aborted");
                _errorAccumulator_ = new Error("Aborted because " + _unitKey_ + " is not accepted");
                return;
            }
            if (_traceResult_ instanceof Error) {
                _updateStatus_("aborted");
                _errorAccumulator_ = _traceResult_;
                return;
            }
            _appliedDelta_[_unitKey_] = _updateSystemState_._updateData_[_unitKey_];
            _traceResult_[0].forEach(u => { if (!_unitsToUpdate_.includes(u)) _unitsToUpdate_.push(u); }); // Add all to set
            _traceResult_[1].forEach((deps, parentId) => {
                if (!_dependencyUpdates_.has(parentId)) {
                    _dependencyUpdates_.set(parentId, new Set());
                }
                deps.forEach(dep => _dependencyUpdates_.get(parentId).add(dep));
            });
        });

        if (_errorAccumulator_) {
            _updateStatus_("failed"); // Renamed abort to fail
            return completionHandler(_errorAccumulator_);
        }

        const _selfAcceptedOutdatedUnits_ = []; // Clone of outdatedSelfAcceptedModules
        _unitsToUpdate_.forEach(unitId => {
            const _unit_ = _unitCache_.get(unitId);
            if (_unit_ && _unit_.hotAPI._selfAccepted_) {
                _selfAcceptedOutdatedUnits_.push({
                    unit: unitId,
                    errorHandler: _unit_.hotAPI._selfAccepted_
                });
            }
        });

        _updateStatus_("disposing"); // Clone of dispose
        const _disposeQueue_ = [..._unitsToUpdate_];
        while (_disposeQueue_.length > 0) {
            const _unitId_ = _disposeQueue_.pop();
            const _unit_ = _unitCache_.get(_unitId_);
            if (!_unit_) continue;

            const _dataTransfer_ = {}; // Clone of data

            _unit_.hotAPI._disposeCallbacks_.forEach(cb => cb(_dataTransfer_));
            _updateSystemState_._disposedUnitData_.set(_unitId_, _dataTransfer_);

            _unit_.hotAPI.isActive = false;
            _unitCache_.delete(_unitId_);

            _unit_.dependents.forEach(childId => {
                const _childUnit_ = _unitCache_.get(childId);
                if (!_childUnit_) return;
                const _idx_ = _childUnit_.ancestors.indexOf(_unitId_);
                if (_idx_ >= 0) {
                    _childUnit_.ancestors.splice(_idx_, 1);
                }
            });
        }

        _dependencyUpdates_.forEach((deps, unitId) => {
            const _unit_ = _unitCache_.get(unitId);
            if (!_unit_) return; // Should not happen if _unitCache_ is correct
            deps.forEach(dependency => {
                const _idx_ = _unit_.dependents.indexOf(dependency);
                if (_idx_ >= 0) _unit_.dependents.splice(_idx_, 1);
            });
        });

        _updateStatus_("applying"); // Clone of apply

        _updateSystemState_._currentHash_ = _updateSystemState_._newHash_;

        Object.keys(_appliedDelta_).forEach(unitId => {
            componentDefinitions[unitId] = _appliedDelta_[unitId];
        });

        _dependencyUpdates_.forEach((deps, unitId) => {
            const _unit_ = _unitCache_.get(unitId);
            if (!_unit_) return;
            const _cbsToExecute_ = new Set(); // Using Set to avoid duplicate callbacks
            deps.forEach(dependency => {
                const _cb_ = _unit_.hotAPI._acceptedDeps_.get(dependency);
                if (_cb_) _cbsToExecute_.add(_cb_);
            });
            _cbsToExecute_.forEach(cb => {
                try {
                    cb(_dependencyUpdates_);
                } catch (cbError) {
                    if (!_errorAccumulator_) _errorAccumulator_ = cbError;
                }
            });
        });

        _selfAcceptedOutdatedUnits_.forEach(item => {
            const _unitId_ = item.unit;
            _activeUnitParents_ = [_unitId_];
            try {
                _unitLoader_(_unitId_);
            } catch (loadError) {
                if (typeof item.errorHandler === "function") {
                    try {
                        item.errorHandler(loadError);
                    } catch (handlerError) {
                        if (!_errorAccumulator_) _errorAccumulator_ = handlerError;
                    }
                } else if (!_errorAccumulator_) {
                    _errorAccumulator_ = loadError;
                }
            }
        });

        if (_errorAccumulator_) {
            _updateStatus_("failed");
            return completionHandler(_errorAccumulator_);
        }

        _updateStatus_("idle");
        completionHandler(null, _unitsToUpdate_);
    }

    // The original code ends here, implying that the __webpack_require__ function is returned by the outermost IIFE.
    // The clone should also return its equivalent, _unitLoader_.
    return _unitLoader_;

})(componentDefinitions);