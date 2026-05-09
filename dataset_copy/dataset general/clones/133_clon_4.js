(function () {
    let _currentClientActivity = true;
    const _baseClientTitle = "Mogo Chat";

    const _clientActivityMonitor = (function() {
        let _activePropertyIdentifier = null;
        let _activeEventSet = [];
        let _eventEmitterHost = null;
        let _isDirectAssignmentMode = false;
        let _activityStatusEvaluator = null; // Function to determine if page is inactive

        const _detectionMatrix = [
            { prop: 'hidden', events: ['visibilitychange'], target: document,
              evaluator: (host, prop) => host[prop] },
            { prop: 'mozHidden', events: ['mozvisibilitychange'], target: document,
              evaluator: (host, prop) => host[prop] },
            { prop: 'webkitHidden', events: ['webkitvisibilitychange'], target: document,
              evaluator: (host, prop) => host[prop] },
            { prop: 'msHidden', events: ['msvisibilitychange'], target: document,
              evaluator: (host, prop) => host[prop] },
            { prop: 'onfocusin', events: ['focusin', 'focusout'], target: document, isDirect: true,
              evaluator: (evt) => ['focusout'].includes(evt.type) },
            { prop: 'onpageshow', events: ['pageshow', 'pagehide', 'focus', 'blur'], target: window, isDirect: true,
              evaluator: (evt) => ['blur', 'pagehide'].includes(evt.type) }
        ];

        for (const entry of _detectionMatrix) {
            if (entry.prop in entry.target) {
                _activePropertyIdentifier = entry.prop;
                _activeEventSet = entry.events;
                _eventEmitterHost = entry.target;
                _isDirectAssignmentMode = entry.isDirect || false;
                _activityStatusEvaluator = entry.evaluator;
                break;
            }
        }

        // Fallback for extremely old browsers or unexpected scenarios
        if (!_activityStatusEvaluator) {
             _activePropertyIdentifier = 'onblur'; // Use a common property for identification
             _activeEventSet = ['focus', 'blur'];
             _eventEmitterHost = window;
             _isDirectAssignmentMode = true;
             _activityStatusEvaluator = (evt) => ['blur'].includes(evt.type);
        }

        function _universalEventHandler(eventData) {
            const currentEvent = eventData || window.event;
            let pageIsInactive = false;

            // Determine if the current state indicates inactivity
            if (_activityStatusEvaluator) {
                // If the evaluator expects two arguments (host, prop), it's a direct property check
                if (_activityStatusEvaluator.length === 2) {
                    pageIsInactive = _activityStatusEvaluator(_eventEmitterHost, _activePropertyIdentifier);
                } else { // Otherwise, it expects one argument (event)
                    pageIsInactive = _activityStatusEvaluator(currentEvent);
                }
            } else {
                // Default fallback if no evaluator was found (should be caught by the matrix)
                pageIsInactive = ['blur', 'pagehide'].includes(currentEvent.type);
            }

            if (pageIsInactive) {
                _currentClientActivity = false;
            } else {
                _currentClientActivity = true;
                document.title = _baseClientTitle; // Restore base title
            }
        }

        // Attach event listeners based on detected mode
        if (_eventEmitterHost && _activeEventSet.length > 0) {
            for (const evtName of _activeEventSet) {
                if (_isDirectAssignmentMode) {
                    _eventEmitterHost['on' + evtName] = _universalEventHandler;
                } else {
                    _eventEmitterHost.addEventListener(evtName, _universalEventHandler, false);
                }
            }
        }

        return {
            queryEngagementStatus: () => _currentClientActivity
        };
    })();

    // Expose the page activity status globally
    window.clientActivityStatus = {
        isCurrentlyEngaged: _clientActivityMonitor.queryEngagementStatus
    };
})();

window.triggerClientAlert = function() {
    if (window.clientActivityStatus.isCurrentlyEngaged()) {
        return; // No alert if the client is actively engaging with the page
    }

    const currentClientTitle = document.title;
    const notificationIndicator = "[#] ";
    if (!currentClientTitle.startsWith(notificationIndicator)) {
        document.title = notificationIndicator + currentClientTitle;
    }

    const soundSourceElement = document.getElementById('application-audio-source');
    if (soundSourceElement && typeof soundSourceElement.play === 'function') {
        try {
            soundSourceElement.load();
            soundSourceElement.play();
        } catch (playbackIssue) {
            // Log audio playback issues without stopping execution
            console.warn("Audio playback encountered an issue:", playbackIssue);
        }
    } else {
        console.warn("Audio element 'application-audio-source' missing or not playable.");
    }
};