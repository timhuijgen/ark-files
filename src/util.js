/**
 * Exports
 */
module.exports = {
    time: time,
    formatTime: formatTime
};

/**
 * Current unix time
 * @returns {number}
 */
function time() {
    return new Date().getTime() / 1000 | 0;
}

/**
 *
 * @param time
 * @returns {string}
 */
function formatTime(time) {
    return new Date(time).toISOString().slice(0, 19).replace('T', ' ');
}