import { preloadImages } from './utils';
import { Menu } from './menu';
import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';
import Splitting from 'splitting';

// initialize Splitting
const splitting = Splitting({by: 'words'});

preloadImages().then(() => {
    document.body.classList.remove('loading');
    new Menu();
});