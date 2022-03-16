import { types } from 'recast';

const builders = types.builders;

export default (node, args) => {
    node.argument = builders.callExpression(
        builders.memberExpression(
            builders.callExpression(
                builders.memberExpression(
                    builders.thisExpression(),
                    builders.identifier('locator')
                ),
                args
            ),
            builders.identifier('isVisible')
        ),
        []
    );
};
