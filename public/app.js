document.querySelector('#editBtn').addEventListener('click', async e => {

    e.preventDefault();

    console.log(document.querySelector('#tokensavailable').value);

    const newTokenValue = document.querySelector('#tokensavailable').value;

    const email = document.querySelector('#email').value;

    const res = await fetch('/api/user', {
        method: 'PATCH',
        body: JSON.stringify({
            email,
            tokensAvailable: parseInt(newTokenValue),
            fromHs: false
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    }).catch(console.log);


});