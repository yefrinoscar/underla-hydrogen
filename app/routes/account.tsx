import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Form, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {redirect} from '@remix-run/node';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return {
    customer: data.customer
  };
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <AccountSidebar />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Outlet context={{customer}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSidebar() {
  const menuItems = [
    { 
      to: "/account/orders", 
      label: "Orders", 
      icon: "📦",
      description: "View your order history" 
    },
    { 
      to: "/account/profile", 
      label: "Profile", 
      icon: "👤",
      description: "Personal information" 
    },
    { 
      to: "/account/addresses", 
      label: "Addresses", 
      icon: "📍",
      description: "Shipping addresses" 
    },
  ];

  return (
    <nav className="space-y-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Menu</h2>
        
        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-start p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                }`
              }
            >
              <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </NavLink>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

function LogoutButton() {
  return (
    <Form className="w-full" method="POST" action="/account/logout">
      <button 
        type="submit"
        className="w-full flex items-center justify-center p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
      >
        <span className="mr-2">🚪</span>
        Sign out
      </button>
    </Form>
  );
}
