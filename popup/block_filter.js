var myWindowId;
const contentBox = document.querySelector("#panel-content");

contentBox.setAttribute("contenteditable", true);

function applyFilters(){
    browser.tabs.query({windowId: myWindowId, active: true}).then((tabs) => {
        let contentToStore = {};
        console.log(contentBox.textContent)
        contentToStore["tcnlpf"] = contentBox.textContent;
        browser.storage.local.set(contentToStore);
    });
}

/*
Update the sidebar's content.
1) Get the active tab in this sidebar's window.
2) Get its stored content.
3) Put it in the content box.
*/
function updateContent() {
    browser.tabs.query({windowId: myWindowId, active: true})
        .then((tabs) => {
        return browser.storage.local.get("tcnlpf");
        })
        .then((storedInfo) => {
        contentBox.textContent = storedInfo[Object.keys(storedInfo)[0]];
    });
}

/*
When the popup loads, get the ID of its window,
and update its content.
*/
browser.windows.getCurrent({populate: true}).then((windowInfo) => {
myWindowId = windowInfo.id;
updateContent();
});