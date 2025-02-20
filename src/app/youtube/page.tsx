'use client';

import AnimatedButton from '@/components/AnimatedButton';
import { FLASK_API_URL } from '@/constants';
import React, { useState } from 'react';

const Youtube = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [text, setText] = useState('');

  const fetchTextFromYoutube = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(`${FLASK_API_URL}/youtube-to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();
      setText(data?.text);
    } catch (error) {
      setIsError(true);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-center gap-2 p-2">
        <input
          placeholder="https://www.youtube.com/watch?v=example"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <AnimatedButton size="small" onClick={fetchTextFromYoutube}>
          Transcribe
        </AnimatedButton>
      </div>
      {isLoading ? <p>Loading...</p> : null}
      {isError ? <p>Error occurred.</p> : null}
      <p className="p-2">{text}</p>
    </div>
  );
};

export default Youtube;
