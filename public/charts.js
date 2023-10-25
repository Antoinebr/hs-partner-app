// Function to generate random mileage data for each month
function generateRandomMileageData() {
    const data = [];
    let mileage = 0;
    for (let i = 0; i < 12; i++) { // Assuming data for 12 months
        mileage += Math.floor(Math.random() * 1000); // Random increase in mileage
        data.push(mileage);
    }
    return data;
}

const ctx = document.getElementById("mileageChart")?.getContext("2d");

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Car Mileage (in km)',
            data: generateRandomMileageData(),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    }
});