import type { EntryContext, AppLoadContext } from '@shopify/remix-oxygen';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { createContentSecurityPolicy } from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  context: AppLoadContext,
) {
  const { nonce, header, NonceProvider } = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
    defaultSrc: ["'self'", 'https://cdn.shopify.com', 'https://shopify.com', 'nonce-550972a1de313ef2c81bf5ab065f96ef'],
    imgSrc: ["'self'", 'https://cdn.shopify.com', 'https://shopify.com', 'https://vvdxlmnopqkikvevuedb.supabase.co'],
    mediaSrc: ["'self'", 'https://cdn.shopify.com', 'https://shopify.com', 'https://xq66ct-0b.myshopify.com'], 
    connectSrc: [
      "'self'",
      'https://dashboard.underla.lat/',
      'https://underlastore.myshopify.com/',
      'https://xq66ct-0b.myshopify.com'
    ],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.shopify.com'],

  });


  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} nonce={nonce} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
