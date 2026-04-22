const SystemOverseer = (function() {
    let _applicationSettings = {};

    function _setOperationalParameters(params) {
        _applicationSettings._designation = params._designation || 'GenericSystem';
        _applicationSettings._dependencies = params._essentials || [];
        _applicationSettings._visuals = params._visuals || [];
        _applicationSettings._coordinators = params._coordinators || [];
        _applicationSettings._visualCues = params._visualCues || {};
        _applicationSettings._preformatted = params._isPreformatted || false;
        _applicationSettings._startupImages = params._bootImages || {};
        _applicationSettings._onInitiate = params._onInitiate || (() => {});
        _applicationSettings._onRevision = params._onRevision || (() => {});
    }

    function _beginExecutionFlow() {
        _applicationSettings._onInitiate();
    }

    function _activateRevisionPrompt() {
        _applicationSettings._onRevision();
    }

    return {
        _configureAndLaunch: function(configurationObject) {
            _setOperationalParameters(configurationObject);
            document.addEventListener('DOMContentLoaded', _beginExecutionFlow);
            window._signalSystemRevision = _activateRevisionPrompt;
        }
    };
})();

SystemOverseer._configureAndLaunch({
    _designation: 'NavigationSystem',

    _essentials: [
        'UserMessageUtility'
    ],

    _visuals: [
        'MasterInterface'
    ],

    _coordinators: [
        'PrimaryControl'
    ],

    _visualCues: {
        'small_res': 'visuals/icons/Standard.png',
        'medium_res': 'visuals/icons/Standard_Tablet.png',
        'high_res': 'visuals/icons/Standard_Retina.png',
        'ultra_res': 'visuals/icons/Tablet_Retina.png'
    },

    _isPreformatted: true,

    _startupImages: {
        'mobile_p': 'visuals/splash/mobile_p.jpg',
        'mobile_l': 'visuals/splash/mobile_l.png',
        'tablet_p': 'visuals/splash/tablet_p.png',
        'tablet_l': 'visuals/splash/tablet_l.png',
        'tablet_p_retina': 'visuals/splash/tablet_p_retina.png',
        'tablet_l_retina': 'visuals/splash/tablet_l_retina.png'
    },

    _onInitiate: function() {
        const _loadingOverlay = document.getElementById('initialLoadBlock');
        if (_loadingOverlay) {
            _loadingOverlay.parentNode.removeChild(_loadingOverlay);
        }

        const _mainVisualComponent = document.createElement('div');
        _mainVisualComponent.id = 'mainApplicationDisplay';
        _mainVisualComponent.textContent = "Welcome to the Application Interface!";
        _mainVisualComponent.style.cssText = 'width:100%; height:100vh; background-color:#e0f0e0; display:flex; justify-content:center; align-items:center; font-family:arial; font-size:2.5em; color:#222;';
        document.body.appendChild(_mainVisualComponent);
    },

    _onRevision: function() {
        const _revisionMessage = "Application has been updated to its newest version. Would you like to restart now?";
        if (window.confirm(_revisionMessage)) {
            window.location.reload();
        }
    }
});