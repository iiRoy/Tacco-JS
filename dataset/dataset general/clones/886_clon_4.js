function displayPageAlert(userConfiguration) {
    const defaultParameters = {
        messageContent: 'Your message here',
        autoHideDelay: 3000,
        animationTransition: 'normal',
        styleClass: '',
        preExistingElement: null,
        enableDismiss: false,
        dismissLabel: '×',
        dismissOnClick: true,
        dismissOnHover: false,
        beforeDisplayHook: null,
        afterDisplayHook: null,
        beforeConcealHook: null,
        afterConcealHook: null,
        placement: 'top'
    };

    const currentParameters = { ...defaultParameters, ...userConfiguration };

    const getTransitionDuration = (speedKey) => {
        switch (speedKey) {
            case 'slow': return 600;
            case 'normal': return 400;
            case 'fast': return 200;
            default: return typeof speedKey === 'number' ? speedKey : 400;
        }
    };
    const transitionMillis = getTransitionDuration(currentParameters.animationTransition);

    if (currentParameters.enableDismiss) {
        currentParameters.autoHideDelay = 1000000000;
    }

    class FloatingAlertManager {
        constructor(params, duration) {
            this.config = params;
            this.animationDuration = duration;
            this.elementContainer = null;
            this.autoConcealTimeout = null;
            this.isVisible = false;
            this.setupAlertElement();
            this.attachInteractionHandlers();
        }

        setupAlertElement() {
            if (this.config.preExistingElement instanceof HTMLElement) {
                this.elementContainer = this.config.preExistingElement;
                this.config.messageContent = this.elementContainer.innerHTML;
            } else {
                this.elementContainer = document.createElement('div');
                this.elementContainer.className = 'floating-alert-base';
                this.elementContainer.id = `alert-${Date.now()}-${Math.floor(Math.random() * 100000000)}`;
            }

            if (this.config.styleClass) {
                this.elementContainer.classList.add(this.config.styleClass);
            }

            const messageSpan = document.createElement('span');
            messageSpan.className = 'floating-alert-content';
            messageSpan.innerHTML = this.config.messageContent;

            if (this.config.preExistingElement instanceof HTMLElement) {
                 while (this.elementContainer.firstChild) {
                    this.elementContainer.removeChild(this.elementContainer.firstChild);
                }
            }
            this.elementContainer.appendChild(messageSpan);

            if (this.config.enableDismiss) {
                const dismissLink = document.createElement('a');
                dismissLink.href = '#';
                dismissLink.className = 'floating-alert-dismiss';
                dismissLink.innerHTML = this.config.dismissLabel;
                dismissLink.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.triggerConceal();
                });
                this.elementContainer.appendChild(dismissLink);
            }

            this.elementContainer.style.overflow = 'hidden';
            this.elementContainer.style.maxHeight = '0px';
            this.elementContainer.style.transition = `max-height ${this.animationDuration}ms ease-in-out`;

            this.elementContainer.classList.add(`${this.config.placement}-placement`);
        }

        attachInteractionHandlers() {
            if (this.config.dismissOnClick) {
                this.elementContainer.addEventListener('click', () => this.triggerConceal());
            }
            if (this.config.dismissOnHover) {
                this.elementContainer.addEventListener('mouseover', () => this.triggerConceal());
            }
        }

        triggerReveal() {
            if (this.isVisible) return;

            if (this.config.beforeDisplayHook && typeof this.config.beforeDisplayHook === 'function') {
                this.config.beforeDisplayHook.call(null);
            }

            document.body.prepend(this.elementContainer);
            activeAlertInstancesMap.set(this.elementContainer, this);

            this.elementContainer.style.maxHeight = 'none';
            const actualHeight = this.elementContainer.scrollHeight;
            this.elementContainer.style.maxHeight = '0px';

            void this.elementContainer.offsetHeight;

            this.elementContainer.style.maxHeight = `${actualHeight}px`;
            this.elementContainer.classList.add('is-visible');

            this.elementContainer.addEventListener('transitionend', () => {
                this.elementContainer.style.maxHeight = 'none';
                this.elementContainer.style.overflow = 'hidden';
                this.isVisible = true;
                if (this.config.afterDisplayHook && typeof this.config.afterDisplayHook === 'function') {
                    this.config.afterDisplayHook.call(null);
                }
            }, { once: true });

            if (this.config.autoHideDelay > 0 && this.config.autoHideDelay < 999999999) {
                this.autoConcealTimeout = setTimeout(() => this.triggerConceal(), this.config.autoHideDelay + this.animationDuration);
            }
        }

        triggerConceal() {
            if (!this.isVisible && this.elementContainer.style.maxHeight === '0px' && !this.elementContainer.parentNode) {
                return Promise.resolve();
            }

            clearTimeout(this.autoConcealTimeout);

            if (this.config.beforeConcealHook && typeof this.config.beforeConcealHook === 'function') {
                this.config.beforeConcealHook.call(null);
            }

            return new Promise(resolve => {
                const currentHeight = this.elementContainer.offsetHeight;
                this.elementContainer.style.maxHeight = `${currentHeight}px`;
                void this.elementContainer.offsetHeight;

                this.elementContainer.classList.remove('is-visible');
                this.elementContainer.style.maxHeight = '0px';

                const transitionEndHandler = () => {
                    this.elementContainer.removeEventListener('transitionend', transitionEndHandler);
                    this.elementContainer.remove();
                    activeAlertInstancesMap.delete(this.elementContainer);
                    this.isVisible = false;
                    if (this.config.afterConcealHook && typeof this.config.afterConcealHook === 'function') {
                        this.config.afterConcealHook.call(null);
                    }
                    resolve();
                };
                this.elementContainer.addEventListener('transitionend', transitionEndHandler);

                setTimeout(() => {
                    if (this.isVisible || this.elementContainer.parentNode) {
                        transitionEndHandler();
                    }
                }, this.animationDuration + 50);
            });
        }
    }

    const activeAlertInstancesMap = new Map();

    const hideExistingAlerts = () => {
        const activeAlertPromises = [];
        document.querySelectorAll('.floating-alert-base.is-visible').forEach(element => {
            const instance = activeAlertInstancesMap.get(element);
            if (instance) {
                activeAlertPromises.push(instance.triggerConceal());
            }
        });
        return Promise.all(activeAlertPromises);
    };

    const newAlertInstance = new FloatingAlertManager(currentParameters, transitionMillis);

    hideExistingAlerts().then(() => {
        newAlertInstance.triggerReveal();
    });
}