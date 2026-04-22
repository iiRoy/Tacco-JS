'use strict';

const globalViewerRegistry = new Map();

function initializeDisplaySystem(rootElementId) {
    const mainDisplayElement = document.getElementById(rootElementId);
    if (!mainDisplayElement) {
        console.error(`Root element with ID '${rootElementId}' not found.`);
        return {};
    }

    const baseDisplayConfiguration = Object.freeze({
        fieldOfViewH: 100,
        minFieldOfViewH: 50,
        maxFieldOfViewH: 120,
        verticalAngle: 0,
        minVerticalAngle: -85,
        maxVerticalAngle: 85,
        horizontalAngle: 0,
        minHorizontalAngle: -360,
        maxHorizontalAngle: 360,
        fullHorizontalAngle: 360,
        fullVerticalAngle: 180,
        verticalOffset: 0,
        automaticRotation: false,
        automaticRotationDelay: -1,
        sourceType: 'equirectangular',
        compassBearing: 0,
        showFullWindowControl: true,
        mediaIsVideo: false,
        keyboardNavigation: true,
        hotspotDebugging: false
    });

    const viewerState = {
        paneSettings: null,
        journeyConfig: {},
        urlPaneSettings: null,
        renderEngine: null,
        previousRenderEngine: null,
        preloader: null,
        interactionActive: false,
        lastInteractionTime: Date.now(),
        pointerDownX: 0,
        pointerDownY: 0,
        pointerDownDistance: -1,
        pointerDownHorizontalAngle: 0,
        pointerDownVerticalAngle: 0,
        activeKeyCodes: new Array(10).fill(false),
        fullWindowActive: false,
        contentReady: false,
        systemFault: false,
        timeoutFlag: false,
        eventHandlersAttached: false,
        mediaSource: null,
        lastFrameTime: null,
        horizontalVelocity: 0,
        verticalVelocity: 0,
        magnificationVelocity: 0,
        animationInProgress: false,
        hotspotSetupComplete: false,

        handleContextualMenu: (e) => {
            const creditElement = mainDisplayElement.querySelector('.credit_banner');
            creditElement.style.left = e.clientX + 'px';
            creditElement.style.top = e.clientY + 'px';
            clearTimeout(creditElement._fadeTimer);
            clearTimeout(creditElement._hideTimer);
            creditElement.style.display = 'block';
            creditElement.style.opacity = 1;
            creditElement._fadeTimer = setTimeout(() => { creditElement.style.opacity = 0; }, 2000);
            creditElement._hideTimer = setTimeout(() => { creditElement.style.display = 'none'; }, 2500);
            e.preventDefault();
        },
        initiateView: () => { console.log('Initiating view...'); },
        magnifyView: () => { console.log('Magnifying view...'); },
        minifyView: () => { console.log('Minifying view...'); },
        togglePresentationMode: () => { console.log('Toggling presentation mode...'); },
        startFrameAnimation: () => { console.log('Starting frame animation...'); },
        capturePointerDown: (e) => {
            e.preventDefault();
            window.focus();
            if (!viewerState.contentReady) {
                return;
            }

            if (viewerState.paneSettings.hotspotDebugging) {
                const xCoord = e.clientX / mainDisplayElement.clientWidth * 2 - 1;
                const yCoord = (1 - e.clientY / mainDisplayElement.clientHeight * 2) * mainDisplayElement.clientHeight / mainDisplayElement.clientWidth;
                const focalLength = 1 / Math.tan(viewerState.paneSettings.fieldOfViewH * Math.PI / 360);
                const sVal = Math.sin(viewerState.paneSettings.verticalAngle * Math.PI / 180);
                const cVal = Math.cos(viewerState.paneSettings.verticalAngle * Math.PI / 180);
                const aVal = focalLength * cVal - yCoord * sVal;
                const rootVal = Math.sqrt(xCoord * xCoord + aVal * aVal);
                const computedPitch = Math.atan((yCoord * cVal + focalLength * sVal) / rootVal) * 180 / Math.PI;
                const computedYaw = Math.atan2(xCoord / rootVal, aVal / rootVal) * 180 / Math.PI + viewerState.paneSettings.horizontalAngle;
                console.log(`Computed Pitch: ${computedPitch}, Computed Yaw: ${computedYaw}`);
            }

            viewerState.paneSettings.automaticRotation = false;
            viewerState.interactionActive = true;
            viewerState.lastInteractionTime = Date.now();
            viewerState.pointerDownX = e.clientX;
            viewerState.pointerDownY = e.clientY;
            viewerState.pointerDownHorizontalAngle = viewerState.paneSettings.horizontalAngle;
            viewerState.pointerDownVerticalAngle = viewerState.paneSettings.verticalAngle;

            mainDisplayElement.classList.add('grasping');
            mainDisplayElement.classList.remove('graspable');

            viewerState.startFrameAnimation();
        }
    };

    const uiMarkup = `
        <span class="credit_banner"><a href="http://pannellum.org/" target="_blank">Pannellum</a></span>
        <div class="visuals_frame"></div>
        <div class="motion_anchor"></div>
        <div class="status_interface">
            <div class="panorama_details">
                <div class="heading_box"></div>
                <div class="creator_box"></div>
            </div>
            <div class="progress_section">
                <p>Loading...</p>
                <div class="spinner_box">
                    <div class="loader_animation"></div>
                </div>
                <div class="progress_bar">
                    <div class="progress_fill"></div>
                </div>
                <p class="progress_message"></p>
            </div>
            <div class="error_message_display info_panel"></div>
        </div>
        <div class="user_interaction_elements">
            <div class="load_action_button"><p>Click to<br>Load<br>Panorama<p></div>
            <div class="magnification_controls controls">
                <div class="magnify_in icon_button control"></div>
                <div class="magnify_out icon_button control"></div>
            </div>
            <div class="full_window_toggle icon_button full_window_toggle_inactive controls control"></div>
        </div>
        <div class="direction_indicator controls control"></div>
    `;

    mainDisplayElement.innerHTML = uiMarkup;
    mainDisplayElement.classList.add('main_viewer_container');

    const uiElements = {
        creditBanner: mainDisplayElement.querySelector('.credit_banner'),
        visualsFrame: mainDisplayElement.querySelector('.visuals_frame'),
        motionAnchor: mainDisplayElement.querySelector('.motion_anchor'),
        statusInterface: {
            container: mainDisplayElement.querySelector('.status_interface'),
            details: {
                container: mainDisplayElement.querySelector('.panorama_details'),
                heading: mainDisplayElement.querySelector('.heading_box'),
                creator: mainDisplayElement.querySelector('.creator_box')
            },
            progress: {
                box: mainDisplayElement.querySelector('.progress_section'),
                spinner: mainDisplayElement.querySelector('.spinner_box'),
                bar: mainDisplayElement.querySelector('.progress_bar'),
                fill: mainDisplayElement.querySelector('.progress_fill'),
                message: mainDisplayElement.querySelector('.progress_message')
            },
            errorMessage: mainDisplayElement.querySelector('.error_message_display')
        },
        userInteractionElements: {
            container: mainDisplayElement.querySelector('.user_interaction_elements'),
            loadButton: mainDisplayElement.querySelector('.load_action_button'),
            zoomControls: {
                container: mainDisplayElement.querySelector('.magnification_controls'),
                in: mainDisplayElement.querySelector('.magnify_in'),
                out: mainDisplayElement.querySelector('.magnify_out')
            },
            fullWindowToggle: mainDisplayElement.querySelector('.full_window_toggle')
        },
        directionIndicator: mainDisplayElement.querySelector('.direction_indicator')
    };

    document.addEventListener('contextmenu', viewerState.handleContextualMenu);
    uiElements.userInteractionElements.loadButton.addEventListener('click', viewerState.initiateView);
    uiElements.userInteractionElements.zoomControls.in.addEventListener('click', viewerState.magnifyView);
    uiElements.userInteractionElements.zoomControls.out.addEventListener('click', viewerState.minifyView);
    uiElements.userInteractionElements.fullWindowToggle.addEventListener('click', viewerState.togglePresentationMode);
    document.addEventListener('mousedown', viewerState.capturePointerDown, false);

    viewerState.paneSettings = { ...baseDisplayConfiguration };

    mainDisplayElement.classList.add('graspable');

    globalViewerRegistry.set(rootElementId, { viewerState, uiElements });

    return { viewerState, uiElements };
}

initializeDisplaySystem('container');