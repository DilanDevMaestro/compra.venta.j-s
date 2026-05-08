import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { HeroCarousel } from './components/hero/HeroCarousel';
import { CurrencyQuotes } from './components/currency/CurrencyQuotes';
import { ContentSidebar } from './components/sidebar/ContentSidebar';
import { MainCategories } from './components/categories/MainCategories';
import { PublicationsCarousel } from './components/publications/PublicationsCarousel';
import { useCategories } from './hooks/useCategories';
import { usePublications } from './hooks/usePublications';
import { useCurrencyQuotes } from './hooks/useCurrencyQuotes';

const Home = () => {
  // Hooks personalizados para manejar el estado
  const { categories, popularCategories } = useCategories();
  const { publications, featured, discounted } = usePublications();
  const { quotes, openQuotesModal } = useCurrencyQuotes();

  return (
    <div className="home">
      <Header />
      
      <HeroCarousel />
      
      <CurrencyQuotes 
        quotes={quotes} 
        onShowMore={openQuotesModal} 
      />
      
      <main className="main-content">
        <div className="content-layout">
          <ContentSidebar 
            featured={featured}
            discounted={discounted}
            popularCategories={popularCategories}
          />
          
          <section className="main-area">
            <MainCategories 
              categories={categories.main}
              secondaryCategories={categories.secondary}
            />
            
            <PublicationsCarousel 
              publications={publications}
              isLoading={publications.isLoading}
            />
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
