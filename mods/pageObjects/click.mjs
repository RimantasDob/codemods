import { types } from 'recast';

const builders = types.builders;

export default expression => {
    const node = expression.argument;
    const selector = node.arguments[0];
    const num = node.arguments?.[1]?.value;
    const index = node.arguments?.[1]?.name;
    if (index || (num && num < 10)) {
        const nth = index ? builders.identifier(index) : builders.numericLiteral(num);
        expression.argument = builders.callExpression(
            builders.memberExpression(
                builders.callExpression(
                    builders.memberExpression(
                        builders.callExpression(
                            builders.memberExpression(
                                builders.thisExpression(),
                                builders.identifier('locator')
                            ),
                            [selector]
                        ),
                        builders.identifier('nth')
                    ),
                    [nth]
                ),
                builders.identifier('click')
            ),
            []
        );
    } else {
        expression.argument = builders.callExpression(
            builders.memberExpression(
                builders.callExpression(
                    builders.memberExpression(
                        builders.thisExpression(),
                        builders.identifier('locator')
                    ),
                    [selector]
                ),
                builders.identifier('click')
            ),
            []
        );
    }
};
