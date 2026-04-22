const AppCore = (() => {
    const internalState = new Map();

    const filterIdentifiers = ['saturate', 'brightness', 'contrast', 'huerotate', 'invert', 'blur', 'sepia', 'grayscale', 'opacity'];

    internalState.set('currentScrollX', 0);
    internalState.set('currentScrollY', 0);
    internalState.set('displayOrientation', 0); // 0: vertical, 1: horizontal
    internalState.set('doubleTapDetected', false);
    internalState.set('magnifyModeEnabled', false);
    internalState.set('styleInspectorElement', null);
    internalState.set('isHandheldDevice', false);
    internalState.set('isStandaloneApp', false);
    internalState.set('displayAreaWidth', 0);
    internalState.set('displayAreaHeight', 0);
    internalState.set('debugLoggingActive', false);

    const horizontalOffsetMap = new Map([
        ['saturate', 80], ['brightness', 132], ['contrast', 184], ['huerotate', 236], ['invert', 288],
        ['blur', 340], ['sepia', 392], ['grayscale', 444], ['opacity', 496]
    ]);
    internalState.set('horizontalOffsets', horizontalOffsetMap);

    const verticalOffsetMap = new Map([
        ['saturate', 109], ['brightness', 175], ['contrast', 241], ['huerotate', 307], ['invert', 373],
        ['blur', 439], ['sepia', 505], ['grayscale', 571], ['opacity', 638]
    ]);
    internalState.set('verticalOffsets', verticalOffsetMap);

    const defaultFilterSettings = new Map([
        ['saturate', 100], ['brightness', 0], ['contrast', 100], ['huerotate', 0], ['invert', 0],
        ['blur', 0], ['sepia', 0], ['grayscale', 0], ['opacity', 100]
    ]);
    internalState.set('defaultFilterSettings', defaultFilterSettings);

    const activeFilterSettings = new Map(defaultFilterSettings);
    internalState.set('activeFilterSettings', activeFilterSettings);

    const selectElement = (selector) => document.querySelector(selector);
    const selectAllElements = (selector) => document.querySelectorAll(selector);

    const animateElementVisibility = (element, show, durationMs = 300) => {
        if (!element) return;
        element.style.transition = `opacity ${durationMs}ms ease-in-out`;
        element.style.opacity = show ? '1' : '0';
        element.style.pointerEvents = show ? 'auto' : 'none';

        if (!show) {
            setTimeout(() => {
                element.style.display = 'none';
            }, durationMs);
        } else {
            element.style.display = '';
            element.offsetHeight; // Trigger reflow for transition
        }
    };

    const applyImageStyling = () => {
        const imageTarget = selectElement('#photo img');
        if (!imageTarget) return;

        const styleParts = [];
        filterIdentifiers.forEach(name => {
            const value = internalState.get('activeFilterSettings').get(name);
            switch (name) {
                case 'saturate':
                case 'brightness':
                case 'contrast':
                case 'invert':
                case 'sepia':
                case 'grayscale':
                case 'opacity':
                    styleParts.push(`${name}(${value}%)`);
                    break;
                case 'huerotate':
                    styleParts.push(`${name}(${value}deg)`);
                    break;
                case 'blur':
                    styleParts.push(`${name}(${value}px)`);
                    break;
            }
        });
        const filterString = styleParts.join(' ');
        imageTarget.style.webkitFilter = filterString;
        imageTarget.style.filter = filterString;
    };

    const deselectAllMenuOptions = () => {
        selectAllElements('#footer a').forEach(link => link.classList.remove('selected'));
        const sliderPanel = selectElement('#slider');
        if (sliderPanel) {
            sliderPanel.className = '';
        }
    };

    const concealSliderPanel = () => {
        deselectAllMenuOptions();
        animateElementVisibility(selectElement('#slider'), false, 300);
    };

    const updateScrollMetrics = () => {
        concealSliderPanel();
        const footerContainer = selectElement('#footer');
        if (footerContainer) {
            internalState.set('currentScrollX', footerContainer.scrollLeft);
            internalState.set('currentScrollY', footerContainer.scrollTop);
        }
    };

    const resetAllImageFilters = () => {
        const initialSettings = internalState.get('defaultFilterSettings');
        const activeSettings = internalState.get('activeFilterSettings');

        initialSettings.forEach((value, key) => {
            activeSettings.set(key, value);
            const inputField = selectElement(`#${key}-slider input`);
            const outputDisplay = selectElement(`#${key}-slider output span`);
            if (inputField) inputField.value = value;
            if (outputDisplay) outputDisplay.textContent = value;
        });

        const imageTarget = selectElement('#photo img');
        if (imageTarget) {
            imageTarget.classList.add('animate');
            setTimeout(() => {
                imageTarget.classList.remove('animate');
            }, 1000);
        }
        applyImageStyling();
    };

    const refreshOrientationClasses = () => {
        const bodyElement = selectElement('body');
        if (!bodyElement) return;

        if (internalState.get('displayOrientation') === 0) { // Portrait
            bodyElement.classList.add('portrait');
            bodyElement.classList.remove('landscape');
        } else { // Landscape
            bodyElement.classList.add('landscape');
            bodyElement.classList.remove('portrait');
        }
    };

    const determineAndSetOrientation = () => {
        const displaySection = selectElement('#display');
        if (!displaySection) return;

        const currentWidth = displaySection.offsetWidth;
        const currentHeight = displaySection.offsetHeight;
        internalState.set('displayAreaWidth', currentWidth);
        internalState.set('displayAreaHeight', currentHeight);

        internalState.set('displayOrientation', (currentWidth > currentHeight) ? 1 : 0);
        refreshOrientationClasses();
    };

    const adjustMagnifyMode = () => {
        const imageTarget = selectElement('#photo img');
        if (!imageTarget) return;

        const refreshControl = selectElement('#refresh');
        const infoControl = selectElement('#info');
        const footerControls = selectElement('#footer');

        imageTarget.classList.add('animate');
        setTimeout(() => {
            imageTarget.classList.remove('animate');
        }, 1000);

        if (internalState.get('magnifyModeEnabled')) {
            imageTarget.style.transform = 'scale(1)';
            animateElementVisibility(refreshControl, true, 400);
            animateElementVisibility(infoControl, true, 400);
            animateElementVisibility(footerControls, true, 400);
            internalState.set('magnifyModeEnabled', false);
        } else {
            const originalPhotoWidth = imageTarget.naturalWidth;
            const originalPhotoHeight = imageTarget.naturalHeight;
            const currentPhotoDisplayWidth = imageTarget.offsetWidth;
            const currentPhotoDisplayHeight = imageTarget.offsetHeight;
            const currentDisplayAreaWidth = internalState.get('displayAreaWidth');
            const currentDisplayAreaHeight = internalState.get('displayAreaHeight');

            if (originalPhotoWidth > currentDisplayAreaWidth && originalPhotoHeight > currentDisplayAreaHeight) {
                let scaleFactor;
                if (originalPhotoWidth / originalPhotoHeight > currentDisplayAreaWidth / currentDisplayAreaHeight) {
                    scaleFactor = currentDisplayAreaHeight / currentPhotoDisplayHeight;
                } else {
                    scaleFactor = currentDisplayAreaWidth / currentPhotoDisplayWidth;
                }
                imageTarget.style.transform = `scale(${scaleFactor})`;
            }
            concealSliderPanel();
            animateElementVisibility(refreshControl, false, 400);
            animateElementVisibility(infoControl, false, 400);
            animateElementVisibility(footerControls, false, 400);
            internalState.set('magnifyModeEnabled', true);
        }
    };

    const handleVideoPlayback = (show) => {
        const videoWindow = selectElement('#video-window');
        if (!videoWindow) return;

        if (show) {
            videoWindow.innerHTML = '<div id="video-content"><iframe width="640" height="360" src="http://www.youtube.com/embed/Z5bFwu5WSeg?rel=0&autoplay=1&controls=0&showinfo=0" frameborder="0" allowfullscreen></iframe></div>';
            videoWindow.classList.add('show');
        } else {
            videoWindow.classList.remove('show');
            setTimeout(() => {
                videoWindow.innerHTML = '';
            }, 700);
        }
    };

    const checkDebugFlag = () => {
        const urlHash = window.location.hash;
        internalState.set('debugLoggingActive', urlHash === '#dev' || urlHash === '#debug');
    };

    const publicInterface = {};

    publicInterface.bootApplication = () => {
        const agentString = navigator.userAgent;
        const isIPhone = agentString.includes('iPhone') && !agentString.includes('iPad');
        const isIPod = agentString.includes('iPod');
        const isAndroid = agentString.includes('Android');
        const isIOS6 = agentString.includes('iPhone OS 6');

        if (isIPhone || isIPod || isAndroid) {
            internalState.set('isHandheldDevice', true);
            document.title = 'PhotoEditor';
            if (!isIOS6) {
                const alertDiv = document.createElement('div');
                alertDiv.id = 'os-alert';
                alertDiv.innerHTML = '<div><p>This app will work correctly only on the iOS6!</p><span>Tap and close</span></div>';
                alertDiv.addEventListener('click', () => alertDiv.style.display = 'none');
                selectElement('#display')?.append(alertDiv);
            }
        }
        if (internalState.get('isHandheldDevice')) {
            selectElement('body')?.classList.add('mobile');
        }
        if (window.navigator.standalone) {
            internalState.set('isStandaloneApp', true);
            selectElement('body')?.classList.add('webapp');
        }

        determineAndSetOrientation();

        if (!internalState.get('isHandheldDevice')) {
            const wrapperDiv = selectElement('#wrapper');
            if (wrapperDiv) {
                wrapperDiv.classList.add('start');
                wrapperDiv.insertAdjacentHTML('beforeend', '<img src="images/iphone.png" id="iphone"><a href="#" id="check-style-button">Check the style</a>');
                wrapperDiv.insertAdjacentHTML('beforeend', '<div id="pc"><img src="images/logo.png" id="pc-logo"><p id="pc-text">CSS PhotoEditor is a test site for new features that will be installed in iOS6.<span>The browsers supported this site are Chrome20, Safari6 & iOS6. <a href="http://d.hatena.ne.jp/kudakurage/">Learn more about this page</a></span></p><a href="#" id="video-control"><img src="images/video.png"><span>DEMO on iOS simulator</span></a><ul id="features"><li class="upload">Input type=file</li><li class="filter">CSS Filters</li><li class="slider">Custom Slider UI</li><li class="font">Landscape Mode</li></ul><div class="profile"><a href="http://d.hatena.ne.jp/kudakurage/"><img src="images/profile.png" class="profile-image"></a><p class="profile-name">Kazuyuki Motoyama<span>Kudakurage</span></p><p class="profile-acount"><a href="https://twitter.com/kudakurage" class="twitter">twitter</a><a href="http://dribbble.com/kudakurage" class="dribbble">dribbble</a><a href="https://github.com/kudakurage" class="github">github</a></p><p class="profile-text">I have been working as a Web designer in Kyoto.<br />UI Design / App Design / Illustration / HTML5&CSS3 / Javascript / PHP</p><p class="copyright">Copyright &copy; 2012 kazuyuki motoyama</p></div></div>');

                const videoOverlay = document.createElement('div');
                videoOverlay.id = 'video-window';
                videoOverlay.addEventListener('click', () => handleVideoPlayback(false));
                selectElement('body')?.append(videoOverlay);

                selectElement('#check-style-button')?.addEventListener('click', (event) => {
                    event.preventDefault();
                    publicInterface.toggleStyleInspector();
                });
                selectElement('#video-control')?.addEventListener('click', (event) => {
                    event.preventDefault();
                    handleVideoPlayback(true);
                });
            }
        }

        fetch("images/sample.png")
            .then(response => {
                if (response.ok) {
                    selectElement('#wrapper')?.classList.remove('start');
                    setTimeout(() => {
                        publicInterface.selectMenuOption(selectElement('#footer a#saturate'));
                        setTimeout(() => {
                            let saturationLevel = 100;
                            const animateSaturation = () => {
                                saturationLevel += 2;
                                if (saturationLevel >= 148) {
                                    saturationLevel = 148;
                                }
                                const saturateInput = selectElement('#saturate-slider input');
                                const saturateOutput = selectElement('#saturate-slider output span');
                                if (saturateInput) saturateInput.value = saturationLevel;
                                if (saturateOutput) saturateOutput.textContent = saturationLevel;
                                internalState.get('activeFilterSettings').set('saturate', saturationLevel);
                                applyImageStyling();

                                if (saturationLevel < 148) {
                                    setTimeout(animateSaturation, 0);
                                }
                            };
                            animateSaturation();
                        }, 600);
                    }, 1000);
                }
            })
            .catch(error => console.error("Failed to load sample image:", error));

        checkDebugFlag();
    };

    publicInterface.selectMenuOption = (elementTarget) => {
        if (!elementTarget) return;

        deselectAllMenuOptions();
        elementTarget.classList.add('selected');

        const optionId = elementTarget.id;
        const sliderContainer = selectElement('#slider');
        if (!sliderContainer) return;

        if (internalState.get('displayOrientation') === 0) { // Portrait
            const footerMenu = selectElement('#footer menu');
            const menuLeftOffset = footerMenu ? parseInt(getComputedStyle(footerMenu).marginLeft) : 0;
            const bgLeft = -320 + menuLeftOffset + internalState.get('verticalOffsets').get(optionId) - internalState.get('currentScrollX');
            sliderContainer.style.backgroundPosition = `${bgLeft}px 0`;
        } else { // Landscape
            const webAppOffset = internalState.get('isStandaloneApp') ? 20 : 0;
            const sliderTop = -25 + webAppOffset + internalState.get('horizontalOffsets').get(optionId) - internalState.get('currentScrollY');
            sliderContainer.style.top = `${sliderTop}px`;
        }
        sliderContainer.classList.add(optionId);
        animateElementVisibility(sliderContainer, true, 300);
    };

    publicInterface.blurSliderControls = () => {
        concealSliderPanel();
    };

    publicInterface.resetActiveFilters = () => {
        resetAllImageFilters();
    };

    publicInterface.toggleStyleInspector = () => {
        let inspectorElement = internalState.get('styleInspectorElement');
        if (inspectorElement) {
            inspectorElement.remove();
            internalState.set('styleInspectorElement', null);
        } else {
            const activeSettings = internalState.get('activeFilterSettings');
            inspectorElement = document.createElement('div');
            inspectorElement.id = 'check-style-content';
            const contentHTML = [`<h2>-webkit-filter:</h2>`];
            filterIdentifiers.forEach(name => {
                const value = activeSettings.get(name);
                let unit = '%';
                if (name === 'huerotate') unit = 'deg';
                if (name === 'blur') unit = 'px';
                contentHTML.push(`<p>${name}(<span>${value}${unit}</span>)</p>`);
            });
            inspectorElement.innerHTML = contentHTML.join('');
            inspectorElement.addEventListener('click', () => publicInterface.toggleStyleInspector());
            selectElement('#wrapper')?.append(inspectorElement);
            internalState.set('styleInspectorElement', inspectorElement);
        }
        return false;
    };

    publicInterface.activateMagnifyMode = () => {
        adjustMagnifyMode();
    };

    document.addEventListener('DOMContentLoaded', () => {
        publicInterface.bootApplication();

        window.addEventListener('resize', () => {
            determineAndSetOrientation();
            updateScrollMetrics();
            if (internalState.get('isHandheldDevice')) {
                const overlayBlocker = selectElement('#disabled');
                if (overlayBlocker) {
                    overlayBlocker.style.display = 'block';
                    overlayBlocker.style.opacity = '0';
                    setTimeout(() => {
                        overlayBlocker.style.display = 'none';
                        overlayBlocker.style.opacity = '1';
                    }, 0);
                }
            }
        });

        selectElement('#footer')?.addEventListener('click', (event) => {
            const clickedLink = event.target.closest('a');
            if (clickedLink && clickedLink.parentElement.tagName === 'MENU') {
                event.preventDefault();
                publicInterface.selectMenuOption(clickedLink);
            }
        });

        selectElement('#footer')?.addEventListener('scroll', updateScrollMetrics);

        selectElement('#slider')?.addEventListener('change', (event) => {
            const changedInput = event.target;
            if (changedInput.tagName === 'INPUT' && changedInput.type === 'range') {
                const filterId = changedInput.name;
                const filterVal = parseInt(changedInput.value);
                internalState.get('activeFilterSettings').set(filterId, filterVal);
                const outputDisplay = selectElement(`#${filterId}-slider output span`);
                if (outputDisplay) outputDisplay.textContent = filterVal;
                applyImageStyling();
            }
        });

        selectElement('#refresh')?.addEventListener('click', (event) => {
            event.preventDefault();
            publicInterface.blurSliderControls();
            publicInterface.resetActiveFilters();
        });

        selectElement('#info')?.addEventListener('click', (event) => {
            event.preventDefault();
            publicInterface.blurSliderControls();
            selectElement('#display')?.classList.add('flip');
        });

        selectElement('#back')?.addEventListener('click', (event) => {
            event.preventDefault();
            selectElement('#display')?.classList.remove('flip');
        });

        selectElement('#photo')?.addEventListener('click', (event) => {
            event.preventDefault();
            publicInterface.blurSliderControls();
        });

        selectElement('#photo img')?.addEventListener('dblclick', () => {
            publicInterface.activateMagnifyMode();
        });

        selectElement('#photo img')?.addEventListener('touchend', () => {
            if (internalState.get('doubleTapDetected')) {
                publicInterface.activateMagnifyMode();
                internalState.set('doubleTapDetected', false);
            } else {
                internalState.set('doubleTapDetected', true);
                setTimeout(() => {
                    internalState.set('doubleTapDetected', false);
                }, 500);
            }
        });

        selectAllElements('input[type=file]').forEach(inputElement => {
            inputElement.addEventListener('click', publicInterface.blurSliderControls);
            inputElement.addEventListener('change', (event) => {
                const overlayBlocker = selectElement('#disabled');
                if (internalState.get('isHandheldDevice')) {
                    if (overlayBlocker) overlayBlocker.style.display = '-webkit-box';
                } else {
                    animateElementVisibility(overlayBlocker, true);
                }

                const selectedFile = event.target.files[0];
                if (!selectedFile) return;

                const uploadData = new FormData();
                uploadData.append('file', selectedFile);

                fetch('upload.php', {
                    method: 'POST',
                    body: uploadData
                })
                .then(response => response.json())
                .then(data => {
                    if (internalState.get('isHandheldDevice')) {
                        if (overlayBlocker) overlayBlocker.style.display = 'none';
                    } else {
                        animateElementVisibility(overlayBlocker, false);
                    }

                    if (data.result) {
                        const imgElement = selectElement('#photo img');
                        if (imgElement) imgElement.src = `images/${data.filename}`;
                        publicInterface.resetActiveFilters();
                    } else {
                        alert('Sorry, upload failed.');
                    }
                })
                .catch(error => {
                    console.error('File upload error:', error);
                    if (internalState.get('isHandheldDevice')) {
                        if (overlayBlocker) overlayBlocker.style.display = 'none';
                    } else {
                        animateElementVisibility(overlayBlocker, false);
                    }
                    alert('Sorry, upload failed.');
                });
            });
        });

        selectElement('#force-webapp')?.addEventListener('click', function(event) {
            event.preventDefault();
            const currentlyOn = this.classList.toggle('on');
            this.textContent = currentlyOn ? 'ON' : 'OFF';
            setTimeout(() => {
                selectElement('body')?.classList.toggle('fullscreen', currentlyOn);
            }, 350);
        });
    });

    return publicInterface;
})();

AppCore.bootApplication();