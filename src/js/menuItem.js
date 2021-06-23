import { Gallery } from './gallery';

export class MenuItem {
    constructor(item) {
        this.DOM = {item: item};
        this.DOM.gallery = document.querySelector(this.DOM.item.href.substring(this.DOM.item.href.indexOf('#')));
        this.gallery = new Gallery(this.DOM.gallery);
    }
}