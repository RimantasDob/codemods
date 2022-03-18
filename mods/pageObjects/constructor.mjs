import { types } from 'recast';

const builders = types.builders;

const page = [
    builders.objectExpression([
        {
            type: 'Property',
            kind: 'init',
            shorthand: true,
            key: builders.identifier('page'),
            value: builders.identifier('page'),
        },
    ]),
];

export default (node, imports) => {
    node.params = page;
    // eslint-disable-next-line no-unused-vars
    const [initialSuper, ...otherStatements] = node.body.body;

    const needsSuper = initialSuper.expression?.callee?.type === 'Super';
    const other = needsSuper ? [...otherStatements] : [initialSuper, ...otherStatements];
    const superStatement = needsSuper
        ? [builders.expressionStatement(builders.callExpression(builders.super('super'), page))]
        : [];

    const thisPage = builders.expressionStatement(
        builders.assignmentExpression(
            '=',
            builders.memberExpression(builders.thisExpression(), builders.identifier('page')),
            builders.identifier('page')
        )
    );

    const thisLocator = builders.expressionStatement(
        builders.assignmentExpression(
            '=',
            builders.memberExpression(builders.thisExpression(), builders.identifier('locator')),
            builders.callExpression(
                builders.memberExpression(
                    builders.memberExpression(
                        builders.identifier('page'),
                        builders.identifier('locator')
                    ),
                    builders.identifier('bind')
                ),
                [builders.identifier('page')]
            )
        )
    );

    const futureNames = imports.map(imp => imp.future);
    const pageObjects = imports.map(({ future, moduleName }) =>
        builders.expressionStatement(
            builders.assignmentExpression(
                '=',
                builders.memberExpression(builders.thisExpression(), builders.identifier(future)),
                builders.newExpression(builders.identifier(moduleName), page)
            )
        )
    );
    const otherOther = other.filter(statement => {
        const title = statement?.expression?.left?.property?.name;
        return !(futureNames.includes(title) || title === 'page' || title === 'locator');
    });

    node.body.body = [...superStatement, thisPage, thisLocator, ...pageObjects, ...otherOther];
};
