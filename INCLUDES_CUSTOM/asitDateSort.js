function asitDateSort(direction, field) {
    return function (a, b) {
        a = new Date(a[field]).valueOf();
        b = new Date(b[field]).valueOf();
        var compare = (a > b) - (a < b);
        if (direction === 'DESC') {
            compare *= -1;
        }
        return compare;
    };
}