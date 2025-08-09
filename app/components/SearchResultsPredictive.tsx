import {Link, useFetcher, type Fetcher} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect, useState} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {useAside} from './Aside';
import { getCollectionUrl } from '~/utils/special-collections';
import { getCategoryColor } from '~/components/CategoryIcon';
import { CategoryIcon } from '~/components/CategoryIcon';

type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>;
  total: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  items: PredictiveSearchItems;
  fetcher: Fetcher<PredictiveSearchReturn>;
};

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state'];
  closeSearch: () => void;
};

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> &
  Pick<SearchResultsPredictiveArgs, ExtraProps>;

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
};

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput();
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  if (!articles.length) return null;

  return (
    <div className="predictive-search-result" key="articles">
      <h5>Articles</h5>
      <ul>
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          });

          return (
            <li className="predictive-search-result-item" key={article.id}>
              <Link onClick={closeSearch} to={articleUrl}>
                {article.image?.url && (
                  <Image
                    alt={article.image.altText ?? ''}
                    src={article.image.url}
                    width={50}
                    height={50}
                  />
                )}
                <div>
                  <span>{article.title}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCollections({
  collections,
  closeSearch
}: {
  collections: any[];
  closeSearch: () => void;
}) {
  if (!collections.length) return null;
  
  // Check if collection is exclusive
  const isExclusive = (handle: string) => {
    return handle.includes('exclusivo') || handle.includes('exclusive');
  };
  
  return (
    <div className="py-2">
      <h3 className="font-medium text-xs text-gray-400 uppercase mb-2">Categorías</h3>
      <ul className="grid grid-cols-1 gap-1.5">
        {collections.map((collection) => {
          const gradientClass = getCategoryColor(collection.handle);
          const exclusive = isExclusive(collection.handle);
          const collectionUrl = exclusive ? '#' : getCollectionUrl(collection.handle);
          
          return (
            <li key={collection.id} className="group">
              <Link
                to={collectionUrl}
                onClick={(e) => {
                  if (exclusive) {
                    e.preventDefault();
                  } else {
                    closeSearch();
                  }
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-md transition-colors duration-200 group"
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-md ${gradientClass}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-sm text-neutral-800 group-hover:text-primary transition-colors duration-200">{collection.title}</p>
                  <div className="flex justify-between items-center">
                    {exclusive ? (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Muy Pronto</span>
                    ) : (
                      <p className="text-[10px] text-gray-400">Ver productos</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  if (!pages.length) return null;

  return (
    <div className="predictive-search-result" key="pages">
      <h5>Pages</h5>
      <ul>
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          });

          return (
            <li className="predictive-search-result-item" key={page.id}>
              <Link onClick={closeSearch} to={pageUrl}>
                <div>
                  <span>{page.title}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  if (!products.length) return null;
  
  // Check if product is exclusive
  const isExclusive = (handle: string) => {
    return handle.includes('exclusivo') || handle.includes('exclusive');
  };

  return (
    <div className="py-2" key="products">
      <h3 className="font-medium text-xs text-gray-400 uppercase mb-2">Productos</h3>
      <ul className="grid grid-cols-1 gap-1.5">
        {products.map((product) => {
          const productUrl = isExclusive(product.handle) ? '#' : urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          });

          const image = product?.variants?.nodes?.[0].image;
          const price = product?.variants?.nodes?.[0].price;
          const exclusive = isExclusive(product.handle);
          
          return (
            <li className="group" key={product.id}>
              <Link 
                to={productUrl} 
                onClick={(e) => {
                  if (exclusive) {
                    e.preventDefault();
                  } else {
                    closeSearch();
                  }
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-md transition-colors duration-200 group"
              >
                <div className="relative w-10 h-10 rounded-md border border-gray-200 overflow-hidden bg-gray-100">
                  {image && (
                    <Image
                      alt={product.title}
                      aspectRatio="1/1"
                      data={image}
                      loading="lazy"
                      sizes="(min-width: 768px) 10vw, 25vw"
                      className="object-cover w-full h-full"
                    />
                  )}
                  {exclusive && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-medium px-1.5 py-0.5 bg-primary rounded-full animate-pulse">Muy Pronto</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-sm text-neutral-800 group-hover:text-primary transition-colors duration-200 line-clamp-1">{product.title}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-bold text-primary">
                      {price && (
                        <Money data={price} />
                      )}
                    </div>
                    {exclusive ? (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Muy Pronto</span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Ver detalles</span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string;
}) {
  if (!queries.length) return null;

  return (
    <datalist id={queriesDatalistId}>
      {queries.map((suggestion) => {
        if (!suggestion) return null;

        return <option key={suggestion.text} value={suggestion.text} />;
      })}
    </datalist>
  );
}

function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>;
}) {
  if (!term.current) {
    return null;
  }

  return (
    <p>
      No results found for <q>{term.current}</q>
    </p>
  );
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const term = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}
