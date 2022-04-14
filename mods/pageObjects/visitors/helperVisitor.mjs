import { looksLike } from '../../../utils/utils.mjs';
import { addHelper } from '../actions/variableDeclaration.mjs';

import { types } from 'recast';

const builders = types.builders;

const updateVariables = (node, helper) => {
    const add = !node.body.some(
        val => val.type === 'VariableDeclaration' && val.declarations[0].id.name === helper.newName
    );
    if (add) {
        const helperNode = builders.variableDeclaration('let', [
            builders.variableDeclarator(builders.identifier(helper.newName)),
        ]);
        const index = node.body.findIndex(
            val =>
                val.type === 'VariableDeclaration' && val.declarations[0].id.name > helper.newName
        );
        if (index > -1) {
            node.body.splice(index, 0, helperNode);
        } else {
            node.body.push(helperNode);
        }
    }
};

const updateBeforeEach = (body, helper) => {
    const helperNode = builders.expressionStatement(
        builders.assignmentExpression(
            '=',
            builders.identifier(helper.newName),
            builders.newExpression(builders.identifier(helper.moduleName), [
                builders.objectExpression([
                    {
                        type: 'Property',
                        kind: 'init',
                        shorthand: true,
                        key: builders.identifier('page'),
                        value: builders.identifier('page'),
                    },
                ]),
            ])
        )
    );
    const add = !body.some(b => b?.expression?.left.name === helper.newName);
    if (add) {
        const index = body.findIndex(n => n?.expression?.left.name > helper.newName);
        if (index > -1) {
            body = body.splice(index, 0, helperNode);
        } else {
            body.push(helperNode);
        }
    }
};

let imports = [];

export default {
    getImports() {
        return imports;
    },
    getVisitors(filePath, helper) {
        return {
            visitProgram(path) {
                imports = [];
                addHelper(path, filePath, imports, helper);
                this.traverse(path);
            },
            visitExpressionStatement(path) {
                const isBeforeEach = looksLike(path.node, {
                    expression: {
                        callee: {
                            object: { name: n => n === 'test' },
                            property: { name: n => n === 'beforeEach' },
                        },
                    },
                });
                if (isBeforeEach) {
                    updateVariables(path.parent.node, helper);
                    updateBeforeEach(path.node.expression.arguments[0].body.body, helper);
                }
                this.traverse(path);
            },
            visitMemberExpression(path) {
                const isHelper = looksLike(path.node, {
                    object: { name: n => n === helper.past },
                });
                if (isHelper) {
                    path.node.object.name = helper.newName;
                }
                this.traverse(path);
            },
        };
    },
};
