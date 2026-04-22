(function() {
    let activeBackdropReference = null;
    let activeModalReference = null;
    let currentConfigurationState = {};

    const createUniqueId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 11)}`;

    const modalManagementSystem = {
        // Function to present an overlay
        present: function(userOptions) {
            const baseConfiguration = {
                contentSourceURL: '',
                visualWidth: 600,
                visualHeight: 400,
                backgroundTransparency: 70, // Percentage 0-100
                modalElementId: createUniqueId('modal_instance'),
                onCloseCallback: function() {}
            };

            currentConfigurationState = Object.assign({}, baseConfiguration, userOptions);

            // Construct and style the overlay's backdrop
            const overlayBackdrop = document.createElement('div');
            overlayBackdrop.id = createUniqueId('overlay_backdrop');
            overlayBackdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgb(0, 0, 0);
                opacity: 0;
                z-index: 999;
                transition: opacity 0.3s ease-in-out;
            `;
            document.body.appendChild(overlayBackdrop);
            activeBackdropReference = overlayBackdrop;

            // Initiate backdrop fade-in
            setTimeout(() => {
                overlayBackdrop.style.opacity = (currentConfigurationState.backgroundTransparency / 100).toString();
            }, 10); // Short delay to allow CSS transition to engage

            // Construct and style the main modal container
            const mainModalContainer = document.createElement('div');
            mainModalContainer.id = currentConfigurationState.modalElementId;
            mainModalContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgb(255, 255, 255);
                z-index: 1000;
                opacity: 0;
                display: none; /* Hidden until content is loaded */
                width: ${currentConfigurationState.visualWidth}px;
                height: ${currentConfigurationState.visualHeight}px;
                transition: opacity 0.3s ease-in-out;
            `;
            document.body.appendChild(mainModalContainer);
            activeModalReference = mainModalContainer;

            // Load external content into the modal
            if (currentConfigurationState.contentSourceURL) {
                fetch(currentConfigurationState.contentSourceURL)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Network response was not ok: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(contentData => {
                        mainModalContainer.innerHTML = contentData;
                        // Display and fade-in modal after content is ready
                        mainModalContainer.style.display = 'block';
                        setTimeout(() => {
                            mainModalContainer.style.opacity = '1';
                        }, 10);
                    })
                    .catch(error => {
                        console.error('Error fetching modal content:', error);
                        mainModalContainer.innerHTML = `<p style="color: red; padding: 20px;">Failed to load content: ${error.message}</p>`;
                        mainModalContainer.style.display = 'block';
                        setTimeout(() => {
                            mainModalContainer.style.opacity = '1';
                        }, 10);
                    });
            } else {
                // If no URL, simply display the empty modal
                mainModalContainer.style.display = 'block';
                setTimeout(() => {
                    mainModalContainer.style.opacity = '1';
                }, 10);
            }

            // Bind click event to backdrop for dismissal
            overlayBackdrop.addEventListener('click', () => {
                modalManagementSystem.hide();
            });
        },

        // Function to hide the overlay
        hide: function() {
            if (!activeBackdropReference || !activeModalReference) {
                return; // No active modal to hide
            }

            // Trigger fade-out for both elements
            activeBackdropReference.style.opacity = '0';
            activeModalReference.style.opacity = '0';

            const animationDuration = 300; // Matches CSS transition time

            // Remove backdrop and hide modal after animation completes
            setTimeout(() => {
                if (activeBackdropReference && activeBackdropReference.parentNode) {
                    activeBackdropReference.parentNode.removeChild(activeBackdropReference);
                }
                if (activeModalReference) {
                    // jQuery's fadeOut eventually sets display: none.
                    // The original only removes the backdrop, leaving the modal element faded out and hidden.
                    activeModalReference.style.display = 'none';
                }

                // Clear references to allow garbage collection and new modals
                activeBackdropReference = null;
                activeModalReference = null;

                // Invoke the registered callback
                if (typeof currentConfigurationState.onCloseCallback === 'function') {
                    currentConfigurationState.onCloseCallback.call(null);
                }
            }, animationDuration);
        }
    };

    // Expose a global interface for controlling the modal system
    window.unifiedModalControl = (actionOrConfig, supplementaryOptions) => {
        if (typeof actionOrConfig === 'string') {
            if (actionOrConfig === 'present') {
                modalManagementSystem.present(supplementaryOptions);
            } else if (actionOrConfig === 'hide') {
                modalManagementSystem.hide();
            } else {
                console.error(`Invalid action '${actionOrConfig}' for unifiedModalControl`);
            }
        } else if (typeof actionOrConfig === 'object' || !actionOrConfig) {
            // If the first argument is an object (config) or undefined, treat as 'present'
            modalManagementSystem.present(actionOrConfig);
        } else {
            console.error('Incorrect usage of unifiedModalControl');
        }
    };
})();