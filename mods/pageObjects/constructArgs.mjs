import { types } from 'recast';

const builders = types.builders;

export default argsObj => {
    return Object.keys(argsObj).length > 0
        ? [
              builders.objectExpression(
                  Object.entries(argsObj).map(([key, val]) => {
                      let value = val;
                      if (typeof val === 'string') {
                          value = builders.stringLiteral(val);
                      } else if (typeof val === 'number') {
                          value = builders.numericLiteral(val);
                      } else if (typeof val === 'boolean') {
                          value = builders.booleanLiteral(val);
                      }
                      return {
                          type: 'Property',
                          kind: 'init',
                          key: builders.identifier(key),
                          value,
                      };
                  })
              ),
          ]
        : [];
};
