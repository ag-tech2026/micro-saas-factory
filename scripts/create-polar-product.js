#!/usr/bin/env node
// Create a Polar product via API
// Usage: node create-polar-product.js "Product Name" slug description amount_cents interval

const fetch = require('node-fetch');

const token = process.env.POLAR_ACCESS_TOKEN;
const name = process.argv[2];
const slug = process.argv[3];
const description = process.argv[4] || '';
const amount = parseInt(process.argv[5]); // cents
const interval = process.argv[6] || 'month'; // month, year

if (!token || !name || !slug || !amount) {
  console.error('Usage: POLAR_ACCESS_TOKEN=... node create-polar-product.js "Name" slug "Description" amount_cents interval');
  process.exit(1);
}

const productData = {
  data: {
    type: 'products',
    attributes: {
      name,
      slug,
      description,
      is_recurring: true,
      trial_interval: null,
      trial_interval_count: null,
      prices: [
        {
          type: 'recurring',
          currency: 'usd',
          amount,
          interval: {
            type: interval,
            count: 1
          }
        }
      ]
    }
  }
};

fetch('https://api.polar.sh/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(productData)
})
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => Promise.reject(err));
    }
    return res.json();
  })
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
    // Output product ID for copying
    if (data.data) {
      console.log(`\nProduct ID: ${data.data.id}`);
    }
  })
  .catch(err => {
    console.error('Error creating product:', JSON.stringify(err, null, 2));
    process.exit(1);
  });
