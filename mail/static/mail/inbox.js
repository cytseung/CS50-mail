document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#send').disabled = false;
  // send email
  document.querySelector('#compose-form').onsubmit = event=>{
    event.preventDefault();
    document.querySelector('#send').disabled = true;
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    send_email(recipients, subject, body);

    
  };
  
}

function load_mailbox(mailbox) {
  console.log("load_mailbox() called")
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // console.log(`fetching ${mailbox}`)

  // Load emails in mailbox
  fetch(`/emails/${mailbox}`)
  // .then(console.log("after fetch"))
  .then(response => response.json())
  // .then(console.log("after response"))
  .then(emails => {
    // Print emails
    console.log(emails);
    for (const i in emails){
      const element = document.createElement('div');
      element.className = "email-box"
      if (emails[i]["read"] === true){
        element.style.backgroundColor  = "gray";
      }else{
        element.style.backgroundColor = "white";
      }
      element.innerHTML = `${emails[i]["sender"]} ${emails[i]["subject"]} ${emails[i]["timestamp"]}`;
      element.addEventListener('click', ()=>load_email(emails[i]), false);
      if (mailbox == "inbox" || mailbox == "archive"){
        if (emails[i]["archived"] == false){
          element.innerHTML += `<button class="archive-button">Archive</button>`;
          archvbutton = element.children[0];
          archvbutton.addEventListener('click', (event)=>{event.stopPropagation();}, false);
          archvbutton.addEventListener('click', ()=>archive_email(emails[i], true))
        }else{
          element.innerHTML += `<button class="archive-button">Unarchive</button>`;
          archvbutton = element.children[0];
          element.children[0].addEventListener('click', (event)=>{event.stopPropagation();}, false);
          archvbutton.addEventListener('click', ()=>archive_email(emails[i], false))
        }
      }
      document.querySelector('#emails-view').append(element);
    }
  })
  .catch((error) => {
    console.log("failed to fetch mailbox");
    console.log(error);
  });
}

function send_email(recipients, subject, body){
  // console.log(`${recipients},${subject},${body}`);
    console.log("send_email() called")
    fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
    recipients: recipients,
    subject: subject,
    body: body
    })
  })
  .then(async response => {
    console.log(response.status)
    if (response.status == 201){
      load_mailbox('sent');
    }
    result = await response.json()
    console.log(result);
    if (response.status == 400){
      alert(result["error"])
      document.querySelector('#send').disabled = false;
    }
  })
  .catch((error) => {
    console.log(error);
    alert(error);
  });
}

function load_email(email){
  fetch(`/emails/${email["id"]}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  .catch((error) => {
    // console.log("failed to update read");
    console.log(error);
  })
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'block';
  let recipients = email["recipients"];
  e = document.querySelector('#content');
  e.innerHTML = `<strong>From:</strong> ${email["sender"]}<br><strong>To:</strong> `;
  for (const i in recipients){
    e.innerHTML += recipients[i];
    e.innerHTML += ` `
  }
  e.innerHTML += `<br><strong>Subject:</strong> ${email["subject"]}<br><strong>Timestamp:</strong>${email["timestamp"]}<br>`
  e.innerHTML += `<button>Reply</button><hr>${email["body"]}`
}

function archive_email(email, archive){
  console.log("function called!")
  if (archive == true){
    fetch(`/emails/${email["id"]}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .catch((error) => {
      console.log(error);
    })
  }
  else{
      fetch(`/emails/${email["id"]}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
      .catch((error) => {
        console.log(error);
      })
  }
  load_mailbox("inbox");
} 