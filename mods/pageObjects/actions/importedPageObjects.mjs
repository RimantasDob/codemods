import { types } from 'recast';

const builders = types.builders;

export default (node, imports) => {
    const calleeName = node.object?.name;
    const module = imports.filter(entry => entry.past === calleeName);
    if (module.length === 1) {
        node.object = builders.memberExpression(
            builders.thisExpression(),
            builders.identifier(module[0].future)
        );
    }
};
