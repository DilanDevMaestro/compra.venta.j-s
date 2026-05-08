import React from 'react';
import PublicationDetailComponent from '../../components/PublicationDetail';
import Head from 'next/head';

const PublicationDetailPage = () => {
  return (
    <>
      <Head>
        <title>Compra Venta J&S</title>
        {/* Open Graph meta tags will be dynamically added by PublicationDetail */}
      </Head>
      <PublicationDetailComponent />
    </>
  );
};

export default PublicationDetailPage;
