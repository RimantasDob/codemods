import { looksLike } from '../../utils/utils.mjs';

export default (node, funcName) => {
    node.body = node.body.filter(
        node =>
            !looksLike(node, {
                expression: {
                    argument: {
                        callee: {
                            object: { name: name => name === 'browser' },
                            property: { name: name => name === funcName },
                        },
                    },
                },
            })
    );
};
