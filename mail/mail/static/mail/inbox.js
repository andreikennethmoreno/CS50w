document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.querySelector('#compose-form').addEventListener('submit', send_email)



  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-details-view').style.display = 'none';



  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-details-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(singleEmail => {

      console.log(singleEmail);




      const newEmail = document.createElement('div');

      newEmail.innerHTML = `
        <h6>Sender: ${singleEmail.sender}</h6>
        <h5>Subject: ${singleEmail.subject}</h5>
        <h7>${singleEmail.timestamp}</h7>
      `;

      if (singleEmail.read) {
        newEmail.classList.add('read', 'list-group-item');
        newEmail.style.backgroundColor = 'lightgrey'; // Set background color to gray for read emails
    } else {
        newEmail.classList.add('unread', 'list-group-item');
        newEmail.style.backgroundColor = 'white'; // Set background color to white for unread emails
    }


      newEmail.addEventListener('click', function() {
        view_email(singleEmail.id)
      });
      document.querySelector('#emails-view').append(newEmail);
    })
  });

}


function send_email(event) {
  event.preventDefault();


  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body= document.querySelector('#compose-body').value;


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}



function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

       // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-details-view').style.display = 'block';

      document.querySelector('#emails-details-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><b>From: </b>${email.sender}</li>
        <li class="list-group-item"><b>To: </b>${email.recipients}</li>
        <li class="list-group-item"><b>Subject: </b>${email.subject}</li>
        <li class="list-group-item"><b>Timestamp: </b>${email.timestamp}</li>


      </ul>
      `;


      if(!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }


      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = email.archived ? "Unarchived" : "Archive"
      btn_arch.className = email.archived ? "btn btn-success" : "btn btn-danger"


      btn_arch.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => { load_mailbox('archive')})
      });
      document.querySelector('#emails-details-view').append(btn_arch);


      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply"
      btn_reply.className = "btn btn-outline-primary"

      btn_reply.addEventListener('click', function() {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;

        let subject = email.subject

        if(subject.split(' ',1)[0] != "Re:"){
          subject = "Re: " + email.subject;
        }

        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;


      });



      document.querySelector('#emails-details-view').append(btn_reply);



      document.querySelector('#emails-details-view').innerHTML = `
      <br>
      <ul class="list-group">

        <br>
        <br>
        <li class="list-group-item">${email.body}</li>
      </ul>
      <br>
      <br>

      `;







  });
}
