"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.looksLike = void 0;
const isPrimitive = (val) => {
    return val === null || /^[sbn]/.test(typeof val);
};
exports.looksLike = (node, patternObj) => {
    return (node &&
        patternObj &&
        Object.keys(patternObj).every((bKey) => {
            const patternVal = patternObj[bKey];
            const nodeVal = node[bKey];
            if (typeof patternVal === "function") {
                return patternVal(nodeVal);
            }
            else {
                return isPrimitive(patternVal)
                    ? patternVal === nodeVal
                    : exports.looksLike(nodeVal, patternVal);
            }
        }));
};
