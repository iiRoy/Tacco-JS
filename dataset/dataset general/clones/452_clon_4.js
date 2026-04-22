class ArcPresenter {
    constructor(renderContext, configuration) {
        this.renderContext = renderContext;
        this.config = configuration;
        this.currentData = { description: '', completion: 0 };
        this.render();
    }

    displayState(updatedData) {
        if (updatedData && (updatedData.description !== this.currentData.description || updatedData.completion !== this.currentData.completion)) {
            this.currentData = {
                description: updatedData.description !== undefined ? String(updatedData.description) : this.currentData.description,
                completion: typeof updatedData.completion === 'number' ? Math.max(0, Math.min(1, updatedData.completion)) : this.currentData.completion
            };
            this.render();
        }
    }

    render() {
        const cfg = this.config;
        const ctx = this.renderContext;
        const data = this.currentData;

        ctx.clearRect(0, 0, cfg.visualWidth, cfg.visualHeight);

        const centerH = cfg.visualWidth / 2;
        const centerV = cfg.visualHeight / 2;

        ctx.beginPath();
        ctx.arc(centerH, centerV, cfg.outerArcRadius, 0, Math.PI * 2, false);
        ctx.lineWidth = cfg.outerBandThickness;
        ctx.strokeStyle = cfg.outerBandBackgroundShade;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerH, centerV, cfg.innerArcRadius, 0, Math.PI * 2, false);
        ctx.lineWidth = cfg.innerBandThickness;
        ctx.strokeStyle = cfg.innerBandShade;
        ctx.stroke();

        ctx.font = cfg.textStyle;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = cfg.textHue;
        ctx.fillText(data.description, centerH, centerV);

        if (data.completion > 0) {
            const initialAngle = - (Math.PI / 2);
            const finalAngle = ((Math.PI * 2 ) * data.completion) - (Math.PI / 2);
            ctx.beginPath();
            ctx.arc(centerH, centerV, cfg.outerArcRadius, initialAngle, finalAngle, false);
            ctx.lineWidth = cfg.outerBandThickness;
            ctx.strokeStyle = cfg.outerBandForegroundTint;
            ctx.stroke();
        }
    }
}

function establishVisualizer(hostElement) {
    if (!(hostElement instanceof HTMLElement)) {
        return null;
    }

    const getAttributeValue = (attrSuffix, defaultValue) => {
        return hostElement.getAttribute(`data-visual-${attrSuffix}`) || defaultValue;
    };

    const configuration = {
        visualWidth: parseInt(getAttributeValue('width', '400'), 10),
        visualHeight: parseInt(getAttributeValue('height', '400'), 10),
        outerBandThickness: parseInt(getAttributeValue('outer-band-thickness', '20'), 10),
        innerBandThickness: parseInt(getAttributeValue('inner-band-thickness', '5'), 10),
        outerBandBackgroundShade: getAttributeValue('outer-band-background-shade', '#505769'),
        outerBandForegroundTint: getAttributeValue('outer-band-foreground-tint', '#12eeb9'),
        innerBandShade: getAttributeValue('inner-band-shade', '#505769'),
        textHue: getAttributeValue('text-hue', '#12eeb9'),
        outerArcRadius: parseInt(getAttributeValue('outer-arc-radius', '100'), 10),
        innerArcRadius: parseInt(getAttributeValue('inner-arc-radius', '70'), 10),
        textStyle: getAttributeValue('text-style', '50pt Calibri'),
        dataKey: getAttributeValue('data-key', null)
    };

    const drawingSurface = document.createElement('canvas');
    drawingSurface.setAttribute('width', configuration.visualWidth);
    drawingSurface.setAttribute('height', configuration.visualHeight);

    if (configuration.dataKey) {
        drawingSurface.setAttribute('data-visual-data-key', configuration.dataKey);
    }

    hostElement.parentNode.replaceChild(drawingSurface, hostElement);

    const renderContext = drawingSurface.getContext('2d');
    return new ArcPresenter(renderContext, configuration);
}