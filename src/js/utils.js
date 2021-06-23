const imagesLoaded = require('imagesloaded');

// Map number x from range [a, b] to [c, d]
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

// viewport size
const calcWinsize = () => {
    return {width: window.innerWidth, height: window.innerHeight};
};

// preload images
const preloadImages = (selector = 'img') => {
    return new Promise((resolve, reject) => {
        imagesLoaded(document.querySelectorAll(selector), resolve);
    });
};

export {map, calcWinsize, preloadImages};