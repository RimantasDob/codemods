import { Rule } from "eslint";
import { Node } from "estree";

export type ESTreeNode = Node & Rule.NodeParentExtension;

type Func = <T>(arg: T) => boolean;
interface EStreePattern {
  [x: string]: string | boolean | number | null | Func | EStreePattern;
}
const isPrimitive = <T>(val: T): boolean => {
  return val === null || /^[sbn]/.test(typeof val);
};

export const looksLike = (node: any, patternObj: EStreePattern): boolean => {
  return (
    node &&
    patternObj &&
    Object.keys(patternObj).every((bKey: string) => {
      const patternVal = patternObj[bKey];
      const nodeVal = node[bKey as keyof typeof node];
      if (typeof patternVal === "function") {
        return patternVal(nodeVal);
      } else {
        return isPrimitive(patternVal)
          ? patternVal === nodeVal
          : looksLike(nodeVal as ESTreeNode, patternVal as EStreePattern);
      }
    })
  );
};
