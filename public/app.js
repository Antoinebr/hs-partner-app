document.querySelector('#editBtn')?.addEventListener('click', async e => {

    e.preventDefault();

    console.log(document.querySelector('#tokensavailable').value);

    const newTokenValue = document.querySelector('#tokensavailable').value;

    const email = document.querySelector('#email').value;

    const name = document.querySelector('#name').value;

    const lastname = document.querySelector('#lastname').value;

    const carModel = document.querySelector('#carmodel').value;

    const carManufacturer = document.querySelector('#carmanufacturer').value;


    if(!localStorage.getItem('JWT')){
        alert('Your are not logged in, missing JWT in localstorage');
        return
    }

    const res = await fetch('/api/user', {
        method: 'PATCH',
        body: JSON.stringify({
            email,
            name,
            lastname,
            tokensAvailable: parseInt(newTokenValue),
            carManufacturer,
            carModel,
            fromHs: false
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'authorization': `Bearer ${localStorage.getItem('JWT')}`
        },
    }).catch(console.log);

    const {statusText} = res;

    if(res.status === 403) alert(res.statusText)
    if(res.status !== 403) location.reload();


});



document.querySelector('#addBtn')?.addEventListener('click', async e => {

    e.preventDefault();

    console.log(document.querySelector('#tokensavailable').value);

    const newTokenValue = document.querySelector('#tokensavailable').value;

    const email = document.querySelector('#email').value.toLowerCase();

    const name = document.querySelector('#name').value;

    const lastname = document.querySelector('#lastname').value;

    const carModel = document.querySelector('#carmodel').value;

    const carManufacturer = document.querySelector('#carmanufacturer').value;

    if(!localStorage.getItem('JWT')){
        alert('Your are not logged in, missing JWT in localstorage');
        return
    }

    const res = await fetch('/api/user', {
        method: 'POST',
        body: JSON.stringify({
            email,
            name,
            lastname,
            avatar : " ",
            tokensAvailable: parseInt(newTokenValue),
            carManufacturer,
            carModel
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'authorization': `Bearer ${localStorage.getItem('JWT')}`
        },
    }).catch(console.log);

    if(res.status === 403) alert(res.statusText)

    if(res.status !== 403) window.location.replace(`/editUser/${email}`);


});




document.querySelector('#removeUser')?.addEventListener('click', async e => {

    e.preventDefault();


    const email = document.querySelector('#removeUser').getAttribute('email');

    if(!email) alert('No email set in the email attribute');
    


    if(!localStorage.getItem('JWT')){
        alert('Your are not logged in, missing JWT in localstorage');
        return
    }

    const res = await fetch('/api/user/'+email, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'authorization': `Bearer ${localStorage.getItem('JWT')}`
        },
    }).catch(console.log);

    const {statusText} = res;

    if(res.status !== 403) window.location.replace(`/users`);

});

if (document.querySelector('code')) hljs.highlightAll();



document.querySelectorAll('.form-button')?.forEach( button =>{

    button.addEventListener('click', async e => {
    
        document.querySelector('#generalQuestionForm').classList.add('hidden');
        document.querySelector('#productIssueForm').classList.add('hidden');
        document.querySelector('#billingIssueForm').classList.add('hidden');
    
    })

});




document.querySelector('#generalQuestion')?.addEventListener('click', async e => {

    document.querySelector('#generalQuestionForm').classList.toggle('hidden');


    // if the form is visible then scroll to the form
    if( document.querySelector('#generalQuestionForm').classList.contains('hidden') === false ){

        document.getElementById("generalQuestionForm").scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
            inline: 'start'
        });

    }

 

});



document.querySelector('#productIssue')?.addEventListener('click', async e => {

    document.querySelector('#productIssueForm').classList.toggle('hidden');


    // if the form is visible then scroll to the form
    if( document.querySelector('#productIssueForm').classList.contains('hidden') === false ){

        document.getElementById("productIssueForm").scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
            inline: 'start'
        });

    }

 

});


document.querySelector('#billingIssue')?.addEventListener('click', async e => {

    document.querySelector('#billingIssueForm').classList.toggle('hidden');


    // if the form is visible then scroll to the form
    if( document.querySelector('#billingIssueForm').classList.contains('hidden') === false ){

        document.getElementById("billingIssueForm").scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
            inline: 'start'
        });

    }
});




document.querySelector('#login')?.addEventListener("submit", async (event) => {

    event.preventDefault();

    const emailInput = document.querySelector('#email');
    const password = document.querySelector('#password');

      try {

            const response = await fetch("/login",  {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email : emailInput.value,
                    password : password.value
                })
            });

        
            if (!response.ok) throw new Error(`Request failed with status: ${response.status}`);

            const data = await response.json();
            
            if(!data.token) throw new Error(`No token received by the backend`);

            window.hsConversationsSettings = {
                identificationEmail: emailInput.value,
                identificationToken: data.token
            };

            window.HubSpotConversations.widget.load();
                
            const {JWT} = data;

            if(!JWT) alert('Wrong password')

            if(JWT){
                console.log("Password is correct ! JWT set in localstorage !")
                localStorage.setItem('JWT',JWT);
            }
            window.location.replace("/users");


    } catch (error) {

            console.error('An error occurred:', error);
    
    }
        
    
  });