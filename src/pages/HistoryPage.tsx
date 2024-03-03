import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    full: string
  };
  downloads: number;
  views: number;
  likes: number;
}

const HistoryPage: React.FC = () => {
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  useEffect(() => {
    const keys = Object.keys(localStorage);
    setLocalStorageKeys(keys);
  }, []);

  const handleKeyClick = (key: string) => {
    try {
      const imageArray = JSON.parse(localStorage.getItem(key) || '[]');
      setSelectedImages(imageArray);
    } catch (error) {
      console.error(`Error parsing data for key ${key} from localStorage:`, error);
      setSelectedImages([]);
    }
  };

  const openModal = async (image: UnsplashImage) => {
    try {
      const statisticsResponse = await axios.get(`https://api.unsplash.com/photos/${image.id}/statistics`, {
        params: {
          client_id: 'n71dhtMcxDBdn1cM-WqdaR089I-15fbnwORlrtry22s',
        },
      });

      const updatedImage = {
        ...image,
        downloads: statisticsResponse.data.downloads.total,
        views: statisticsResponse.data.views.total,
      };

      setSelectedImage(updatedImage);
    } catch (error) {
      console.error('Error fetching image statistics:', "error");
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const filteredKeys = localStorageKeys.filter(key => {
    const imageArray = JSON.parse(localStorage.getItem(key) || '[]');
    return imageArray.length > 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
      <h1 style={{ margin: '10px' }}>Search History</h1>
      <NavLink style={{ margin: '10px' }} to="/">
        Main
      </NavLink>
      <ul>
        {filteredKeys.map((key, index) => (
          <li className="search-key" key={index} onClick={() => handleKeyClick(key)}>
            {key.split('_').slice(1).join('_')}
          </li>
        ))}
      </ul>
      {selectedImages.length > 0 && (
        <div>
          {selectedImages.map((image, index) => (
            <img
              key={index}
              className="photo"
              style={{ width: '350px', margin: '10px', height: '350px', objectFit: 'cover' }}
              src={image?.urls?.regular}
              alt={`Image ${index + 1}`}
              onClick={() => openModal(image)}
            />
          ))}
        </div>
      )}
      {selectedImage && (
        <div className='modal'>
          <img src={selectedImage.urls.full} alt={`Image`} />
          <div className='modal-info'>
            <p>Downloads: {selectedImage.downloads.toLocaleString()}</p>
            <p>Views: {selectedImage.views.toLocaleString()}</p>
            <p>Likes: {selectedImage.likes.toLocaleString()}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;





