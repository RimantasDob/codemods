export declare type FunctionList = Record<string, number>;
export declare type Imports = Record<string, string>;
export declare type FunctionListObj = Record<string, FunctionList>;
export declare const getList: () => FunctionList;
export declare const getImports: () => Imports;
export declare function methodTransformer(): (ast: any) => void;
export declare function fileImports(filePath: string): (ast: any) => void;
export declare function countFunctionsUsed(functionListObj: FunctionListObj, imports: Imports, currentFile: string): (ast: any) => void;
