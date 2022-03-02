import { types } from 'recast';
import utils from '../../utils/utils';

const builders = types.builders;

const updateAST = (path, funcName) => {
    path.node.callee.property.name = 'navigateToPage';
    const args = [path.node.arguments[0]];
    switch (funcName) {
        case 'noWait':
            {
                const obj = {
                    type: 'Property',
                    kind: 'init',
                    key: builders.identifier('noWait'),
                    value: builders.booleanLiteral(true),
                };
                args.push(builders.objectExpression([obj]));
            }
            break;
        case 'navigateToBuyerPage':
            {
                const noNotif = {
                    type: 'Property',
                    kind: 'init',
                    key: builders.identifier('noNotif'),
                    value: builders.booleanLiteral(true),
                };
                const pause = path.node.arguments[1]
                    ? [
                          {
                              type: 'Property',
                              kind: 'init',
                              key: builders.identifier('pause'),
                              value: path.node.arguments[1],
                          },
                      ]
                    : [];

                args.push(builders.objectExpression([noNotif, ...pause]));
            }
            break;
        case 'navigateToPage':
            {
                const pauseExists = path.node.arguments?.[1];
                if (pauseExists) {
                    args.push(
                        builders.objectExpression([
                            {
                                type: 'Property',
                                kind: 'init',
                                key: builders.identifier('pause'),
                                value: path.node.arguments[1],
                            },
                        ])
                    );
                }
            }
            break;
        case 'navigateToBuyerPageAndWait':
            {
                const selector = {
                    type: 'Property',
                    kind: 'init',
                    key: builders.identifier('selector'),
                    value: path.node.arguments[1],
                };
                const noNotif = {
                    type: 'Property',
                    kind: 'init',
                    key: builders.identifier('noNotif'),
                    value: builders.booleanLiteral(true),
                };
                const timeout = path.node.arguments[2]
                    ? [
                          {
                              type: 'Property',
                              kind: 'init',
                              key: builders.identifier('timeout'),
                              value: path.node.arguments[2],
                          },
                      ]
                    : [];

                args.push(builders.objectExpression([selector, noNotif, ...timeout]));
            }
            break;
        case 'navigateToPageAndWait':
            {
                const selector = {
                    type: 'Property',
                    kind: 'init',
                    key: builders.identifier('selector'),
                    value: path.node.arguments[1],
                };
                const timeout = path.node.arguments[2]
                    ? [
                          {
                              type: 'Property',
                              kind: 'init',
                              key: builders.identifier('timeout'),
                              value: path.node.arguments[2],
                          },
                      ]
                    : [];

                args.push(builders.objectExpression([selector, ...timeout]));
            }
            break;
    }
    path.node.arguments = args;
};

export default {
    getClassMethodVisitor() {
        return {
            visitMethodDefinition(path) {
                console.log(path);
                console.log(path.node.key.name);
                this.traverse(path);
            },
            // visitClassMethod(path) {
            //     const isNavigateHelper = utils.looksLike(path, {
            //         node: { callee: { object: { name: name => name === 'navigateHelper' } } },
            //     });
            //     // const isNavigateHelper =
            //     //     path.node.callee.object && path.node.callee.object.name === 'navigateHelper';
            //     if (!isNavigateHelper) {
            //         return this.traverse(path);
            //     }
            //     const funcName = path.node.callee.property.name;
            //     updateAST(path, funcName);
            //     return false;
            // },
        };
    },
};
