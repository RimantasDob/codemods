import { types } from 'recast';

const builders = types.builders;

export default (init, funcName) => {
    init.argument = builders.callExpression(
        builders.memberExpression(
            builders.memberExpression(builders.thisExpression(), builders.identifier('page')),
            builders.identifier(funcName)
        ),
        []
    );
};
