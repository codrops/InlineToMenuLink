import { gsap } from 'gsap';
import { calcWinsize } from './utils';
import { MenuItem } from './menuItem';

// calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

export class Menu {
    constructor() {
        this.DOM = {};
        // all frame links
        this.DOM.frameLinks = [...document.querySelectorAll('.oh')];
        // frame links that are links to show only when the menu appears (after clicking on one of the sentence inline links)
        this.DOM.frameLinksContent = this.DOM.frameLinks.filter(el => el.classList.contains('view-content'))
        // remaining (the ones shown initially)
        this.DOM.frameLinksInitial = this.DOM.frameLinks.filter(el => !this.DOM.frameLinksContent.includes(el));
        // close menu button
        this.DOM.closeCtrl = document.querySelector('.frame__close');
        // content element
        this.DOM.content = document.querySelector('.content');
        // the links
        this.DOM.menuItems = [...this.DOM.content.querySelectorAll('.menu-item')];
        // array of MenuItems
        this.menuItems = [];
        this.DOM.menuItems.forEach(item => this.menuItems.push(new MenuItem(item)));
        // remaining text (span.word)
        this.DOM.textWords = [...this.DOM.content.querySelectorAll('.content__quote > span.whitespace, .content__quote > span.word')];
        // gallery deco element
        this.DOM.galleryDeco = document.querySelector('.galleries > .galleries__deco');
        // and gallery entry button
        this.DOM.galleryButton = document.querySelector('.galleries > .galleries__button');
        // check if we are at the initial page (sentence view) or the menu page (menu/gallery view)
        this.isMenuPage = false;
        this.init();
    }
    init() {
        // hide all the frame links that should be visible only after clicking on one of the sentence inline links
        gsap.set(this.DOM.frameLinksContent, {
            pointerEvents: 'none'
        });
        gsap.set(this.DOM.frameLinksContent.map(el => el.children), {
            y: '-100%'
        });

        // init/bind events
        this.initEvents();
    }
    initEvents() {
        // click on one of the sentence inline links
        this.DOM.menuItems.forEach(menuItem => {
            menuItem.addEventListener('click', this.openMenu.bind(this));
        });

        // click the close menu control
        this.DOM.closeCtrl.addEventListener('click', this.closeMenu.bind(this));

        window.addEventListener('resize', () => {
            if ( !this.isMenuPage ) return;
            gsap.set(this.DOM.menuItems, {
                x: (_,target) => winsize.width * 0.6 - target.offsetLeft
            }, 0);
        });
    }
    // show/hide gallery deco element
    toggleGalleryDeco() {
        return gsap.timeline({
            defaults: {
                duration: !this.isMenuPage ? 1 : 0.3, 
                ease: 'power4'
            },
            onStart: () => !this.isMenuPage ? gsap.set(this.DOM.galleryDeco, {x: '15%', y: '100%'}) : null
        })
        .to(this.DOM.galleryDeco, {
            opacity: !this.isMenuPage ? 1 : 0,
            x: !this.isMenuPage ? '0%' : '5%',
            y: !this.isMenuPage ? '0%' : '100%'
        }, !this.isMenuPage ? 0.5 : 0);
    }
    showGalleryEntryButton() {
        return gsap.timeline({
            onStart: () => gsap.set(this.DOM.galleryButton, {
                scale: 0.9
            })
        })
        .to(this.DOM.galleryButton, {
            duration: 0.8, ease: 'power4',
            opacity: 1,
            scale: 1
        }, !this.isMenuPage ? 0.5 : 0);
    }
    hideGalleryEntryButton() {
        return gsap.timeline()
        .to(this.DOM.galleryButton, {
            duration: 0.3, ease: 'power4',
            opacity: 0,
            scale: 0.9
        }, !this.isMenuPage ? 0.5 : 0);
    }
    // show links for the content or initial page
    toggleFrameLinks() {
        return gsap.timeline({
            defaults: {
                duration: !this.isMenuPage ? 1 : 0.6, 
                ease: !this.isMenuPage ? 'power4.inOut' : 'power4'
            },
            onStart: () => {
                // pointer events logic for the frame links:
                gsap.set(!this.isMenuPage ? this.DOM.frameLinksInitial : this.DOM.frameLinksContent, {
                    pointerEvents: 'none'
                });
                gsap.set(!this.isMenuPage ? this.DOM.frameLinksContent : this.DOM.frameLinksInitial, {
                    pointerEvents: 'auto'
                });
            }
        })
        .to(this.DOM.frameLinksInitial.map(el => el.children), {
            y: !this.isMenuPage ? '100%' : '0%'
        })
        .to(this.DOM.frameLinksContent.map(el => el.children), {
            y: !this.isMenuPage ? '0%' : '-100%'
        }, 0);
    }
    openMenu(ev) {
        ev.preventDefault();

        const clickedMenuItemIndex = this.DOM.menuItems.indexOf(ev.target);
        
        // return if currently animating or if the clicked menu item is the current selected one
        if ( this.isAnimating || this.isMenuPage && this.currentMenuItem === clickedMenuItemIndex ) return;
        this.isAnimating = true;

        // remove active class from the current menu item
        if ( this.isMenuPage ) {
            this.previousMenuItem = this.currentMenuItem;
            this.DOM.menuItems[this.currentMenuItem].classList.remove('menu-item--active');
        }
        // index of clicked menu item
        this.currentMenuItem = clickedMenuItemIndex;

        // add class menu-item--active to the clicked menu item and content--menu to the content element
        // related to the link underline animation (CSS)
        ev.target.classList.add('menu-item--active');
        
        // if we go from the sentence page to the menu page:
        if ( !this.isMenuPage ) {
            this.DOM.content.classList.add('content--menu');

            this.togglePage();
        }
        // else if we click another menu item while on the menu page
        else {
            Promise.all([this.hideGalleryEntryButton(), this.closeGallery(this.previousMenuItem)])
            .then(() => Promise.all([this.openGallery(), this.showGalleryEntryButton()]))
            .then(() => this.isAnimating = false);
        }
    }
    closeMenu() {
        if ( this.isAnimating ) return;
        this.isAnimating = true;

        // related to the link underline animation (CSS)
        this.DOM.menuItems[this.currentMenuItem].classList.remove('menu-item--active');
        this.DOM.content.classList.remove('content--menu');

        this.togglePage();
    }
    togglePage() {
        Promise.all([
            this.toggleFrameLinks(), 
            this.toggleLinksToMenu(), 
            this[!this.isMenuPage ? 'openGallery' : 'closeGallery'](),
            this.toggleGalleryDeco(),
            this[!this.isMenuPage ? 'showGalleryEntryButton' : 'hideGalleryEntryButton']()
        ])
        .then(() => {
            this.isMenuPage = !this.isMenuPage;
            this.isAnimating = false;
        });
    }
    // animate links to the right side and the remaining text to the left, fading out
    // or vice versa
    toggleLinksToMenu() {
        return gsap.timeline({
            defaults: {
                duration: !this.isMenuPage ? 1 : 0.6, 
                ease: !this.isMenuPage ? 'power4.inOut' : 'power4'
            }
        })
        .to(this.DOM.menuItems, {
            x: (_,target) => !this.isMenuPage ? winsize.width * 0.6 - target.offsetLeft : 0,
            stagger: !this.isMenuPage ? {
                from: this.currentMenuItem,
                amount: 0.15
            } : 0
        }, 0)
        .to(this.DOM.textWords.sort((a,b) => {
            // words are ordered by its left value
            if ( a.offsetLeft < b.offsetLeft ) {
                return -1;
            }
            else if ( a.offsetLeft > b.offsetLeft ) {
                return 1;
            }
            return 0;
        }), {
            x: !this.isMenuPage ? -300 : 0,
            opacity: !this.isMenuPage ? 0 : 1,
            stagger: !this.isMenuPage ? 0.004 : -0.004
        }, 0);
    }
    openGallery() {
        // gallery of the cliked menu item
        const gallery = this.menuItems[this.currentMenuItem].gallery;
        
        return gsap.timeline({
            onStart: () => {
                gsap.set(gallery.DOM.images, {opacity: 0}, 0);
                gallery.DOM.el.classList.add('gallery--current');
            }
        })
        .to(gallery.DOM.images, {
            duration: 0.1, ease: 'expo.inOut',
            opacity: pos => Math.max(1-(pos*0.1+0.1), 0.1),
            x: '0%',
            stagger: -0.08
        }, !this.isMenuPage ? 0.5 : 0);
    }
    closeGallery(menuItemIndex = this.currentMenuItem) {
        // hide the current gallery
        const galleryCurrent = this.menuItems[menuItemIndex].gallery;
        return gsap.timeline()
        .to(galleryCurrent.DOM.images, {
            duration: 0.3, ease: 'expo',
            opacity: 0,
            stagger: -0.04,
            onComplete: () => galleryCurrent.DOM.el.classList.remove('gallery--current')
        }, 0);
    }
}