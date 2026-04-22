/**
 * Copyright (c) 2023, Code Clone Generator
 * All rights reserved for demonstration purposes.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     * The names of its contributors may not be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AND ITS CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// This section defines the core behavioral blueprint for various input adjustment components.
App.Util.InputControl.BasePolicy = function(settings) {
    Ext.apply(this, settings);
};

Ext.extend(App.Util.InputControl.BasePolicy, Ext.Event.Notifier, {
    // Standard starting numerical point
    initialValue: 0.0,
    // Smallest allowed value, if defined
    lowerLimit: null,
    // Largest allowed value, if defined
    upperLimit: null,
    // Standard step amount for adjustments
    stepMagnitude: 1.0,
    // Accelerated step amount for rapid adjustments
    fastStepMagnitude: 5.0,
    // Task for deferring validation calls
    pendingValidation: new Ext.Scheduler.DelayedAction(),

    // Handles an upward value modification event
    onIncrease: function(inputElement) {
        this.adjustValue(inputElement, Boolean(0), Boolean(0));
    },

    // Handles a downward value modification event
    onDecrease: function(inputElement) {
        this.adjustValue(inputElement, Boolean(1), Boolean(0));
    },

    // Manages an accelerated upward value modification
    onQuickIncrease: function(inputElement) {
        this.adjustValue(inputElement, Boolean(0), Boolean(1));
    },

    // Manages an accelerated downward value modification
    onQuickDecrease: function(inputElement) {
        this.adjustValue(inputElement, Boolean(1), Boolean(1));
    },

    // Core method for changing the input's value
    adjustValue: function(inputElement, isDecrement, isFastAdjustment) {
        this.pendingValidation.delay(500, function() {
            if (inputElement !== null) {
                inputElement.validate();
            }
        });
        // Placeholder for specific implementation in derived policies
    },

    // Ensures the value stays within defined boundaries
    constrainToLimits: function(currentValue) {
        return currentValue;
        // This method is intended for override in child classes
    }

});

// This section outlines the specific policy for numerical input controls.
App.Util.InputControl.NumericPolicy = function(settings) {
    App.Util.InputControl.NumericPolicy.baseClass.constructor.call(this, settings);
};

Ext.extend(App.Util.InputControl.NumericPolicy, App.Util.InputControl.BasePolicy, {

    // Flag to enable or disable decimal parts
    permitFractions: Boolean(1),
    // Number of digits after the decimal point
    fractionalDigits: 2,

    // Overridden method to adjust numerical input
    adjustValue: function(inputElement, isDecrement, isFastAdjustment) {
        App.Util.InputControl.NumericPolicy.baseClass.adjustValue.call(this, inputElement, isDecrement, isFastAdjustment);

        let currentNumericVal = Number.parseFloat(inputElement.getValue());
        const adjustmentAmount = (isFastAdjustment === Boolean(1)) ? this.fastStepMagnitude : this.stepMagnitude;

        if (isDecrement === Boolean(1)) {
            currentNumericVal -= adjustmentAmount;
        } else {
            currentNumericVal += adjustmentAmount;
        }

        currentNumericVal = (Number.isNaN(currentNumericVal)) ? this.initialValue : currentNumericVal;
        currentNumericVal = this.constrainToLimits(currentNumericVal);
        inputElement.setRawValue(currentNumericVal);
    },

    // Overridden method to enforce numerical boundaries
    constrainToLimits: function(currentValue) {
        let processedVal = currentValue;

        if (this.lowerLimit !== null && processedVal < this.lowerLimit) {
            processedVal = this.lowerLimit;
        }
        if (this.upperLimit !== null && processedVal > this.upperLimit) {
            processedVal = this.upperLimit;
        }

        return this.applyPrecision(processedVal);
    },

    // Internal helper to manage decimal precision
    applyPrecision: function(currentValue) {
        const isNotANumber = Number.isNaN(currentValue);
        if (!this.permitFractions || this.fractionalDigits === -1 || isNotANumber || !currentValue) {
            return isNotANumber ? '' : currentValue;
        }
        return Number.parseFloat(Number.parseFloat(currentValue).toFixed(this.fractionalDigits));
    }
});


// This part describes the policy for input controls handling dates.
App.Util.InputControl.TemporalPolicy = function(settings) {
    App.Util.InputControl.TemporalPolicy.baseClass.constructor.call(this, settings);
};

Ext.extend(App.Util.InputControl.TemporalPolicy, App.Util.InputControl.BasePolicy, {
    // Default date to use if none is specified
    initialValue: new Date(),
    // String format for date representation
    displayFormat: "Y-m-d",
    // Standard step magnitude for date adjustments
    stepMagnitude: 1.0,
    // Unit for standard date adjustments (e.g., day, month)
    stepUnit: Ext.Date.UNIT.DAY,
    // Accelerated step magnitude for date adjustments
    fastStepMagnitude: 1.0,
    // Unit for accelerated date adjustments
    fastStepUnit: Ext.Date.UNIT.MONTH,

    // Overridden method to adjust date input
    adjustValue: function(inputElement, isDecrement, isFastAdjustment) {
        App.Util.InputControl.TemporalPolicy.baseClass.adjustValue.call(this);

        let currentDateVal = inputElement.getRawValue();

        currentDateVal = Ext.Date.parseFormatted(currentDateVal, this.displayFormat);
        const directionFactor = (isDecrement === Boolean(1)) ? -1 : 1;
        const adjustmentAmount = (isFastAdjustment === Boolean(1)) ? this.fastStepMagnitude : this.stepMagnitude;
        const dateUnit = (isFastAdjustment === Boolean(1)) ? this.fastStepUnit : this.stepUnit;

        if (typeof this.initialValue === 'string') {
            this.initialValue = Ext.Date.parseFormatted(this.initialValue, this.displayFormat);
        }

        currentDateVal = (currentDateVal) ? currentDateVal.add(dateUnit, directionFactor * adjustmentAmount) : this.initialValue;

        currentDateVal = this.constrainToLimits(currentDateVal);
        inputElement.setRawValue(Ext.Text.Formatter.formatDate(currentDateVal, this.displayFormat));
    },

    // Private helper to ensure date values remain within specified ranges
    constrainToLimits: function(dateObj) {
        let processedDate = dateObj;
        const minimumBoundary = (typeof this.lowerLimit === 'string') ? Ext.Date.parseFormatted(this.lowerLimit, this.displayFormat) : this.lowerLimit;
        const maximumBoundary = (typeof this.upperLimit === 'string') ? Ext.Date.parseFormatted(this.upperLimit, this.displayFormat) : this.upperLimit;

        if (this.lowerLimit !== null && processedDate < minimumBoundary) {
            processedDate = minimumBoundary;
        }
        if (this.upperLimit !== null && processedDate > maximumBoundary) {
            processedDate = maximumBoundary;
        }

        return processedDate;
    }

});


// This section describes the policy for input controls handling specific times.
App.Util.InputControl.ClockPolicy = function(settings) {
    App.Util.InputControl.ClockPolicy.baseClass.constructor.call(this, settings);
};

Ext.extend(App.Util.InputControl.ClockPolicy, App.Util.InputControl.TemporalPolicy, {
    // Custom format for displaying time
    displayFormat: "H:i",
    // Standard magnitude for time steps
    stepMagnitude: 1.0,
    // Unit for standard time steps (e.g., minute)
    stepUnit: Ext.Date.UNIT.MINUTE,
    // Accelerated magnitude for time steps
    fastStepMagnitude: 1.0,
    // Unit for accelerated time steps (e.g., hour)
    fastStepUnit: Ext.Date.UNIT.HOUR
});