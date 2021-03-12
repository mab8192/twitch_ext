// These are variables for Twitch elements related to chat.
// We expose them here so changes can be easily made if Twitch changes them.
twitchChatUlClass = ".chat-scrollable-area__message-container.tw-flex-grow-1.tw-pd-b-1";
twitchChatAuthorClass = ".chat-author__display-name"
twitchChatMessageClass = ".chat-line__message";
twitchChatMessageContent = ".text-fragment";

console.log("TwitchChatNLPFilter is running!");

function get_filters(){
    await browser.storage.local.get("tcnlpf").then((storedInfo) => {
        console.log(storedInfo.tcnlpf)
        return storedInfo.tcnlpf;
    })
}

console.log("pulling filters...")
var filters = get_filters();

console.log(filters)

console.log("Filters are above ^^")

function should_be_blocked(str){
    if (str.toLowerCase().includes("w")){
        return true;
    }

    return false;
}

function filter(chatMessage){
    // Grab the username of the sender
    var sender = chatMessage.find(twitchChatAuthorClass);

    // Filter based on sender
    // var blocked_senders = [];
    // if (sender.html() in blocked_senders){
    //     chatMessage.remove()
    // }

    // Grab the actual span element with the message content
    var messageElement = chatMessage.find(twitchChatMessageContent);

    // Filter based on message content
    if (should_be_blocked(messageElement.html())){
        chatMessage.remove()
        console.log("Hid message: " + messageElement.html());
    }
}


function ChatFilter() {
    // Attach listener that acts when a new chat message appears.
    return new MutationObserver(function (mutations) {
        // For each mutation object, we look for the addedNode object
        mutations.forEach(function (mutation) {
            // A chat message would be an added node
            mutation.addedNodes.forEach(function (addedNode) {
                // At this point it's potentially a chatMessage object.
                var chatMessage = $(addedNode);
                if (!chatMessage.is(twitchChatMessageClass)) {
                    // this isn't a chat message, skip processing.
                    return;
                }

                filter(chatMessage);
            });
        });
    });
}

// configuration of the observer:
var config = {attributes: false, childList: true, characterData: false};

var chatFilter = ChatFilter();

var running = false;

// The chat is dynamically loaded.
// We need to wait until the page is done loading everything in order to be
// able to grab it.
// We use a MutationObserver as a way to check for dynamically loaded content.
var htmlBody = $("body")[0];
var chatLoadedObserver = new MutationObserver(function (mutations, observer) {
    mutations.forEach(function (mutation) {
        var chatSelector = $(twitchChatUlClass);
        if (chatSelector.length > 0) {
            // Select the node element.
            var target = chatSelector[0];

            // Pass in the target node, as well as the observer options
            // do something
            // add second MutationObserver
            //compakt.observe(target, config);
            chatFilter.observe(target, config);

            // Alert page action that we found a chat and we're going to get to work.
            console.log("Twitch chat found!")

            // Unregister chatLoadedObserver. We don't need to check for the chat element anymore.
            observer.disconnect();
        }
    })
});

chatLoadedObserver.observe(htmlBody, config);
