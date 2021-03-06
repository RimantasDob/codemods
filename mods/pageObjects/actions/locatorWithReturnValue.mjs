import { types } from 'recast';

const builders = types.builders;

export default (node, funcName, selector, args) => {
    node.argument = builders.callExpression(
        builders.memberExpression(
            builders.callExpression(
                builders.memberExpression(
                    builders.thisExpression(),
                    builders.identifier('locator')
                ),
                selector
            ),
            builders.identifier(funcName)
        ),
        args
    );
};
