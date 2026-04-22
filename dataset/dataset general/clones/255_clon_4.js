(function() {

    const standardPanelSettings = {
        panelWidth: 500,
        panelHeight: 400
    };

    function displayRemoteContent(selectorString, userOptions) {
        const mergedSettings = Object.assign({}, standardPanelSettings, userOptions);

        const targetElements = document.querySelectorAll(selectorString);

        targetElements.forEach(function(activationLink) {
            activationLink.addEventListener('click', function(interactionEvent) {
                interactionEvent.preventDefault();

                let modalTitleText = activationLink.title;
                if (!modalTitleText) {
                    modalTitleText = activationLink.textContent.trim();
                }

                const backdropElement = document.createElement('div');
                backdropElement.id = 'dynamic-modal-backdrop';
                backdropElement.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.75);
                    z-index: 10000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    transition: opacity 0.2s ease-in-out;
                `;

                const contentWrapper = document.createElement('div');
                contentWrapper.id = 'dynamic-modal-wrapper';
                contentWrapper.style.cssText = `
                    background: #fff;
                    border-radius: 6px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    max-width: 95%;
                    max-height: 95%;
                    transform: scale(0.9);
                    transition: transform 0.2s ease-in-out;
                `;
                contentWrapper.style.width = `${mergedSettings.panelWidth}px`;
                contentWrapper.style.height = `${mergedSettings.panelHeight}px`;

                const headerBarSection = document.createElement('div');
                headerBarSection.id = 'dynamic-modal-header';
                headerBarSection.style.cssText = `
                    padding: 12px 18px;
                    font-size: 1.15em;
                    font-weight: bold;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #333;
                `;
                headerBarSection.textContent = modalTitleText;

                const dismissButton = document.createElement('button');
                dismissButton.id = 'dynamic-modal-close-btn';
                dismissButton.style.cssText = `
                    background: none;
                    border: none;
                    font-size: 1.6em;
                    cursor: pointer;
                    color: #888;
                    line-height: 1;
                    padding: 0 8px;
                    margin-left: 15px;
                    outline: none;
                `;
                dismissButton.innerHTML = '&times;';
                dismissButton.addEventListener('click', function() {
                    closeModal();
                });
                headerBarSection.appendChild(dismissButton);

                const contentBodyArea = document.createElement('div');
                contentBodyArea.id = 'dynamic-modal-body';
                contentBodyArea.style.cssText = `
                    flex-grow: 1;
                    padding: 0;
                    overflow: hidden;
                `;

                const webContentFrame = document.createElement('iframe');
                webContentFrame.setAttribute('frameborder', '0');
                webContentFrame.style.width = '100%';
                webContentFrame.style.height = '100%';
                webContentFrame.setAttribute('scrolling', 'auto');
                webContentFrame.setAttribute('src', activationLink.href);
                webContentFrame.style.display = 'block';

                contentBodyArea.appendChild(webContentFrame);
                contentWrapper.appendChild(headerBarSection);
                contentWrapper.appendChild(contentBodyArea);
                backdropElement.appendChild(contentWrapper);
                document.body.appendChild(backdropElement);

                setTimeout(() => {
                    backdropElement.style.opacity = '1';
                    contentWrapper.style.transform = 'scale(1)';
                }, 10);

                const closeModal = () => {
                    backdropElement.style.opacity = '0';
                    contentWrapper.style.transform = 'scale(0.9)';
                    backdropElement.addEventListener('transitionend', () => {
                        if (backdropElement.parentNode) {
                            backdropElement.parentNode.removeChild(backdropElement);
                        }
                    }, { once: true });
                    document.removeEventListener('keydown', escapeKeyListener);
                };

                backdropElement.addEventListener('click', function(clickEvent) {
                    if (clickEvent.target === backdropElement) {
                        closeModal();
                    }
                });

                const escapeKeyListener = function(keyEvent) {
                    if (keyEvent.key === 'Escape') {
                        closeModal();
                    }
                };
                document.addEventListener('keydown', escapeKeyListener);

            });
        });
    }

    if (typeof window.WebPageModal === 'undefined') {
        window.WebPageModal = {};
    }
    window.WebPageModal.initializeLinks = displayRemoteContent;
    window.WebPageModal.defaultSettings = standardPanelSettings;

})();