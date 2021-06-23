export class Gallery {
    constructor(el) {
        this.DOM = {el: el};
        this.DOM.images = this.DOM.el.querySelectorAll('.gallery__img');
    }
}