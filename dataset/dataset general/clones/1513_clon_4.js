const GlobalTimekeeperSettings = {
    updateFrequencyMs: 1000,
    slowUpdateFrequencyMs: 15000,
    displayBaseSize: 85,
    drawingReferenceSize: 100,
    defaultVisualScheme: "metroStyle",
    showAmPmIndicator: true,
    activeDisplays: {},
    nextIdCounter: 0,

    visualSchemes: {
        metroStyle: {
            rim: { width: 2, extent: 95, hue: "black", transparency: 1 },
            minorMark: { width: 2, startFrom: 88, endAt: 92, hue: "black", transparency: 1 },
            majorMark: { width: 4, startFrom: 79, endAt: 92, hue: "black", transparency: 1 },
            hourPointer: { width: 8, startFrom: -15, endAt: 50, hue: "black", transparency: 1 },
            minutePointer: { width: 7, startFrom: -15, endAt: 75, hue: "black", transparency: 1 },
            secondPointer: { width: 1, startFrom: -20, endAt: 85, hue: "red", transparency: 1 },
            secondDetail: { width: 1, startFrom: 70, shapeRadius: 4, fillHue: "red", hue: "red", transparency: 1 }
        },
        boldMetro: {
            rim: { width: 4, extent: 97, hue: "black", transparency: 1 },
            minorMark: { width: 4, startFrom: 89, endAt: 93, hue: "black", transparency: 1 },
            majorMark: { width: 8, startFrom: 80, endAt: 93, hue: "black", transparency: 1 },
            hourPointer: { width: 12, startFrom: -15, endAt: 60, hue: "black", transparency: 1 },
            minutePointer: { width: 10, startFrom: -15, endAt: 85, hue: "black", transparency: 1 },
            secondPointer: { width: 4, startFrom: -20, endAt: 85, hue: "red", transparency: 1 },
            secondDetail: { width: 2, startFrom: 70, shapeRadius: 8, fillHue: "red", hue: "red", transparency: 1 }
        },
        boldMetroInverse: {
            rim: { width: 4, extent: 97, hue: "white", transparency: 1 },
            minorMark: { width: 4, startFrom: 89, endAt: 93, hue: "white", transparency: 1 },
            majorMark: { width: 8, startFrom: 80, endAt: 93, hue: "white", transparency: 1 },
            hourPointer: { width: 12, startFrom: -15, endAt: 60, hue: "white", transparency: 1 },
            minutePointer: { width: 10, startFrom: -15, endAt: 85, hue: "white", transparency: 1 },
            secondPointer: { width: 4, startFrom: -20, endAt: 85, hue: "red", transparency: 1 },
            secondDetail: { width: 2, startFrom: 70, shapeRadius: 8, fillHue: "red", hue: "red", transparency: 1 }
        }
    },

    isLegacyCanvas: !!window.G_vmlCanvasManager
};

const padForDisplay = (val) => (val < 10 ? '0' : '') + val;

class TimeKeeper {
    constructor(configData) {
        this.displayId = configData.displayId;
        this.visualScheme = GlobalTimekeeperSettings.visualSchemes[configData.visualSchemeKey || GlobalTimekeeperSettings.defaultVisualScheme];
        this.faceSize = configData.faceSize || GlobalTimekeeperSettings.displayBaseSize;
        this.displaySeconds = typeof configData.displaySeconds === "boolean" ? configData.displaySeconds : true;
        this.timeZoneCorrection = (configData.timeZoneCorrection != null && configData.timeZoneCorrection !== '') ? parseFloat(configData.timeZoneCorrection) : null;
        this.displayNumeric = typeof configData.displayNumeric === "boolean" ? configData.displayNumeric : false;
        this.logarithmicSeconds = typeof configData.logarithmicSeconds === "boolean" ? configData.logarithmicSeconds : false;
        this.invertedLogarithmicSeconds = typeof configData.invertedLogarithmicSeconds === "boolean" ? configData.invertedLogarithmicSeconds : false;

        this.updateInterval = this.displaySeconds ? GlobalTimekeeperSettings.updateFrequencyMs : GlobalTimekeeperSettings.slowUpdateFrequencyMs;

        this.graphicSurface = document.getElementById(this.displayId);
        if (!this.graphicSurface || !(this.graphicSurface instanceof HTMLCanvasElement)) {
            console.error(`TimeKeeper: Canvas element with ID '${this.displayId}' not found or is not a canvas.`);
            return;
        }

        const effectiveSize = this.faceSize * 2;
        this.graphicSurface.setAttribute("width", effectiveSize);
        this.graphicSurface.setAttribute("height", effectiveSize);
        this.graphicSurface.style.width = effectiveSize + "px";
        this.graphicSurface.style.height = effectiveSize + "px";

        this.renderScaleFactor = this.faceSize / GlobalTimekeeperSettings.drawingReferenceSize;

        this.drawingContext = this.graphicSurface.getContext("2d");
        this.drawingContext.scale(this.renderScaleFactor, this.renderScaleFactor);

        GlobalTimekeeperSettings.activeDisplays[this.displayId] = this;

        this.performUpdate();
    }

