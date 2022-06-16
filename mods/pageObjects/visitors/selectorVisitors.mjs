import { looksLike } from '../../../utils/utils.mjs';

import { types } from 'recast';

const builders = types.builders;

const transformToLocator = node => {
    node.value = builders.callExpression(
        builders.memberExpression(builders.thisExpression(), builders.identifier('locator')),
        [node.value]
    );
};

const sortSelectors = node => {
    node.properties.sort((a, b) => {
        if (a.value?.properties) {
            sortSelectors(a.value);
        }
        if (a.value.type === 'StringLiteral' || a.value.type === 'TemplateLiteral') {
            transformToLocator(a);
        }
        if (b.value.type === 'StringLiteral' || b.value.type === 'TemplateLiteral') {
            transformToLocator(b);
        }
        return a.key.name > b.key.name ? 1 : -1;
    });
};
const hasSelector = obj => {
    const hasIt = looksLike(obj, { property: { name: n => n === 'selectors' } });
    if (hasIt) {
        return true;
    } else if (obj?.object) {
        return hasSelector(obj.object);
    } else {
        return false;
    }
};
const rename = node => {
    if (node.object) {
        rename(node.object);
    }
    if (node?.property?.name === 'selectors') {
        node.property.name = 'locators';
    }
    return node;
};
const isInLocators = path => {
    if (path.node.type === 'Program') {
        return false;
    }
    const current = looksLike(path.node, {
        expression: exp =>
            looksLike(exp, {
                left: { property: { name: n => n === 'locators' } },
            }),
    });
    return current || isInLocators(path.parent);
};

export default {
    getVisitors(filePath) {
        return {
            // visitAssignmentExpression(path) {
            //     const isSelectors = looksLike(path.node, {
            //         left: {
            //             object: { type: t => t === 'ThisExpression' },
            //             property: { name: n => n === 'selectors' },
            //         },
            //         right: {
            //             properties: p => Array.isArray(p),
            //         },
            //     });
            //     if (isSelectors) {
            //         sortSelectors(path.node.right);
            //         path.node.left.property.name = 'locators';
            //     }
            //     this.traverse(path);
            // },
            // visitMemberExpression(path) {
            //     const twoLocators = looksLike(path, {
            //         node: {
            //             object: { callee: { property: { name: n => n === 'locator' } } },
            //             property: { name: n => n === 'locator' },
            //         },
            //         parent: p => !isInLocators(p),
            //     });
            //     if (twoLocators) {
            //         console.log(filePath);
            //     }
            //     this.traverse(path);
            // },
            visitCallExpression(path) {
                const str = looksLike(path.node, {
                    arguments: args =>
                        Array.isArray(args) &&
                        args.some(arg =>
                            looksLike(arg, {
                                quasis: q =>
                                    Array.isArray(q) &&
                                    q.length === 2 &&
                                    q.every(l => {
                                        return looksLike(l, { value: { raw: r => r === '' } });
                                    }),
                            })
                        ),
                });
                if (str) {
                    path.node.arguments = path.node.arguments.map(arg => {
                        const hasStr = looksLike(arg, {
                            quasis: q =>
                                Array.isArray(q) &&
                                q.length === 2 &&
                                q.every(l => {
                                    return looksLike(l, { value: { raw: r => r === '' } });
                                }),
                        });
                        if (hasStr) {
                            return arg.expressions[0];
                        } else {
                            return arg;
                        }
                    });
                }
                this.traverse(path);
            },
            // visitTemplateLiteral(path) {
            //     const str = looksLike(path.node, {
            //         quasis: q =>
            //             Array.isArray(q) &&
            //             q.length === 2 &&
            //             q.every(l => {
            //                 return looksLike(l, { value: { raw: r => r === '' } });
            //             }),
            //     });
            //     if (str) {
            //         console.log(filePath);
            //     }
            //     this.traverse(path);
            // },
        };
    },
};
