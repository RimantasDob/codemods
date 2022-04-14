import { types } from 'recast';

const builders = types.builders;

export default expression => {
    expression.argument = builders.callExpression(
        builders.memberExpression(
            builders.memberExpression(builders.thisExpression(), builders.identifier('page')),
            builders.identifier('reload')
        ),
        []
    );
};
