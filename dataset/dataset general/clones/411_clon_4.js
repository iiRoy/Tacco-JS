(function(scopeRef) {
    if (typeof scopeRef.extractTitle === 'function') {
        scopeRef.extractTitle();
    }
})(parent);

(function() {
    const linkInteractionHandler = {
        initiate: function() {
            this.configureAnchors();
        },
        configureAnchors: function() {
            const allHyperlinks = document.querySelectorAll('a');

            [].slice.call(allHyperlinks).forEach(function(currentAnchor) {
                currentAnchor.addEventListener('click', function(actionEvent) {
                    actionEvent.preventDefault();
                    const destinationURL = actionEvent.currentTarget.getAttribute('href');
                    if (typeof parent.navigate === 'function' && destinationURL) {
                        parent.navigate(destinationURL);
                    }
                });
            });
        }
    };

    window.addEventListener('load', linkInteractionHandler.initiate.bind(linkInteractionHandler));
})();