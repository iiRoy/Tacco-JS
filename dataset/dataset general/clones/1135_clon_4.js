!function(factoryProducer){
  if(typeof exports==="object" && typeof module!=="undefined")module.exports=factoryProducer();
  else if(typeof define==="function" && define.amd)define([],factoryProducer);
  else{
    var globalReference;
    if(typeof window!=="undefined"){
      globalReference=window;
    } else if(typeof global!=="undefined"){
      globalReference=global;
    } else if(typeof self!=="undefined"){
      globalReference=self;
    }
    globalReference.BinaryProcessor=factoryProducer();
  }
}(function(){
  var internalDefine, internalModule, internalExports;

  return (function moduleLocator(definitionsMap, loadedModulesCache, entryPoints){
    function obtainModule(moduleKey, preventLoad){
      if(!loadedModulesCache[moduleKey]){
        if(!definitionsMap[moduleKey]){
          var nodeNativeRequire = typeof require==="function" && require;
          if(!preventLoad && nodeNativeRequire)return nodeNativeRequire(moduleKey,true);
          var browserNativeRequire = typeof require==="function" && require;
          if(browserNativeRequire)return browserNativeRequire(moduleKey,true);
          throw new Error("Cannot locate processing unit '"+moduleKey+"'");
        }
        var currentModuleEntry = loadedModulesCache[moduleKey]={exports:{}};
        definitionsMap[moduleKey][0].call(currentModuleEntry.exports,function(dependencyAlias){
          var resolvedDependencyKey = definitionsMap[moduleKey][1][dependencyAlias];
          return obtainModule(resolvedDependencyKey?resolvedDependencyKey:dependencyAlias);
        },currentModuleEntry,currentModuleEntry.exports,moduleLocator,definitionsMap,loadedModulesCache,entryPoints);
      }
      return loadedModulesCache[moduleKey].exports;
    }
    var fallbackRequireForEntries = typeof require==="function" && require;
    for(var i=0;i<entryPoints.length;i++)obtainModule(entryPoints[i]);
    return obtainModule;
  })({
    '1': [function(getDependency, currentModule, currentExports){
      const BitSlicerClass = getDependency('2');
      currentExports.BitSlicer = BitSlicerClass;
    }, {'2': '2'}],

    '2': [function(getDependency, currentModule, currentExports){
      const DataFeeder = (function(){
        function DataFeederInstance(byteCollection) {
          if (!(byteCollection instanceof Uint8Array)) {
            this.internalByteSequence = new Uint8Array(byteCollection);
          } else {
            this.internalByteSequence = byteCollection;
          }
          this.currentByteIndex = 0;
        }

        DataFeederInstance.prototype.createCopy = function() {
          const freshInstance = new DataFeederInstance(this.internalByteSequence);
          freshInstance.currentByteIndex = this.currentByteIndex;
          return freshInstance;
        };

        DataFeederInstance.prototype.hasEnoughBytes = function(requiredUnits) {
          return (this.internalByteSequence.length - this.currentByteIndex) >= requiredUnits;
        };

        DataFeederInstance.prototype.advanceBytes = function(unitCount) {
          this.currentByteIndex += unitCount;
        };

        DataFeederInstance.prototype.rewindBytes = function(unitCount) {
          this.currentByteIndex -= unitCount;
        };

        Object.defineProperty(DataFeederInstance.prototype, 'currentBytePosition', {
          get: function() { return this.currentByteIndex; }
        });

        DataFeederInstance.prototype.peekOneByte = function(offsetFromCurrent = 0) {
          return this.internalByteSequence[this.currentByteIndex + offsetFromCurrent];
        };

        DataFeederInstance.prototype.peekTwoBytes = function(offsetFromCurrent = 0) {
          const absoluteIndex = this.currentByteIndex + offsetFromCurrent;
          return (this.internalByteSequence[absoluteIndex] << 8) | this.internalByteSequence[absoluteIndex + 1];
        };

        DataFeederInstance.prototype.peekThreeBytes = function(offsetFromCurrent = 0) {
          const absoluteIndex = this.currentByteIndex + offsetFromCurrent;
          return (this.internalByteSequence[absoluteIndex] << 16) | (this.internalByteSequence[absoluteIndex + 1] << 8) | this.internalByteSequence[absoluteIndex + 2];
        };

        DataFeederInstance.prototype.peekFourBytes = function(offsetFromCurrent = 0) {
          const absoluteIndex = this.currentByteIndex + offsetFromCurrent;
          return ((this.internalByteSequence[absoluteIndex] * 0x1000000) +
                  (this.internalByteSequence[absoluteIndex + 1] << 16) +
                  (this.internalByteSequence[absoluteIndex + 2] << 8) +
                  this.internalByteSequence[absoluteIndex + 3]) >>> 0;
        };

        return DataFeederInstance;
      })();

      const BitSlicer = (function(){
        function BitSlicerClass(feederInstance) {
          this.byteStreamFeeder = feederInstance;
          this.bitOffsetWithinByte = 0;
        }

        BitSlicerClass.prototype.createCopy = function() {
          const newSlicer = new BitSlicerClass(this.byteStreamFeeder.createCopy());
          newSlicer.bitOffsetWithinByte = this.bitOffsetWithinByte;
          return newSlicer;
        };

        BitSlicerClass.prototype.getCurrentAbsoluteBitPosition = function() {
          return (this.byteStreamFeeder.currentBytePosition * 8) + this.bitOffsetWithinByte;
        };

        BitSlicerClass.prototype.canReadBits = function(requiredBitCount) {
          return this.byteStreamFeeder.hasEnoughBytes(Math.ceil((requiredBitCount + this.bitOffsetWithinByte) / 8));
        };

        BitSlicerClass.prototype.moveBitPointer = function(bitsToShift) {
          const currentAbsolutePosition = this.getCurrentAbsoluteBitPosition();
          const targetAbsolutePosition = currentAbsolutePosition + bitsToShift;
          this.byteStreamFeeder.currentByteIndex = Math.floor(targetAbsolutePosition / 8);
          this.bitOffsetWithinByte = ((targetAbsolutePosition % 8) + 8) % 8;
        };

        BitSlicerClass.prototype.alignToNextByte = function() {
          if (this.bitOffsetWithinByte !== 0) {
            this.bitOffsetWithinByte = 0;
            this.byteStreamFeeder.advanceBytes(1);
          }
        };

        function coreBitExtraction(slicerRef, numberOfBits, interpretAsSigned, isPreviewOnly) {
          if (numberOfBits === 0) {
            return 0;
          }

          let resultAccumulator = 0;
          let remainingBitsToCollect = numberOfBits;
          let byteLookaheadIndex = 0;
          let currentBitInLookaheadByte = slicerRef.bitOffsetWithinByte;

          while (remainingBitsToCollect > 0) {
            const byteValue = slicerRef.byteStreamFeeder.peekOneByte(byteLookaheadIndex);
            if (byteValue === undefined) {
              throw new Error("Insufficient data available for bit extraction.");
            }

            const bitsAvailableInThisByte = 8 - currentBitInLookaheadByte;
            const bitsToTake = Math.min(remainingBitsToCollect, bitsAvailableInThisByte);

            const currentSegment = (byteValue >>> currentBitInLookaheadByte) & ((1 << bitsToTake) - 1);

            resultAccumulator |= (currentSegment << (numberOfBits - remainingBitsToCollect));

            remainingBitsToCollect -= bitsToTake;
            currentBitInLookaheadByte += bitsToTake;

            if (currentBitInLookaheadByte === 8) {
              currentBitInLookaheadByte = 0;
              byteLookaheadIndex++;
            }
          }

          if (interpretAsSigned) {
            if (numberOfBits < 32) {
                if (resultAccumulator >>> (numberOfBits - 1)) {
                    resultAccumulator = ((1 << numberOfBits >>> 0) - resultAccumulator) * -1;
                }
            } else {
                if (Math.floor(resultAccumulator / Math.pow(2, numberOfBits - 1))) {
                    resultAccumulator = (Math.pow(2, numberOfBits) - resultAccumulator) * -1;
                }
            }
          }

          if (!isPreviewOnly) {
            slicerRef.moveBitPointer(numberOfBits);
          }

          return resultAccumulator;
        }

        BitSlicerClass.prototype.readBits = function(bitsCount, signedInterpretation) {
          return coreBitExtraction(this, bitsCount, signedInterpretation, false);
        };

        BitSlicerClass.prototype.peekBits = function(bitsCount, signedInterpretation) {
          return coreBitExtraction(this, bitsCount, signedInterpretation, true);
        };

        return BitSlicerClass;
      })();

      currentModule.exports = BitSlicer;
    }, {}]
  })('1')
});