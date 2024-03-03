import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    full: string;
    small: string;
  };
  links: {
    download: string;
  };
  downloads: number;
  views: number;
  likes: number;
}

const PopularPhotos: React.FC = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);

        const response = await axios.get('https://api.unsplash.com/photos', {
          params: {
            client_id: 'n71dhtMcxDBdn1cM-WqdaR089I-15fbnwORlrtry22s',
            order_by: 'popular',
            per_page: 20,
            page,
          },
        });

        setImages((prevImages) => [...prevImages, ...response.data]);
        setPage((prevPage) => prevPage + 1);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (containerRef.current) {
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchImages();
        }
      });

      observer.current.observe(containerRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [page]);

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
      console.error('Error fetching image statistics:', error);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div>
      <h1  style={{ margin: '10px' }}>Popular photos:</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {images.map((image) => (
          <img
            key={image.id}
            src={image.urls.regular}
            alt={`Unsplash Image - ${image.id}`}
            className="photo"
            style={{ width: '350px', margin: '10px', height: '350px', objectFit: "cover", }}
            onClick={() => openModal(image)}
          />
        ))}
      </div>

      <div ref={containerRef} style={{ height: '10px', background: 'transparent' }}>
        {loading && <p>Loading...</p>}
      </div>

      {selectedImage && (
        <div className="modal">
          <img src={selectedImage.urls.full} alt={`Unsplash Image - ${selectedImage.id}`} />
          <div className="modal-info">
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

export default PopularPhotos;
