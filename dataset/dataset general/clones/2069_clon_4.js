function quadraticEaseOut(progress) {
    return progress * (2 - progress);
}

function combineProperties(defaults, custom) {
    const result = {};
    for (const key in defaults) {
        result[key] = defaults[key];
    }
    for (const key in custom) {
        if (Object.prototype.hasOwnProperty.call(custom, key) && custom[key] !== undefined) {
            result[key] = custom[key];
        }
    }
    return result;
}

class ItemSetAnimator {
    constructor(collectionQuery, customSettings) {
        this.collectionQuery = collectionQuery;
        this.domItems = Array.from(document.querySelectorAll(collectionQuery));

        this.defaultSettings = {
            onSectionEngage: () => {},
            onSectionDisengage: () => {},
            onSectionSelect: () => {},
            onSectionDeselect: () => {},
            activeSectionWidth: 200,
            animationCurve: quadraticEaseOut,
            animationDuration: 400,
            initialActiveSection: null,
            sectionSpacing: 0
        };

        this.currentSettings = combineProperties(this.defaultSettings, customSettings);

        this.widthMeasurements = {};
        this.widthMeasurements.baseClosed = parseInt(window.getComputedStyle(this.domItems[0]).width, 10);
        this.widthMeasurements.baseActive = this.currentSettings.activeSectionWidth;

        this.widthMeasurements.baseInactive = Math.round(
            ((this.widthMeasurements.baseClosed * this.domItems.length) -
             (this.widthMeasurements.baseActive + this.currentSettings.sectionSpacing)) /
            (this.domItems.length - 1)
        );

        this.currentActiveIndex = this.currentSettings.initialActiveSection;
        this.animationInProgress = false;

        this.attachInteractions();

        if (this.currentActiveIndex !== null) {
            if (typeof this.currentActiveIndex === 'number') {
                this.updateSectionLayout(this.currentActiveIndex);
            } else if (typeof this.currentActiveIndex === 'string') {
                const initialId = this.currentActiveIndex;
                const foundIndex = this.domItems.findIndex(item => item.id === initialId);
                if (foundIndex !== -1) {
                    this.currentActiveIndex = foundIndex;
                    this.updateSectionLayout(this.currentActiveIndex);
                } else {
                    this.currentActiveIndex = null;
                }
            }
        }
    }

    attachInteractions() {
        this.domItems.forEach((item, idx) => {
            item.addEventListener('mouseenter', (evt) => this.handleSectionEnter(evt, idx, item));
            item.addEventListener('mouseleave', (evt) => this.handleSectionLeave(evt, idx, item));
            item.addEventListener('click', (evt) => this.handleSectionClick(evt, idx, item));
        });
    }

    handleSectionEnter(event, index, element) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.animationInProgress) {
            this.updateSectionLayout(index);
            this.currentSettings.onSectionEngage(element, index);
        }
    }

    handleSectionLeave(event, index, element) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.animationInProgress) {
            this.updateSectionLayout(this.currentActiveIndex);
            this.currentSettings.onSectionDisengage(element, index);
        }
    }

    handleSectionClick(event, index, element) {
        if (this.currentSettings.onSectionSelect || this.currentSettings.onSectionDeselect) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.currentActiveIndex === index) {
            this.currentActiveIndex = null;
            this.updateSectionLayout(null);
            this.currentSettings.onSectionDeselect(element.href || null, index);
        } else {
            this.currentActiveIndex = index;
            this.updateSectionLayout(index);
            this.currentSettings.onSectionSelect(element.href || null, index);
        }
    }

    updateSectionLayout(targetSectionIndex) {
        this.animationInProgress = true;
        const targetWidthsMap = {};
        let defaultWidth;

        if (typeof targetSectionIndex === 'number') {
            defaultWidth = this.widthMeasurements.baseInactive;
            if (targetSectionIndex + 1 === this.domItems.length) {
                defaultWidth += this.currentSettings.sectionSpacing;
            }
        } else {
            defaultWidth = this.widthMeasurements.baseClosed;
        }

        this.domItems.forEach((item, idx) => {
            let itemTargetWidth = defaultWidth;
            if (idx === this.domItems.length - 1) {
                itemTargetWidth += 5;
            }
            targetWidthsMap[idx] = itemTargetWidth;
        });

        if (typeof targetSectionIndex === 'number') {
            targetWidthsMap[targetSectionIndex] = this.widthMeasurements.baseActive;
        }

        this.animateGroup(targetWidthsMap);
    }

    animateGroup(targetWidthsMap) {
        const startTimestamp = performance.now();
        const initialWidths = this.domItems.map(item => parseInt(window.getComputedStyle(item).width, 10));
        const duration = this.currentSettings.animationDuration;
        const easing = this.currentSettings.animationCurve;

        const animateFrame = (currentTime) => {
            const elapsed = currentTime - startTimestamp;
            let progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);

            this.domItems.forEach((item, idx) => {
                const current = initialWidths[idx];
                const target = targetWidthsMap[idx];
                const newWidth = current + (target - current) * easedProgress;
                item.style.width = `${newWidth}px`;
            });

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                this.animationInProgress = false;
                this.domItems.forEach((item, idx) => {
                    item.style.width = `${targetWidthsMap[idx]}px`;
                });
            }
        };
        requestAnimationFrame(animateFrame);
    }
}