module.exports = function(start, end, text) {
    const delta = start - end;
    if (delta === 1) {
        return `a ${text}`
    }
    return `${delta} ${text}s`
}