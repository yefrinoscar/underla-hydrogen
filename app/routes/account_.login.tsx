import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

type LoaderData = {
  error: string;
  message: string;
  details: string;
  isDevelopment: boolean;
} | Response;

export async function loader({request, context}: LoaderFunctionArgs): Promise<LoaderData> {
  // Get the current URL to check if we're in development
  const url = new URL(request.url);
  const isDevelopment = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  
  try {
    // Try to login with customer account
    return await context.customerAccount.login();
  } catch (error) {
    console.error('Customer Account Login Error:', error);
    
    // If we're in development, provide a helpful error message
    if (isDevelopment) {
      return {
        error: 'Development Login Issue',
        message: 'Customer Account API might not be properly configured for localhost. Please check your Shopify app settings.',
        details: error instanceof Error ? error.message : 'Unknown error',
        isDevelopment: true
      };
    }
    
    // For production, redirect to a generic error page or handle gracefully
    throw error;
  }
}

export default function Login() {
  const data = useLoaderData<LoaderData>();
  
  // Type guard function
  function isErrorData(data: LoaderData): data is { error: string; message: string; details: string; isDevelopment: boolean } {
    return typeof data === 'object' && data !== null && 'error' in data;
  }
  
  if (isErrorData(data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-600">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {data.error}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {data.message}
            </p>
            {data.isDevelopment && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800">Development Mode - Troubleshooting:</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Make sure your .env file has all required variables</li>
                  <li>Check that your Shopify app allows localhost in Customer Account API settings</li>
                  <li>Verify PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID is correct</li>
                  <li>Ensure your app has Customer Account API enabled</li>
                </ul>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-yellow-800">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-yellow-600 bg-yellow-100 p-2 rounded overflow-auto">
                    {data.details}
                  </pre>
                </details>
              </div>
            )}
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If no error, this component shouldn't render (should redirect)
  return null;
}
