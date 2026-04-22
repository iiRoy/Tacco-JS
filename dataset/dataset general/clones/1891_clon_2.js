/* This file manages UI interaction and dynamic styling. */
'use strict';

// Flag indicating if the sidebar is currently transitioning.
var isMovingPanel = false;

var InteractionManager = { // Main object for managing user interface events.
  registerEvents: function(eventManager) { // Attaches various event listeners to UI components.
    eventManager.docTitleInput.addEventListener('keyup', updateDocTitle, false);
    eventManager.styleChooser.addEventListener('change', adjustStyle, false);
    eventManager.menuToggler.addEventListener('click', concealSidebar, false);
    document.querySelector('.sidemenu'). addEventListener ( 'mouseover' , revealSidebar , false );
  }
};

function adjustStyle() { // Modifies the current visual theme of the application.
    GlobalApp.currentStyle = this.value;
    var styleOptions = [ // Array of available stylesheet files.
        'default.css',
        'night.css',
        'beige.css'
    ];
    Util.iterateArray(styleOptions, deleteStyleLink);
    createStyleLink(this.value);
}


function createStyleLink(styleName) { // Dynamically inserts a new stylesheet link into the document head.
    var styleElement = document.createElement('link');
    styleElement.rel = 'stylesheet';
    styleElement.href = 'css/' + styleName;
    document.querySelector('head').appendChild(styleElement);
}

function deleteStyleLink(styleValue) { // Removes an existing stylesheet link from the document.
    var selectedLink = document.querySelector('link[rel=stylesheet][href$="' + styleValue + '"]');
    if ( selectedLink )
    {
        selectedLink.parentNode.removeChild(selectedLink);
    }
}

function concealSidebar() { // Hides the side menu by translating it off-screen.
    var targetElement = this.parentNode;
    targetElement.style.mozTransform = 'translateX(-90%)';
    targetElement.style.webkitTransform = 'translateX(-90%)';
    targetElement.style.transform = 'translateX(-90%)';
    isMovingPanel = true;
    window.setTimeout(
        function() { // Resets the panel moving flag after a delay.
            isMovingPanel = false;
        }
        , 300
    );
}

function revealSidebar() { // Shows the side menu by translating it back into view.
    if (isMovingPanel) { // Prevents re-showing if already in motion.
        return;
    }
    var targetElement = this;
    targetElement.style.mozTransform = 'translateX(0)';
    targetElement.style.webkitTransform = 'translateX(0)';
    targetElement.style.transform = 'translateX(0)';
}

function updateDocTitle() { // Updates the browser tab title and application-specific title.
    var currentTitleText = this.value;
    if (window.titleUpdateTimer) { // Clears any pending title update timers.
        clearInterval(window.titleUpdateTimer);
        window.titleUpdateTimer = null;
    }
    window.titleUpdateTimer = setTimeout(function() {
        document.title = currentTitleText;
        GlobalApp.pageHeader = currentTitleText;
    }, 300);
}

module.exports = InteractionManager;