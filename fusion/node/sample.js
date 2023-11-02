'use strict';

const yelp = require('yelp-fusion');

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'OPMavrf9yZMFZEcG-pmFNnwFL6z9SXMJzxXhKfHUjiSQyEYBND1HrGUwCbSrBdfQpwDpVck3OZkpMgeyUrE3sIitQrSrc7W9zZhaxqi-CnukwZHaVNdHT1_TrpUrZHYx';

const searchRequest = {
  term:'the-twisted-tuna-jupiter',
  location: 'jupiter, fl',
  reting: 3
};

const client = yelp.client(apiKey);

client.reviews('the-twisted-tuna-jupiter').then(response => {
  console.log(response.jsonBody.reviews[0].text);
  console.log(response.jsonBody.reviews[1].text);
  console.log(response.jsonBody.reviews[2].text);
  // console.log(response.jsonBody.reviews[4].text);
  console.log(response.jsonBody.reviews.length);
  console.dir(response.jsonBody.reviews)
}).catch(e => {
  console.log(e);
}); 

// let temp;

// const filterBusinessesByRating = (businesses, minRating) => {
//   return businesses.filter((business) => business.rating > minRating);
// };
 
// client.search({
//   term: 'the-twisted-tuna-jupiter',
//   location: 'jupiter, fl',
// }).then(response => {
//   temp = response.jsonBody.businesses;
//   let x = filterBusinessesByRating(temp, 4)
//   for (let i = 0; i < x.length; i++) {
//     console.log(x[i].rating);
//   }
//   console.log(x);
// }).catch(e => {
//   console.log(e);
// });

