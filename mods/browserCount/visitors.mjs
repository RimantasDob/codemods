import { looksLike } from '../../utils/utils.mjs';

const browser = {};

const getCount = () => {
    const arr = Object.entries(browser)
        .sort((a, b) => (a[1] < b[1] ? 1 : -1))
        .reduce((obj, [key, value]) => {
            return { ...obj, [key]: value };
        }, {});
    return arr;
};

export default {
    getVisitors() {
        return {
            visitIdentifier(path) {
                const isBrowser = looksLike(path.node, {
                    name: name => name === 'browser',
                });
                if (isBrowser) {
                    const val = path.parentPath.node?.property?.name;
                    if (val) {
                        if (browser[val]) {
                            ++browser[val];
                        } else {
                            browser[val] = 1;
                        }
                    }
                }
                this.traverse(path);
            },
        };
    },
    getCount,
};
