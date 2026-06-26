const axios = require('axios');

const API_URL = 'http://localhost:8000/api';

async function runTests() {
    console.log('--- Starting API Tests ---\n');

    try {
        // 1. Test Customer Login
        console.log('1. Testing Customer Login...');
        const customerLogin = await axios.post(`${API_URL}/login`, {
            email: 'user@chefhiring.lk',
            password: 'password123'
        });
        const customerToken = customerLogin.data.data.token;
        console.log('✅ Customer Login successful. Token received.\n');

        // 2. Test Chef Login
        console.log('2. Testing Chef Login...');
        const chefLogin = await axios.post(`${API_URL}/login`, {
            email: 'chef@chefhiring.lk',
            password: 'password123'
        });
        const chefToken = chefLogin.data.data.token;
        console.log('✅ Chef Login successful. Token received.\n');

        // 3. Test Fetching Chefs (Customer)
        console.log('3. Fetching Chefs (Search)...');
        const searchRes = await axios.get(`${API_URL}/chefs`, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        const chefs = searchRes.data.chefs;
        console.log(`✅ Found ${chefs.length} chefs.`);
        
        if (chefs.length === 0) {
            console.log('❌ No chefs found in the database. Seeder might not have run properly.');
            return;
        }
        const chefId = chefs[0].id;
        console.log(`Will test booking with Chef ID: ${chefId}\n`);

        // 4. Test Customer Dashboard Stats
        console.log('4. Fetching Customer Dashboard...');
        const customerDash = await axios.get(`${API_URL}/user/stats`, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        console.log('✅ Customer Dashboard retrieved successfully.\n');

        // 5. Test Creating a Booking
        console.log('5. Testing Booking Creation...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const bookingPayload = {
            chef_id: chefId,
            event_date: tomorrow.toISOString().split('T')[0],
            event_time: '12:00 PM',
            event_type: 'Test Event',
            location: '123 Test St',
            guests_count: 10,
            total_price: 15000
        };
        const bookingRes = await axios.post(`${API_URL}/bookings`, bookingPayload, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        const bookingId = bookingRes.data.booking.id;
        console.log(`✅ Booking created successfully! Booking ID: ${bookingId}\n`);

        // 6. Test Chef Dashboard (should see the new booking)
        console.log('6. Fetching Chef Dashboard...');
        const chefDash = await axios.get(`${API_URL}/chef/stats`, {
            headers: { Authorization: `Bearer ${chefToken}` }
        });
        const chefBookings = chefDash.data.data.bookings;
        console.log(`✅ Chef Dashboard retrieved. Found ${chefBookings.length} bookings for this chef.\n`);

        // 7. Test Chef Accepting the Booking
        console.log('7. Testing Chef Accepting Booking...');
        const acceptRes = await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: 'accepted' }, {
            headers: { Authorization: `Bearer ${chefToken}` }
        });
        console.log(`✅ Booking status updated to: ${acceptRes.data.booking.status}\n`);

        console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ TEST FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTests();
