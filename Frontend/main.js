import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { home } from './src/index.js'
import { login } from './src/pages/login.js';
import { register } from './src/pages/register.js';
import "./style.css"

document.addEventListener("DOMContentLoaded", function() {
    //login();
    register();
});