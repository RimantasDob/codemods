import { types } from 'recast';

const builders = types.builders;

export default (init, keyValue) => {
    init.argument = builders.callExpression(
        builders.memberExpression(
            builders.memberExpression(
                builders.memberExpression(builders.thisExpression(), builders.identifier('page')),
                builders.identifier('keyboard')
            ),
            builders.identifier('press')
        ),
        [keyValue]
    );
};
