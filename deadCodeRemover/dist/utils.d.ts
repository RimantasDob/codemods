import { Rule } from "eslint";
import { Node } from "estree";
export declare type ESTreeNode = Node & Rule.NodeParentExtension;
declare type Func = <T>(arg: T) => boolean;
interface EStreePattern {
    [x: string]: string | boolean | number | null | Func | EStreePattern;
}
export declare const looksLike: (node: any, patternObj: EStreePattern) => boolean;
export {};