    _drawCircle(xCoord, yCoord, style) {
        this.drawingContext.save();
        this.drawingContext.globalAlpha = style.transparency;
        this.drawingContext.lineWidth = style.width;

        if (!GlobalTimekeeperSettings.isLegacyCanvas) {
            this.drawingContext.beginPath();
        }

        if (GlobalTimekeeperSettings.isLegacyCanvas) {
            this.drawingContext.lineWidth = this.drawingContext.lineWidth * this.renderScaleFactor;
        }

        this.drawingContext.arc(xCoord, yCoord, style.extent || style.shapeRadius, 0, 2 * Math.PI, false);

        if (GlobalTimekeeperSettings.isLegacyCanvas) {
            this.drawingContext.arc(xCoord, yCoord, style.extent || style.shapeRadius, -0.1, 0.1, false);
        }

        if (style.fillHue) {
            this.drawingContext.fillStyle = style.fillHue;
            this.drawingContext.fill();
        } else {
            this.drawingContext.strokeStyle = style.hue;
            this.drawingContext.stroke();
        }
        this.drawingContext.restore();
    }

    _placeText(content, xCoord, yCoord) {
        this.drawingContext.save();
        this.drawingContext.font = '15px sans-serif';
        const textMetrics = this.drawingContext.measureText(content);
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent || 15;
        this.drawingContext.fillText(content, xCoord - textMetrics.width / 2, yCoord + textHeight / 2);
        this.drawingContext.restore();
    }

    _calculateRotation(timeUnitFraction) {
        const adjustmentFactor = 3;
        if (this.logarithmicSeconds) {
            return timeUnitFraction === 0 ? 0 : (Math.log(timeUnitFraction * adjustmentFactor) / Math.log(60 * adjustmentFactor));
        } else if (this.invertedLogarithmicSeconds) {
            const adjustedFraction = (60 - timeUnitFraction) % 60;
            return 1.0 - (adjustedFraction === 0 ? 0 : (Math.log(adjustedFraction * adjustmentFactor) / Math.log(60 * adjustmentFactor)));
        } else {
            return timeUnitFraction / 60.0;
        }
    }

    _composeTimeCaption(hourVal, minuteVal, secondVal) {
        const isAmPm = GlobalTimekeeperSettings.showAmPmIndicator;
        let displayHour = hourVal;
        let suffix = '';

        if (isAmPm) {
            suffix = hourVal < 12 ? ' am' : ' pm';
            displayHour = (hourVal % 12) === 0 ? 12 : (hourVal % 12);
        }

        let caption = `${displayHour}:${padForDisplay(minuteVal)}`;
        if (this.displaySeconds) {
            caption += `:${padForDisplay(secondVal)}`;
        }
        return caption + suffix;
    }

    _drawRadialComponent(angleProgress, componentStyle) {
        this.drawingContext.save();
        this.drawingContext.translate(GlobalTimekeeperSettings.drawingReferenceSize, GlobalTimekeeperSettings.drawingReferenceSize);
        this.drawingContext.rotate(Math.PI * (2.0 * angleProgress - 0.5));
        this.drawingContext.globalAlpha = componentStyle.transparency;
        this.drawingContext.strokeStyle = componentStyle.hue;
        this.drawingContext.lineWidth = componentStyle.width;

        if (GlobalTimekeeperSettings.isLegacyCanvas) {
            this.drawingContext.lineWidth = this.drawingContext.lineWidth * this.renderScaleFactor;
        }

        if (componentStyle.shapeRadius) {
            this._drawCircle(componentStyle.startFrom, 0, componentStyle);
        } else {
            this.drawingContext.beginPath();
            this.drawingContext.moveTo(componentStyle.startFrom, 0);
            this.drawingContext.lineTo(componentStyle.endAt, 0);
            this.drawingContext.stroke();
        }
        this.drawingContext.restore();
    }

