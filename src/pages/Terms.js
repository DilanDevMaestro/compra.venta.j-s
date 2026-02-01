import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <>
      <Header />
      <div className="legal-container">
        <div className="legal-content">
          <h1>Términos y Condiciones de Uso</h1>
          <p className="last-updated">Última actualización: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2>1. Aceptación de los Términos</h2>
            <p>Al utilizar Compra Venta J&S, aceptas estos términos de servicio por completo.</p>
          </section>

          <section>
            <h2>2. Descripción del Servicio</h2>
            <p>Compra Venta J&S es una plataforma que permite a los usuarios:</p>
            <ul>
              <li>Publicar productos y servicios para su venta</li>
              <li>Conectar con compradores y vendedores</li>
              <li>Gestionar publicaciones y perfiles comerciales</li>
            </ul>
          </section>

          <section>
            <h2>3. Registro y Cuentas</h2>
            <p>Para usar nuestros servicios, debes:</p>
            <ul>
              <li>Tener una cuenta de Google válida</li>
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la seguridad de tu cuenta</li>
            </ul>
          </section>

          <section>
            <h2>4. Uso Aceptable</h2>
            <p>Los usuarios se comprometen a:</p>
            <ul>
              <li>No publicar contenido ilegal o fraudulento</li>
              <li>Respetar los derechos de otros usuarios</li>
              <li>No manipular los precios o las publicaciones</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;
