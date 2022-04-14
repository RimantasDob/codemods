import { looksLike } from '../../../utils/utils.mjs';

import describeFunc from '../actions/describe.mjs';
import updateVariableDeclaration from '../actions/variableDeclaration.mjs';
let imports = [];

export default {
    getImports() {
        return imports;
    },
    getVisitors(filePath) {
        return {
            visitProgram(path) {
                imports = [];
                updateVariableDeclaration(path, filePath, imports);
                this.traverse(path);
            },
            visitCallExpression(path) {
                const isLoginHelper = looksLike(path.node, {
                    callee: {
                        object: { name: n => n === 'loginHelper' },
                    },
                });
                if (isLoginHelper) {
                    path.node.callee.object.name = 'authModal';
                }
                this.traverse(path);
            },
            visitExpressionStatement(path) {
                const isDescribe = looksLike(path.node, {
                    expression: {
                        callee: {
                            object: { name: n => n === 'test' },
                            property: { name: n => n === 'describe' },
                        },
                    },
                });
                if (isDescribe) {
                    describeFunc(path, imports);
                }
                this.traverse(path);
            },
        };
    },
};
