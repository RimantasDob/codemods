import { Rule } from 'eslint';
import { Node } from 'estree';
export declare type ESTreeNode = Rule.Node;
export declare type NodeListener = Rule.NodeListener;
export declare type SBN = string | boolean | number;
declare type FuncArgs = ESTreeNode | Node[] | SBN;
export declare type Func = (arg: FuncArgs) => boolean;
export interface EStreePattern {
    [x: string]: SBN | Func | EStreePattern | null;
}
export declare const looksLike: (node: ESTreeNode, patternObj: EStreePattern) => boolean;
export declare const createNestedObject: (obj: EStreePattern, keyPath: string[], value: EStreePattern) => EStreePattern;
export {};
