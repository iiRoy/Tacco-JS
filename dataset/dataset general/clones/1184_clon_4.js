(function() {
    class PanelFlowManager {
        #panelRegister = new Map();
        #isTransitionLocked = false;
        #currentDisplayPanel = null;
        #nextMotionSequence = null;
        #systemConfig = {};

        #permissibleMotions = [
            'fade', 'fadetop', 'fadetopright', 'faderight', 'fadebottomright',
            'fadebottom', 'fadebottomleft', 'fadeleft', 'fadetopleft',
            'top', 'topright', 'right', 'bottomright', 'bottom',
            'bottomleft', 'left', 'topleft'
        ];

        #motionTransformationMap = {
            'top': { initial: 'translateY(-100%)', final: 'translateY(-100%)' },
            'bottom': { initial: 'translateY(100%)', final: 'translateY(100%)' },
            'left': { initial: 'translateX(-100%)', final: 'translateX(-100%)' },
            'right': { initial: 'translateX(100%)', final: 'translateX(100%)' },
            'topleft': { initial: 'translate(-100%, -100%)', final: 'translate(-100%, -100%)' },
            'topright': { initial: 'translate(100%, -100%)', final: 'translate(100%, -100%)' },
            'bottomleft': { initial: 'translate(-100%, 100%)', final: 'translate(-100%, 100%)' },
            'bottomright': { initial: 'translate(100%, 100%)', final: 'translate(100%, 100%)' }
        };

        constructor() {
            this.#injectBaseStyles();
        }

        #injectBaseStyles() {
            if (document.getElementById('panel-flow-styles')) return;
            const styleElement = document.createElement('style');
            styleElement.id = 'panel-flow-styles';
            styleElement.textContent = `
                .panel-container-unit {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transform: translate(0,0);
                }
                .panel-container-unit.active-panel {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: auto;
                    z-index: 1;
                }
                .panel-container-unit.motion-active {
                    transition-property: transform, opacity;
                    transition-timing-function: ease-in-out;
                    will-change: transform, opacity;
                    position: absolute;
                    z-index: 2;
                }
            `;
            document.head.appendChild(styleElement);
        }

        initializeSystem(options = {}) {
            const potentialPanels = document.querySelectorAll('div.ms-container');

            if (potentialPanels.length < 2) {
                return;
            }

            let designatedPanel = document.querySelector('div.ms-container.ms-default');
            if (!designatedPanel) {
                designatedPanel = potentialPanels[0];
                designatedPanel.classList.add('ms-default');
            } else if (document.querySelectorAll('div.ms-container.ms-default').length > 1) {
                Array.from(document.querySelectorAll('div.ms-container.ms-default')).slice(1).forEach(p => p.classList.remove('ms-default'));
                designatedPanel = document.querySelector('div.ms-container.ms-default');
            }

            this.#registerPanels(potentialPanels);
            this.#configureSystemDefaults(options);

            this.#currentDisplayPanel = designatedPanel;
            this.#currentDisplayPanel.classList.add('active-panel');
            this.#currentDisplayPanel.classList.add('panel-container-unit');

            this.#panelRegister.forEach(panel => {
                if (panel !== this.#currentDisplayPanel) {
                    panel.classList.remove('active-panel');
                    panel.classList.add('panel-container-unit');
                }
            });

            this.#isTransitionLocked = false;
            this.#nextMotionSequence = null;
            this.#engageNavigationControls();
        }

        #registerPanels(panelElements) {
            panelElements.forEach(panel => {
                const panelId = panel.id;
                if (panelId) {
                    this.#panelRegister.set(panelId, panel);
                }
            });
        }

        #configureSystemDefaults(configOptions) {
            this.#systemConfig = {
                presetEntranceMotion: 'fade',
                presetExitMotion: 'fade',
                presetEntranceDuration: 400,
                presetExitDuration: 400,
                presetTransitionDelay: false,
                verticalSeparationBuffer: 0,
                horizontalSeparationBuffer: 0,
                pageScrollDuration: 400,
                ...configOptions
            };
        }

        #engageNavigationControls() {
            document.querySelectorAll('.ms-nav-link').forEach(linkElement => {
                linkElement.addEventListener('click', (event) => {
                    event.preventDefault();
                    const link = event.currentTarget;
                    this.navigateBetweenPanels({
                        target_id: link.getAttribute('data-ms-target'),
                        animation_command: link.getAttribute('data-ms-animation'),
                        enter_animation_command: link.getAttribute('data-ms-enter-animation'),
                        exit_animation_command: link.getAttribute('data-ms-exit-animation'),
                        animation_time: link.getAttribute('data-ms-time'),
                        enter_animation_time: link.getAttribute('data-ms-enter-time'),
                        exit_animation_time: link.getAttribute('data-ms-exit-time'),
                        delay: link.getAttribute('data-ms-delay'),
                        distance: link.getAttribute('data-ms-distance'),
                        vertical_distance: link.getAttribute('data-ms-vertical-distance'),
                        horizontal_distance: link.getAttribute('data-ms-horizontal-distance'),
                        scroll_time: link.getAttribute('data-ms-scroll-time')
                    });
                });
            });
        }

        async navigateBetweenPanels(motionOptions) {
            if (this.#isTransitionLocked) {
                return false;
            }

            this.#isTransitionLocked = true;

            const incomingPanel = this.#retrieveTargetPanel(motionOptions.target_id);
            const outgoingPanel = this.#currentDisplayPanel;

            if (!incomingPanel || incomingPanel === outgoingPanel) {
                this.#isTransitionLocked = false;
                return false;
            }

            this.#currentDisplayPanel = incomingPanel;

            if (typeof motionOptions.chain_animation_options === 'object') {
                this.#nextMotionSequence = motionOptions.chain_animation_options;
            }

            const resolvedOptions = { ...motionOptions };
            resolvedOptions.exit_animation_command = resolvedOptions.exit_animation_command || resolvedOptions.animation_command;
            resolvedOptions.enter_animation_command = resolvedOptions.enter_animation_command || resolvedOptions.animation_command;
            resolvedOptions.exit_animation_time = resolvedOptions.exit_animation_time || resolvedOptions.animation_time;
            resolvedOptions.enter_animation_time = resolvedOptions.enter_animation_time || resolvedOptions.animation_time;
            resolvedOptions.vertical_distance = resolvedOptions.vertical_distance || resolvedOptions.distance;
            resolvedOptions.horizontal_distance = resolvedOptions.horizontal_distance || resolvedOptions.distance;

            if (window.scrollY > 0) {
                await this.#performSmoothScroll(0, this.#resolveMotionDuration(resolvedOptions.scroll_time, 'scroll'));
            }

            await this.#executePanelMotion(
                outgoingPanel,
                incomingPanel,
                resolvedOptions.enter_animation_command,
                resolvedOptions.enter_animation_time,
                resolvedOptions.exit_animation_command,
                resolvedOptions.exit_animation_time,
                resolvedOptions.delay,
                resolvedOptions.vertical_distance,
                resolvedOptions.horizontal_distance
            );

            this.#isTransitionLocked = false;
            if (this.#nextMotionSequence) {
                const nextChain = this.#nextMotionSequence;
                this.#nextMotionSequence = null;
                this.navigateBetweenPanels(nextChain);
            }
            return true;
        }

        #retrieveTargetPanel(panelId) {
            return panelId ? this.#panelRegister.get(panelId) : null;
        }

        #resolveMotionDuration(timeValue, type) {
            const parsedTime = parseInt(timeValue, 10);
            if (!isNaN(parsedTime) && parsedTime >= 0) {
                return parsedTime;
            }
            return this.#getDefaultMotionDuration(type);
        }

        #getDefaultMotionDuration(type) {
            switch (type) {
                case 'enter': return this.#systemConfig.presetEntranceDuration;
                case 'exit': return this.#systemConfig.presetExitDuration;
                case 'scroll': return this.#systemConfig.pageScrollDuration;
                default: return 400;
            }
        }

        #getDefaultMotion(type) {
            return type === 'enter' ? this.#systemConfig.presetEntranceMotion : this.#systemConfig.presetExitMotion;
        }

        #getDefaultMotionDelay() {
            return this.#systemConfig.presetTransitionDelay;
        }

        #getDefaultBufferDistance(axis) {
            return axis === 'x' ? this.#systemConfig.horizontalSeparationBuffer : this.#systemConfig.verticalSeparationBuffer;
        }

        #isValidMotionCommand(command) {
            return typeof command === 'string' && this.#permissibleMotions.includes(command.toLowerCase());
        }

        #performSmoothScroll(targetY, duration) {
            return new Promise(resolve => {
                const startY = window.scrollY;
                const distance = targetY - startY;
                let startTime = null;

                const animateScroll = (currentTime) => {
                    if (!startTime) startTime = currentTime;
                    const progress = (currentTime - startTime) / duration;
                    const easeProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                    window.scrollTo(0, startY + distance * easeProgress);

                    if (progress < 1) {
                        requestAnimationFrame(animateScroll);
                    } else {
                        resolve();
                    }
                };
                requestAnimationFrame(animateScroll);
            });
        }

        async #executePanelMotion(outgoingPanel, incomingPanel, enterCmd, enterTime, exitCmd, exitTime, delayOption, vertBuffer, horizBuffer) {
            enterCmd = this.#isValidMotionCommand(enterCmd) ? enterCmd.toLowerCase() : this.#getDefaultMotion('enter');
            exitCmd = this.#isValidMotionCommand(exitCmd) ? exitCmd.toLowerCase() : this.#getDefaultMotion('exit');

            const useDelay = (typeof delayOption === 'boolean') ? delayOption :
                             ((typeof delayOption === 'string') ? (delayOption.toLowerCase() === 'true') : this.#getDefaultMotionDelay());

            const actualEnterTime = this.#resolveMotionDuration(enterTime, 'enter');
            const actualExitTime = this.#resolveMotionDuration(exitTime, 'exit');

            const { enterStyles, exitStyles } = this.#generateMotionStyles(enterCmd, exitCmd, vertBuffer, horizBuffer);

            Object.assign(incomingPanel.style, enterStyles.initial);
            incomingPanel.classList.add('motion-active');
            incomingPanel.style.transitionDuration = `${actualEnterTime}ms`;
            incomingPanel.style.zIndex = '2';

            outgoingPanel.classList.add('motion-active');
            outgoingPanel.style.transitionDuration = `${actualExitTime}ms`;
            outgoingPanel.style.zIndex = '2';

            Object.assign(outgoingPanel.style, exitStyles.final);

            if (useDelay) {
                await this.#animateOutgoingPanel(outgoingPanel, actualExitTime);
                await this.#animateIncomingPanel(incomingPanel, actualEnterTime, enterStyles.final);
            } else {
                const exitPromise = this.#animateOutgoingPanel(outgoingPanel, actualExitTime);
                const enterPromise = this.#animateIncomingPanel(incomingPanel, actualEnterTime, enterStyles.final);
                await Promise.all([exitPromise, enterPromise]);
            }

            outgoingPanel.classList.remove('active-panel', 'motion-active');
            outgoingPanel.style.cssText = '';
            outgoingPanel.style.transitionDuration = '';
            outgoingPanel.style.zIndex = '';

            incomingPanel.classList.add('active-panel');
            incomingPanel.classList.remove('motion-active');
            incomingPanel.style.cssText = '';
            incomingPanel.style.transitionDuration = '';
            incomingPanel.style.zIndex = '';
        }

        #animateOutgoingPanel(panel, duration) {
            return new Promise(resolve => {
                if (duration === 0) {
                    resolve();
                    return;
                }
                const onTransitionEnd = () => {
                    panel.removeEventListener('transitionend', onTransitionEnd);
                    resolve();
                };
                panel.addEventListener('transitionend', onTransitionEnd);
            });
        }

        #animateIncomingPanel(panel, duration, finalStyles) {
            return new Promise(resolve => {
                if (duration === 0) {
                    Object.assign(panel.style, finalStyles);
                    resolve();
                    return;
                }
                const onTransitionEnd = () => {
                    panel.removeEventListener('transitionend', onTransitionEnd);
                    resolve();
                };
                panel.addEventListener('transitionend', onTransitionEnd);

                setTimeout(() => {
                    Object.assign(panel.style, finalStyles);
                }, 10);
            });
        }

        #generateMotionStyles(enterCmd, exitCmd, vertBuffer, horizBuffer) {
            let enterFade = false;
            let exitFade = false;

            if (enterCmd.startsWith('fade')) {
                enterFade = true;
                enterCmd = enterCmd.substring(4);
            }
            if (exitCmd.startsWith('fade')) {
                exitFade = true;
                exitCmd = exitCmd.substring(4);
            }

            const effectiveVertBuffer = this.#isNumeric(vertBuffer) ? parseInt(vertBuffer, 10) : this.#getDefaultBufferDistance('y');
            const effectiveHorizBuffer = this.#isNumeric(horizBuffer) ? parseInt(horizBuffer, 10) : this.#getDefaultBufferDistance('x');

            const getTransform = (cmd, bufferX, bufferY) => {
                let transform = this.#motionTransformationMap[cmd] ? this.#motionTransformationMap[cmd].initial : 'translate(0,0)';
                if (bufferX !== 0 || bufferY !== 0) {
                    if (cmd.includes('top') && bufferY !== 0) {
                        transform = transform.replace('translateY(-100%)', `translateY(calc(-100% - ${bufferY}px))`);
                        transform = transform.replace('translate(-100%, -100%)', `translate(-100%, calc(-100% - ${bufferY}px))`);
                        transform = transform.replace('translate(100%, -100%)', `translate(100%, calc(-100% - ${bufferY}px))`);
                    }
                    if (cmd.includes('bottom') && bufferY !== 0) {
                        transform = transform.replace('translateY(100%)', `translateY(calc(100% + ${bufferY}px))`);
                        transform = transform.replace('translate(-100%, 100%)', `translate(-100%, calc(100% + ${bufferY}px))`);
                        transform = transform.replace('translate(100%, 100%)', `translate(100%, calc(100% + ${bufferY}px))`);
                    }
                    if (cmd.includes('left') && bufferX !== 0) {
                        transform = transform.replace('translateX(-100%)', `translateX(calc(-100% - ${bufferX}px))`);
                        transform = transform.replace('translate(-100%, -100%)', `translate(calc(-100% - ${bufferX}px), -100%)`);
                        transform = transform.replace('translate(-100%, 100%)', `translate(calc(-100% - ${bufferX}px), 100%)`);
                    }
                    if (cmd.includes('right') && bufferX !== 0) {
                        transform = transform.replace('translateX(100%)', `translateX(calc(100% + ${bufferX}px))`);
                        transform = transform.replace('translate(100%, -100%)', `translate(calc(100% + ${bufferX}px), -100%)`);
                        transform = transform.replace('translate(100%, 100%)', `translate(calc(100% + ${bufferX}px), 100%)`);
                    }
                }
                return transform;
            };

            const initialEnterTransform = getTransform(enterCmd, effectiveHorizBuffer, effectiveVertBuffer);
            const finalExitTransform = getTransform(exitCmd, effectiveHorizBuffer, effectiveVertBuffer);

            const enterStyles = {
                initial: {
                    transform: initialEnterTransform,
                    opacity: enterFade ? '0' : '1',
                    visibility: 'visible',
                    pointerEvents: 'auto'
                },
                final: {
                    transform: 'translate(0,0)',
                    opacity: '1'
                }
            };

            const exitStyles = {
                initial: {
                    transform: 'translate(0,0)',
                    opacity: '1'
                },
                final: {
                    transform: finalExitTransform,
                    opacity: exitFade ? '0' : '1'
                }
            };

            if (enterCmd === '' && enterFade) { enterStyles.initial.transform = 'translate(0,0)'; }
            if (exitCmd === '' && exitFade) { exitStyles.final.transform = 'translate(0,0)'; }

            return { enterStyles, exitStyles };
        }

        #isNumeric(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        }
    }

    const thePanelFlowSystem = new PanelFlowManager();

    window.PanelFlow = {
        initialize: function(opts) {
            thePanelFlowSystem.initializeSystem(opts);
        },
        navigate: function(opts) {
            thePanelFlowSystem.navigateBetweenPanels(opts);
        }
    };
})();