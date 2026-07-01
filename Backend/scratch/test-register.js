async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Admin',
        email: 'admin@marketpilot.ai',
        password: 'password123'
      })
    });
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
