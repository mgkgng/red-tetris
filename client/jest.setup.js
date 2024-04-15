import "@testing-library/jest-dom";
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }

    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
};
