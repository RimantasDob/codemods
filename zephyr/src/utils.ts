import { Rule } from 'eslint';
// eslint-disable-next-line import/no-unresolved
import { Node } from 'estree';

export type ESTreeNode = Rule.Node;
export type NodeListener = Rule.NodeListener;
export type SBN = string | boolean | number;
type FuncArgs = ESTreeNode | Node[] | SBN;
export type Func = (arg: FuncArgs) => boolean;
export interface EStreePattern {
    [x: string]: SBN | Func | EStreePattern | null;
}
const isPrimitive = (val: unknown): boolean => {
    return val === null || /^[sbn]/.test(typeof val);
};

export const looksLike = (node: ESTreeNode, patternObj: EStreePattern): boolean => {
    return (
        node &&
        patternObj &&
        Object.keys(patternObj).every((bKey: string) => {
            const patternVal = patternObj[bKey];
            const nodeVal = node[bKey as keyof typeof node];
            if (typeof patternVal === 'function') {
                return patternVal(nodeVal as FuncArgs);
            } else {
                return isPrimitive(patternVal)
                    ? patternVal === nodeVal
                    : looksLike(nodeVal as ESTreeNode, patternVal as EStreePattern);
            }
        })
    );
};

const nestObject = (obj: EStreePattern, keyPath: string[]): EStreePattern => {
    if (keyPath.length === 0) {
        return obj;
    }
    const [key, ...other] = keyPath;
    const object = { [key]: obj };
    return nestObject(object, other);
};

export const createNestedObject = (
    obj: EStreePattern,
    keyPath: string[],
    value: EStreePattern
): EStreePattern => {
    const [key, ...other] = keyPath;
    obj[key] = value;
    return nestObject(obj, other);
};
