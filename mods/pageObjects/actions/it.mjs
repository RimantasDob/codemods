import { types } from 'recast';

const builders = types.builders;

// const page = builders.objectPattern([
//     {
//         type: 'ObjectProperty',
//         kind: 'init',
//         shorthand: true,
//         key: builders.identifier('page'),
//         value: builders.identifier('page'),
//     },
// ]);

export default node => {
    const title = node.expression.arguments[0];
    const func = node.expression.arguments[1];
    if (func.type === 'FunctionExpression') {
        node.expression = builders.callExpression(builders.identifier('test'), [
            title,
            builders.arrowFunctionExpression([], func.body),
        ]);
        node.expression.arguments[1].async = true;
    } else {
        node.expression = builders.callExpression(builders.identifier('test'), [title, func]);
    }
};
