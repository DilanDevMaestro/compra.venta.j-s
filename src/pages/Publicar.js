/* global MercadoPago */
import React, { useState, useEffect, useCallback, memo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaUpload, FaTimes, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { categories } from '../utils/categories';
import { publicationsApi } from '../services/api';
import { config } from '../config/config';

// Componente para el formulario de creación/edición
const PublicationForm = memo(({ formData, handleInputChange, handleImageChange, removeImage, imagePreviews, isLoading, editingPublication }) => {
  return (
    <div className="creation-form">
      <h2>{editingPublication ? 'Editar Publicación' : 'Crear Nueva Publicación'}</h2>
      <form>
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            placeholder="Ej: iPhone 13 Pro Max"
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Estado</label>
            <select 
              name="estado" 
              value={formData.estado}
              onChange={handleInputChange}
              required
            >
              <option value="nuevo">Nuevo</option>
              <option value="seminuevo">Seminuevo</option>
              <option value="usado">Usado</option>
            </select>
          </div>

          <div className="form-group half">
            <label>Categoría</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Precio Original</label>
            <input
              type="number"
              name="precioOriginal"
              value={formData.precioOriginal || formData.precio}
              onChange={handleInputChange}
              placeholder="Precio original"
              disabled={!editingPublication}
            />
          </div>

          <div className="form-group half">
            <label>Precio Final</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="$0.00"
            />
          </div>
        </div>

        <div className="form-group">
          <label>WhatsApp</label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            required
            placeholder="Ej: 1234567890"
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            required
            placeholder="Describe tu producto o servicio..."
            rows="4"
          />
        </div>

        <div className="image-upload-section">
          <label htmlFor="images" title="Selecciona imágenes">
            <FaUpload /> Seleccionar imágenes (máx. 3)
          </label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview">
                <img src={preview.url} alt={`Preview ${index + 1}`} />
                <button type="button" onClick={() => removeImage(index)} aria-label={`Eliminar imagen ${index + 1}`}>
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
});

// Componente para la vista previa
const PreviewSection = memo(({ formData, imagePreviews, previewImageIndex, handlePrevImage, handleNextImage, setPreviewImageIndex, isLoading, handleSubmit, buttonText }) => {
  // Añadir verificación de índice válido
  useEffect(() => {
    if (previewImageIndex >= imagePreviews.length && imagePreviews.length > 0) {
      setPreviewImageIndex(imagePreviews.length - 1);
    }
  }, [imagePreviews.length, previewImageIndex, setPreviewImageIndex]);

  // Obtener imagen actual de forma segura
  const currentImage = imagePreviews[previewImageIndex];

  return (
    <div className="preview-section">
      <h2>Vista Previa</h2>
      <div className="publication-preview">
        <div className="preview-images">
          {imagePreviews.length > 0 ? (
            <>
              {imagePreviews.length > 1 && (
                <button 
                  className="nav-button prev" 
                  onClick={handlePrevImage}
                  type="button"
                  aria-label="Imagen anterior"
                >
                  <FaChevronLeft />
                </button>
              )}
              {currentImage && (
                <img 
                  src={currentImage.url} 
                  alt="Preview principal"
                  className="main-preview-image"
                />
              )}
              {imagePreviews.length > 1 && (
                <button 
                  className="nav-button next" 
                  onClick={handleNextImage}
                  type="button"
                  aria-label="Imagen siguiente"
                >
                  <FaChevronRight />
                </button>
              )}
              <div className="preview-thumbnails">
                {imagePreviews.map((preview, index) => (
                  <img 
                    key={preview._id || index}
                    src={preview.url} 
                    alt={`Miniatura ${index + 1}`}
                    className={`preview-thumbnail ${index === previewImageIndex ? 'active' : ''}`}
                    onClick={() => setPreviewImageIndex(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="no-image">Sin imagen</div>
          )}
        </div>
        <div className="preview-content">
          <h1>{formData.nombre || 'Título de la publicación'}</h1>
          {formData.descuento > 0 ? (
            <div className="preview-price">
              <span className="original-price">${Number(formData.precioOriginal).toLocaleString()}</span>
              <span className="final-price">${Number(formData.precio).toLocaleString()}</span>
              <span className="discount-badge">-{formData.descuento}%</span>
            </div>
          ) : (
            <p className="preview-price">
              ${Number(formData.precio).toLocaleString()}
            </p>
          )}
          <div className="preview-tags">
            <span className="preview-state">{formData.estado}</span>
            <span className="preview-category">{formData.categoria}</span>
          </div>
          <p className="preview-description">
            {formData.descripcion || 'Descripción del producto o servicio'}
          </p>
          <p className="preview-contact">
            WhatsApp: {formData.whatsapp || 'No especificado'}
          </p>
        </div>
        <div className="cho-container">
          {/* El botón de MercadoPago se renderizará aquí */}
        </div>
        <div className="preview-actions">
          <button 
            onClick={handleSubmit}
            className="publish-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Procesando...
              </>
            ) : (
              buttonText || 'Publicar Ahora'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// Componente para la lista de publicaciones del usuario
const PublicationsList = memo(({ userPublications, handleEdit }) => {
  return (
    <div className="user-publications-section">
      <h2>Tus Publicaciones</h2>
      <div className="publications-grid">
        {userPublications.map(pub => (
          <div 
            key={pub._id} 
            className="publication-card"
            onClick={() => handleEdit(pub)}
            aria-label={`Editar publicación ${pub.nombre}`}
          >
            <img src={pub.imagenes[0]?.url} alt={pub.nombre} />
            <div className="publication-info">
              <h3>{pub.nombre}</h3>
              <p className="price">${pub.precio.toLocaleString()}</p>
              <span className="edit-badge">Editar</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const Publicar = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    estado: 'nuevo',
    categoria: '',
    precio: '',
    descripcion: '',
    whatsapp: '',
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // Agregar este estado
  const [error, setError] = useState(null);
  const [userPublications, setUserPublications] = useState([]);
  const [editingPublication, setEditingPublication] = useState(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      estado: 'nuevo',
      categoria: '',
      precio: '',
      descripcion: '',
      whatsapp: '',
    });
    setImagePreviews([]);
    setEditingPublication(null);
  }, []);

  const fetchUserPublications = useCallback(async () => {
    try {
      const publications = await publicationsApi.getUserPublications();
      setUserPublications(publications);
      // Update isNewUser state based on fetched publications
      if (publications && publications.length > 0) {
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error fetching user publications:', error);
    }
  }, []); // Sin dependencias si no usa variables externas

  useEffect(() => {
    fetchUserPublications();
  }, [fetchUserPublications]);

  const handleEdit = useCallback((publication) => {
    setEditingPublication(publication);
    setFormData({
      nombre: publication.nombre,
      estado: publication.estado,
      categoria: publication.categoria,
      precio: publication.precio,
      precioOriginal: publication.precioOriginal || publication.precio,
      descripcion: publication.descripcion,
      whatsapp: publication.whatsapp
    });
    setImagePreviews([]); // limpiar imágenes previas
    setImagePreviews(
      publication.imagenes.map(img => ({
        url: img.url,
        _id: img._id,
        isExisting: true
      }))
    );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Calcular descuento solo si es edición y el precio nuevo es menor
      if (editingPublication && name === 'precio' && newData.precioOriginal) {
        const precioOriginal = Number(newData.precioOriginal);
        const precioNuevo = Number(value);
        
        if (precioNuevo < precioOriginal) {
          const descuento = Math.round(((precioOriginal - precioNuevo) / precioOriginal) * 100);
          newData.descuento = descuento;
        } else {
          // Si el precio nuevo es mayor o igual, eliminar descuento
          newData.descuento = 0;
          newData.precioOriginal = precioNuevo;
        }
      }

      return newData;
    });
  };

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    // Mantener las imágenes existentes y agregar las nuevas
    const currentPreviews = imagePreviews.filter(preview => preview.isExisting);
    const currentCount = currentPreviews.length;
    
    if (files.length + currentCount > 3) {
      alert('Máximo 3 imágenes permitidas');
      return;
    }
  
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false
    }));
  
    setImagePreviews([...currentPreviews, ...newPreviews]);
  }, [imagePreviews]);

  const removeImage = useCallback((index) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      // Revocar URL si es una imagen temporal
      if (!newPreviews[index].isExisting) {
        URL.revokeObjectURL(newPreviews[index].url);
      }
      newPreviews.splice(index, 1);
      // Ajustar el índice de previsualización si es necesario
      if (previewImageIndex >= newPreviews.length) {
        setPreviewImageIndex(Math.max(0, newPreviews.length - 1));
      }
      return newPreviews;
    });
  }, [previewImageIndex, setPreviewImageIndex]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (editingPublication) {
        // Asegurarse de que los campos numéricos sean válidos
        const dataToUpdate = {
          ...formData,
          precio: Number(formData.precio),
          precioOriginal: Number(formData.precioOriginal || formData.precio),
          descuento: Number(formData.descuento || 0)
        };

        await publicationsApi.update(editingPublication._id, dataToUpdate);
        setMessage('Publicación actualizada exitosamente');
        resetForm();
        fetchUserPublications();
      } else {
        const newData = {
          ...formData,
          precio: Number(formData.precio),
          precioOriginal: Number(formData.precioOriginal || formData.precio),
          descuento: Number(formData.descuento || 0)
        };
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.businessProfile) {
          // Convertir newData a FormData
          const formDataToSend = new FormData();
          Object.keys(newData).forEach(key => {
            formDataToSend.append(key, newData[key]);
          });
          // Agregar imágenes nuevas (no existentes)
          imagePreviews.forEach((preview) => {
            if (!preview.isExisting && preview.file) {
              formDataToSend.append('imagenes', preview.file); // se cambia 'images' a 'imagenes'
            }
          });
          await publicationsApi.create(formDataToSend);
          setMessage('Publicación creada exitosamente sin costo');
          resetForm();
          fetchUserPublications();
        } else {
          // Proceso de pago para nueva publicación
          const publicKey = 'APP_USR-57b5b283-8b1a-4018-b0ce-f2bf5dcb8065';
          if (!publicKey) {
            throw new Error('La clave pública de MercadoPago no está configurada');
          }

          // Crear FormData aquí antes de la preferencia
          const formDataToSend = new FormData();
          Object.keys(newData).forEach(key => {
            formDataToSend.append(key, newData[key]);
          });
          
          // Agregar imágenes
          imagePreviews.forEach((preview) => {
            if (!preview.isExisting && preview.file) {
              formDataToSend.append('imagenes', preview.file);
            }
          });

          const mp = new MercadoPago(publicKey, {
            locale: 'es-AR'
          });

          const preferenceResponse = await fetch(`${config.API_URL}/payments/create-preference`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              title: 'Publicación en plataforma',
              price: 200,
              quantity: 1,
              publicationData: {
                ...newData,
                userId: user._id,
                formData: formDataToSend
              }
            })
          });
      
          const preference = await preferenceResponse.json();
          if (!preference.id) throw new Error('Error al crear preferencia de pago');
      
          mp.checkout({
            preference: { 
              id: preference.id
            },
            render: {
              container: '.cho-container',
              label: 'Pagar y Publicar'
            },
            theme: {
              elementsColor: '#2c3e50',
              headerColor: '#2c3e50'
            },
            autoOpen: true, // Abre automáticamente el checkout
            onSubmit: () => {
              // El usuario hizo clic en pagar
              setMessage('Procesando pago...');
            },
            onReady: () => {
              // El checkout está listo
              setMessage('Checkout listo');
            },
            onError: (error) => {
              // Hubo un error en el checkout
              setError('Error en el proceso de pago: ' + error.message);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al procesar la solicitud' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [editingPublication, formData, resetForm, fetchUserPublications, imagePreviews]);

  useEffect(() => {
    return () => {
      // Solo limpiar URLs de imágenes no existentes
      imagePreviews
        .filter(preview => !preview.isExisting)
        .forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const handlePrevImage = useCallback(() => {
    setPreviewImageIndex(prev => 
      prev === 0 ? imagePreviews.length - 1 : prev - 1
    );
  }, [imagePreviews]);

  const handleNextImage = useCallback(() => {
    setPreviewImageIndex(prev => 
      prev === imagePreviews.length - 1 ? 0 : prev + 1
    );
  }, [imagePreviews]);

  return (
    <>
      <Header />
      <div className="publicar-container">
        <div className="top-section">
          {isNewUser ? (
            <div className="welcome-section">
              <h2>¡Bienvenido a nuestra plataforma!</h2>
              <p>Gracias por unirte. Comienza creando tu primera publicación.</p>
            </div>
          ) : (
            <PublicationsList userPublications={userPublications} handleEdit={handleEdit} />
          )}
        </div>
        <div className="bottom-section">
          <div className="form-preview-container">
            <PublicationForm 
              formData={formData}
              handleInputChange={handleInputChange}
              handleImageChange={handleImageChange}
              removeImage={removeImage}
              imagePreviews={imagePreviews}
              isLoading={isLoading}
              editingPublication={editingPublication}
            />
            <PreviewSection 
              formData={formData}
              imagePreviews={imagePreviews}
              previewImageIndex={previewImageIndex}
              handlePrevImage={handlePrevImage}
              handleNextImage={handleNextImage}
              setPreviewImageIndex={setPreviewImageIndex}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              buttonText={editingPublication ? 'Actualizar Publicación' : 'Publicar Ahora'}
            />
          </div>
        </div>
      </div>
      {/* Se muestra el contenedor para el checkout */}
      <div className="cho-container" />
      <Footer />
    </>
  );
};

export default Publicar;
