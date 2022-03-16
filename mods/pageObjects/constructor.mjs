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
    const superStatement = builders.expressionStatement(
        builders.callExpression(builders.super('super'), page)
    );

    const needsPage =
        otherStatements.filter(statement => statement?.expression?.left?.property?.name === 'page')
            .length === 0;
    const thisPage = needsPage
        ? [
              builders.expressionStatement(
                  builders.assignmentExpression(
                      '=',
                      builders.memberExpression(
                          builders.thisExpression(),
                          builders.identifier('page')
                      ),
                      builders.identifier('page')
                  )
              ),
          ]
        : [];

    const needsLocator =
        otherStatements.filter(
            statement => statement?.expression?.left?.property?.name === 'locator'
        ).length === 0;
    const thisLocator = needsLocator
        ? [
              builders.expressionStatement(
                  builders.assignmentExpression(
                      '=',
                      builders.memberExpression(
                          builders.thisExpression(),
                          builders.identifier('locator')
                      ),
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
              ),
          ]
        : [];
    const pageObjects = imports
        .filter(
            ({ future }) =>
                otherStatements.filter(
                    statement => statement?.expression?.left?.property?.name === future
                ).length === 0
        )
        .map(({ future, moduleName }) =>
            builders.expressionStatement(
                builders.assignmentExpression(
                    '=',
                    builders.memberExpression(
                        builders.thisExpression(),
                        builders.identifier(future)
                    ),
                    builders.newExpression(builders.identifier(moduleName), page)
                )
            )
        );

    node.body.body = [
        superStatement,
        ...thisPage,
        ...thisLocator,
        ...pageObjects,
        ...otherStatements,
    ];
};
