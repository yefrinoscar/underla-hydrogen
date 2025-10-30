import { Suspense } from 'react';
import { Await } from 'react-router';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { ProductItem } from './ProductItem';
import { ProductSkeleton } from './ProductSkeleton';
import { motion } from 'framer-motion';

interface RelatedProductsProps {
  relatedProducts: Promise<{ products: ProductItemFragment[] } | null>;
  className?: string;
}

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Animation variants for each product item
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

function RelatedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}

function RelatedProductsContent({ products }: { products: ProductItemFragment[] }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {products.slice(0, 4).map((product, index) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          className="motion-preset-fade"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductItem product={product} loading="lazy" />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function RelatedProducts({ relatedProducts, className = "" }: RelatedProductsProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-700 mb-2">
            También te puede gustar
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-underla-500 to-underla-600 rounded-full"></div>
        </motion.div>

        <Suspense fallback={<RelatedProductsSkeleton />}>
          <Await
            resolve={relatedProducts}
            errorElement={
              <div className="text-center py-8">
                <p className="text-gray-500">No se pudieron cargar los productos relacionados</p>
              </div>
            }
          >
            {(data) => {
              if (!data?.products || data.products.length === 0) {
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay productos relacionados disponibles</p>
                  </div>
                );
              }

              return <RelatedProductsContent products={data.products} />;
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
} 
