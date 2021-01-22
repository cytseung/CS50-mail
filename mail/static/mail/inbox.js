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

  // send email
  document.querySelector('#send').addEventListener('click', ()=>{
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    send_email(recipients, subject, body);
  });
  

  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails in mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    for (const i in emails){
      const element = document.createElement('div');
      element.className = "email-box"
      if (emails[i]["read"] === true){
        element.style.backgroundColor  = "gray";
      }else{
        element.style.backgroundColor = "white";
      }
      element.innerHTML = `${emails[i]["sender"]} ${emails[i]["subject"]} ${emails[i]["timestamp"]}`
      element.addEventListener('click', function() {
          fetch(`/emails/${emails[i]["id"]}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#content-view').style.display = 'block';
        let recipients = emails[i]["recipients"];
        e = document.querySelector('#content');
        e.innerHTML = `<strong>From:</strong> ${emails[i]["sender"]}<br><strong>To:</strong> `;
        for (const i in recipients){
          e.innerHTML += recipients[i];
          e.innerHTML += ` `
        }
        e.innerHTML += `<br><strong>Subject:</strong> ${emails[i]["subject"]}<br><strong>Timestamp:</strong>${emails[i]["timestamp"]}<br>`
        e.innerHTML += `<button>Reply</button><hr>${emails[i]["body"]}`
      });
      document.querySelector('#emails-view').append(element);

    }
  })
  .catch((error) => {
    console.log(error);
  });


}

function send_email(recipients, subject, body){
  // console.log(`${recipients},${subject},${body}`);
  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
    recipients: recipients,
    subject: subject,
    body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
}