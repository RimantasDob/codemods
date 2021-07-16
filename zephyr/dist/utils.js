"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNestedObject = exports.looksLike = void 0;
const isPrimitive = (val) => {
    return val === null || /^[sbn]/.test(typeof val);
};
const looksLike = (node, patternObj) => {
    return (node &&
        patternObj &&
        Object.keys(patternObj).every((bKey) => {
            const patternVal = patternObj[bKey];
            const nodeVal = node[bKey];
            if (typeof patternVal === 'function') {
                return patternVal(nodeVal);
            }
            else {
                return isPrimitive(patternVal)
                    ? patternVal === nodeVal
                    : exports.looksLike(nodeVal, patternVal);
            }
        }));
};
exports.looksLike = looksLike;
const nestObject = (obj, keyPath) => {
    if (keyPath.length === 0) {
        return obj;
    }
    const [key, ...other] = keyPath;
    const object = { [key]: obj };
    return nestObject(object, other);
};
const createNestedObject = (obj, keyPath, value) => {
    const [key, ...other] = keyPath;
    obj[key] = value;
    return nestObject(obj, other);
};
exports.createNestedObject = createNestedObject;
