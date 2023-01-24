document.querySelector('#editBtn').addEventListener('click', async e => {

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