
// These are variables for Twitch elements related to chat.
// We expose them here so changes can be easily made if Twitch changes them.
twitchChatUlClass = ".chat-scrollable-area__message-container.tw-flex-grow-1.tw-pd-b-1";
twitchChatAuthorClass = ".chat-author__display-name"
twitchChatMessageClass = ".chat-line__message";
twitchChatMessageContent = ".text-fragment";

console.log("TwitchChatNLPFilter is running!");

const THRESH = 0.25
previous_messages = []

function get_k_grams(str, k){
    kgrams = []
    for(var i = 0; i < str.length - (k-1); i++){
        kgram = str.substring(i, i+k)
        if (kgrams.indexOf(kgram) > -1){
            continue
        } else {
            kgrams.push(kgram)
        }
    }

    return kgrams
}

function jaccard(s1, s2){
    var n_intersect = 0

    for (gram1 of s1){
        if (s2.indexOf(gram1) > -1){
            n_intersect += 1
        }
    }

    var n_union = s1.length + s2.length - n_intersect

    return n_intersect/n_union

}

function should_be_blocked(str){

    var kgrams = get_k_grams(str, 2)
    console.log("kgrams message")
    console.log(kgrams)

    var block = false

    var n_similar = 0
    for (prev_msg_grams of previous_messages){
        var sim = jaccard(kgrams, prev_msg_grams)
        console.log("Previous message and sim")
        console.log(prev_msg_grams)
        console.log(sim)
        if (sim > THRESH){
            n_similar++;
        }
    }

    console.log(previous_messages);
    console.log(n_similar);

    if (n_similar/previous_messages.length > THRESH){
        block = true
    }

    previous_messages.push(kgrams)

    if (previous_messages.length > 30){
        previous_messages.shift();
    }

    return block;
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
        try{
            console.log("Hiding message: " + messageElement.html());

            // Just set the html to the empty string
            // Calling .remove() causes the entire chat window to get deleted sometimes.
            chatMessage.html("")
        } catch {
            console.log("failed to remove message")
        }
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
