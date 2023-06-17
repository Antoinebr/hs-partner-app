document.querySelector('#editBtn')?.addEventListener('click', async e => {

    e.preventDefault();

    console.log(document.querySelector('#tokensavailable').value);

    const newTokenValue = document.querySelector('#tokensavailable').value;

    const email = document.querySelector('#email').value;

    const name = document.querySelector('#name').value;

    const lastname = document.querySelector('#lastname').value;

    const carModel = document.querySelector('#carmodel').value;

    const carManufacturer = document.querySelector('#carmanufacturer').value;

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
        },
    }).catch(console.log);


});



if (document.querySelector('code')) hljs.highlightAll();



document.querySelectorAll('.form-button')?.forEach( button =>{

    button.addEventListener('click', async e => {

        console.log('lll');
    
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
