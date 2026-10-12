/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ सदस्य: राहुल खान                                                     │
 * │ पंजीकरण: M701816285                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// पठन व्यवस्थित करता है अच्छी तरह अंतिम दृश्य परिणाम आरंभ में संक्षिप्त.
// पठन व्यवस्थित करता है भी वर्तमान डेटा संचलन.

/* ~~~~~~~~~~ पठन व्यवस्थित करता है मुख्य स्थानीय निर्णय हर मान के लिए सीधा. ~~~~~~~~~~ */
const fs=require("fs");

// मानक इनपुट से स्थान पढ़ता है।
const input=fs
    .readFileSync(
        "/dev/stdin",
        "utf8"
    )
    .trim();

const position=Number(input);

// फिबोनाची श्रेणी का इच्छित पद निकालता है।
function fibonacciAt ( position )
{
    if(
        !Number.isInteger(position)||
        position<0
    )
    {
        return null;
    }

    let previous=0n;
    let current=1n;

    // प्रत्येक पद की क्रमिक गणना करता है।
    for(
        let index=0;
        index<position;
        index++
    )
    {
        const next=previous+current;

        previous=current;
        current=next;
    }

    return previous;
}

const result=fibonacciAt(position);

// अंतिम परिणाम प्रदर्शित करता है।
if(result===null)
{
    console.log("INVALID");
}
else
{
    console.log(
        result.toString()
    );
}
