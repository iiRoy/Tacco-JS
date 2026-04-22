var DcpuAsm = require("assembler");
var DcpuProc = require("cpu");
var Check = require("assert");

class ProcessorBehaviorVerification {
    constructor() {
        // No constructor logic needed for this specific set of tests
    }

    // Helper method for running code, similar to original runOnCpu
    static executeCode(...instructions) {
        const procUnit = new DcpuProc();
        const codeBuilder = new DcpuAsm(procUnit);
        const fullProgram = [...instructions, "BRK"].join("\n");
        codeBuilder.compile(fullProgram);
        procUnit.run();
        return procUnit;
    }

    verifyAddressResolution() {
        const procUnit = new DcpuProc();

        // Simple register-based values
        const regIdentifiers = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta"];
        procUnit.set(0x0000, 4);
        regIdentifiers.forEach((regId, index) => {
            procUnit.set("pc", 0x0000);
            procUnit.set(regId, 0xF0F0 + index);

            Check.equal(procUnit.addressFor(index), regId);
            Check.equal(procUnit.addressFor(index + 8), 0xF0F0 + index);
            Check.equal(procUnit.addressFor(index + 16), 0xF0F0 + index + 4);
        });

        Check.equal(procUnit.addressFor(0x1B), "sp");
        Check.equal(procUnit.addressFor(0x1C), "pc");
        Check.equal(procUnit.addressFor(0x1D), "ex");

        // Encoded literals
        let literalCounter = -1;
        while (literalCounter < 31) {
            Check.equal(procUnit.addressFor(0x21 + literalCounter), (literalCounter & 0xffff) | DcpuProc.FLAG_LITERAL);
            literalCounter++;
        }

        // Stack operations
        // Push
        procUnit.set("sp", 0xFFFF);
        Check.equal(procUnit.addressFor(0x18, false), 0xFFFE);
        Check.equal(procUnit.get("sp"), 0xFFFE);

        // Pop
        procUnit.set("sp", 0xFFFF);
        Check.equal(procUnit.addressFor(0x18, true), 0xFFFF);
        Check.equal(procUnit.get("sp"), 0x0000);

        // Peek
        procUnit.set("sp", 0xFFFF);
        Check.equal(procUnit.addressFor(0x19), 0xFFFF);
        Check.equal(procUnit.get("sp"), 0xFFFF);

        // Pick
        procUnit.set("sp", 0xFFFF);
        procUnit.set(0x0000, 0xFFFF);
        procUnit.set("pc", 0x0000);
        Check.equal(procUnit.addressFor(0x1A), 0xFFFE);
        Check.equal(procUnit.get("sp"), 0xFFFF);

        // next-word value types
        procUnit.set(0x0000, 0x4242);
        procUnit.set("pc", 0x0000);
        Check.equal(procUnit.addressFor(0x1E), 0x4242);
        procUnit.set("pc", 0x0000);
        Check.equal(procUnit.addressFor(0x1F), 0x4242 | DcpuProc.FLAG_LITERAL);
    }

    verifyLiteralFlaggedValues() {
        const procUnit = new DcpuProc();

        // get returns unflagged value
        Check.equal(procUnit.get(0x1234 | DcpuProc.FLAG_LITERAL), 0x1234);

        // set does nothing
        procUnit.set(0x1234, 0x4242);
        procUnit.set(0x1234 | DcpuProc.FLAG_LITERAL, 0xBEEF);
        Check.equal(procUnit.get(0x1234), 0x4242);

        // storing a flagged literal stores the unflagged value
        procUnit.set(0x1234, 0x4242 | DcpuProc.FLAG_LITERAL);
        Check.equal(procUnit.get(0x1234), 0x4242);
    }

    verifyNextOperationParsing() {
        const procUnit = new DcpuProc();

        // SET [next word], next word
        procUnit.set(0x0000, 0x7FC1);
        procUnit.set(0x0001, 0x4242);
        procUnit.set(0x0002, 0xC0C0);
        procUnit.set('pc', 0x0000);

        const currentOperation = procUnit.nextInstruction();
        Check.equal(currentOperation.opcode, 1);
        Check.equal(currentOperation.a, 0x4242 | DcpuProc.FLAG_LITERAL);
        Check.equal(currentOperation.b, 0xC0C0);

        // BRK
        procUnit.set(0x0000, 0x0020);
        procUnit.set('pc', 0x0000);
        const secondOperation = procUnit.nextInstruction();
        Check.equal(secondOperation.opcode, 32);
    }

