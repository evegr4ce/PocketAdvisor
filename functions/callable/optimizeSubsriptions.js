// optimize subscriptions function
async function optimizeSubscriptions(subscriptions) {

    // note any duplicates or overlapping subscriptions
    const toCancel = [];
    const seen = new Set();

    for (const sub of subscriptions) {
        const key = `${sub.service}-${sub.plan}`;
        if (seen.has(key)) {
            toCancel.push(sub.id);
        } else {
            seen.add(key);
        }
    }

    // remove subscriptions with high cost and low usage
    const costThreshold = 20;
    const usageThreshold = 5;
    
    for (const sub of subscriptions) {
        if (sub.cost > costThreshold && sub.usage < usageThreshold) {
            toCancel.push(sub.id);
        }
    }
    
    return toCancel;

}

module.exports = { optimizeSubscriptions };
