document.addEventListener('DOMContentLoaded', function() {

    const controlToggle = document.querySelector('.hamburger-icon');
    const visualParallaxItems = document.querySelectorAll('.has-parallax');
    const interactiveButtons = document.querySelectorAll('.follow button');
    const mainContentSlider = document.querySelector('.carousel');
    const sliderMovementControls = document.querySelectorAll('.nav');
    const audioPlayerActivator = document.querySelector('.audio .play');
    const soundSourceElement = document.querySelector('audio');
    const graphicBars = document.querySelectorAll('.bars');
    const numericalCounters = document.querySelectorAll('.count');

    if (controlToggle) {
        controlToggle.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    visualParallaxItems.forEach(function(outerContainer) {
        const innerParallaxElement = outerContainer.querySelector('.is-parallax');

        if (!innerParallaxElement) return;

        let currentParallaxAnimation = null;

        outerContainer.addEventListener('mousemove', function(event) {
            const containerRect = outerContainer.getBoundingClientRect();
            const centerHorizontal = containerRect.left + containerRect.width / 2;
            const centerVertical = containerRect.top + containerRect.height / 2;

            const displacementX = Math.floor(event.pageX - centerHorizontal);
            const displacementY = Math.floor(event.pageY - centerVertical);

            const targetTransform = `translateZ(0) translateX(${displacementX}px) translateY(${displacementY}px) scale(2)`;

            if (currentParallaxAnimation) {
                currentParallaxAnimation.cancel();
            }

            // Get the current computed transform for a smooth start
            const currentComputedTransform = window.getComputedStyle(innerParallaxElement).transform;

            currentParallaxAnimation = innerParallaxElement.animate(
                [
                    { transform: currentComputedTransform },
                    { transform: targetTransform }
                ],
                {
                    duration: 400,
                    easing: 'linear',
                    fill: 'forwards'
                }
            );
        });

        outerContainer.addEventListener('mouseleave', function() {
            if (currentParallaxAnimation) {
                currentParallaxAnimation.cancel();
            }

            const currentComputedTransform = window.getComputedStyle(innerParallaxElement).transform;

            currentParallaxAnimation = innerParallaxElement.animate(
                [
                    { transform: currentComputedTransform },
                    { transform: 'translateZ(0) translateX(0) translateY(0) scale(1)' }
                ],
                {
                    duration: 1000,
                    easing: 'ease-out',
                    fill: 'forwards'
                }
            );
        });
    });

    interactiveButtons.forEach(function(targetButton) {
        targetButton.addEventListener('click', function(event) {
            event.preventDefault();

            const rippleEffectCreator = document.createElement('span');
            rippleEffectCreator.classList.add('dynamic-wave');
            
            const buttonRect = targetButton.getBoundingClientRect();
            const clickX = event.clientX - buttonRect.left;
            const clickY = event.clientY - buttonRect.top;

            const rippleDiameter = Math.max(targetButton.offsetWidth, targetButton.offsetHeight);
            
            rippleEffectCreator.style.height = `${rippleDiameter}px`;
            rippleEffectCreator.style.width = `${rippleDiameter}px`;
            rippleEffectCreator.style.top = `${clickY - (rippleDiameter / 2)}px`;
            rippleEffectCreator.style.left = `${clickX - (rippleDiameter / 2)}px`;
            
            targetButton.appendChild(rippleEffectCreator);

            setTimeout(function() {
                rippleEffectCreator.remove();
            }, 2000);
        });
    });

    if (mainContentSlider) {
        const slideTracker = mainContentSlider.querySelector('.carousel-track');
        const individualSlides = mainContentSlider.querySelectorAll('.carousel-slide');
        const totalSlides = individualSlides.length;
        let activeSlideIndex = 0;

        if (slideTracker && totalSlides > 0) {
            slideTracker.style.display = 'flex';
            slideTracker.style.width = `${totalSlides * 100}%`;
            individualSlides.forEach(slide => {
                slide.style.width = `${100 / totalSlides}%`;
                slide.style.flexShrink = '0';
            });
            slideTracker.style.transition = 'transform 300ms ease-out';

            const advanceSlider = (direction) => {
                if (direction === 'next') {
                    activeSlideIndex = (activeSlideIndex + 1) % totalSlides;
                } else {
                    activeSlideIndex = (activeSlideIndex - 1 + totalSlides) % totalSlides;
                }
                slideTracker.style.transform = `translateX(-${activeSlideIndex * (100 / totalSlides)}%)`;
            };

            sliderMovementControls.forEach(function(controlElement) {
                controlElement.addEventListener('click', function() {
                    if (this.classList.contains('next')) {
                        advanceSlider('next');
                    } else {
                        advanceSlider('prev');
                    }
                });
            });
        }
    }

    if (audioPlayerActivator && soundSourceElement) {
        audioPlayerActivator.addEventListener('click', function() {
            if (soundSourceElement.paused) {
                soundSourceElement.play();
                this.classList.remove('icon-play-arrow');
                this.classList.add('icon-pause');
            } else {
                soundSourceElement.pause();
                this.classList.remove('icon-pause');
                this.classList.add('icon-play-arrow');
            }
        });
    }

    graphicBars.forEach(function(barItem) {
        barItem.classList.add('animate');
    });

    function formatNumericalValue(val) {
        const parts = val.toFixed(2).split(".");
        const integerPart = parts[0].split("").reverse().reduce(function(accumulator, digit, index) {
            return digit + (index && !(index % 3) ? "," : "") + accumulator;
        }, "");
        return integerPart;
    }

    function initiateNumericalAnimation(elementReference, startValue, endValue, animationDurationMs) {
        let currentAnimationStart = null;

        const performAnimationStep = (currentTime) => {
            if (!currentAnimationStart) {
                currentAnimationStart = currentTime;
            }

            const elapsedDuration = currentTime - currentAnimationStart;
            const progressRatio = Math.min(elapsedDuration / animationDurationMs, 1);

            let intermediateValue = startValue + (endValue - startValue) * progressRatio;
            
            elementReference.textContent = formatNumericalValue(intermediateValue);

            if (progressRatio < 1) {
                requestAnimationFrame(performAnimationStep);
            } else {
                elementReference.textContent = formatNumericalValue(endValue);
            }
        };

        requestAnimationFrame(performAnimationStep);
    }

    numericalCounters.forEach(function(displayElement) {
        const dataStartingValue = parseFloat(displayElement.dataset.before || '0');
        const dataEndingValue = parseFloat(displayElement.dataset.count || '0');

        initiateNumericalAnimation(displayElement, dataStartingValue, dataEndingValue, 2000);
    });

});