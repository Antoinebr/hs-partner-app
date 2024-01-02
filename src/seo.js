const urlData = [
  {
    "title": "Partner App Home | PartnerApp",
    "description": "Welcome to partner app ",
    "url": "/",
    "image": "https://cdn.glitch.com/605e2a51-d45f-4d87-a285-9410ad350515%2Fhello-node-social.png?v=1618161394375"
  },
  {
    "title": "All users | PartnerApp",
    "description": "Display all the app users",
    "url": "/users",
    "image": "https://cdn.glitch.com/605e2a51-d45f-4d87-a285-9410ad350515%2Fhello-node-social.png?v=1618161394375"
  },
  {
    "title": "Customer Service | PartnerApp",
    "description": "Here to help you !",
    "url": "/customer-service",
    "image": "https://cdn.glitch.com/605e2a51-d45f-4d87-a285-9410ad350515%2Fhello-node-social.png?v=1618161394375"
  },
  {
    "title": "About | PartnerApp",
    "description": "Learn about us",
    "url": "/about",
    "image": "https://cdn.glitch.com/605e2a51-d45f-4d87-a285-9410ad350515%2Fhello-node-social.png?v=1618161394375"
  },
  {
    "title": "My Parcel | PartnerApp",
    "description": "Get Parcel infos",
    "url": "/my-parcel/",
    "image": "https://cdn.glitch.com/605e2a51-d45f-4d87-a285-9410ad350515%2Fhello-node-social.png?v=1618161394375"
  },
  {
    "title": "My tickets | PartnerApp",
    "description": "See all your tickets",
    "url": "/mytickets/",
    "image": "https://cdn.glitch.com/605e2a51-d45f-4d87-a285-9410ad350515%2Fhello-node-social.png?v=1618161394375"
  }

]



exports.getUrlData = (slug) => urlData.filter( url => url.url === slug)[0];


