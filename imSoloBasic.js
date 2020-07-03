// ==UserScript==
// @name         ImSolo Basic Agar.io Script
// @namespace    imsolo
// @version      1.0.0.d03.07.2020
// @description  Basic script with zoom, macro feed and macro splits. Slow teamers are unskilled garbage.
// @website      https://imsolo.pro/
// @author       Cuadrix#7155
// @match        *://agar.io/*
// @run-at       document-body
// @grant        none
// ==/UserScript==

const config = {
    settings: undefined,
    settingsIds: undefined,
    cookie: "imSoloBasic",
    centerX: undefined,
    centerY: undefined,
    feeding: false,
    minimap: false,
    stopped: false,
    feedSpeed: 5,
    splitSpeed: 25,
    settingsHeight: "550px",
    mainAd: "https://i.ibb.co/NxD3PJK/slowtemnub.png",
};

const getDefaultSettings = () => {
    return {
        "macro-feed": {label: "Macro feed", keyCode: 87, keyName: "w"},
        "freeze-cell": {label: "Freeze cell", keyCode: 83, keyName: "s"},
        "toggle-minimap": {label: "Toggle minimap", keyCode: 77, keyName: "m"},
        "double-split": {label: "Double split", keyCode: 68, keyName: "d"},
        "triple-split": {label: "Triple split", keyCode: 90, keyName: "z"},
        "quadruple-split": {label: "Quadruple split", keyCode: 81, keyName: "q"}
    };
};

const resetSettings = () => {
    const defaultSettings = getDefaultSettings();
    for (let i = 0; i < config.settingsIds.length; i++) {
        const id = config.settingsIds[i];
        config.settings[id] = defaultSettings[id];
        document.getElementById(id).value = config.settings[id].keyName;
    }
    setCookie();
};

const getCookie = () => {
    const pairs = document.cookie.split(/; */);
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split(/=(.*)/, 2);
        if (config.cookie === pair[0]) {
            return JSON.parse(pair[1]);
        }
    }
};

const setCookie = () => {
    const expires = new Date(Date.now() + 3600 * 1000 * 24 * 365);
    const value = JSON.stringify(config.settings);
    document.cookie = config.cookie + "=" + value + "; path=/; expires=" + expires.toUTCString();
};

const removeAds = () => {
    const ads = ["adsLeft", "adsRight", "adsTop", "adsBottom", "advertisement", "adsGameOver"];
    for (let i = 0; i < ads.length; i++) {
        document.getElementById(ads[i]).remove();
    }
};

const addCssToDocument = (css) => {
  const style = document.createElement("style");
  style.innerText = css;
  style.type = "text/css";
  document.head.appendChild(style);
};

const addSettingsCss = () => {
    addCssToDocument("#extra-title {width: 100%; text-align: center; font-weight: bold;}" +
                     "#extra-reset {color: inherit; font-size: 12px;}" +
                     ".extra-option {width: 100%; padding: 15px 0px 15px 0px;}" +
                     ".input-label {position: absolute; left: 12%;}" +
                     ".key-input {position: absolute; right: 12%; width: 32%; text-align: center;}");
};

const addSettings = () => {
    const options = document.getElementsByClassName("options")[0];
    options.innerHTML += "<div id='extra-title'>Extra settings <a id='extra-reset'>[ Reset ]</a></div>";
    for (let i = 0; i < config.settingsIds.length; i++) {
        const id = config.settingsIds[i];
        const label = config.settings[id].label;
        const keyName = config.settings[id].keyName;
        options.innerHTML += `<div class='extra-option'><label class='input-label'>${label}</label><input type='text' class='key-input' id='${id}' readonly value='${keyName}'/></div>`;
    }
    document.getElementById("extra-reset").onclick = () => {
        resetSettings();
    };
};

const setupSettingsUI = () => {
    document.getElementById("settingsButton").onclick = () => {
        document.getElementsByClassName("dialog")[0].style.height = "550px";
        addSettingsCss();
        addSettings();
    };
};

const setupMainUI = () => {
    document.getElementById("mainui-ads").innerHTML += "<img src='" + config.mainAd + "'></img>";
};

const setupUI = () => {
    removeAds();
    setupSettingsUI();
    setupMainUI();
};

const onDomContentLoaded = () => {
    const cachedSettings = getCookie();
    if (typeof cachedSettings == "object") {
        config.settings = cachedSettings;
    } else {
        config.settings = getDefaultSettings();
    }
    config.settingsIds = Object.keys(config.settings);
    setupUI();
};

// Macros
const mouseEvent = (message, data) => {
    const event = new MouseEvent(message, data);
    window.canvas.dispatchEvent(event);
};

const feed = () => {
    if (config.feeding) {
        window.core.eject();
        setTimeout(feed, config.feedSpeed);
    }
};

const split = () => {
    window.core.split();
};

const enableMinimap = (state) => {
    config.minimap = state;
    window.core.setMinimap(state);
    window.core.playersMinimap(state);
};

const keyDown = (event) => {
    if (event.keyCode == config.settings["macro-feed"].keyCode && config.feeding === false) {
        config.feeding = true;
        setTimeout(feed, config.feedSpeed);
    }
    if (event.keyCode == config.settings["double-split"].keyCode) {
        split();
        setTimeout(split, config.splitSpeed);
    }
    if (event.keyCode == config.settings["triple-split"].keyCode) {
        split();
        setTimeout(split, config.splitSpeed);
        setTimeout(split, config.splitSpeed * 2);
    }
    if (event.keyCode == config.settings["quadruple-split"].keyCode) {
        split();
        setTimeout(split, config.splitSpeed);
        setTimeout(split, config.splitSpeed * 2);
        setTimeout(split, config.splitSpeed * 3);
     }
    if (event.keyCode == config.settings["freeze-cell"].keyCode) {
        config.stopped = !config.stopped;
        config.centerX = window.canvas.width / 2;
        config.centerY = window.canvas.height / 2;
        mouseEvent("mousemove", {clientX: config.centerX, clientY: config.centerY});
    }
    if (event.keyCode == config.settings["toggle-minimap"].keyCode) {
        enableMinimap(!config.minimap);
    }
    if (config.settingsIds.includes(document.activeElement.id)) {
        const activeElement = document.activeElement.id;
        config.settings[activeElement].keyCode = event.keyCode;
        config.settings[activeElement].keyName = event.key;
        document.getElementById(activeElement).value = event.key;
        setCookie();
    }
};

const keyUp = (event) => {
    if (event.keyCode == config.settings["macro-feed"].keyCode) {
        config.feeding = false;
    }
};

const mouseMove = (event) => {
    if (config.stopped) {
        mouseEvent("mousemove", {clientX: config.centerX, clientY: config.centerY});
    }
};

// Zoom
const replaceCore = (core) => {
    const newCore = document.createElement("script");
    newCore.type = "text/javascript";
    newCore.async = true;
    newCore.textContent = core.replace(/;if\((\w)<1\.0\){/i, `;if(0){`);
    document.body.appendChild(newCore);
};

const httpRequest = (method, url, callback) => {
    const request = new XMLHttpRequest();
    request.open(method, url, true);
    request.send();
    request.onload = () => {
        callback(request.responseText);
    };
};

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (/agario\.core\.js/i.test(node.src)) {
                observer.disconnect();
                node.parentNode.removeChild(node);
                httpRequest("GET", node.src, replaceCore);
            }
        });
    });
});

observer.observe(document, {childList: true, subtree: true});
window.addEventListener("DOMContentLoaded", onDomContentLoaded);
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
window.addEventListener("mousemove", mouseMove);