// Copyright (c) 2013 mitnk. All rights reserved.

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(null, {file: "send_to_kindle.js"});
});
