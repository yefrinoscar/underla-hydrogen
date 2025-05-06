import { type ActionFunctionArgs } from '@shopify/remix-oxygen';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed', status: 405 };
  }

  try {
    const data = await request.json() as { message: string; email: string; name: string; phone: string };
    
    // Process the form data
    const { message, email, name, phone } = data;
    
    // Here you would typically save to a database or send an email
    
    return { success: true };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      status: 400
    };
  }
} 