    verifyInstructionStepCount() {
        const procUnit = new DcpuProc();

        // SET A, B
        procUnit.set(0x0000, 0x0401);
        procUnit.set('pc', 0x0000);
        procUnit.nextInstruction();
        Check.equal(procUnit.get('pc'), 0x0001);

        // SET A, next word
        procUnit.set(0x0000, 0x7C01);
        procUnit.set('pc', 0x0000);
        procUnit.nextInstruction();
        Check.equal(procUnit.get('pc'), 0x0002);

        // SET next word, A
        procUnit.set(0x0000, 0x03E1);
        procUnit.set('pc', 0x0000);
        procUnit.nextInstruction();
        Check.equal(procUnit.get('pc'), 0x0002);

        // SET [next word], [next word]
        procUnit.set(0x0000, 0x7BC1);
        procUnit.set('pc', 0x0000);
        procUnit.nextInstruction();
        Check.equal(procUnit.get('pc'), 0x0003);
    }

    verifyUnassignableLiteralHandling() {
        const procUnit = new DcpuProc();

        // encoded literals
        let counter = 0x00;
        do {
            procUnit.set('pc', 0x0000);
            procUnit.set('alpha', counter + 1000);
            procUnit.set(counter + 1, 0x4242);

            // SET <literal i>, A
            procUnit.set(0x0000, 0x0001 | ((counter + 0x21) << 4));
            procUnit.step();
            Check.equal(procUnit.get(counter + 1), 0x4242);
            counter++;
        } while (counter < 0x1F);

        // next-word literal
        procUnit.set('pc', 0x0000);
        procUnit.set('alpha', 0x1234);

        // SET next word, A
        procUnit.set(0x0000, 0x7DE1);
        procUnit.set(0x0001, 0x4242);
        procUnit.step();
        Check.equal(procUnit.get(0x0001), 0x4242);
    }

    verifyOffsetWrapAround() {
        const procUnit = new DcpuProc();

        procUnit.set('pc', 0x0000);
        procUnit.set('alpha', 0x0042);
        procUnit.set(0x0042, 0x1234);

        // SET [A+0xFFFF] 0x4321;
        procUnit.set(0x0000, 0x7E01);
        procUnit.set(0x0001, 0x4321);
        procUnit.set(0x0002, 0xFFFF);
        procUnit.step();
        Check.equal(procUnit.get(0x0042), 0x1234);
        Check.equal(procUnit.get(0x0041), 0x4321);
    }

    verifyStackPopOperation() {
        const procUnit = new DcpuProc();

        procUnit.set("sp", 0xffff);
        procUnit.set(0xffff, 0x0042);

        Check.equal(procUnit.get("pop"), 0x0042);
        Check.equal(procUnit.get("sp"), 0x0000);
    }

    verifyStackPushOperation() {
        const procUnit = new DcpuProc();

        procUnit.set("push", 0x0042);

        Check.equal(procUnit.get(0xffff), 0x0042);
        Check.equal(procUnit.get("sp"), 0xffff);
    }

    verifyBreakInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("BRK");
        Check.equal(procUnit.cycle, 0);
    }

    verifySetInstructionBehavior() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 1");
        Check.equal(procUnit.get("a"), 1);
    }

    verifySetInstructionOneCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 1");
        Check.equal(procUnit.cycle, 1);
    }

    verifySetInstructionOneNextWordCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x1000");
        Check.equal(procUnit.cycle, 1 + 1);
    }

    verifySetInstructionTwoNextWordCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET [0x1000], 0x1000");
        Check.equal(procUnit.cycle, 1 + 1 + 1);
    }

    verifyAddInstructionNoOverflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 1",
            "ADD a, 2");
        Check.equal(procUnit.get("a"), 3);
        Check.equal(procUnit.get("ex"), 0);
    }

    verifyAddInstructionWithOverflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xffff",
            "ADD a, 0xffff");
        Check.equal(procUnit.get("a"), 0xfffe);
        Check.equal(procUnit.get("ex"), 1);
    }

    verifyAddInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("ADD a, 1");
        Check.equal(procUnit.cycle, 2);
    }

    verifySubInstructionNoUnderflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 2",
            "SUB a, 1");
        Check.equal(procUnit.get("a"), 1);
        Check.equal(procUnit.get("ex"), 0);
    }

    verifySubInstructionWithUnderflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 1",
            "SUB a, 2");
        Check.equal(procUnit.get("a"), 0xffff);
        Check.equal(procUnit.get("ex"), 0xffff);
    }

    verifySubInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SUB a, 1");
        Check.equal(procUnit.cycle, 2);
    }

    verifyMulInstructionNoOverflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 2",
            "MUL a, 2");
        Check.equal(procUnit.get("a"), 4);
        Check.equal(procUnit.get("ex"), 0);
    }

    verifyMulInstructionWithOverflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x8000",
            "MUL a, 0x8000");
        Check.equal(procUnit.get("a"), 0);
        Check.equal(procUnit.get("ex"), 0x4000);
    }

    verifyMulInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("MUL a, 1");
        Check.equal(procUnit.cycle, 2);
    }

    verifyMliInstructionNoUnderflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xfffe",
            "MLI a, 0xfffe");
        Check.equal(procUnit.get("a"), 4);
        Check.equal(procUnit.get("ex"), 0);
    }

    verifyMliInstructionWithUnderflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xfffe",
            "MLI a, 2");
        Check.equal(procUnit.get("a"), 0xfffc);
        Check.equal(procUnit.get("ex"), 0xffff);
    }

    verifyMliInstructionWithOverflow() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x4000",
            "MLI a, 0x10");
        Check.equal(procUnit.get("a"), 0);
        Check.equal(procUnit.get("ex"), 4);
    }

    verifyMliInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("MLI a, 1");
        Check.equal(procUnit.cycle, 2);
    }

    verifyDivInstructionByZero() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 2",
            "DIV a, 0");
        Check.equal(procUnit.get("a"), 0);
        Check.equal(procUnit.get("ex"), 0);
    }

    verifyDivInstructionByNonZero() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x8001",
            "DIV a, 2");
        Check.equal(procUnit.get("a"), 0x4000);
        Check.equal(procUnit.get("ex"), 0x8000);
    }

    verifyDivInstructionLargeNumber() {
        // 0xFFFF / 0xD == 0x13B1.27627
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xffff",
            "DIV a, 0xd");
        Check.equal(procUnit.get("a"), 0x13b1);
        Check.equal(procUnit.get("ex"), 0x2762);
    }

    verifyDivInstructionRoundedFractionalPart() {
        // 0x7FFF / 0x7F01 == 0x1.01FFFBF8
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x7fff",
            "DIV a, 0x7f01");
        Check.equal(procUnit.get("a"), 1);
        Check.equal(procUnit.get("ex"), 0x01ff);
    }

    verifyDivInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("DIV a, 1");
        Check.equal(procUnit.cycle, 3);
    }

    verifyDviInstructionByZero() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 2",
            "DVI a, 0");
        Check.equal(procUnit.get("a"), 0);
        Check.equal(procUnit.get("ex"), 0);
    }

    verifyDviInstructionByNonZero() {
        // -0x9 / -0x4 == 0x2.4
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xfff7",
            "DVI a, 0xfffc");
        Check.equal(procUnit.get("a"), 2);
        Check.equal(procUnit.get("ex"), 0x4000);
    }

    verifyDviInstructionNegativeNumberRounding() {
        // -0x7FFF / 2 == -0x3fff.8
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x8001",
            "DVI a, 0x2");
        Check.equal(procUnit.get("a"), 0xc001);
        Check.equal(procUnit.get("ex"), 0x8000);
    }

    verifyDviInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("DVI a, 1");
        Check.equal(procUnit.cycle, 3);
    }

    verifyModInstructionByZero() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 2",
            "MOD a, 0");
        Check.equal(procUnit.get("a"), 0);
    }

    verifyModInstructionByNonZero() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 7",
            "MOD a, 2");
        Check.equal(procUnit.get("a"), 1);
    }

    verifyModInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("MOD a, 1");
        Check.equal(procUnit.cycle, 3);
    }

    verifyMdiInstructionByZero() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 2",
            "MDI a, 0");
        Check.equal(procUnit.get("a"), 0);
    }

    verifyMdiInstructionByNonZero() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xfff9",
            "MDI a, 2");
        Check.equal(procUnit.get("a"), 0xffff);
    }

    verifyMdiInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("MDI a, 1");
        Check.equal(procUnit.cycle, 3);
    }

    verifyAndInstruction() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x0fff",
            "AND a, 0xffF0");
        Check.equal(procUnit.get("a"), 0x0ff0);
    }

    verifyAndInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("AND a, 1");
        Check.equal(procUnit.cycle, 1);
    }

    verifyBorInstruction() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xf000",
            "BOR a, 0x000f");
        Check.equal(procUnit.get("a"), 0xf00f);
    }

    verifyBorInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("BOR a, 1");
        Check.equal(procUnit.cycle, 1);
    }

    verifyXorInstruction() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xfff0",
            "XOR a, 0x0fff");
        Check.equal(procUnit.get("a"), 0xf00f);
    }

    verifyXorInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("XOR a, 1");
        Check.equal(procUnit.cycle, 1);
    }

    verifyShrInstruction() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xffff",
            "SHR a, 8");
        Check.equal(procUnit.get("a"), 0x00ff);
        Check.equal(procUnit.get("ex"), 0xff00);
    }

    verifyShrInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SHR a, 1");
        Check.equal(procUnit.cycle, 1);
    }

    verifyAsrInstructionPositive() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0x7fff",
            "ASR a, 8");
        Check.equal(procUnit.get("a"), 0x007f);
        Check.equal(procUnit.get("ex"), 0xff00);
    }

    verifyAsrInstructionNegative() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xffff",
            "ASR a, 8");
        Check.equal(procUnit.get("a"), 0xffff);
        Check.equal(procUnit.get("ex"), 0xff00);
    }

    verifyAsrInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("ASR a, 1");
        Check.equal(procUnit.cycle, 1);
    }

    verifyShlInstruction() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SET a, 0xffff",
            "SHL a, 8");
        Check.equal(procUnit.get("a"), 0xff00);
        Check.equal(procUnit.get("ex"), 0x00ff);
    }

    verifyShlInstructionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("SHL a, 1");
        Check.equal(procUnit.cycle, 1);
    }

    verifyIfbInstructionTrueCondition() {
        const procUnit = ProcessorBehaviorVerification.executeCode("IFB 6, 3",
            "SET x, 1");
        Check.equal(procUnit.get("x"), 1);
    }

    verifyIfbInstructionTrueConditionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("IFB 6, 3",
            "SET x, 1");
        Check.equal(procUnit.cycle, (2 + 1) + 1);
    }

    verifyIfbInstructionFalseCondition() {
        const procUnit = ProcessorBehaviorVerification.executeCode("IFB 4, 3",
            "SET x, 1");
        Check.equal(procUnit.get("x"), 0);
    }

    verifyIfbInstructionFalseConditionCycleCount() {
        const procUnit = ProcessorBehaviorVerification.executeCode("IFB 4, 3", "SET x, 1");
        Check.equal(procUnit.cycle, (2 + 1) + 1);
    }
}

const testSuiteInstance = new ProcessorBehaviorVerification();
const exportedTests = {};
for (const methodName of Object.getOwnPropertyNames(ProcessorBehaviorVerification.prototype)) {
    if (methodName.startsWith('verify') && typeof testSuiteInstance[methodName] === 'function') {
        exportedTests[methodName] = testSuiteInstance[methodName].bind(testSuiteInstance);
    }
}
module.exports = exportedTests;