/* global chrome */
console.log('background script is running...');
chrome.runtime.onMessage.addListener(function (message, callback) {

   if (message.page === "popup" && message.status === "VIEW_JSON") {
      viewJson();
   }
});

function viewJson(){
   chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
      activeTabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { page: "background", status: "VIEW_API_JSON" });
      });
   });
}

var root = chrome.contextMenus.create({
   title: 'API Inspect',
   contexts: ['all']
}, function () {
      chrome.contextMenus.create({
         title: 'View JSON',
         contexts: ['all'],
         parentId: root,
         onclick: function (evt) {
            viewJson();
         }
      });
});

// This is to remove X-Frame-Options header, if present
chrome.webRequest.onHeadersReceived.addListener(
   function (info) {
      var headers = info.responseHeaders;
      var index = headers.findIndex(x => x.name.toLowerCase() === "x-frame-options");
      console.log(headers);
      if (index !== -1) {
         headers.splice(index, 1);
      }
      console.log('after update header');
      console.log(headers);
      return { responseHeaders: headers };
   },
   {
      urls: ["https://api.github.com/*", "https://github.com/*"],
      types: ['sub_frame']
   },
   ['blocking', 'responseHeaders']
);