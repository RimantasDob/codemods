import { addPageToTest, looksLike } from '../../../utils/utils.mjs';

import { types } from 'recast';

const builders = types.builders;

const updateAssertion = (node, filePath) => {
    const pageLocator = filePath.includes('pageObjects')
        ? builders.thisExpression()
        : builders.identifier('page');
    const assertion = 'toHaveText';
    const args = node.expression.argument.arguments;
    const selector = args[0];
    const valueToCheck = [args[2]];
    const reverse = args[3];
    const nth = args[4];
    const locator = nth
        ? [
              builders.callExpression(
                  builders.memberExpression(
                      builders.callExpression(
                          builders.memberExpression(pageLocator, builders.identifier('locator')),
                          [selector]
                      ),
                      builders.identifier('nth')
                  ),
                  [nth]
              ),
          ]
        : [
              builders.callExpression(
                  builders.memberExpression(pageLocator, builders.identifier('locator')),
                  [args[0]]
              ),
          ];
    if (!reverse || (reverse?.type === 'BooleanLiteral' && reverse.value === true)) {
        const expect = builders.awaitExpression(
            builders.callExpression(
                builders.memberExpression(
                    builders.callExpression(builders.identifier('expect'), locator),
                    builders.identifier(assertion)
                ),
                valueToCheck
            )
        );
        node.expression = expect;
    } else if (reverse?.type === 'BooleanLiteral' && reverse.value === false) {
        const expect = builders.awaitExpression(
            builders.callExpression(
                builders.memberExpression(
                    builders.memberExpression(
                        builders.callExpression(builders.identifier('expect'), locator),
                        builders.identifier('not')
                    ),
                    builders.identifier(assertion)
                ),
                []
            )
        );
        node.expression = expect;
    } else if (reverse?.type === 'Identifier') {
        const expect = builders.ifStatement(
            reverse,
            builders.blockStatement([
                builders.expressionStatement(
                    builders.awaitExpression(
                        builders.callExpression(
                            builders.memberExpression(
                                builders.callExpression(builders.identifier('expect'), locator),
                                builders.identifier(assertion)
                            ),
                            valueToCheck
                        )
                    )
                ),
            ]),
            builders.blockStatement([
                builders.expressionStatement(
                    builders.awaitExpression(
                        builders.callExpression(
                            builders.memberExpression(
                                builders.memberExpression(
                                    builders.callExpression(builders.identifier('expect'), locator),
                                    builders.identifier('not')
                                ),
                                builders.identifier(assertion)
                            ),
                            []
                        )
                    )
                ),
            ])
        );
        node.expression = expect;
    }
};

const updateEquality = node => {
    const arg1 = node.expression.arguments[0];
    const arg2 = node.expression.arguments[1];
    node.expression = builders.callExpression(
        builders.memberExpression(
            builders.callExpression(builders.identifier('expect'), [arg1]),
            builders.identifier('toBe')
        ),
        [arg2]
    );
};

const updateTruthyAssertion = node => {
    const arg1 = node.expression.arguments[0];
    const message = node.expression.arguments[1];
    const reverse = node.expression.arguments[2];
    if (arg1?.type === 'BinaryExpression' && arg1.operator === '===') {
        node.expression = builders.callExpression(
            builders.memberExpression(
                builders.callExpression(builders.identifier('expect'), [arg1.left]),
                builders.identifier('toBe')
            ),
            [arg1.right]
        );
    }
    if (arg1?.type === 'BinaryExpression' && arg1.operator === '!==') {
        node.expression = builders.callExpression(
            builders.memberExpression(
                builders.memberExpression(
                    builders.callExpression(builders.identifier('expect'), [arg1.left]),
                    builders.identifier('not')
                ),
                builders.identifier('toBe')
            ),
            [arg1.right]
        );
    }
    if (arg1?.type === 'BinaryExpression' && arg1.operator === '<=') {
        node.expression = builders.callExpression(
            builders.memberExpression(
                builders.callExpression(builders.identifier('expect'), [arg1.left]),
                builders.identifier('toBeLessThanOrEqual')
            ),
            [arg1.right]
        );
    }
    if (arg1?.type === 'Identifier' && !reverse) {
        node.expression = builders.callExpression(
            builders.memberExpression(
                builders.callExpression(builders.identifier('expect'), [arg1, message]),
                builders.identifier('toBe')
            ),
            [builders.booleanLiteral(true)]
        );
    }
    if (arg1.type === 'CallExpression' && arg1?.callee?.property?.name === 'includes' && !reverse) {
        node.expression = builders.callExpression(
            builders.memberExpression(
                builders.callExpression(builders.identifier('expect'), [arg1.callee.object]),
                builders.identifier('toContain')
            ),
            arg1.arguments
        );
    }
};
const fieldsVisibility = (elem, isVis, filePath) => {
    const pageLocator = filePath.includes('pageObjects')
        ? builders.thisExpression()
        : builders.identifier('page');
    if (isVis) {
        return builders.expressionStatement(
            builders.awaitExpression(
                builders.callExpression(
                    builders.memberExpression(
                        builders.callExpression(builders.identifier('expect'), [
                            builders.callExpression(
                                builders.memberExpression(
                                    pageLocator,
                                    builders.identifier('locator')
                                ),
                                [elem]
                            ),
                        ]),
                        builders.identifier('toBeDisabled')
                    ),
                    []
                )
            )
        );
    } else {
        return builders.expressionStatement(
            builders.awaitExpression(
                builders.callExpression(
                    builders.memberExpression(
                        builders.memberExpression(
                            builders.callExpression(builders.identifier('expect'), [
                                builders.callExpression(
                                    builders.memberExpression(
                                        pageLocator,
                                        builders.identifier('locator')
                                    ),
                                    [elem]
                                ),
                            ]),
                            builders.identifier('not')
                        ),
                        builders.identifier('toBeDisabled')
                    ),
                    []
                )
            )
        );
    }
};

