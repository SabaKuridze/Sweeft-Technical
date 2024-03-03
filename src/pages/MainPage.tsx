import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PopularPhotos from '../components/PopularPhotos';
import { NavLink } from 'react-router-dom';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    full: string;
  };
  links: {
    download: string;
  };
  downloads: number;
  views: number;
  likes: number;
}

const MainPage: React.FC = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [delayedSearchTerm, setDelayedSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);

        const cachedData = localStorage.getItem(`cachedImages_${delayedSearchTerm}`);
        if (cachedData) {
          setImages(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const response = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            client_id: 'n71dhtMcxDBdn1cM-WqdaR089I-15fbnwORlrtry22s',
            order_by: 'popular',
            per_page: 20,
            query: delayedSearchTerm,
          },
        });

        const filteredImages = response.data.results.map((image: any) => ({
          id: image.id,
          urls: {
            regular: image.urls.regular,
            full: image.urls.full,
          },
          links: {
            download: image.links.download,
          },
          downloads: image.downloads,
          views: image.views,
          likes: image.likes,
        }));

        localStorage.setItem(`cachedImages_${delayedSearchTerm}`, JSON.stringify(filteredImages));

        setImages(filteredImages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', "error");
        setLoading(false);
      }
    };

    if (delayedSearchTerm) {
      fetchImages();
    }
  }, [delayedSearchTerm]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setDelayedSearchTerm(searchTerm);
    }, 1000); 

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 className='text' style={{ margin: '10px' }}>
        Search Photos
      </h1>
      <div>
        <label className='text' style={{ margin: '10px' }} htmlFor='search'>
          Search:
        </label>
        <input
          type='text'
          id='search'
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ margin: '10px' }}
        />
        <NavLink style={{ margin: '10px' }} to="/history">History</NavLink>
      </div>

      {!loading && searchTerm !== '' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {images.map((image) => (
            <img
              key={image.id}
              src={image.urls.regular}
              alt={`Unsplash Image - ${image.id}`}
              className='photo'
              style={{ width: '350px', margin: '10px', height: '350px', objectFit: "cover" }}
              onClick={() => openModal(image)}
            />
          ))} 
        </div>
      )}

      {selectedImage && (
        <div className='modal' style={{ textAlign: 'center' }}>
          <img src={selectedImage.urls.full} alt={`Unsplash Image - ${selectedImage.id}`} />
          <div className='modal-info'>
            <p>Downloads: {selectedImage.downloads.toLocaleString()}</p>
            <p>Views: {selectedImage.views.toLocaleString()}</p>
            <p>Likes: {selectedImage.likes.toLocaleString()}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      {searchTerm === '' && <PopularPhotos />}
    </div>
  );
};

export default MainPage;