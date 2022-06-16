import { looksLike } from '../../utils/utils.mjs';

export default {
    getVisitors(filePath, funcNames) {
        return {
            visitCallExpression(path) {
                const node = path.node;

                const isEvent = looksLike(node, {
                    callee: {
                        // object: { name: name => name === 'browser' },
                        property: {
                            name: name => {
                                return funcNames.includes(name);
                            },
                        },
                    },
                });
                if (isEvent) {
                    const func = node.callee.property.name;
                    const args = [];
                    // args.push(node.arguments?.[0]?.value ?? node.arguments?.[0]?.name ?? null);
                    // args.push(node.arguments?.[1]?.value ?? node.arguments?.[1]?.name ?? null);
                    // args.push(node.arguments?.[2]?.value ?? node.arguments?.[2]?.name ?? null);
                    args.push(node.arguments?.[3]?.value ?? node.arguments?.[3]?.name ?? null);
                    args.push(node.arguments?.[4]?.value ?? node.arguments?.[4]?.name ?? null);
                    args.push(node.arguments?.[5]?.value ?? node.arguments?.[5]?.name ?? null);
                    args.push(node.arguments?.[6]?.value ?? node.arguments?.[6]?.name ?? null);
                    args.push(node.arguments?.[7]?.value ?? node.arguments?.[7]?.name ?? null);
                    args.push(node.arguments?.[8]?.value ?? node.arguments?.[8]?.name ?? null);
                    const filtered = args.filter(val => val !== null);
                    if (filtered.length > 0) {
                        console.log({ filePath, func, args: filtered });
                    }
                }
                this.traverse(path);
            },
        };
    },
};
