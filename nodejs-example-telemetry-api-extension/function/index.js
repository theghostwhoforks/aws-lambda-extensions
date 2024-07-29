console.log('Hello from function initalization');

exports.handler = async (event, context) => {
    [...Array(10)].forEach((_, i) => {
        console.log('Loopy hello from function handler', { event, i });
    });
}
