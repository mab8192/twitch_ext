browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.twitchChat) {
      browser.pageAction.show(sender.tab.id);
      browser.pageAction.setTitle({tabId: sender.tab.id, title: "In search of bards..."});
      sendResponse({registered: true});
    }
  });
