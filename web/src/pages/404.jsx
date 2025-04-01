import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4 text-center">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button variant="default" onClick={() => window.location.href = '/'}>
          Back to Home
        </Button>
      </div>
    </Layout>
  );
} 