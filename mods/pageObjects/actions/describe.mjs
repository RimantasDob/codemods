import { types } from 'recast';
import { looksLike } from '../../../utils/utils.mjs';

const builders = types.builders;

export default (path, imports) => {
    const title = path.node.expression.arguments[0];
    const func = path.node.expression.arguments[1];
    const isTopDescribe =
        path.parentPath.node.type === 'Program' ||
        (path.parentPath.node.type === 'BlockStatement' &&
            path.parentPath?.parentPath?.parentPath.node.type === 'ForOfStatement' &&
            path.parentPath?.parentPath?.parentPath?.parentPath.node.type === 'Program');

    const vars = imports.map(imp =>
        builders.variableDeclaration('let', [
            builders.variableDeclarator(builders.identifier(imp.future)),
        ])
    );
    const beforeEachBody = builders.arrowFunctionExpression(
        [
            builders.objectPattern([
                {
                    type: 'ObjectProperty',
                    kind: 'init',
                    shorthand: true,
                    key: builders.identifier('page'),
                    value: builders.identifier('page'),
                },
            ]),
        ],
        builders.blockStatement(
            imports.map(imp =>
                builders.expressionStatement(
                    builders.assignmentExpression(
                        '=',
                        builders.identifier(imp.future),
                        builders.newExpression(builders.identifier(imp.moduleName), [
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
                )
            )
        )
    );

    const beforeEach =
        imports.length > 0
            ? [
                  builders.expressionStatement(
                      builders.callExpression(
                          builders.memberExpression(
                              builders.identifier('test'),
                              builders.identifier('beforeEach')
                          ),
                          [beforeEachBody]
                      )
                  ),
              ]
            : [];

    const currentBody = func.body.body.filter(node => {
        const letName = node?.declarations?.[0]?.id.name;
        if (letName && imports.some(({ future }) => future === letName)) {
            return false;
        }
        const isBeforeEach = looksLike(node, {
            expression: {
                callee: {
                    object: { name: n => n === 'test' },
                    property: { name: n => n === 'beforeEach' },
                },
            },
        });
        if (isBeforeEach) {
            return false;
        }
        return true;
    });

    const before = isTopDescribe
        ? builders.blockStatement([...vars, ...beforeEach, ...currentBody])
        : func.body;

    path.node.expression = builders.callExpression(
        builders.memberExpression(builders.identifier('test'), builders.identifier('describe')),
        [title, builders.arrowFunctionExpression([], before)]
    );
};
