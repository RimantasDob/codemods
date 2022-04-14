import { looksLike } from '../../../utils/utils.mjs';

import { types } from 'recast';

const builders = types.builders;
const findPage = line =>
    looksLike(line, {
        expression: {
            argument: { callee: { object: { name: n => n === 'page' } } },
        },
    }) ||
    looksLike(line, {
        expression: {
            argument: {
                callee: {
                    object: {
                        callee: { object: { name: n => n === 'page' } },
                    },
                },
            },
        },
    }) ||
    looksLike(line, {
        expression: {
            argument: {
                callee: {
                    object: { object: { name: n => n === 'page' } },
                },
            },
        },
    });

export default {
    getVisitors() {
        return {
            visitCallExpression(path) {
                let addPage = false;
                const isTest =
                    looksLike(path.node, {
                        callee: { name: n => n === 'test' },
                    }) ||
                    looksLike(path.node, {
                        callee: {
                            object: { name: n => n === 'test' },
                            property: { name: n => n === 'skip' },
                        },
                    });
                if (isTest && path.node.arguments[1]?.type === 'ArrowFunctionExpression') {
                    const body = path.node.arguments[1].body.body;
                    const pageFunc = body.some(
                        line =>
                            findPage(line) ||
                            looksLike(line, { body: { body: b => b.some(l => findPage(l)) } })
                    );
                    const pageVar = body.some(line =>
                        looksLike(line, {
                            declarations: dec =>
                                dec &&
                                looksLike(dec[0], {
                                    init: {
                                        argument: {
                                            callee: { object: { name: n => n === 'page' } },
                                        },
                                    },
                                }),
                        })
                    );
                    if (pageFunc || pageVar) {
                        addPage = true;
                    }
                }
                if (addPage) {
                    path.node.arguments[1].params = [
                        builders.objectPattern([
                            {
                                type: 'ObjectProperty',
                                kind: 'init',
                                shorthand: true,
                                key: builders.identifier('page'),
                                value: builders.identifier('page'),
                            },
                        ]),
                    ];
                }

                this.traverse(path);
            },
        };
    },
};
