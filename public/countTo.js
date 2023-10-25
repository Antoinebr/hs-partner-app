let numbers = document.querySelectorAll("[countTo]");

if (numbers) {

    numbers.forEach((number) => {
        let ID = number.getAttribute("id");
        let value = number.getAttribute("countTo");
        let countUp = new CountUp(ID, value);

        if (number.hasAttribute("data-decimal")) {
            const options = {
                decimalPlaces: 1,
            };
            countUp = new CountUp(ID, 2.8, options);
        } else {
            countUp = new CountUp(ID, value);
        }

        if (!countUp.error) {
            countUp.start();
        } else {
            console.error(countUp.error);
            number.innerHTML = value;
        }
    });


    var userTokensAvailable = document.querySelector('#carmanufacturer').getAttribute('preselectedvalue');

    // Get a reference to the select element
    var selectElement = document.getElementById("carmanufacturer");

    // Loop through the options and set the selected attribute on the matching one
    for (var i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === userTokensAvailable) {
            selectElement.options[i].selected = true;
            break; // Exit the loop once a match is found
        }
    }

}