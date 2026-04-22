document.addEventListener('DOMContentLoaded', () => {
    window.messageCenter = (function () {

        const defaultNotificationSettings = {
            titleContent: '',
            fadeInDuration: 300,
            fadeOutDuration: 500,
            slideOutDistance: 20,
            displayLifetime: 5000,
            isDismissible: false,
            customClass: '',
            onShowCallback: null,
            onHideCallback: null
        };

        const defaultContainerSettings = {
            placement: 'br',
            containerWidth: '500px'
        };

        let activeNotificationContainer;

        const assimilateOptions = (primary, secondary) => {
            return Object.assign({}, primary, secondary);
        };

        const removeNotificationElement = (targetDomElement, currentConfig) => {
            if (!targetDomElement || !targetDomElement.parentElement) return;

            targetDomElement.classList.add('notification-out');
            targetDomElement.style.setProperty('--slide-distance', `${currentConfig.slideOutDistance}px`);
            targetDomElement.style.transition = `opacity ${currentConfig.fadeOutDuration / 1000}s ease-out, transform ${currentConfig.fadeOutDuration / 1000}s ease-out`;

            setTimeout(() => {
                try {
                    const closeControl = targetDomElement.querySelector('.notification-dismiss-btn');
                    if (closeControl) {
                        // In modern JS, removing the element implicitly cleans up most event listeners.
                        // If a specific named function was attached, it could be removed here.
                    }
                    if (typeof currentConfig.onHideCallback === 'function') {
                        currentConfig.onHideCallback();
                    }
                } catch (e) {
                    // Error during cleanup
                } finally {
                    try {
                        targetDomElement.remove();
                    } catch (e) {
                        // Error removing element
                    }
                }
            }, currentConfig.fadeOutDuration + 50);
        };

        const createAndDisplayNotification = (containerReference, messageText, optionsMap) => {
            const effectiveConfig = assimilateOptions(defaultNotificationSettings, optionsMap);

            const notificationWrapper = document.createElement('div');
            notificationWrapper.className = 'notification-unit';
            if (effectiveConfig.customClass) {
                notificationWrapper.classList.add(effectiveConfig.customClass);
            } else {
                notificationWrapper.classList.add('default-unit-style');
            }

            notificationWrapper.style.opacity = '0';
            notificationWrapper.style.transform = 'translateY(100%)';

            const headerContentDiv = document.createElement('div');
            headerContentDiv.className = 'notification-unit-header';
            headerContentDiv.innerHTML = effectiveConfig.titleContent || '&nbsp;';

            const bodyContentDiv = document.createElement('div');
            bodyContentDiv.className = 'notification-unit-body';
            bodyContentDiv.innerHTML = messageText;

            notificationWrapper.appendChild(headerContentDiv);
            notificationWrapper.appendChild(bodyContentDiv);

            if (effectiveConfig.isDismissible) {
                const dismissButton = document.createElement('button');
                dismissButton.className = 'notification-dismiss-btn';
                dismissButton.innerHTML = '&times;';
                dismissButton.addEventListener('click', () => removeNotificationElement(notificationWrapper, effectiveConfig));
                notificationWrapper.insertBefore(dismissButton, headerContentDiv);
            }

            containerReference.appendChild(notificationWrapper);

            requestAnimationFrame(() => {
                notificationWrapper.style.transition = `opacity ${effectiveConfig.fadeInDuration / 1000}s ease-in, transform ${effectiveConfig.fadeInDuration / 1000}s ease-out`;
                notificationWrapper.style.opacity = '0.9';
                notificationWrapper.style.transform = 'translateY(0)';
            });

            if (!effectiveConfig.isDismissible) {
                setTimeout(() => removeNotificationElement(notificationWrapper, effectiveConfig), effectiveConfig.displayLifetime);
            }

            if (typeof effectiveConfig.onShowCallback === 'function') {
                effectiveConfig.onShowCallback(notificationWrapper);
            }

            return notificationWrapper;
        };

        class NotificationHandler {
            constructor(configurationOptions) {
                const combinedConfiguration = assimilateOptions(defaultContainerSettings, configurationOptions);

                activeNotificationContainer = document.createElement('div');
                activeNotificationContainer.id = 'unified-notifier-zone';
                activeNotificationContainer.className = 'notification-zone';
                activeNotificationContainer.style.position = 'fixed';
                activeNotificationContainer.style.padding = '10px';
                activeNotificationContainer.style.width = combinedConfiguration.containerWidth;
                activeNotificationContainer.style.zIndex = '50000';
                activeNotificationContainer.style.display = 'flex';
                activeNotificationContainer.style.flexDirection = 'column';
                activeNotificationContainer.style.gap = '10px';

                switch (combinedConfiguration.placement) {
                    case "br":
                        activeNotificationContainer.style.bottom = '0';
                        activeNotificationContainer.style.right = '0';
                        activeNotificationContainer.style.alignItems = 'flex-end';
                        break;
                    case "tl":
                        activeNotificationContainer.style.top = '0';
                        activeNotificationContainer.style.left = '0';
                        activeNotificationContainer.style.alignItems = 'flex-start';
                        break;
                    case "bl": // Original's 'bl' case was top:0, right:0
                        activeNotificationContainer.style.top = '0';
                        activeNotificationContainer.style.right = '0';
                        activeNotificationContainer.style.alignItems = 'flex-end';
                        break;
                    case "tc":
                        activeNotificationContainer.style.top = '0';
                        activeNotificationContainer.style.left = '50%';
                        activeNotificationContainer.style.transform = 'translateX(-50%)';
                        activeNotificationContainer.style.width = '50%';
                        activeNotificationContainer.style.alignItems = 'center';
                        break;
                    case "bc":
                        activeNotificationContainer.style.bottom = '0';
                        activeNotificationContainer.style.left = '50%';
                        activeNotificationContainer.style.transform = 'translateX(-50%)';
                        activeNotificationContainer.style.width = '50%';
                        activeNotificationContainer.style.alignItems = 'center';
                        break;
                    default: // Original's default was top:0, right:0
                        activeNotificationContainer.style.top = '0';
                        activeNotificationContainer.style.right = '0';
                        activeNotificationContainer.style.alignItems = 'flex-end';
                        break;
                }
                document.body.appendChild(activeNotificationContainer);
            }

            display(messageText, optionsMap) {
                return createAndDisplayNotification(activeNotificationContainer, messageText, optionsMap);
            }

            signalError(headerContent, messageContent) {
                return this.display(messageContent, {
                    titleContent: headerContent,
                    isDismissible: true,
                    customClass: 'error-status-unit'
                });
            }

            signalSuccess(headerContent, messageContent) {
                return this.display(messageContent, {
                    titleContent: headerContent,
                    isDismissible: false,
                    customClass: 'success-status-unit'
                });
            }

            conceal(notificationElement, optionsMap) {
                removeNotificationElement(notificationElement, assimilateOptions(defaultNotificationSettings, optionsMap));
            }
        }

        return new NotificationHandler();
    })();
});