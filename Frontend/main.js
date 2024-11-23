import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { home } from './src/index.js'
import { login } from './src/pages/login.js';
import { register } from './src/pages/register.js';
import "./style.css"
import { submit_file } from './src/pages/file.js';

import page from "//unpkg.com/page/page.mjs";

import Navigo from 'navigo';
import { router } from './src/router/router.js';

router.on({
  '/': () => {
    submit_file();
  },
  '/register': () => {
    // Lógica para la ruta "about"
    register();
  },
  '/login': () => {
    // Lógica para la ruta "contact"
    login();
  },
}).resolve();
    