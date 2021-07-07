

document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email(false, '', ''));



  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(reply, to, reply_subject) {

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body')

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

  //for reply
  if(reply === true) {
    recipients.value = to;
    subject.value = `Re: ${reply_subject}`;
  }

  //post request
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method : 'POST',
      body: JSON.stringify({
        recipients: recipients.value,
        subject: subject.value,
        body: body.value
      })
    })
    .then(response => response.json())
    .then(result => {
      //print result
      console.log(result);
      //load mailbox
      load_mailbox('sent');
    })
    .catch(error => {
      console.log('Error:', error);
    });

    //defualt
    return false
  }
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //Print emails
    console.log(emails);
    emails.forEach(function(email) {
      const element = document.createElement('div');
      element.innerHTML = `${email.sender}\t${email.subject}\t\t${email.timestamp}`;
      element.style.border =  "thin solid grey";
      if(email.read) {
        element.style.backgroundColor = "grey";
      }else{
        element.style.backgroundColor = "white";
      }
      
      element.addEventListener('click', function() {
        console.log('This element has been clicked!')
        element.onclick = load_content(email.id, mailbox)

      });
      document.querySelector('#emails-view').append(element)
    });
  });
}

function load_content (email_id, parent_mailbox) {

  //show content and hide other views
  document.querySelector('#content-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  //Get email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    //Print email
    console.log(email);
    const sender = document.querySelector('#sender');
    const recipients = document.querySelector('#recipients');
    const subject = document.querySelector('#subject');
    const timestamp = document.querySelector('#timestamp');
    const body = document.querySelector('#body');
    const archive = document.querySelector('#archive');
    const unarchive = document.querySelector('#unarchive');
    const reply = document.querySelector('#reply');
    
    sender.innerHTML = email.sender;
    recipients.innerHTML = ""
    email.recipients.forEach((recipient)=>{
      recipients.innerHTML += (`${recipient}, `)
    }); 
    subject.innerHTML = email.subject;
    timestamp.innerHTML = email.timestamp;
    body.innerHTML = email.body;

    archive.style.visibility = 'hidden';
    unarchive.style.visibility = 'hidden';

    if(parent_mailbox === 'inbox') {
      archive.style.visibility = 'visible';
      archive.onclick = () => {

        //mark as archived
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        });

        //load archived
        load_mailbox('archived');
      }
    }

    if(parent_mailbox === 'archive') {
      unarchive.style.visibility = 'visible';
      unarchive.onclick = () => {

        //mark as archived
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        });

        //load archived
        load_mailbox('inbox');
      }
    }

    reply.onclick = () => {
      compose_email(true, email.sender, email.subject)
    }
  
  });

  //mark as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  //no response?

}