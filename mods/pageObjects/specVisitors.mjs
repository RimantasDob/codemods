export default {
    getVisitors() {
        const imports = [];
        return {
            visitProgram(path) {
                this.traverse(path);
            },
        };
    },
};