    _drawFaceComponents(currentHour, currentMinute, currentSecond) {
        const activeScheme = this.visualScheme;

        this.drawingContext.clearRect(0, 0, GlobalTimekeeperSettings.drawingReferenceSize * 2, GlobalTimekeeperSettings.drawingReferenceSize * 2);

        if (activeScheme.rim) {
            this._drawCircle(GlobalTimekeeperSettings.drawingReferenceSize, GlobalTimekeeperSettings.drawingReferenceSize, activeScheme.rim);
        }

        Array.from({ length: 60 }).forEach((_, i) => {
            const rotationValue = this._calculateRotation(i);
            if (i % 5 !== 0 && activeScheme.minorMark) {
                this._drawRadialComponent(rotationValue, activeScheme.minorMark);
            } else if (i % 5 === 0 && activeScheme.majorMark) {
                this._drawRadialComponent(rotationValue, activeScheme.majorMark);
            }
        });

        if (this.displayNumeric) {
            this._placeText(
                this._composeTimeCaption(currentHour, currentMinute, currentSecond),
                GlobalTimekeeperSettings.drawingReferenceSize,
                GlobalTimekeeperSettings.drawingReferenceSize + this.faceSize / 2
            );
        }

        if (activeScheme.hourPointer) {
            const hourRotation = this._calculateRotation(((currentHour % 12) * 5) + (currentMinute / 12.0));
            this._drawRadialComponent(hourRotation, activeScheme.hourPointer);
        }

        if (activeScheme.minutePointer) {
            const minuteRotation = this._calculateRotation(currentMinute + (currentSecond / 60.0));
            this._drawRadialComponent(minuteRotation, activeScheme.minutePointer);
        }

        if (this.displaySeconds && activeScheme.secondPointer) {
            const secondRotation = this._calculateRotation(currentSecond);
            this._drawRadialComponent(secondRotation, activeScheme.secondPointer);
        }

        if (!GlobalTimekeeperSettings.isLegacyCanvas && this.displaySeconds && activeScheme.secondDetail) {
            const secondRotation = this._calculateRotation(currentSecond);
            this._drawRadialComponent(secondRotation, activeScheme.secondDetail);
        }
    }

    _fetchCurrentTime() {
        const moment = new Date();
        let hour, minute, second;

        if (this.timeZoneCorrection != null) {
            const adjustedMoment = new Date(moment.valueOf() + (this.timeZoneCorrection * 1000 * 60 * 60));
            hour = adjustedMoment.getUTCHours();
            minute = adjustedMoment.getUTCMinutes();
            second = adjustedMoment.getUTCSeconds();
        } else {
            hour = moment.getHours();
            minute = moment.getMinutes();
            second = moment.getSeconds();
        }
        return { hour, minute, second };
    }

    _scheduleNext() {
        setTimeout(() => {
            if (this._checkExistence()) {
                this.performUpdate();
            }
        }, this.updateInterval);
    }

    _checkExistence() {
        return document.getElementById(this.displayId) !== null;
    }

    performUpdate() {
        const { hour, minute, second } = this._fetchCurrentTime();
        this._drawFaceComponents(hour, minute, second);
        this._scheduleNext();
    }
}

const locateAndActivateTimekeepers = () => {
    const potentialDisplays = document.querySelectorAll("canvas");
    potentialDisplays.forEach(displayElement => {
        const classNames = displayElement.className.split(" ");
        const timekeeperClass = classNames.find(name => name.startsWith("Timekeeper:"));

        if (timekeeperClass) {
            const parameters = timekeeperClass.split(":");
            if (parameters[0] === "Timekeeper") {
                if (!displayElement.id) {
                    displayElement.id = `_tk_auto_id_${GlobalTimekeeperSettings.nextIdCounter++}`;
                }

                const configOptions = {
                    displayId: displayElement.id,
                    visualSchemeKey: parameters[1],
                    faceSize: parameters[2] ? parseInt(parameters[2], 10) : undefined,
                    displaySeconds: parameters[3] !== 'noSeconds',
                    timeZoneCorrection: parameters[4],
                    displayNumeric: parameters[5] === 'showDigital',
                    logarithmicSeconds: parameters[6] === 'logClock',
                    invertedLogarithmicSeconds: parameters[6] === 'logClockRev'
                };
                new TimeKeeper(configOptions);
            }
        }
    });
};

if (window.jQuery) {
    jQuery(document).ready(locateAndActivateTimekeepers);
} else {
    document.addEventListener('DOMContentLoaded', locateAndActivateTimekeepers);
}

window.TimeKeeper = TimeKeeper;
window.GlobalTimekeeperSettings = GlobalTimekeeperSettings;
window.locateAndActivateTimekeepers = locateAndActivateTimekeepers;