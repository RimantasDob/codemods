import { looksLike } from '../../../utils/utils.mjs';
import updateVariableDeclaration from '../actions/variableDeclaration.mjs';
import constructor from '../actions/constructor.mjs';
import describeFunc from '../actions/describe.mjs';

import { types } from 'recast';

const builders = types.builders;

let imports = [];

export default {
    getImports() {
        return imports;
    },
    getVisitors(filePath, { spinner, navigate }) {
        return {
            visitProgram(path) {
                imports = [];
                updateVariableDeclaration(path, filePath, imports, { spinner, navigate });
                this.traverse(path);
            },
            visitClassMethod(path) {
                if (path.node.key.name === 'constructor') {
                    constructor(path.node, imports);
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
            visitCallExpression(path) {
                const isTest = looksLike(path.node, {
                    callee: obj => {
                        if (
                            obj.name === 'test' ||
                            (obj.object &&
                                obj.object.name === 'test' &&
                                obj.property.name === 'skip')
                        ) {
                            return true;
                        }
                        return false;
                    },
                });
                if (
                    isTest &&
                    path.node.arguments[1] &&
                    path.node.arguments[1].type === 'ArrowFunctionExpression' &&
                    path.node.arguments[1].body.body.some(line => {
                        if (line?.expression?.argument?.callee?.object?.name === 'page') {
                            return true;
                        }
                        return false;
                    })
                ) {
                    path.node.arguments[1].params = [
                        builders.objectPattern([
                            {
                                type: 'ObjectProperty',
                                kind: 'init',
                                shorthand: true,
                                key: builders.identifier('page'),
                                value: builders.identifier('page'),
                            },
                        ]),
                    ];
                }
                if (
                    isTest &&
                    path.node.arguments[1] &&
                    path.node.arguments[1].type === 'ArrowFunctionExpression' &&
                    path.node.arguments[1].body.body.some(line => {
                        if (
                            line?.declarations?.[0]?.init?.argument?.callee?.object?.name === 'page'
                        ) {
                            return true;
                        }
                        return false;
                    })
                ) {
                    path.node.arguments[1].params = [
                        builders.objectPattern([
                            {
                                type: 'ObjectProperty',
                                kind: 'init',
                                shorthand: true,
                                key: builders.identifier('page'),
                                value: builders.identifier('page'),
                            },
                        ]),
                    ];
                }

                this.traverse(path);
            },
        };
    },
};
