import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Cropper from 'cropperjs';

const BusinessProfileForm = ({ isOpen, onClose, user, onSubmit, updateSuccess }) => {
  const [formData, setFormData] = useState({
    businessName: user?.businessProfile?.name || '',
    location: user?.businessProfile?.location || '',
    facebook: user?.businessProfile?.socialLinks?.facebook || '',
    instagram: user?.businessProfile?.socialLinks?.instagram || '',
    tiktok: user?.businessProfile?.socialLinks?.tiktok || '',
    website: user?.businessProfile?.socialLinks?.website || '',
    description: user?.businessProfile?.description || ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [error, setError] = useState('');
  const [bannerFileName, setBannerFileName] = useState('');
  const [profilePictureName, setProfilePictureName] = useState('');
  const bannerImageRef = useRef(null);
  const cropperRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.businessProfile) {
      setFormData({
        businessName: user.businessProfile.name || '',
        location: user.businessProfile.location || '',
        facebook: user.businessProfile.socialLinks?.facebook || '',
        instagram: user.businessProfile.socialLinks?.instagram || '',
        tiktok: user.businessProfile.socialLinks?.tiktok || '',
        website: user.businessProfile.socialLinks?.website || '',
        description: user.businessProfile.description || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (bannerImage && bannerImageRef.current) {
      cropperRef.current = new Cropper(bannerImageRef.current, {
        aspectRatio: 1920 / 500,
        viewMode: 1,
        autoCropArea: 1,
        cropBoxMovable: false,
        cropBoxResizable: false,
        center: true,
        scalable: false,
        zoomable: false,
        zoomOnTouch: false,
        zoomOnWheel: false,
        ready() {
          cropperRef.current.setData({
            width: 1920,
            height: 500,
          });
        },
      });
    }
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [bannerImage]);

  const handleImageValidation = (file, type) => {
    if (type === 'banner') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width !== 1920 || img.height !== 500) {
            setError('El banner debe ser de 1920x500 píxeles');
            resolve(false);
          }
          resolve(true);
        };
        img.src = URL.createObjectURL(file);
      });
    }
    return Promise.resolve(true);
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFileName(file.name);
      setBannerImage(file);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    setProfilePictureName(file ? file.name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (bannerImage) {
      if (cropperRef.current) {
        cropperRef.current.getCroppedCanvas({
          width: 1920,
          height: 500,
          imageSmoothingQuality: 'high',
        }).toBlob((blob) => {
          const croppedFile = new File([blob], 'banner.jpeg', { type: 'image/jpeg' });
          data.append('bannerImage', croppedFile);
          onSubmit(data);
        }, 'image/jpeg');
      } else {
        data.append('bannerImage', bannerImage);
        onSubmit(data);
      }
    } else {
      onSubmit(data);
    }

    if (profilePicture) data.append('profilePicture', profilePicture);

    console.log('Data being sent from BusinessProfileForm:', data); // Add this line
    onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="business-modal-header">
        <h2>{user?.businessProfile?.isActive ? 'Editar Perfil Empresa' : 'Actualizar a Perfil Empresa'}</h2>
      </div>
      <div className="business-modal-content">
        <p>
          Al convertirte en empresa, obtendrás beneficios exclusivos:
        </p>
        <ul>
          <li>Publicaciones limitadas por 30 días.</li>
          <li>50% de descuento en banners (duración de 1 semana en la sección que elijas).</li>
          <li>Las publicaciones redirigirán a tu página de empresa.</li>
          <li>Tu perfil aparecerá en una rotativa en la página principal durante el día.</li>
        </ul>
        <p>Completa el formulario con la siguiente información:</p>
        <form onSubmit={handleSubmit} className="business-modal-form">
          <div className="business-modal-group">
            <label>Nombre de la empresa</label>
            <input 
              type="text" 
              name="businessName" 
              placeholder="Nombre de la empresa"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            />
          </div>
          <div className="business-modal-group">
            <label>Ubicación</label>
            <input 
              type="text" 
              name="location" 
              placeholder="Ubicación"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div className="business-modal-group">
            <label>Actualizar banner (opcional)</label>
            <div className="file-input-wrapper">
              Seleccionar archivo
              <input 
                type="file" 
                accept="image/*"
                onChange={handleBannerImageChange}
              />
            </div>
            <span className="business-modal-fileinfo">{bannerFileName || 'Sin archivos seleccionados'}</span>
            {bannerImage && (
              <img
                src={URL.createObjectURL(bannerImage)}
                style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
                ref={bannerImageRef}
                alt="Banner Preview"
              />
            )}
          </div>
          <div className="business-modal-group">
            <label>Actualizar foto de perfil (opcional)</label>
            <div className="file-input-wrapper">
              Seleccionar archivo
              <input 
                type="file" 
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </div>
            <span className="business-modal-fileinfo">{profilePictureName || 'Sin archivos seleccionados'}</span>
          </div>
          <div className="business-modal-group">
            <label>Sección social</label>
            <input 
              type="text" 
              name="facebook" 
              placeholder="Enlace completo de Facebook" 
              value={formData.facebook}
              onChange={(e) => setFormData({...formData, facebook: e.target.value})}
            />
            <input 
              type="text" 
              name="instagram" 
              placeholder="Enlace completo de Instagram" 
              value={formData.instagram}
              onChange={(e) => setFormData({...formData, instagram: e.target.value})}
            />
            <input 
              type="text" 
              name="tiktok" 
              placeholder="Enlace completo de TikTok" 
              value={formData.tiktok}
              onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
            />
            <input 
              type="text" 
              name="website" 
              placeholder="Enlace completo de Website" 
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
            />
          </div>
          <div className="business-modal-group">
            <label>Descripción de la empresa</label>
            <textarea
              name="description"
              placeholder="Describe brevemente tu empresa..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          {error && <p className="business-modal-error">{error}</p>}
          <div className="business-modal-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : updateSuccess ? '¡Perfil actualizado!' : 'Actualizar perfil'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BusinessProfileForm;
