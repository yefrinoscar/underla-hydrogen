import { json, type ActionFunctionArgs } from '@shopify/remix-oxygen';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const data = await request.json();
    
    // Here you would typically:
    // 1. Validate the data
    // 2. Store it in your database
    // 3. Send notifications (email, SMS, etc.)
    // 4. Handle any other business logic

    // For now, we'll just log it and return success
    console.log('Received request:', data);

    return json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 