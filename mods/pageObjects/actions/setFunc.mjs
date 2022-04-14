import { types } from 'recast';

const builders = types.builders;

export default (expression, funcName, selector, args) => {
    const _args = args || [];
    expression.argument = builders.callExpression(
        builders.memberExpression(
            builders.callExpression(
                builders.memberExpression(
                    builders.thisExpression(),
                    builders.identifier('locator')
                ),
                [selector]
            ),
            builders.identifier(funcName)
        ),
        _args
    );
};
