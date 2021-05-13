//jshint edversion:6

exports.getDate= function() {
    return new Date().toLocaleDateString("en-US", {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}
exports.getDay= function() {
    return new Date().toLocaleDateString("en-US", {
        weekday: 'long'
    });
}
