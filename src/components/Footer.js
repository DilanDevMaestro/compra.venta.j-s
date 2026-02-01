import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const Footer = ({ darkMode, toggleTheme }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="copyright">© 2024 Derechos Reservados J&S COMPRA VENTA</p>
        <button className="theme-toggle-footer" onClick={toggleTheme}>
          {darkMode ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
