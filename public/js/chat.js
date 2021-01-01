const socket = io();

socket.on("welcome", (msg) => {
    console.log(msg);
});

// socket.on("countUpdated", (count) => {
//     console.log("count updated", count);
// });

// document.querySelector("#inc").addEventListener("click", () => {
//     console.log("clicked");
//     socket.emit("increment");
// });

const myForm = document.querySelector("form");
const $btnLoc = document.querySelector("#btnLoc");
const $btnInsult = document.querySelector("#btnInsult");

const $form = document.querySelector("form");
const $input = $form.querySelector("input");
const $button = $form.querySelector("button");

const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

const $msgTemp = document.querySelector("#msg-template").innerHTML;
const $linkTemp = document.querySelector("#link-template").innerHTML;
const $sideTemp = document.querySelector("#sidebar-template").innerHTML;

// options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const autoscroll = (params) => {
    const $newMessage = $messages.lastElementChild;

    const newMsgStyles = getComputedStyle($newMessage);
    const newMsgMargin = parseInt(newMsgStyles.marginBottom);
    const newMsgHeight = $newMessage.offsetHeight + newMsgMargin;

    const visibleHeight = $messages.offsetHeight;
    const contentHeight = $messages.scrollHeight;

    const scrollOffSet = $messages.scrollTop + visibleHeight;

    if (contentHeight - newMsgHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight;
    }
    console.log(newMsgMargin);
};

socket.on("msg", (msg) => {
    //    const msgElement = document.querySelector("#msgs");
    //    msgElement.appendChild(document.createTextNode(msg));

    console.log("incoming", msg);
    const html = Mustache.render($msgTemp, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format("h:mm:ss"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("linkMsg", (msg) => {
    //    const msgElement = document.querySelector("#msgs");
    //    msgElement.appendChild(document.createTextNode(msg));

    console.log("incoming", msg);
    const html = Mustache.render($linkTemp, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format("h:mm:ss"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("roomData", (msg) => {
    console.log("room data", msg);
    const html = Mustache.render($sideTemp, {
        room: msg.room,
        users: msg.users,
    });
    $sidebar.innerHTML = html;
});

myForm.addEventListener("submit", (e) => {
    e.preventDefault();
    $button.setAttribute("disabled", "disabled");
    const msg = e.target.elements.msg.value;
    console.log(" sending ", msg);
    socket.emit("newMsg", msg, (error) => {
        $button.removeAttribute("disabled");
        $input.value = "";
        $input.focus();

        if (error) {
            console.log("ERROR", msg);
        }
    });
});

$btnInsult.addEventListener("click", () => {
    socket.emit("newMsg", getInsult(), () => {});
});

$btnLoc.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("geolocation is not supported by your broser");
    }
    $btnLoc.setAttribute("disabled", "foo");

    navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit(
            "myLoc",
            {
                lat: pos.coords.latitude,
                long: pos.coords.longitude,
            },
            (err) => {
                $btnLoc.removeAttribute("disabled");
                console.log("location shared");
            }
        );
        console.log(pos);
    });
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "./";
    }
});
