import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Privacy = () => {
  return (
    <>
      <Header />
      <div className="legal-container">
        <div className="legal-content">
          <h1>Política de Privacidad</h1>
          <p className="last-updated">Última actualización: {new Date().toLocaleDateString()}</p>

          <section>
            <h2>1. Información que Recopilamos</h2>
            <p>Recopilamos la siguiente información:</p>
            <ul>
              <li>Datos de tu cuenta de Google</li>
              <li>Información de publicaciones</li>
              <li>Datos de uso y actividad</li>
            </ul>
          </section>

          <section>
            <h2>2. Uso de la Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul>
              <li>Gestionar tu cuenta</li>
              <li>Mostrar tus publicaciones</li>
              <li>Mejorar nuestros servicios</li>
            </ul>
          </section>

          <section>
            <h2>3. Compartir Información</h2>
            <p>No compartimos tu información personal excepto:</p>
            <ul>
              <li>Con tu consentimiento explícito</li>
              <li>Para cumplir requisitos legales</li>
              <li>Para proteger nuestros servicios</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacy;
