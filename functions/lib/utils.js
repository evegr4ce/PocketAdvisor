// common utilities

// toDate - converts Firestore timestamp to JS Date
function toDate(timestamp) {
    if (timestamp instanceof admin.firestore.Timestamp) {
        return timestamp.toDate();
    }
    return new Date(timestamp);
}

// getMonthStart - returns a Date object representing the first day of the month for a given date
function getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// formatMonthKey - formats a Date object as 'YYYY-MM' string
function formatMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

module.exports = {
    toDate,
    getMonthStart,
    formatMonthKey,
};