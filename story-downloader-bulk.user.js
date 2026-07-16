// ==UserScript==
// @name         Story Downloader — Facebook & Instagram (Single + Bulk)
// @namespace    https://greasyfork.org/users/sharmanhall
// @version      2.4.0
// @description  Save Facebook & Instagram stories — download the current slide, or every slide in a user's reel individually, in one click. Videos & images supported.
// @author       sharmanhall
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMxODc3RjIiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIuNTUiIHN0b3AtY29sb3I9IiNDMTM1ODQiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjU4NTI5Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxNSIgZmlsbD0idXJsKCNnKSIvPgogIDxwYXRoIGQ9Ik0zMiAxNSBWMzciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMjIgMzAgbDEwIDEwIGwxMCAtMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8cmVjdCB4PSIxOSIgeT0iNDYiIHdpZHRoPSIyNiIgaGVpZ2h0PSI1LjUiIHJ4PSIyLjc1IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo=
// @homepageURL  https://github.com/tyhallcsu/fb-story-downloader
// @supportURL   https://github.com/tyhallcsu/fb-story-downloader/issues
// @match        *://*.facebook.com/*
// @match        *://*.instagram.com/*
// @grant        none
// @license      GPL3
// ==/UserScript==
// Based on "Story Downloader - Facebook and Instagram" v2.2.2 by oscar370
// (https://greasyfork.org/scripts/507431) — licensed GPL3. "Download all
// slides" bulk feature added by sharmanhall.
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };

  // src/constants.ts
  var MAX_ATTEMPTS = 10;
  var SELECTORS = {
    facebook: {
      topBar: "div.xtotuo0",
      userName: "span.xuxw1ft.xlyipyv"
    },
    instagram: {
      topBar: "div.x1xmf6yo",
      userName: ".x1i10hfl"
    }
  };
  var BULK_SLIDE_WAIT_MS = 1200;
  var BULK_MAX_SLIDES = 200;
  var BULK_DOWNLOAD_GAP_MS = 350;

  // src/utils.ts
  function $(selector, scope = document) {
    return scope.querySelector(selector);
  }
  function $$(selector, scope = document) {
    return [...scope.querySelectorAll(selector)];
  }
  function create(tag, attrs = {}) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      el[k] = v;
    });
    return el;
  }
  function remove(el) {
    el.remove();
  }
  function append(p, c) {
    p.append(c);
  }
  function css(el, styles) {
    Object.assign(el.style, styles);
  }
  function on(el, ev, fn, opts) {
    el.addEventListener(ev, fn, opts);
  }
  function html(el, value) {
    if (value === void 0) return el.innerHTML;
    el.innerHTML = value;
  }
  function text(el, value) {
    if (value === void 0) return el.textContent;
    el.textContent = value;
  }
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // src/helpers.ts
  var isDev = false;
  function log(...args) {
    if (isDev) console.log("[StoryDownloader]", ...args);
  }
  function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /android|iphone|kindle|ipad|playbook|silk/i.test(
      userAgent
    );
    return isMobileUA;
  }
  function isFacebookPage() {
    return /(facebook)/.test(window.location.href);
  }
  function getPlatformConfig() {
    const platform = isFacebookPage() ? "facebook" : "instagram";
    return SELECTORS[platform];
  }
  function getFbMobileProfileNodes() {
    const nameSpans = $$(
      "div[data-mcomponent='ServerTextArea']  span"
    );
    const nameSpan = nameSpans.find(
      (el) => el.offsetHeight > 0 && el.closest("[role='button']")
    );
    if (!nameSpan) return null;
    return { nameSpan };
  }

  // src/store.ts
  var state = {
    mediaUrl: null,
    detectedVideo: null,
    observerTimeout: null,
    lastUrl: "",
    isPolling: false,
    bulkDownloading: false
  };
  function getState() {
    return __spreadValues({}, state);
  }
  function setState(partial) {
    const newState = __spreadValues(__spreadValues({}, getState()), partial);
    state = newState;
  }

  // src/downloader.ts
  async function detectMedia() {
    const video = findVideo();
    const image = findImage();
    if (video) {
      setState({ mediaUrl: video, detectedVideo: true });
    } else if (image) {
      setState({ mediaUrl: image.src, detectedVideo: false });
    } else {
      setState({ mediaUrl: null, detectedVideo: null });
    }
    log("Media URL detected:", getState().mediaUrl);
  }
  function findVideo() {
    const videos = $$("video").filter(
      (v) => v.offsetHeight > 0
    );
    log("Video elements: ", videos);
    for (const video of videos) {
      const url = searchVideoSource(video);
      if (url) {
        return url;
      }
    }
    return null;
  }
  function searchVideoSource(video) {
    if (video.currentSrc && !video.currentSrc.startsWith("blob")) {
      return video.currentSrc;
    }
    const rootElement = findReactRoot();
    if (!rootElement) return null;
    const rootFiberKey = Object.keys(rootElement).find(
      (key) => key.startsWith("__reactContainer") || key.startsWith("__reactFiber")
    );
    if (!rootFiberKey) return null;
    const rootFiber = rootElement[rootFiberKey];
    const videoFiber = findFiberForElement(rootFiber, video);
    if (!videoFiber) return null;
    let fiber = videoFiber.return;
    while (fiber) {
      const props = fiber.memoizedProps || fiber.pendingProps;
      if (props) {
        const url = findVideoUrlInProps(props);
        if (url) return url;
      }
      fiber = fiber.return;
    }
    return null;
  }
  function findReactRoot() {
    const bodyElements = document.querySelectorAll("body *");
    for (const el of bodyElements) {
      if (Object.keys(el).some((key) => key.startsWith("__reactContainer"))) {
        return el;
      }
    }
    const allElements = document.querySelectorAll("*");
    for (const el of allElements) {
      if (Object.keys(el).some((key) => key.startsWith("__reactContainer"))) {
        return el;
      }
    }
    return null;
  }
  function findFiberForElement(rootFiber, target) {
    let found = null;
    function dfs(fiber) {
      if (!fiber || found) return;
      if (fiber.stateNode === target) {
        found = fiber;
        return;
      }
      if (fiber.child) dfs(fiber.child);
      if (fiber.sibling) dfs(fiber.sibling);
    }
    dfs(rootFiber);
    return found;
  }
  function findVideoUrlInProps(obj, visited = /* @__PURE__ */ new Set()) {
    if (!obj || typeof obj !== "object" || visited.has(obj)) return null;
    visited.add(obj);
    const urlProps = [
      "hd_src",
      "sd_src",
      "hdSrc",
      "sdSrc",
      "playable_url",
      "browser_native_hd_url",
      "browser_native_sd_url",
      "progressive_url",
      "src",
      "url",
      "videoUrl"
    ];
    for (const prop of urlProps) {
      try {
        const value = obj[prop];
        if (typeof value === "string" && value.startsWith("http")) {
          return value;
        }
      } catch (e) {
      }
    }
    for (const key in obj) {
      try {
        const value = obj[key];
        if (value && typeof value === "object") {
          const result = findVideoUrlInProps(value, visited);
          if (result) return result;
        }
      } catch (e) {
      }
    }
    return null;
  }
  function findImage() {
    const images = $$("img").filter(
      (img) => img.offsetHeight > 0 && img.src.includes("cdn")
    );
    return images.find((img) => img.height > 400) || null;
  }
  function getStoryUserName() {
    var _a;
    const config = getPlatformConfig();
    const isFb = isFacebookPage();
    const user = $$(config.userName).find((e) => {
      if (!(e instanceof HTMLElement)) return false;
      if (isFb && !isMobile()) {
        return e.offsetWidth > 0;
      }
      return e.offsetHeight > 0 && e.offsetHeight < 35;
    });
    if (user) {
      if (isFb) return (text(user) || "").trim() || "unknown";
      return user.pathname.replace(/\//g, "") || "unknown";
    }
    if (isMobile() && isFb) {
      const nameSpan = (_a = getFbMobileProfileNodes()) == null ? void 0 : _a.nameSpan;
      if (nameSpan) return (nameSpan.textContent || "").trim() || "unknown";
    }
    return "unknown";
  }
  function generateFileName() {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const detectedVideo = getState().detectedVideo;
    const userName = getStoryUserName();
    const extension = detectedVideo ? "mp4" : "jpg";
    return `${userName}-${timestamp}.${extension}`;
  }
  async function downloadMedia(url, filename) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = create("a", {
        href: URL.createObjectURL(blob),
        download: filename
      });
      append(document.body, link);
      link.click();
      remove(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download error:", error);
    }
  }

  // Bulk-download support
  function advanceToNextSlide() {
    const nextBtn = $$("button, div[role='button']").find((el) => {
      if (!(el instanceof HTMLElement) || el.offsetHeight === 0) return false;
      const label = (el.getAttribute("aria-label") || "").toLowerCase();
      return label === "next" || label === "next story" || label.startsWith("next ");
    });
    if (nextBtn) {
      nextBtn.click();
      return;
    }
    const targets = [document.activeElement, document.body, document];
    for (const t of targets) {
      if (!t) continue;
      try {
        t.dispatchEvent(new KeyboardEvent("keydown", {
          key: "ArrowRight",
          code: "ArrowRight",
          keyCode: 39,
          which: 39,
          bubbles: true,
          cancelable: true
        }));
      } catch (e) {
      }
    }
  }
  async function waitForNewMedia(previousUrl, previousUserName, timeoutMs = 4000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await sleep(200);
      await detectMedia();
      const { mediaUrl } = getState();
      const currentUser = getStoryUserName();
      if (currentUser !== previousUserName) return { changed: true, userChanged: true };
      if (mediaUrl && mediaUrl !== previousUrl) return { changed: true, userChanged: false };
    }
    return { changed: false, userChanged: false };
  }
  function updateBulkStatus(msg) {
    const label = $("#downloadAllBtnLabel");
    if (label) text(label, msg);
  }
  async function handleDownloadAll() {
    if (getState().bulkDownloading) return;
    setState({ bulkDownloading: true });
    const btn = $("#downloadAllBtn");
    if (btn) btn.disabled = true;
    const originalLabel = $("#downloadAllBtnLabel");
    const originalText = originalLabel ? text(originalLabel) : "";
    try {
      await detectMedia();
      const startUser = getStoryUserName();
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const seenUrls = /* @__PURE__ */ new Set();
      const queue = [];
      let index = 1;
      let repeats = 0;
      while (index <= BULK_MAX_SLIDES) {
        const { mediaUrl, detectedVideo } = getState();
        const currentUser = getStoryUserName();
        if (currentUser !== startUser) {
          log("User changed, ending capture");
          break;
        }
        if (!mediaUrl) {
          log("No media on current slide, stopping");
          break;
        }
        if (seenUrls.has(mediaUrl)) {
          repeats++;
          if (repeats >= 2) {
            log("Same URL seen twice in a row, assuming end");
            break;
          }
        } else {
          repeats = 0;
          seenUrls.add(mediaUrl);
          const ext = detectedVideo ? "mp4" : "jpg";
          const padded = String(index).padStart(2, "0");
          queue.push({
            url: mediaUrl,
            filename: `${startUser}-${timestamp}-${padded}.${ext}`
          });
          index++;
          updateBulkStatus(`Capturing ${queue.length}...`);
        }
        const prevUrl = mediaUrl;
        advanceToNextSlide();
        await sleep(BULK_SLIDE_WAIT_MS);
        const { changed, userChanged } = await waitForNewMedia(prevUrl, startUser, 3500);
        if (userChanged) break;
        if (!changed) {
          log("Slide did not change after advance, stopping");
          break;
        }
      }
      updateBulkStatus(`Downloading ${queue.length}...`);
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        updateBulkStatus(`Downloading ${i + 1}/${queue.length}`);
        await downloadMedia(item.url, item.filename);
        await sleep(BULK_DOWNLOAD_GAP_MS);
      }
      updateBulkStatus(`Done: ${queue.length}`);
      await sleep(1500);
    } catch (error) {
      log("Bulk download failed:", error);
      updateBulkStatus("Error");
      await sleep(1500);
    } finally {
      setState({ bulkDownloading: false });
      if (btn) btn.disabled = false;
      updateBulkStatus(originalText);
    }
  }

  // src/dom.ts
  var DOWNLOAD_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
  class="bi bi-file-arrow-down-fill" viewBox="0 0 16 16">
  <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2
    M8 5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1
    .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1
    .708-.708L7.5 9.293V5.5A.5.5 0 0 1 8 5"/>
