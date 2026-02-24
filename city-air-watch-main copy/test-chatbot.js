// Simple test script for the chatbot
// Using built-in fetch (Node.js 18+)

async function testChatbot() {
  try {
    console.log('🧪 Testing chatbot with message: "hi"\n');
    
    const response = await fetch('http://localhost:3000/api/chatbot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'hi',
        user_role: 'Public',
        city: 'Delhi'
      }),
    });

    const data = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Chatbot responded:');
      console.log(data.response);
    } else {
      console.log('\n❌ ERROR:', data.message);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the server is running: cd server && npm run dev');
  }
}

testChatbot();

