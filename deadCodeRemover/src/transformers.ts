import { visit } from "recast";
import { looksLike } from "./utils";
import { join } from "path";
import cloneDeep from "lodash.clonedeep";

export type FunctionList = Record<string, number>;
export type Imports = Record<string, string>;
export type FunctionListObj = Record<string, FunctionList>;
let list: FunctionList = {};
let imports: Imports = {};

export const getList = (): FunctionList => cloneDeep(list);
export const getImports = (): Imports => cloneDeep(imports);

export function methodTransformer() {
  list = {};
  return function (ast: any) {
    visit(ast, {
      visitClassMethod: function (path: any) {
        const isClassMethod = looksLike(path, { node: { kind: "method" } });
        if (!isClassMethod) {
          return false;
        }
        list[path.node.key.name] = 0;
        this.traverse(path);
      },
      visitObjectExpression(path) {
        const isImport = looksLike(path, {
          parentPath: {
            node: {
              left: {
                object: {
                  name: (n) => typeof n === "string" && n === "module",
                },
                property: {
                  name: (n) => typeof n === "string" && n === "exports",
                },
              },
            },
          },
        });
        if (!isImport) {
          return false;
        }
        const functionNames: string[] = path.node.properties
          // @ts-ignore
          .map((el) => el?.key?.name)
          .filter((el) => el);
        list = functionNames.reduce((obj, key) => {
          return { ...obj, [key]: 0 };
        }, list);
        return false;
      },
    });
  };
}
const a = { filePath: [{ funcName: 0 }] };

export function fileImports(filePath: string) {
  const directoryPath = filePath.replace(/\w+\.js$/, "");
  return function (ast: any): void {
    visit(ast, {
      visitVariableDeclarator(path) {
        const isImport = looksLike(path, {
          node: {
            id: {
              type: (_type) =>
                typeof _type === "string" &&
                (_type === "Identifier" || _type === "ObjectPattern"),
            },
            init: {
              callee: {
                name: (val) => typeof val === "string" && val === "require",
              },
            },
          },
        });
        if (!isImport) {
          return false;
        }
        const key: string =
          // @ts-ignore
          path.node.id.name || path.node.id.properties[0].value.name;
        // @ts-ignore
        const value: string = path.node.init?.arguments[0].value;
        //Save only file imports
        if (value.includes("./")) {
          const file = `${join(directoryPath, value)}.js`;
          imports[key] = file;
        }
        return false;
      },
    });
  };
}

export function countFunctionsUsed(
  functionListObj: FunctionListObj,
  imports: Imports,
  currentFile: string
) {
  return function (ast: any): void {
    visit(ast, {
      visitCallExpression(path) {
        // @ts-ignore
        const callee: string = path.node.callee?.object?.name;
        // @ts-ignore
        const functionName: string = path.node.callee?.property?.name;

        const isThisExpression = looksLike(path, {
          node: {
            callee: {
              object: {
                type: "ThisExpression",
              },
            },
          },
        });
        if (isThisExpression) {
          if (
            functionListObj[currentFile] &&
            functionListObj[currentFile].hasOwnProperty(functionName)
          ) {
            ++functionListObj[currentFile][functionName];
            return false;
          }
        }
        const isImport = looksLike(path, {
          node: {
            callee: {
              object: {
                name: (n) => typeof n === "string" && imports.hasOwnProperty(n),
              },
            },
          },
        });
        const isImportedFunction = looksLike(path, {
          node: {
            callee: {
              name: (n) => typeof n === "string" && imports.hasOwnProperty(n),
            },
          },
        });
        if (isImport || isImportedFunction) {
          const importCallee = imports[callee];
          if (
            functionListObj[importCallee] &&
            functionListObj[importCallee].hasOwnProperty(functionName)
          ) {
            ++functionListObj[importCallee][functionName];
          }
        }
        return this.traverse(path);
      },
    });
  };
}