const updateFieldsAssertion = (node, filePath) => {
    const body = node.body.reduce((body, curr) => {
        const isArray = looksLike(curr, {
            expression: {
                argument: {
                    callee: {
                        property: {
                            name: n => n === 'checkFieldsDisabled',
                        },
                    },
                    arguments: args => args[0].type === 'ArrayExpression',
                },
            },
        });
        const isVariable = looksLike(curr, {
            expression: {
                argument: {
                    callee: {
                        property: {
                            name: n => n === 'checkFieldsDisabled',
                        },
                    },
                },
            },
        });
        if (isArray) {
            const isVis = curr.expression.argument.arguments?.[1]?.value ?? true;
            const array = curr.expression.argument.arguments[0].elements.map(elem =>
                fieldsVisibility(elem, isVis, filePath)
            );
            return [...body, ...array];
        } else if (isVariable) {
            const isVis = curr.expression.argument.arguments?.[1]?.value ?? true;
            const forStatement = builders.forOfStatement(
                builders.variableDeclaration('const', [
                    builders.variableDeclarator(builders.identifier('selector')),
                ]),
                curr.expression.argument.arguments[0],
                builders.blockStatement([
                    fieldsVisibility(builders.identifier('selector'), isVis, filePath),
                ])
            );
            return [...body, forStatement];
        } else {
            return [...body, curr];
        }
    }, []);
    node.body = body;
};

export default {
    getVisitors() {
        return {
            visitBlockStatement(path) {
                const isAssertion = looksLike(path.node, {
                    body: b =>
                        b.some(node =>
                            looksLike(node, {
                                expression: {
                                    callee: {
                                        property: {
                                            name: n => n === 'truthyAssertion',
                                        },
                                    },
                                },
                            })
                        ),
                });
                if (isAssertion) {
                    // updateTruthyAssertion(path.node);
                    // updateEquality(path.node);
                    // updateAssertion(path.node, filePath);
                    // updateFieldsAssertion(path.node, filePath);
                    // addPageToTest(path);
                }
                this.traverse(path);
            },
            visitExpressionStatement(path) {
                const isAssertion = looksLike(path.node, {
                    expression: {
                        callee: {
                            property: {
                                name: n => n === 'truthyAssertion',
                            },
                        },
                    },
                });
                if (isAssertion) {
                    updateTruthyAssertion(path.node);
                    // updateEquality(path.node);
                    // updateAssertion(path.node, filePath);
                    // updateFieldsAssertion(path.node, filePath);
                    // addPageToTest(path);
                }
                this.traverse(path);
            },
        };
    },
    getIfVisitors() {
        return {
            visitBlockStatement(path) {
                const body = [];
                for (const node of path.node.body) {
                    if (node.type === 'IfStatement' && node.test.type === 'Identifier') {
                        const index = body.findIndex(
                            val =>
                                val?.test?.type === 'Identifier' &&
                                val?.test.name === node.test.name
                        );
                        if (index > -1) {
                            console.log(index);
                            const consequent = builders.blockStatement([
                                ...body[index].consequent.body,
                                ...node.consequent.body,
                            ]);
                            const alternate = [];
                            console.log(node.alternate);
                            if (body[index]?.alternate?.body.length > 0) {
                                alternate.push(...body[index].alternate.body);
                            }
                            if (node?.alternate?.body.length > 0) {
                                alternate.push(...node.alternate.body);
                            }
                            const newIf =
                                alternate.length > 0
                                    ? builders.ifStatement(
                                          node.test,
                                          consequent,
                                          builders.blockStatement(alternate)
                                      )
                                    : builders.ifStatement(node.test, consequent);
                            body[index] = newIf;
                        } else {
                            body.push(node);
                        }
                    } else {
                        body.push(node);
                    }
                }
                path.node.body = body;
                this.traverse(path);
            },
        };
    },
};