</svg>
`;
  var DOWNLOAD_ALL_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor"
  viewBox="0 0 16 16" style="vertical-align:-4px">
  <path d="M4 1.5a.5.5 0 0 0-1 0v2H1a.5.5 0 0 0 0 1h2v2a.5.5 0 0 0 1 0v-2h2a.5.5 0 0 0 0-1H4z" opacity=".0"/>
  <path d="M9 0H3a2 2 0 0 0-2 2v10h1V2a1 1 0 0 1 1-1h6zM5 4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zm5.5 2a.5.5 0 0 0-1 0v4.793L8.354 9.646a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L10.5 10.793z"/>
</svg>
<span id="downloadAllBtnLabel" style="font-size:11px;margin-left:4px;font-weight:600;letter-spacing:.3px">ALL</span>
`;
  var BUTTON_STYLES = {
    position: "relative",
    border: "none",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    zIndex: "9999"
  };
  var BULK_BUTTON_STYLES = {
    position: "relative",
    border: "none",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    zIndex: "9999",
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 6px",
    marginLeft: "2px"
  };
  var CONTAINER_MOBILE_STYLES = {
    position: "absolute",
    bottom: "70px",
    right: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-end"
  };
  function createButtonWithPolling() {
    const isPolling = getState().isPolling;
    if (isPolling) return;
    setState({ isPolling: true });
    let attempts = 0;
    const poll = () => {
      const existingBtn = $("#downloadBtn");
      if (existingBtn) {
        setState({ isPolling: false });
        return;
      }
      const createdBtn = createButton();
      if (createdBtn || attempts >= MAX_ATTEMPTS) {
        setState({ isPolling: false });
        return;
      }
      attempts++;
      setTimeout(poll, 500);
    };
    poll();
  }
  function makeSingleButton() {
    const btn = create("button", { id: "downloadBtn", title: "Download this slide" });
    html(btn, DOWNLOAD_ICON);
    css(btn, BUTTON_STYLES);
    on(btn, "click", () => handleDownload());
    return btn;
  }
  function makeBulkButton() {
    const btn = create("button", { id: "downloadAllBtn", title: "Download every slide in this user's story" });
    html(btn, DOWNLOAD_ALL_ICON);
    css(btn, BULK_BUTTON_STYLES);
    on(btn, "click", () => handleDownloadAll());
    return btn;
  }
  function createButton() {
    if (isFacebookPage() && isMobile()) {
      const container = create("div");
      css(container, CONTAINER_MOBILE_STYLES);
      append(container, makeSingleButton());
      append(container, makeBulkButton());
      append(document.body, container);
      return container.firstChild;
    }
    const config = getPlatformConfig();
    const topBars = $$(config.topBar);
    const topBar = topBars.find(
      (bar) => bar instanceof HTMLElement && bar.offsetHeight > 0
    );
    if (!topBar) {
      log("No suitable top bar found");
      return null;
    }
    const single = makeSingleButton();
    const bulk = makeBulkButton();
    append(topBar, single);
    append(topBar, bulk);
    log("Download buttons added", single, bulk);
    return single;
  }
  async function handleDownload() {
    try {
      await detectMedia();
      const mediaUrl = getState().mediaUrl;
      if (!mediaUrl) throw new Error("No multimedia content was found");
      const filename = generateFileName();
      await downloadMedia(mediaUrl, filename);
    } catch (error) {
      log("Download failed:", error);
    }
  }

  // src/main.ts
  log("Initializing observer...");
  setupMutationObserver();
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      if (getState().bulkDownloading) return;
      const hasRelevantChanges = mutations.some(
        (m) => m.addedNodes.length > 0 || m.removedNodes.length > 0
      );
      if (!hasRelevantChanges) return;
      const observerTimeout = getState().observerTimeout;
      if (observerTimeout) clearTimeout(observerTimeout);
      const timeout = setTimeout(() => {
        checkPageStructure();
      }, 300);
      setState({ observerTimeout: timeout });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  function checkPageStructure() {
    const lastUrl = getState().lastUrl;
    const currentUrl = window.location.href;
    const isStoryPage = /(\/stories\/)/.test(currentUrl);
    const btn = $("#downloadBtn");
    const bulkBtn = $("#downloadAllBtn");
    if (!isStoryPage) {
      if (btn) remove(btn);
      if (bulkBtn) remove(bulkBtn);
      return;
    }
    if (currentUrl !== lastUrl || !btn) {
      setState({ lastUrl: currentUrl });
      createButtonWithPolling();
    }
  }
})();
