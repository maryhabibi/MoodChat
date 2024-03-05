// client-side js, loaded by index.html
// run by the browser each time the page is loaded

console.log("hello world :o");

/********************************************************************
 * socket setup
 *
 * replace URL with the URL to your own project!!!
 */
const URL = "http://127.0.0.1:1234/"; // replace!
const socket = io.connect(URL);

socket.on("receiveData", onReceiveData);

/********************************************************************
 * HTML elements we'll need to access here in the JavaScipt
 *
 */

const container = document.getElementById("container");
const grid = document.getElementById("grid");

// chat
const chatForm = document.getElementById("chat");
const chatInput = document.getElementById("chatText");
const chatSubmit = document.getElementById("chatSubmit");
const chatHistory = document.getElementById("chatHistory");

// username entry
let username;
const usernameForm = document.getElementById("usernameForm");
const usernameInput = document.getElementById("username");
const usernameSubmit = document.getElementById("usernameSubmit");

/********************************************************************
 * set username:
 *
 * the username entry uses a form element, which can trigger a submit
 * event when the enter key is pressed in the textbox or when the
 * user presses the button. when that happens, we check the event's
 * "submitter" to see if it was in fact the username form,
 * then grab the text from the input element to serve as the user's
 * name in the chat. then, hide the username form elements and reveal
 * the chat interface (which is initially made invisible in CSS).
 */
usernameForm.addEventListener("submit", function(event) {
  
  // make sure that form submission came from username
  // (not chat input)
  if (event.submitter === usernameInput || event.submitter === usernameSubmit) {

    // remember username from the text box:
    username = usernameInput.value;
    
    // hide username form on the page and show the chat!
    usernameForm.style.visibility = "hidden";
    container.removeChild(usernameForm);

    grid.style.visibility = "visible";
    chatForm.style.visibility = "visible";

    // prevents page from refreshing when form is submitted
    event.preventDefault();
  }
});

/********************************************************************
 * attempt to send what's in the textbox to the server, and out to
 * other clients.
 *
 * if you want to add another kind of message, follow a similar
 * structure here: create a data object for the message, and then
 * call the sendData function with a name of the message type
 * and the data object. add an eventlistener that sends the data
 * when the user does something.
 */

chatForm.addEventListener("submit", function(event) {

  // make sure that form submission came from chat
  // (not username input)
  if (event.submitter === chatSubmit || event.submitter === chatInput) {
    
    // get what's typed the box:
    const text = chatInput.value;

    // don't send empty text
    if (text === "") {
      return;
    }

    // construct the message to send
    // TODO: remix this to send data needed for your protocol
    let data = {
      message: text,
      from: socket.id,
      displayName: username
      // add your own data here, using this pattern:
      // fieldName: value,
    };

    // send the data to the server
    sendData("chatMessage", data);

    // reset the text box to be empty
    chatInput.value = "";

    // prevents page from refreshing when form is submitted
    event.preventDefault();
  }
});

/********************************************************************
 * general function for sending data from client to the server.
 * anything sent using sendData as constructed in the template
 * will be accessible to other clients (and this one) automatically
 * via receiveData.
 *
 * taken from/modeled after https://github.com/L05/p5.multiplayer
 */
function sendData(datatype, data) {
  data.type = datatype;
  socket.emit("sendData", data);
}

/********************************************************************
 * Process received messages.
 */
function onReceiveData(data) {
  // TODO: Input data processing here. --->

  console.log(data);

  if (data.type === "chatMessage") {
    // note: "chatMessage" here matches when the text is sent,
    // if you add other events, make sure the names match in both places.
    addChatMessage(data.from, data.displayName, data.message);
  }

  // <----

  /* Example:
     if (data.type === 'myDataType') {
       processMyData(data);
     }

     Use `data.type` to get the message type sent by host.
  */
}

function addChatMessage(senderId, displayName, text) {
  // TODO: rewrite this function to add/update elements on the page
  // per your design, or add other functions like this for different
  // types of messages/events.
  
  // the chat history is a ul (unordered list), so every
  // message it contains is an li (list item). we'll start
  // by making a new list item to contain the content and
  // assign it an appropriate class from our CSS.
  let newMessageElement = document.createElement("li");
  newMessageElement.classList.add("message");
  
  // we'll also apply a class to indicate if the message
  // came from this client, in case we want to display it
  // differently (for example, left aligning the message,
  // as many chat apps in 2021 do)
  if (senderId === socket.id) {
    newMessageElement.classList.add("fromMe");
  }
  
  // this div will hold the display name of the sender,
  // and it will be contained in the list element:
  let userP = document.createElement("div");
  userP.innerHTML = displayName;
  newMessageElement.appendChild(userP);
  
  // this paragraph will hold the text of the message
  // received, and will also be contained in the list element:
  let msgP = document.createElement("p");
  msgP.innerHTML = text;
  newMessageElement.appendChild(msgP);

  // we've got all parts of the message ready, so now we
  // add this new message to the existing chatHistory
  chatHistory.appendChild(newMessageElement);
  
  // and autoscroll to the bottom of the chat history,
  // since our new message is displayed at the bottom
  // and we want to be able to see it
  chatHistory.scrollTop = chatHistory.scrollHeight;
}
