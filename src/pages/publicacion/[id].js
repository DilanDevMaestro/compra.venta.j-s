import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PublicationDetail from '../../components/PublicationDetail';

const PublicationPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Compra venta J&S</title>
        {/* Open Graph meta tags will be dynamically added by PublicationDetail */}
      </Head>
      <PublicationDetail id={id} />
    </>
  );
};

export default PublicationPage;
